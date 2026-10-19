// Shared, render-free state between the Intro scroll section and the WebGL world (which runs in
// a worker). Intro writes through updateIntro(); World subscribes and forwards changes.
export type IntroState = {
  mode: "none" | "play";
  progress: number;
  end: number; // scrollY at which the intro has fully handed off to the page
  ready: boolean;
  failed: boolean;
};

export const introStore: IntroState = { mode: "none", progress: 1, end: 0, ready: false, failed: false };

const listeners = new Set<() => void>();

export function updateIntro(patch: Partial<IntroState>) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof IntroState)[]) {
    if (introStore[k] !== patch[k]) { (introStore[k] as IntroState[typeof k]) = patch[k]!; changed = true; }
  }
  if (changed) listeners.forEach((fn) => fn());
}

export function subscribeIntro(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
