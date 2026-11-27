"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import type { UserSummary } from "@/lib/nav";

/**
 * Who is signed in, as far as the browser can tell, for the public header.
 *
 * Public pages are static, so the page itself never knows. The header asks
 * `/api/auth/me` and keeps the answer here - one shared copy, so the desktop
 * bar and the mobile menu cannot disagree. The answer is asked again whenever
 * it could have gone stale: a page change, the tab coming back into view, a
 * page restored from the back/forward cache. Asking only once on mount left a
 * header that still showed "Sign in" after logging in, or a profile menu after
 * the session had ended.
 */
export type Viewer =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; user: UserSummary };

const LOADING: Viewer = { status: "loading" };
/** A burst of page changes or focus events asks the server once. */
const MIN_INTERVAL_MS = 5_000;

let state: Viewer = LOADING;
let inflight: AbortController | null = null;
let lastAskedAt = 0;
let listening = false;
const listeners = new Set<() => void>();

function publish(next: Viewer) {
  const same =
    state.status === next.status &&
    (next.status !== "user" || (state.status === "user" && JSON.stringify(state.user) === JSON.stringify(next.user)));

  if (same) return;

  state = next;
  listeners.forEach((listener) => listener());
}

/** Ask the server who is signed in. `force` skips the burst guard (after login, back/forward restore). */
export async function refreshViewer(force = false): Promise<void> {
  if (typeof window === "undefined") return;
  if (!force && Date.now() - lastAskedAt < MIN_INTERVAL_MS) return;

  lastAskedAt = Date.now();
  inflight?.abort();
  const controller = new AbortController();
  inflight = controller;

  try {
    const response = await fetch("/api/auth/me", { cache: "no-store", signal: controller.signal });

    if (response.ok) {
      const body = (await response.json()) as { user?: UserSummary };
      publish(body.user ? { status: "user", user: body.user } : { status: "guest" });
    } else if (response.status === 401) {
      publish({ status: "guest" });
    } else if (state.status === "loading") {
      // The API could not answer (5xx). Never claim a person is signed in on a guess;
      // keep what is shown, and fall back to the guest bar if nothing is shown yet.
      publish({ status: "guest" });
    }
  } catch {
    if (!controller.signal.aborted && state.status === "loading") publish({ status: "guest" });
  } finally {
    if (inflight === controller) inflight = null;
  }
}

function listenForStaleness() {
  if (listening || typeof window === "undefined") return;
  listening = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refreshViewer();
  });
  window.addEventListener("focus", () => void refreshViewer());
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) void refreshViewer(true);
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  listenForStaleness();
  return () => {
    listeners.delete(listener);
  };
}

export function useViewer(): Viewer {
  const pathname = usePathname();

  // Every page change asks again (throttled): the session may have ended or begun since.
  useEffect(() => {
    void refreshViewer();
  }, [pathname]);

  return useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
}
