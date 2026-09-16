import type { ReactElement, ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Public pages: the header, the page, the footer. No session is read here. */
export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
