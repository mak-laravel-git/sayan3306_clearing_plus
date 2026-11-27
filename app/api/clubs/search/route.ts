import { NextResponse } from "next/server";
import { z } from "zod";

import { directoryGet } from "@/lib/clubs/public";

const schema = z.object({ q: z.string().trim().min(1).max(80) });

/** The closest clubs for what the person has typed so far. */
export async function GET(request: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!parsed.success) {
    return NextResponse.json({ clubs: [] });
  }

  return directoryGet("search", { q: parsed.data.q });
}
