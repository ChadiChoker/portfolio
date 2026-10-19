import { experience, education } from "@/content/experience";
import { Reveal } from "@/components/Reveal";
import { Icons, SectionHeading } from "@/components/icons";

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <SectionHeading label="/experience" title="Where I've shipped" icon={Icons.briefcase} />
      <ol className="mt-10 ml-4 max-w-3xl space-y-10 border-l border-border pl-8">
        {experience.map((r) => (
          <li key={r.company} className="relative">
            <span className="timeline-node absolute -left-[48px] -top-0.5">{Icons.briefcase}</span>
            <Reveal>
              <p className="font-mono text-xs text-muted">{r.start} — {r.end} · {r.location}</p>
              <h3 className="mt-1 text-lg font-semibold">{r.title} <span className="text-accent">@ {r.company}</span></h3>
              <ul className="mt-2 space-y-1 text-sm text-fg/75">{r.bullets.map((b) => <li key={b}>▸ {b}</li>)}</ul>
            </Reveal>
          </li>
        ))}
        {education.map((e) => (
          <li key={e.school} className="relative">
            <span className="timeline-node absolute -left-[48px] -top-0.5">{Icons.cap}</span>
            <p className="font-mono text-xs text-muted">{e.start} — {e.end}</p>
            <h3 className="mt-1 font-semibold">{e.degree} <span className="text-muted">· {e.school}</span></h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
