import type { Metadata } from "next";

export const metadata: Metadata = { title: "Credits", robots: { index: false } };

// CC BY 4.0 requires attribution for the 3D model; this page is where it lives.
export default function Credits() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-24 font-mono text-sm leading-7 text-fg/80">
      <h1 className="text-accent">## credits</h1>
      <p className="mt-6">
        3D model: &ldquo;MacBook Pro M3 16-inch 2024&rdquo; by{" "}
        <a className="text-accent underline underline-offset-4" href="https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4">jackbaeten</a>, licensed{" "}
        <a className="text-accent underline underline-offset-4" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Rigged and recoloured by{" "}
        <a className="text-accent underline underline-offset-4" href="https://github.com/william-laverty/rigged-macbook-3d">William Laverty</a> (MIT).
      </p>
      <p className="mt-4 text-muted">Not affiliated with Apple Inc. MacBook is a trademark of Apple Inc.</p>
    </article>
  );
}
