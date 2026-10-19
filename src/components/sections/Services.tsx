import { services } from "@/content/services";
import { Reveal } from "@/components/Reveal";
import { Constellation } from "@/components/Constellation";
import { Icons } from "@/components/icons";

const look = {
  "ai-integration": { accent: "accent-emerald", icon: Icons.sparkles },
  "mcp-automation": { accent: "accent-cyan", icon: Icons.plug },
  "fullstack-mvp": { accent: "accent-violet", icon: Icons.rocket },
  "apis-backend": { accent: "accent-fuchsia", icon: Icons.server },
} as const;

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/services</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">What I can build for you</p>
      <Constellation className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
        {services.map((s, i) => {
          const l = look[s.id as keyof typeof look];
          return (
            <Reveal key={s.id} delay={i * 0.05}>
              <article className={`card ${l.accent} h-full p-6 sm:p-7`}>
                <div className="flex items-start justify-between">
                  <span className="card-icon">{l.icon}</span>
                  <span className="card-accent font-mono text-xs opacity-80">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-fg/70">{s.pitch}</p>
                <ul className="mt-5 grid gap-2 text-sm text-fg/80 sm:grid-cols-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2"><span className="card-accent mt-0.5">{Icons.check}</span>{d}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-1.5">{s.stack.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </article>
            </Reveal>
          );
        })}
      </Constellation>
    </section>
  );
}
