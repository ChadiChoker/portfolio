import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { createGalaxy } from "./galaxy";
import { introPose, sceneBrightness, BG_BRIGHTNESS } from "./choreography";
import { drawScreenHud } from "./screen-hud";

// One full-screen canvas behind the page. While the intro plays it renders the MacBook, with the
// galaxy drawn onto its display through a render target; after the hand-off it renders that same
// galaxy directly, so the site's background is what was on the screen.
// Environment-agnostic (no window/document): it runs inside a Web Worker on an OffscreenCanvas,
// and the page feeds it input through the methods below.

const MODEL_URL = "/models/macbook.glb";
const FIT_SIZE = 4.2;
const CAM_HOME = new THREE.Vector3(0, 0, 10);
const DEVICE_WIDTH = FIT_SIZE * 1.15; // laptop width plus breathing room

type Rig = {
  pivot: THREE.Object3D; screen: THREE.Mesh; screenMat: THREE.MeshBasicMaterial;
  hingeY: number; relY: number; relZ: number; targetY: number; openX: number; closedX: number;
};

export type WorldOptions = { mobile: boolean; dpr: number; width: number; height: number };
export type WorldEvents = { ready: () => void; failed: () => void };
export type IntroInput = { mode: "none" | "play"; progress: number; end: number };
export type World = {
  resize: (width: number, height: number) => void;
  pointer: (x: number, y: number) => void; // -0.5..0.5 from the viewport centre
  scroll: (y: number, max: number) => void;
  intro: (state: IntroInput) => void;
  visible: (visible: boolean) => void;
  pulse: () => void;
  dispose: () => void;
};

const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === "function" ? (cb) => requestAnimationFrame(cb) : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const cancelRaf = (id: number) => (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame(id) : clearTimeout(id));
const later = (cb: () => void) => (typeof requestIdleCallback === "function" ? requestIdleCallback(cb, { timeout: 800 }) : setTimeout(cb, 30));

export function createWorld(canvas: HTMLCanvasElement | OffscreenCanvas, opts: WorldOptions, events: WorldEvents): World {
  const { mobile } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  const dpr = Math.min(opts.dpr, mobile ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ---- input fed by the page ----
  const view = { width: opts.width, height: opts.height, scrollY: 0, scrollMax: 1 };
  const intro: IntroInput = { mode: "none", progress: 1, end: 0 };
  const mouse = new THREE.Vector2(), drift = new THREE.Vector2(); // drift eases toward the mouse, so the hand-off never jumps

  // ---- the galaxy (screen content + background) ----
  const galaxy = createGalaxy(mobile ? 6000 : 16000);
  galaxy.material.uniforms.uPixelRatio.value = dpr;
  const space = new THREE.Scene();
  space.background = new THREE.Color(0x000000); // one black for every layer, so the hand-off never steps
  space.add(galaxy.points);
  const spaceCam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  spaceCam.position.set(0, 2.6, 5.2);

  // ---- the MacBook scene (built the first time the intro asks for it) ----
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 200);
  const holder = new THREE.Group();
  room.add(holder);
  let rig: Rig | null = null;
  let rt: THREE.WebGLRenderTarget | null = null;
  let hudScene: THREE.Scene | null = null, hudMat: THREE.MeshBasicMaterial | null = null, hudTex: THREE.Texture | null = null;
  const hudCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let introRequested = false, disposed = false;

  const fail = () => { if (!disposed) events.failed(); };
  const setupIntro = () => {
    if (disposed) return;
    room.environment = studioEnvironment(renderer);
    room.add(new THREE.AmbientLight(0xffffff, 0.1));
    const light = (color: number, k: number, x: number, y: number, z: number) => { const l = new THREE.DirectionalLight(color, k); l.position.set(x, y, z); room.add(l); };
    light(0xffeeda, 1.15, 5, 8, 6); light(0xc4d2ff, 0.18, -7, 3, 4); light(0xe6eeff, 1.0, -2, 6, -7); light(0x10b981, 0.8, -6, 2, -4);

    rt = new THREE.WebGLRenderTarget(mobile ? 1280 : 2048, mobile ? 830 : 1328, { colorSpace: THREE.SRGBColorSpace, samples: mobile ? 0 : 4 });
    hudTex = new THREE.CanvasTexture(drawScreenHud(rt.width, rt.height));
    hudTex.colorSpace = THREE.SRGBColorSpace;
    hudMat = new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, depthTest: false });
    hudScene = new THREE.Scene();
    hudScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hudMat));

    later(() => {
      if (disposed) return;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(MODEL_URL, (gltf) => {
        if (disposed) return;
        try { rig = rigModel(gltf.scene, holder, rt!.texture); events.ready(); } catch { fail(); }
      }, undefined, fail);
    });
  };

  const resize = (width: number, height: number) => {
    view.width = width; view.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = spaceCam.aspect = width / height;
    camera.updateProjectionMatrix(); spaceCam.updateProjectionMatrix();
    // portrait screens: back the camera off until the whole laptop fits the width
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect;
    CAM_HOME.z = Math.max(10, DEVICE_WIDTH / 2 / halfW);
  };
  resize(view.width, view.height);

  // ---- loop ----
  const sBox = new THREE.Box3(), sCenter = new THREE.Vector3(), sSize = new THREE.Vector3();
  const camDive = new THREE.Vector3(), look = new THREE.Vector3(), origin = new THREE.Vector3();
  let smooth = 1, brightness = BG_BRIGHTNESS, handle = 0, last = performance.now(), running = true;

  function frame(now: number) {
    if (!running) return;
    // Phones draw the slow background drift at 30fps (half the battery); the intro always runs at full rate.
    const background = !(intro.mode === "play" && smooth < 0.999);
    if (mobile && background && now - last < 32) { handle = raf(frame); return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const t = now / 1000;
    if (intro.mode === "play" && !introRequested) { introRequested = true; later(() => { try { setupIntro(); } catch { fail(); } }); }
    smooth += (intro.progress - smooth) * Math.min(1, dt * 4); // damped follow: flicks become one glide
    if (Math.abs(intro.progress - smooth) < 1e-3) smooth = intro.progress; // settle exactly, or 'past the intro' never triggers
    const playing = intro.mode === "play" && rig !== null && smooth < 0.999;
    const pose = introPose(smooth);
    const after = Math.max(0, view.scrollY - intro.end);
    // eased toward the scroll-driven target, so even a fast flick dims like a fade, never a switch
    const target = intro.mode === "play" ? sceneBrightness(smooth, after, view.height) : BG_BRIGHTNESS;
    brightness += (target - brightness) * Math.min(1, dt * 2.5);
    galaxy.update(dt, t);

    if (playing && rig && rt && hudScene && hudMat) {
      drift.set(0, 0);
      // lid hinge with seat lift, so the closed lid rests on the keys instead of sinking into them
      rig.pivot.rotation.x = rig.closedX + (rig.openX - rig.closedX) * pose.lidOpen;
      const th = rig.pivot.rotation.x;
      const bottom = rig.hingeY + rig.relY * Math.cos(th) - rig.relZ * Math.sin(th);
      rig.pivot.position.y = rig.hingeY + Math.max(0, rig.targetY - bottom);
      // true cross-fade at the hand-off: the display's galaxy fades out as the direct one fades in,
      // so total brightness stays constant (no double-bright frame, no drop at the switch)
      rig.screenMat.color.setScalar(pose.power * (1 - pose.handoff));

      const still = 1 - pose.dive;
      holder.rotation.set(0.32 * (1 - pose.turn) + 0.05 * pose.turn - mouse.y * 0.06 * still, -0.5 * (1 - pose.turn) + mouse.x * 0.12 * still, 0);
      holder.scale.setScalar(0.9 + 0.1 * pose.turn);
      holder.position.set((camera.aspect >= 1 ? 0.35 : 0.6) * (1 - pose.turn), 0.25 * (1 - pose.turn) + 0.05 * pose.turn, 0);

      camera.position.copy(CAM_HOME);
      look.set(0, 0, 0);
      if (pose.dive > 0) {
        holder.updateMatrixWorld(true);
        sBox.setFromObject(rig.screen); sBox.getCenter(sCenter); sBox.getSize(sSize);
        const half = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
        const dist = Math.min(sSize.y / 2 / half, sSize.x / 2 / half / camera.aspect) * 0.92; // just past "fill"
        camDive.set(sCenter.x, sCenter.y, sCenter.z + dist);
        camera.position.lerp(camDive, pose.dive);
        look.lerp(sCenter, pose.dive);
      }
      camera.lookAt(look);

      hudMat.opacity = pose.hud;
      spaceCam.position.set(Math.sin(t * 0.2) * 0.4, 2.6, 5.2); spaceCam.lookAt(origin);
      if (pose.power > 0) {
        const aspect = spaceCam.aspect; spaceCam.aspect = rt.width / rt.height; spaceCam.updateProjectionMatrix();
        renderer.setRenderTarget(rt); renderer.render(space, spaceCam);
        renderer.autoClear = false; renderer.render(hudScene, hudCam); renderer.autoClear = true;
        renderer.setRenderTarget(null);
        spaceCam.aspect = aspect; spaceCam.updateProjectionMatrix();
      }
      renderer.render(room, camera);
      if (pose.handoff > 0) { // the direct galaxy, fading in as the display fades out
        galaxy.material.uniforms.uOpacity.value = pose.handoff * brightness;
        renderer.autoClear = false; renderer.render(galaxy.points, spaceCam); renderer.autoClear = true;
        galaxy.material.uniforms.uOpacity.value = 1;
      }
    } else {
      // site background: the galaxy, drifting with scroll for depth, dimmed behind content.
      // Depth starts at 0 where the intro ends, so the first frame matches the hand-off pose exactly.
      const depth = Math.min(after / Math.max(1, view.scrollMax - intro.end), 1);
      drift.lerp(mouse, Math.min(1, dt * 1.5));
      spaceCam.position.set(Math.sin(t * 0.2) * 0.4 + drift.x * 0.6, 2.6 - depth * 1.6 - drift.y * 0.3, 5.2 - depth * 1.2);
      spaceCam.lookAt(origin);
      galaxy.material.uniforms.uOpacity.value = brightness;
      renderer.render(space, spaceCam);
    }
    handle = raf(frame);
  }
  handle = raf(frame);

  return {
    resize,
    pointer: (x, y) => mouse.set(x, y),
    scroll: (y, max) => { view.scrollY = y; view.scrollMax = max; },
    intro: (state) => { Object.assign(intro, state); },
    visible: (v) => {
      if (v === running) return;
      running = v;
      if (v) { last = performance.now(); handle = raf(frame); } else cancelRaf(handle);
    },
    pulse: () => galaxy.pulse(),
    dispose: () => {
      disposed = true; running = false; cancelRaf(handle);
      galaxy.points.geometry.dispose(); galaxy.material.dispose();
      hudTex?.dispose(); hudMat?.dispose(); rt?.dispose(); room.environment?.dispose();
      renderer.dispose();
    },
  };
}

// Rigged model: "LidPivot" is the hinge, "Screen" the display panel. Constants come from the
// pivot's baked extras (rigged-macbook-3d), with the package's published values as fallbacks.
function rigModel(model: THREE.Object3D, holder: THREE.Group, screenTexture: THREE.Texture): Rig {
  const pivot = model.getObjectByName("LidPivot");
  const screen = model.getObjectByName("Screen") as THREE.Mesh | undefined;
  if (!pivot || !screen) throw new Error("macbook.glb is missing LidPivot/Screen");
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture, color: 0x000000, toneMapped: false });
  screen.material = screenMat;
  model.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if ((o as THREE.Mesh).isMesh && m?.userData?.spaceBlack) m.envMapIntensity = 1.1;
  });
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const fit = new THREE.Group();
  fit.scale.setScalar(FIT_SIZE / Math.max(size.x, size.y, size.z));
  model.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-1);
  fit.add(model); holder.add(fit);
  const e = pivot.userData as Record<string, number | undefined>;
  const hingeY = pivot.position.y, hingeZ = pivot.position.z;
  return {
    pivot, screen, screenMat, hingeY,
    relY: (e.screenBottomY ?? 1.25) - hingeY, relZ: (e.screenBottomZ ?? -13.2) - hingeZ,
    targetY: e.seatTargetY ?? 0.7, openX: e.lidOpenX ?? 0, closedX: e.lidClosedX ?? 1.94,
  };
}

// Dark studio: mostly black with a few bright bands the anodised metal reflects as streaks,
// plus one emerald band as the site's signature reflection.
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  const band = (w: number, h: number, x: number, y: number, z: number, color: string, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  band(8, 5, 1, 3, 6, "#ffe7d2", 1.5);
  band(14, 1.6, 0, 6, -3, "#dde7ff", 2.6);
  band(1.3, 9, -3.4, 1, 6.5, "#ffffff", 2.2);
  band(1, 9, 3.6, 0, 6.5, "#e6edff", 1.5);
  band(5, 7, 8, 1, 2, "#ffffff", 0.9);
  band(5, 7, -8, 1, 2, "#10b981", 0.9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return tex;
}
