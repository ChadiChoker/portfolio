import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GridBackground } from "@/components/GridBackground";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <GridBackground />
        <Nav />
        <main id="top">{children}</main>
        <Footer />
        <CommandPalette />
      </body>
    </html>
  );
}
