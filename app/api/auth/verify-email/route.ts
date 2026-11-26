import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/auth/api-error";
import { createSession } from "@/lib/auth/auth-cookies";
import { isTwoFactorChallenge, requestVerifyEmail } from "@/lib/auth/laravel-auth";
import { authErrorResponse } from "@/lib/auth/route-error";
import { storeChallengeToken } from "@/lib/auth/two-factor-cookie";
import {
  clearVerificationChallenge,
  readVerificationChallenge,
} from "@/lib/auth/verification-cookie";

const schema = z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.") });

export async function POST(request: Request) {
  try {
    const challengeToken = await readVerificationChallenge();
    if (!challengeToken) {
      return NextResponse.json(
        { message: "Your sign-in attempt expired. Sign in again." },
        { status: 401 },
      );
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid code", errors: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const result = await requestVerifyEmail({
      challenge_token: challengeToken,
      code: parsed.data.code,
    });
    await clearVerificationChallenge();

    // Verified. If the account also uses two-factor, that step comes next.
    if (isTwoFactorChallenge(result)) {
      await storeChallengeToken(result.challenge_token);
      return NextResponse.json({ two_factor: true });
    }

    await createSession({
      accessToken: result.access_token,
      sessionEndsAt: result.session_ends_at * 1000,
      user: result.user,
    });

    return NextResponse.json({ user: result.user });
  } catch (error) {
    if (error instanceof ApiError && challengeIsDead(error)) {
      await clearVerificationChallenge();
      return NextResponse.json(
        { message: "Your sign-in attempt expired. Sign in again." },
        { status: 401 },
      );
    }

    return authErrorResponse(error, "Verification failed");
  }
}

/** Expired or malformed challenge: retrying the code cannot succeed. */
function challengeIsDead(error: ApiError): boolean {
  if (error.status === 400) return true;
  const body = error.body as { errors?: Record<string, unknown> } | undefined;
  return error.status === 422 && Boolean(body?.errors?.challenge_token);
}
