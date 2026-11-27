import { NextResponse } from "next/server";
import { z } from "zod";

import { directoryGet } from "@/lib/clubs/public";

const slug = z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/);

/** What each level of the directory asks for, and where it goes in the API. */
const LEVELS = {
  continents: { path: "directory/continents", params: z.object({}) },
  countries: { path: "directory/countries", params: z.object({ continent: slug }) },
  leagues: { path: "directory/leagues", params: z.object({ country: slug }) },
  clubs: { path: "directory/clubs", params: z.object({ country: slug, league: slug }) },
} as const;

export async function GET(request: Request, ctx: RouteContext<"/api/clubs/directory/[level]">) {
  const { level } = await ctx.params;

  if (!(level in LEVELS)) {
    return NextResponse.json({ message: "Unknown directory level." }, { status: 404 });
  }

  const definition = LEVELS[level as keyof typeof LEVELS];
  const parsed = definition.params.safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid directory request." }, { status: 422 });
  }

  return directoryGet(definition.path, parsed.data as Record<string, string>);
}
