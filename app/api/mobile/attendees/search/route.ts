import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { searchAttendees, type SearchField } from "@/lib/mobile/search";
import { ok, failFromError } from "@/lib/mobile/response";

const VALID_FIELDS: SearchField[] = [
  "all",
  "registrationCode",
  "email",
  "phone",
  "fullName",
];

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);

    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? undefined;
    const fieldParam = url.searchParams.get("field");
    const field = VALID_FIELDS.includes(fieldParam as SearchField)
      ? (fieldParam as SearchField)
      : "all";
    const status = url.searchParams.get("status") ?? undefined;
    const sort = url.searchParams.get("sort") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "25");

    const result = await searchAttendees({
      q,
      field,
      status,
      sort,
      page,
      limit,
    });
    return ok(result);
  } catch (err) {
    return failFromError(err, "/attendees/search");
  }
}
