import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    return NextResponse.json({
      userKey: session.userKey,
      clientId: session.clientId,
      userName: session.userName || "User",
      userEmail: session.userEmail || "",
      isAuthenticated: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}