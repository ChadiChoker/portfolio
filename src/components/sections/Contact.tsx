import { statSync } from "node:fs";
import path from "node:path";
import { profile } from "@/content/profile";
import { Icons, SectionHeading } from "@/components/icons";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, accent: "accent-emerald", icon: Icons.mail },
  { label: "WhatsApp", value: profile.phone, href: profile.whatsapp, accent: "accent-cyan", icon: Icons.whatsapp },
  { label: "LinkedIn", value: "chadi-choker", href: profile.linkedin, accent: "accent-violet", icon: Icons.linkedin },
  { label: "GitHub", value: "ChadiChoker", href: profile.github, accent: "accent-fuchsia", icon: Icons.github },
];

// Real file size, read at build time, so the label stays true if the CV is replaced.
const cvSize = (() => {
  try { return `${Math.round(statSync(path.join(process.cwd(), "public", profile.cv)).size / 1024)} KB`; } catch { return "PDF"; }
})();

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
      <a href={profile.cv} download className="cv-download group mx-auto mt-8 flex w-fit items-center gap-3 py-2 pl-2 pr-2 text-left">
        <span className="cv-file relative grid size-9 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent ring-1 ring-accent/35">
          {Icons.file}
          <span className="absolute -bottom-1 -right-1.5 rounded bg-accent px-0.5 font-mono text-[7px] font-bold leading-tight text-black">PDF</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-tight">Download CV</span>
          <span className="block font-mono text-[10px] text-muted">PDF · {cvSize}</span>
        </span>
        <span className="cv-arrow ml-3 grid size-8 shrink-0 place-items-center rounded-full text-black">{Icons.download}</span>
      </a>
    </section>
  );
}
