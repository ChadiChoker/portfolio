import { skills } from "@/content/skills";
import { Constellation } from "@/components/Constellation";
import { Icons, SectionHeading } from "@/components/icons";

const accents = ["accent-emerald", "accent-cyan", "accent-violet", "accent-fuchsia", "accent-cyan", "accent-emerald"];
const groupIcons = [Icons.brain, Icons.devices, Icons.server, Icons.database, Icons.cloud, Icons.shield];

export function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
      <SectionHeading label="/stack" title="Tools I ship with" icon={Icons.cpu} />
      <Constellation className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {skills.map((g, i) => (
          <div key={g.group} className={`card ${accents[i % accents.length]} p-5`}>
            <div className="flex items-center gap-3">
              <span className="card-icon !h-9 !w-9 !rounded-lg">{groupIcons[i % groupIcons.length]}</span>
              <h3 className="card-accent font-mono text-xs uppercase tracking-wider">{g.group}</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">{g.items.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </div>
        ))}
      </Constellation>
    </section>
  );
}
