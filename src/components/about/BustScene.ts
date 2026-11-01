import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * The 3D me as a sculpted bust, lit like a studio portrait with the site's spectrum catching its
 * edges. The model comes as separate, untextured parts, so each part gets its own clay colour and a
 * little procedural surface (pores, curls, cotton).
 * Everything above the collar hangs from a neck joint so the head moves on its own; the brows lift,
 * the mouth's smile is morphed live, and the eyes are painted in a shader, lids and all.
 *
 * It eases into view and notices you, follows the cursor on springs (eyes first, head after), perks up
 * when hovered, and has a few tricks for clicks: a wink, a laugh, a double take and a nod.
 */

const MODEL = "/about/bust.glb";

type Look = {
  color: string;
  roughness: number;
  sheen?: string;
  clearcoat?: number;
  /** Surface detail: fine scale, fine depth, broad scale, broad depth (in model units) */
  detail?: [number, number, number, number];
  /** How much the colour wanders across the surface */
  tint?: number;
  /** How strongly it mirrors its surroundings (1 is the default); 0 for pieces whose rims shouldn't glint */
  specular?: number;
  /** Darkens toward `color` near the part's baked edge (the model's _EDGE attribute, 1 at the edge) */
  edge?: { color: string };
};
const SKIN: Look = { color: "#ad6b46", roughness: 0.5, sheen: "#ffb592", detail: [160, 0.0005, 9, 0.003], tint: 0.1 };
// Hair, beard and brows: one black, matte and all but unreflective, so it doesn't read brown and its thin
// edges never glint; no micro-texture either (the curls are real geometry, and a finer pattern than a
// pixel only shimmers)
const HAIR: Look = { color: "#0e0a09", roughness: 0.82, specular: 0.04, tint: 0.12, detail: [1, 0, 30, 0.0015] };
/**
 * The model's parts by name: what each one is made of, and which stay with the body. The head is a hollow
 * shell with holes where the brows, eyes, nose and mouth sit, so the parts that make up its surface get
 * a dark inside (`inside`): any gap around a feature then reads as shadow, not a hole through the head.
 */
const PARTS: Record<string, Look & { body?: boolean; eye?: boolean; brow?: boolean; mouth?: boolean; inside?: boolean }> = {
  tripo_part_0: { ...HAIR, inside: true }, // hair, as the model has it
  tripo_part_1: { color: "#f1efeb", roughness: 0.85, sheen: "#ffffff", detail: [260, 0.0004, 7, 0.006], tint: 0.03, body: true, inside: true }, // tee: dark inside, as a collar's inside sits in shadow
  tripo_part_2: { ...HAIR, inside: true }, // beard, as the model has it
  tripo_part_3: { ...SKIN, inside: true }, // face
  tripo_part_4: { ...SKIN, inside: true }, // ears
  tripo_part_5: { ...SKIN, inside: true },
  tripo_part_6: { ...SKIN, inside: true }, // neck
  tripo_part_7: { ...SKIN, inside: true }, // nose
  // The mouth piece also covers the bare skin down to the beard, so it's the face's own skin, no seam; its
  // rim turns beard-black where it meets the beard, and it has no sheen or reflections, which flare on
  // its curled rim and outline it in white
  tripo_part_8: { ...SKIN, sheen: undefined, specular: 0, mouth: true, edge: { color: HAIR.color }, inside: true },
  tripo_part_9: { ...HAIR, brow: true },
  tripo_part_10: { ...HAIR, brow: true },
  tripo_part_11: { color: "#ffffff", roughness: 0.08, clearcoat: 1, eye: true },
  tripo_part_12: { color: "#ffffff", roughness: 0.08, clearcoat: 1, eye: true },
};

// Value noise and a bump from it, for surface detail without textures (the parts have no UVs)
const DETAIL_PARS = /* glsl */ `
  varying vec3 vObj;
  uniform vec4 uDetail;
  uniform float uTint;
  uniform vec3 uEdgeColor;
  float dHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float dNoise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dHash(i), dHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(dHash(i + vec3(0.0, 1.0, 0.0)), dHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(dHash(i + vec3(0.0, 0.0, 1.0)), dHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(dHash(i + vec3(0.0, 1.0, 1.0)), dHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }
  float dFbm(vec3 p) { return 0.5 * dNoise(p) + 0.25 * dNoise(p * 2.03) + 0.125 * dNoise(p * 4.01); }
  vec3 dPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float facing) {
    vec3 sigmaX = normalize(dFdx(surfPos));
    vec3 sigmaY = normalize(dFdy(surfPos));
    vec3 r1 = cross(sigmaY, surfNorm);
    vec3 r2 = cross(surfNorm, sigmaX);
    float det = dot(sigmaX, r1) * facing;
    return normalize(abs(det) * surfNorm - sign(det) * (dHdxy.x * r1 + dHdxy.y * r2));
  }
`;
const DETAIL_COLOR = /* glsl */ `
  vec3 base = diffuse * (1.0 + uTint * (dFbm(vObj * uDetail.z * 0.5) - 0.5) * 2.0);
  #ifdef EDGE_DARK
    base = mix(base, uEdgeColor, smoothstep(0.25, 0.85, vEdge));
  #endif
  #ifdef DARK_INSIDE
    if (!gl_FrontFacing) base = vec3(0.01, 0.007, 0.006);
  #endif
  vec4 diffuseColor = vec4(base, opacity);
`;
// The dark inside is matte and reflects nothing, so the rims where it shows read as solid black
const DETAIL_SURFACE = /* glsl */ `
  #include <lights_physical_fragment>
  #ifdef DARK_INSIDE
    if (!gl_FrontFacing) {
      material.roughness = 1.0;
      material.specularColor = vec3(0.0);
      material.specularF90 = 0.0;
      #ifdef USE_SHEEN
        material.sheenColor = vec3(0.0);
      #endif
    }
  #endif
`;
const DETAIL_NORMAL = /* glsl */ `
  #include <normal_fragment_maps>
  float detailH = dFbm(vObj * uDetail.x) * uDetail.y + dFbm(vObj * uDetail.z) * uDetail.w;
  normal = dPerturb(-vViewPosition, normal, vec2(dFdx(detailH), dFdy(detailH)), faceDirection);
`;

// The eye: sclera, a brown iris darkening toward its rim, and a pupil, nudged by `uLook`, under skin
// lids. The lower lid curves up as `uHappy` rises, the way cheeks lift the eyes in a smile. Each eye is
// centred on its own origin; the model faces +x, so its face lies across z and y.
const EYE_FRAGMENT = /* glsl */ `
  vec3 skin = vec3(0.42, 0.15, 0.06);
  vec2 p = vObj.zy - uLook;
  float d = length(p);
  float pupil = 0.009 * uPupil;
  vec3 col = vec3(0.92, 0.9, 0.86);
  vec3 iris = mix(vec3(0.05, 0.022, 0.008), vec3(0.2, 0.09, 0.03), smoothstep(0.005, 0.019, d));
  col = mix(iris, col, smoothstep(0.0198, 0.0216, d));
  col *= 1.0 - 0.55 * smoothstep(0.016, 0.021, d) * (1.0 - smoothstep(0.021, 0.0225, d));
  col = mix(vec3(0.01), col, smoothstep(pupil - 0.0005, pupil + 0.0005, d));
  col *= 1.0 - 0.22 * (1.0 - smoothstep(0.0, 0.005, uLid - vObj.y));
  col *= 1.0 - 0.6 * smoothstep(uLid - 0.002, uLid - 0.0005, vObj.y);
  float low = uLow + 0.003 * uHappy + (0.005 + 0.007 * uHappy) * (1.0 - clamp(pow(vObj.z / 0.04, 2.0), 0.0, 1.0));
  float lidMask = max(smoothstep(uLid - 0.0006, uLid + 0.0006, vObj.y), 1.0 - smoothstep(low - 0.0006, low + 0.0006, vObj.y));
  col = mix(col, skin, lidMask);
  vec4 diffuseColor = vec4(col, opacity);
`;
// The lids aren't glassy like the eye
const EYE_SURFACE = /* glsl */ `
  #include <lights_physical_fragment>
  material.roughness = mix(material.roughness, 0.5, lidMask);
  material.clearcoat *= 1.0 - lidMask;
`;
/** Where the lids sit across the eye's height (it runs about ±0.024): resting, shut, wide, and the lower lid */
const LID = { rest: 0.0145, shut: -0.026, wide: 0.024, low: -0.0175 };
/** How far the brows lift, and how far the mouth's corners turn up, at full expression (model units) */
const BROW_LIFT = 0.012;
const SMILE_LIFT = 1.5;

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

export class BustScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  private timer = new THREE.Timer();
  private raycaster = new THREE.Raycaster();
  private running = false;
  private disposed = false;
  private time = 0;

  // rig (rises, bobs, leans; origin at the base) → fit (one unit tall) → neck → head parts
  private rig = new THREE.Group();
  private fit = new THREE.Group();
  private neck = new THREE.Group();
  private brows: { mesh: THREE.Object3D; y: number; z: number }[] = [];
  private mouth: { position: THREE.BufferAttribute; rest: Float32Array; lift: Float32Array; amount: number } | null = null;
  private gaze = { value: new THREE.Vector2() };
  private pupil = { value: 1 };
  private happy = { value: 0 };
  private lids = [{ value: LID.rest }, { value: LID.rest }]; // [screen-left eye, screen-right eye]
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
  private eyesLook = new THREE.Vector2();
  private lean = 0;
  private glance = new THREE.Vector2();
  private nextGlance = 0;
  private blink = 1;
  private nextBlink = INTRO + 1.5;
  private micro = { kind: "brow" as "brow" | "smile", at: INTRO + 6 };

  private reaction: Reaction | null = null;
  private reactionTime = 0;
  private nextReaction = 0;

  /** Resolves once the model has loaded and is in place. */
  ready: Promise<void>;

  constructor(
    canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    // Rendered at no less than 1.5× so the fine curls stay crisp even on standard screens
    this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Without motion, it's simply there, already settled
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
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL);
    if (this.disposed) return;
    const model = gltf.scene;
    // The model faces +x: turn it toward the camera
    model.rotation.y = -Math.PI / 2;
    this.fit.add(model);

    const meshes: THREE.Mesh[] = [];
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) meshes.push(o);
    });
    const eyes: THREE.Mesh[] = [];
    for (const mesh of meshes) {
      const look = PARTS[mesh.name] ?? PARTS[mesh.parent?.name ?? ""] ?? { color: "#cccccc", roughness: 0.6 };
      const material = new THREE.MeshPhysicalMaterial({
        color: look.color,
        roughness: look.roughness,
        clearcoat: look.clearcoat ?? 0,
        clearcoatRoughness: 0.05,
        sheen: look.sheen ? 0.35 : 0,
        sheenColor: new THREE.Color(look.sheen ?? "#ffffff"),
        specularIntensity: look.specular ?? 1,
        // The tee is a shell: show its inside so the collar reads as fabric; the head shows its dark lining
        side: look.body || look.inside ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (look.eye) {
        // Centre the eye on its own origin, so the iris and lids can be drawn around it
        mesh.geometry.computeBoundingBox();
        const center = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
        mesh.geometry.translate(-center.x, -center.y, -center.z);
        mesh.position.add(center);
        eyes.push(mesh);
      } else {
        const detail = look.detail ?? [1, 0, 1, 0];
        // The baked edge distance arrives as "_edge"; give it a name a shader can declare
        const edge = mesh.geometry.getAttribute("_edge");
        if (look.edge && edge) {
          mesh.geometry.setAttribute("edge", edge);
          mesh.geometry.deleteAttribute("_edge");
          material.defines = { ...material.defines, EDGE_DARK: "" };
        }
        if (look.inside) material.defines = { ...material.defines, DARK_INSIDE: "" };
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uDetail = { value: new THREE.Vector4(...detail) };
          shader.uniforms.uTint = { value: look.tint ?? 0 };
          shader.uniforms.uEdgeColor = { value: new THREE.Color(look.edge?.color ?? "#000000") };
          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nvarying vec3 vObj;\n#ifdef EDGE_DARK\nattribute float edge;\nvarying float vEdge;\n#endif")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;\n#ifdef EDGE_DARK\nvEdge = edge;\n#endif");
          shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>\n#ifdef EDGE_DARK\nvarying float vEdge;\n#endif\n${DETAIL_PARS}`)
            .replace("vec4 diffuseColor = vec4( diffuse, opacity );", DETAIL_COLOR)
            .replace("#include <lights_physical_fragment>", DETAIL_SURFACE)
            .replace("#include <normal_fragment_maps>", DETAIL_NORMAL);
        };
      }
      if (look.mouth) {
        this.mouth = prepareSmile(mesh.geometry);
        // Set back a touch into the face (the model faces +x), so the beard overlaps its edges
        mesh.position.x -= 0.004;
      }
      if (look.brow) {
        // Sunk a touch into the skin (the model faces +x), so lifting never shows their underside
        mesh.position.x -= 0.002;
        this.brows.push({ mesh, y: 0, z: 0 });
      }
      mesh.material = material;
    }

    // Stand it one unit tall, base on the ground, centred
    this.rig.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1 / size.y;
    this.fit.scale.setScalar(scale);
    this.fit.position.set(-((box.min.x + box.max.x) / 2) * scale, -box.min.y * scale, -((box.min.z + box.max.z) / 2) * scale);
    this.rig.updateMatrixWorld(true);

    // Each eye gets its own lids (so it can wink); eyes and brows run left to right as you look at it
    const leftToRight = (a: THREE.Object3D, b: THREE.Object3D) => a.getWorldPosition(new THREE.Vector3()).x - b.getWorldPosition(new THREE.Vector3()).x;
    eyes.sort(leftToRight);
    this.brows.sort((a, b) => leftToRight(a.mesh, b.mesh));
    for (const [i, eye] of eyes.entries()) {
      const material = eye.material as THREE.MeshPhysicalMaterial;
      const lid = this.lids[i] ?? this.lids[0];
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uLook = this.gaze;
        shader.uniforms.uPupil = this.pupil;
        shader.uniforms.uLid = lid;
        shader.uniforms.uLow = { value: LID.low };
        shader.uniforms.uHappy = this.happy;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vObj;\nuniform vec2 uLook;\nuniform float uPupil;\nuniform float uLid;\nuniform float uLow;\nuniform float uHappy;")
          .replace("vec4 diffuseColor = vec4( diffuse, opacity );", EYE_FRAGMENT)
          .replace("#include <lights_physical_fragment>", EYE_SURFACE);
      };
    }

    // The neck joint sits low in the neck, inside the collar; everything but the tee hangs from it
    const neckPart = meshes.find((m) => m.name === "tripo_part_6");
    const neckBox = neckPart ? new THREE.Box3().setFromObject(neckPart) : box;
    const pivot = neckBox.getCenter(new THREE.Vector3());
    pivot.y = THREE.MathUtils.lerp(neckBox.min.y, neckBox.max.y, 0.3);
    this.neck.position.copy(this.fit.worldToLocal(pivot.clone()));
    this.fit.add(this.neck);
    this.rig.updateMatrixWorld(true);
    // A copy of the neck stays put inside the collar, so when the head tips back skin shows, not a gap. A
    // depth bias draws it just behind the real neck, so the two never fight over the same surface
    if (neckPart) {
      const stub = neckPart.clone();
      const material = (neckPart.material as THREE.MeshPhysicalMaterial).clone();
      material.polygonOffset = true;
      material.polygonOffsetFactor = 2;
      material.polygonOffsetUnits = 2;
      stub.material = material;
      neckPart.parent!.add(stub);
    }
    for (const mesh of meshes) if (!PARTS[mesh.name]?.body) this.neck.attach(mesh);
    for (const brow of this.brows) {
      brow.y = brow.mesh.position.y;
      brow.z = brow.mesh.position.z;
    }

    // A cheap stand-in for clicks and hovers
    this.hitbox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1, 0.5), new THREE.MeshBasicMaterial({ visible: false }));
    this.hitbox.position.y = 0.5;
    this.rig.add(this.hitbox);

    this.loaded = true;
    if (!this.running) this.render(0);
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Framed for its circle (see `.avatar-frame`): the flat base sits below the bottom edge, even
    // mid-bob, the shoulders run into the circle's curve, and the hair rises above its top
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const view = 1.05;
    const bottom = 0.14;
    this.camera.position.set(0, bottom + view / 2, view / 2 / tan);
    this.camera.lookAt(0, bottom + view / 2, 0);
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  /** The cursor, in the canvas's own -1..1 coordinates (it can be outside the canvas). */
  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
    this.lastPointer = this.time;
  }

  /** Whether the cursor is over the avatar: it perks up. */
  setHover(on: boolean) {
    this.hovered = on;
  }

  /** How far down the page (0..1) and how fast it's moving (px per frame, signed). */
  setScroll(progress: number, velocity: number) {
    this.scroll = progress;
    this.scrollVelocity = velocity;
  }

  /** Whether a point (canvas -1..1 coordinates) lands on the avatar. */
  hit(x: number, y: number) {
    if (!this.loaded) return false;
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return this.raycaster.intersectObject(this.hitbox).length > 0;
  }

  /** Do the next trick: a wink, a laugh, a double take, or a nod. */
  react(which?: Reaction) {
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
    const head = this.neck.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.3, 0)).project(this.camera);
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
    targetX *= attention;
    targetY *= attention;
    // The eyes get there first; the head follows on a spring
    this.eyesLook.x = damp(this.eyesLook.x, targetX, 14, dt);
    this.eyesLook.y = damp(this.eyesLook.y, targetY, 14, dt);
    const lookX = this.lookX.step(targetX, dt);
    const lookY = this.lookY.step(targetY, dt);
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

    // ---- The resting pose: breathing, a slight smile, the head never quite still
    const breathe = Math.sin(t * 2);
    let rigY = 0;
    let rigPitch = this.lean * 0.06 - lookY * 0.12 + hover * 0.04;
    let rigYaw = lookX * 0.25;
    let squash = 1 + breathe * 0.006;
    // The head tips up only a little on its own (further and the neck lifts out of the collar)
    let headPitch = THREE.MathUtils.clamp(-lookY * 0.18, -0.09, 0.2) + this.scroll * 0.12;
    let headYaw = THREE.MathUtils.clamp(lookX * 0.3, -0.3, 0.3);
    let headRoll = Math.sin(t * 0.55) * 0.035;
    const open = [1, 1];
    let wide = 0;
    let happy = 0.15 + hover * 0.35;
    const brow = [hover * 0.35, hover * 0.35];
    let smile = 1 + hover * 0.35;
    let pupil = 1;
    let glanceAway = 0;

    // ---- Arrival: in place, it grows in from a touch smaller as it fades in, turning from three-quarter
    // view to face you; then a blink as it settles, and a lift of the brows and a smile, as if it has
    // just noticed you
    let arrive = 1;
    if (t < INTRO) {
      arrive = 0.92 + 0.08 * easeOutCubic(t / 1.1);
      rigYaw += 0.45 * (1 - easeOutCubic(t / 1.3));
      open[0] = open[1] = 1 - envelope((t - 0.75) / 0.22, 0.4, 0.6);
      const hello = envelope((t - 1.2) / 0.8, 0.25, 0.4);
      brow[0] += hello * 0.9;
      brow[1] += hello * 0.9;
      smile += hello * 0.5;
      happy += hello * 0.4;
    }

    // ---- Now and then, a little flicker of expression
    if (t > this.micro.at) {
      const p = (t - this.micro.at) / (this.micro.kind === "brow" ? 0.6 : 1.4);
      const e = envelope(p, 0.25, 0.4);
      if (this.micro.kind === "brow") {
        brow[0] += e * 0.6;
        brow[1] += e * 0.6;
      } else {
        smile += e * 0.45;
        happy += e * 0.3;
      }
      if (p >= 1) this.micro = { kind: Math.random() < 0.5 ? "brow" : "smile", at: t + 5 + Math.random() * 5 };
    }

    // ---- The trick in progress
    if (this.reaction) {
      this.reactionTime += dt;
      const p = this.reactionTime / DURATION[this.reaction];
      const T = this.reactionTime;
      if (p >= 1) this.reaction = null;
      else if (this.reaction === "wink") {
        // The right eye shuts, the other brow arches, the head tips toward the wink, a grin
        const e = envelope(p, 0.15, 0.35);
        open[1] = 1 - e;
        brow[0] += e * 0.9;
        headRoll -= e * 0.16;
        smile += e * 0.7;
        happy += e * 0.5;
      } else if (this.reaction === "laugh") {
        // Head back, quick chuckles, a squinting grin
        const e = envelope(p, 0.1, 0.35);
        const chuckle = Math.sin(T * 19) * e * (1 - p * 0.6);
        headPitch -= e * 0.1 + chuckle * 0.035;
        rigY += Math.abs(chuckle) * 0.012;
        squash += chuckle * 0.01;
        open[0] = open[1] = 1 - e * 0.4;
        happy += e;
        smile += e;
        brow[0] += e * 0.25;
        brow[1] += e * 0.25;
      } else if (this.reaction === "doubletake") {
        // A glance off to the side... then a snap back, brows up, eyes wide, pulling back a touch
        glanceAway = smooth(p / 0.1) * (1 - smooth((p - 0.2) / 0.08));
        headYaw += glanceAway * 0.5;
        const e = p > 0.28 ? envelope((p - 0.28) / 0.72, 0.08, 0.4) : 0;
        brow[0] += e * 1.3;
        brow[1] += e * 1.3;
        wide = e;
        pupil = 1 - e * 0.45;
        rigPitch -= e * 0.08;
        rigY += e * 0.02;
        smile -= e * 0.4;
      } else {
        // A friendly double nod with a little tilt
        const e = envelope(p, 0.1, 0.3);
        headPitch += Math.sin(T * 11) * 0.15 * e;
        headRoll += e * 0.1;
        smile += e * 0.3;
        happy += e * 0.3;
      }
    }

    // ---- Pose it
    const lean = (1 + hover * 0.02) * arrive;
    this.rig.position.y = rigY;
    this.rig.scale.set(lean / Math.sqrt(squash), lean * squash, lean / Math.sqrt(squash));
    this.rig.rotation.set(rigPitch, rigYaw, 0);
    this.neck.rotation.set(headPitch, headYaw, headRoll);
    // Brows rise and slide back along the forehead's slope (forward is +z once it faces us)
    for (const [i, b] of this.brows.entries()) {
      const lift = (brow[i] ?? brow[0]) * BROW_LIFT;
      b.mesh.position.y = b.y + lift;
      b.mesh.position.z = b.z - lift * 0.45;
    }
    if (this.mouth) setSmile(this.mouth, smile);
    // The irises lead the head (the model's z runs to screen-left once it's turned to face us); in a
    // double take they dart off to the side first
    const irisX = THREE.MathUtils.clamp(this.eyesLook.x - lookX * 0.6 + glanceAway * 1.4, -1, 1);
    const irisY = THREE.MathUtils.clamp(this.eyesLook.y - lookY * 0.5, -1, 1);
    this.gaze.value.set(-irisX * 0.008, irisY * 0.006);
    this.pupil.value = damp(this.pupil.value, pupil, 10, dt);
    this.happy.value = clamp01(happy);
    for (const [i, lid] of this.lids.entries()) {
      // The upper lid: shut → resting → wide, dropping a little when happy, and to shut for a blink
      const o = clamp01(open[i] * this.blink);
      const resting = THREE.MathUtils.lerp(LID.rest, LID.wide, wide) - 0.003 * clamp01(happy);
      lid.value = THREE.MathUtils.lerp(LID.shut, resting, o);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (object.material as THREE.Material).dispose();
      }
    });
    this.scene.environment?.dispose();
    this.timer.dispose();
    this.renderer.dispose();
  }
}

/**
 * Get the mouth ready to smile: points near the lip line lift more the further they sit from the
 * middle (the mouth runs along z), so the corners turn up while the centre stays put. Away from the
 * lips, and out at the piece's edges where it tucks under the beard, nothing moves, so no edge lifts
 * clear of the beard.
 */
function prepareSmile(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox!;
  const middle = (min.z + max.z) / 2;
  const halfWidth = (max.z - min.z) / 2;
  const height = max.y - min.y;
  const lipLine = THREE.MathUtils.lerp(min.y, max.y, 0.72);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const rest = new Float32Array(position.count);
  const lift = new Float32Array(position.count);
  for (let i = 0; i < position.count; i++) {
    rest[i] = position.getY(i);
    const across = position.getZ(i) - middle;
    const nearLips = Math.exp(-(((rest[i] - lipLine) / (height * 0.22)) ** 2));
    const inside = 1 - smooth((Math.abs(across) / halfWidth - 0.65) / 0.3);
    lift[i] = SMILE_LIFT * across ** 2 * nearLips * inside;
  }
  // The model's own normals stay: the bend is slight, and recomputed ones would point into the head
  const mouth = { position, rest, lift, amount: -1 };
  setSmile(mouth, 1);
  return mouth;
}

function setSmile(mouth: NonNullable<BustScene["mouth"]>, amount: number) {
  if (Math.abs(amount - mouth.amount) < 0.002) return;
  for (let i = 0; i < mouth.rest.length; i++) mouth.position.setY(i, mouth.rest[i] + mouth.lift[i] * amount);
  mouth.position.needsUpdate = true;
  mouth.amount = amount;
}
