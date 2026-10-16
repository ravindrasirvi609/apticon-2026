import { SignJWT, jwtVerify } from "jose";
import { AuthError } from "@/lib/auth";

// Delegate (attendee) tokens are deliberately separate from staff/web sessions: a different
// secret and an `aud` claim, so a delegate token can never satisfy requireStaff/verifySession
// (different key => signature check fails) and a staff token can never satisfy requireDelegate.

const AUDIENCE = "delegate";
const TOKEN_TTL = "7d";

export interface DelegateSession {
  /** Registration _id */
  rid: string;
  registrationCode: string;
  name: string;
}

// Fails closed: a missing/short secret is a server misconfiguration (500), never a weak token.
function getKey(): Uint8Array {
  const secret = process.env.DELEGATE_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DELEGATE_TOKEN_SECRET must be set (min 32 characters)");
  }
  return new TextEncoder().encode(secret);
}

export async function signDelegateSession(
  session: DelegateSession,
): Promise<string> {
  return new SignJWT({
    registrationCode: session.registrationCode,
    name: session.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.rid)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getKey());
}

export async function verifyDelegateSession(
  token: string,
): Promise<DelegateSession | null> {
  const key = getKey();
  try {
    const { payload } = await jwtVerify(token, key, {
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub === "string" &&
      typeof payload.registrationCode === "string" &&
      typeof payload.name === "string"
    ) {
      return {
        rid: payload.sub,
        registrationCode: payload.registrationCode,
        name: payload.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireDelegate(req: Request): Promise<DelegateSession> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new AuthError("Unauthorized", 401);
  const token = header.slice("Bearer ".length).trim();
  const session = token ? await verifyDelegateSession(token) : null;
  if (!session) throw new AuthError("Unauthorized", 401);
  return session;
}
