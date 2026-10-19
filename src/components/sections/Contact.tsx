import { profile } from "@/content/profile";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "WhatsApp", value: profile.phone, href: profile.whatsapp },
  { label: "LinkedIn", value: "chadi-choker", href: profile.linkedin },
  { label: "GitHub", value: "ChadiChoker", href: profile.github },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 text-center md:py-24">
      <h2 className="font-mono text-sm text-accent">/hire</h2>
      <p className="mt-2 text-3xl font-bold sm:text-4xl">Have a project in mind?</p>
      <p className="mx-auto mt-4 max-w-lg text-fg/75">Tell me what you&apos;re building. I usually reply within 24 hours.</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className="break-all rounded-xl border border-border bg-panel/80 p-5 text-left transition hover:border-accent">
            <p className="font-mono text-xs text-muted">{l.label}</p>
            <p className="mt-1 font-semibold">{l.value}</p>
          </a>
        ))}
      </div>
      <a href={profile.cv} download className="mt-8 inline-block font-mono text-sm text-accent underline underline-offset-4">Download CV (PDF)</a>
    </section>
  );
}
