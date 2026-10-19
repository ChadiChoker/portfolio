import Link from "next/link";
import { projects } from "@/content/projects";
import { Reveal } from "@/components/Reveal";
import { Constellation } from "@/components/Constellation";
import { Icons } from "@/components/icons";

// Accent by what the project is: AI work emerald, real-time cyan, backend/API violet.
const accentFor = (tags: string[]) => (tags.includes("ai") ? "accent-emerald" : tags.includes("realtime") ? "accent-cyan" : "accent-violet");

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/projects</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">Selected work</p>
      <Constellation className="mt-10 grid gap-6 md:grid-cols-6 md:gap-8">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05} className={i < 2 ? "md:col-span-3" : "md:col-span-2"}>
            <Link href={`/projects/${p.slug}`} className={`card ${accentFor(p.tags)} group flex h-full flex-col p-6`}>
              <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
                {p.tags.map((t) => <span key={t} className="card-accent opacity-80">#{t}</span>)}
              </div>
              <h3 className={`mt-4 font-semibold ${i < 2 ? "text-2xl" : "text-lg"}`}>{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg/70">{p.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">{p.stack.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}</div>
              <span className="mt-auto flex items-center gap-2 pt-6 font-mono text-xs text-muted transition-colors group-hover:text-fg">
                read case study
                <span className="card-accent transition-transform duration-300 group-hover:translate-x-1">{Icons.arrow}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </Constellation>
    </section>
  );
}
