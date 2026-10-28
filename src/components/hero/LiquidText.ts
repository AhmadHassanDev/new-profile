import * as THREE from "three";
import { NOISE } from "./shaders";

export type TextLine = { text: string; x: number; baseline: number };
export type TextStyle = { font: string; letterSpacing: number };

const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// The pointer's wake: velocity in xy, intensity in z. Each frame it flows along itself and fades.
const trailFragment = /* glsl */ `
uniform sampler2D uPrev;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform float uStrength;
uniform float uAspect;
varying vec2 vUv;
void main() {
  vec4 prev = texture2D(uPrev, vUv - texture2D(uPrev, vUv).xy * 0.01);
  prev *= vec4(0.955, 0.955, 0.94, 1.0);
  vec2 d = vUv - uMouse;
  d.x *= uAspect;
  float splat = exp(-dot(d, d) / 0.0035) * uStrength;
  prev.xy += uVelocity * splat;
  prev.z = min(prev.z + splat, 1.5);
  gl_FragColor = prev;
}
`;

const displayFragment = /* glsl */ `
uniform sampler2D uText;
uniform sampler2D uTrail;
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform vec3 uCoral;
uniform vec3 uActive;
varying vec2 vUv;
${NOISE}
void main() {
  vec4 wake = texture2D(uTrail, vUv);
  float s = clamp(wake.z, 0.0, 1.0);

  // Always a little molten; much more where the pointer has just been.
  vec2 idle = vec2(snoise(vec3(vUv * 3.0, uTime * 0.35)), snoise(vec3(vUv * 3.0 + 9.0, uTime * 0.35))) * 0.0018;
  vec2 churn = vec2(snoise(vec3(vUv * 9.0, uTime * 1.2)), snoise(vec3(vUv * 9.0 + 4.0, uTime * 1.2))) * 0.012 * s;
  vec2 disp = wake.xy * 0.045 + idle + churn;

  vec2 uv = vUv - disp;
  vec4 text = texture2D(uText, uv);
  float a = text.a;
  float ac = texture2D(uText, uv - disp * 0.45).a;
  float ar = texture2D(uText, uv + disp * 0.45).a;

  // Each line is drawn into its own channel (r, g, b), so each can light up in its own colour.
  vec3 lineInk = text.r * mix(uInk, uCyan, uActive.x)
               + text.g * mix(uInk, uViolet, uActive.y)
               + text.b * mix(uInk, uCoral, uActive.z);
  lineInk /= max(text.r + text.g + text.b, 0.0001);

  // Ink in the middle, the logo colours split off along the flow.
  vec3 col = lineInk * a + uCyan * max(ac - a, 0.0) + uCoral * max(ar - a, 0.0);
  col = mix(col, mix(col, uViolet * a, 0.35), s);
  gl_FragColor = vec4(col, max(a, max(ac, ar)));
}
`;

// Line i of the text is drawn in this colour, which the shader reads back as a per-line mask.
const LINE_CHANNELS = ["#ff0000", "#00ff00", "#0000ff"];

const rgb = (hex: string) => new THREE.Vector3(...new THREE.Color(hex).toArray());

/** The hero name as a molten surface that the pointer stirs. */
export class LiquidText {
  private renderer: THREE.WebGLRenderer;
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad = new THREE.PlaneGeometry(2, 2);
  private display: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private displayScene = new THREE.Scene();
  private trail: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private trailScene = new THREE.Scene();
  private targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private textCanvas = document.createElement("canvas");
  private textTexture = new THREE.CanvasTexture(this.textCanvas);
  private timer = new THREE.Timer();

  private size = { width: 1, height: 1 };
  private active = new THREE.Vector3();
  private pointer = new THREE.Vector2(-1, -1);
  private last = new THREE.Vector2(-1, -1);
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    const target = () =>
      new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    this.targets = [target(), target()];

    this.trail = new THREE.Mesh(
      this.quad,
      new THREE.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader: trailFragment,
        uniforms: {
          uPrev: { value: null },
          uMouse: { value: new THREE.Vector2(-1, -1) },
          uVelocity: { value: new THREE.Vector2() },
          uStrength: { value: 0 },
          uAspect: { value: 1 },
        },
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.trailScene.add(this.trail);

    this.textTexture.colorSpace = THREE.NoColorSpace;
    this.display = new THREE.Mesh(
      this.quad,
      new THREE.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader: displayFragment,
        uniforms: {
          uText: { value: this.textTexture },
          uTrail: { value: null },
          uTime: { value: 0 },
          uInk: { value: rgb("#edecf2") },
          uCyan: { value: rgb("#09c7fb") },
          uViolet: { value: rgb("#c471ed") },
          uCoral: { value: rgb("#f64f59") },
          uActive: { value: new THREE.Vector3() },
        },
        transparent: true,
        premultipliedAlpha: true,
        blending: THREE.NoBlending,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.displayScene.add(this.display);
  }

  /** Redraw the text (in CSS pixels, relative to the canvas) and resize everything to match. */
  setText(lines: TextLine[], style: TextStyle, width: number, height: number) {
    this.size = { width, height };
    const dpr = this.renderer.getPixelRatio();
    this.renderer.setSize(width, height, false);
    for (const t of this.targets) t.setSize(Math.ceil(width / 4), Math.ceil(height / 4));
    this.trail.material.uniforms.uAspect.value = width / height;

    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (pixelWidth !== this.textCanvas.width || pixelHeight !== this.textCanvas.height) {
      // GPU texture storage can't be resized in place: release it so it's reallocated at the new size.
      this.textTexture.dispose();
      this.textCanvas.width = pixelWidth;
      this.textCanvas.height = pixelHeight;
    }
    const ctx = this.textCanvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = style.font;
    ctx.textBaseline = "alphabetic";
    const spaced = ctx as { letterSpacing?: string };
    const native = typeof spaced.letterSpacing === "string";
    if (native) spaced.letterSpacing = `${style.letterSpacing}px`;
    lines.forEach((line, i) => {
      ctx.fillStyle = LINE_CHANNELS[i % LINE_CHANNELS.length];
      if (native) {
        ctx.fillText(line.text, line.x, line.baseline);
        return;
      }
      // Older browsers: lay the letters out by hand.
      let x = line.x;
      for (const ch of line.text) {
        ctx.fillText(ch, x, line.baseline);
        x += ctx.measureText(ch).width + style.letterSpacing;
      }
    });
    this.textTexture.needsUpdate = true;
    if (!this.running) this.render(0);
  }

  /** Which lines glow in their discipline colour: one 0..1 value per line. */
  setActive(lit: [boolean, boolean, boolean]) {
    this.active.set(Number(lit[0]), Number(lit[1]), Number(lit[2]));
    if (!this.running) {
      this.display.material.uniforms.uActive.value.copy(this.active);
      this.render(0);
    }
  }

  /** Pointer position in CSS pixels relative to the canvas. */
  setPointer(x: number, y: number) {
    this.pointer.set(x / this.size.width, 1 - y / this.size.height);
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
    const tu = this.trail.material.uniforms;
    const moved = this.last.x < 0 ? new THREE.Vector2() : this.pointer.clone().sub(this.last);
    this.last.copy(this.pointer);
    const speed = moved.length();
    tu.uMouse.value.copy(this.pointer);
    tu.uVelocity.value.copy(moved.multiplyScalar(40).clampLength(0, 1));
    tu.uStrength.value = Math.min(1, speed * 60);

    const [read, write] = this.targets;
    tu.uPrev.value = read.texture;
    this.renderer.setRenderTarget(write);
    this.renderer.render(this.trailScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.targets = [write, read];

    const du = this.display.material.uniforms;
    du.uActive.value.lerp(this.active, 1 - Math.exp(-dt * 5));
    du.uTrail.value = write.texture;
    du.uTime.value += dt;
    this.renderer.render(this.displayScene, this.camera);
  }

  dispose() {
    this.stop();
    this.quad.dispose();
    this.trail.material.dispose();
    this.display.material.dispose();
    this.targets.forEach((t) => t.dispose());
    this.textTexture.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
