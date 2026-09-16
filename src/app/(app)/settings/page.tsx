import type { Metadata } from "next";
import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import brand from "@/brand";
import { PageHeader } from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { tokens } from "@/design/tokens";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage(): Promise<ReactElement> {
  // The (app) layout is the gate; this narrows the type.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  /* `tokens.brand` is typed `Brand`; the default import is the literal this
     build happens to use, so comparing it fails tsc for every other brand. */
  const scheme = tokens.brand.scheme === "dark" ? "Dark" : "Light";

  return (
    <div className="flex flex-col gap-stack">
      <PageHeader
        title="Settings"
        description="Your account, and what this product looks like. Both are short on purpose."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            This is what we know about you. Editing is not wired up yet, so both fields are
            read only.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="settings-name" label="Name" hint="From the account you signed up with.">
            <Input defaultValue={user.name ?? ""} readOnly disabled autoComplete="name" />
          </Field>
          <Field id="settings-email" label="Email" hint="Sign-in address and where email goes.">
            <Input defaultValue={user.email} readOnly disabled autoComplete="email" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            {tokens.direction.signature} The brand decides this, so there is nothing to switch.
          </CardDescription>
        </CardHeader>

        <Table>
          <THead>
            <TR>
              <TH>Setting</TH>
              <TH>Value</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TH scope="row">Direction</TH>
              <TD>{tokens.direction.label}</TD>
            </TR>
            <TR>
              <TH scope="row">Scheme</TH>
              <TD>{scheme}</TD>
            </TR>
            <TR>
              <TH scope="row">Accent</TH>
              <TD>
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-block size-4 shrink-0 rounded-sm border-(length:--stroke) border-line bg-accent"
                  />
                  <span className="numeric text-small text-muted">
                    {tokens.active.hex.accent}
                  </span>
                </span>
              </TD>
            </TR>
          </TBody>
        </Table>
      </Card>

      <Card tone="critical">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Signing out ends this session on this device. Deleting an account is not built
            yet: the button is here so nobody has to guess whether it exists.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-wrap items-center gap-3">
          <SignOutButton />
          <Button variant="danger" size="md" disabled>
            Delete account
          </Button>
        </div>
        <p className="mt-3 text-caption text-muted">
          Account deletion is not wired up. To have your data removed, email us and we will
          do it by hand.
        </p>
      </Card>
    </div>
  );
}
