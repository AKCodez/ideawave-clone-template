"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { appUrl, features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";

const emailSchema = z.email();

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!features.db || !features.resend) {
    return {
      status: "error",
      message:
        "Password reset needs DATABASE_URL and RESEND_API_KEY. The form works the moment both are set.",
    };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data, redirectTo: `${appUrl}/sign-in` },
    });
  } catch (error) {
    // Never leak whether an address has an account.
    console.error("[auth] password reset request failed", error);
  }

  return {
    status: "ok",
    message: "If that address has an account, a reset link is on its way.",
  };
}
