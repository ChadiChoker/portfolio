import { profile } from "@/content/profile";

// What the MacBook display shows over the galaxy: a macOS-style menu bar and the hero lockup.
const APPLE = "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";
const SANS = '-apple-system, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// compact: phone layout. The laptop is small in a portrait viewport, so everything is set ~1.6x
// larger, the menu bar keeps only the essentials, and the prompt is shortened.
export function drawScreenHud(width: number, height: number, compact = false): OffscreenCanvas | HTMLCanvasElement {
  // OffscreenCanvas inside the render worker; a DOM canvas as a fallback.
  const c = typeof OffscreenCanvas === "function" ? new OffscreenCanvas(width, height) : Object.assign(document.createElement("canvas"), { width, height });
  const g = c.getContext("2d") as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  const u = height / 1000; // layout unit
  const k = compact ? 1.6 : 1; // type scale

  // menu bar
  const bar = 30 * u * (compact ? 1.5 : 1);
  g.fillStyle = "rgba(18,18,22,0.72)"; g.fillRect(0, 0, width, bar);
  g.save(); g.translate(26 * u, bar / 2 - 9 * u * (compact ? 1.5 : 1)); g.scale(0.75 * u * (compact ? 1.5 : 1), 0.75 * u * (compact ? 1.5 : 1)); g.fillStyle = "#fff"; g.fill(new Path2D(APPLE)); g.restore();
  g.textBaseline = "middle"; g.fillStyle = "#fff";
  const mb = 15 * u * (compact ? 1.5 : 1); // menu-bar type
  g.font = `700 ${mb}px ${SANS}`; g.fillText(profile.name, 62 * u * (compact ? 1.4 : 1), bar / 2);
  if (!compact) {
    g.font = `400 ${mb}px ${SANS}`; g.fillStyle = "rgba(255,255,255,.85)";
    let x = 62 * u + g.measureText(profile.name).width + 26 * u;
    for (const item of ["Services", "Projects", "Experience", "Contact"]) { g.fillText(item, x, bar / 2); x += g.measureText(item).width + 22 * u; }
  }
  g.font = `400 ${mb}px ${SANS}`; g.fillStyle = "rgba(255,255,255,.85)";
  const clock = new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(/,/g, "");
  g.textAlign = "right"; g.fillText(clock, width - 26 * u, bar / 2);
  if (!compact) { g.font = `600 ${13 * u}px ${MONO}`; g.fillStyle = "#10b981"; g.fillText("● agent online", width - 26 * u - g.measureText(clock).width - 90 * u, bar / 2); }
  g.textAlign = "left";

  // hero lockup (matches the real hero)
  const left = (compact ? 80 : 120) * u;
  const Y = compact ? { badge: 300, name: 500, title: 600, prompt: 665 } : { badge: 420, name: 545, title: 615, prompt: 690 };
  g.textBaseline = "alphabetic";
  g.fillStyle = "#10b981"; g.font = `500 ${22 * u * k}px ${MONO}`; g.fillText(`●  ${profile.availability.toUpperCase()}`, left + 4 * u, Y.badge * u);
  g.fillStyle = "#fff"; g.font = `700 ${118 * u * k}px ${SANS}`; g.fillText(profile.name, left, Y.name * u);
  g.fillStyle = "#9aa4ae"; g.font = `400 ${44 * u * k}px ${SANS}`; g.fillText(profile.title, left + 4 * u, Y.title * u);

  // "Ask me anything" prompt, styled like the site's space-glass chat: glass pill, gradient
  // border, emerald glow, sparkle icon, caret and a send button.
  const prompt = compact ? "Ask me anything" : "Ask me anything about Chadi's work";
  g.font = `400 ${25 * u * k}px ${MONO}`; g.textBaseline = "middle";
  const h = 76 * u * k, y = Y.prompt * u, r = h / 2, icon = 34 * u * k, padL = 30 * u * k;
  const textW = g.measureText(prompt).width;
  const w = padL + icon + 18 * u * k + textW + 24 * u * k + h; // send button sits in the last h
  const pill = () => { g.beginPath(); g.roundRect(left, y, w, h, r); };

  g.save(); // emerald aura
  g.shadowColor = "rgba(16,185,129,0.55)"; g.shadowBlur = 40 * u * k;
  g.fillStyle = "rgba(5,8,13,0.72)"; pill(); g.fill();
  g.restore();
  const sheen = g.createLinearGradient(0, y, 0, y + h); // glass sheen
  sheen.addColorStop(0, "rgba(255,255,255,0.09)"); sheen.addColorStop(0.5, "rgba(255,255,255,0.02)"); sheen.addColorStop(1, "rgba(16,185,129,0.06)");
  g.fillStyle = sheen; pill(); g.fill();
  const edge = g.createLinearGradient(left, y, left + w, y + h); // gradient border
  edge.addColorStop(0, "#10b981"); edge.addColorStop(0.55, "#22d3ee"); edge.addColorStop(1, "#8b5cf6");
  g.strokeStyle = edge; g.lineWidth = 2.5 * u * k; pill(); g.stroke();

  // sparkle icon
  const cx = left + padL + icon / 2, cy = y + h / 2, s4 = (x: number, yy: number, R: number) => {
    g.beginPath(); g.moveTo(x, yy - R);
    g.quadraticCurveTo(x + R * 0.18, yy - R * 0.18, x + R, yy); g.quadraticCurveTo(x + R * 0.18, yy + R * 0.18, x, yy + R);
    g.quadraticCurveTo(x - R * 0.18, yy + R * 0.18, x - R, yy); g.quadraticCurveTo(x - R * 0.18, yy - R * 0.18, x, yy - R); g.fill();
  };
  g.save(); g.shadowColor = "rgba(16,185,129,0.9)"; g.shadowBlur = 14 * u * k; g.fillStyle = "#34d399";
  s4(cx - 3 * u * k, cy - 2 * u * k, 15 * u * k); s4(cx + 12 * u * k, cy + 11 * u * k, 6.5 * u * k); g.restore();

  // prompt + caret
  const tx = left + padL + icon + 18 * u * k;
  g.fillStyle = "rgba(235,245,240,0.86)"; g.fillText(prompt, tx, cy);
  g.fillStyle = "#10b981"; g.fillRect(tx + textW + 8 * u * k, cy - 15 * u * k, 3 * u * k, 30 * u * k);

  // send button
  const bx = left + w - h / 2, br = h / 2 - 9 * u * k;
  const btn = g.createLinearGradient(bx - br, cy - br, bx + br, cy + br);
  btn.addColorStop(0, "#10b981"); btn.addColorStop(1, "#22d3ee");
  g.save(); g.shadowColor = "rgba(16,185,129,0.7)"; g.shadowBlur = 18 * u * k;
  g.fillStyle = btn; g.beginPath(); g.arc(bx, cy, br, 0, Math.PI * 2); g.fill(); g.restore();
  g.strokeStyle = "#04120c"; g.lineWidth = 3.2 * u * k; g.lineCap = "round"; g.lineJoin = "round"; // arrow ↑
  g.beginPath(); g.moveTo(bx, cy + 10 * u * k); g.lineTo(bx, cy - 10 * u * k); g.moveTo(bx - 8 * u * k, cy - 2 * u * k); g.lineTo(bx, cy - 10 * u * k); g.lineTo(bx + 8 * u * k, cy - 2 * u * k); g.stroke();
  return c;
}
