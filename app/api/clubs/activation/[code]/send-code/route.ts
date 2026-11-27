import { NextResponse } from "next/server";

import { laravelHttp, unwrapOrThrow } from "@/lib/auth/http";
import { authErrorResponse } from "@/lib/auth/route-error";
import { normalizeClubCode } from "@/lib/clubs/types";

/** Asks the API to mail a code to the club's official inbox. Answers with a hint of the address only. */
export async function POST(_request: Request, ctx: RouteContext<"/api/clubs/activation/[code]/send-code">) {
  const code = normalizeClubCode((await ctx.params).code);

  if (code === null) {
    return NextResponse.json({ message: "We could not find that club." }, { status: 404 });
  }

  try {
    const response = await laravelHttp.post(`/clubs/activation/${code}/send-code`, {});

    return NextResponse.json(unwrapOrThrow<{ masked_email: string }>(response));
  } catch (error) {
    return authErrorResponse(error, "Unable to send the code.");
  }
}
