import type { Metadata, Viewport } from "next";
import "./globals.css";
import brand from "@/brand";
import { fontVariables } from "@/design/fonts.generated";
import { tokens } from "@/design/tokens";
import { DemoBanner } from "@/components/demo-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { appName, appUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: `${appName} - ${brand.tagline}`, template: `%s | ${appName}` },
  description: brand.tagline,
  applicationName: appName,
  openGraph: { type: "website", siteName: appName, title: appName, description: brand.tagline },
  twitter: { card: "summary_large_image", title: appName, description: brand.tagline },
};

export const viewport: Viewport = {
  themeColor: tokens.active.hex.canvas,
  colorScheme: brand.scheme,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scheme={brand.scheme} data-direction={brand.direction} className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
