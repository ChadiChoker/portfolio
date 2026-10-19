import { profile } from "@/content/profile";

// What the MacBook display shows over the galaxy: a macOS-style menu bar and the hero lockup.
const APPLE = "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";
const SANS = '-apple-system, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

export function drawScreenHud(width: number, height: number, now = new Date()): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width; c.height = height;
  const g = c.getContext("2d")!;
  const u = height / 1000; // layout unit

  // menu bar
  const bar = 30 * u;
  g.fillStyle = "rgba(18,18,22,0.72)"; g.fillRect(0, 0, width, bar);
  g.save(); g.translate(26 * u, 6 * u); g.scale(0.75 * u, 0.75 * u); g.fillStyle = "#fff"; g.fill(new Path2D(APPLE)); g.restore();
  g.textBaseline = "middle"; g.fillStyle = "#fff";
  g.font = `700 ${15 * u}px ${SANS}`; g.fillText(profile.name, 62 * u, bar / 2);
  g.font = `400 ${15 * u}px ${SANS}`; g.fillStyle = "rgba(255,255,255,.85)";
  let x = 62 * u + g.measureText(profile.name).width + 26 * u;
  g.font = `400 ${15 * u}px ${SANS}`;
  for (const item of ["Services", "Projects", "Experience", "Contact"]) { g.fillText(item, x, bar / 2); x += g.measureText(item).width + 22 * u; }
  const clock = now.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(/,/g, "");
  g.textAlign = "right"; g.fillText(clock, width - 26 * u, bar / 2);
  g.font = `600 ${13 * u}px ${MONO}`; g.fillStyle = "#10b981"; g.fillText("● agent online", width - 26 * u - g.measureText(clock).width - 90 * u, bar / 2);
  g.textAlign = "left";

  // hero lockup (matches the real hero)
  const left = 120 * u;
  g.textBaseline = "alphabetic";
  g.fillStyle = "#10b981"; g.font = `500 ${22 * u}px ${MONO}`; g.fillText(`●  ${profile.availability.toUpperCase()}`, left + 4 * u, 420 * u);
  g.fillStyle = "#fff"; g.font = `700 ${118 * u}px ${SANS}`; g.fillText(profile.name, left, 545 * u);
  g.fillStyle = "#9aa4ae"; g.font = `400 ${44 * u}px ${SANS}`; g.fillText(profile.title, left + 4 * u, 615 * u);

  // spotlight-style prompt, a hint of the agent waiting inside
  const prompt = "> Ask me anything about Chadi's work…";
  g.font = `400 ${24 * u}px ${MONO}`; g.textBaseline = "middle";
  const pad = 28 * u, w = g.measureText(prompt).width + pad * 2, h = 64 * u, y = 700 * u; // pill hugs the text in any font
  g.fillStyle = "rgba(255,255,255,0.08)"; g.strokeStyle = "rgba(16,185,129,0.6)"; g.lineWidth = 2 * u;
  g.beginPath(); g.roundRect(left, y, w, h, 16 * u); g.fill(); g.stroke();
  g.fillStyle = "rgba(255,255,255,.6)";
  g.fillText(prompt, left + pad, y + h / 2);
  return c;
}
