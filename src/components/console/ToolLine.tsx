export function ToolLine({ name, args, done }: { name: string; args: unknown; done: boolean }) {
  const a = args && typeof args === "object" && Object.keys(args).length ? JSON.stringify(args) : "";
  return (
    <div className="font-mono text-xs text-accent/90">
      {done ? "✓" : <span className="inline-block animate-spin">⚙</span>} tool: {name}({a})
    </div>
  );
}
