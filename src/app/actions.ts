"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";

const emailSchema = z.email("Enter a valid email address.");

/**
 * Landing-page waitlist. Writes straight to Postgres; with no DATABASE_URL it
 * says so plainly rather than throwing a 500 at a visitor.
 */
export async function joinWaitlist(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!features.db) {
    return {
      status: "error",
      message: "The waitlist needs a database. Set DATABASE_URL and run db:migrate:deploy.",
    };
  }

  try {
    await db.waitlistEntry.upsert({
      where: { email: parsed.data },
      update: {},
      create: { email: parsed.data },
    });
  } catch (error) {
    console.error("[waitlist] failed to save entry", error);
    return { status: "error", message: "We could not save that. Try again in a moment." };
  }

  return { status: "ok", message: "You are on the list. We will email you when it opens." };
}
