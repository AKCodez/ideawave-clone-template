"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  title: z.string().min(1, "Give it a title.").max(120, "Keep the title under 120 characters."),
  source: z.string().min(20, "Paste at least a paragraph.").max(20000, "That is too long to store."),
});

/**
 * The write half of the example loop. The auth check lives here, inside the
 * action - a hidden button is not a permission system.
 */
export async function createSnippet(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Sign in to save anything." };
  if (!features.db) {
    return { status: "error", message: "Set DATABASE_URL to save snippets." };
  }

  const parsed = schema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    source: String(formData.get("source") ?? "").trim(),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    await db.snippet.create({
      data: { userId: user.id, title: parsed.data.title, source: parsed.data.source },
    });
  } catch (error) {
    console.error("[snippets] failed to create", error);
    return { status: "error", message: "We could not save that. Try again." };
  }

  revalidatePath("/dashboard");
  return { status: "ok", message: "Saved." };
}

/** Deletes are scoped by owner in the WHERE clause, never by the UI. */
export async function deleteSnippet(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !features.db) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.snippet.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
}
