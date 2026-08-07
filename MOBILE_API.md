# APTICON Mobile API — Reference for the React Native (Expo) App

This document is the complete contract for the APTICON **Event Staff mobile app**
(Expo + TypeScript, React Native). It is written to be handed directly to a
developer or AI coding agent building the mobile client — every endpoint,
request/response shape, validation rule, error code, and business rule the
backend enforces is listed here. **No backend code changes are needed to
build the app from this document.**

> The backend is a Next.js (App Router) + MongoDB/Mongoose project. All mobile
> endpoints live under `/app/api/mobile/**` and are already implemented.
> The web app (attendee registration, abstracts, payments) is a completely
> separate set of APIs and is **not** used by this mobile app.

---

## 1. Who uses this app

This app is for **event staff only** — registration desk staff, volunteers,
and coordinators working the conference. It is **not** for attendees/delegates.
Staff log in with an email/password account that has the role `checkin_staff`
(or `super_admin`, who can also use the app for oversight/testing).

---

## 2. Base URL

```
https://apticon-2026.vercel.app/api/mobile
```

All paths below are relative to this base. Locally this is
`http://localhost:3000/api/mobile` (or your LAN IP when testing on a physical
device with Expo — `localhost` will not resolve from the phone).

---

## 3. Authentication

- **Scheme**: JWT (HS256), signed server-side, valid for **7 days**.
- **Transport**: `Authorization: Bearer <token>` header on every request except
  `POST /auth/login`. This app does **not** use cookies (the web app does —
  irrelevant here).
- **Obtaining a token**: `POST /auth/login` returns the token in the JSON body.
  Store it in `expo-secure-store` (not `AsyncStorage` — it's not encrypted).
- **Expiry**: tokens are not refreshable. When a request returns `401`, send
  the user back to the login screen and discard the stored token.
- **Roles allowed to use this app**: `checkin_staff`, `super_admin`. Any other
  role (or no token) gets rejected.

### Suggested client pattern

```ts
const TOKEN_KEY = "apticon_staff_token";

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new ApiError(json.message, json.errors, res.status);
  return json.data;
}
```

---

## 4. Standard response envelope

**Every** mobile endpoint returns this shape — there is no exception.

Success:
```json
{
  "success": true,
  "message": "Success",
  "data": { }
}
```

Error:
```json
{
  "success": false,
  "message": "Human-readable reason",
  "errors": []
}
```

`errors` is a string array — populated with field-level validation messages
where relevant (e.g. failed input validation), otherwise empty.

### HTTP status codes used

| Status | Meaning in this API |
|---|---|
| 200 | Success |
| 400 | Bad request — invalid input, invalid id, invalid enum value, missing required field |
| 401 | Missing/invalid/expired token, or (login only) wrong email/password |
| 403 | Valid token, but role is not `checkin_staff`/`super_admin` |
| 404 | Attendee or user not found |
| 409 | **Duplicate action** — the attendee already received this exact action (see §7.4) |
| 429 | Login rate-limited (see §5) |
| 500 | Unexpected server error |

---

## 5. Endpoint reference — Module 1: Auth

### `POST /auth/login`

Rate-limited to 8 attempts / 15 minutes per IP.

**Body**
```json
{ "email": "staff@apticon.org", "password": "••••••••" }
```
- `email`: valid email, case-insensitive
- `password`: 6–200 characters

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "665f1c2e...",
      "email": "staff@apticon.org",
      "name": "Ravi Kumar",
      "role": "checkin_staff",
      "mustChangePassword": false
    }
  }
}
```

**Errors**
- `400` — malformed body
- `401` — wrong credentials, account inactive, or account role isn't staff (message is deliberately generic: `"Invalid credentials"` — does not reveal which)
- `429` — too many attempts, try again later

---

### `GET /auth/me`

Auth required. Returns the current staff member's fresh profile.

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": "665f1c2e...",
      "email": "staff@apticon.org",
      "name": "Ravi Kumar",
      "role": "checkin_staff",
      "isActive": true,
      "mustChangePassword": false
    }
  }
}
```

Use this on app launch to validate a stored token and to drive the
"Staff Profile" screen.

---

### `POST /auth/change-password`

Auth required.

**Body**
```json
{ "currentPassword": "old-pass", "newPassword": "new-pass-1234" }
```
- `currentPassword`: min 6 chars
- `newPassword`: 8–200 chars

**Success (200)**: `data: null`, `message: "Password updated"`

**Errors**
- `400` — validation failure (`errors` array has details)
- `401` — current password incorrect

---

### `POST /auth/logout`

Auth required, no body. The JWT is stateless (nothing to revoke server-side) —
this call only records the logout in the audit trail. **The client must
discard the stored token itself** on calling this (or on any `401`).

**Success (200)**: `data: null`, `message: "Logged out"`

---

## 6. Endpoint reference — Module 3: Attendee Search & Profile

### `GET /attendees/search`

Auth required. Query params (all optional except when noted):

| Param | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | search text |
| `field` | `all` \| `registrationCode` \| `email` \| `phone` \| `fullName` | `all` | which field(s) `q` searches |
| `status` | `submitted` \| `payment_review` \| `approved` \| `rejected` \| `resubmitted` | — | exact-match filter |
| `sort` | mongoose sort string, e.g. `-createdAt`, `fullName` | `-createdAt` | |
| `page` | number | `1` | |
| `limit` | number | `25` | capped at `100` |

When `field=all`, `q` is matched case-insensitively (regex) against
`registrationCode`, `fullName`, `email`, and `phone` simultaneously — this is
what powers "search by registration number / mobile / email / name" from one
box. Use `field=registrationCode` for an exact-ish registration-number lookup
if you want a narrower search.

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "total": 214,
    "page": 1,
    "limit": 25,
    "items": [
      {
        "_id": "665f1c2e...",
        "registrationCode": "APT2026-0142",
        "fullName": "Dr. Asha Verma",
        "email": "asha@example.com",
        "phone": "9876543210",
        "institution": "XYZ College of Pharmacy",
        "designation": "Professor",
        "category": "faculty",
        "feeTier": "early_bird",
        "status": "approved",
        "paymentStatus": "captured",
        "photoUrl": "https://<r2-domain>/photos/....jpg",
        "createdAt": "2026-06-01T10:00:00.000Z",
        "checkedInAt": "2026-10-24T09:12:00.000Z",
        "kitIssuedAt": null
      }
    ]
  }
}
```

This is a **list** view — use it for the search-results screen.
`checkedInAt`/`kitIssuedAt` are `null` until that action has been recorded,
so the results screen can show an "Already checked in" / "Kit issued" badge
without opening the full profile. Tap a row to open the full profile via
`GET /attendees/{id}`.

---

### `GET /attendees/{id}`

Auth required. `{id}` is the Mongo ObjectId (`_id`) of the registration —
i.e. what you get from a search result's `_id`.

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "registration": {
      "_id": "665f1c2e...",
      "registrationCode": "APT2026-0142",
      "fullName": "Dr. Asha Verma",
      "designation": "Professor",
      "institution": "XYZ College of Pharmacy",
      "city": "Raipur",
      "state": "Chhattisgarh",
      "email": "asha@example.com",
      "phone": "9876543210",
      "photoUrl": "https://<r2-domain>/photos/....jpg",
      "category": "faculty",
      "feeTier": "early_bird",
      "feeAmount": 3500,
      "paymentStatus": "captured",
      "status": "approved",
      "createdAt": "2026-06-01T10:00:00.000Z"
    },
    "status": {
      "checkIn": { "at": "2026-10-24T09:12:00.000Z", "by": "Ravi Kumar" },
      "idCard": null,
      "kit": null,
      "certificate": null,
      "breakfast": [{ "day": 1, "at": "2026-10-24T08:05:00.000Z", "by": "Ravi Kumar" }],
      "lunch": [],
      "dinner": []
    }
  }
}
```

`registration` is the full registration document (a superset of the search
row — this is where you'll find every field for the **Attendee Profile**
screen: photo, name, registration number, registration type/category,
company/institution, mobile, email, payment status, and — see §9 — the
"Badge Number").

`status` is the attendee's **current status**, derived from their full action
history — this is what drives the "Current Status" section of the profile and
determines which action buttons should show as already-done vs. available.
Its shape is identical everywhere it appears in this API (also used by
§7's action response and history endpoint):

```ts
type AttendeeStatus = {
  checkIn: { at: string; by: string } | null;
  idCard: { at: string; by: string } | null;
  kit: { at: string; by: string } | null;
  certificate: { at: string; by: string } | null;
  breakfast: Array<{ day: number; at: string; by: string }>;
  lunch: Array<{ day: number; at: string; by: string }>;
  dinner: Array<{ day: number; at: string; by: string }>;
};
```

**Errors**
- `400` — `{id}` is not a valid Mongo ObjectId
- `404` — no registration with that id

---

### `GET /attendees/by-code/{code}`

Auth required. **This is the endpoint the QR scanner should call.** See §9 —
the QR image printed on each badge encodes the attendee's `registrationCode`
as plain text, nothing more. Decode the QR client-side (any Expo QR/barcode
scanner), then call this with the decoded string as `{code}`.

Response shape is identical to `GET /attendees/{id}` above (same
`{ registration, status }` object).

**Errors**
- `400` — empty/missing code
- `404` — no registration with that exact `registrationCode`

---

## 7. Endpoint reference — Module 4: Actions

### `POST /attendees/{id}/actions`

Auth required. This single endpoint records **every** staff action — check-in,
ID card, breakfast, lunch, dinner, kit, and certificate. `{id}` is the
registration's Mongo ObjectId (same id as §6).

**Body**
```json
{ "actionType": "check_in", "day": 1, "device": "Desk-iPad-3" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `actionType` | `"check_in"` \| `"id_card"` \| `"breakfast"` \| `"lunch"` \| `"dinner"` \| `"kit"` \| `"certificate"` | yes | |
| `day` | integer, 1–30 | **required** for `breakfast`/`lunch`/`dinner`; **must be omitted** for all other action types | conference day number (1, 2, 3, ...) |
| `device` | string, max 200 chars | no | free-text device identifier, e.g. a tablet name/serial — purely for the audit trail |

**Success (200)** — returns the attendee's updated status snapshot (same
shape as §6):
```json
{
  "success": true,
  "message": "Action recorded",
  "data": {
    "status": {
      "checkIn": { "at": "2026-10-24T09:12:00.000Z", "by": "Ravi Kumar" },
      "idCard": null,
      "kit": null,
      "certificate": null,
      "breakfast": [],
      "lunch": [],
      "dinner": []
    }
  }
}
```

### 7.4 Conflict responses (409)

This endpoint returns `409` for **two distinct reasons** — always check `message`, not just the
status code:

**1. Duplicate action.** Every action type can be recorded **at most once per attendee** — for
`breakfast`/`lunch`/`dinner` that's once **per day** (a different `day` value is a separate,
allowed action); for everything else it's once ever. This is enforced by the database itself, not
just app logic, so it cannot be raced.

```json
{
  "success": false,
  "message": "Check-in already recorded for this attendee (10/24/2026, 9:12:00 AM, by Ravi Kumar).",
  "errors": []
}
```

**2. Registration not approved.** The attendee's registration `status` (see §6) is not `"approved"`
yet — e.g. payment is still processing or was rejected. No action can be recorded until it is. This
is expected to be transient: registrations are usually approved automatically within moments of a
successful payment capture.

```json
{
  "success": false,
  "message": "This attendee's registration is not approved yet (status: payment_review). Actions cannot be recorded until payment is confirmed.",
  "errors": []
}
```

The mobile UI should treat **both** `409` cases as an expected, user-facing outcome (show it as a
toast/banner, e.g. "Already checked in" / "Not approved yet"), not as a crash/retry case.

**Other errors**
- `400` — invalid `{id}`, invalid/missing `actionType`, missing `day` for a meal type, or a `day` provided for a non-meal type
- `404` — attendee not found

---

### `GET /attendees/{id}/history`

Auth required. Full, timestamped action log for one attendee, newest first —
use this for an expandable "activity log" on the profile screen if you want
more detail than the summarized `status` object.

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "history": [
      { "actionType": "breakfast", "day": 1, "device": "Desk-iPad-3", "at": "2026-10-24T08:05:00.000Z", "by": "Ravi Kumar" },
      { "actionType": "check_in", "day": 0, "device": "Desk-iPad-3", "at": "2026-10-24T08:00:00.000Z", "by": "Ravi Kumar" }
    ]
  }
}
```
`day` is `0` for non-day-scoped actions (check_in/id_card/kit/certificate).

---

## 8. Endpoint reference — Module 2: Dashboard

### `GET /dashboard/stats`

Auth required. Live counts for the dashboard screen.

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalRegistered": 480,
    "checkedIn": 312,
    "idCardIssued": 298,
    "kitDistributed": 300,
    "certificatesDistributed": 0,
    "breakfast": { "1": 120, "2": 118 },
    "lunch": { "1": 305, "2": 300 },
    "dinner": { "1": 110 }
  }
}
```
- `totalRegistered` counts **all** registrations regardless of status —
  filter client-side if you only want `approved` ones reflected elsewhere.
- `breakfast`/`lunch`/`dinner` are objects keyed by conference day number
  (as strings, since it's a JSON object) — a day with zero distributed meals
  is simply absent from the object (treat missing as `0`).

---

## 9. Endpoint reference — Module 5: Reports

### `GET /reports/{type}`

Auth required. One endpoint for all six report types.

| `{type}` value | Reports on |
|---|---|
| `checked-in` | check-ins |
| `id-card` | ID card issuance |
| `breakfast` | breakfast distribution (day-scoped) |
| `lunch` | lunch distribution (day-scoped) |
| `dinner` | dinner distribution (day-scoped) |
| `kit` | kit distribution |
| `certificate` | certificate issuance |

Query params:

| Param | Required | Notes |
|---|---|---|
| `day` | **required** for `breakfast`/`lunch`/`dinner`, ignored otherwise | integer conference day |
| `page` | no | default `1` |
| `limit` | no | default `25`, capped at `100` |

**Success (200)** — e.g. `GET /reports/lunch?day=1`
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "total": 305,
    "page": 1,
    "limit": 25,
    "items": [
      {
        "registration": {
          "registrationCode": "APT2026-0142",
          "fullName": "Dr. Asha Verma",
          "email": "asha@example.com",
          "phone": "9876543210",
          "institution": "XYZ College of Pharmacy"
        },
        "day": 1,
        "device": "Desk-iPad-3",
        "at": "2026-10-24T12:31:00.000Z",
        "by": "Ravi Kumar"
      }
    ]
  }
}
```

**Errors**
- `400` — unknown `{type}`, or missing `day` for a day-scoped type

---

## 10. QR code & Badge Number convention

There is **no separate QR field or badge-number field** in the database.
By design:

- **QR code** = the attendee's `registrationCode` string, encoded as-is into
  the QR image (wherever it's printed/generated on the web/registration side).
  The scanner just needs to decode the raw text and call
  `GET /attendees/by-code/{decoded-text}`.
- **Badge Number** = also the `registrationCode`. Display it under the
  "Badge Number" label on the profile screen and under "Registration Number"
  — they are the same value shown twice per the original app spec.

This was a deliberate simplification (confirmed with the backend team) to
avoid a forgeable-token scheme for what is an internal desk tool, not a
public-facing security boundary.

---

## 11. Business rules summary (for QA / acceptance testing)

- An attendee can be **checked in** at most once.
- An attendee can receive **ID card**, **kit**, and **certificate** at most
  once each, ever.
- An attendee can receive **breakfast**, **lunch**, **dinner** at most once
  **per conference day** (a `day` value is required on every request for
  these three).
- An attendee's registration must have **`status: "approved"`** (see §6)
  before **any** action can be recorded — `GET` endpoints (search, profile,
  by-code, history) are unaffected and always return full attendee data
  regardless of status, so staff can always see *why* an action is blocked.
- All of the above are enforced server-side (HTTP 409 on duplicate or
  not-approved) — the app should still disable/hide already-completed or
  not-yet-available action buttons using the `status` object for a good UX,
  but must not rely on client-side state alone to prevent either case.
- Every action is attributed to the staff member who performed it (from their
  auth token) and, optionally, a device string — visible via
  `GET /attendees/{id}/history` and the reports endpoints.

---

## 12. Suggested screen → endpoint map

| Screen | Endpoint(s) |
|---|---|
| Login | `POST /auth/login` |
| Dashboard | `GET /dashboard/stats` |
| Attendee Search | `GET /attendees/search` |
| QR Scanner | `GET /attendees/by-code/{code}` |
| Attendee Profile | `GET /attendees/{id}` (and optionally `GET /attendees/{id}/history`) |
| Perform Action (Check-in / ID Card / Meals / Kit / Certificate) | `POST /attendees/{id}/actions` |
| Reports | `GET /reports/{type}` |
| Staff Profile | `GET /auth/me` |
| Change Password | `POST /auth/change-password` |
| Logout | `POST /auth/logout` |

---

## 13. Example end-to-end flow (cURL)

```bash
BASE=https://your-domain.com/api/mobile

# 1. Login
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@apticon.org","password":"secret123"}' | jq -r '.data.token')

# 2. Search
curl -s "$BASE/attendees/search?q=Asha&field=fullName" \
  -H "Authorization: Bearer $TOKEN"

# 3. Scan a QR (decoded text = registrationCode)
curl -s "$BASE/attendees/by-code/APT2026-0142" \
  -H "Authorization: Bearer $TOKEN"

# 4. Check the attendee in
curl -s -X POST "$BASE/attendees/665f1c2e.../actions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"actionType":"check_in","device":"Desk-iPad-3"}'

# 5. Record day-1 lunch
curl -s -X POST "$BASE/attendees/665f1c2e.../actions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"actionType":"lunch","day":1,"device":"Desk-iPad-3"}'

# 6. Dashboard
curl -s "$BASE/dashboard/stats" -H "Authorization: Bearer $TOKEN"
```

---

## 14. Not implemented (explicitly out of scope for now)

- **Offline support** — every request requires live connectivity to the API.
  Design the app assuming always-online for v1.
- **Push notifications** — not implemented.

If either becomes a requirement later, it will change the client
architecture (local queue/sync for offline, a push token registration
endpoint for notifications) — flag to the backend team before building
around either assumption.
