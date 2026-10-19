import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { getProject } from "@/agent/tools";

export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.tagline } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link href="/#projects" className="font-mono text-xs text-muted hover:text-accent">← cd ../projects</Link>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{p.title}</h1>
      <p className="mt-2 text-lg text-muted">{p.tagline}</p>
      <div className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        <a href={p.repoUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-2 hover:border-accent hover:text-accent">GitHub →</a>
        {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="rounded-md bg-accent px-3 py-2 font-semibold text-black">Live demo →</a>}
      </div>
      {([["Problem", p.problem], ["Solution", p.solution]] as const).map(([h, t]) => (
        <section key={h} className="mt-10"><h2 className="font-mono text-sm text-accent">## {h}</h2><p className="mt-2 leading-relaxed text-fg/80">{t}</p></section>
      ))}
      {([["Architecture", p.architecture], ["Highlights", p.highlights]] as const).map(([h, list]) => (
        <section key={h} className="mt-10"><h2 className="font-mono text-sm text-accent">## {h}</h2>
          <ul className="mt-2 space-y-1 text-fg/80">{list.map((x) => <li key={x}>▸ {x}</li>)}</ul></section>
      ))}
      <section className="mt-10"><h2 className="font-mono text-sm text-accent">## Stack</h2>
        <div className="mt-3 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="rounded-md border border-border px-2 py-1 text-xs">{s}</span>)}</div></section>
      <div className="mt-16 rounded-xl border border-accent/30 bg-panel p-6 text-center">
        <p className="font-semibold">Want something like this built?</p>
        <Link href="/#contact" className="mt-3 inline-block rounded-md bg-accent px-4 py-2 font-mono text-sm font-semibold text-black">Hire me →</Link>
      </div>
    </article>
  );
}
