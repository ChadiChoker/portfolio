export type IntroEnv = { reducedMotion: boolean; webgl: boolean; saveData: boolean };

// The reveal plays on every visit (skip is one tap away), except where it would hurt:
// reduced motion, data saver, or no WebGL.
export const shouldPlayIntro = ({ reducedMotion, webgl, saveData }: IntroEnv) => webgl && !reducedMotion && !saveData;
