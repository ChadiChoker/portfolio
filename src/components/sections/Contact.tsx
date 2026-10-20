import { profile } from "@/content/profile";
import { Icons, SectionHeading } from "@/components/icons";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, accent: "accent-emerald", icon: Icons.mail },
  { label: "WhatsApp", value: profile.phone, href: profile.whatsapp, accent: "accent-cyan", icon: Icons.whatsapp },
  { label: "LinkedIn", value: "chadi-choker", href: profile.linkedin, accent: "accent-violet", icon: Icons.linkedin },
  { label: "GitHub", value: "ChadiChoker", href: profile.github, accent: "accent-fuchsia", icon: Icons.github },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 text-center md:py-24">
      <SectionHeading label="/contact" title="Have a project in mind?" icon={Icons.send} center />
      <p className="mx-auto mt-4 max-w-lg text-fg/75">Tell me what you&apos;re building. I usually reply within 24 hours.</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className={`card ${l.accent} group flex items-center gap-4 p-5 text-left`}>
            <span className="card-icon shrink-0 transition-transform duration-300 group-hover:scale-110">{l.icon}</span>
            <span className="min-w-0">
              <span className="card-accent block font-mono text-xs">{l.label}</span>
              <span className="mt-0.5 block break-all font-semibold">{l.value}</span>
            </span>
          </a>
        ))}
      </div>
      <a href={profile.cv} download className="cv-link mt-8 inline-flex items-center gap-2 pb-1 font-mono text-[15px] text-accent">
        <span className="cv-link-arrow">{Icons.download}</span>Download CV
      </a>
    </section>
  );
}
