import type * as THREE from "three";

export type Frame = {
  time: number;
  dt: number;
  /** 0..1, eased: how hard the calls to action are being hovered */
  excite: number;
  /** Smoothed pointer, -1..1 on both axes */
  pointer: THREE.Vector2;
  /** 0..1, decays: how fast the pointer is moving */
  pointerSpeed: number;
};

export type HeroObject = {
  root: THREE.Object3D;
  /** Bounding radius in local units; the scene scales the object so this stays on screen */
  radius: number;
  update(frame: Frame): void;
  dispose(): void;
  /** Loader intro: how far the page has loaded, 0..1 */
  intro?(progress: number): void;
  /** Loader finished: end the intro with a flourish */
  burst?(): void;
};

/** Fired on window whenever the particles start forming a new shape. */
export const SHAPE_EVENT = "hero:shape";
/** `word` is the hero word the shape illustrates: 0 research, 1 design, 2 build */
export type ShapeEventDetail = { id: string; word: number | null };
