import * as THREE from "three";
import { createParticleMorph } from "./objects/particleMorph";
import type { Frame, HeroObject } from "./objects/types";
import { haloFragment, haloVertex } from "./shaders";

const rgb = (hex: string) => {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
};

// Raw sRGB values: the custom shaders write them straight out, no colour management.
const PALETTE = {
  uCyan: { value: rgb("#09c7fb") },
  uViolet: { value: rgb("#c471ed") },
  uCoral: { value: rgb("#f64f59") },
};

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

/**
 * The hero visual: the particle formations (see ./objects/particleMorph) over a soft halo.
 * With `intro`, the particles first play the page loader: dust gathering centre-stage into the
 * logo, then bursting out to their place beside the headline.
 */
export class SpectrumScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  private group = new THREE.Group();
  private particles: HeroObject;
  private halo: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private timer = new THREE.Timer();

  /** Loader intro: the particles sit centre-stage (blend 1) and glide to their spot when it ends. */
  private intro: { active: boolean; blend: number };
  private frame: Frame = { time: 0, dt: 0, excite: 0, pointer: new THREE.Vector2(), pointerSpeed: 0 };
  private pointer = new THREE.Vector2();
  private exciteTarget = 0;
  private scroll = 0;
  /** Where the particles sit and how big they may look, in normalised device coordinates. */
  private layout = { u: 0.45, v: -0.04, rho: 0.8 };
  private zone: { x: number; y: number; w: number; h: number } | null = null;
  private running = false;

  constructor(
    canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
    intro: boolean,
  ) {
    const compact = window.matchMedia("(max-width: 767px)").matches;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setClearColor(0x000000, 0);

    this.camera.position.set(0, 0, 7.5);
    this.scene.add(this.group);

    this.intro = { active: intro, blend: intro ? 1 : 0 };
    this.particles = createParticleMorph(compact, this.renderer.getPixelRatio(), PALETTE, intro);
    this.group.add(this.particles.root);

    this.halo = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        uniforms: { uTime: { value: 0 }, uExcite: { value: 0 }, ...PALETTE },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.halo.position.z = -3;
    this.scene.add(this.halo);
  }

  /** The box the page reserves for the particles, in canvas pixels; null falls back to centre-stage. */
  setZone(zone: { x: number; y: number; w: number; h: number } | null) {
    this.zone = zone;
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Centre on the reserved box and fill its shorter side, so the particles never cross the copy.
    const zone = this.zone;
    this.layout = zone
      ? {
          u: ((zone.x + zone.w / 2) / width) * 2 - 1,
          v: 1 - ((zone.y + zone.h / 2) / height) * 2,
          rho: Math.min(zone.w, zone.h) / height,
        }
      : { u: 0, v: 0, rho: Math.min(0.8, 0.9 * this.camera.aspect) };
    if (!this.running) this.render(0);
  }

  /** World-space position and scale that keep a sphere of `radius` inside the layout box. */
  private fit(radius: number) {
    // Centred and a little smaller while the intro plays, easing out to the normal layout.
    const aspect = this.camera.aspect;
    const centre = { u: 0, v: 0.04, rho: aspect > 1 ? 0.5 : Math.min(0.42, 0.9 * aspect) };
    const b = THREE.MathUtils.smoothstep(this.intro.blend, 0, 1);
    const u = THREE.MathUtils.lerp(this.layout.u, centre.u, b);
    const v = THREE.MathUtils.lerp(this.layout.v, centre.v, b);
    const rho = THREE.MathUtils.lerp(this.layout.rho, centre.rho, b);
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const distance = this.camera.position.z;
    // A sphere looks bigger than its radius in perspective: solve for the angle it spans.
    const worldRadius = distance * Math.sin(Math.atan(rho * tanHalfFov));
    return {
      x: u * tanHalfFov * aspect * distance,
      y: v * tanHalfFov * distance,
      scale: worldRadius / radius,
    };
  }

  setPointer(x: number, y: number) {
    this.frame.pointerSpeed = Math.min(1, this.frame.pointerSpeed + Math.hypot(x - this.pointer.x, y - this.pointer.y) * 2);
    this.pointer.set(x, y);
  }

  setExcite(on: boolean) {
    this.exciteTarget = on ? 1 : 0;
  }

  setIntroProgress(progress: number) {
    this.particles.intro?.(progress);
  }

  endIntro() {
    if (!this.intro.active) return;
    this.intro.active = false;
    this.particles.burst?.();
  }

  setScroll(progress: number) {
    this.scroll = progress;
    if (!this.running) this.render(0);
  }

  start() {
    if (this.running) return;
    if (this.reducedMotion) {
      this.frame.time = 4;
      this.render(0);
      return;
    }
    this.running = true;
    this.timer.reset();
    this.renderer.setAnimationLoop((t) => {
      this.timer.update(t);
      this.render(Math.min(this.timer.getDelta(), 0.05));
    });
  }

  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private render(dt: number) {
    const f = this.frame;
    f.dt = dt;
    f.excite = damp(f.excite, this.exciteTarget, 4, dt);
    f.pointerSpeed = damp(f.pointerSpeed, 0, 2.5, dt);
    f.pointer.x = damp(f.pointer.x, this.pointer.x, 3, dt);
    f.pointer.y = damp(f.pointer.y, this.pointer.y, 3, dt);
    f.time += dt * (1 + f.excite * 1.4);
    this.intro.blend = damp(this.intro.blend, this.intro.active ? 1 : 0, 2.2, dt);

    // Leave headroom for the hover swell and pointer drift so nothing touches the edges.
    const { x, y, scale } = this.fit(this.particles.radius * 1.08);
    this.group.position.set(x + f.pointer.x * 0.06, y + this.scroll * 1.6 + f.pointer.y * 0.04, 0);
    this.group.scale.setScalar(scale * (1 - this.scroll * 0.2) * (1 + f.excite * 0.06));
    this.group.rotation.set(-f.pointer.y * 0.35, f.pointer.x * 0.5, 0);
    this.halo.position.set(this.group.position.x, this.group.position.y, -3);
    this.particles.update(f);

    const haloU = this.halo.material.uniforms;
    haloU.uTime.value = f.time;
    haloU.uExcite.value = f.excite;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.particles.dispose();
    this.halo.geometry.dispose();
    this.halo.material.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
