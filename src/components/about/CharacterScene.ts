import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * A premade cartoon character, used as it comes: its own materials, lit like a studio portrait with the
 * site's spectrum catching its edges. The head moves on its own (on its rig's own neck and head bones,
 * or, for a model without a rig, by hanging every piece above the collar from a neck joint); the eyes
 * blink and the brows lift.
 *
 * It eases into view and notices you, follows the cursor on springs, perks up when hovered, and has a
 * few tricks for clicks: a wink, a laugh, a double take and a nod.
 */

type Character = {
  model: string;
  /** Pieces by name (as three.js cleans them): the eyes, and the brows */
  eyes: string[];
  brows: string[];
  /**
   * How the head moves: on the rig's own neck and head bones, or (no rig) by hanging every piece centred
   * above `neck` (a share of the model's height) from a joint there
   */
  head: { bones: [string, string] } | { neck: number };
  /**
   * The camera's view: how tall, and where its bottom edge sits (shares of the model's height). The circle
   * fills the lower 80% of the view, so its top sits at `bottom + height * 0.8`: just above the head, the
   * whole head sits inside it, as the bust does
   */
  view: { height: number; bottom: number };
  /** A turn about the vertical, for a model built facing away from the camera */
  turn?: number;
};
export const CHARACTERS = {
  father: { model: "/about/character.glb", eyes: ["Sphere003", "Sphere004"], brows: ["Plane046"], head: { neck: 0.5 }, view: { height: 0.86, bottom: 0.32 } },
  student: { model: "/about/student.glb", eyes: ["Sphere"], brows: ["Cube"], head: { bones: ["Bone018", "Bone019"] }, view: { height: 0.76, bottom: 0.42 } },
} satisfies Record<string, Character>;
const BROW_LIFT = 0.012;
const UP = new THREE.Vector3(0, 1, 0);
const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);

type Reaction = "wink" | "laugh" | "doubletake" | "nod";
const REACTIONS: Reaction[] = ["wink", "laugh", "doubletake", "nod"];
const DURATION: Record<Reaction, number> = { wink: 1.1, laugh: 1.6, doubletake: 1.5, nod: 1.1 };
const INTRO = 2;

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
// Rises quickly, holds, then lets go over the last part
const envelope = (p: number, attack = 0.18, release = 0.25) => Math.min(smooth(p / attack), 1 - smooth((p - 1 + release) / release));

/** A damped spring: it overshoots a touch and settles, which reads as weight rather than easing. */
class Spring {
  value = 0;
  velocity = 0;
  constructor(
    private stiffness: number,
    private damping: number,
  ) {}
  step(target: number, dt: number) {
    this.velocity += ((target - this.value) * this.stiffness - this.velocity * this.damping) * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}

export class CharacterScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  private timer = new THREE.Timer();
  private raycaster = new THREE.Raycaster();
  private running = false;
  private disposed = false;
  private time = 0;

  // rig (rises, bobs, leans; origin at the base) → fit (one unit tall) → neck → head pieces
  private rig = new THREE.Group();
  private fit = new THREE.Group();
  private neck = new THREE.Group();
  private eyes: THREE.Object3D[] = [];
  private brows: { mesh: THREE.Object3D; rest: THREE.Vector3; up: THREE.Vector3 }[] = [];
  private bones: { bone: THREE.Bone; rest: THREE.Quaternion }[] = [];
  private hitbox!: THREE.Mesh;
  private loaded = false;

  // Inputs
  private pointer = new THREE.Vector2(0, 0);
  private lastPointer = -10;
  private hovered = false;
  private scroll = 0;
  private scrollVelocity = 0;

  // Motion
  private lookX = new Spring(45, 8.5);
  private lookY = new Spring(45, 8.5);
  private hover = new Spring(120, 14);
  private lean = 0;
  private glance = new THREE.Vector2();
  private nextGlance = 0;
  private blink = 1;
  private nextBlink = INTRO + 1.5;
  private micro = { at: INTRO + 6 };

  private reaction: Reaction | null = null;
  private reactionTime = 0;
  private nextReaction = 0;

  /** Resolves once the model has loaded and is in place. */
  ready: Promise<void>;

  constructor(
    canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
    private character: Character = CHARACTERS.father,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    if (reducedMotion) this.time = INTRO;

    // Soft studio light, with the spectrum catching the edges from behind
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.8;
    pmrem.dispose();
    const key = new THREE.DirectionalLight("#fff3e6", 2.2);
    key.position.set(-2, 3, 4);
    const cyan = new THREE.DirectionalLight("#09c7fb", 2.2);
    cyan.position.set(-4, 1.5, -3);
    const violet = new THREE.DirectionalLight("#c471ed", 2.4);
    violet.position.set(4, 2, -3);
    this.scene.add(key, cyan, violet, this.rig);
    this.rig.add(this.fit);

    this.ready = this.load();
  }

  private async load() {
    const { model: url, eyes, brows, head, turn } = this.character;
    const gltf = await new GLTFLoader().loadAsync(url);
    if (this.disposed) return;
    const model = gltf.scene;
    model.rotation.y = turn ?? 0;
    this.fit.add(model);
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) o.frustumCulled = false;
    });

    // Stand it one unit tall, base on the ground, centred
    this.rig.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1 / size.y;
    this.fit.scale.setScalar(scale);
    this.fit.position.set(-((box.min.x + box.max.x) / 2) * scale, -box.min.y * scale, -((box.min.z + box.max.z) / 2) * scale);
    this.rig.updateMatrixWorld(true);

    if ("bones" in head) {
      // The rig's own neck and head bones carry the head (and everything parented to it)
      for (const name of head.bones) {
        const bone = model.getObjectByName(name);
        if (bone instanceof THREE.Bone) this.bones.push({ bone, rest: bone.quaternion.clone() });
      }
    } else {
      // No rig: a neck joint in the middle of the neck, with every piece centred above it hanging from it
      this.neck.position.copy(this.fit.worldToLocal(new THREE.Vector3(0, head.neck, 0.03)));
      this.fit.add(this.neck);
      this.rig.updateMatrixWorld(true);
      for (const piece of [...model.children]) {
        const center = new THREE.Box3().setFromObject(piece).getCenter(new THREE.Vector3());
        if (center.y > head.neck) this.neck.attach(piece);
      }
    }
    this.rig.updateMatrixWorld(true);

    // Each eye squashes to blink inside a little pivot at its centre, upright with the character, so it
    // closes straight down whatever way the rig's pieces are oriented
    for (const name of eyes) {
      const eye = model.getObjectByName(name);
      if (!eye?.parent) continue;
      const pivot = new THREE.Group();
      eye.parent.add(pivot);
      pivot.position.copy(eye.parent.worldToLocal(new THREE.Box3().setFromObject(eye).getCenter(new THREE.Vector3())));
      pivot.quaternion.copy(eye.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(this.fit.getWorldQuaternion(new THREE.Quaternion())));
      pivot.updateMatrixWorld(true);
      pivot.attach(eye);
      this.eyes.push(pivot);
    }
    this.eyes.sort((a, b) => a.getWorldPosition(new THREE.Vector3()).x - b.getWorldPosition(new THREE.Vector3()).x);
    // The brows lift straight up the face: "up" worked out in each brow's own parent's space
    for (const name of brows) {
      const brow = model.getObjectByName(name);
      if (!brow?.parent) continue;
      const at = brow.getWorldPosition(new THREE.Vector3());
      const up = brow.parent.worldToLocal(at.clone().add(new THREE.Vector3(0, BROW_LIFT, 0))).sub(brow.parent.worldToLocal(at.clone()));
      this.brows.push({ mesh: brow, rest: brow.position.clone(), up });
    }

    // A cheap stand-in for clicks and hovers: the head and shoulders
    const { height, bottom } = this.character.view;
    this.hitbox = new THREE.Mesh(new THREE.BoxGeometry(height * 0.95, height, 0.5), new THREE.MeshBasicMaterial({ visible: false }));
    this.hitbox.position.y = bottom + height / 2;
    this.rig.add(this.hitbox);

    this.loaded = true;
    if (!this.running) this.render(0);
  }

  /** Turn a bone by `q`, given in the character's own space, on top of its current pose. */
  private rotate(bone: THREE.Bone, q: THREE.Quaternion) {
    const frame = this.fit.getWorldQuaternion(new THREE.Quaternion()).invert();
    const parent = frame.multiply(bone.parent!.getWorldQuaternion(new THREE.Quaternion()));
    bone.quaternion.premultiply(parent.clone().invert().multiply(q).multiply(parent));
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Framed for its circle (see `.avatar-frame`): the shirt runs into the circle's curve, the hair rises
    // above its top
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const view = this.character.view;
    const middle = view.bottom + view.height / 2;
    this.camera.position.set(0, middle, view.height / 2 / tan);
    this.camera.lookAt(0, middle, 0);
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  /** The cursor, in the canvas's own -1..1 coordinates (it can be outside the canvas). */
  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
    this.lastPointer = this.time;
  }

  /** Whether the cursor is over the character: it perks up. */
  setHover(on: boolean) {
    this.hovered = on;
  }

  /** How far down the page (0..1) and how fast it's moving (px per frame, signed). */
  setScroll(progress: number, velocity: number) {
    this.scroll = progress;
    this.scrollVelocity = velocity;
  }

  /** Whether a point (canvas -1..1 coordinates) lands on the character. */
  hit(x: number, y: number) {
    if (!this.loaded) return false;
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return this.raycaster.intersectObject(this.hitbox).length > 0;
  }

  /** Do the next trick: a wink, a laugh, a double take, or a nod. */
  react(which?: Reaction) {
    if (which && !REACTIONS.includes(which)) return;
    if (this.time < INTRO) return;
    if (this.reaction && this.reactionTime / DURATION[this.reaction] < 0.7) return;
    this.reaction = which ?? REACTIONS[this.nextReaction++ % REACTIONS.length];
    this.reactionTime = 0;
  }

  start() {
    if (this.running) return;
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
    if (!this.loaded) return;
    const t = (this.time += this.reducedMotion ? 0 : dt);

    // ---- Where to look: the cursor, or a wandering glance once it's been still for a while
    const head = this.neck.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.2, 0)).project(this.camera);
    let targetX = THREE.MathUtils.clamp(this.pointer.x - head.x, -1.2, 1.2);
    let targetY = THREE.MathUtils.clamp(this.pointer.y - head.y, -1, 1);
    if (t - this.lastPointer > 3.5) {
      if (t > this.nextGlance) {
        this.glance.set((Math.random() - 0.5) * 1.4, (Math.random() - 0.4) * 0.6);
        this.nextGlance = t + 1.8 + Math.random() * 2.4;
      }
      targetX = this.glance.x;
      targetY = this.glance.y;
    }
    // While it's arriving it looks straight ahead, then finds you
    const attention = smooth((t - 1.1) / 0.8);
    const lookX = this.lookX.step(targetX * attention, dt);
    const lookY = this.lookY.step(targetY * attention, dt);
    const hover = this.hover.step(this.hovered && t > INTRO ? 1 : 0, dt);

    // ---- Scroll: it leans into the motion and glances down at the page as you go
    const speed = THREE.MathUtils.clamp(this.scrollVelocity / 40, -1, 1);
    this.lean = damp(this.lean, speed, 4, dt);
    this.scrollVelocity = damp(this.scrollVelocity, 0, 6, dt);

    // ---- Blinking, now and then, sometimes twice
    if (t > this.nextBlink) {
      this.blink = 0;
      this.nextBlink = t + (Math.random() < 0.2 ? 0.25 : 2.2 + Math.random() * 3.5);
    }
    this.blink = damp(this.blink, 1, 15, dt);

    // ---- The resting pose: breathing, the head never quite still
    const breathe = Math.sin(t * 2);
    let rigY = 0;
    let rigPitch = this.lean * 0.06 - lookY * 0.06 + hover * 0.04;
    const rigYaw = lookX * 0.25;
    let squash = 1 + breathe * 0.006;
    let headPitch = THREE.MathUtils.clamp(-lookY * 0.25, -0.2, 0.22) + this.scroll * 0.12;
    let headYaw = THREE.MathUtils.clamp(lookX * 0.4, -0.4, 0.4);
    let headRoll = Math.sin(t * 0.55) * 0.035;
    const open = [1, 1];
    const brow = [hover * 0.4, hover * 0.4];

    // ---- Arrival: in place, it grows in from a touch smaller as it fades in, turning from three-quarter
    // view to face you; then a blink as it settles, and a lift of the brows, as if it has just noticed you
    let rigTurn = 0;
    let arrive = 1;
    if (t < INTRO) {
      arrive = 0.92 + 0.08 * easeOutCubic(t / 1.1);
      rigTurn = 0.45 * (1 - easeOutCubic(t / 1.3));
      const settle = envelope((t - 0.75) / 0.22, 0.4, 0.6);
      open[0] = open[1] = 1 - settle;
      const hello = envelope((t - 1.1) / 0.8, 0.25, 0.4);
      brow[0] += hello * 0.9;
      brow[1] += hello * 0.9;
    }

    // ---- Now and then, a little flash of the brows
    if (t > this.micro.at) {
      const p = (t - this.micro.at) / 0.6;
      const e = envelope(p, 0.25, 0.4);
      brow[0] += e * 0.6;
      brow[1] += e * 0.6;
      if (p >= 1) this.micro = { at: t + 5 + Math.random() * 5 };
    }

    // ---- The trick in progress
    if (this.reaction) {
      this.reactionTime += dt;
      const p = this.reactionTime / DURATION[this.reaction];
      const T = this.reactionTime;
      if (p >= 1) this.reaction = null;
      else if (this.reaction === "wink") {
        // The right eye shuts, the brows lift, the head tips toward the wink
        const e = envelope(p, 0.15, 0.35);
        open[1] = 1 - e;
        brow[0] += e * 0.9;
        headRoll -= e * 0.16;
      } else if (this.reaction === "laugh") {
        // Head back, quick chuckles, eyes squeezed
        const e = envelope(p, 0.1, 0.35);
        const chuckle = Math.sin(T * 19) * e * (1 - p * 0.6);
        headPitch -= e * 0.12 + chuckle * 0.04;
        rigY += Math.abs(chuckle) * 0.012;
        squash += chuckle * 0.01;
        open[0] = open[1] = 1 - e * 0.6;
        brow[0] += e * 0.3;
        brow[1] += e * 0.3;
      } else if (this.reaction === "doubletake") {
        // A glance off to the side... then a snap back, brows up, pulling back a touch
        const away = smooth(p / 0.1) * (1 - smooth((p - 0.2) / 0.08));
        headYaw += away * 0.5;
        const e = p > 0.28 ? envelope((p - 0.28) / 0.72, 0.08, 0.4) : 0;
        brow[0] += e * 1.3;
        brow[1] += e * 1.3;
        rigPitch -= e * 0.08;
        rigY += e * 0.02;
      } else {
        // A friendly double nod with a little tilt
        const e = envelope(p, 0.1, 0.3);
        headPitch += Math.sin(T * 11) * 0.15 * e;
        headRoll += e * 0.1;
      }
    }

    // ---- Pose it
    const lean = (1 + hover * 0.02) * arrive;
    this.rig.position.y = rigY;
    this.rig.scale.set(lean / Math.sqrt(squash), lean * squash, lean / Math.sqrt(squash));
    this.rig.rotation.set(rigPitch, rigYaw + rigTurn, 0);
    if (this.bones.length) {
      // On the rig: the neck takes some of the turn, the head the rest, each in the character's own space
      for (const { bone, rest } of this.bones) bone.quaternion.copy(rest);
      const turn = (share: number) => new THREE.Quaternion().setFromAxisAngle(UP, headYaw * share).multiply(new THREE.Quaternion().setFromAxisAngle(X, headPitch * share)).multiply(new THREE.Quaternion().setFromAxisAngle(Z, headRoll * share));
      this.bones.forEach(({ bone }, i) => this.rotate(bone, turn(i === 0 ? 0.4 : 0.6)));
    } else this.neck.rotation.set(headPitch, headYaw, headRoll);
    // One eye blinks as one: a single-mesh pair shares the first eye's openness
    for (const [i, eye] of this.eyes.entries()) eye.scale.y = Math.max(0.08, (open[i] ?? open[0]) * this.blink);
    const browLift = Math.max(...brow);
    for (const b of this.brows) b.mesh.position.copy(b.rest).addScaledVector(b.up, browLift);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      }
    });
    this.scene.environment?.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    // Hands the GPU context back now; browsers only allow a handful per tab
    this.renderer.forceContextLoss();
  }
}
