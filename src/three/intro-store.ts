// Shared, render-free state between the Intro scroll section and the WebGL world.
// The world reads it every frame; nothing here triggers React renders.
export const introStore = {
  mode: "none" as "none" | "play",
  progress: 1,
  end: 0, // scrollY at which the intro has fully handed off to the page
  ready: false,
  failed: false,
};
