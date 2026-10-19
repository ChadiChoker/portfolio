import { AgentConsole } from "@/components/console/AgentConsole";
import { profile } from "@/content/profile";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-[1fr_1.1fr] md:pb-20 md:pt-24">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-accent">● {profile.availability.toUpperCase()}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{profile.name}</h1>
        <p className="mt-2 text-lg text-muted sm:text-xl">{profile.title}</p>
        <p className="mt-6 max-w-md leading-relaxed text-fg/80">{profile.summary}</p>
        <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
          <a href="#contact" className="rounded-md bg-accent px-4 py-2.5 font-semibold text-black">Start a project →</a>
          <a href="#projects" className="rounded-md border border-border px-4 py-2.5 hover:border-accent hover:text-accent">See work</a>
        </div>
      </div>
      <AgentConsole />
    </section>
  );
}
