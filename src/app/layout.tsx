import type { Metadata } from "next";
import "./globals.css";
import { World } from "@/components/World";
import { Spotlight } from "@/components/Spotlight";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPaletteLoader } from "@/components/CommandPaletteLoader";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${profile.name} · ${profile.title}`, template: `%s · ${profile.name}` },
  description: profile.summary,
  openGraph: { type: "website", siteName: profile.name },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "Person", name: profile.name, jobTitle: profile.title,
  email: `mailto:${profile.email}`, url: SITE_URL, sameAs: [profile.github, profile.linkedin],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Nav />
        <main id="top" className="pt-14">{children}</main>
        <Footer />
        <CommandPaletteLoader />
        <World />
        <Spotlight />
      </body>
    </html>
  );
}
