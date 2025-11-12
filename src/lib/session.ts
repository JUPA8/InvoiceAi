import { cookies } from "next/headers";

export interface SessionPayload {
  userKey: string;
  basicAuth: string;
  clientId: string;
  clientKey: string;
  userName?: string;
  userEmail?: string;
}

export async function setSession(payload: SessionPayload) {
  const cookieStore = await cookies();

  const sessionData = JSON.stringify(payload);

  cookieStore.set("session_data", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("session_data")?.value;

    if (!sessionData) return null;

    const payload = JSON.parse(sessionData) as SessionPayload;
    return payload;
  } catch (error) {
    console.error("Session parsing failed:", error);
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session_data");
}
