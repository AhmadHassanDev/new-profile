import * as THREE from "three";
import { NOISE, SPECTRUM } from "../shaders";
import * as shapes from "./particleShapes";
import { SHAPE_EVENT, type HeroObject, type ShapeEventDetail } from "./types";

type ShapeDef = {
  id: string;
  build: (count: number) => Float32Array;
  /** Hold still and face the viewer so the shape reads */
  facing: boolean;
  /** Discipline colour to lean towards, or null for the full gradient */
  tint: string | null;
  /** Which hero word this shape illustrates: 0 research, 1 design, 2 build */
  word: number | null;
};

// The process, one shape per word in that word's colour, then the logo with all three lit.
const SHAPES: ShapeDef[] = [
  { id: "galaxy", build: shapes.galaxy, facing: true, tint: "#09c7fb", word: 0 },
  { id: "supershape", build: shapes.supershape, facing: false, tint: "#c471ed", word: 1 },
  { id: "gyroid", build: shapes.gyroid, facing: false, tint: "#f64f59", word: 2 },
  { id: "mark", build: shapes.mark, facing: true, tint: null, word: null },
];
const MARK = SHAPES.findIndex((s) => s.id === "mark");

const vertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uExcite;
uniform float uBurst;
uniform float uSize;
uniform float uPixelRatio;
uniform vec4 uTintFrom;
uniform vec4 uTintTo;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;
${NOISE}
${SPECTRUM}
void main() {
  float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.5 - aSeed * 0.5, 0.0, 1.0));
  vec3 p = mix(aFrom, aTo, m);
  float swirl = sin(m * 3.14159);
  vec3 q = p * 1.1 + uTime * 0.25;
  p += vec3(snoise(q), snoise(q + 17.0), snoise(q + 31.0)) * (0.02 + swirl * 0.35 + uExcite * 0.03);
  // The intro's finale: everything flung outward, the far-flung ones furthest.
  p += normalize(p + 0.0001) * uBurst * (0.6 + aSeed * aSeed * 3.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.5 + aSeed) * uPixelRatio / -mv.z;

  vec3 gradient = spectrum(p.y * 0.16 + p.x * 0.1 + uTime * 0.05 + aSeed * 0.08);
  vec4 tint = mix(uTintFrom, uTintTo, m);
  // Tinted shapes keep a sprinkle of the full gradient so they still sparkle.
  vColor = mix(gradient, tint.rgb, tint.a * step(0.25, aSeed));
  vAlpha = (0.5 + 0.5 * aSeed) * (1.0 + uBurst * 0.6);
}
`;

const fragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}
`;

// Every formation is centred and scaled to this radius, so none is bigger than the others.
const FORMATION_RADIUS = 2;
// Room for the noise that jostles particles while they travel.
const DRIFT = 0.3;

/**
 * Centre a formation and scale it so 99.5% of points sit inside FORMATION_RADIUS. Stragglers
 * are pulled in to the boundary, so a few outliers can't shrink the shape or leave the screen.
 */
function normalize(points: Float32Array) {
  const n = points.length / 3;
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  const box = new THREE.Box3();
  for (let i = 0; i < points.length; i += 3) box.expandByPoint(v.fromArray(points, i));
  box.getCenter(c);
  const lengths = new Float32Array(n);
  for (let i = 0; i < n; i++) lengths[i] = v.fromArray(points, i * 3).sub(c).length();
  const edge = lengths.slice().sort()[Math.floor(n * 0.995)];
  const k = FORMATION_RADIUS / edge;
  for (let i = 0; i < n; i++) {
    v.fromArray(points, i * 3).sub(c).multiplyScalar(k);
    if (lengths[i] > edge) v.setLength(FORMATION_RADIUS * (0.97 + Math.random() * 0.03));
    v.toArray(points, i * 3);
  }
  return points;
}

const tintOf = (shape: ShapeDef) => {
  if (!shape.tint) return new THREE.Vector4(1, 1, 1, 0);
  const c = new THREE.Color(shape.tint);
  return new THREE.Vector4(c.r, c.g, c.b, 0.9);
};

/**
 * With `intro`, the particles start as scattered dust and gather into the logo as the page loads
 * (driven by `intro(progress)`), then `burst()` flings them out into the first shape of the loop.
 */
export function createParticleMorph(
  compact: boolean,
  pixelRatio: number,
  palette: Record<string, THREE.IUniform>,
  intro = false,
): HeroObject {
  const count = compact ? 18000 : 36000;

  // Only the first formation is built up front; the rest are built in idle time.
  const formations: (Float32Array | null)[] = SHAPES.map(() => null);
  const formation = (i: number) => (formations[i] ??= normalize(SHAPES[i].build(count)));
  formation(intro ? MARK : 0);
  let idle = 0;
  const buildNext = () => {
    const i = formations.indexOf(null);
    if (i === -1) return;
    formation(i);
    idle = window.setTimeout(buildNext, 60);
  };
  idle = window.setTimeout(buildNext, 400);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  // Start as a loose cloud that condenses into the first shape (the intro's cloud is wider: dust).
  const cloud = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const spread = intro ? FORMATION_RADIUS * 2.2 : FORMATION_RADIUS;
  for (let i = 0; i < count; i++) p.randomDirection().multiplyScalar(spread * Math.cbrt(Math.random())).toArray(cloud, i * 3);
  const from = new THREE.BufferAttribute(cloud, 3);
  const to = new THREE.BufferAttribute(formation(intro ? MARK : 0).slice(), 3);
  geometry.setAttribute("aFrom", from);
  geometry.setAttribute("aTo", to);
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(count).map(() => Math.random()), 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uExcite: { value: 0 },
    uBurst: { value: 0 },
    uSize: { value: compact ? 30 : 27 },
    uPixelRatio: { value: pixelRatio },
    uTintFrom: { value: tintOf(SHAPES[intro ? MARK : 0]) },
    uTintTo: { value: tintOf(SHAPES[intro ? MARK : 0]) },
    ...palette,
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  const root = new THREE.Group();
  root.add(points);

  let target = intro ? MARK : 0;
  let resumeAfterMark = 0;
  let morph = 0;
  let hold = 3.2;
  let introProgress = intro ? 0 : -1; // -1 once the intro is over
  let burstAge = -1; // seconds since the burst, -1 when there isn't one

  const announce = () => {
    const s = SHAPES[target];
    window.dispatchEvent(new CustomEvent<ShapeEventDetail>(SHAPE_EVENT, { detail: { id: s.id, word: s.word } }));
  };

  const retarget = (next: number) => {
    from.array.set(formation(target));
    to.array.set(formation(next));
    from.needsUpdate = to.needsUpdate = true;
    uniforms.uTintFrom.value.copy(uniforms.uTintTo.value);
    uniforms.uTintTo.value.copy(tintOf(SHAPES[next]));
    target = next;
    morph = 0;
    hold = 3.2;
    announce();
  };

  if (!intro) announce();


  return {
    root,
    radius: FORMATION_RADIUS + DRIFT,
    intro(progress) {
      if (introProgress >= 0) introProgress = progress;
    },
    burst() {
      if (introProgress < 0) return;
      introProgress = -1;
      burstAge = 0;
      retarget(0);
    },
    update({ time, dt, excite, pointer }) {
      // Burst envelope: a quick shove outward, then a long settle while the next shape forms.
      if (burstAge >= 0) {
        burstAge += dt;
        const e = burstAge < 0.18 ? burstAge / 0.18 : Math.max(0, 1 - (burstAge - 0.18) / 1.3);
        uniforms.uBurst.value = Math.pow(e, 1.6) * 1.4;
        if (e === 0 && burstAge > 0.18) burstAge = -1;
      }

      // Hovering a call to action pulls the particles into the logo, then the story picks up again.
      const wantsMark = excite > 0.5;
      if (introProgress >= 0) {
        morph += (introProgress - morph) * Math.min(1, dt * 3);
      } else if (morph < 1) {
        morph = Math.min(1, morph + dt / 1.9);
      } else if (wantsMark && target !== MARK) {
        resumeAfterMark = target;
        retarget(MARK);
      } else if (!wantsMark && (hold -= dt) <= 0) {
        const next = target === MARK && resumeAfterMark !== MARK ? resumeAfterMark + 1 : target + 1;
        resumeAfterMark = MARK;
        retarget(next % SHAPES.length);
      }

      if (SHAPES[target].facing) {
        const facing = Math.round(points.rotation.y / (Math.PI * 2)) * Math.PI * 2 + Math.sin(time * 0.5) * 0.18 + pointer.x * 0.15;
        points.rotation.y += (facing - points.rotation.y) * Math.min(1, dt * 2.5);
      } else {
        points.rotation.y += dt * 0.22;
      }

      uniforms.uTime.value = time;
      uniforms.uMorph.value = morph;
      uniforms.uExcite.value = excite;
    },
    dispose() {
      window.clearTimeout(idle);
      geometry.dispose();
      material.dispose();
    },
  };
}
