import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { createGalaxy } from "./galaxy";
import { introPose } from "./choreography";
import { drawScreenHud } from "./screen-hud";
import { introStore } from "./intro-store";

// One fixed full-screen canvas behind the page. While the intro plays it renders the MacBook,
// with the galaxy drawn onto its display through a render target; after the hand-off it renders
// that same galaxy directly, so the site's background is literally what was on the screen.

const MODEL_URL = "/models/macbook.glb";
const FIT_SIZE = 4.2;
const CAM_HOME = new THREE.Vector3(0, 0, 10);
const DEVICE_WIDTH = FIT_SIZE * 1.15; // laptop width plus breathing room

type Rig = {
  pivot: THREE.Object3D; screen: THREE.Mesh; screenMat: THREE.MeshBasicMaterial;
  hingeY: number; relY: number; relZ: number; targetY: number; openX: number; closedX: number;
};

export type World = { pulse: () => void; dispose: () => void };

export function createWorld(canvas: HTMLCanvasElement, { mobile }: { mobile: boolean }): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  const dpr = Math.min(devicePixelRatio, mobile ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ---- the galaxy (screen content + background) ----
  const galaxy = createGalaxy(mobile ? 6000 : 16000);
  galaxy.material.uniforms.uPixelRatio.value = dpr;
  const space = new THREE.Scene();
  space.background = new THREE.Color(0x020306);
  space.add(galaxy.points);
  const spaceCam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  spaceCam.position.set(0, 2.6, 5.2);

  // ---- the MacBook scene (only when the intro plays) ----
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 200);
  const holder = new THREE.Group();
  room.add(holder);
  let rig: Rig | null = null;
  let rt: THREE.WebGLRenderTarget | null = null;
  let hudScene: THREE.Scene | null = null, hudMat: THREE.MeshBasicMaterial | null = null;
  const hudCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const later = (cb: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(cb, { timeout: 800 }) : setTimeout(cb, 50));
  // Loaded the first time the intro asks for it, so World and Intro can start in any order.
  let introRequested = false;
  const loadIntro = () => later(() => {
    room.environment = studioEnvironment(renderer);
    room.add(new THREE.AmbientLight(0xffffff, 0.1));
    const light = (color: number, k: number, x: number, y: number, z: number) => { const l = new THREE.DirectionalLight(color, k); l.position.set(x, y, z); room.add(l); };
    light(0xffeeda, 1.15, 5, 8, 6); light(0xc4d2ff, 0.18, -7, 3, 4); light(0xe6eeff, 1.0, -2, 6, -7); light(0x10b981, 0.8, -6, 2, -4);

    rt = new THREE.WebGLRenderTarget(mobile ? 1280 : 2048, mobile ? 830 : 1328, { colorSpace: THREE.SRGBColorSpace, samples: mobile ? 0 : 4 });
    const hudTex = new THREE.CanvasTexture(drawScreenHud(rt.width, rt.height));
    hudTex.colorSpace = THREE.SRGBColorSpace;
    hudMat = new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, depthTest: false });
    hudScene = new THREE.Scene();
    hudScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hudMat));

    later(() => {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(MODEL_URL, (gltf) => {
        rig = rigModel(gltf.scene, holder, rt!.texture);
        introStore.ready = true;
      }, undefined, () => { introStore.failed = true; });
    });
  });

  // ---- loop ----
  const sBox = new THREE.Box3(), sCenter = new THREE.Vector3(), sSize = new THREE.Vector3();
  const camDive = new THREE.Vector3(), look = new THREE.Vector3(), origin = new THREE.Vector3();
  const mouse = new THREE.Vector2();
  let smooth = introStore.progress, raf = 0, last = performance.now(), running = true;

  const onMove = (e: PointerEvent) => mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = spaceCam.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix(); spaceCam.updateProjectionMatrix();
    // portrait screens: back the camera off until the whole laptop fits the width
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect;
    CAM_HOME.z = Math.max(10, DEVICE_WIDTH / 2 / halfW);
  };
  const onVisibility = () => {
    running = !document.hidden;
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
  };
  addEventListener("pointermove", onMove); addEventListener("resize", resize); document.addEventListener("visibilitychange", onVisibility);
  resize();

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const t = now / 1000;
    if (introStore.mode === "play" && !introRequested) { introRequested = true; loadIntro(); }
    smooth += (introStore.progress - smooth) * Math.min(1, dt * 4); // damped follow: flicks become one glide
    const intro = introStore.mode === "play" && rig !== null && smooth < 0.999;
    const pose = introPose(smooth);
    galaxy.update(dt, t);

    if (intro && rig && rt && hudScene && hudMat) {
      // lid hinge with seat lift, so the closed lid rests on the keys instead of sinking into them
      rig.pivot.rotation.x = rig.closedX + (rig.openX - rig.closedX) * pose.lidOpen;
      const th = rig.pivot.rotation.x;
      const bottom = rig.hingeY + rig.relY * Math.cos(th) - rig.relZ * Math.sin(th);
      rig.pivot.position.y = rig.hingeY + Math.max(0, rig.targetY - bottom);
      rig.screenMat.color.setScalar(pose.power);

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
      if (pose.handoff > 0) { // cross-fade into the direct galaxy
        galaxy.material.uniforms.uOpacity.value = pose.handoff;
        renderer.autoClear = false; renderer.render(galaxy.points, spaceCam); renderer.autoClear = true;
        galaxy.material.uniforms.uOpacity.value = 1;
      }
    } else {
      // site background: the galaxy, drifting with scroll for depth, dimmed behind content
      const depth = Math.min(scrollY / Math.max(1, document.body.scrollHeight - innerHeight), 1);
      spaceCam.position.set(Math.sin(t * 0.2) * 0.4 + mouse.x * 0.6, 2.6 - depth * 1.6 - mouse.y * 0.3, 5.2 - depth * 1.2);
      spaceCam.lookAt(origin);
      galaxy.material.uniforms.uOpacity.value = 0.6;
      renderer.render(space, spaceCam);
    }
    if (running) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    pulse: () => galaxy.pulse(),
    dispose: () => {
      running = false; cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove); removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose(); rt?.dispose();
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
