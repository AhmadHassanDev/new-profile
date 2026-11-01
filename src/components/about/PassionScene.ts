import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type PassionObject = "controller" | "pencil" | "ball" | "sprout";

const GRAPHITE = "#0f0f14";
const PEARL = "#f1f1f4";

/** Glossy clay: soft and matte up close, with a clear coat that catches the room's light */
const clay = (color: THREE.ColorRepresentation, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.22, ...extra });

/** Extrudes a flat outline into a thick, softly bevelled piece, smooth across the bevel but crisp elsewhere */
function slab(shape: THREE.Shape, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 10,
    curveSegments: 64,
  });
  geometry.center();
  return toCreasedNormals(geometry, 0.7);
}

/** Gaming: a controller, d-pad and face buttons in the site's colours */
function controller() {
  const group = new THREE.Group();
  const outline = new THREE.Shape();
  outline.moveTo(0, 0.52);
  outline.lineTo(0.62, 0.52);
  outline.bezierCurveTo(1.0, 0.56, 1.12, 0.3, 1.18, 0);
  outline.bezierCurveTo(1.26, -0.4, 1.3, -0.8, 1.04, -0.82);
  outline.bezierCurveTo(0.84, -0.84, 0.72, -0.5, 0.52, -0.36);
  outline.quadraticCurveTo(0, -0.26, -0.52, -0.36);
  outline.bezierCurveTo(-0.72, -0.5, -0.84, -0.84, -1.04, -0.82);
  outline.bezierCurveTo(-1.3, -0.8, -1.26, -0.4, -1.18, 0);
  outline.bezierCurveTo(-1.12, 0.3, -1.0, 0.56, -0.62, 0.52);
  outline.closePath();
  group.add(new THREE.Mesh(slab(outline, 0.3, 0.14), clay(GRAPHITE, { roughness: 0.5, clearcoat: 0.35, envMapIntensity: 0.3 })));
  const face = 0.29;

  const pad = clay("#2c2c36");
  for (const angle of [0, Math.PI / 2]) {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.14, 0.1, 4, 0.04), pad);
    arm.position.set(-0.68, 0.1, face);
    arm.rotation.z = angle;
    group.add(arm);
  }

  const buttons: [number, number, string][] = [
    [0, 0.15, "#09c7fb"],
    [0.15, 0, "#f64f59"],
    [0, -0.15, PEARL],
    [-0.15, 0, "#c471ed"],
  ];
  for (const [x, y, color] of buttons) {
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 16), clay(color, { roughness: 0.3 }));
    button.position.set(0.68 + x, 0.1 + y, face);
    button.scale.z = 0.6;
    group.add(button);
  }

  const stick = clay("#33333f", { roughness: 0.55, clearcoat: 0.2 });
  for (const x of [-0.3, 0.3]) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 48), clay("#101015"));
    base.rotation.x = Math.PI / 2;
    base.position.set(x, -0.18, face);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.12, 48), stick);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(x, -0.18, face + 0.08);
    group.add(base, cap);
  }

  const light = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.06, 0.04, 4, 0.025), clay("#09c7fb", { roughness: 0.25 }));
  light.position.set(0, 0.34, face);
  group.add(light);

  group.rotation.set(-0.42, 0, 0);
  return group;
}

/** Design: the vector pen nib, drawing a bezier path with its anchors and handle */
function pencil() {
  const group = new THREE.Group();

  const outline = new THREE.Shape();
  outline.moveTo(0, -1.0);
  outline.quadraticCurveTo(0.42, -0.55, 0.52, -0.1);
  outline.quadraticCurveTo(0.6, 0.12, 0.42, 0.34);
  outline.lineTo(0.42, 0.6);
  outline.lineTo(-0.42, 0.6);
  outline.lineTo(-0.42, 0.34);
  outline.quadraticCurveTo(-0.6, 0.12, -0.52, -0.1);
  outline.quadraticCurveTo(-0.42, -0.55, 0, -1.0);
  const eye = new THREE.Path();
  eye.absarc(0, -0.12, 0.11, 0, Math.PI * 2, true);
  const slit = new THREE.Path();
  slit.moveTo(-0.022, -0.86);
  slit.lineTo(-0.022, -0.26);
  slit.lineTo(0.022, -0.26);
  slit.lineTo(0.022, -0.86);
  slit.closePath();
  outline.holes.push(eye, slit);
  const nib = new THREE.Mesh(slab(outline, 0.16, 0.08), clay(PEARL));

  const collar = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.26, 0.42, 6, 0.1), clay(GRAPHITE));
  collar.position.y = 0.74;

  const pen = new THREE.Group();
  pen.add(nib, collar);
  pen.rotation.z = -0.5;
  pen.position.set(0.28, 0.14, 0.2);
  group.add(pen);

  // The path it's drawing, with an anchor at each end and the handle pulled out of one
  const ink = clay(GRAPHITE, { roughness: 0.3 });
  const from = new THREE.Vector3(-1.25, -0.55, -0.2);
  const to = new THREE.Vector3(0.0, -0.92, 0.1);
  const handle = new THREE.Vector3(-0.85, 0.55, -0.1);
  const curve = new THREE.CubicBezierCurve3(from, handle, new THREE.Vector3(-0.3, -1.2, 0.1), to);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.032, 16), ink));
  for (const point of [from, to]) {
    const anchor = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.16, 0.16, 4, 0.03), clay(PEARL));
    anchor.position.copy(point);
    anchor.rotation.z = Math.PI / 4;
    group.add(anchor);
  }
  const arm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(from, handle), 1, 0.014, 8), ink);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 16), clay(GRAPHITE));
  knob.position.copy(handle);
  group.add(arm, knob);

  group.rotation.set(0.15, -0.35, 0);
  return group;
}

/** Arsenal: a classic black-and-white football, its pentagons drawn on the sphere (no seams) */
function ball() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const corners = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
  // Each pentagon points a corner at a neighbouring one, as on a real ball
  const towards = corners.map((v) => {
    const neighbour = corners.filter((w) => w !== v).reduce((a, b) => (v.dot(a) > v.dot(b) ? a : b));
    return neighbour.clone().addScaledVector(v, -v.dot(neighbour)).normalize();
  });

  const material = clay(PEARL, { roughness: 0.48, clearcoat: 0.5 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCorners = { value: corners };
    shader.uniforms.uTowards = { value: towards };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBallNormal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBallNormal = normal;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBallNormal;\nuniform vec3 uCorners[12];\nuniform vec3 uTowards[12];")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 n = normalize(vBallNormal);
        float best = -2.0;
        vec3 v = uCorners[0];
        vec3 t = uTowards[0];
        for (int i = 0; i < 12; i++) {
          float d = dot(n, uCorners[i]);
          if (d > best) { best = d; v = uCorners[i]; t = uTowards[i]; }
        }
        vec3 p = n - v * best;
        float turn = atan(dot(p, cross(v, t)), dot(p, t));
        float side = 6.2831853 / 5.0;
        float edge = acos(clamp(best, -1.0, 1.0)) * cos(mod(turn, side) - side * 0.5) - 0.3;
        float w = fwidth(edge);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035, 0.035, 0.045), 1.0 - smoothstep(-w, w, edge));`,
      );
  };
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.98, 96, 64), material));
  group.rotation.set(0.4, 0.3, 0);
  return group;
}

/** Growth: a sprout coming up in a little pot */
function sprout() {
  const group = new THREE.Group();
  const profile = [
    [0.001, -0.62], [0.34, -0.62], [0.38, -0.58], [0.47, 0.0], [0.53, 0.02],
    [0.56, 0.1], [0.54, 0.16], [0.48, 0.17], [0.46, 0.08],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  group.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 96), clay(GRAPHITE)));
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.47, 64), clay("#2a211c", { roughness: 0.9, clearcoat: 0 }));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 0.1;
  group.add(soil);

  const green = clay("#3fd29a", { roughness: 0.36 });
  const stem = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(0.05, 0.45, 0),
    new THREE.Vector3(-0.03, 0.8, 0.02),
    new THREE.Vector3(0.02, 1.02, 0),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(stem, 64, 0.04, 16), green));

  const leaf = new THREE.SphereGeometry(1, 48, 24);
  leaf.translate(1, 0, 0);
  const leaves: [number, number, number, number][] = [
    // height, length, spin around the stem, lift
    [1.0, 0.56, 0.2, 0.5],
    [1.0, 0.5, Math.PI + 0.2, 0.55],
    [0.6, 0.36, -1.4, 0.3],
  ];
  for (const [y, length, spin, lift] of leaves) {
    const mesh = new THREE.Mesh(leaf, green);
    mesh.scale.set(length / 2, 0.045, length / 3.2);
    // Rolled along its length so it shows its face, not its edge
    mesh.rotation.x = 0.9;
    const tilt = new THREE.Group();
    tilt.rotation.z = lift;
    tilt.add(mesh);
    const holder = new THREE.Group();
    holder.position.y = y;
    holder.rotation.y = spin;
    holder.add(tilt);
    group.add(holder);
  }
  group.position.y = -0.2;
  group.rotation.set(0.35, 0, 0);
  const wrapper = new THREE.Group();
  wrapper.add(group);
  return wrapper;
}

const BUILD: Record<PassionObject, () => THREE.Group> = { controller, pencil, ball, sprout };
// How each one moves while it's out: the ball spins, the rest sway
const SPIN: Record<PassionObject, number> = { controller: 0, pencil: 0, ball: 1.4, sprout: 0.5 };

/**
 * One passion's 3D object. It hides below its card until `show(true)`, then springs up out of it,
 * turning in and leaning towards the pointer, and sinks back on `show(false)`. It only draws while
 * it's moving.
 */
export class PassionScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  private pivot = new THREE.Group();
  private object: THREE.Group;
  private spin: number;
  private timer = new THREE.Timer();
  private frame = 0;
  private shown = false;
  private pop = 0;
  private popSpeed = 0;
  private pointer = new THREE.Vector2();
  private lean = new THREE.Vector2();
  private turned = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    kind: PassionObject,
    private reducedMotion: boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.max(1.5, Math.min(window.devicePixelRatio, 2)));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    const key = new THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(2, 4, 5);
    const rim = new THREE.DirectionalLight("#c471ed", 1.2);
    rim.position.set(-4, 1, -3);
    this.scene.add(key, rim);

    this.camera.position.set(0, 0, 7.4);
    this.object = BUILD[kind]();
    this.spin = SPIN[kind];
    this.pivot.add(this.object);
    this.pivot.visible = false;
    this.scene.add(this.pivot);
    this.resize();
    this.renderer.compile(this.scene, this.camera);
  }

  resize() {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.wake();
  }

  show(on: boolean) {
    this.shown = on;
    if (this.reducedMotion) this.pop = on ? 1 : 0;
    this.wake();
  }

  /** Pointer in the card's own -1..1 space */
  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
    this.wake();
  }

  private wake() {
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (time: number) => {
    this.frame = 0;
    this.timer.update(time);
    const dt = Math.min(this.timer.getDelta(), 1 / 30);
    const elapsed = this.timer.getElapsed();
    const target = this.shown ? 1 : 0;

    if (!this.reducedMotion) {
      // Springy on the way up (it overshoots and settles), quick and clean on the way down
      const [stiffness, damping] = this.shown ? [170, 13] : [260, 30];
      this.popSpeed += ((target - this.pop) * stiffness - this.popSpeed * damping) * dt;
      this.pop += this.popSpeed * dt;
      this.lean.lerp(this.pointer, 1 - Math.exp(-dt * 6));
      if (this.shown) this.turned += dt * this.spin;
    }

    const pop = Math.max(0, this.pop);
    this.pivot.visible = pop > 0.002;
    this.pivot.scale.setScalar(Math.max(0.0001, pop));
    this.pivot.position.y = -2.2 * (1 - pop) + (this.reducedMotion ? 0 : Math.sin(elapsed * 1.6) * 0.06);
    // Comes up turning in, then leans towards the pointer
    this.pivot.rotation.set(
      -this.lean.y * 0.35,
      (1 - pop) * -2.2 + this.lean.x * 0.55 + this.turned + (this.reducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.12),
      (1 - pop) * 0.6,
    );
    this.renderer.render(this.scene, this.camera);

    const settled = !this.shown && Math.abs(this.pop) < 0.002 && Math.abs(this.popSpeed) < 0.01;
    if (settled) {
      this.pop = 0;
      this.popSpeed = 0;
      this.pivot.visible = false;
      this.renderer.render(this.scene, this.camera);
    } else if (!this.reducedMotion) {
      this.wake();
    }
  };

  dispose() {
    cancelAnimationFrame(this.frame);
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        for (const material of [object.material].flat()) material.dispose();
      }
    });
    this.scene.environment?.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    // Hands the GPU context back now; browsers only allow a handful per tab
    this.renderer.forceContextLoss();
  }
}
