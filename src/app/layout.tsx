import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import { palette } from "@/lib/env";
import { DemoBanner } from "@/components/demo-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* One display serif, one body sans per palette, one shared mono for numbers.
   None are preloaded: only the pair the active palette uses gets fetched. */
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif", display: "swap", preload: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", preload: false });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap", preload: false });

const fontVariables = [
  fraunces.variable,
  inter.variable,
  playfair.variable,
  manrope.variable,
  instrumentSerif.variable,
  jakarta.variable,
  jetbrainsMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: {
    default: "Clone Template",
    template: "%s | Clone Template",
  },
  description:
    "A production-shaped Next.js starter: Prisma on Neon, Better Auth, Stripe Checkout and Resend, with the core loop left for you to build.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-palette={palette} className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
