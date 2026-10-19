import { skills } from "@/content/skills";

const accents = ["accent-emerald", "accent-cyan", "accent-violet", "accent-fuchsia", "accent-cyan", "accent-emerald"];

export function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/stack</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">Tools I ship with</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g, i) => (
          <div key={g.group} className={`card ${accents[i % accents.length]} p-5`}>
            <h3 className="card-accent font-mono text-xs uppercase tracking-wider">{g.group}</h3>
            <div className="mt-4 flex flex-wrap gap-1.5">{g.items.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
