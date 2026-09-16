/**
 * NoJsScript: three lines that run before the first paint and swap
 * `html.no-js` for `html.js`.
 *
 * Direction behaviour it carries: none. It is the safety net under all four.
 * The server renders every entrance at its hidden frame, so if JavaScript never
 * arrives the page would stay blank without this flag; `src/app/motion.css`
 * uses `html.no-js` to force every one of those elements to its final frame.
 *
 * Render it as the first child of <body>, before anything animated. The root
 * layout must carry `className="no-js"` on <html> plus `suppressHydrationWarning`,
 * because this script changes an attribute React rendered on the server.
 */

import type { ReactElement } from "react";

const FLIP = `var e=document.documentElement;e.classList.remove("no-js");e.classList.add("js")`;

export function NoJsScript(): ReactElement {
  return <script dangerouslySetInnerHTML={{ __html: FLIP }} />;
}
