import * as THREE from "three";

/**
 * Two hands of glowing particles reaching for each other, index fingers almost touching, with a
 * thread of sparks in the gap. Scroll draws them together; `setTouch` closes the gap completely,
 * the spark flares and a ring of light pulses out. On load, scattered dust gathers into the hands.
 */

// Raw sRGB values: the shaders write them straight out, so skip three's linear conversion
const raw = (hex: string) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
const CYAN = raw("#09c7fb");
const VIOLET = raw("#c471ed");
const CORAL = raw("#f64f59");

// A hand pointing along +x, in hand units: a chain of tapered capsules per finger, plus palm and forearm.
type Chain = { points: [number, number][]; radii: number[] };
const FINGERS: Chain[] = [
  // index, reaching
  { points: [[0, 0.45], [1.3, 0.55], [2.55, 0.42]], radii: [0.27, 0.23, 0.19] },
  // middle, ring and little finger curled under
  { points: [[-0.05, 0.08], [0.95, 0.05], [1.35, -0.35], [1.05, -0.7]], radii: [0.27, 0.24, 0.22, 0.2] },
  { points: [[-0.15, -0.28], [0.8, -0.4], [1.05, -0.78], [0.75, -1.0]], radii: [0.25, 0.22, 0.2, 0.18] },
  { points: [[-0.35, -0.6], [0.4, -0.78], [0.6, -1.05], [0.38, -1.22]], radii: [0.21, 0.19, 0.17, 0.15] },
  // thumb
  { points: [[-1.2, 0.6], [-0.45, 0.95], [0.25, 1.05]], radii: [0.3, 0.26, 0.22] },
  // wrist and forearm, running off the edge of the screen
  { points: [[-2.4, -0.18], [-1.6, -0.05]], radii: [0.74, 0.72] },
  { points: [[-7.5, -0.95], [-2.4, -0.18]], radii: [0.9, 0.74] },
];
const PALM = { x: -1.05, y: 0.05, rx: 1.15, ry: 0.92 };
const TIP = new THREE.Vector2(2.74, 0.42); // end of the index finger
const REST_GAP = 1.7; // space between the fingertips when nobody's reaching

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aSide;
  uniform float uTime;
  uniform float uIntro;
  uniform float uShift;
  uniform float uPixelRatio;
  uniform float uFlash;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // Each mote arrives on its own beat
    float t = clamp((uIntro - aSeed * 0.45) / 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aFrom, position, t);
    // The hands slide toward each other, and breathe; every mote swirls a little on its own
    p.x += aSide * uShift;
    p.y += sin(uTime * 0.7 + aSide * 1.7) * 0.07;
    p += vec3(
      sin(uTime * 1.3 + aSeed * 40.0),
      cos(uTime * 1.1 + aSeed * 57.0),
      sin(uTime * 0.9 + aSeed * 23.0)
    ) * 0.035;

    // A current of light runs up each arm into the fingertip, every couple of seconds
    float fromTip = abs(p.x);
    float front = 9.5 - mod(uTime * 4.0 + aSide * 0.8, 13.0);
    float current = exp(-pow((fromTip - front) * 1.3, 2.0));
    // The fingertips glow, and blaze when they touch
    float nearTip = exp(-pow(fromTip * 1.3, 2.0));
    float twinkle = 0.7 + 0.3 * sin(uTime * 3.0 + aSeed * 120.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.4 + aSeed * 2.6 + current * 2.5 + nearTip * (1.5 + uFlash * 3.5)) * uPixelRatio * (9.0 / -mv.z);
    vColor = aColor * (1.35 + current * 1.2) + nearTip * (0.25 + uFlash * 0.8);
    vAlpha = (0.6 + 0.4 * fract(aSeed * 7.13)) * twinkle * (0.3 + 0.7 * t);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

const dustVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.08 + aSeed * 0.15) + 3.5, 7.0) - 3.5;
    p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + aSeed * 2.5) * uPixelRatio * (9.0 / -mv.z);
    vColor = aColor;
    vAlpha = 0.25 + 0.35 * sin(uTime * 1.5 + aSeed * 60.0) * 0.5 + 0.175;
  }
`;

const sparkVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec3 uTipL;
  uniform vec3 uTipR;
  uniform float uSpark;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    // Each spark races across the gap and back, wobbling off the line
    float s = fract(aSeed * 13.7 + uTime * (0.25 + aSeed * 0.5));
    vec3 p = mix(uTipL, uTipR, s);
    float bulge = sin(s * 3.14159);
    p.y += sin(uTime * 6.0 + aSeed * 50.0) * 0.12 * bulge * (1.0 - uSpark * 0.5);
    p.z += cos(uTime * 5.0 + aSeed * 30.0) * 0.1 * bulge;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + uSpark * 3.0) * uPixelRatio * (9.0 / -mv.z);
    float flicker = 0.5 + 0.5 * sin(uTime * 12.0 + aSeed * 90.0);
    vAlpha = (0.3 + uSpark * 0.7) * (0.4 + 0.6 * flicker);
  }
`;

const sparkFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vec3(1.0, 0.95, 1.0) * a, a);
  }
`;

const ringVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragment = /* glsl */ `
  uniform float uWave;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float ring = exp(-pow((r - uWave) * 14.0, 2.0)) * (1.0 - uWave);
    float core = exp(-r * r * 30.0) * (1.0 - uWave) * 0.8;
    float a = (ring + core) * step(0.001, uWave);
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

export class HandsScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  private group = new THREE.Group();
  private hands: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private sparks: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private ring: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private timer = new THREE.Timer();
  private running = false;

  private time = 0;
  private intro = 0;
  private reach = 0; // 0..1 from scroll
  private touchTarget = 0;
  private touch = 0;
  private wave = 0;
  private waving = false;
  private armed = true; // re-armed once the hands part again, so each touch gets one pulse
  private pointer = new THREE.Vector2();
  private smoothPointer = new THREE.Vector2();

  constructor(
    canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
  ) {
    const compact = window.matchMedia("(max-width: 767px)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.scene.add(this.group);
    if (reducedMotion) this.intro = 1;

    // The hands
    const perHand = compact ? 4200 : 9000;
    const count = perHand * 2;
    const positions = new Float32Array(count * 3);
    const from = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sides = new Float32Array(count);
    const random = mulberry32(5);
    const point = new THREE.Vector3();
    const color = new THREE.Color();
    const span = 9;
    for (let i = 0; i < count; i++) {
      const left = i < perHand;
      sampleHand(random, point);
      // Left hand reaches right, the right hand is its mirror; the tips sit either side of centre
      const x = point.x - TIP.x - REST_GAP / 2;
      point.set(left ? x : -x, point.y - TIP.y + (left ? -0.06 : 0.06), point.z);
      positions.set([point.x, point.y, point.z], i * 3);

      // Colour runs across the screen: cyan → violet → coral
      const t = THREE.MathUtils.clamp((point.x + span) / (span * 2), 0, 1);
      color.copy(CYAN).lerp(VIOLET, Math.min(1, t * 2)).lerp(CORAL, Math.max(0, t * 2 - 1));
      color.toArray(colors, i * 3);

      // Dust it gathers from
      const r = 6 + random() * 8;
      const a = random() * Math.PI * 2;
      from.set([Math.cos(a) * r, (random() - 0.5) * 9, Math.sin(a) * r * 0.5 - 2], i * 3);
      seeds[i] = random();
      sides[i] = left ? 1 : -1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSide", new THREE.BufferAttribute(sides, 1));
    this.hands = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: this.intro },
          uShift: { value: 0 },
          uFlash: { value: 0 },
          uPixelRatio: { value: this.renderer.getPixelRatio() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.hands.frustumCulled = false;
    this.group.add(this.hands);

    // The spark in the gap
    const sparkCount = compact ? 260 : 520;
    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sparkCount * 3), 3));
    const sparkSeeds = new Float32Array(sparkCount).map(() => random());
    sparkGeometry.setAttribute("aSeed", new THREE.BufferAttribute(sparkSeeds, 1));
    this.sparks = new THREE.Points(
      sparkGeometry,
      new THREE.ShaderMaterial({
        vertexShader: sparkVertex,
        fragmentShader: sparkFragment,
        uniforms: {
          uTime: { value: 0 },
          uTipL: { value: new THREE.Vector3() },
          uTipR: { value: new THREE.Vector3() },
          uSpark: { value: 0 },
          uPixelRatio: { value: this.renderer.getPixelRatio() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.sparks.frustumCulled = false;
    this.group.add(this.sparks);

    // Dust drifting behind them
    const motes = compact ? 300 : 700;
    const dustPositions = new Float32Array(motes * 3);
    const dustColors = new Float32Array(motes * 3);
    const dustSeeds = new Float32Array(motes);
    for (let i = 0; i < motes; i++) {
      dustPositions.set([(random() - 0.5) * 22, (random() - 0.5) * 7, -1.5 - random() * 6], i * 3);
      const t = random();
      color.copy(CYAN).lerp(VIOLET, Math.min(1, t * 2)).lerp(CORAL, Math.max(0, t * 2 - 1));
      color.toArray(dustColors, i * 3);
      dustSeeds[i] = random();
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aColor", new THREE.BufferAttribute(dustColors, 3));
    dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(dustSeeds, 1));
    this.dust = new THREE.Points(
      dustGeometry,
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: fragment,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: this.renderer.getPixelRatio() } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);

    // The ring of light when they touch
    this.ring = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: { uWave: { value: 0 }, uColor: { value: VIOLET.clone().lerp(new THREE.Color("#ffffff"), 0.4) } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.group.add(this.ring);
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Show the hands and fingertips; on narrow screens the forearms run off the edges
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    // Wide screens show the forearms too; the narrower the band, the closer the camera comes in on the fingers
    const wanted = THREE.MathUtils.mapLinear(THREE.MathUtils.clamp(this.camera.aspect, 1.3, 2.6), 1.3, 2.6, 7.5, 14);
    this.camera.position.z = Math.max(wanted / 2 / (tan * this.camera.aspect), 3.2 / 2 / tan);
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  /** 0..1: how far the visitor has scrolled through the hero. */
  setReach(value: number) {
    this.reach = value;
  }

  /** Close the gap completely (hovering the call to action). */
  setTouch(on: boolean) {
    this.touchTarget = on ? 1 : 0;
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
    if (!this.reducedMotion) {
      this.time += dt;
      this.intro = Math.min(1, this.intro + dt / 2.4);
    }
    this.touch = damp(this.touch, this.touchTarget, 5, dt);
    this.smoothPointer.x = damp(this.smoothPointer.x, this.pointer.x, 2.5, dt);
    this.smoothPointer.y = damp(this.smoothPointer.y, this.pointer.y, 2.5, dt);

    // How close the fingertips are: scroll gets them most of the way, the button closes the gap
    const close = Math.max(this.reach * 0.6, this.touch);
    // Even at rest they lean in and back, as if about to reach
    const lean = (Math.sin(this.time * 0.9) * 0.5 + 0.5) * 0.22 * (1 - close);
    const shift = (REST_GAP / 2 - 0.06) * close + lean;
    const gap = REST_GAP / 2 - shift;

    // A ring of light pulses out the moment they touch
    if (this.touch > 0.92 && this.armed) {
      this.armed = false;
      this.waving = true;
      this.wave = 0.001;
    }
    if (this.touch < 0.3) this.armed = true;
    if (this.waving) {
      this.wave += dt / 1.1;
      if (this.wave >= 1) {
        this.waving = false;
        this.wave = 0;
      }
    }

    const h = this.hands.material.uniforms;
    h.uTime.value = this.time;
    h.uIntro.value = this.intro;
    h.uShift.value = shift;
    h.uFlash.value = this.touch;

    const s = this.sparks.material.uniforms;
    s.uTime.value = this.time;
    (s.uTipL.value as THREE.Vector3).set(-gap, -0.06, 0);
    (s.uTipR.value as THREE.Vector3).set(gap, 0.06, 0);
    s.uSpark.value = this.intro * (0.45 + close * 0.55);

    this.ring.material.uniforms.uWave.value = this.wave;
    this.dust.material.uniforms.uTime.value = this.time;

    this.group.rotation.set(-this.smoothPointer.y * 0.12, this.smoothPointer.x * 0.2, 0);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.hands.geometry.dispose();
    this.hands.material.dispose();
    this.sparks.geometry.dispose();
    this.sparks.material.dispose();
    this.ring.geometry.dispose();
    this.ring.material.dispose();
    this.dust.geometry.dispose();
    this.dust.material.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

// --- Sampling a hand --------------------------------------------------------------------------

type Piece = { weight: number; sample: (random: () => number, out: THREE.Vector3) => void };

/** A tapered capsule from a to b, sampled through its volume (biased toward the skin, so it reads). */
function capsule(a: [number, number], b: [number, number], ra: number, rb: number, emphasis = 1): Piece {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const nx = -(b[1] - a[1]) / length;
  const ny = (b[0] - a[0]) / length;
  return {
    weight: length * (ra + rb) * 0.5 * 2.2 * emphasis,
    sample(random, out) {
      const t = random();
      const r = ra + (rb - ra) * t;
      const angle = random() * Math.PI * 2;
      const depth = random() < 0.4 ? 0.85 + random() * 0.15 : Math.sqrt(random());
      const across = Math.cos(angle) * r * depth;
      out.set(a[0] + (b[0] - a[0]) * t + nx * across, a[1] + (b[1] - a[1]) * t + ny * across, Math.sin(angle) * r * depth * 0.8);
    },
  };
}

const PIECES: Piece[] = [
  // Fingers carry the gesture, so they get the most motes; the forearm, fading off-screen, the fewest
  ...FINGERS.flatMap(({ points, radii }, f) =>
    points.slice(1).map((p, i) => capsule(points[i], p, radii[i], radii[i + 1], f === 0 ? 3 : f < 5 ? 2.2 : 0.55)),
  ),
  {
    // The palm: a flattened ellipsoid
    weight: PALM.rx * PALM.ry * 4.2,
    sample(random, out) {
      const angle = random() * Math.PI * 2;
      const d = random() < 0.3 ? 0.88 + random() * 0.12 : Math.sqrt(random());
      out.set(PALM.x + Math.cos(angle) * PALM.rx * d, PALM.y + Math.sin(angle) * PALM.ry * d, (random() - 0.5) * 0.7 * (1 - d * d * 0.5));
    },
  },
];
const TOTAL = PIECES.reduce((sum, piece) => sum + piece.weight, 0);

function sampleHand(random: () => number, out: THREE.Vector3) {
  let pick = random() * TOTAL;
  for (const piece of PIECES) {
    pick -= piece.weight;
    if (pick <= 0) {
      piece.sample(random, out);
      return;
    }
  }
  PIECES[PIECES.length - 1].sample(random, out);
}

/** Small seeded random so the hands look the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
