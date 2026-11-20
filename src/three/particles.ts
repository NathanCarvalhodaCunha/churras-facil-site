import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DynamicDrawUsage,
  LinearFilter,
  LinearMipmapLinearFilter,
  NormalBlending,
  Points,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
} from 'three';
import { GLSL_NOISE, createRandom } from './noise';

/** Faíscas de brasa subindo — posição calculada na GPU a partir do tempo (sem custo de CPU por frame) */
export function createEmbers(count: number) {
  const rand = createRandom(1337);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds[i * 4] = rand(); // posição horizontal
    seeds[i * 4 + 1] = 0.55 + rand() * 0.9; // velocidade
    seeds[i * 4 + 2] = rand(); // fase
    seeds[i * 4 + 3] = rand(); // tamanho
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 4));

  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uPixelRatio: { value: 1 },
      uOrigin: { value: new Vector3() },
      uArea: { value: new Vector3(10, 6, 2) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform vec3 uOrigin;
      uniform vec3 uArea;
      attribute vec4 aSeed;
      varying float vLife;
      varying float vFlicker;
      void main() {
        float life = fract(uTime * aSeed.y * 0.11 + aSeed.z);
        vec3 p = uOrigin;
        p.x += (aSeed.x - 0.5) * uArea.x + sin(life * 6.2831 * (0.5 + aSeed.w) + aSeed.z * 20.0) * 0.28 + life * 0.6;
        p.y += life * uArea.y;
        p.z += (fract(aSeed.z * 7.13) - 0.5) * uArea.z;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = (1.6 + aSeed.w * 3.4) * uPixelRatio * (1.0 - life * 0.55);
        gl_PointSize = size * (14.0 / -mv.z);
        vLife = life;
        vFlicker = 0.55 + 0.45 * sin(uTime * (5.0 + aSeed.w * 9.0) + aSeed.z * 40.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      varying float vLife;
      varying float vFlicker;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.5, 0.0, d);
        float a = core * core * smoothstep(0.0, 0.1, vLife) * (1.0 - smoothstep(0.5, 1.0, vLife)) * vFlicker * uIntensity;
        vec3 col = mix(vec3(1.0, 0.8, 0.42), vec3(1.0, 0.34, 0.07), smoothstep(0.05, 0.65, vLife));
        gl_FragColor = vec4(col, a);
      }
    `,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return { points, material, geometry };
}

/** Fumaça: poucos sprites grandes com ruído animado */
export function createSmoke(count: number) {
  const rand = createRandom(4242);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds[i * 4] = rand();
    seeds[i * 4 + 1] = 0.5 + rand() * 0.6;
    seeds[i * 4 + 2] = i / count + rand() * 0.1;
    seeds[i * 4 + 3] = rand();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 4));

  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uPixelRatio: { value: 1 },
      uOrigin: { value: new Vector3() },
      uArea: { value: new Vector3(4, 5, 1) },
      uSize: { value: 260 },
      uMaxSize: { value: 512 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform vec3 uOrigin;
      uniform vec3 uArea;
      uniform float uSize;
      uniform float uMaxSize;
      attribute vec4 aSeed;
      varying float vLife;
      varying float vSeed;
      void main() {
        float life = fract(uTime * 0.035 * aSeed.y + aSeed.z);
        vec3 p = uOrigin;
        p.x += (aSeed.x - 0.5) * uArea.x + life * 0.9 * (aSeed.w - 0.3);
        p.y += life * uArea.y;
        p.z += (aSeed.w - 0.5) * uArea.z - 0.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(uSize * (0.55 + life * 0.9) * uPixelRatio * (14.0 / -mv.z), uMaxSize);
        vLife = life;
        vSeed = aSeed.w;
      }
    `,
    fragmentShader: /* glsl */ `
      #define CF_OCTAVES 2
      uniform float uTime;
      uniform float uIntensity;
      varying float vLife;
      varying float vSeed;
      ${GLSL_NOISE}
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float r = length(uv);
        float n = snoise(vec3(uv * 2.6 + vSeed * 10.0, uTime * 0.07 + vSeed * 3.0)) * 0.5 + 0.5;
        n += snoise(vec3(uv * 5.5 - vSeed * 4.0, uTime * 0.11)) * 0.22;
        float a = smoothstep(0.5, 0.06, r) * clamp(n, 0.0, 1.0);
        a *= smoothstep(0.0, 0.25, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
        a *= uIntensity * 0.15;
        vec3 col = mix(vec3(0.55, 0.47, 0.42), vec3(0.85, 0.5, 0.28), (1.0 - vLife) * 0.45);
        gl_FragColor = vec4(col, a);
      }
    `,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 2;
  return { points, material, geometry };
}

/** Textura de um tufo de fumaça, desenhada uma vez (densidade em tons de cinza): mais leve que ruído por pixel */
function createPuffTexture(size = 128) {
  const rand = createRandom(4711);
  const G = 8;
  const grid = new Float32Array(G * G);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const wrap = (n: number) => ((n % G) + G) % G;
  const valueNoise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = grid[wrap(yi) * G + wrap(xi)];
    const b = grid[wrap(yi) * G + wrap(xi + 1)];
    const c = grid[wrap(yi + 1) * G + wrap(xi)];
    const d = grid[wrap(yi + 1) * G + wrap(xi + 1)];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      let f = 0;
      let amp = 0.5;
      let freq = 3;
      for (let o = 0; o < 4; o++) {
        f += amp * valueNoise(nx * freq + o * 1.7, ny * freq + o * 3.1);
        amp *= 0.5;
        freq *= 2;
      }
      const dx = nx * 2 - 1;
      const dy = ny * 2 - 1;
      const fall = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      const soft = fall * fall * (3 - 2 * fall);
      const density = Math.min(1, Math.max(0, (f - 0.24) * 2.0)) * soft;
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.round(density * 255);
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Fumaça saindo da carne. Diferente das brasas, cada tufo guarda a própria posição (simulação na CPU,
 * poucas dezenas de partículas): nasce em cima do espeto, onde ele estiver naquele instante, e sobe
 * sozinho, abrindo e sumindo — quando o espeto se move com a rolagem, fica um rastro natural.
 */
export function createSkewerSmoke(count: number) {
  const rand = createRandom(9137);
  const positions = new Float32Array(count * 3);
  const life = new Float32Array(count).fill(1); // 0 → 1 (1 = livre)
  const seeds = new Float32Array(count * 2); // [semente, tamanho]
  const velocity = new Float32Array(count * 3);
  const age = new Float32Array(count);
  const lifespan = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i * 2] = rand();
    seeds[i * 2 + 1] = 0.75 + rand() * 0.6;
  }
  const geometry = new BufferGeometry();
  const positionAttr = new BufferAttribute(positions, 3).setUsage(DynamicDrawUsage);
  const lifeAttr = new BufferAttribute(life, 1).setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', positionAttr);
  geometry.setAttribute('aLife', lifeAttr);
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 2));

  const texture = createPuffTexture();
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
    uniforms: {
      uPuff: { value: texture },
      uIntensity: { value: 1 },
      uScale: { value: 1 },
      uViewportH: { value: 800 },
      uMaxSize: { value: 420 },
    },
    vertexShader: /* glsl */ `
      uniform float uScale;
      uniform float uViewportH;
      uniform float uMaxSize;
      attribute float aLife;
      attribute vec2 aSeed;
      varying float vLife;
      varying float vAngle;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        // diâmetro em unidades do mundo: nasce pequeno junto da carne e abre ao subir
        float world = uScale * aSeed.y * (0.3 + aLife * 0.85);
        float px = world * uViewportH * 0.5 * projectionMatrix[1][1] / -mv.z;
        gl_PointSize = aLife >= 1.0 ? 0.0 : min(px, uMaxSize);
        vLife = aLife;
        vAngle = aSeed.x * 6.2831 + aLife * (aSeed.x - 0.5) * 2.4;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPuff;
      uniform float uIntensity;
      varying float vLife;
      varying float vAngle;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float c = cos(vAngle);
        float s = sin(vAngle);
        uv = mat2(c, -s, s, c) * uv;
        float density = texture2D(uPuff, uv + 0.5).r;
        float a = density * smoothstep(0.0, 0.12, vLife) * (1.0 - smoothstep(0.3, 0.95, vLife));
        a *= uIntensity * 0.62;
        // branca e quente junto da carne, cinza mais fria quando já subiu
        vec3 col = mix(vec3(0.96, 0.91, 0.85), vec3(0.74, 0.72, 0.7), vLife);
        gl_FragColor = vec4(col, a);
      }
    `,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 3;

  const AVG_LIFE = 2.8;
  const point = new Vector3();
  let toSpawn = 0;
  let cursor = 0;

  /**
   * @param scale tamanho atual do espeto (a fumaça acompanha a escala)
   * @param intensity 0 → 1: quanto sai de fumaça (some junto com a brasa)
   * @param emit escreve em `out` um ponto de saída, em coordenadas do mundo
   */
  function update(dt: number, time: number, scale: number, intensity: number, emit: (out: Vector3) => void) {
    material.uniforms.uScale.value = scale;
    material.uniforms.uIntensity.value = intensity;

    toSpawn += (count / AVG_LIFE) * intensity * dt;
    while (toSpawn >= 1) {
      toSpawn -= 1;
      let slot = -1;
      for (let k = 0; k < count; k++) {
        const j = (cursor + k) % count;
        if (life[j] >= 1) {
          slot = j;
          break;
        }
      }
      if (slot < 0) {
        toSpawn = 0;
        break;
      }
      cursor = (slot + 1) % count;
      emit(point);
      positions[slot * 3] = point.x;
      positions[slot * 3 + 1] = point.y;
      positions[slot * 3 + 2] = point.z;
      velocity[slot * 3] = (rand() - 0.5) * 0.16 * scale;
      velocity[slot * 3 + 1] = (0.4 + rand() * 0.3) * scale;
      velocity[slot * 3 + 2] = (rand() - 0.5) * 0.1 * scale;
      age[slot] = 0;
      lifespan[slot] = AVG_LIFE * (0.75 + rand() * 0.5);
      life[slot] = 0;
    }

    const drag = Math.exp(-0.7 * dt);
    for (let i = 0; i < count; i++) {
      if (life[i] >= 1) continue;
      age[i] += dt;
      life[i] = Math.min(1, age[i] / lifespan[i]);
      const seed = seeds[i * 2];
      const v = i * 3;
      // sobe por empuxo, balança de leve e é levada por uma brisa fraca para a direita
      velocity[v] = (velocity[v] + (Math.sin(time * 0.9 + seed * 12) * 0.09 + 0.035) * scale * dt) * drag;
      velocity[v + 1] = velocity[v + 1] * Math.exp(-0.12 * dt) + 0.16 * scale * dt;
      velocity[v + 2] = (velocity[v + 2] + Math.cos(time * 0.7 + seed * 7) * 0.05 * scale * dt) * drag;
      positions[v] += velocity[v] * dt;
      positions[v + 1] += velocity[v + 1] * dt;
      positions[v + 2] += velocity[v + 2] * dt;
    }
    positionAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
  }

  return { points, material, geometry, texture, update };
}
