import { NextResponse } from "next/server";
import { ApiError, fetchLaravelUser } from "@/lib/auth/api";
import {
  deleteSession,
  getSession,
  updateSession,
} from "@/lib/auth/auth-cookies";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const user = await fetchLaravelUser(session.accessToken);
    await updateSession({ ...session, user });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await deleteSession();
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // The API could not answer. Do not vouch for the cookie's old copy of the user:
    // a token the API has already ended would then look signed in. Say "unknown" instead.
    return NextResponse.json({ message: "The session could not be checked." }, { status: 503 });
  }
}
