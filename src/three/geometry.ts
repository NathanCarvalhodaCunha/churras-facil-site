import { BoxGeometry, BufferAttribute, BufferGeometry, LatheGeometry, Vector2, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createNoise3, createRandom, smoothstep } from './noise';

const clampAbs = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

/** Caixa subdividida com vértices soldados (sem costuras) para deformar livremente */
function weldedBox(w: number, h: number, d: number, sx: number, sy: number, sz: number): BufferGeometry {
  const box = new BoxGeometry(w, h, d, sx, sy, sz);
  box.deleteAttribute('normal');
  box.deleteAttribute('uv');
  const welded = mergeVertices(box, 1e-5);
  box.dispose();
  return welded;
}

/**
 * Pedaço de carne cortado na faca: faces quase retas, quinas arredondadas pelo cozimento,
 * corte levemente torto e calombos suaves (o detalhe fino fica no shader).
 * aEdge marca quinas e arestas (onde a brasa tosta mais); aSeed varia a textura por pedaço.
 */
export function createMeatGeometry(segments: number, seed: number, size: Vector3): BufferGeometry {
  const geo = weldedBox(1, 1, 1, segments, segments, segments);
  const pos = geo.getAttribute('position') as BufferAttribute;
  const count = pos.count;
  const edge = new Float32Array(count);
  const seeds = new Float32Array(count).fill((seed * 0.6180339) % 7);
  const n3 = createNoise3(seed);
  const rand = createRandom(seed * 7919 + 17);

  // cada pedaço é diferente: quinas arredondadas pelo cozimento, corte torto e um lado mais largo
  const radius = 0.14 + rand() * 0.1;
  const inner = 0.5 - radius;
  const shearY = (rand() - 0.5) * 0.16;
  const shearZ = (rand() - 0.5) * 0.16;
  const taper = (rand() - 0.5) * 0.2;
  // dois cortes de faca em ângulos aleatórios: facetas planas que deixam o pedaço irregular
  const cuts = [0, 1].map(() => {
    const n = new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    return { n, d: 0.3 + rand() * 0.1 };
  });

  const v = new Vector3();
  const core = new Vector3();
  const offset = new Vector3();
  const dir = new Vector3();

  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(pos, i);
    const a = [Math.abs(v.x) * 2, Math.abs(v.y) * 2, Math.abs(v.z) * 2].sort((p, q) => q - p);
    edge[i] = smoothstep(0.55, 1, a[1]) * (0.7 + 0.3 * smoothstep(0.55, 1, a[2]));
    // centro de cada face (1) → aresta (0): a carne contrai no fogo e as faces estufam um pouco
    const faceCenter = (1 - a[1]) * (1 - a[2]);

    // cubo de quinas arredondadas
    core.set(clampAbs(v.x, inner), clampAbs(v.y, inner), clampAbs(v.z, inner));
    offset.subVectors(v, core);
    if (offset.lengthSq() > 1e-12) v.copy(core).addScaledVector(offset.normalize(), radius);

    // o que passa do plano de corte é achatado contra ele (fica uma leve curva, não uma face perfeita)
    for (const cut of cuts) {
      const s = v.dot(cut.n);
      if (s > cut.d) v.addScaledVector(cut.n, -(s - cut.d) * 0.85);
    }

    dir.copy(v).normalize();
    const lump =
      n3(v.x * 1.5 + 3.1, v.y * 1.5, v.z * 1.5) * 0.11 +
      n3(v.x * 3.8, v.y * 3.8 + 7.7, v.z * 3.8) * 0.045 +
      n3(v.x * 9.0 + 1.3, v.y * 9.0, v.z * 9.0 + 4.2) * 0.01;
    v.addScaledVector(dir, lump + faceCenter * 0.045);

    // corte torto (em relação ao palito, no eixo X) e um lado mais largo que o outro
    v.y += v.x * shearY;
    v.z += v.x * shearZ;
    const widen = 1 + taper * v.y;
    v.x *= widen;
    v.z *= widen;

    v.multiply(size);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.setAttribute('aEdge', new BufferAttribute(edge, 1));
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}

interface ShellOptions {
  width: number;
  height: number;
  thickness: number;
  /** raio da curvatura */
  radius: number;
  /** true = calota esférica (cebola), false = curva cilíndrica (pimentão) */
  spherical: boolean;
  segments: number;
  seed: number;
  /** irregularidade do contorno */
  jag: number;
}

/**
 * Pedaço curvo com espessura (pimentão ou camada de cebola). A espessura fica no eixo X
 * (o eixo do espeto). aSide = 1 na face externa; aEdge = 1 na borda do corte.
 */
export function createShellGeometry({ width, height, thickness, radius, spherical, segments, seed, jag }: ShellOptions): BufferGeometry {
  const geo = weldedBox(thickness, height, width, 1, segments, segments);
  const pos = geo.getAttribute('position') as BufferAttribute;
  const count = pos.count;
  const side = new Float32Array(count);
  const edge = new Float32Array(count);
  const seeds = new Float32Array(count).fill((seed * 0.4142) % 7);
  const n3 = createNoise3(seed);
  const dir = new Vector3();

  for (let i = 0; i < count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    side[i] = x > 0 ? 1 : 0;
    const ry = y / (height / 2);
    const rz = z / (width / 2);
    edge[i] = Math.max(Math.abs(ry), Math.abs(rz));

    const ang = Math.atan2(y, z);
    const k = 1 + n3(Math.cos(ang) * 1.7 + 2.3, Math.sin(ang) * 1.7, seed * 0.013) * jag;
    const round = 1 - Math.abs(ry) * Math.abs(rz) * 0.18;
    y *= k * round;
    z *= k * round;

    const r = radius + x;
    if (spherical) {
      dir.set(radius, y, z).normalize();
      x = dir.x * r - radius;
      y = dir.y * r;
      z = dir.z * r;
    } else {
      const theta = z / radius;
      x = r * Math.cos(theta) - radius;
      z = r * Math.sin(theta);
    }
    pos.setXYZ(i, x, y, z);
  }

  geo.setAttribute('aSide', new BufferAttribute(side, 1));
  geo.setAttribute('aEdge', new BufferAttribute(edge, 1));
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}

/** Palito de bambu ao longo do eixo X, ponta afiada em +X */
export function createStickGeometry(length: number, radius: number, radialSegments: number): BufferGeometry {
  const L = length;
  const points = [
    new Vector2(0, L),
    new Vector2(radius * 0.14, L - 0.025),
    new Vector2(radius * 0.42, L - 0.14),
    new Vector2(radius * 0.74, L - 0.32),
    new Vector2(radius * 0.95, L - 0.52),
    new Vector2(radius, L - 0.7),
    new Vector2(radius, 0.04),
    new Vector2(radius * 0.92, 0),
    new Vector2(0, 0),
  ];
  const geo = new LatheGeometry(points, radialSegments);
  geo.rotateZ(-Math.PI / 2);
  geo.computeBoundingBox();
  return geo;
}
