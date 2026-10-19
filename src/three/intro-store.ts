// Shared, render-free state between the Intro scroll section and the WebGL world.
// The world reads it every frame; nothing here triggers React renders.
export const introStore = {
  mode: "none" as "none" | "play",
  progress: 1,
  ready: false,
  failed: false,
};
