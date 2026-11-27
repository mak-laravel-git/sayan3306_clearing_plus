import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession } from "@/lib/auth/auth-cookies";
import { laravelHttp, unwrapOrThrow } from "@/lib/auth/http";
import { authErrorResponse } from "@/lib/auth/route-error";
import { normalizeClubCode } from "@/lib/clubs/types";
import type { TokenEnvelope } from "@/lib/auth/laravel-auth";

const schema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
    accept_terms: z.literal(true, { error: "Accept the Club Terms to continue." }),
    terms_version: z.string().min(1).max(32),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

type Activated = TokenEnvelope & { activated: true; club: { code: string; name: string } };

/**
 * The code, a password and the Club Terms make the club active. The API
 * answers with the owner's first session, which goes into the encrypted
 * httpOnly cookie like at any sign-in; the browser only learns who signed in.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/clubs/activation/[code]/activate">) {
  const code = normalizeClubCode((await ctx.params).code);

  if (code === null) {
    return NextResponse.json({ message: "We could not find that club." }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid activation payload", errors: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const response = await laravelHttp.post(`/clubs/activation/${code}/activate`, parsed.data);
    const result = unwrapOrThrow<Activated>(response);

    await createSession({
      accessToken: result.access_token,
      sessionEndsAt: result.session_ends_at * 1000,
      user: result.user,
    });

    return NextResponse.json({ activated: true, club: result.club, user: result.user });
  } catch (error) {
    return authErrorResponse(error, "Unable to activate the club.");
  }
}
