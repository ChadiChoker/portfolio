/// <reference lib="webworker" />
import { createWorld, type World } from "./world";

// Runs the whole 3D world off the main thread. The page sends input; we report ready/failed.
type Message =
  | { type: "init"; canvas: OffscreenCanvas; opts: Parameters<typeof createWorld>[1] }
  | { type: "call"; method: Exclude<keyof World, "dispose">; args: unknown[] };

const post = (type: "live" | "ready" | "failed") => self.postMessage({ type });
let world: World | undefined;

self.onmessage = (e: MessageEvent<Message>) => {
  const m = e.data;
  if (m.type === "init") {
    try {
      world = createWorld(m.canvas, m.opts, { ready: () => post("ready"), failed: () => post("failed") });
      post("live");
    } catch {
      post("failed");
    }
    return;
  }
  (world?.[m.method] as ((...a: unknown[]) => void) | undefined)?.(...m.args);
};
