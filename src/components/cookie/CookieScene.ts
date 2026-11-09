import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clamp01, damp, smooth } from "@/lib/math";

/**
 * The cookie on the consent banner: a sculpted chocolate-chip cookie (public/models/cookie.glb, one cookie taken from a
 * stock scene and cut from 114k vertices to under 6k), with its baked dough look made here, since the original was a
 * Blender shader that doesn't export. It floats, turns slowly and leans toward the pointer. `bite()` takes a scalloped
 * bite out of its edge with a shower of crumbs (the visitor accepted); `drop()` makes it sag and sink (they didn't).
 */

const MODEL = "/models/cookie.glb";

// ---- A little smooth 3D noise, seeded, for the baked colour and the dough's grain
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

// ---- The bite: three overlapping circles eating into the rim, so the edge comes out scalloped like teeth marks
const BITE_ANGLE = 0.55;
const BITE = [-0.42, 0, 0.42].map((d) => ({ x: Math.cos(BITE_ANGLE + d) * 0.97, z: Math.sin(BITE_ANGLE + d) * 0.97, r: 0.42 }));
const inBite = (x: number, z: number) => BITE.some((c) => Math.hypot(x - c.x, z - c.z) < c.r);

/** Pulls a point straight toward the centre until it's clear of the bite, so bitten points land on the scalloped edge */
function outOfBite(x: number, z: number) {
  if (!inBite(x, z)) return [x, z] as const;
  let lo = 0, hi = 1; // lo: clear of the bite, hi: inside it
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inBite(x * mid, z * mid)) hi = mid;
    else lo = mid;
  }
  return [x * lo, z * lo] as const;
}

/** The model stores quantized attributes; this gives plain floats in the cookie's own space */
function toFloat(mesh: THREE.Mesh) {
  const src = mesh.geometry as THREE.BufferGeometry;
  const geo = new THREE.BufferGeometry();
  const pos = src.attributes.position;
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) out.set([pos.getX(i), pos.getY(i), pos.getZ(i)], i * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(out, 3));
  if (src.index) geo.setIndex(Array.from(src.index.array));
  geo.applyMatrix4(mesh.matrixWorld);
  return geo;
}

/** The cookie's half-thickness profile: highest top and lowest bottom in rings out from the centre */
function profile(geo: THREE.BufferGeometry, bins = 48) {
  const top = new Float32Array(bins).fill(-Infinity), bot = new Float32Array(bins).fill(Infinity);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const b = Math.min(bins - 1, Math.floor((Math.hypot(pos.getX(i), pos.getZ(i)) / 1.1) * bins));
    top[b] = Math.max(top[b], pos.getY(i));
    bot[b] = Math.min(bot[b], pos.getY(i));
  }
  // Fill any empty rings from their neighbours, centre outward
  for (let b = 1; b < bins; b++) {
    if (!isFinite(top[b])) top[b] = top[b - 1];
    if (!isFinite(bot[b])) bot[b] = bot[b - 1];
  }
  const at = (arr: Float32Array, r: number) => {
    const f = Math.min(bins - 1.001, Math.max(0, (r / 1.1) * bins - 0.5));
    const i = Math.floor(f);
    return arr[i] + (arr[i + 1] - arr[i]) * (f - i);
  };
  return { top: (r: number) => at(top, r), bot: (r: number) => at(bot, r) };
}

/** Adds the bite as a morph target, with its own normals so the cut face shades properly */
function addBite(geo: THREE.BufferGeometry, place: (x: number, y: number, z: number, rOld: number, rNew: number) => number) {
  const pos = geo.attributes.position;
  const bitten = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const [bx, bz] = outOfBite(x, z);
    const rOld = Math.hypot(x, z), rNew = Math.hypot(bx, bz);
    bitten.set([bx, rNew < rOld - 1e-5 ? place(x, y, z, rOld, rNew) : y, bz], i * 3);
  }
  geo.computeVertexNormals();
  const after = geo.clone();
  after.setAttribute("position", new THREE.BufferAttribute(bitten, 3));
  after.computeVertexNormals();
  geo.morphAttributes.position = [new THREE.BufferAttribute(bitten, 3)];
  geo.morphAttributes.normal = [after.attributes.normal.clone()];
  after.dispose();
}

/** The dough's grain, made once per load: a bump map for its rough surface, and (kept light) a colour map that darkens the crevices */
function grainTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  // One sheet over the whole cookie (its UVs span it once), so nothing tiles or repeats. Each octave is turned and
  // shifted so the noise's grid never lines up into a weave.
  const cos = Math.cos(0.9), sin = Math.sin(0.9);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let px = (x / size) * 34, py = (y / size) * 34, n = 0, amp = 0.5, total = 0;
      for (let o = 0; o < 5; o++) {
        n += noise(px, py, o * 7.3) * amp;
        total += amp;
        [px, py] = [(px * cos - py * sin) * 2.07 + 3.1, (px * sin + py * cos) * 2.07 + 1.7];
        amp *= 0.55;
      }
      const v = Math.round(178 + smooth((n / total - 0.3) / 0.42) * 77);
      img.data.set([v, v, v, 255], (y * size + x) * 4);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Crumb = { mesh: THREE.Mesh; v: THREE.Vector3; spin: THREE.Vector3 };

export class CookieScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  private rig = new THREE.Group(); // floats and leans
  private cookie = new THREE.Group(); // turns
  private parts: THREE.Mesh[] = [];
  private crumbs: Crumb[] = [];
  private crumbGeo = new THREE.DodecahedronGeometry(0.05, 0);
  private crumbMat = new THREE.MeshStandardMaterial({ color: "#c08a4c", roughness: 0.95 });
  private disposables: { dispose(): void }[] = [];
  private raf = 0;
  private last = 0;
  private time = 0;
  private pointer = { x: 0, y: 0 };
  private lean = { x: 0, y: 0 };
  private biteAt = -1;
  private dropAt = -1;

  /** Loads the model, then builds the scene around it */
  static async create(canvas: HTMLCanvasElement, reduced: boolean) {
    const gltf = await new GLTFLoader().loadAsync(MODEL);
    return new CookieScene(canvas, reduced, gltf.scene);
  }

  private constructor(
    private canvas: HTMLCanvasElement,
    private reduced: boolean,
    model: THREE.Object3D,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.resize();

    this.camera.position.set(0, 0.35, 5.6);
    this.camera.lookAt(0, 0, 0);

    // A soft studio for the chocolate's gloss, a warm key from the front-left, and the brand on the rim
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.35;
    this.scene.add(new THREE.HemisphereLight("#fff4e2", "#2a1a12", 0.8));
    const key = new THREE.DirectionalLight("#fff0d8", 2.1);
    key.position.set(-2.5, 3.5, 4);
    const cyan = new THREE.PointLight("#09c7fb", 9, 8);
    cyan.position.set(-2.6, 0.6, -1.8);
    const violet = new THREE.PointLight("#c471ed", 9, 8);
    violet.position.set(2.6, 0.2, -1.6);
    this.scene.add(key, cyan, violet);

    // ---- The model: dough and chips, in plain floats, centred, radius 1
    model.updateMatrixWorld(true);
    const meshes: THREE.Mesh[] = [];
    model.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh));
    // The dough is the primitive with the larger footprint
    const geos = meshes.map(toFloat);
    geos.forEach((g) => g.computeBoundingBox());
    geos.sort((a, b) => b.boundingBox!.max.x - b.boundingBox!.min.x - (a.boundingBox!.max.x - a.boundingBox!.min.x));
    const [dough, chips] = geos;
    const box = dough.boundingBox!;
    const center = box.getCenter(new THREE.Vector3());
    const scale = 2 / Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    for (const g of geos) g.translate(-center.x, -center.y, -center.z).scale(scale, scale, scale);

    const prof = profile(dough);
    const mid = (r: number) => (prof.top(r) + prof.bot(r)) / 2;

    // Bitten dough: as thick at its new radius as the cookie is there, top and bottom kept apart
    addBite(dough, (_x, y, _z, rOld, rNew) => {
      const m0 = mid(rOld), m1 = mid(rNew);
      const half0 = y >= m0 ? prof.top(rOld) - m0 : m0 - prof.bot(rOld);
      const half1 = y >= m0 ? prof.top(rNew) - m1 : m1 - prof.bot(rNew);
      const f = half0 > 1e-4 ? Math.min(1, Math.abs(y - m0) / half0) : 0;
      return m1 + Math.sign(y - m0 || 1) * half1 * Math.max(f, 0.12);
    });
    // Chips in the bite ride up onto the surface at the bite's edge
    if (chips) addBite(chips, (_x, y, _z, rOld, rNew) => y + (prof.top(rNew) - prof.top(rOld)));

    // Baked colour: golden dough, darker toward the rim and underneath, paler freckles on top
    const doughCol = new THREE.Color("#c08a52"), bakedCol = new THREE.Color("#7d4f26"), paleCol = new THREE.Color("#d9a86e");
    const pos = dough.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const uvs = new Float32Array(pos.count * 2);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r = Math.hypot(x, z);
      const edge = smooth((r - 0.6) / 0.45);
      const freckle = smooth((noise(x * 6, y * 6 + 3, z * 6) - 0.62) / 0.1);
      const mottle = noise(x * 2.2 + 9, y * 2.2, z * 2.2);
      c.copy(doughCol).lerp(bakedCol, edge * 0.7 + (y < mid(r) ? 0.35 : 0) + (mottle - 0.5) * 0.3);
      if (y > mid(r)) c.lerp(paleCol, freckle * 0.4);
      colors.set([c.r, c.g, c.b], i * 3);
      uvs.set([x * 0.45 + 0.5, z * 0.45 + 0.5 + y * 0.3], i * 2); // seen from above, once over the whole cookie
    }
    dough.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    dough.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    const grain = grainTexture();
    const doughMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: grain, roughness: 1, metalness: 0, bumpMap: grain, bumpScale: 1.8 });
    const chipMat = new THREE.MeshStandardMaterial({ color: "#3a1c0f", roughness: 0.28, metalness: 0 });
    this.disposables.push(grain, doughMat, chipMat, env, this.crumbGeo, this.crumbMat, ...geos);

    for (const [g, m] of [[dough, doughMat], [chips, chipMat]] as const) {
      if (!g) continue;
      const mesh = new THREE.Mesh(g, m);
      mesh.morphTargetInfluences = [0];
      this.cookie.add(mesh);
      this.parts.push(mesh);
    }

    // Tipped toward the viewer so the top and its chips read, with the thickness still showing
    this.cookie.rotation.x = 0.78;
    this.rig.add(this.cookie);
    this.scene.add(this.rig);
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h || 1;
    this.camera.updateProjectionMatrix();
  }

  /** Pointer position relative to the cookie, roughly -1..1 */
  setPointer(x: number, y: number) {
    this.pointer.x = Math.max(-1, Math.min(1, x));
    this.pointer.y = Math.max(-1, Math.min(1, y));
  }

  start() {
    if (this.reduced) return this.render();
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.tick(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private setBite(p: number) {
    for (const m of this.parts) m.morphTargetInfluences![0] = p;
  }

  /** Shows the cookie already bitten, for a visitor who accepted before */
  bitten() {
    this.setBite(1);
  }

  /** Chomp: the bite closes in a blink and crumbs fall. Returns how long the moment lasts (ms). */
  bite() {
    if (this.reduced) {
      this.setBite(1);
      this.render();
      return 0;
    }
    this.biteAt = this.time;
    // Crumbs burst from the bite, in cookie space, then fall in world space
    const mouth = new THREE.Vector3(Math.cos(BITE_ANGLE) * 0.85, 0.05, Math.sin(BITE_ANGLE) * 0.85);
    this.cookie.updateWorldMatrix(true, false);
    const origin = mouth.applyMatrix4(this.cookie.matrixWorld);
    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(this.crumbGeo, this.crumbMat);
      mesh.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.3));
      mesh.scale.setScalar(0.6 + Math.random() * 0.9);
      this.scene.add(mesh);
      this.crumbs.push({
        mesh,
        v: new THREE.Vector3((Math.random() - 0.3) * 2.2, 1 + Math.random() * 1.6, (Math.random() - 0.5) * 1.5),
        spin: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
      });
    }
    return 900;
  }

  /** Sag, then sink out of view. Returns how long it takes (ms). */
  drop() {
    if (this.reduced) return 0;
    this.dropAt = this.time;
    return 750;
  }

  private tick(dt: number) {
    this.time += dt;
    const t = this.time;

    // Float, turn and lean toward the pointer
    this.lean.x = damp(this.lean.x, this.pointer.x, 6, dt);
    this.lean.y = damp(this.lean.y, this.pointer.y, 6, dt);
    this.rig.position.y = Math.sin(t * 1.7) * 0.12;
    this.rig.rotation.z = -this.lean.x * 0.35 + Math.sin(t * 1.1) * 0.04;
    this.rig.rotation.x = this.lean.y * 0.3;
    this.cookie.rotation.y += dt * 0.55;

    // The bite: a snap closed with a little squash
    if (this.biteAt >= 0) {
      this.setBite(clamp01((t - this.biteAt) / 0.12));
      const squash = Math.sin(clamp01((t - this.biteAt) / 0.35) * Math.PI) * 0.12;
      this.rig.scale.set(1 + squash, 1 - squash, 1 + squash);
    }
    for (const c of this.crumbs) {
      c.v.y -= 7 * dt;
      c.mesh.position.addScaledVector(c.v, dt);
      c.mesh.rotation.x += c.spin.x * dt;
      c.mesh.rotation.y += c.spin.y * dt;
    }

    // The sad version: droop, then fall
    if (this.dropAt >= 0) {
      const p = t - this.dropAt;
      this.rig.rotation.z += smooth(p / 0.25) * 0.5;
      this.rig.position.y -= smooth((p - 0.15) / 0.6) * 4.5;
    }
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    for (const c of this.crumbs) this.scene.remove(c.mesh);
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
  }
}
