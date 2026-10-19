import Link from "next/link";
import { projects } from "@/content/projects";
import { Reveal } from "@/components/Reveal";

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/projects</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">Selected work</p>
      <div className="mt-10 grid gap-4 md:grid-cols-6">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05} className={i < 2 ? "md:col-span-3" : "md:col-span-2"}>
            <Link href={`/projects/${p.slug}`} className="group flex h-full flex-col rounded-xl border border-border bg-panel/80 p-6 transition hover:border-accent/50">
              <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase text-muted">{p.tags.map((t) => <span key={t}>#{t}</span>)}</div>
              <h3 className="mt-3 text-lg font-semibold group-hover:text-accent">{p.title}</h3>
              <p className="mt-1 text-sm text-fg/70">{p.tagline}</p>
              <p className="mt-4 font-mono text-[11px] text-accent/80">{p.stack.slice(0, 4).join(" · ")}</p>
              <span className="mt-auto pt-4 font-mono text-xs text-muted group-hover:text-accent">read case study →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
