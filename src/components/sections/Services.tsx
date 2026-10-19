import { services } from "@/content/services";
import { Reveal } from "@/components/Reveal";

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/services</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">What I can build for you</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05}>
            <article className="group h-full rounded-xl border border-border bg-panel/80 p-6 transition hover:-translate-y-0.5 hover:border-accent/50">
              <p className="font-mono text-xs text-muted">0{i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold group-hover:text-accent">{s.title}</h3>
              <p className="mt-2 text-fg/75">{s.pitch}</p>
              <ul className="mt-4 space-y-1 font-mono text-xs text-muted">{s.deliverables.map((d) => <li key={d}>▸ {d}</li>)}</ul>
              <p className="mt-4 font-mono text-[11px] text-accent/80">{s.stack.join(" · ")}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
