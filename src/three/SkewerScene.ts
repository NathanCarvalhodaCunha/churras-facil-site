import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { createMeatGeometry, createShellGeometry, createStickGeometry } from './geometry';
import { SURFACE, createFoodMaterial, setSurface } from './materials';
import { createEmbers, createSkewerSmoke, createSmoke } from './particles';
import { createRandom, smoothstep } from './noise';

export interface StageMeasure {
  /** tamanho do canvas em px CSS */
  width: number;
  height: number;
  /** área onde o espeto começa (posição relativa ao canvas) */
  anchor: { x: number; y: number; w: number; h: number } | null;
  /** linha (y, relativa ao canvas) onde termina o Hero e começa a próxima seção */
  boundary: number;
}

export interface SkewerSceneOptions {
  reducedMotion: boolean;
  /** WebGL por software (Windows sem aceleração de vídeo): começa na qualidade mínima e pode baixar a resolução */
  software?: boolean;
  /** progresso da rolagem do Hero, 0 → 1 */
  getProgress: () => number;
  measure: () => StageMeasure;
  /** elementos cujo redimensionamento exige recalcular o layout */
  observe?: Element[];
  onContextLost?: () => void;
  /** chamado quando nem a qualidade mínima passa de ~14 quadros por segundo (o site troca o 3D pela foto) */
  onTooSlow?: () => void;
}

interface Pose {
  x: number;
  y: number;
  z: number;
  scale: number;
  tilt: number;
  yaw: number;
}

interface Quality {
  tier: 'low' | 'medium' | 'high';
  dpr: number;
  segments: number;
  shellSegments: number;
  shadows: boolean;
  shadowSize: number;
  embers: number;
  smoke: number;
  /** tufos de fumaça saindo da carne */
  wisps: number;
  octaves: number;
  antialias: boolean;
}

const FOV = 30;
const CAM_Z = 14;
/** fração da rolagem do Hero usada para girar e levar o espeto ao centro; o resto é a pausa no centro */
const TRAVEL = 0.62;
const rad = MathUtils.degToRad;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const bez = (a: number, b: number, c: number, t: number) => {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
};
const nextTick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Qualidade proporcional ao aparelho */
function pickQuality(software = false): Quality {
  const dpr = window.devicePixelRatio || 1;
  if (software) {
    return { tier: 'low', dpr: 1, segments: 10, shellSegments: 6, shadows: false, shadowSize: 512, embers: 20, smoke: 2, wisps: 12, octaves: 2, antialias: false };
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.screen.width, window.screen.height) < 760;

  if (memory <= 2 || cores <= 2) {
    return { tier: 'low', dpr: 1, segments: 10, shellSegments: 6, shadows: false, shadowSize: 512, embers: 28, smoke: 3, wisps: 18, octaves: 2, antialias: false };
  }
  if (coarse || small || memory <= 4) {
    return { tier: 'medium', dpr: Math.min(dpr, 1.6), segments: 14, shellSegments: 8, shadows: true, shadowSize: 1024, embers: 60, smoke: 5, wisps: 28, octaves: 3, antialias: true };
  }
  return { tier: 'high', dpr: Math.min(dpr, 1.75), segments: 20, shellSegments: 12, shadows: true, shadowSize: 2048, embers: 110, smoke: 8, wisps: 40, octaves: 4, antialias: true };
}

/**
 * Cena do espetinho 3D: modelagem procedural, iluminação cinematográfica,
 * brasas e fumaça. A rotação, a posição e a escala seguem o progresso da rolagem.
 */
export class SkewerScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  private readonly root = new Group();
  private readonly spinner = new Group();
  // luz clara de estúdio, como na foto do espetinho bovino Kispeto, com um toque quente da brasa por baixo
  private readonly keyLight = new DirectionalLight('#fff4e6', 4.6);
  private readonly rimLight = new DirectionalLight('#ffd2a8', 1.2);
  private readonly fillLight = new HemisphereLight('#fff1e2', '#b07a58', 1.5);
  private readonly glowLight = new PointLight('#ff9a5c', 2, 12, 2);
  private readonly topLight = new DirectionalLight('#ffffff', 1.8);
  private readonly quality: Quality;
  private readonly embers: ReturnType<typeof createEmbers>;
  private readonly smoke: ReturnType<typeof createSmoke>;
  private readonly wisps: ReturnType<typeof createSkewerSmoke>;
  private readonly wispRand = createRandom(2718);
  private wispIntensity = 0;
  private readonly disposables: Array<{ dispose: () => void }> = [];

  private poses: [Pose, Pose, Pose] | null = null;
  private skewerLength = 7;
  /** distância (em unidades do espeto) entre o centro do palito e o centro dos pedaços de carne */
  private meatOffset = 0;
  /** metade do comprimento da parte com carne (é dali que sai a fumaça) */
  private meatHalfSpan = 1;
  private progress = 0;
  private introStart = 0;
  /** relógio das animações automáticas (segundos); para quando as animações são pausadas */
  private clock = 0;
  private paused = false;
  private raf = 0;
  private running = false;
  private visible = true;
  private ready = false;
  private destroyed = false;
  private lastTime = 0;
  private lastFrameAt = 0;
  private samples: number[] = [];
  private dpr: number;
  private view = { width: 1, height: 1, viewW: 1, viewH: 1 };
  private resizeObserver?: ResizeObserver;
  private intersection?: IntersectionObserver;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: SkewerSceneOptions,
  ) {
    this.quality = pickQuality(options.software);
    this.dpr = this.quality.dpr;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: this.quality.antialias,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
      // sem placa de vídeo o navegador recusa o contexto (o modo "software" é decidido antes, em three/support.ts)
      failIfMajorPerformanceCaveat: !options.software,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.renderer.shadowMap.enabled = this.quality.shadows;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.setPixelRatio(this.dpr);

    this.camera.position.set(0, 0, CAM_Z);
    this.camera.lookAt(0, 0, 0);

    this.embers = createEmbers(this.quality.embers);
    this.smoke = createSmoke(this.quality.smoke);
    this.wisps = createSkewerSmoke(this.quality.wisps);

    canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
  }

  /** Monta a cena em etapas curtas (sem travar a página) e começa a renderizar */
  async init(): Promise<void> {
    this.buildLights();
    await this.buildSkewer();
    if (this.destroyed) return;

    this.scene.add(this.root, this.embers.points, this.smoke.points, this.wisps.points);
    this.root.add(this.spinner);
    this.root.rotation.order = 'ZYX';

    this.relayout();
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch {
      /* compilação síncrona no primeiro frame */
    }
    if (this.destroyed) return;

    this.ready = true;
    if (import.meta.env.DEV) (window as unknown as { __skewer?: SkewerScene }).__skewer = this;
    this.introStart = this.paused ? this.clock - 2 : this.clock;
    this.progress = this.options.reducedMotion ? 0 : clamp01(this.options.getProgress());

    this.resizeObserver = new ResizeObserver(() => this.relayout());
    this.resizeObserver.observe(this.canvas);
    this.options.observe?.forEach((el) => this.resizeObserver?.observe(el));
    window.addEventListener('load', this.relayout);

    if (this.options.reducedMotion) {
      this.renderFrame(performance.now());
      return;
    }
    this.intersection = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.start();
        else this.stop();
      },
      { rootMargin: '120px 0px' },
    );
    this.intersection.observe(this.canvas);
    this.start();
  }

  /** Recalcula tamanho do canvas e o caminho do espeto */
  relayout = () => {
    if (this.destroyed) return;
    const m = this.options.measure();
    if (m.width < 2 || m.height < 2) return;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(m.width, m.height, false);
    this.camera.aspect = m.width / m.height;
    this.camera.updateProjectionMatrix();
    const viewH = 2 * CAM_Z * Math.tan(rad(FOV / 2));
    this.view = { width: m.width, height: m.height, viewW: viewH * this.camera.aspect, viewH };
    this.computePoses(m);
    this.embers.material.uniforms.uPixelRatio.value = this.dpr;
    this.smoke.material.uniforms.uPixelRatio.value = this.dpr;
    this.wisps.material.uniforms.uViewportH.value = m.height * this.dpr;
    if (this.ready && !this.running) this.renderFrame(performance.now());
  };

  dispose() {
    this.destroyed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersection?.disconnect();
    window.removeEventListener('load', this.relayout);
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.disposables.forEach((d) => d.dispose());
    this.embers.geometry.dispose();
    this.embers.material.dispose();
    this.smoke.geometry.dispose();
    this.smoke.material.dispose();
    this.wisps.geometry.dispose();
    this.wisps.material.dispose();
    this.wisps.texture.dispose();
    this.renderer.dispose();
  }

  /* ------------------------------------------------------------------ */

  private start() {
    if (this.running || !this.ready || this.destroyed) return;
    this.running = true;
    this.lastTime = 0;
    this.lastFrameAt = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    this.renderFrame(now);
    this.adaptQuality(now);
  };

  /** "Pausar animações": congela o que se move sozinho (balanço, brasas, fumaça); a rolagem continua mexendo o espeto */
  setPaused(paused: boolean) {
    this.paused = paused;
    // se pausar antes da entrada terminar, o espeto aparece inteiro de uma vez
    if (paused) this.introStart = Math.min(this.introStart, this.clock - 2);
  }

  private renderFrame(now: number) {
    if (!this.poses) return;
    const real = now / 1000;
    const dt = this.lastTime ? Math.min(0.05, real - this.lastTime) : 1 / 60;
    this.lastTime = real;
    // relógio das animações automáticas: para de andar quando a pessoa pausa as animações
    const animDt = this.paused ? 0 : dt;
    this.clock += animDt;
    const time = this.clock;

    if (this.options.reducedMotion) {
      this.progress = 0;
    } else {
      const target = clamp01(this.options.getProgress());
      this.progress += (target - this.progress) * (1 - Math.exp(-dt * 7.5));
      if (Math.abs(target - this.progress) < 1e-4) this.progress = target;
    }

    this.update(time);
    // fumaça saindo da carne: nasce onde o espeto está agora e sobe sozinha
    this.root.updateMatrixWorld(true);
    this.wisps.update(animDt, time, this.root.scale.x, this.wispIntensity, this.emitWisp);
    this.renderer.render(this.scene, this.camera);
  }

  /** Reduz a resolução (e depois as sombras) se o aparelho não sustentar a taxa de quadros */
  private adaptQuality(now: number) {
    const delta = this.lastFrameAt ? now - this.lastFrameAt : 0;
    this.lastFrameAt = now;
    if (delta <= 0 || delta > 1000) return;
    this.samples.push(delta);
    if (this.samples.length < (this.options.software ? 30 : 90)) return;
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.samples.length = 0;
    if (avg <= 26) return;
    // por software dá para baixar a resolução abaixo da tela (fica um pouco mais suave, mas fluido)
    const minDpr = this.options.software ? 0.5 : 1;
    if (this.dpr > minDpr) {
      this.dpr = Math.max(minDpr, this.dpr - 0.35);
      this.relayout();
    } else if (this.keyLight.castShadow) {
      this.keyLight.castShadow = false;
    } else if (avg > 70) {
      // nem na qualidade mínima passa de ~14 quadros por segundo: melhor a foto do que a página travando
      this.options.onTooSlow?.();
    }
  }

  /**
   * Fase 1 (0 → TRAVEL): o espeto gira uma volta completa e viaja até o centro da tela.
   * Fase 2 (TRAVEL → 1): ele fica parado no centro, com um leve "respiro" de escala.
   */
  private evaluate(p: number): Pose {
    const [a, b, c] = this.poses!;
    const t = easeInOutCubic(clamp01(p / TRAVEL));
    const hold = easeOutExpo(clamp01((p - TRAVEL) / (1 - TRAVEL)));
    return {
      x: bez(a.x, b.x, c.x, t),
      y: bez(a.y, b.y, c.y, t),
      z: bez(a.z, b.z, c.z, t),
      scale: bez(a.scale, b.scale, c.scale, t) * (1 + 0.05 * hold),
      tilt: bez(a.tilt, b.tilt, c.tilt, t),
      yaw: bez(a.yaw, b.yaw, c.yaw, t) - rad(5) * hold,
    };
  }

  private update(time: number) {
    const p = this.progress;
    const pose = this.evaluate(p);
    const reduced = this.options.reducedMotion;
    const intro = reduced ? 1 : easeOutExpo(clamp01((time - this.introStart) / 1.9));
    // a brasa continua acesa (o espeto segue na churrasqueira), só diminui um pouco no centro
    const fire = 1 - 0.45 * smoothstep(0.45, 1, p);
    const s = pose.scale;
    const float = reduced ? 0 : Math.sin(time * 0.9) * 0.022;

    // espeto: posição, inclinação e perspectiva vêm da rolagem; o giro acompanha o progresso
    this.root.position.set(pose.x, pose.y + (float - (1 - intro) * 0.32) * s * 3, pose.z);
    this.root.scale.setScalar(s * (0.95 + 0.05 * intro));
    this.root.rotation.set(0, pose.yaw, pose.tilt);
    this.spinner.rotation.x = easeInOutCubic(clamp01(p / TRAVEL)) * Math.PI * 2;

    // luz clara de estúdio (frente, cima e rebatida da mesa), como na foto do produto;
    // a brasa só esquenta um pouco o lado de baixo
    const flicker = reduced ? 1 : 0.86 + 0.14 * Math.sin(time * 7.3) * Math.sin(time * 3.1 + 1.3);
    this.keyLight.position.set(pose.x - 4 * s, pose.y + 6 * s, pose.z + 7 * s);
    this.keyLight.target.position.set(pose.x, pose.y, pose.z);
    this.keyLight.intensity = (4.6 + 0.6 * (1 - fire)) * intro;
    this.rimLight.position.set(pose.x + 6 * s, pose.y + 2.2 * s, pose.z - 6 * s);
    this.rimLight.target.position.set(pose.x, pose.y, pose.z);
    this.rimLight.intensity = (0.9 + 0.6 * fire) * smoothstep(0.1, 1, intro);
    this.glowLight.position.set(pose.x, pose.y - 2.6 * s, pose.z + 1.2 * s);
    this.glowLight.distance = 14 * s;
    this.glowLight.intensity = (0.3 + 1.4 * fire) * flicker * intro * s * s;
    this.fillLight.intensity = (1.6 + 0.3 * (1 - fire)) * intro;
    this.topLight.target.position.set(pose.x, pose.y, pose.z);
    this.topLight.position.set(pose.x - 1 * s, pose.y + 9 * s, pose.z + 1.5 * s);
    this.topLight.intensity = (1.7 + 0.4 * (1 - fire)) * intro;

    if (this.keyLight.castShadow) {
      const half = this.skewerLength * s * 0.62;
      const cam = this.keyLight.shadow.camera;
      if (Math.abs(cam.right - half) > 0.02) {
        cam.left = -half;
        cam.right = half;
        cam.top = half;
        cam.bottom = -half;
        cam.near = 0.5;
        cam.far = 24 * s + 12;
        cam.updateProjectionMatrix();
      }
    }

    // brasas e fumaça somem quando o espeto sai da churrasqueira
    const particles = reduced ? 0 : fire * intro;
    this.embers.material.uniforms.uTime.value = time;
    this.embers.material.uniforms.uIntensity.value = particles;
    this.smoke.material.uniforms.uTime.value = time;
    this.smoke.material.uniforms.uIntensity.value = particles;
    this.embers.points.visible = particles > 0.003;
    this.smoke.points.visible = particles > 0.003;
    this.wispIntensity = particles;
  }

  /** ponto de saída de um tufo de fumaça: em cima de um pedaço de carne qualquer, em coordenadas do mundo */
  private emitWisp = (out: Vector3) => {
    const r = this.wispRand;
    const s = this.root.scale.x;
    // ponto do eixo do palito (o giro do espeto não o move) e, a partir dele, para cima na tela
    out.set((r() * 2 - 1) * this.meatHalfSpan * 0.9, 0, 0).applyMatrix4(this.spinner.matrixWorld);
    out.y += (0.26 + r() * 0.14) * s;
    out.z += (r() - 0.5) * 0.25 * s;
  };

  /** Três poses: inicial (inclinado, ao lado do texto), meio (perto da câmera) e final (centralizado na tela) */
  private computePoses(m: StageMeasure) {
    const { viewW, viewH } = this.view;
    const cw = m.width;
    const ch = m.height;
    const toX = (px: number) => (px / cw - 0.5) * viewW;
    const toY = (py: number) => (0.5 - py / ch) * viewH;
    const unit = viewW / cw;
    const L = this.skewerLength;
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    const tablet = !desktop && cw >= 640;

    const a = m.anchor ?? { x: cw * 0.52, y: ch * 0.2, w: cw * 0.44, h: ch * 0.45 };
    const ax = toX(a.x + a.w / 2);
    const ay = toY(a.y + a.h / 2);
    const by = toY(m.boundary);

    const len0 = desktop ? Math.min(a.w * 1.28, cw * 0.5, 900) : tablet ? Math.min(cw * 0.86, 720) : Math.min(cw * 1.08, 720);
    const p0: Pose = {
      x: desktop ? ax - a.w * 0.07 * unit : ax,
      y: ay,
      z: 0,
      scale: (len0 * unit) / L,
      tilt: rad(desktop ? 21 : 16),
      yaw: rad(-22),
    };

    // pose final: a carne centralizada na tela, levemente acima do meio (abre espaço para a chamada abaixo)
    const len2 = desktop ? Math.min(cw * 0.6, 980) : tablet ? Math.min(cw * 0.86, 780) : cw * 1.32;
    const cy = toY(ch * (desktop ? 0.47 : 0.45));
    const s2 = (len2 * unit) / L;
    const p2: Pose = { x: -this.meatOffset * s2, y: cy, z: 0, scale: s2, tilt: rad(-3), yaw: rad(6) };

    const p1: Pose = {
      x: desktop ? ax * 0.45 : 0,
      y: (ay + cy) / 2 + viewH * 0.05,
      z: desktop ? 1.4 : 0.8,
      scale: Math.max(p0.scale, p2.scale) * 1.04,
      tilt: rad(desktop ? 9 : 7),
      yaw: rad(32),
    };
    this.poses = [p0, p1, p2];

    const embersU = this.embers.material.uniforms;
    embersU.uOrigin.value.set(desktop ? ax * 0.4 : 0, by, -0.6);
    embersU.uArea.value.set(viewW * (desktop ? 0.8 : 1.1), viewH * 0.8, 3);
    const smokeU = this.smoke.material.uniforms;
    smokeU.uOrigin.value.set(ax * (desktop ? 0.85 : 0.4), ay - viewH * 0.1, -1.4);
    smokeU.uArea.value.set(Math.min(viewW * 0.5, 5.5), viewH * 0.7, 1.6);
    smokeU.uSize.value = desktop ? 300 : 210;
  }

  private buildLights() {
    const key = this.keyLight;
    key.castShadow = this.quality.shadows;
    key.shadow.mapSize.set(this.quality.shadowSize, this.quality.shadowSize);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    // luz de recorte suave por cima (substitui o mapa de ambiente: mais leve de compilar)
    this.topLight.position.set(0, 10, 2);
    this.scene.add(key, key.target, this.rimLight, this.rimLight.target, this.fillLight, this.glowLight, this.topLight, this.topLight.target);
  }

  private async buildSkewer() {
    const q = this.quality;
    const rand = createRandom(20261111);
    const food = createFoodMaterial(q.octaves);
    const material = food.material;
    this.disposables.push(material);

    type Spec = { kind: 'meat'; size: [number, number, number] } | { kind: 'pepper'; tone: 'red' | 'green' } | { kind: 'onion' };
    // espetinho bovino (como o da Kispeto): 9 pedaços pequenos e irregulares, apertados uns contra os outros.
    // Para voltar com legumes, intercale { kind: 'pepper', tone: 'red' | 'green' } ou { kind: 'onion' }.
    const sizeRand = createRandom(424242);
    const specs: Spec[] = Array.from({ length: 10 }, () => ({
      kind: 'meat' as const,
      size: [0.44 + sizeRand() * 0.16, 0.56 + sizeRand() * 0.26, 0.52 + sizeRand() * 0.26] as [number, number, number],
    }));

    const pieces: { obj: Object3D; min: number; max: number }[] = [];
    const box = new Box3();
    let seed = 11;

    for (const spec of specs) {
      let obj: Object3D;
      if (spec.kind === 'meat') {
        const geo = createMeatGeometry(q.segments, seed++, new Vector3(...spec.size));
        setSurface(geo, SURFACE.meat);
        this.disposables.push(geo);
        obj = new Mesh(geo, material);
        // cada pedaço espetado num ângulo diferente e um pouco fora do eixo: o espeto fica irregular, como o de verdade
        obj.rotation.set(rand() * Math.PI * 2, (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5);
        obj.position.set(0, (rand() - 0.5) * 0.16, (rand() - 0.5) * 0.16);
      } else if (spec.kind === 'pepper') {
        const geo = createShellGeometry({
          width: 0.86,
          height: 0.8,
          thickness: 0.075,
          radius: 0.95,
          spherical: false,
          segments: q.shellSegments,
          seed: seed++,
          jag: 0.09,
        });
        setSurface(geo, spec.tone === 'red' ? SURFACE.pepperRed : SURFACE.pepperGreen);
        this.disposables.push(geo);
        obj = new Mesh(geo, material);
        obj.rotation.set(rand() * Math.PI * 2, rand() > 0.5 ? Math.PI : 0, 0, 'YXZ');
      } else {
        const group = new Group();
        for (let k = 0; k < 3; k++) {
          const geo = createShellGeometry({
            width: 0.92,
            height: 0.86,
            thickness: 0.066,
            radius: 1.05 + k * 0.068,
            spherical: true,
            segments: q.shellSegments,
            seed: seed++,
            jag: 0.1,
          });
          setSurface(geo, SURFACE.onion);
          this.disposables.push(geo);
          const layer = new Mesh(geo, material);
          layer.position.set(k * 0.068, (rand() - 0.5) * 0.05, (rand() - 0.5) * 0.05);
          group.add(layer);
        }
        group.rotation.set(rand() * Math.PI * 2, rand() > 0.5 ? Math.PI : 0, 0, 'YXZ');
        obj = group;
      }
      obj.traverse((o) => {
        if ((o as Mesh).isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      obj.updateMatrixWorld(true);
      box.setFromObject(obj, true);
      pieces.push({ obj, min: box.min.x, max: box.max.x });
      await nextTick();
      if (this.destroyed) return;
    }

    // enfileira os pedaços da ponta (+X) para o cabo (−X); GAP negativo = pedaços apertados, encostando
    const GAP = -0.11;
    let cursor = 0;
    for (const piece of pieces) {
      const width = piece.max - piece.min;
      piece.obj.position.x += cursor - piece.max;
      cursor -= width + GAP;
    }
    const spanStart = 0;
    const spanEnd = cursor + GAP;
    const center = (spanStart + spanEnd) / 2;
    const halfSpan = (spanStart - spanEnd) / 2;
    this.meatHalfSpan = halfSpan;
    for (const piece of pieces) {
      piece.obj.position.x -= center;
      this.spinner.add(piece.obj);
    }

    // palito de bambu: ponta exposta à frente e cabo atrás
    const tipLen = 0.62;
    const handleLen = 1.95;
    const stickLen = halfSpan * 2 + tipLen + handleLen;
    const stickGeo = createStickGeometry(stickLen, 0.045, q.tier === 'low' ? 8 : 14);
    setSurface(stickGeo, SURFACE.wood);
    food.setStick(stickLen - tipLen, handleLen);
    this.disposables.push(stickGeo);
    const stick = new Mesh(stickGeo, material);
    stick.position.x = halfSpan + tipLen - stickLen;
    stick.castShadow = true;
    stick.receiveShadow = true;
    this.spinner.add(stick);

    // centraliza o espeto inteiro (com cabo) na origem do grupo
    this.spinner.position.x = -(tipLen - handleLen) / 2;
    this.meatOffset = this.spinner.position.x;
    this.skewerLength = stickLen;
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.options.onContextLost?.();
  };
}
