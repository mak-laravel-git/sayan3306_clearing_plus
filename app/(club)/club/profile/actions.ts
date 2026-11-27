"use server";

import { revalidatePath } from "next/cache";

import { toResult, type ActionResult } from "@/lib/actions/result";
import { requirePermission } from "@/lib/auth/dal";
import { acceptClubTerms, updateOwnClub } from "@/lib/clubs/club";

const clean = (value: string): string | null => (value.trim() === "" ? null : value.trim());

export async function saveClubProfileAction(input: {
  contact_name: string;
  key_contact_role: string;
  phone: string;
  website: string;
}): Promise<ActionResult> {
  try {
    await requirePermission("club.profile.update", "club");
    await updateOwnClub({
      contact_name: clean(input.contact_name),
      key_contact_role: clean(input.key_contact_role),
      phone: clean(input.phone),
      website: clean(input.website),
    });
    revalidatePath("/club", "layout");

    return { ok: true, message: "Contact details saved." };
  } catch (error) {
    return toResult(error, "Unable to save the contact details.");
  }
}

export async function acceptTermsAction(version: string): Promise<ActionResult> {
  try {
    await requirePermission("club.terms.accept", "club");
    await acceptClubTerms(version);
    revalidatePath("/club", "layout");

    return { ok: true, message: "Club Terms accepted." };
  } catch (error) {
    return toResult(error, "Unable to accept the Club Terms.");
  }
}
