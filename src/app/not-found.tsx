import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 font-mono">
      <p className="text-muted">$ cd {"<this page>"}</p>
      <h1 className="mt-2 text-amber-400">zsh: command not found (404)</h1>
      <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-4">cd ~ →</Link>
    </div>
  );
}
