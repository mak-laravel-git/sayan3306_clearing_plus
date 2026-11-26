import { NextResponse } from "next/server";
import { z } from "zod";

import { requestActivate } from "@/lib/auth/laravel-auth";
import { authErrorResponse } from "@/lib/auth/route-error";

const schema = z
  .object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid activation payload", errors: parsed.error.flatten() },
        { status: 422 },
      );
    }

    return NextResponse.json(await requestActivate(parsed.data));
  } catch (error) {
    return authErrorResponse(error, "Unable to activate the account");
  }
}
