// Scroll choreography for the MacBook intro. Pure: progress in, pose out, every channel in [0,1].
// Beats: the lid opens and the device turns to face you, the display wakes, then the camera dives in.

export type IntroPose = {
  lidOpen: number; // 0 closed → 1 open
  turn: number; // 0 three-quarter top view → 1 straight on
  power: number; // display brightness
  dive: number; // camera flight into the display
  hud: number; // on-screen name/menu bar opacity (fades so only the galaxy carries over)
  handoff: number; // 0 intro scene → 1 site background
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const beat = (p: number, from: number, to: number) => easeInOutCubic(clamp01((p - from) / (to - from)));

export function introPose(progress: number): IntroPose {
  const p = clamp01(progress);
  const dive = beat(p, 0.5, 0.88);
  return {
    lidOpen: beat(p, 0.1, 0.44),
    turn: beat(p, 0.04, 0.48),
    power: beat(p, 0.28, 0.46),
    dive,
    hud: 1 - clamp01(dive * 1.6),
    handoff: beat(p, 0.86, 0.97),
  };
}
