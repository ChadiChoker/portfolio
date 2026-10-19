import { skills } from "@/content/skills";

export function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <h2 className="font-mono text-sm text-accent">/stack</h2>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">Tools I ship with</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g) => (
          <div key={g.group} className="rounded-xl border border-border bg-panel/80 p-5">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{g.group}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.items.map((s) => <span key={s} className="rounded-md border border-border px-2 py-1 text-xs text-fg/85">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
