import "server-only";

import { NextResponse } from "next/server";

import { laravelHttp, toApiError, unwrapOrThrow } from "@/lib/auth/http";
import { authErrorResponse } from "@/lib/auth/route-error";
import type { ActivationClub, DirectoryContinent } from "@/lib/clubs/types";

/**
 * Calls of the open club pages (finding a club, opening an activation link).
 * They need no sign-in; the API still checks the BFF secret and the site.
 */
export async function fetchActivationClub(code: string): Promise<ActivationClub | null> {
  try {
    const response = await laravelHttp.get(`/clubs/activation/${encodeURIComponent(code)}`);

    if (response.status === 404) return null;

    return unwrapOrThrow<{ club: ActivationClub }>(response).club;
  } catch (error) {
    throw toApiError(error, "Unable to load the club.");
  }
}

/** Passes a GET of the open directory through to the API and answers the browser with its data. */
export async function directoryGet(path: string, params: Record<string, string | undefined>): Promise<NextResponse> {
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }

    const response = await laravelHttp.get(`/clubs/${path}${query.size ? `?${query}` : ""}`);
    const data = unwrapOrThrow<Record<string, unknown>>(response);

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error, "Unable to load clubs.");
  }
}

/** The regions of the directory, for the first dropdown. An empty list when the directory cannot be reached. */
export async function fetchContinents(): Promise<DirectoryContinent[]> {
  try {
    const response = await laravelHttp.get("/clubs/directory/continents");

    return unwrapOrThrow<{ continents: DirectoryContinent[] }>(response).continents;
  } catch {
    return [];
  }
}
