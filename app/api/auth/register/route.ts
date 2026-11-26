import { NextResponse } from "next/server";
import { z } from "zod";

import { authErrorResponse } from "@/lib/auth/route-error";
import { requestRegister } from "@/lib/auth/laravel-auth";
import { createSession } from "@/lib/auth/auth-cookies";
import { storeVerificationChallenge } from "@/lib/auth/verification-cookie";

const registerSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid registration payload",
          errors: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    const result = await requestRegister(parsed.data);

    if ("verification_required" in result) {
      await storeVerificationChallenge(result.challenge_token);
      return NextResponse.json(
        { verification_required: true, email: result.email },
        { status: 201 },
      );
    }

    await createSession({
      accessToken: result.access_token,
      sessionEndsAt: result.session_ends_at * 1000,
      user: result.user,
    });

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error, "Registration failed");
  }
}
