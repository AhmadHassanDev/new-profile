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

/**
 * An atom: a packed nucleus inside four orbits tilted to the corners of a tetrahedron, each carrying its electron.
 * Whichever way it turns, at least three orbits read as open ellipses, so it never flattens into a line.
 */
export function atom(count: number) {
  const v = new THREE.Vector3();
  const ball = (r: number): Point => {
    v.randomDirection().multiplyScalar(r * Math.cbrt(Math.random()));
    return [v.x, v.y, v.z];
  };
  // Nucleons: one in the middle, a dozen packed around it
  const nucleons = [[0, 0, 0] as Point].concat(
    Array.from({ length: 12 }, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / 12;
      const a = i * Math.PI * (3 - Math.sqrt(5));
      const r = Math.sqrt(1 - y * y);
      return [Math.cos(a) * r * 0.24, y * 0.24, Math.sin(a) * r * 0.24] as Point;
    }),
  );
  const orbits = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ].map(([x, y, z], i) => {
    const n = new THREE.Vector3(x, y, z).normalize();
    const u = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0.3)).normalize();
    const w = new THREE.Vector3().crossVectors(n, u);
    return { u, w, electron: i * 1.7 + 0.4 };
  });
  const onOrbit = (o: (typeof orbits)[number], a: number, r: number, spread: number): Point => {
    const p = o.u.clone().multiplyScalar(Math.cos(a) * r).addScaledVector(o.w, Math.sin(a) * r);
    return [p.x + gauss() * spread, p.y + gauss() * spread, p.z + gauss() * spread];
  };
  return mix(count, [
    [20, () => {
      const [x, y, z] = nucleons[Math.floor(Math.random() * nucleons.length)];
      const [dx, dy, dz] = ball(0.13);
      return [x + dx, y + dy, z + dz];
    }],
    [62, () => onOrbit(orbits[Math.floor(Math.random() * 4)], rand(0, TAU), 1.9, 0.022)],
    [11, () => {
      const o = orbits[Math.floor(Math.random() * 4)];
      const [x, y, z] = onOrbit(o, o.electron, 1.9, 0);
      const [dx, dy, dz] = ball(0.11);
      return [x + dx, y + dy, z + dz];
    }],
    [7, () => {
      v.randomDirection().multiplyScalar(0.45 + Math.random() * 1.6);
      return [v.x, v.y, v.z];
    }],
  ]);
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




