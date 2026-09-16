"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";

const titleSchema = z.string().min(1, "Give it a title.").max(120, "Keep it under 120 characters.");

/**
 * The write half of the core loop. The auth check lives here, inside the
 * action - a hidden button is not a permission system.
 */
export async function createCoreObject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Sign in to add anything." };
  if (!features.db) {
    return { status: "error", message: "Set DATABASE_URL to save records." };
  }

  const parsed = titleSchema.safeParse(String(formData.get("title") ?? "").trim());
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid title." };
  }

  try {
    await db.coreObject.create({ data: { userId: user.id, title: parsed.data } });
  } catch (error) {
    console.error("[dashboard] failed to create record", error);
    return { status: "error", message: "We could not save that. Try again." };
  }

  revalidatePath("/dashboard");
  return { status: "ok", message: "Added." };
}

/** Deletes are scoped by owner in the WHERE clause, never by the UI. */
export async function deleteCoreObject(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !features.db) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.coreObject.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
}
