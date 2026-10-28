import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The process, acted out by the pieces of a web page as you scroll. Every piece is a slab of
 * tinted glass in its real proportions:
 *   research  a handful of pieces start as small glass notes in shapes that hint at them (pills,
 *             dots, bars, cards); they tumble loose, then sort into three clusters
 *   design    they fly into place at full size as a one-colour mock-up in violet glass
 *   build     the glass takes on the page's colours and it explodes into its layers
 *   ship      the layers press back together into the finished page
 */

const CYAN = "#09c7fb";
const VIOLET = "#c471ed";
const CORAL = "#f64f59";
const BG = "#0a0a0d";

// What a piece is: 0 block, 1 heading bar, 3 pill button, 4 paragraph
// `quiet` pieces skip research and only appear once the mock-up forms, so research stays sparse
type Piece = { x: number; y: number; w: number; h: number; kind: number; layer: number; color: string; quiet?: boolean };

// A landing page on a 16 × 10 board, centre origin, y up. Layers go back (0) to front (3).
const PAGE: Piece[] = [
  { x: 0, y: 0, w: 16, h: 10, kind: 0, layer: 0, color: "#121219" },
  { x: 0, y: 4.25, w: 15.2, h: 0.85, kind: 0, layer: 1, color: "#1d1d26" },
  { x: -6.5, y: 4.25, w: 1.3, h: 0.36, kind: 1, layer: 2, color: CYAN },
  { x: 3.6, y: 4.25, w: 1.1, h: 0.42, kind: 3, layer: 3, color: "#33333f", quiet: true },
  { x: 4.9, y: 4.25, w: 1.1, h: 0.42, kind: 3, layer: 3, color: "#33333f", quiet: true },
  { x: 6.4, y: 4.25, w: 1.4, h: 0.42, kind: 3, layer: 3, color: "#edecf2" },
  { x: -3.4, y: 2.45, w: 7.6, h: 0.8, kind: 1, layer: 2, color: "#edecf2" },
  { x: -4.3, y: 1.4, w: 5.8, h: 0.8, kind: 1, layer: 2, color: "#edecf2", quiet: true },
  { x: -4.2, y: 0.2, w: 6, h: 0.8, kind: 4, layer: 2, color: "#7c7b88" },
  { x: -5.75, y: -0.85, w: 2.1, h: 0.62, kind: 3, layer: 3, color: VIOLET },
  { x: -3.3, y: -0.85, w: 2.2, h: 0.62, kind: 3, layer: 3, color: "#33333f" },
  { x: 3.9, y: 1.1, w: 6.6, h: 4.4, kind: 0, layer: 1, color: "#2a2a3a" },
  { x: 6.1, y: -0.75, w: 2.6, h: 1.05, kind: 0, layer: 3, color: "#1d1d26", quiet: true },
  { x: 1.9, y: 2.9, w: 1.9, h: 0.5, kind: 3, layer: 3, color: CORAL },
  { x: -5.1, y: -3.3, w: 4.7, h: 2.5, kind: 0, layer: 1, color: "#1d1d26" },
  { x: 0, y: -3.3, w: 4.7, h: 2.5, kind: 0, layer: 1, color: "#1d1d26", quiet: true },
  { x: 5.1, y: -3.3, w: 4.7, h: 2.5, kind: 0, layer: 1, color: "#1d1d26", quiet: true },
  { x: -6.6, y: -2.65, w: 0.75, h: 0.75, kind: 0, layer: 2, color: CYAN },
  { x: -1.5, y: -2.65, w: 0.75, h: 0.75, kind: 0, layer: 2, color: VIOLET },
  { x: 3.6, y: -2.65, w: 0.75, h: 0.75, kind: 0, layer: 2, color: CORAL },
  { x: -4.95, y: -3.75, w: 3.8, h: 0.75, kind: 4, layer: 2, color: "#7c7b88", quiet: true },
  { x: 0.15, y: -3.75, w: 3.8, h: 0.75, kind: 4, layer: 2, color: "#7c7b88", quiet: true },
  { x: 5.25, y: -3.75, w: 3.8, h: 0.75, kind: 4, layer: 2, color: "#7c7b88", quiet: true },
];
const ACCENTS = new Set([CYAN, VIOLET, CORAL]);
const LIGHTS = new Set(["#edecf2", "#7c7b88"]);

// While loose, each piece is a note no bigger than this, and never thinner than NOTE_MIN, so
// even a thin text bar reads at a glance
const NOTE_W = 2.2;
const NOTE_H = 1.6;
const NOTE_MIN = 0.72;
const NOTE_GAP_X = 2.6; // note spacing inside a research cluster
const NOTE_GAP_Y = 2;
const LAYER_GAP = 1.8;
const LAYER_STACK = 0.26; // assembled, each layer rests just in front of the one behind it

/** Where each stage happens along the section's scroll, 0..1. The overlay copy uses the same marks. */
const STAGES = {
  research: [0.12, 0.3],
  design: [0.36, 0.52],
  build: [0.58, 0.74],
  ship: [0.84, 0.96],
} as const;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A rounded slab with softly bevelled edges, centred on the origin, front face towards +z. */
function slab(w: number, h: number, depth: number, radius: number, curve: number) {
  const bevel = Math.min(0.045, depth * 0.3, w * 0.2, h * 0.2);
  const r = Math.max(0.005, Math.min(radius, w / 2, h / 2) - bevel);
  const body = depth - bevel * 2;
  const geometry = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, r), {
    depth: body,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: curve,
  });
  geometry.translate(0, 0, -body / 2);
  return geometry;
}

const dustVertex = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * (0.15 + aSeed * 0.25) + aSeed * 40.0, 24.0) - 12.0;
    p.x += sin(uTime * 0.2 + aSeed * 30.0) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aSeed * 2.0) * uPixelRatio * (16.0 / -mv.z);
    vColor = aColor;
    vSeed = aSeed;
  }
`;
const dustFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vSeed;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * uOpacity * (0.3 + vSeed * 0.7);
    gl_FragColor = vec4(vColor * a, a);
  }
`;

type Part = {
  piece: Piece;
  root: THREE.Group;
  /** The piece's real shape */
  body: THREE.Group;
  material: THREE.MeshPhysicalMaterial;
  /** The research note it starts as, which dissolves into the real shape */
  note: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshPhysicalMaterial>;
  /** How see-through this piece's glass is when solid */
  glass: number;
  /** The piece's own colour, which the frosted glass turns into once built */
  color: THREE.Color;
  /** Frosted tint while loose: neutral pieces lean cyan, coloured ones keep their colour */
  frost: THREE.Color;
  /** Uniform scale the real shape grows from as the note dissolves */
  noteScale: number;
  scatter: THREE.Vector3;
  scatterRot: THREE.Euler;
  cluster: THREE.Vector3;
  clusterTilt: number;
  seed: number;
};

export class ProcessScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  private board = new THREE.Group();
  private parts: Part[] = [];
  private dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private environment: THREE.Texture;
  private disposables: { dispose(): void }[] = [];
  private timer = new THREE.Timer();

  private target = 0;
  private progress = 0;
  private pointer = new THREE.Vector2();
  private smoothPointer = new THREE.Vector2();
  private time = 0;
  private running = false;
  private fit = { scale: 1 };

  // Scratch objects reused every frame
  private position = new THREE.Vector3();
  private step = new THREE.Vector3();
  /** Design: every piece the same violet glass, like a mock-up before colour */
  private mockup = new THREE.Color("#8a7fc0");

  constructor(
    canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
  ) {
    const compact = window.matchMedia("(max-width: 767px)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.background = new THREE.Color(BG);
    this.camera.position.set(0, 0, 44);
    this.scene.add(this.board);

    // Soft studio reflections plus coloured rim lights for the glossy slabs
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.3;
    const key = new THREE.DirectionalLight("#ffffff", 0.9);
    key.position.set(4, 10, 12);
    const cyanRim = new THREE.PointLight(CYAN, 70, 0, 1.6);
    cyanRim.position.set(-16, 9, 10);
    const coralRim = new THREE.PointLight(CORAL, 45, 0, 1.6);
    coralRim.position.set(16, -8, 9);
    const violetFill = new THREE.PointLight(VIOLET, 35, 0, 1.6);
    violetFill.position.set(0, 12, -6);
    this.board.add(key, cyanRim, coralRim, violetFill);

    const random = mulberry32(11);
    const curve = compact ? 6 : 10;

    // Research clusters: words, pictures and blocks, actions
    const groups: number[][] = [[], [], []];
    PAGE.forEach((piece, i) => {
      const accent = ACCENTS.has(piece.color);
      const light = LIGHTS.has(piece.color);
      // Glass, not chrome: low reflections, no glow. Light and coloured pieces are see-through tints.
      const material = new THREE.MeshPhysicalMaterial({
        color: light ? "#d8d8e4" : piece.color,
        roughness: 0.2,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        transparent: true,
        depthWrite: false,
      });
      this.disposables.push(material);

      const root = new THREE.Group();
      const body = new THREE.Group();
      root.add(body);
      const depth = piece.layer === 0 ? 0.3 : piece.kind === 3 ? 0.24 : 0.18;
      const radius = piece.kind === 3 ? piece.h / 2 : piece.kind === 1 ? piece.h * 0.3 : Math.min(0.32, piece.h * 0.25);
      if (piece.kind === 4) {
        // A paragraph is two lines of text, the second one shorter
        const bar = piece.h * 0.32;
        [
          [piece.w, piece.h * 0.24],
          [piece.w * 0.62, -piece.h * 0.24],
        ].forEach(([w, y]) => {
          const geometry = slab(w, bar, 0.12, bar / 2, curve);
          this.disposables.push(geometry);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(-(piece.w - w) / 2, y, 0);
          body.add(mesh);
        });
      } else {
        const geometry = slab(piece.w, piece.h, depth, radius, curve);
        this.disposables.push(geometry);
        body.add(new THREE.Mesh(geometry, material));
      }

      const frost = accent || light ? material.color.clone() : new THREE.Color("#7f9cb4");
      // The note: the piece shrunk to fit, with a floor on thickness. Icons become dots, buttons pills.
      const icon = piece.kind === 0 && piece.w < 1;
      const fit = Math.min(NOTE_W / piece.w, NOTE_H / piece.h);
      const noteW = icon ? 1.05 : Math.max(NOTE_MIN, piece.w * fit);
      const noteH = icon ? 1.05 : Math.max(NOTE_MIN, piece.h * fit);
      const round = icon || piece.kind === 3 || piece.kind === 1;
      const noteGeometry = slab(noteW, noteH, 0.16, round ? Math.min(noteW, noteH) / 2 : 0.26, curve);
      const noteMaterial = material.clone();
      noteMaterial.color.copy(frost);
      this.disposables.push(noteGeometry, noteMaterial);
      const note = new THREE.Mesh(noteGeometry, noteMaterial);
      root.add(note);
      this.board.add(root);

      this.parts.push({
        piece,
        root,
        body,
        material,
        note,
        glass: accent ? 0.5 : light ? (piece.kind === 4 ? 0.22 : 0.32) : piece.layer === 0 ? 0.82 : 0.6,
        color: material.color.clone(),
        frost,
        noteScale: Math.min(1, noteW / piece.w, noteH / piece.h),
        scatter: new THREE.Vector3((random() * 2 - 1) * 8.5, (random() * 2 - 1) * 4.8, (random() * 2 - 1) * 4 - 0.5),
        scatterRot: new THREE.Euler((random() - 0.5) * 2.2, (random() - 0.5) * 2.2, (random() - 0.5) * 1.4),
        cluster: new THREE.Vector3(),
        clusterTilt: (random() - 0.5) * 0.2,
        seed: random(),
      });
      if (piece.quiet) {
        // Never loose: waits invisibly in its place until the mock-up forms around it
        note.visible = false;
        const home = new THREE.Vector3(piece.x, piece.y, piece.layer * LAYER_STACK);
        this.parts[i].scatter.copy(home);
        this.parts[i].cluster.copy(home);
        return;
      }
      groups[piece.kind === 1 || piece.kind === 4 ? 0 : piece.kind === 3 ? 2 : 1].push(i);
    });

    // Clusters: words top left, actions top right, pictures and blocks along the bottom
    const layouts = [
      { centre: new THREE.Vector3(-4.4, 2.6, 0.4), cols: 3 },
      { centre: new THREE.Vector3(0, -2.2, -0.3), cols: 4 },
      { centre: new THREE.Vector3(5, 2.6, 0.2), cols: 2 },
    ];
    groups.forEach((members, g) => {
      const { centre, cols } = layouts[g];
      const rows = Math.ceil(members.length / cols);
      members.forEach((index, k) => {
        const col = k % cols;
        const row = Math.floor(k / cols);
        this.parts[index].cluster.set(
          centre.x + (col - (cols - 1) / 2) * NOTE_GAP_X,
          centre.y + ((rows - 1) / 2 - row) * NOTE_GAP_Y,
          centre.z + (random() - 0.5) * 0.3,
        );
      });
    });

    // Drifting motes for depth
    const motes = compact ? 400 : 900;
    const dustPositions = new Float32Array(motes * 3);
    const dustSeeds = new Float32Array(motes);
    const dustColors = new Float32Array(motes * 3);
    const palette = [CYAN, VIOLET, CORAL, "#edecf2"].map((hex) => new THREE.Color(hex));
    for (let i = 0; i < motes; i++) {
      dustPositions.set([(random() * 2 - 1) * 26, (random() * 2 - 1) * 12, (random() * 2 - 1) * 16 - 6], i * 3);
      dustSeeds[i] = random();
      palette[Math.floor(random() * palette.length)].toArray(dustColors, i * 3);
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(dustSeeds, 1));
    dustGeometry.setAttribute("aColor", new THREE.BufferAttribute(dustColors, 3));
    this.dust = new THREE.Points(
      dustGeometry,
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uOpacity: { value: 0.5 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
    this.disposables.push(dustGeometry, this.dust.material);
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // The canvas is the page's own zone, so the board just fills it with room for the exploded view
    const visibleH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const visibleW = visibleH * this.camera.aspect;
    this.fit.scale = Math.min((visibleW * 0.8) / 16, (visibleH * 0.72) / 10);
    if (!this.running) this.render(0);
  }

  setProgress(progress: number) {
    this.target = progress;
    if (!this.running) {
      this.progress = progress;
      this.render(0);
    }
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
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
    if (!this.reducedMotion) this.time += dt;
    this.progress = damp(this.progress, this.target, 6, dt);
    this.smoothPointer.x = damp(this.smoothPointer.x, this.pointer.x, 3, dt);
    this.smoothPointer.y = damp(this.smoothPointer.y, this.pointer.y, 3, dt);
    const p = this.progress;
    const t = this.time;

    const research = smooth(STAGES.research[0], STAGES.research[1], p);
    const design = smooth(STAGES.design[0], STAGES.design[1], p);
    const build = smooth(STAGES.build[0], STAGES.build[1], p);
    const ship = smooth(STAGES.ship[0], STAGES.ship[1], p);
    // Pieces move in a ripple rather than all at once
    const stagger = (stage: number, seed: number) => ease(clamp01((stage - seed * 0.3) / 0.7));


    this.parts.forEach(({ piece, root, body, material, note, glass, color, frost, noteScale, scatter, scatterRot, cluster, clusterTilt, seed }) => {
      const e1 = stagger(research, seed);
      const e2 = stagger(design, seed);
      const e3 = stagger(build, seed);
      const e4 = stagger(ship, seed);
      const loose = (1 - e1) * (1 - e2);

      this.position
        .copy(scatter)
        .add(this.step.set(Math.sin(t * 0.4 + seed * 9) * 0.45, Math.cos(t * 0.33 + seed * 7) * 0.35, 0).multiplyScalar(1 - e2))
        .lerp(cluster, e1)
        .lerp(this.step.set(piece.x, piece.y, piece.layer * LAYER_STACK), e2)
        .lerp(this.step.set(piece.x, piece.y, (piece.layer - 1.5) * LAYER_GAP), e3)
        .lerp(this.step.set(piece.x, piece.y, piece.layer * LAYER_STACK), e4);
      this.position.y += Math.sin(t * 1.1 + seed * 12) * 0.08 * (1 - e2);
      root.position.copy(this.position);

      const spin = Math.sin(t * 0.35 + seed * 5) * 0.3 * loose;
      root.rotation.set(
        scatterRot.x * loose + spin,
        scatterRot.y * loose + spin * 0.7,
        mix(scatterRot.z * (1 - e1) + clusterTilt * e1, 0, e2),
      );
      // The note dissolves as the real shape grows out of it
      body.scale.setScalar(mix(noteScale, 1, e2));
      note.scale.setScalar(mix(1, 0.6, e2));
      note.visible = !piece.quiet && e2 < 1;
      note.material.opacity = 0.5 * (1 - e2);
      body.visible = e2 > 0;

      // One violet glass in the mock-up; each piece takes on its own colour on its own beat as
      // the page is built
      material.color.copy(frost).lerp(this.mockup, e2).lerp(color, e3);
      // Shipped, the page is solid: opaque pieces written to depth, so overlapping layers never
      // draw in the wrong order as it turns
      material.opacity = mix(mix(piece.layer === 0 ? 0.24 : 0.55, glass, e3), 1, e4) * Math.min(1, e2 * 1.6);
      material.depthWrite = material.opacity > 0.97;
    });

    // Whole page: drifting while loose, square on as a wireframe, isometric exploded, then home
    const tilt = build * (1 - ship);
    const idle = this.reducedMotion ? 0 : 1;
    this.board.rotation.set(
      -0.55 * tilt - this.smoothPointer.y * 0.1 + Math.sin(t * 0.25) * 0.04 * idle,
      0.6 * tilt + this.smoothPointer.x * 0.16 + Math.sin(t * 0.18) * 0.08 * (1 - design * (1 - build)) * idle,
      0.1 * tilt,
    );
    this.board.scale.setScalar(this.fit.scale * mix(1, 0.84, tilt));
    this.board.position.y = Math.sin(t * 0.6) * 0.15 * ship * idle;

    const dust = this.dust.material.uniforms;
    dust.uTime.value = t;
    dust.uOpacity.value = 0.3;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.disposables.forEach((item) => item.dispose());
    this.environment.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

/** Small seeded random so the scatter looks the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
