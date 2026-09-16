"use client";

import type { CSSProperties, ReactElement } from "react";

/**
 * The root layout itself failed, so there is no <html>, no stylesheet and no
 * token to rely on. Everything here is inline and self-contained.
 *
 * The colours are the CSS system keywords (Canvas, CanvasText, GrayText), not
 * values from the brand: they follow the reader's own light or dark setting and
 * cannot go missing with the stylesheet.
 */
const page: CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem 1rem",
  backgroundColor: "Canvas",
  color: "CanvasText",
  colorScheme: "light dark",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  lineHeight: 1.6,
};

const panel: CSSProperties = {
  width: "100%",
  maxWidth: "34rem",
};

const heading: CSSProperties = {
  margin: "0 0 0.75rem",
  fontSize: "1.75rem",
  lineHeight: 1.2,
  fontWeight: 600,
};

const body: CSSProperties = { margin: "0 0 1.5rem", fontSize: "1rem" };

const note: CSSProperties = {
  margin: "1.5rem 0 0",
  fontSize: "0.8125rem",
  color: "GrayText",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

const button: CSSProperties = {
  appearance: "none",
  cursor: "pointer",
  border: "1px solid GrayText",
  borderRadius: "0.25rem",
  background: "transparent",
  color: "CanvasText",
  font: "inherit",
  fontWeight: 600,
  padding: "0.625rem 1.25rem",
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactElement {
  return (
    <html lang="en">
      <body style={page}>
        <main style={panel}>
          <h1 style={heading}>The app failed to start</h1>
          <p style={body}>
            This one is on us. Reloading usually fixes it. If it does not, come back in a
            few minutes.
          </p>
          <button type="button" style={button} onClick={reset}>
            Reload
          </button>
          {error.digest ? <p style={note}>Reference: {error.digest}</p> : null}
        </main>
      </body>
    </html>
  );
}
