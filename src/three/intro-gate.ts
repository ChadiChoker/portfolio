export type IntroEnv = { reducedMotion: boolean; webgl: boolean; seen: boolean; saveData: boolean };

// The intro is a one-time cinematic: never for returning visitors, reduced motion, data saver, or no WebGL.
export const shouldPlayIntro = ({ reducedMotion, webgl, seen, saveData }: IntroEnv) =>
  webgl && !reducedMotion && !seen && !saveData;
