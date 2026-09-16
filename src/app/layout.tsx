import type { Metadata, Viewport } from "next";
import "./globals.css";
import brand from "@/brand";
import { fontVariables } from "@/design/fonts.generated";
import { tokens } from "@/design/tokens";
import { DemoBanner } from "@/components/demo-banner";
import { MotionProvider } from "@/components/motion/provider";
import { NoJsScript } from "@/components/motion/no-js";
import { PageTransition } from "@/components/motion";
import { ToastProvider } from "@/components/ui/toast";
import { appName, appUrl, features } from "@/lib/env";

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

/**
 * Root layout: the document, the fonts, the providers. Nothing else.
 *
 * Chrome belongs to the route groups - (marketing) has the site header and
 * footer, (app) has the shell, (auth) has the split - so a page can never
 * inherit navigation it did not ask for.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scheme={brand.scheme}
      data-direction={brand.direction}
      className={`no-js ${fontVariables}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <NoJsScript />
        <DemoBanner enabled={features.demo} />
        <MotionProvider>
          <ToastProvider>
            <PageTransition>{children}</PageTransition>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
