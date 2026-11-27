import { directoryGet } from "@/lib/clubs/public";

/** How many clubs have activated: the live counter on the public site. */
export async function GET() {
  return directoryGet("stats", {});
}
