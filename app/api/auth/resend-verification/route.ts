import { NextResponse } from "next/server";

import { requestResendVerification } from "@/lib/auth/laravel-auth";
import { authErrorResponse } from "@/lib/auth/route-error";
import { readVerificationChallenge } from "@/lib/auth/verification-cookie";

export async function POST() {
  try {
    const challengeToken = await readVerificationChallenge();
    if (!challengeToken) {
      return NextResponse.json(
        { message: "Your sign-in attempt expired. Sign in again." },
        { status: 401 },
      );
    }

    const result = await requestResendVerification({ challenge_token: challengeToken });
    return NextResponse.json(result);
  } catch (error) {
    return authErrorResponse(error, "Unable to send a new code");
  }
}
