/**
 * The visitor's address as the reverse proxy saw it. The last X-Forwarded-For
 * entry is the one our own proxy appended; earlier entries can be forged by
 * the visitor. The address is only used to count a distinct visitor and to
 * verify crawlers; the API never stores it.
 */
export function clientIp(headers: Headers): string | null {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;

  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) return null;

  const last = forwarded.split(",").at(-1)?.trim();
  return last || null;
}
