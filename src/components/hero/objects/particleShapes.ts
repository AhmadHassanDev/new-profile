import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { createMarkGeometry } from "./logoMark";

// Each generator fills `count` points (xyz) for one dense, volumetric particle formation.
// Sizes don't matter: formations are normalised to a common radius afterwards.

type Point = [number, number, number];
const TAU = Math.PI * 2;
const rand = (a = -1, b = 1) => a + Math.random() * (b - a);
const gauss = () => Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(TAU * Math.random());

function fill(count: number, pick: () => Point) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) out.set(pick(), i * 3);
  return out;
}

function rotate(points: Float32Array, x: number, y: number, z: number) {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x, y, z));
  const v = new THREE.Vector3();
  for (let i = 0; i < points.length; i += 3) v.fromArray(points, i).applyMatrix4(m).toArray(points, i);
  return points;
}

/** Weighted choice between sub-generators. */
function mix(count: number, parts: [number, () => Point][]) {
  const total = parts.reduce((s, [w]) => s + w, 0);
  return fill(count, () => {
    let r = Math.random() * total;
    for (const [w, gen] of parts) if ((r -= w) <= 0) return gen();
    return parts[0][1]();
  });
}

function sampleMesh(geometry: THREE.BufferGeometry, count: number) {
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
  const v = new THREE.Vector3();
  const out = fill(count, () => {
    sampler.sample(v);
    return [v.x, v.y, v.z];
  });
  geometry.dispose();
  return out;
}

/** A barred spiral galaxy: glowing bulge, four dusty arms and a scatter of halo stars. */
export function galaxy(count: number) {
  const points = mix(count, [
    [16, () => [gauss() * 0.32, gauss() * 0.14, gauss() * 0.32]],
    [74, () => {
      const arm = Math.floor(Math.random() * 4);
      const r = 0.25 + Math.pow(Math.random(), 0.8) * 2.3;
      const a = arm * (TAU / 4) + Math.log(r + 0.2) * 2.6 + gauss() * (0.12 + 0.08 / r);
      const spread = 0.06 + r * 0.05;
      return [Math.cos(a) * r + gauss() * spread, gauss() * 0.06 * (1.6 - r / 2.6), Math.sin(a) * r + gauss() * spread];
    }],
    [10, () => {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(0.6 + Math.random() * 2);
      return [v.x, v.y * 0.35, v.z];
    }],
  ]);
  return rotate(points, 1.05, 0, -0.42);
}

/** A 3D superformula: an organic, many-petalled crystal. */
export function supershape(count: number) {
  const r = (a: number, m: number, n1: number, n2: number, n3: number) =>
    Math.pow(Math.pow(Math.abs(Math.cos((m * a) / 4)), n2) + Math.pow(Math.abs(Math.sin((m * a) / 4)), n3), -1 / n1);
  return fill(count, () => {
    const theta = rand(-Math.PI, Math.PI);
    // Area-weighted latitude so the poles aren't over-dense
    const phi = Math.asin(rand(-1, 1));
    const r1 = r(theta, 7, 0.2, 1.7, 1.7);
    const r2 = r(phi, 7, 0.2, 1.7, 1.7);
    // Mostly surface, with some volume beneath it for depth
    const shell = Math.random() < 0.8 ? 1 + gauss() * 0.01 : 0.55 + Math.random() * 0.45;
    return [r1 * Math.cos(theta) * r2 * Math.cos(phi) * shell, r2 * Math.sin(phi) * shell, r1 * Math.sin(theta) * r2 * Math.cos(phi) * shell];
  });
}

/** A gyroid minimal surface carved into a ball: the lattice inside bone and butterfly wings. */
export function gyroid(count: number) {
  const k = 2 * Math.PI * 0.95;
  const v = new THREE.Vector3();
  return fill(count, () => {
    for (;;) {
      v.randomDirection().multiplyScalar(Math.cbrt(Math.random()));
      const [x, y, z] = [v.x * k, v.y * k, v.z * k];
      const g = Math.sin(x) * Math.cos(y) + Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(x);
      if (Math.abs(g) < 0.06) return [v.x, v.y, v.z];
    }
  });
}

/** The logo mark, sampled over its bevelled surface. */
export function mark(count: number) {
  return sampleMesh(createMarkGeometry(2.9, 14), count);
}




