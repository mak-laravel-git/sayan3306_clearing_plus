import "server-only";

import { cookies } from "next/headers";

/**
 * The challenge token of the email-code step stays in an httpOnly cookie that
 * only the verify and resend routes receive, so page scripts never hold it.
 * It lives as long as the API honours it (five minutes).
 */
const VERIFICATION_COOKIE = "email_verification_challenge";
const VERIFICATION_COOKIE_PATH = "/api/auth";
const VERIFICATION_COOKIE_MAX_AGE = 5 * 60;

function options(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: VERIFICATION_COOKIE_PATH,
    maxAge,
  };
}

export async function storeVerificationChallenge(token: string): Promise<void> {
  (await cookies()).set(VERIFICATION_COOKIE, token, options(VERIFICATION_COOKIE_MAX_AGE));
}

export async function readVerificationChallenge(): Promise<string | undefined> {
  return (await cookies()).get(VERIFICATION_COOKIE)?.value;
}

export async function clearVerificationChallenge(): Promise<void> {
  (await cookies()).set(VERIFICATION_COOKIE, "", options(0));
}
