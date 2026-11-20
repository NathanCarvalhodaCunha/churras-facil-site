import { BufferAttribute, Color, MeshStandardMaterial, type BufferGeometry } from 'three';
import { GLSL_NOISE } from './noise';

/** Tipos de superfície — gravados em cada vértice (atributo aType) */
export const SURFACE = { meat: 0, pepperRed: 1, pepperGreen: 2, onion: 3, wood: 4 } as const;

export function setSurface(geometry: BufferGeometry, type: number) {
  const count = geometry.getAttribute('position').count;
  geometry.setAttribute('aType', new BufferAttribute(new Float32Array(count).fill(type), 1));
}

/**
 * UM único material PBR para o espeto inteiro (carne, pimentões, cebola e bambu):
 * as texturas são procedurais (ruído 3D) e o tipo de superfície vem do atributo aType.
 * Um só programa de shader = compilação rápida, inclusive em celulares.
 */
export function createFoodMaterial(octaves: number) {
  const stick = { tipStart: 6, handleStart: 1.9 };
  const material = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0 });

  const uniforms = {
    // carne: tons de mogno do espetinho bovino (marrom avermelhado, caramelizado nas pontas)
    uMeat: { value: new Color('#69301a') },
    uCaramel: { value: new Color('#9c5c34') },
    uCrust: { value: new Color('#38170c') },
    uChar: { value: new Color('#100906') },
    uFat: { value: new Color('#c4904f') },
    uRedSkin: { value: new Color('#9c1a0c') },
    uRedDark: { value: new Color('#5a0d06') },
    uRedFlesh: { value: new Color('#c8492b') },
    uGreenSkin: { value: new Color('#3f6d1d') },
    uGreenDark: { value: new Color('#1f3c0d') },
    uGreenFlesh: { value: new Color('#86aa4f') },
    uOnion: { value: new Color('#e4d2ab') },
    uOnionDeep: { value: new Color('#c9ad7c') },
    uOnionBrown: { value: new Color('#9a5f27') },
    uOnionGlow: { value: new Color('#3a2408') },
    uWood: { value: new Color('#d6b07a') },
    uWoodDark: { value: new Color('#a4793f') },
    uTipStart: { value: stick.tipStart },
    uHandleStart: { value: stick.handleStart },
  };

  const varyings = 'varying vec3 vObj; varying vec3 vObjN; varying float vEdge; varying float vSide; varying float vSeed; varying float vType;';
  const uniformDecl = Object.entries(uniforms)
    .map(([name, u]) => `uniform ${u.value instanceof Color ? 'vec3' : 'float'} ${name};`)
    .join('\n');

  material.customProgramCacheKey = () => `cf-food-${octaves}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nattribute float aEdge; attribute float aSide; attribute float aSeed; attribute float aType;\n${varyings}`,
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvObj = position; vObjN = normal; vEdge = aEdge; vSide = aSide; vSeed = aSeed; vType = aType;',
      );

    const head = `#define CF_OCTAVES ${octaves}\n${varyings}\n${uniformDecl}\n${GLSL_NOISE}
float cf_char = 0.0; float cf_h = 0.0; float cf_gloss = 0.0; float cf_fat = 0.0; float cf_salt = 0.0;
float cf_rough = 0.6; float cf_bump = 1.0; vec3 cf_emis = vec3(0.0);
// some com o detalhe fino quando ele fica menor que o pixel (evita "chuvisco" e serrilhado)
float cf_lod(vec3 p, float freq) { return 1.0 - smoothstep(0.25, 0.8, length(fwidth(p)) * freq); }`;

    const color = /* glsl */ `
      vec3 cfCol;
      if (vType < 0.5) {
        // ——— carne bovina, como o espetinho bovino Kispeto: pedaços selados, úmidos de marinada e temperados ———
        vec3 mp = vObj + vec3(vSeed * 13.1, vSeed * 7.7, vSeed * 3.3);
        float lod = cf_lod(mp, 15.0);
        float nL = fbm3(mp * 1.9);                                           // manchas grandes
        float nM = snoise(mp * 5.0);                                         // variação média
        float nF = snoise(mp * 15.0) * lod;                                  // grão fino
        float fib = snoise(vec3(mp.x * 2.8, mp.y * 13.0, mp.z * 13.0)) * lod;  // fibras do músculo
        float pit = (1.0 - abs(snoise(mp * 10.0 + 5.0))) * cf_lod(mp, 10.0);  // pequenas cristas da selagem

        // mogno: marrom avermelhado, mais claro onde caramelizou, mais escuro onde selou mais
        float caramel = smoothstep(-0.3, 0.7, nM * 0.6 + nL * 0.5);
        cfCol = mix(uMeat, uCaramel, caramel * 0.6);
        cfCol = mix(cfCol, uCrust, smoothstep(-0.1, 0.75, -nL * 0.8 + nF * 0.2) * 0.65);
        // manchas mais douradas onde caramelizou; cada pedaço tem um tom um pouco diferente
        cfCol = mix(cfCol, uCaramel * 1.1, smoothstep(0.45, 0.9, nM * 0.7 + nF * 0.3) * 0.3);
        cfCol *= 0.84 + fract(vSeed * 7.31) * 0.3;

        // pontas e quinas um pouco mais tostadas (sem queimar)
        cf_char = clamp(smoothstep(0.5, 1.0, vEdge * 0.85 + nL * 0.2 + nF * 0.12) * 0.55, 0.0, 1.0);
        cfCol = mix(cfCol, uCrust * 0.9, cf_char);

        // reentrâncias entre um pedaço e outro (faces voltadas para o vizinho) ficam mais escuras
        float contact = smoothstep(0.5, 0.92, abs(normalize(vObjN).x));
        cfCol *= 1.0 - contact * 0.5;

        // gordura derretida (pouca): dourada
        cf_fat = smoothstep(0.65, 0.85, snoise(mp * 2.2 + 4.0)) * smoothstep(0.1, 0.6, snoise(mp * 6.0 + 9.0)) * (1.0 - cf_char);
        cfCol = mix(cfCol, uFat, cf_fat * 0.3);

        // tempero: ervas secas (pontinhos verdes) e pimenta-do-reino (pontinhos escuros)
        float herb = smoothstep(0.8, 0.9, snoise(mp * 17.0 + 41.0)) * cf_lod(mp, 17.0);
        cfCol = mix(cfCol, vec3(0.08, 0.12, 0.035), herb * 0.85);
        float pepper = smoothstep(0.82, 0.92, snoise(mp * 34.0)) * cf_lod(mp, 34.0);
        cfCol = mix(cfCol, vec3(0.02, 0.012, 0.008), pepper * 0.7);
        // pontinhos claros de tempero/sal grosso, como na foto do espetinho bovino
        cf_salt = smoothstep(0.86, 0.94, snoise(mp * 26.0 + 23.0)) * (1.0 - cf_char) * cf_lod(mp, 26.0);
        cfCol = mix(cfCol, vec3(0.78, 0.7, 0.6), cf_salt * 0.55);

        // brilho de marinada: quase toda a carne brilha (úmida); só as pontas tostadas e as reentrâncias ficam foscas
        cf_gloss = smoothstep(-0.6, 0.35, snoise(mp * 2.4 + 3.0)) * (1.0 - cf_char * 0.5) * (1.0 - contact * 0.4);
        cfCol = mix(cfCol, cfCol * vec3(1.05, 0.88, 0.82), cf_gloss * 0.2);
        cf_h = nM * 0.26 + nF * 0.26 + fib * 0.34 + pit * 0.1 - cf_char * 0.08 + herb * 0.15;
        // marinada: superfície bem lisa nas partes úmidas = brilhos nítidos espalhados pela carne
        cf_rough = clamp(mix(0.52, 0.18, cf_gloss) + cf_char * 0.1 - cf_fat * 0.15 - cf_salt * 0.25, 0.14, 0.85);
        cf_bump = 1.35;
      } else if (vType < 2.5) {
        // ——— pimentão (1 = vermelho, 2 = verde) ———
        bool red = vType < 1.5;
        vec3 skinA = red ? uRedSkin : uGreenSkin;
        vec3 skinB = red ? uRedDark : uGreenDark;
        vec3 flesh = red ? uRedFlesh : uGreenFlesh;
        vec3 mp = vObj + vSeed * 5.0;
        float n1 = snoise(mp * 3.0);
        float n2 = snoise(mp * 9.0);
        float outer = smoothstep(0.4, 0.6, vSide);
        float rim = smoothstep(0.9, 1.0, vEdge);
        vec3 skin = mix(skinA, skinB, smoothstep(-0.5, 0.8, n1) * 0.55);
        float blister = smoothstep(0.38, 0.78, snoise(mp * 4.2 + 2.0)) * outer;
        cf_char = clamp(blister * smoothstep(-0.1, 0.6, n2 + 0.3) + rim * 0.3 * (0.5 + n2 * 0.5), 0.0, 1.0);
        cfCol = mix(flesh, skin, outer * (1.0 - rim * 0.6));
        cfCol = mix(cfCol, uChar * 1.8, cf_char * 0.88);
        cf_h = n2 * 0.18 + blister * 0.45;
        cf_gloss = outer * (1.0 - cf_char) * (1.0 - rim);
        cf_rough = clamp(mix(0.62, 0.18, cf_gloss) + cf_char * 0.3, 0.12, 0.95);
        cf_bump = 0.7;
      } else if (vType < 3.5) {
        // ——— cebola ———
        vec3 mp = vObj + vSeed * 4.0;
        float n1 = snoise(mp * 3.5);
        float n2 = snoise(vec3(mp.x * 3.0, mp.y * 14.0, mp.z * 14.0));
        float rim = smoothstep(0.8, 1.0, vEdge);
        cfCol = mix(uOnion, uOnionDeep, smoothstep(-0.6, 0.8, n1) * 0.5 + n2 * 0.08);
        float brown = clamp(rim * 0.9 + smoothstep(0.3, 0.9, n1) * 0.35, 0.0, 1.0);
        cfCol = mix(cfCol, uOnionBrown, brown * 0.85);
        cf_char = smoothstep(0.58, 1.0, rim * 0.8 + n2 * 0.25 + n1 * 0.2) * 0.9;
        cfCol = mix(cfCol, uChar * 2.2, cf_char);
        cf_h = n2 * 0.18 + n1 * 0.1;
        cf_gloss = (1.0 - brown) * 0.8;
        cf_rough = clamp(mix(0.55, 0.26, cf_gloss) + cf_char * 0.3, 0.16, 0.95);
        cf_bump = 0.6;
        cf_emis = uOnionGlow * (1.0 - brown) * 0.4;
      } else {
        // ——— palito de bambu ———
        vec3 wp = vObj;
        float grain = snoise(vec3(wp.x * 1.2, wp.y * 38.0, wp.z * 38.0)) * 0.6 + snoise(vec3(wp.x * 3.5, wp.y * 85.0, wp.z * 85.0)) * 0.3;
        cfCol = mix(uWood, uWoodDark, smoothstep(-0.5, 0.7, grain));
        float scorchTip = smoothstep(uTipStart - 0.05, uTipStart + 0.45, wp.x);
        float scorchHandle = smoothstep(uHandleStart - 0.55, uHandleStart, wp.x) * step(wp.x, uHandleStart + 0.02);
        cf_char = clamp(max(scorchTip, scorchHandle * 0.75) * (0.55 + 0.45 * snoise(wp * 9.0 + 3.0)), 0.0, 1.0);
        cfCol = mix(cfCol, uChar * 2.5, cf_char);
        cf_h = grain * 0.25;
        cf_rough = clamp(0.7 + cf_char * 0.2, 0.3, 0.98);
        cf_bump = 0.35;
      }
      diffuseColor.rgb = cfCol;
    `;

    const replacements: [string, string][] = [
      ['#include <common>', `#include <common>\n${head}`],
      ['#include <color_fragment>', `#include <color_fragment>\n${color}`],
      ['#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = cf_rough;'],
      [
        '#include <normal_fragment_maps>',
        '#include <normal_fragment_maps>\nnormal = cf_perturbNormal(-vViewPosition, normal, vec2(dFdx(cf_h), dFdy(cf_h)) * cf_bump, faceDirection);',
      ],
      ['#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += cf_emis;'],
    ];
    for (const [needle, value] of replacements) {
      if (!shader.fragmentShader.includes(needle)) {
        console.warn(`[3D] trecho de shader não encontrado: ${needle}`);
        continue;
      }
      shader.fragmentShader = shader.fragmentShader.replace(needle, value);
    }
  };
  return {
    material,
    /** posição (no eixo do palito) onde começam a ponta e o cabo expostos ao fogo */
    setStick(tipStart: number, handleStart: number) {
      uniforms.uTipStart.value = tipStart;
      uniforms.uHandleStart.value = handleStart;
    },
  };
}
