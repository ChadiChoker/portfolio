import { experience, education } from "@/content/experience";
import { Reveal } from "@/components/Reveal";

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/experience</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">Where I&apos;ve shipped</p>
      <ol className="mt-10 max-w-3xl space-y-8 border-l border-border pl-6">
        {experience.map((r) => (
          <li key={r.company} className="relative">
            <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-accent shadow-[0_0_12px_#10b981]" />
            <Reveal>
              <p className="font-mono text-xs text-muted">{r.start} — {r.end} · {r.location}</p>
              <h3 className="mt-1 text-lg font-semibold">{r.title} <span className="text-accent">@ {r.company}</span></h3>
              <ul className="mt-2 space-y-1 text-sm text-fg/75">{r.bullets.map((b) => <li key={b}>▸ {b}</li>)}</ul>
            </Reveal>
          </li>
        ))}
        {education.map((e) => (
          <li key={e.school} className="relative">
            <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full border border-accent bg-bg" />
            <p className="font-mono text-xs text-muted">{e.start} — {e.end}</p>
            <h3 className="mt-1 font-semibold">{e.degree} <span className="text-muted">· {e.school}</span></h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
