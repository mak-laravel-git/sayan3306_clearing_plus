"use server";

import { revalidatePath, updateTag } from "next/cache";

import { toResult } from "@/lib/actions/result";
import { getSeoTraffic, saveSeoTrafficEnabled } from "@/lib/admin/seo-traffic";
import type { SeoTraffic } from "@/lib/admin/seo-traffic-types";

type Failure = { ok: false; message: string };
export type SeoTrafficResult = { ok: true; message: string; traffic: SeoTraffic } | Failure;

export async function loadSeoTrafficAction(days: number): Promise<SeoTrafficResult> {
  try {
    return { ok: true, message: "", traffic: await getSeoTraffic(days) };
  } catch (error) {
    return toResult(error, "Unable to load the traffic report.") as Failure;
  }
}

export async function saveSeoTrafficEnabledAction(enabled: boolean): Promise<SeoTrafficResult> {
  try {
    const traffic = await saveSeoTrafficEnabled(enabled);
    // Public pages read the on/off flag through the `seo` cache tag.
    updateTag("seo");
    revalidatePath("/admin/application/seo-traffic");
    return { ok: true, message: enabled ? "Monitoring is on." : "Monitoring is off.", traffic };
  } catch (error) {
    return toResult(error, "Unable to save.") as Failure;
  }
}
