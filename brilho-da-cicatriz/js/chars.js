'use strict';
/* ============================================================
   chars.js (CHARS2) — personagens "bonitinhos": chibi ~3,2 cabeças, olhos grandes de anime, contorno colorido,
   cel shading de 2 tons, rim light, cabelo em mechas/pufes com brilho, movimento secundário, sombra de contato.
   Convenção: ângulos em graus a partir de "para baixo"; + = para a direita da tela. Unidade = raio da cabeça (s px).
   Altura total ≈ 6,4 unidades (cabeça de raio 1). (x,y) = chão sob os pés.
   drawChar(ctx,x,y,s,pose,o) — opções (todas opcionais):
     who 'hero'|'mae'|'irmao'|'pai'|'ladrao'|'viz0'..'viz7' · color 0..1 (vizinhos: cinza->cor) · magical 0..1 (só hero) · wand 0..1 · wandAng
     scar 0..1 (cicatriz dourada, moletom aberto) · pendant 0..1 (estrelinha no peito, hero) · face (objeto|'sleepy'…) · flip · wind 0..1 · t (s)
     blink (0 aberto..1 fechado; força) · autoBlink:false · light -1|1 (lado da luz) · rim cor · rimA · shadow:false · shadowA · squash · rot · sink
     spin (rad; giro tipo henshin; cos<0 = de costas) · pal (neighPal) · hair ('puffs','short','kid','curly','afro','sides','wisp') · cap(false|cor) · scale (extra) · eyeCol (ladrão)
     alpha · pendantGlow 0..1 · open 0..1 (abre o moletom sem cicatriz) · turn -1..1 (desloca o rosto)
   Poses (POSE.*): stand slump fist Vup point sweep wide hip kick crouch reach sit sitLedge sitFloor sitKnees sitLegsDown sleep sleepCurl fall fallFlat rise rise2 hands2knees
     run balance carry hug hugged pointCam pray heart wave shrug cheer hold cower arms sneak hensCross hensOpen hensUp hensPose twirl
   Funções de pose: walkPose(ph) runPose(ph) balancePose(t,nerv) henshinPose(u) dancePose(t,off,style0..3) lerpPose(a,b,u). Campos extras de pose: dx, lift, air, hipAnchor, aRs/aLs, hR/hL ('open','fist','point','flat','hold','cam','claw').
   Rostos (o.face): 'neutral' 'sleepy' 'sad' 'determined' 'cry' 'grin' 'scared' 'love' 'stars' 'happy' 'closed' 'shock' 'sing' 'yawn' 'pout' 'wink' ou {eye,mouth,look,op,brow,cheek,m,tear,sweat,blink}
   Outras: drawHead(ctx,'hero'|pal,o) (raio 1, na origem) · drawFace · charPt · neighPal(i,c) · compassStar · drawScar(ctx,x,y,lenPx,glow,t) · coatOnHook(ctx,x,y,s,o) · c2eye (olho de anime, usado por eyesCU em props.js)
   ============================================================ */
function c2sc() { return typeof SC === 'number' ? SC : 1; }
const c2R = d => d * Math.PI / 180;
const c2dk = (c, a, k = '#1a0c24') => mix(c, k, a);
const c2lt = (c, a) => mix(c, '#ffffff', a);

/* ---------------- paletas ---------------- */
function c2mk(o) {
  const sh = (c, a) => mix(c, '#2c1450', a == null ? .24 : a);
  return Object.assign({
    skinSh: mix(o.skin, '#6a2020', .26), blush: mix(o.skin, '#e8405a', .45), hairSh: mix(o.hair, '#0a0414', .42), hairHi: mix(o.hair, '#ffffff', .4),
    hair2: o.hair, iris0: '#2e1810', iris1: '#a8703c', ink: mix(o.skin, '#1a0a1a', .74),
    topSh: sh(o.top), trim: mix(o.top, '#000000', .2), top2: '#f6efe0', botSh: sh(o.bot), shoe: '#3b6fd6', sole: '#f1ece0', acc: '#ffd23a', gold: '#ffc94a', bow: '#ff7ab8', wrap: '#f59f00', hat: '#d9b66a', cap: '#1971c2',
  }, o);
}
const PAL = {
  hero: c2mk({ skin: '#b8754d', skinSh: '#94583a', blush: '#d65a4c', hair: '#2d1b13', hairSh: '#170c08', hairHi: '#86604a', iris0: '#3a1c10', iris1: '#cf8c48', ink: '#3b1d15', top: '#ecaa2a', topSh: '#c4841a', trim: '#b8761a', top2: '#fff1d2', bot: '#4f76b6', botSh: '#3a5c96', shoe: '#2f8f63', sole: '#f1ece0', acc: '#ffd23a', gold: '#ffc94a' }),
  heroMagic: c2mk({ skin: '#fdeadf', skinSh: '#f1c6bc', blush: '#ff8fae', hair: '#ff8fcb', hair2: '#b69cff', hairSh: '#d85aa8', hairHi: '#fff0fa', iris0: '#5a3bd0', iris1: '#ff9bdc', ink: '#6a3a7a', top: '#fff3f8', topSh: '#f0cde2', trim: '#ffb0d6', top2: '#ffd23f', bot: '#fff6fb', botSh: '#f1d6e8', shoe: '#ff8fc8', sole: '#fff6fb', acc: '#ff5fa8', gold: '#ffd23f' }),
  thief: c2mk({ skin: '#1a1424', hair: '#100c18', top: '#16101f', bot: '#120d1a', ink: '#05030a' }),
};
function palMix(a, b, t) { if (t <= 0) return a; const o = {}; for (const k in a) o[k] = (k in b && typeof a[k] === 'string' && typeof b[k] === 'string') ? mix(a[k], b[k], t) : a[k]; for (const k in b) if (!(k in o)) o[k] = b[k]; return o; }
const c2gray = c => { const A = hex(c), l = A[0] * .3 + A[1] * .59 + A[2] * .11, v = Math.round(lerp(l, 125, .4)); return `rgb(${v},${v + 2},${v + 7})`; };
function c2grade(P, c) { if (c >= .999) return P; const o = {}; for (const k in P) o[k] = (typeof P[k] === 'string' && (P[k][0] === '#' || P[k][0] === 'r')) ? mix(c2gray(P[k]), P[k], c) : P[k]; return o; }

/* ---------------- elenco ---------------- */
const NEIGH_V = [
  { skin: '#8d5a3b', hair: '#2a1a12', top: '#e56b9d', bot: '#5c4a8a', wrap: '#f59f00', shoe: '#2f9e44', hk: 'wisp', gear: 'wrap', top_: 'dress', bot_: 'skirt', hf: 1.5, sc: 1.0, bw: 1.1, lash: 1, shoeK: 'sandal' },       // 0 tia de lenço
  { skin: '#a8704a', hair: '#dcdcdc', top: '#ece4d0', bot: '#6b5a46', hat: '#d9b66a', shoe: '#2b6fd6', hk: 'sides', gear: 'hat', top_: 'vest', bot_: 'pants', sc: .98, bw: 1.0, lash: 0, deco: ['mustache'], shoeK: 'sneaker', vest: '#8a6a3a' }, // 1 senhor de chapéu
  { skin: '#6b4430', hair: '#14100e', top: '#2ec4b6', bot: '#e8590c', cap: '#1971c2', shoe: '#ffd23f', hk: 'short', gear: 'cap', top_: 'tee', bot_: 'shorts', sc: .8, hkS: 1.14, lash: 0, shoeK: 'sneaker' },          // 2 moleque de boné azul
  { skin: '#c98e62', hair: '#2b1d14', top: '#9b8cff', bot: '#364fc7', shoe: '#2b6fd6', hk: 'curly', gear: null, top_: 'tee', bot_: 'pants', sc: 1.02, lash: 2, shoeK: 'sneaker' },                                  // 3 moça cacheada
  { skin: '#7a4a30', hair: '#1d1d26', top: '#ffd43b', bot: '#2b6fd6', shoe: '#2f9e44', hk: 'afro', gear: null, top_: 'tee', bot_: 'shorts', sc: 1.08, bw: 1.1, lash: 0, deco: ['beard', 'jersey'], shoeK: 'sandal', trimC: '#1c8f3c' }, // 4 tio black power
  { skin: '#d9a27a', hair: '#3a2416', top: '#f4f1e8', bot: '#d6336c', cap: '#2b8a3e', shoe: '#2b6fd6', hk: 'short', gear: 'cap', top_: 'tee', bot_: 'shorts', sc: .76, hkS: 1.15, lash: 0, shoeK: 'sneaker' },        // 5 criança de boné verde
  { skin: '#f1c9a0', hair: '#d8a64a', top: '#5ec8ff', bot: '#3b4a9a', shoe: '#ffd23f', hk: 'short', gear: null, top_: 'tee', bot_: 'shorts', sc: .88, hkS: 1.08, lash: 0, shoeK: 'sneaker', deco: ['star'] },        // 6 loiro de camiseta azul
  { skin: '#a8704a', hair: '#1a120e', top: '#e8590c', bot: '#2b6fd6', wrap: '#5ec8ff', shoe: '#2f9e44', hk: 'wisp', gear: 'wrap', top_: 'dress', bot_: 'skirt', hf: 1.45, sc: 1.0, bw: 1.08, lash: 1, shoeK: 'sandal', deco: ['glasses'] }, // 7 tia de lenço azul
];
const C2W = {
  hero: { pal: PAL.hero, sc: 1, hkS: 1, hk: 'puffs', gear: null, top_: 'hoodie', bot_: 'shorts', shoeK: 'flip', lash: 2, mag: true, pend: true, bw: 1 },
  mae: { pal: c2mk({ skin: '#9a6040', hair: '#2a1810', top: '#e9f2f1', topSh: '#bcd3d4', trim: '#4aa6a8', top2: '#e07a8a', bot: '#3d3f66', wrap: '#e8903a', shoe: '#e8e0d4', blush: '#d8605a', iris1: '#b57b45' }), sc: 1.1, hkS: .98, hk: 'wisp', gear: 'wrap', top_: 'coat', bot_: 'pants', shoeK: 'sneaker', lash: 1, bag: true, bw: 1.08, tl: .26, slv: .82 },
  irmao: { pal: c2mk({ skin: '#a96a46', hair: '#1c120d', top: '#ff6b5e', bot: '#3b6fd6', shoe: '#ffd23f', iris1: '#b57b45', blush: '#e0604f' }), sc: .7, hkS: 1.2, hk: 'kid', gear: null, top_: 'tee', bot_: 'shorts', shoeK: 'sneaker', lash: 0, bw: 1.0, deco: ['star'], cheeky: 1 },
  pai: { flat: '#1b1827', sc: 1.14, hkS: .96, hk: 'short', gear: null, top_: 'tee', bot_: 'pants', shoeK: 'sneaker', lash: 0, bw: 1.12, noFace: true },
  ladrao: { pal: PAL.thief, flat: '#0d0914', sc: 1.22, hkS: 1, hk: 'none', gear: 'hood', top_: 'cloak', bot_: 'pants', shoeK: 'none', lash: 0, bw: 1.1, thief: true, noFace: true },
};
NEIGH_V.forEach((v, i) => {
  const base = c2mk({ skin: v.skin, hair: v.hair, top: v.top, bot: v.bot, wrap: v.wrap || '#f59f00', hat: v.hat || '#d9b66a', cap: v.cap || '#1971c2', shoe: v.shoe, hairHi: mix(v.hair, '#ffffff', v.hair === '#dcdcdc' ? .0 : .38), iris1: mix(v.skin, '#7a4a20', .55), trim: v.trimC || mix(v.top, '#000000', .2), top2: v.top_ === 'vest' ? '#f4efe2' : '#f6efe0' });
  if (v.vest) base.vest = v.vest;
  C2W['viz' + i] = Object.assign({ pal: base, hkS: 1, bw: 1, lash: 0, sc: 1, i }, v);
});
/* compat: paleta de vizinho (c: 0 cinza .. 1 cor). Passe em o.pal ou use o.who='vizN' + o.color */
function neighPal(i, c = 1) { i = ((i % 8) + 8) % 8; const P = c2grade(C2W['viz' + i].pal, c); return Object.assign({}, P, { _who: 'viz' + i, _c: c }); }

function c2cfg(o) {
  let w = o.who;
  if (!w && o.pal && o.pal._who) w = o.pal._who;
  if (!w) w = 'hero';
  return C2W[w] || C2W.hero;
}
function c2pal(cfg, o, m) {
  let P;
  if (o.pal && o.pal._who) P = o.pal;
  else if (cfg === C2W.hero) P = m > 0 ? palMix(PAL.hero, PAL.heroMagic, m) : PAL.hero;
  else if (cfg.flat) { const f = cfg.flat, fl = c2mk({ skin: f, hair: f, top: f, bot: f, ink: c2dk(f, .5, '#000000') }); P = Object.assign(fl, { skinSh: c2dk(f, .35, '#000000'), topSh: c2dk(f, .35, '#000000'), botSh: c2dk(f, .35, '#000000'), hairSh: c2dk(f, .3, '#000000'), hairHi: c2lt(f, .12), trim: f, wrap: f, shoe: f, sole: f }); if (cfg.pal) P = cfg.pal; }
  else P = cfg.pal;
  if (cfg.i != null && o.color != null && !(o.pal && o.pal._who)) P = c2grade(P, clamp(o.color));
  if (o.pal && !o.pal._who && cfg !== C2W.hero) P = o.pal;
  return P;
}

/* ---------------- poses ---------------- */
const POSE = {
  stand: { lean: 0, head: 0, spread: .8, hs: .5, aR: [8, 6], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] },
  slump: { lean: 16, head: 24, spread: .8, hs: .5, aR: [10, 4], aL: [-10, -4], lR: [6, 0], lL: [-6, 0] },
  fist: { lean: -4, head: -4, spread: .8, hs: .55, aR: [25, 200], aL: [-25, -200], lR: [10, 0], lL: [-10, 0], hR: 'fist', hL: 'fist' },
  Vup: { lean: -3, head: -8, spread: .85, hs: .75, aR: [145, 165], aL: [-145, -165], lR: [20, 2], lL: [-20, -2] },
  point: { lean: -6, head: -10, spread: .85, hs: .7, aR: [168, 176], aL: [-30, 70], lR: [26, -4], lL: [-6, 8], hR: 'point' },
  sweep: { lean: 20, head: 14, spread: .8, hs: .7, aR: [95, 80], aL: [-100, -140], lR: [52, -40], lL: [-22, 10] },
  wide: { lean: 0, head: 0, spread: .85, hs: .8, aR: [100, 98], aL: [-100, -98], lR: [24, 4], lL: [-24, -4] },
  hip: { lean: 6, head: 8, spread: .8, hs: .6, aR: [60, -20], aL: [-60, 20], lR: [14, 0], lL: [-20, 8] },
  kick: { lean: -10, head: -6, spread: .85, hs: .5, aR: [150, 130], aL: [-70, -20], lR: [75, 20], lL: [-6, 4] },
  crouch: { lean: 28, head: 20, spread: .8, hs: .7, aR: [60, 30], aL: [-70, -40], lR: [62, -70], lL: [-62, 70] },
  reach: { lean: -12, head: -14, spread: .9, hs: .6, aR: [112, 90], aL: [-30, -10], lR: [14, 0], lL: [-10, 6] },
  /* novas */
  sit: { lean: 4, head: 6, spread: .8, hs: .6, aR: [18, 40], aL: [-18, -40], lR: [62, 8], lL: [-62, -8], hipAnchor: 1 },
  sitLedge: { lean: 4, head: 6, spread: .8, hs: .5, aR: [22, 10], aL: [-22, -10], lR: [8, 20], lL: [-6, -14], hipAnchor: 1 },
  sitFloor: { lean: 8, head: 8, spread: .8, hs: .7, aR: [30, 140], aL: [-30, -140], lR: [78, -76], lL: [-78, 76], lift: .0 },
  sitKnees: { lean: 14, head: 12, spread: .8, hs: .6, aR: [30, 160], aL: [-30, -160], lR: [60, -120], lL: [-60, 120], lift: 0 },
  sitLegsDown: { lean: 4, head: 8, spread: .8, hs: .55, aR: [12, 4], aL: [-12, -4], lR: [88, 6], lL: [-88, -6] },
  sleep: { lean: 90, head: 0, spread: .8, hs: .5, aR: [96, 100], aL: [86, 80], lR: [-90, -92], lL: [-86, -90], lift: .5 },
  sleepCurl: { lean: 90, head: 10, spread: .8, hs: .5, aR: [70, 160], aL: [100, 140], lR: [-70, -150], lL: [-60, -130], lift: .52 },
  fall: { lean: 38, head: 26, spread: .9, hs: .6, aR: [140, 160], aL: [-130, -150], lR: [-30, -50], lL: [30, 20], air: .1 },
  fallFlat: { lean: 75, head: 30, spread: .9, hs: .6, aR: [120, 140], aL: [-150, -170], lR: [-70, -80], lL: [-50, -20], lift: .25 },
  rise: { lean: 30, head: 14, spread: .8, hs: .7, aR: [70, 20], aL: [-20, 0], lR: [64, -64], lL: [-34, 20] },
  rise2: { lean: 16, head: 4, spread: .8, hs: .6, aR: [40, 8], aL: [-24, -6], lR: [28, -20], lL: [-10, 6] },
  hands2knees: { lean: 62, head: 30, spread: .9, hs: .8, aR: [12, 0], aL: [-12, 0], lR: [86, 20], lL: [-86, -20], lift: .1 },
  run: { lean: 14, head: 6, spread: .2, hs: .15, aR: [-60, 50], aL: [50, -40], lR: [-50, -120], lL: [40, 6], air: .18 },
  balance: { lean: 0, head: 0, spread: .85, hs: .25, aR: [88, 90], aL: [-88, -90], lR: [6, 0], lL: [-6, 0] },
  carry: { lean: 24, head: -8, spread: .8, hs: .4, aR: [-28, 34], aL: [-6, -20], lR: [28, -6], lL: [-18, 14], hR: 'fist', hL: 'fist' },
  hug: { lean: 8, head: 10, spread: .8, hs: .5, aR: [92, 108], aL: [60, 100], lR: [10, 0], lL: [-8, 0], frontR: 1, frontL: 1 },
  hugged: { lean: 6, head: -10, spread: .8, hs: .5, aR: [60, -30], aL: [-60, 30], lR: [6, 0], lL: [-6, 0] },
  pointCam: { lean: -2, head: -2, spread: .85, hs: .55, aR: [105, 125], aL: [-8, -6], lR: [8, 0], lL: [-6, 0], hR: 'cam', aRs: .5, frontR: 1 },
  pray: { lean: 4, head: 12, spread: .75, hs: .5, aR: [14, -124], aL: [-14, 124], lR: [4, 0], lL: [-4, 0], frontR: 1, frontL: 1, hR: 'flat', hL: 'flat' },
  heart: { lean: 0, head: 8, spread: .85, hs: .6, aR: [160, -150], aL: [-160, 150], lR: [14, 0], lL: [-14, 0] },
  wave: { lean: -2, head: 6, spread: .8, hs: .5, aR: [150, 175], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] },
  shrug: { lean: 0, head: 10, spread: .9, hs: .5, aR: [60, 130], aL: [-60, -130], lR: [4, 0], lL: [-4, 0] },
  cheer: { lean: -8, head: -10, spread: .85, hs: .8, aR: [160, 170], aL: [-160, -170], lR: [30, 0], lL: [-30, 0], air: .35, hR: 'fist', hL: 'fist' },
  hold: { lean: 2, head: 4, spread: .8, hs: .5, aR: [30, 120], aL: [-30, -120], lR: [4, 0], lL: [-4, 0], hR: 'fist', hL: 'fist' },
  cower: { lean: 20, head: 22, spread: .7, hs: .5, aR: [30, 160], aL: [-30, -160], lR: [24, -30], lL: [-24, 30], frontR: 1, frontL: 1 },
  arms: { lean: 0, head: 0, spread: .8, hs: .5, aR: [-30, -110], aL: [30, 110], lR: [4, 0], lL: [-4, 0], frontR: 1, frontL: 1 },
  sneak: { lean: 18, head: 10, spread: .6, hs: .3, aR: [-20, 50], aL: [30, -40], lR: [30, -20], lL: [-20, 50] },
  /* henshin */
  hensCross: { lean: 4, head: 6, spread: .75, hs: .5, aR: [10, -140], aL: [-10, 140], lR: [6, 0], lL: [-6, 0], frontR: 1, frontL: 1 },
  hensOpen: { lean: -6, head: -8, spread: .9, hs: .6, aR: [110, 150], aL: [-110, -150], lR: [16, 0], lL: [-16, 0] },
  hensUp: { lean: -4, head: -10, spread: .9, hs: .6, aR: [165, 175], aL: [-120, -170], lR: [12, 0], lL: [-12, 0], air: .25 },
  hensPose: { lean: -6, head: -6, spread: .85, hs: .75, aR: [150, 110], aL: [-60, -20], lR: [24, 0], lL: [-30, 6] },
  twirl: { lean: 0, head: 6, spread: .8, hs: .3, aR: [100, 90], aL: [-100, -90], lR: [8, 0], lL: [-30, 50], air: .18 },
};
function lerpPose(a, b, t) {
  const o = {}, keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const A = a[k], B = b[k], D = POSE.stand[k];
    const A2 = A === undefined ? D : A, B2 = B === undefined ? D : B;
    if (Array.isArray(A2) || Array.isArray(B2)) { const x = A2 || B2, y = B2 || A2; o[k] = [lerp(x[0], y[0], t), lerp(x[1], y[1], t)]; }
    else if (typeof A === 'string' || typeof B === 'string' || k === 'frontR' || k === 'frontL') o[k] = t < .5 ? A : B;
    else o[k] = lerp(A == null ? 0 : A, B == null ? 0 : B, t);
  }
  return o;
}
/* anda (vista de lado): ph em radianos */
function walkPose(ph, lean = 4) {
  const A = 30, sA = Math.sin(ph), sB = Math.sin(ph + Math.PI), bendR = Math.max(0, Math.cos(ph)), bendL = Math.max(0, Math.cos(ph + Math.PI));
  return { lean, head: 0, spread: .15, hs: .12, aR: [-sA * 24, -sA * 24 + 18 + sA * 8], aL: [-sB * 24, -sB * 24 + 18 + sB * 8], lR: [sA * A, sA * A - 38 * bendR], lL: [sB * A, sB * A - 38 * bendL], air: Math.abs(Math.cos(ph)) * .14 };
}
function runPose(ph, lean = 16) {
  const A = 50, sA = Math.sin(ph), sB = Math.sin(ph + Math.PI), bR = Math.max(0, -Math.cos(ph)), bL = Math.max(0, -Math.cos(ph + Math.PI));
  return { lean, head: -4, spread: .15, hs: .12, aR: [-sA * 55, -sA * 55 + 80], aL: [-sB * 55, -sB * 55 + 80], lR: [sA * A, sA * A - 20 - 85 * bR], lL: [sB * A, sB * A - 20 - 85 * bL], air: Math.abs(Math.sin(ph)) * .3, hR: 'fist', hL: 'fist' };
}
/* corda bamba: braços abertos balançando; t em s, nerv 0..1 (tremida) */
function balancePose(t, nerv = .5) {
  const w = Math.sin(t * 3.1) * (10 + 18 * nerv), w2 = Math.sin(t * 3.1 + .6) * (8 + 14 * nerv);
  return { lean: w * .5, head: -w * .3, spread: .85, hs: .22, aR: [86 + w, 92 + w2], aL: [-86 + w, -92 + w2], lR: [6, 0], lL: [-6, 0], hR: 'flat', hL: 'flat' };
}
/* giro do henshin: u 0..1 -> pose (cruza, abre, sobe, pose final) */
function henshinPose(u) {
  const S = [POSE.stand, POSE.hensCross, POSE.hensOpen, POSE.hensUp, POSE.hensPose], n = S.length - 1, p = clamp(u) * n, i = Math.min(n - 1, Math.floor(p));
  return lerpPose(S[i], S[i + 1], E.io2(p - i));
}
/* dança: sequência de poses presas à batida (BEAT/2). style 0..3 muda o repertório. */
const DANCE_SEQS = [
  ['Vup', 'point', 'sweep', 'wide', 'hip', 'kick', 'Vup', 'crouch'],
  ['heart', 'wide', 'twirl', 'Vup', 'hip', 'point', 'cheer', 'sweep'],
  ['wave', 'hip', 'heart', 'kick', 'wide', 'twirl', 'Vup', 'shrug'],
  ['cheer', 'point', 'Vup', 'sweep', 'twirl', 'heart', 'hip', 'wide'],
];
const DANCE_SEQ = DANCE_SEQS[0];
function dancePose(t, tOffset = 0, style = 0) {
  const seq = DANCE_SEQS[((style | 0) % 4 + 4) % 4], p = (t + tOffset - .5) / (BEAT / 2), i = Math.floor(p), f = p - i, n = seq.length;
  const a = POSE[seq[((i % n) + n) % n]], b = POSE[seq[(((i + 1) % n) + n) % n]];
  const ps = lerpPose(a, b, E.io2(clamp(f * 1.4)));
  ps.air = Math.max(ps.air || 0, Math.max(0, Math.sin(f * Math.PI)) * .5 * (style === 1 ? .8 : 1)); ps.bounce = Math.exp(-f * 4) * .3;
  ps.dx = Math.sin((p) * Math.PI * .5) * .22; ps.lean = (ps.lean || 0) + Math.sin(p * Math.PI) * 4;
  return ps;
}

/* ---------------- esqueleto ---------------- */
const C2K = .7;
function skeleton0(p) {
  const T = 2.5 * C2K, la = rad(p.lean || 0);
  const neck = [Math.sin(la) * T, -Math.cos(la) * T], ha = rad((p.lean || 0) + (p.head || 0));
  const head = [neck[0] + Math.sin(ha) * .93, neck[1] - Math.cos(ha) * .93];
  const lim = (o, a, b, L1, L2) => { const j = [o[0] + Math.sin(rad(a)) * L1, o[1] + Math.cos(rad(a)) * L1]; return [o, j, [j[0] + Math.sin(rad(b)) * L2, j[1] + Math.cos(rad(b)) * L2]]; };
  const sp = (p.spread == null ? .8 : p.spread) * C2K, hs = (p.hs == null ? .5 : p.hs) * C2K;
  const shR = [neck[0] * .88 + sp, neck[1] * .88 + .12], shL = [neck[0] * .88 - sp, neck[1] * .88 + .12];
  const A1 = 1.5 * C2K * 1.0, A2 = 1.5 * C2K * 1.0, aR = p.aRs || 1, aL = p.aLs || 1;
  const k = { neck, head, ha, shR, shL,
    aR: lim(shR, p.aR[0], p.aR[1], A1 * aR, A2 * aR), aL: lim(shL, p.aL[0], p.aL[1], A1 * aL, A2 * aL),
    lR: lim([hs, 0], p.lR[0], p.lR[1], 1.3, 1.3), lL: lim([-hs, 0], p.lL[0], p.lL[1], 1.3, 1.3) };
  k.foot = Math.max(k.lR[2][1], k.lL[2][1]) + .2;
  k.chest = [neck[0] * .86, neck[1] * .86 + .52]; k.hip = [0, 0];
  return k;
}

/* proporção stickman (modo flat): membros ~30% mais longos e cabeça pequena; o corpo todo é reescalado para caber como antes */
var FLAT_LK = 1.3, FLAT_SC = .8, FLAT_HR = .62, FLAT_FACES = false;
function skeleton(p) {
  const k = skeleton0(p); if (CHAR_STYLE !== 'flat') return k;
  const sc = a => { a[0] *= FLAT_LK; a[1] *= FLAT_LK; };
  [k.neck, k.shR, k.shL, k.chest, k.hip].forEach(sc); k.aR.forEach(sc); k.aL.forEach(sc); k.lR.forEach(sc); k.lL.forEach(sc);
  k.foot *= FLAT_LK; const d = FLAT_HR + .16; k.head = [k.neck[0] + Math.sin(k.ha) * d, k.neck[1] - Math.cos(k.ha) * d];
  return k;
}
/* posição na tela de um ponto do esqueleto (para efeitos na mão/peito). pt: 'aR'[2] etc ou [x,y] */
function charPt(x, y, s, pose, pt, o = {}) {
  const k = skeleton(pose), f = o.flip ? -1 : 1, cfg = c2cfg(o), q = typeof pt === 'string' ? k[pt] : pt, sc = cfg.sc * (o.scale || 1) * (CHAR_STYLE === 'flat' ? FLAT_SC : 1);
  const p = Array.isArray(q[0]) ? q[q.length - 1] : q, lift = (pose.air || 0) * 2 + (pose.lift || 0);
  return [x + (p[0] + (pose.dx || 0)) * s * sc * f, y + (p[1] + (pose.hipAnchor ? .1 : -k.foot) - lift + (o.sink || 0)) * s * sc];
}

/* ---------------- utilidades de desenho ---------------- */
function c2Q(ctx, o = {}, f = 1, k = 1) {
  const mt = ctx.getTransform(), pxu = Math.hypot(mt.a, mt.b) / c2sc() * k, olpx = clamp(pxu * .034, 1.25, 3.6);
  const lxs = (o.light == null ? -1 : o.light) * f, Lx = lxs * .5, Ly = -.85, n = Math.hypot(Lx, Ly);
  return { pxu, ol: olpx / pxu, sx: -Lx / n, sy: -Ly / n, rim: o.rim || '#ffe6bd', rimA: o.rimA == null ? .42 : o.rimA };
}
function c2cap(ctx, a, ra, b, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-4, d = Math.atan2(dy, dx), ph = Math.acos(clamp((ra - rb) / L, -1, 1));
  ctx.beginPath(); ctx.arc(a[0], a[1], ra, d + ph, d + TAU - ph); ctx.arc(b[0], b[1], rb, d - ph, d + ph); ctx.closePath();
}
const c2ink = (P, fill, a = .56) => mix(fill, P.ink, a);
/* membro afinando com cel shading + rim light. pts: pontos, rs: raios */
function c2limb(ctx, Q, pts, rs, fill, shade, ink, o = {}) {
  const n = pts.length - 1; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2;
  for (let i = 0; i < n; i++) { c2cap(ctx, pts[i], rs[i], pts[i + 1], rs[i + 1]); ctx.stroke(); }
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1], ra = rs[i], rb = rs[i + 1];
    c2cap(ctx, a, ra, b, rb); ctx.fillStyle = fill; ctx.fill();
    if (!shade) continue;
    ctx.save(); c2cap(ctx, a, ra, b, rb); ctx.clip();
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; let nx = -uy, ny = ux; if (nx * Q.sx + ny * Q.sy < 0) { nx = -nx; ny = -ny; }
    const e = Math.max(ra, rb);
    ctx.beginPath(); ctx.moveTo(a[0] - ux * e + nx * ra * .12, a[1] - uy * e + ny * ra * .12); ctx.lineTo(b[0] + ux * e + nx * rb * .12, b[1] + uy * e + ny * rb * .12);
    ctx.lineTo(b[0] + ux * e + nx * e * 3, b[1] + uy * e + ny * e * 3); ctx.lineTo(a[0] - ux * e + nx * e * 3, a[1] - uy * e + ny * e * 3); ctx.closePath(); ctx.fillStyle = shade; ctx.fill();
    if (Q.rimA > 0 && !o.norim) { ctx.strokeStyle = rgba(Q.rim, Q.rimA); ctx.lineWidth = e * .1; ctx.beginPath(); ctx.moveTo(a[0] + nx * ra * .9, a[1] + ny * ra * .9); ctx.lineTo(b[0] + nx * rb * .9, b[1] + ny * rb * .9); ctx.stroke(); }
    ctx.restore();
  }
}
/* descritores de forma: c círculo, e elipse, l mecha, cap calota, poly */
function c2dpath(ctx, d, b) {
  if (b !== false) ctx.beginPath();
  if (d.t === 'c') { ctx.moveTo(d.x + d.r, d.y); ctx.arc(d.x, d.y, d.r, 0, TAU); }
  else if (d.t === 'e') { const r = d.rot || 0; ctx.moveTo(d.x + Math.cos(r) * d.rx, d.y + Math.sin(r) * d.rx); ctx.ellipse(d.x, d.y, d.rx, d.ry, r, 0, TAU); }
  else if (d.t === 'l') {
    const dx = d.tx - d.bx, dy = d.ty - d.by, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = d.w, bd = (d.bend || 0) * L, mx = (d.bx + d.tx) / 2, my = (d.by + d.ty) / 2;
    ctx.moveTo(d.bx - nx * w, d.by - ny * w); ctx.quadraticCurveTo(mx - nx * w * .95 + nx * bd, my - ny * w * .95 + ny * bd, d.tx, d.ty); ctx.quadraticCurveTo(mx + nx * w * .95 + nx * bd, my + ny * w * .95 + ny * bd, d.bx + nx * w, d.by + ny * w); ctx.closePath();
  } else if (d.t === 'cap') {
    const T = d.top || 1.14, sy = d.sy == null ? 0 : d.sy, ay = d.ay == null ? -.5 : d.ay, w = d.w || 1.08;
    ctx.moveTo(-w, sy); ctx.bezierCurveTo(-w * 1.04, -T * .66, -w * .6, -T, 0, -T); ctx.bezierCurveTo(w * .6, -T, w * 1.04, -T * .66, w, sy); ctx.quadraticCurveTo(0, 2 * ay - sy, -w, sy); ctx.closePath();
  } else if (d.t === 'poly') { d.p.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); }
}
function c2crescent(ctx, Q, d, shade, off) {
  const k = d.t === 'c' ? d.r * .4 : d.t === 'l' ? d.w * .9 : d.t === 'e' ? d.rx * .4 : off;
  ctx.save(); c2dpath(ctx, d); ctx.clip(); ctx.beginPath(); ctx.rect(-40, -40, 80, 80); ctx.translate(-Q.sx * k, -Q.sy * k); c2dpath(ctx, d, false); ctx.fillStyle = shade; ctx.fill('evenodd'); ctx.restore();
}
/* grupo de formas fundidas: contorno por baixo, preenchimento por cima, sombra em crescente, linha fina interna */
function c2group(ctx, Q, ds, fill, shade, ink, o = {}) {
  ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2 * (o.olk || 1);
  ds.forEach(d => { c2dpath(ctx, d); ctx.stroke(); });
  ds.forEach(d => {
    c2dpath(ctx, d); ctx.fillStyle = fill; ctx.fill();
    if (shade) c2crescent(ctx, Q, d, shade, o.off || .12);
    if (o.line) { c2dpath(ctx, d); ctx.strokeStyle = o.line; ctx.lineWidth = Q.ol * .65; ctx.stroke(); }
  });
}
function c2heart(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y + r * .9); ctx.bezierCurveTo(x - r * 1.5, y - r * .1, x - r * .6, y - r * 1.2, x, y - r * .35); ctx.bezierCurveTo(x + r * .6, y - r * 1.2, x + r * 1.5, y - r * .1, x, y + r * .9); ctx.closePath(); }
function c2star5(ctx, x, y, R, r, rot = -Math.PI / 2) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, q = i % 2 ? r : R; i ? ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.closePath(); }
/* estrela-bússola de 8 pontas facetada (cardeais longos, diagonais curtas). cL/cD = tons claro/escuro */
function compassStar(ctx, x, y, R, rot, cL, cD, ink, lw = 1.5, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.lineJoin = 'round';
  const tip = i => (i % 2 ? R * .62 : R), val = R * .27, P = [];
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4; P.push([Math.cos(a) * tip(i), Math.sin(a) * tip(i)]); }
  const V = []; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i + .5) * Math.PI / 4; V.push([Math.cos(a) * val, Math.sin(a) * val]); }
  ctx.beginPath(); for (let i = 0; i < 8; i++) { ctx.lineTo(P[i][0], P[i][1]); ctx.lineTo(V[i][0], V[i][1]); } ctx.closePath(); ctx.fillStyle = cD; ctx.fill();
  for (let i = 0; i < 8; i++) { const vp = V[(i + 7) % 8]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(vp[0], vp[1]); ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); ctx.fillStyle = cL; ctx.fill(); }
  ctx.beginPath(); for (let i = 0; i < 8; i++) { ctx.lineTo(P[i][0], P[i][1]); ctx.lineTo(V[i][0], V[i][1]); } ctx.closePath(); ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.stroke();
  if (o.gem !== false) { ctx.beginPath(); ctx.arc(0, 0, R * .17, 0, TAU); ctx.fillStyle = o.gem || '#ff5fa8'; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-R * .05, -R * .06, R * .05, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/* ---------------- olhos (compartilhado com eyesCU) ---------------- */
/* e: {sd,rx,ry,op,tilt,look,iris0,iris1,ink,lash,style,t,big,star,glow,tear,pupil,hl,wet,skinSh,lid} — coordenadas locais; sd=+1 olho direito da tela */
function c2eye(ctx, Q, e) {
  const sd = e.sd, rx = e.rx, ry = e.ry, op = clamp(e.op == null ? 1 : e.op), tilt = e.tilt || 0, ink = e.ink || '#1a0c14', style = e.style || 'open';
  const lw = Math.max(rx * .26, 2.2 / Q.pxu * 1.0) * (e.big ? .8 : 1);
  const Ix = -sd * rx * .94, Ox = sd * rx * 1.0, Iy = ry * (.12 + tilt * .3), Oy = ry * (.02 - tilt * .26), yb = ry * .98;
  if (op < .13 || style === 'happy' || style === 'closed') { // pálpebra fechada: arco
    const happy = style === 'happy', dy = happy ? -ry * .15 : -ry * .05;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(Ix, (Iy + Oy) / 2 + dy); ctx.quadraticCurveTo((Ix + Ox) / 2, (happy ? -1 : 1) * ry * .62 + dy + (happy ? ry * .4 : 0), Ox, (Iy + Oy) / 2 + dy - (happy ? 0 : ry * .1)); ctx.stroke();
    if ((e.lash || 0) > 0) { ctx.lineWidth = lw * .7; ctx.beginPath(); ctx.moveTo(Ox, (Iy + Oy) / 2 + dy - (happy ? 0 : ry * .1)); ctx.lineTo(Ox + sd * rx * .32, (Iy + Oy) / 2 + dy - ry * .3); ctx.stroke(); if (e.lash > 1) { ctx.beginPath(); ctx.moveTo(Ox - sd * rx * .35, (Iy + Oy) / 2 + dy + (happy ? -ry * .45 : ry * .45)); ctx.lineTo(Ox - sd * rx * .05, (Iy + Oy) / 2 + dy + (happy ? -ry * .6 : ry * .6)); ctx.stroke(); } }
    if (e.tear) { ctx.fillStyle = 'rgba(190,230,255,.9)'; ctx.beginPath(); ctx.ellipse(Ox - sd * rx * .2, ry * .6 + e.tear * ry * 1.4, rx * .12, rx * .2, 0, 0, TAU); ctx.fill(); }
    return;
  }
  const yt = lerp((Iy + Oy) / 2 + ry * .1, -ry * (1 - tilt * .05), Math.pow(op, .8));
  const path = b => { if (b !== false) ctx.beginPath(); ctx.moveTo(Ix, Iy); ctx.bezierCurveTo(lerp(Ix, Ox, .06), lerp(Iy, yt, 1.33), lerp(Ix, Ox, .84), lerp(Oy, yt, 1.33), Ox, Oy); ctx.bezierCurveTo(lerp(Ox, Ix, .1), lerp(Oy, yb, 1.3), lerp(Ox, Ix, .8), lerp(Iy, yb, 1.3), Ix, Iy); ctx.closePath(); };
  ctx.save(); path(); ctx.clip();
  // esclera
  ctx.fillStyle = lg(ctx, 0, yt, 0, yb, [[0, e.white2 || '#d9cfd6'], [.34, e.white || '#fffaf7'], [1, '#f6ecee']]); ctx.fillRect(-rx * 1.6, -ry * 1.6, rx * 3.2, ry * 3.2);
  // íris
  const lk = e.look || [0, 0], sm = style === 'scared' ? .66 : 1, irx = rx * .8 * sm, iry = ry * .86 * sm, ix = lk[0] * rx * .3 + (style === 'scared' ? 0 : 0), iy = ry * .06 + lk[1] * ry * .24 + (style === 'sad' ? ry * .06 : 0);
  if (style !== 'shock' && style !== 'dot') {
    ctx.fillStyle = lg(ctx, 0, iy - iry, 0, iy + iry, [[0, c2dk(e.iris0, .45, '#000')], [.3, e.iris0], [.72, mix(e.iris0, e.iris1, .7)], [1, e.iris1]]);
    ctx.beginPath(); ctx.ellipse(ix, iy, irx, iry, 0, 0, TAU); ctx.fill();
    // luz refratada embaixo
    ctx.fillStyle = rg(ctx, ix, iy + iry * .55, 0, iry * .75, [[0, rgba(c2lt(e.iris1, .55), .75)], [1, rgba(e.iris1, 0)]]); ctx.beginPath(); ctx.ellipse(ix, iy, irx, iry, 0, 0, TAU); ctx.fill();
    if (e.big) { ctx.strokeStyle = rgba(c2lt(e.iris1, .5), .35); ctx.lineWidth = rx * .012; for (let i = 0; i < 34; i++) { const a = i / 34 * TAU; ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * irx * .42, iy + Math.sin(a) * iry * .42); ctx.lineTo(ix + Math.cos(a) * irx * (.8 + .1 * Math.sin(i * 5)), iy + Math.sin(a) * iry * (.8 + .1 * Math.sin(i * 5))); ctx.stroke(); } }
    ctx.strokeStyle = c2dk(e.iris0, .55, '#000'); ctx.lineWidth = rx * (e.big ? .05 : .09); ctx.beginPath(); ctx.ellipse(ix, iy, irx, iry, 0, 0, TAU); ctx.stroke();
    // pupila
    if (style === 'love') { ctx.fillStyle = '#ff5f9a'; c2heart(ctx, ix, iy, irx * .7); ctx.fill(); }
    else if (style === 'stars') { ctx.fillStyle = '#fff6c8'; c2star5(ctx, ix, iy, irx * .85, irx * .38, -Math.PI / 2 + (e.t || 0) * .5); ctx.fill(); ctx.strokeStyle = '#ffb74d'; ctx.lineWidth = rx * .04; ctx.stroke(); }
    else { const pu = (e.pupil == null ? .42 : e.pupil) * (style === 'scared' ? .6 : 1); ctx.fillStyle = '#150a12'; ctx.beginPath(); ctx.ellipse(ix, iy - iry * .02, irx * pu, iry * pu * 1.1, 0, 0, TAU); ctx.fill(); }
    // sombra da pálpebra na íris
    ctx.fillStyle = lg(ctx, 0, yt, 0, yt + ry * .85, [[0, 'rgba(20,6,20,.55)'], [1, 'rgba(20,6,20,0)']]); ctx.fillRect(-rx * 1.5, yt - 1, rx * 3, ry * 1.2);
    if (e.glow) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, ix, iy, 0, irx, [[0, `rgba(255,214,120,${e.glow})`], [1, 'rgba(255,214,120,0)']]); ctx.beginPath(); ctx.arc(ix, iy, irx, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    if (e.star) { ctx.globalCompositeOperation = 'lighter'; const r2 = rng(7); for (let i = 0; i < 12; i++) { const aa = r2() * TAU, dd = r2() * irx * .8; sparkle(ctx, ix + Math.cos(aa) * dd, iy + Math.sin(aa) * dd * 1.1, irx * (.08 + r2() * .14) * (.6 + .4 * Math.sin((e.t || 0) * 6 + i)), 0, 'rgba(255,244,210,.95)'); } ctx.globalCompositeOperation = 'source-over'; }
    // reflexos (2: grande em cima à esquerda, pequeno embaixo à direita)
    const hl = e.hl == null ? 2 : e.hl, wet = e.wet ? 1.25 : 1;
    ctx.fillStyle = 'rgba(255,255,255,.97)'; ctx.beginPath(); ctx.ellipse(ix - irx * .36, iy - iry * .4, irx * .3 * wet, iry * .26 * wet, -.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ix + irx * .4, iy + iry * .42, irx * .13, iry * .11, 0, 0, TAU); ctx.fill();
    if (hl > 2) { ctx.beginPath(); ctx.arc(ix + irx * .5, iy - iry * .15, irx * .07, 0, TAU); ctx.fill(); sparkle(ctx, ix - irx * .1, iy + iry * .5, irx * .2, 0, 'rgba(255,255,255,.9)'); }
  } else if (style === 'shock') { ctx.fillStyle = e.iris0; ctx.beginPath(); ctx.arc(ix, iy, irx * .2, 0, TAU); ctx.fill(); }
  else { ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(0, ry * .05, rx * .55, ry * .6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-rx * .15, -ry * .15, rx * .15, 0, TAU); ctx.fill(); }
  if (e.wet) { ctx.fillStyle = 'rgba(210,235,255,.5)'; ctx.beginPath(); ctx.ellipse(0, yb * .92, rx * .8, ry * .13, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
  // contorno: pálpebra superior grossa + patinha
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(Ix, Iy); ctx.bezierCurveTo(lerp(Ix, Ox, .06), lerp(Iy, yt, 1.33), lerp(Ix, Ox, .84), lerp(Oy, yt, 1.33), Ox, Oy); ctx.stroke();
  const la = e.lash || 0;
  if (la > 0) { // cílios: patinha externa + pontas
    ctx.beginPath(); ctx.moveTo(Ox - sd * rx * .05, Oy + ry * .02); ctx.quadraticCurveTo(Ox + sd * rx * .2, Oy - ry * .06, Ox + sd * rx * (.34 + .1 * la), Oy - ry * (.2 + .1 * la)); ctx.lineWidth = lw * .9; ctx.stroke();
    if (la > 1) { ctx.lineWidth = lw * .55; for (const u of [.42, .7]) { const bx = lerp(Ix, Ox, u), by = lerp(lerp(Iy, yt, 1.33 * .75), lerp(Oy, yt, 1.33 * .75), u) + (u - .5) * 0; ctx.beginPath(); ctx.moveTo(bx, by + ry * .04); ctx.lineTo(bx + sd * rx * .2, by - ry * .2); ctx.stroke(); } }
  }
  // pálpebra inferior discreta + dobra
  if (!e.noLow) { ctx.strokeStyle = rgba(e.skinSh || '#a05a4a', .8); ctx.lineWidth = lw * .3; ctx.beginPath(); ctx.moveTo(lerp(Ox, Ix, .15), lerp(Oy, yb, .9)); ctx.quadraticCurveTo(0, yb * 1.1, lerp(Ox, Ix, .8), lerp(Iy, yb, .7)); ctx.stroke(); }
  if (op > .6 && !e.noCrease) { ctx.strokeStyle = rgba(e.skinSh || '#a05a4a', .75); ctx.lineWidth = lw * .28; ctx.beginPath(); ctx.moveTo(lerp(Ix, Ox, .2), yt - ry * .22 + Iy * .3); ctx.quadraticCurveTo(0, yt - ry * .42, lerp(Ox, Ix, .02), Oy - ry * .2); ctx.stroke(); }
  if (e.tear) { const ty = ry * .8 + e.tear * ry * 1.2; ctx.fillStyle = 'rgba(190,230,255,.85)'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = lw * .2; ctx.beginPath(); ctx.moveTo(Ox - sd * rx * .5, ry * .8); ctx.quadraticCurveTo(Ox - sd * rx * .4, ty + ry * .3, Ox - sd * rx * .6, ty + ry * .3); ctx.quadraticCurveTo(Ox - sd * rx * .85, ty, Ox - sd * rx * .7, ry * .8); ctx.closePath(); ctx.fill(); ctx.stroke(); }
}

/* ---------------- rosto ---------------- */
const FACE = {
  neutral: { eye: 'open', mouth: 'smile' }, smile: { eye: 'open', mouth: 'smile' },
  sleepy: { eye: 'open', op: .5, mouth: 'small', brow: .3, look: [0, .6] },
  sad: { eye: 'sad', mouth: 'sad', brow: -1, wet: 1 },
  determined: { eye: 'determined', mouth: 'flat', brow: 1, op: .9 },
  cry: { eye: 'sad', mouth: 'wavy', brow: -1, wet: 1, tear: 1 },
  grin: { eye: 'open', mouth: 'grin', brow: .1 }, happy: { eye: 'happy', mouth: 'grin', brow: .1 }, closed: { eye: 'closed', mouth: 'smile' },
  scared: { eye: 'scared', mouth: 'wavy', brow: -.6, sweat: 1 }, shock: { eye: 'shock', mouth: 'o', brow: -.5 },
  love: { eye: 'love', mouth: 'cat', brow: -.1, cheek: 1.4 }, stars: { eye: 'stars', mouth: 'grin', brow: -.1, cheek: 1.4 },
  sing: { eye: 'open', mouth: 'o', brow: -.1 }, yawn: { eye: 'closed', mouth: 'yawn', brow: .2 }, pout: { eye: 'open', mouth: 'pout', brow: .6 },
  wink: { eye: 'wink', mouth: 'cat', brow: 0 },
};
function c2blinkOp(t, seed) { const per = 3.3 + ((seed * 0.37) % 1.4), ph = (t + seed * 1.7) % per, d = .17; return ph > d ? 1 : Math.abs(ph / d * 2 - 1); }
function c2face(ctx, Q, P, f, t, o) {
  if (typeof f === 'string') f = FACE[f] || FACE.neutral;
  f = f || {}; const pre = f.emo ? FACE[f.emo] || {} : {}; f = Object.assign({}, pre, f);
  const M = clamp(f.m || 0), et = f.eye || 'open', mt = f.mouth || 'smile', seed = P._seed || 0;
  const eyeK = (P._eyeK || 1) * (1 + .1 * M) * 1.1, rx = .265 * eyeK, ry = .335 * eyeK, ex = .45, ey = .2;
  let op = f.op == null ? 1 : f.op;
  const bl = f.blink != null ? f.blink : (o && o.blink != null ? o.blink : null);
  if (bl != null) op *= 1 - clamp(bl); else if (!(o && o.autoBlink === false)) op *= c2blinkOp(t, seed);
  const look = f.look || [0, 0];
  const style = et === 'sad' ? 'sad' : et === 'determined' ? 'determined' : et === 'scared' ? 'scared' : et === 'shock' ? 'shock' : et === 'love' ? 'love' : et === 'stars' ? 'stars' : et === 'happy' ? 'happy' : et === 'closed' ? 'closed' : et === 'dot' ? 'dot' : 'open';
  const tilt = et === 'determined' ? .85 : et === 'sad' ? -.7 : (f.brow || 0) * .2 * (et === 'open' ? 1 : 0);
  const inkE = P._lashC || c2dk(P.ink, .3, '#000'), mouthC = mix(P.skinSh, '#5a1020', .55);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // bochechas
  const ca = (f.cheek === false ? 0 : (f.cheek == null ? 1 : f.cheek)) * (.5 + .25 * M);
  if (ca > 0 && P.blush) [-1, 1].forEach(sd => { const bx = sd * .66, by = .5; ctx.fillStyle = rg(ctx, bx, by, 0, .26, [[0, rgba(P.blush, .62 * ca)], [.6, rgba(P.blush, .32 * ca)], [1, rgba(P.blush, 0)]]); ctx.beginPath(); ctx.ellipse(bx, by, .27, .17, 0, 0, TAU); ctx.fill();
    if (et === 'happy' || mt === 'grin' || M > .3 || f.hatch) { ctx.strokeStyle = rgba(c2dk(P.blush, .15), .55 * ca); ctx.lineWidth = .022; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(bx + i * .08 - .03, by + .05); ctx.lineTo(bx + i * .08 + .03, by - .05); ctx.stroke(); } } });
  // olhos
  [-1, 1].forEach(sd => {
    ctx.save(); ctx.translate(sd * ex, ey);
    let st = style, opx = op;
    if (et === 'wink') { if (sd > 0) st = 'happy'; else st = 'open'; }
    if (et === 'sleepy') opx = op * .5;
    c2eye(ctx, Q, { sd, rx, ry, op: opx, tilt, look, iris0: P.iris0, iris1: P.iris1, ink: inkE, lash: P._lash || 0, style: st, t, hl: M > .4 || P._hl3 ? 3 : 2, wet: f.wet, glow: f.glow, star: f.star, tear: f.tear ? (f.tear === true ? .5 : f.tear) : 0, skinSh: P.skinSh, pupil: f.pupil, noLow: false });
    ctx.restore();
  });
  // sobrancelhas
  const br = f.brow == null ? 0 : f.brow, bc = P._brow || mix(P.hair, '#000000', .1);
  if (!f.noBrow) { ctx.strokeStyle = bc; ctx.lineWidth = Math.max(.05, 1.7 / Q.pxu) * (P._browW || 1);
    [-1, 1].forEach(sd => { const bx = sd * ex, by = ey - ry - .1 - (et === 'shock' || et === 'scared' ? .06 : 0) - (op < .7 ? -.04 : 0), inY = by + (br > 0 ? br * .09 : br * .1), outY = by + (br > 0 ? -br * .02 : br * .06); ctx.beginPath(); ctx.moveTo(bx - sd * .2, inY); ctx.quadraticCurveTo(bx, by - .05 - (br < 0 ? -br * .04 : 0), bx + sd * .22, outY); ctx.stroke(); }); }
  // narizinho
  ctx.strokeStyle = rgba(P.skinSh, .95); ctx.lineWidth = Math.max(.03, 1.3 / Q.pxu); ctx.beginPath(); ctx.moveTo(-.045, .45); ctx.quadraticCurveTo(0, .5, .05, .45); ctx.stroke();
  ctx.fillStyle = rgba(c2lt(P.skin, .6), .8); ctx.beginPath(); ctx.arc(-.015, .415, .018, 0, TAU); ctx.fill();
  // boca
  c2mouth(ctx, Q, P, mt, mouthC, t, f);
  // suor / extras
  if (f.sweat) { ctx.fillStyle = 'rgba(190,230,255,.9)'; ctx.strokeStyle = 'rgba(120,170,220,.9)'; ctx.lineWidth = .02; ctx.beginPath(); ctx.moveTo(.92, -.4); ctx.quadraticCurveTo(1.04, -.18, .92, -.12); ctx.quadraticCurveTo(.8, -.18, .92, -.4); ctx.fill(); ctx.stroke(); }
}
function c2mouth(ctx, Q, P, type, col, t, f) {
  const my = .66, lw = Math.max(.04, 1.6 / Q.pxu); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  const fillO = '#8a2638', tong = '#ff8a9a';
  switch (type) {
    case 'smile': ctx.beginPath(); ctx.moveTo(-.17, my - .04); ctx.quadraticCurveTo(0, my + .14, .17, my - .04); ctx.stroke(); ctx.lineWidth = lw * .7; ctx.beginPath(); ctx.moveTo(-.185, my - .05); ctx.lineTo(-.2, my - .09); ctx.moveTo(.185, my - .05); ctx.lineTo(.2, my - .09); ctx.stroke(); break;
    case 'small': ctx.beginPath(); ctx.moveTo(-.08, my - .01); ctx.quadraticCurveTo(0, my + .06, .08, my - .01); ctx.stroke(); break;
    case 'cat': ctx.beginPath(); ctx.moveTo(-.2, my - .03); ctx.quadraticCurveTo(-.1, my + .1, 0, my - .01); ctx.quadraticCurveTo(.1, my + .1, .2, my - .03); ctx.stroke(); break;
    case 'grin': case 'open': case 'yawn': {
      const w = type === 'yawn' ? .22 : .24, h = type === 'yawn' ? .5 : type === 'open' ? .3 : .32;
      ctx.beginPath(); ctx.moveTo(-w, my - .06); ctx.quadraticCurveTo(0, my + (type === 'grin' ? .0 : -.03), w, my - .06); ctx.bezierCurveTo(w * .95, my + h, -w * .95, my + h, -w, my - .06); ctx.closePath();
      ctx.save(); ctx.fillStyle = fillO; ctx.fill(); ctx.clip();
      ctx.fillStyle = tong; ctx.beginPath(); ctx.ellipse(0, my + h * .95, w * .8, h * .5, 0, 0, TAU); ctx.fill();
      if (type !== 'yawn') { ctx.fillStyle = '#fffaf5'; ctx.fillRect(-w, my - .1, w * 2, .09); }
      ctx.restore(); ctx.beginPath(); ctx.moveTo(-w, my - .06); ctx.quadraticCurveTo(0, my + (type === 'grin' ? .0 : -.03), w, my - .06); ctx.bezierCurveTo(w * .95, my + h, -w * .95, my + h, -w, my - .06); ctx.closePath(); ctx.stroke(); break; }
    case 'o': ctx.beginPath(); ctx.ellipse(0, my + .05, .1, .13, 0, 0, TAU); ctx.fillStyle = fillO; ctx.fill(); ctx.stroke(); break;
    case 'flat': ctx.beginPath(); ctx.moveTo(-.13, my); ctx.lineTo(.13, my); ctx.stroke(); break;
    case 'frown': case 'sad': ctx.beginPath(); ctx.moveTo(-.14, my + .06); ctx.quadraticCurveTo(0, my - .07, .14, my + .06); ctx.stroke(); break;
    case 'pout': ctx.beginPath(); ctx.moveTo(-.12, my + .03); ctx.quadraticCurveTo(-.05, my - .03, 0, my + .02); ctx.quadraticCurveTo(.05, my - .03, .12, my + .03); ctx.stroke(); break;
    case 'wavy': ctx.beginPath(); ctx.moveTo(-.2, my); for (let k = 1; k <= 8; k++) ctx.lineTo(-.2 + k * .05, my + (k % 2 ? -.045 : .045)); ctx.stroke(); break;
  }
}
/* drawFace(ctx, P, f, t) — compat. P = paleta (c2mk) ; desenha em coordenadas de cabeça (raio 1) */
function drawFace(ctx, P, f = {}, t = 0, o = {}) { c2face(ctx, c2Q(ctx, o), P, f, t, o); }

/* ---------------- cabelo ---------------- */
function c2hairDesc(kind, m, t, o, side) { // retorna {back:[], front:[], cap, tails}
  const wv = o.wind == null ? 1 : o.wind, sw = (ph, a) => Math.sin(t * 2.6 + ph) * a * (.35 + wv * .65);
  const back = [], front = [], D = { back, front, cap: null };
  const C = (x, y, r) => ({ t: 'c', x, y, r });
  if (kind === 'puffs') {
    const pk = Math.pow(1 - m, .8), ax = .92, ay = -.74;
    [-1, 1].forEach(sd => { const sx = sw(sd, .045); const g = [[.98, -.9, .62], [1.32, -.66, .42], [.8, -1.34, .43], [1.14, -1.28, .4], [1.46, -1.0, .33], [.62, -.98, .4]];
      g.forEach(c => back.push(C(sd * (ax + (c[0] - ax) * pk) + sx, ay + (c[1] - ay) * pk + sx * .4, c[2] * pk))); });
    D.cap = { t: 'cap', top: 1.13, ay: -.6, sy: -.06 };
    front.push(D.cap);
    const cp = Math.pow(1 - m, 1.2); // franja cacheada
    for (let i = -3; i <= 3; i++) { const x = i * .3; front.push(C(x * 1.0, -.66 - .1 * (1 - x * x / 1.1) + (Math.abs(i) % 2 ? .04 : 0), (.28 + (Math.abs(i) % 2) * .02) * cp)); }
    [-1, 1].forEach(sd => { front.push(C(sd * .98, -.16, .2 * cp)); front.push(C(sd * 1.0, .12, .14 * cp)); });
  } else if (kind === 'short' || kind === 'kid') {
    D.cap = { t: 'cap', top: 1.1, ay: kind === 'kid' ? -.5 : -.56, sy: -.08, w: 1.08 }; front.push(D.cap);
    [-1, 1].forEach(sd => front.push({ t: 'l', bx: sd * .92, by: -.42, tx: sd * 1.0, ty: .06, w: .2, bend: sd * .05 }));
    if (kind === 'kid') { front.push({ t: 'l', bx: -.35, by: -.9, tx: -.2, ty: -.2, w: .24, bend: .1 }); front.push({ t: 'l', bx: .2, by: -.9, tx: .12, ty: -.3, w: .22, bend: -.1 }); front.push({ t: 'l', bx: .62, by: -.8, tx: .72, ty: -.18, w: .2, bend: -.1 }); }
    else for (let i = -2; i <= 2; i++) front.push(C(i * .36, -.56 + (Math.abs(i) === 1 ? .0 : .02), .28));
    front.push({ t: 'l', bx: .2, by: -1.02, tx: .46 + sw(1, .06), ty: -1.34, w: .13, bend: -.2 }); // topete
  } else if (kind === 'sides') {
    [-1, 1].forEach(sd => { front.push(C(sd * .96, -.14, .26)); front.push(C(sd * 1.0, .12, .2)); front.push({ t: 'l', bx: sd * .86, by: -.46, tx: sd * .62, ty: -.58, w: .2, bend: 0 }); });
  } else if (kind === 'curly' || kind === 'afro') {
    const af = kind === 'afro', R = af ? 1.5 : 1.2;
    if (af) { [[0, -.9, 1.0], [-.95, -.62, .72], [.95, -.62, .72], [-1.3, -.1, .5], [1.3, -.1, .5], [-.5, -1.4, .62], [.5, -1.4, .62], [0, -1.62, .55], [-1.12, -1.1, .55], [1.12, -1.1, .55]].forEach(c => back.push(C(c[0] + sw(c[0], .03), c[1], c[2]))); }
    else { [[-1.05, .05, .5], [1.05, .05, .5], [-1.18, .62, .46], [1.18, .62, .46], [-1.06, 1.15, .4], [1.06, 1.15, .4], [-.9, -.8, .55], [.9, -.8, .55], [0, -1.05, .6]].forEach(c => back.push(C(c[0] + sw(c[0] + c[1], .05), c[1], c[2]))); }
    D.cap = { t: 'cap', top: af ? 1.2 : 1.14, ay: -.5, sy: -.05, w: af ? 1.12 : 1.08 }; front.push(D.cap);
    for (let i = -3; i <= 3; i++) { const x = i * .3; front.push(C(x, -.5 - .1 * (1 - x * x / 1.1) + (Math.abs(i) % 2 ? .05 : 0), .3)); }
    [-1, 1].forEach(sd => { front.push(C(sd * .98, -.2, .24)); front.push(C(sd * 1.02, .1, .2)); });
    for (let a = 0; a < 7; a++) { const an = Math.PI + (a + .5) / 7 * Math.PI; front.push(C(Math.cos(an) * (af ? 1.1 : .98), -.1 + Math.sin(an) * (af ? 1.12 : 1.02), af ? .46 : .32)); }
  } else if (kind === 'wisp') { // cabelo preso: só fiapos laterais (lenço cobre)
    [-1, 1].forEach(sd => { front.push(C(sd * .98, -.1, .22)); front.push(C(sd * 1.0, .16, .16)); });
    D.cap = { t: 'cap', top: 1.1, ay: -.5, sy: -.05 }; front.unshift(D.cap);
  }
  if (m > .01 && kind === 'puffs') { // maria-chiquinhas + franja/mechas de anime
    const mm = E.io2(clamp(m));
    D.tails = mm;
    [[-.64, -.8, -.74, -.04, .26, .12], [-.3, -.84, -.4, -.12, .24, .1], [0, -.86, -.03, -.08, .23, 0], [.3, -.84, .4, -.14, .24, -.1], [.64, -.8, .74, -.06, .26, -.12]].forEach((l, i) => front.push({ t: 'l', bx: l[0], by: l[1], tx: l[0] + (l[2] - l[0]) * mm, ty: l[1] + (l[3] - l[1]) * mm, w: l[4] * (.4 + .6 * mm), bend: l[5] }));
    [-1, 1].forEach(sd => front.push({ t: 'l', bx: sd * 1.0, by: -.5, tx: sd * (1.0 + .08 * mm), ty: -.5 + 1.45 * mm + sw(sd, .03), w: .21 * mm + .01, bend: sd * -.05 }));
  }
  return D;
}
function c2twails(ctx, Q, P, m, t, o, ink) {
  const wv = o.wind == null ? 1 : o.wind, mm = E.io2(clamp(m));
  [-1, 1].forEach(sd => {
    const L = 3.7 * mm, n = 16, top = [], bot = [], sp = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, sway = Math.sin(t * 3.2 - u * 2.4 + sd * 1.3) * .26 * u * (.35 + .65 * wv) + Math.sin(t * 1.7 + sd) * .06 * u;
      const cx = sd * (.95 + Math.sin(u * 2.5) * .62 * mm + u * .2) + sway * sd * .6, cy = -.68 + u * L + Math.sin(u * 5 + t * 2) * .02 * wv;
      const w = (.5 * Math.sin(Math.PI * Math.min(1, .3 + u * .7)) * (1 - u * .55) + .05) * mm;
      sp.push([cx, cy, w]);
    }
    for (let i = 0; i <= n; i++) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = sp[i][2]; top.push([sp[i][0] - nx * w, sp[i][1] - ny * w]); bot.push([sp[i][0] + nx * w, sp[i][1] + ny * w]); }
    const pts = top.concat(bot.reverse()), sm = ctx => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
    sm(ctx); ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.stroke();
    ctx.fillStyle = lg(ctx, 0, -.7, 0, L - .5, [[0, P.hair], [.55, mix(P.hair, P.hair2, .7)], [1, P.hair2]]); ctx.fill();
    ctx.save(); sm(ctx); ctx.clip();
    // sombra (lado de baixo/direita) e brilho
    ctx.strokeStyle = rgba(P.hairSh, .5); ctx.lineWidth = .22; ctx.beginPath(); sp.forEach((p, i) => { const xx = p[0] + sd * .22 * (sd > 0 ? 1 : 1) * .9, yy = p[1]; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }); ctx.stroke();
    ctx.strokeStyle = rgba(P.hairHi, .6); ctx.lineWidth = .1; ctx.beginPath(); sp.forEach((p, i) => { if (i > 2 && i < 11) { const xx = p[0] - sd * .12, yy = p[1]; (i === 3) ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } }); ctx.stroke();
    ctx.strokeStyle = rgba(P.hairSh, .4); ctx.lineWidth = .02; for (let q = -1; q <= 1; q += 2) { ctx.beginPath(); sp.forEach((p, i) => { const xx = p[0] + q * p[2] * .35, yy = p[1]; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }); ctx.stroke(); }
    ctx.restore();
    // laço de cabelo na raiz
    ctx.save(); ctx.translate(sd * .98, -.64); ctx.scale(mm, mm); ctx.rotate(sd * .5);
    [-1, 1].forEach(q => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(q * .3, -.34, q * .55, -.18); ctx.quadraticCurveTo(q * .6, .06, q * .55, .22); ctx.quadraticCurveTo(q * .3, .2, 0, 0); ctx.closePath(); ctx.fillStyle = P.acc; ctx.fill(); ctx.strokeStyle = c2ink(P, P.acc); ctx.lineWidth = Q.ol * 1.5; ctx.stroke(); });
    ctx.beginPath(); ctx.arc(0, 0, .12, 0, TAU); ctx.fillStyle = P.gold; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-.03, -.03, .035, 0, TAU); ctx.fill(); ctx.restore();
  });
}
function c2hairDetails(ctx, Q, P, D, kind, t, m) {
  // brilho "anel de anjo" + riscos de mecha + cachinhos
  if (D.cap) { ctx.save(); c2dpath(ctx, D.cap); ctx.clip();
    ctx.strokeStyle = rgba(P.hairHi, .26); ctx.lineCap = 'round'; ctx.lineWidth = .09; ctx.beginPath(); ctx.arc(-.04, -.08, .9, Math.PI * 1.12, Math.PI * 1.6); ctx.stroke();
    ctx.lineWidth = .04; ctx.strokeStyle = rgba(P.hairHi, .4); ctx.beginPath(); ctx.arc(.0, -.1, .97, Math.PI * 1.68, Math.PI * 1.78); ctx.stroke();
    ctx.restore(); }
  if (kind === 'puffs' || kind === 'curly' || kind === 'afro') {
    const cp = kind === 'puffs' ? Math.pow(1 - m, 1.2) : 1;
    if (cp > .1) { ctx.strokeStyle = rgba(P.hairSh, .85); ctx.lineWidth = .035; ctx.lineCap = 'round';
      const r = rng(11); for (let i = 0; i < 9; i++) { const x = (r() - .5) * 1.7, y = -.95 + r() * .45, rr = .06 + r() * .05; ctx.beginPath(); ctx.arc(x, y, rr * cp, r() * 3, r() * 3 + 3.6); ctx.stroke(); } }
  }
  if (D.back && D.back.length) D.back.concat(D.front.filter(d => d.t === 'c' && d.r > .27)).forEach(d => { if (d.t !== 'c' || d.r < .2) return; ctx.strokeStyle = rgba(P.hairHi, .55); ctx.lineWidth = d.r * .12; ctx.lineCap = 'round'; const a0 = Math.atan2(-Q.sy, -Q.sx); ctx.beginPath(); ctx.arc(d.x, d.y, d.r * .68, a0 - .75, a0 + .5); ctx.stroke(); });
}

/* ---------------- acessórios de cabeça ---------------- */
function c2gear(ctx, Q, P, cfg, kind, t, o, m, pfx) {
  const fade = 1 - clamp(m * 1.6);
  if (fade <= .01) return;
  ctx.save(); ctx.globalAlpha = fade; if (m > 0) { ctx.translate(0, -m * 1.4); ctx.rotate(m * .5); }
  if (kind === 'cap') {
    const col = typeof o.cap === 'string' ? o.cap : P.cap, sh = c2dk(col, .28), ink = c2ink(P, col);
    c2group(ctx, Q, [{ t: 'cap', top: 1.26, ay: -.58, sy: -.2, w: 1.1 }], col, sh, ink);
    ctx.strokeStyle = rgba(sh, .9); ctx.lineWidth = .04; ctx.beginPath(); ctx.moveTo(0, -1.26); ctx.quadraticCurveTo(-.05, -.9, 0, -.5); ctx.moveTo(0, -1.26); ctx.quadraticCurveTo(-.7, -1.0, -.95, -.5); ctx.moveTo(0, -1.26); ctx.quadraticCurveTo(.7, -1.0, .95, -.5); ctx.stroke();
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, -1.26, .08, 0, TAU); ctx.fill();
    c2group(ctx, Q, [{ t: 'poly', p: [[-1.16, -.5], [-.7, -.4], [0, -.26], [.7, -.4], [1.16, -.5], [.9, -.62], [0, -.66], [-.9, -.62]] }], c2dk(col, .1), c2dk(col, .35), ink);
    ctx.strokeStyle = rgba('#fff', .5); ctx.lineWidth = .06; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-.1, -.2, .98, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  } else if (kind === 'hat') {
    const col = P.hat, sh = c2dk(col, .25, '#5a3a10'), ink = c2ink(P, col, .62);
    c2group(ctx, Q, [{ t: 'e', x: 0, y: -.48, rx: 1.7, ry: .36 }], c2lt(col, .08), sh, ink, { off: .1 });
    c2group(ctx, Q, [{ t: 'cap', top: 1.2, ay: -.5, sy: -.38, w: 1.0 }], col, sh, ink);
    ctx.fillStyle = c2dk(col, .5, '#5a2a10'); ctx.fillRect(-.99, -.66, 1.98, .15); ctx.strokeStyle = rgba(sh, .7); ctx.lineWidth = .025; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-1.5 + i * .6, -.42); ctx.lineTo(-1.45 + i * .6, -.3); ctx.stroke(); }
  } else if (kind === 'wrap') {
    const col = P.wrap, sh = c2dk(col, .26), ink = c2ink(P, col, .55);
    c2group(ctx, Q, [{ t: 'cap', top: 1.22, ay: -.34, sy: .0, w: 1.1 }], col, sh, ink, { off: .1 });
    ctx.save(); c2dpath(ctx, { t: 'cap', top: 1.22, ay: -.34, sy: .0, w: 1.1 }); ctx.clip();
    ctx.fillStyle = rgba(c2lt(col, .6), .75); const r = rng(5); for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc((r() - .5) * 2, -1.1 + r() * 1.0, .05 + r() * .03, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = c2lt(col, .35); ctx.lineWidth = .22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-1.12, -.1); ctx.quadraticCurveTo(0, -.9, 1.12, -.1); ctx.stroke();
    ctx.strokeStyle = rgba(sh, .6); ctx.lineWidth = .04; ctx.beginPath(); ctx.moveTo(-1.1, -.22); ctx.quadraticCurveTo(0, -1.02, 1.1, -.22); ctx.stroke();
    ctx.restore();
    // nó
    const sw = Math.sin(t * 2.4) * .06;
    c2group(ctx, Q, [{ t: 'l', bx: .5, by: -.98, tx: 1.18 + sw, ty: -1.48, w: .26, bend: .2 }, { t: 'l', bx: .5, by: -.98, tx: .86 + sw, ty: -1.66, w: .22, bend: -.2 }, { t: 'c', x: .55, y: -1.0, r: .17 }], col, sh, ink);
  } else if (kind === 'hood' && !pfx) { /* capuz desenhado em c2head */ }
  ctx.restore();
}

/* ---------------- cabeça ---------------- */
function c2headPath(ctx, b) {
  if (b !== false) ctx.beginPath();
  ctx.moveTo(0, -1); ctx.bezierCurveTo(.62, -1, 1.04, -.55, 1.04, .08); ctx.bezierCurveTo(1.04, .62, .6, 1.02, 0, 1.02); ctx.bezierCurveTo(-.6, 1.02, -1.04, .62, -1.04, .08); ctx.bezierCurveTo(-1.04, -.55, -.62, -1, 0, -1); ctx.closePath();
}
function c2head(ctx, Q, P, cfg, o, t, m, hairKind, layer) {
  const LB = layer !== 'front', LF = layer !== 'back';
  const ink = c2ink(P, P.skin, .6), hairInk = c2ink(P, P.hair, .6), hk = cfg.hk;
  let kind = o.hair != null ? o.hair : hairKind || hk; if (typeof kind === 'number') kind = ['short', 'short', 'curly', 'afro', 'puffs', 'kid'][kind % 6];
  const hg = lg(ctx, 0, -1.8, 0, 2.2, [[0, P.hair], [1, P.hair2 || P.hair]]);
  const D = c2hairDesc(kind, m, t, o);
  const thief = cfg.thief, back = o.spin != null && Math.cos(o.spin) < 0;
  // cabelo de trás
  if (LB) {
  if (D.back.length) c2group(ctx, Q, D.back, hg, P.hairSh, hairInk, { off: .12 });
  if (D.tails) c2twails(ctx, Q, P, m, t, o, hairInk);
  // capuz do ladrão (atrás/ao redor)
  if (thief) {
    const sw = Math.sin(t * 2) * .05;
    c2group(ctx, Q, [{ t: 'e', x: 0, y: 0, rx: 1.22, ry: 1.2 }, { t: 'l', bx: 0, by: -.9, tx: .5 + sw, ty: -1.9, w: .5, bend: .25 }], P.top, P.topSh, P.ink, { off: .12 });
  }
  }
  if (!LF) return;
  // orelhas
  if (!thief) [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 1.0, .2, .14, .21, 0, 0, TAU); ctx.fillStyle = P.skin; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 1.6; ctx.stroke(); ctx.strokeStyle = P.skinSh; ctx.lineWidth = .03; ctx.beginPath(); ctx.arc(sd * 1.0, .2, .06, 0, TAU); ctx.stroke(); });
  // rosto
  if (!thief) {
    c2headPath(ctx); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fillStyle = P.skin; ctx.fill();
    ctx.save(); c2headPath(ctx); ctx.clip();
    ctx.beginPath(); ctx.rect(-4, -4, 8, 8); ctx.translate(-Q.sx * .12, -Q.sy * .1); c2headPath(ctx, false); ctx.fillStyle = P.skinSh; ctx.globalAlpha = .75; ctx.fill('evenodd'); ctx.restore(); ctx.globalAlpha = 1;
    // rim light no contorno
    if (Q.rimA > 0) { ctx.save(); c2headPath(ctx); ctx.clip(); ctx.strokeStyle = rgba(Q.rim, Q.rimA * .8); ctx.lineWidth = .1; ctx.lineCap = 'round'; const a0 = Math.atan2(Q.sy, Q.sx); ctx.beginPath(); ctx.arc(0, .02, 1.0, a0 - .5, a0 + .55); ctx.stroke(); ctx.restore(); }
    // sombra da franja na testa
    if (D.cap && !back) { ctx.save(); c2headPath(ctx); ctx.clip(); ctx.translate(0, .13); c2dpath(ctx, D.cap); ctx.fillStyle = rgba(P.skinSh, .85); ctx.fill(); ctx.restore(); }
    if (!cfg.noFace && !back) { ctx.save(); ctx.translate(o.faceShift || (o.turn ? o.turn * .3 : 0), 0); const fo = typeof o.face === 'string' ? FACE[o.face] : o.face; c2face(ctx, Q, P, Object.assign({}, fo || {}, fo && fo.m == null ? { m: m } : { m: (fo && fo.m) || 0 }), t, o); ctx.restore(); }
    if (cfg.cheeky && !back) { ctx.fillStyle = P.skin; }
  } else {
    // buraco do rosto + olhos brilhantes
    ctx.beginPath(); ctx.ellipse(0, .15, .86, .8, 0, 0, TAU); ctx.fillStyle = '#04020a'; ctx.fill();
    const ec = o.eyeCol || '#ffe14a', pul = .85 + .15 * Math.sin(t * 5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [-1, 1].forEach(sd => { const ex = sd * .38, ey = .1; ctx.fillStyle = rg(ctx, ex, ey, 0, .7, [[0, rgba(ec, .55 * pul)], [1, rgba(ec, 0)]]); ctx.beginPath(); ctx.arc(ex, ey, .7, 0, TAU); ctx.fill(); });
    ctx.restore();
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * .14, .14); ctx.quadraticCurveTo(sd * .4, -.02, sd * .66, .0); ctx.quadraticCurveTo(sd * .46, .26, sd * .14, .14); ctx.closePath(); ctx.fillStyle = ec; ctx.fill(); ctx.fillStyle = '#fffbe6'; ctx.beginPath(); ctx.ellipse(sd * .4, .1, .14, .045, sd * -.15, 0, TAU); ctx.fill(); });
  }
  // glasses / barba / bigode
  if (!thief && !back) {
    if (cfg.deco && cfg.deco.includes('glasses')) { ctx.strokeStyle = c2dk(P.ink, .2); ctx.lineWidth = .06; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * .44, .17, .34, .34, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,.18)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .035; ctx.beginPath(); ctx.arc(sd * .44, .17, .26, 3.6, 4.3); ctx.stroke(); ctx.strokeStyle = c2dk(P.ink, .2); ctx.lineWidth = .06; }); ctx.beginPath(); ctx.moveTo(-.1, .15); ctx.quadraticCurveTo(0, .08, .1, .15); ctx.stroke(); }
    if (cfg.deco && cfg.deco.includes('mustache')) { ctx.fillStyle = P.hair; ctx.strokeStyle = c2ink(P, P.hair, .5); ctx.lineWidth = Q.ol * 1.4; ctx.beginPath(); ctx.moveTo(0, .53); ctx.quadraticCurveTo(-.2, .46, -.34, .58); ctx.quadraticCurveTo(-.2, .64, 0, .56); ctx.quadraticCurveTo(.2, .64, .34, .58); ctx.quadraticCurveTo(.2, .46, 0, .53); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (cfg.deco && cfg.deco.includes('beard')) { ctx.save(); c2headPath(ctx); ctx.clip(); ctx.fillStyle = rgba(P.hair, .5); ctx.beginPath(); ctx.moveTo(-1.05, .35); ctx.quadraticCurveTo(-.5, .5, -.3, .6); ctx.quadraticCurveTo(0, .55, .3, .6); ctx.quadraticCurveTo(.5, .5, 1.05, .35); ctx.lineTo(1.1, 1.2); ctx.lineTo(-1.1, 1.2); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  if (back && !thief) c2group(ctx, Q, [{ t: 'e', x: 0, y: .04, rx: 1.07, ry: 1.06 }], hg, P.hairSh, hairInk, { off: .15 });
  // cabelo da frente
  if (D.front.length) {
    const fr = D.front;
    c2group(ctx, Q, fr, hg, P.hairSh, hairInk, { off: .12, line: rgba(P.hairSh, .55) });
    c2hairDetails(ctx, Q, P, D, kind, t, m);
  }
  if (kind === 'puffs') { // xuxinhas amarelas -> laços rosa
    const pk = Math.pow(1 - m, .8);
    [-1, 1].forEach(sd => { ctx.save(); ctx.translate(sd * .92, -.86); ctx.rotate(sd * .9); ctx.scale(pk, pk);
      if (pk > .05) { const ds = []; for (let i = 0; i < 9; i++) { const an = i / 9 * TAU; ds.push({ t: 'c', x: Math.cos(an) * .27, y: Math.sin(an) * .15, r: .1 }); } ds.push({ t: 'e', x: 0, y: 0, rx: .27, ry: .15 });
        c2group(ctx, Q, ds, P.acc, P.accSh || c2dk(P.acc, .22), c2ink(P, P.acc), { off: .1 });
        ctx.strokeStyle = rgba('#fff', .55); ctx.lineWidth = .035; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-.02, -.01, .16, 3.5, 4.5); ctx.stroke(); }
      ctx.restore(); });
  }
  if (kind === 'puffs' && m > .02) { // presilha estrela dourada
    ctx.save(); ctx.translate(.62, -.62); ctx.scale(m, m); ctx.rotate(.3); compassStar(ctx, 0, 0, .26, 0, '#fff3a8', P.gold, c2dk(P.gold, .6), Q.ol * 1.3, { gem: false }); ctx.restore();
  }
  // sobrancelhas por cima do cabelo (leve)
  // chapéu/boné/lenço
  c2gear(ctx, Q, P, cfg, o.cap === false ? null : (cfg.gear || (typeof o.cap === 'string' ? 'cap' : null)), t, o, m);
}

/* drawHead(ctx, P|who, o, hairKind, t): cabeça isolada (raio 1) centrada na origem — para closes. */
function drawHeadFull(ctx, P, o = {}, hairKind, t = 0) {
  if (typeof P === 'string') { o = Object.assign({}, o, { who: P }); P = null; }
  const cfg = c2cfg(o), m = cfg.mag ? clamp(o.magical || 0) : 0;
  const pal = (P && P.skin) ? P : c2pal(cfg, o, m);
  const mf = (P === PAL.hero && m > 0) ? palMix(PAL.hero, PAL.heroMagic, m) : pal;
  ctx.save(); if (o.headFlip) ctx.scale(-1, 1);
  const Q = c2Q(ctx, o), W2 = Object.assign({}, mf, c2eyeExtras(cfg, m, o, mf));
  c2head(ctx, Q, W2, cfg, o, t || o.t || 0, m, hairKind);
  ctx.restore();
}
function c2eyeExtras(cfg, m, o, P) {
  const seed = (cfg.i != null ? cfg.i * 3 + 1 : cfg === C2W.hero ? 0 : cfg === C2W.mae ? 5 : cfg === C2W.irmao ? 9 : 4);
  return { _seed: seed, _lash: Math.max(cfg.lash || 0, m > .5 ? 2 : 0), _eyeK: (cfg.hkS > 1.05 ? 1.1 : 1) * (1 + .08 * m) * (cfg.i != null && cfg.i >= 2 && cfg.sc < .9 ? 1 : 1), _hl3: m > .5, _brow: cfg === C2W.hero ? mix('#1c110c', '#d070b0', m) : null, _browW: cfg.lash >= 1 ? 1 : 1.25, _lashC: cfg === C2W.hero ? mix('#1c0e10', '#4a1f5a', m) : null };
}

/* ---------------- mãos ---------------- */
function c2hand(ctx, Q, P, w, dir, side, mode, o = {}) {
  const ux = Math.cos(dir), uy = Math.sin(dir), skin = P.skin, ink = c2ink(P, skin, .6), sh = P.skinSh;
  mode = mode || 'open';
  let px = w[0] + ux * .17, py = w[1] + uy * .17, pr = .21;
  if (mode === 'fist' || mode === 'hold') { pr = .24; px = w[0] + ux * .14; py = w[1] + uy * .14; }
  if (mode === 'cam') { pr = .4; px = w[0] + ux * .2; py = w[1] + uy * .2; }
  // polegar
  let tnx = -uy, tny = ux; // perpendicular
  const want = Math.abs(uy) < .55 ? -1 : 0; // braço horizontal: polegar para cima
  if (want) { if (tny > 0) { tnx = -tnx; tny = -tny; } } else { if (tnx * side > 0) { tnx = -tnx; tny = -tny; } }
  const th = mode === 'flat' ? [[px + tnx * .1, py + tny * .1], [px + tnx * .18 + ux * .12, py + tny * .18 + uy * .12]] : [[px + tnx * .12 + ux * -.05, py + tny * .12 + uy * -.05], [px + tnx * .24 + ux * (mode === 'fist' ? .04 : .16), py + tny * .24 + uy * (mode === 'fist' ? .04 : .16)]];
  const parts = [{ a: [px, py], ra: pr, b: [px, py], rb: pr }, { a: th[0], ra: .085, b: th[1], rb: .075 }];
  if (mode === 'point') { const L = .36, rr = .075; parts.push({ a: [px + ux * .06 - tnx * .02, py + uy * .06 - tny * .02], ra: rr * 1.05, b: [px + ux * (.06 + L) - tnx * .02, py + uy * (.06 + L) - tny * .02], rb: rr }); }
  if (mode === 'claw') { for (let i = -1; i <= 1; i++) { const a = dir + i * .38; parts.push({ a: [px + Math.cos(a) * .1, py + Math.sin(a) * .1], ra: .06, b: [px + Math.cos(a) * .52, py + Math.sin(a) * .52], rb: .02 }); } }
  ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2;
  parts.forEach(p => { c2cap(ctx, p.a, p.ra, p.b, p.rb); ctx.stroke(); });
  parts.forEach(p => { c2cap(ctx, p.a, p.ra, p.b, p.rb); ctx.fillStyle = skin; ctx.fill(); });
  // sombra no lado oposto da luz + dedos
  ctx.save(); c2cap(ctx, parts[0].a, pr, parts[0].b, pr); ctx.clip(); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(px + Q.sx * pr * .75, py + Q.sy * pr * .75, pr * .9, 0, TAU); ctx.fill();
  c2cap(ctx, parts[0].a, pr, parts[0].b, pr); ctx.fillStyle = skin; ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  ctx.save(); c2cap(ctx, parts[0].a, pr, parts[0].b, pr); ctx.clip(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(px - Q.sx * pr * .18, py - Q.sy * pr * .18, pr * .8, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = rgba(ink, .8); ctx.lineWidth = Q.ol * .9; ctx.lineCap = 'round';
  if (mode === 'open') { for (const q of [-.42, 0, .42]) { const a = dir + q * .7; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * pr * .45, py + Math.sin(a) * pr * .45); ctx.lineTo(px + Math.cos(a) * pr * .95, py + Math.sin(a) * pr * .95); ctx.stroke(); } }
  else if (mode === 'fist' || mode === 'hold') { for (const q of [-.5, 0, .5]) { const a = dir + q; ctx.beginPath(); ctx.arc(px + Math.cos(a) * pr * .55, py + Math.sin(a) * pr * .55, pr * .22, a - 1.2, a + 1.2); ctx.stroke(); } }
  else if (mode === 'flat') { ctx.beginPath(); ctx.moveTo(px + ux * pr * .5, py + uy * pr * .5); ctx.lineTo(px + ux * pr, py + uy * pr); ctx.stroke(); }
  if (mode === 'cam') { const fx = px - .02, fy = py - .1; ctx.beginPath(); ctx.arc(fx, fy, .2, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.stroke(); ctx.beginPath(); ctx.arc(fx, fy, .2, 0, TAU); ctx.fill(); ctx.fillStyle = rgba(sh, .9); ctx.beginPath(); ctx.arc(fx + Q.sx * .1, fy + Q.sy * .1, .12, 0, TAU); ctx.fill(); ctx.fillStyle = rgba('#fff', .55); ctx.beginPath(); ctx.ellipse(fx - .06, fy - .08, .06, .04, -.5, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(ink, .8); ctx.lineWidth = Q.ol; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(px + i * .2, py + .24, .1, .2, Math.PI - .2); ctx.stroke(); } }
}

/* ---------------- corpo ---------------- */
function c2shadePath(ctx, Q, pathFn, shade, k = .22) {
  ctx.save(); pathFn(); ctx.clip(); ctx.beginPath(); ctx.rect(-40, -40, 80, 80); ctx.translate(-Q.sx * k, -Q.sy * k); pathFn(false); ctx.fillStyle = shade; ctx.fill('evenodd'); ctx.restore();
}
function c2ribbon(ctx, Q, x0, y0, dirx, len, wid, c1, c2, ph, t, wv, ink) {
  const n = 14, sp = [];
  for (let i = 0; i <= n; i++) { const u = i / n; sp.push([x0 + dirx * (u * len * .7 + Math.sin(t * 3 - u * 3 + ph) * .15 * u), y0 + u * len * .1 + u * u * len * .5 + Math.sin(t * 4.5 - u * 4 + ph) * .38 * u * (.35 + .65 * wv)]); }
  const top = [], bot = [];
  for (let i = 0; i <= n; i++) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = wid * (1 - i / n * .25) * (i === n ? .2 : 1); top.push([sp[i][0] - dy / l * w, sp[i][1] + dx / l * w]); bot.push([sp[i][0] + dy / l * w, sp[i][1] - dx / l * w]); }
  const pts = top.concat(bot.reverse()); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fillStyle = lg(ctx, x0, y0, x0 + dirx * len, y0 + len * .5, [[0, c1], [1, c2]]); ctx.fill();
  ctx.strokeStyle = rgba('#fff', .6); ctx.lineWidth = wid * .22; ctx.lineCap = 'round'; ctx.beginPath(); sp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
}
function c2legPt(l, hf) { return hf <= 1 ? [lerp(l[0][0], l[1][0], hf), lerp(l[0][1], l[1][1], hf)] : [lerp(l[1][0], l[2][0], hf - 1), lerp(l[1][1], l[2][1], hf - 1)]; }
function c2skirt(ctx, Q, P, k, hw, hf, flare, scal, col, sh, trim, ink, t, wv, ph, hy) {
  const hL = c2legPt(k.lL, hf), hR = c2legPt(k.lR, hf), sw = Math.sin(t * 3.2 + ph) * .06 * wv;
  const xl = hL[0] - flare + sw, xr = hR[0] + flare + sw, yl = hL[1] + .08, yr = hR[1] + .08, wl = -hw + .06, wr = hw - .06, wy = hy - .32;
  const sag = flare * .22, n = scal;
  const path = b => { if (b !== false) ctx.beginPath(); ctx.moveTo(wl, wy); ctx.lineTo(xl, yl);
    if (n > 0) for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, x1 = lerp(xl, xr, u1), y1 = lerp(yl, yr, u1) + Math.sin(u1 * Math.PI) * sag, x0 = lerp(xl, xr, u0), y0 = lerp(yl, yr, u0) + Math.sin(u0 * Math.PI) * sag; ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + flare * .32, x1, y1); }
    else ctx.quadraticCurveTo((xl + xr) / 2, Math.max(yl, yr) + sag * 3, xr, yr);
    ctx.lineTo(wr, wy); ctx.closePath(); };
  path(); ctx.fillStyle = col; ctx.fill(); c2shadePath(ctx, Q, path, sh, .3);
  ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.lineJoin = 'round'; path(); ctx.stroke();
  ctx.save(); path(); ctx.clip(); ctx.strokeStyle = rgba(sh, .75); ctx.lineWidth = Q.ol * .8;
  for (let i = 1; i < 5; i++) { const u = i / 5, bx = lerp(wl, wr, u), tx = lerp(xl, xr, u); ctx.beginPath(); ctx.moveTo(bx, wy); ctx.quadraticCurveTo((bx + tx) / 2 + sw, (wy + lerp(yl, yr, u)) / 2, tx, lerp(yl, yr, u) + .1); ctx.stroke(); }
  if (trim) { ctx.strokeStyle = trim; ctx.lineWidth = .06; ctx.beginPath(); ctx.moveTo(xl, yl - .1); ctx.quadraticCurveTo((xl + xr) / 2, Math.max(yl, yr) + sag * 3 - .1, xr, yr - .1); ctx.stroke(); }
  ctx.restore();
}
function c2shoe(ctx, Q, P, cfg, l, sd, m, t, ph) {
  const fx = l[2][0], fy = l[2][1], kind = cfg.shoeK || 'sneaker', ink = c2ink(P, P.sole, .5);
  const fxc = fx + sd * .1, hero = cfg === C2W.hero;
  if (hero && m > .02) { // asinhas
    ctx.save(); ctx.globalAlpha = clamp(m * 3); const fl = Math.sin(t * 7 + ph) * .13;
    for (let q = 0; q < 3; q++) { const a = -Math.PI / 2 - sd * (.95 + q * .32) + fl * sd; ctx.save(); ctx.translate(fx - sd * .16, fy - .22); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(.42 + q * .02, 0, .46 - q * .05, .11, 0, 0, TAU); ctx.fillStyle = q === 0 ? '#fff' : q === 1 ? '#ffe3f2' : '#ffc6e4'; ctx.fill(); ctx.strokeStyle = '#d78ab8'; ctx.lineWidth = Q.ol * 1.3; ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  if (kind === 'flip' || kind === 'sandal') {
    const a = 1 - clamp(m * 1.2);
    if (a > .01) { ctx.save(); ctx.globalAlpha = a;
      ctx.beginPath(); ctx.ellipse(fxc, fy - .02, .5, .16, 0, 0, TAU); ctx.fillStyle = P.sole; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(fxc, fy - .02, .5, .16, 0, 0, TAU); ctx.fillStyle = P.sole; ctx.fill();
      ctx.beginPath(); ctx.ellipse(fxc, fy - .14, .4, .17, 0, 0, TAU); ctx.fillStyle = P.skin; ctx.fill(); ctx.strokeStyle = c2ink(P, P.skin, .6); ctx.lineWidth = Q.ol * 1.8; ctx.stroke(); ctx.beginPath(); ctx.ellipse(fxc, fy - .14, .4, .17, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = P.shoe; ctx.lineWidth = .1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fxc - .08, fy - .06); ctx.lineTo(fxc + sd * .16, fy - .26); ctx.moveTo(fxc + sd * .26, fy - .08); ctx.lineTo(fxc + sd * .16, fy - .26); ctx.stroke();
      ctx.restore(); }
  } else if (kind === 'sneaker') {
    const a = 1 - clamp(m * 1.2);
    if (a > .01) { ctx.save(); ctx.globalAlpha = a;
      const sh = P.shoe; ctx.beginPath(); ctx.ellipse(fxc, fy - .03, .56, .17, 0, 0, TAU); ctx.fillStyle = P.sole; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.stroke(); ctx.fill();
      c2group(ctx, Q, [{ t: 'e', x: fxc + sd * .02, y: fy - .17, rx: .46, ry: .24 }], sh, c2dk(sh, .28), c2ink(P, sh, .55));
      ctx.strokeStyle = rgba('#fff', .85); ctx.lineWidth = .04; ctx.beginPath(); ctx.moveTo(fxc + sd * .1, fy - .3); ctx.lineTo(fxc + sd * .3, fy - .22); ctx.moveTo(fxc + sd * .0, fy - .3); ctx.lineTo(fxc + sd * .2, fy - .18); ctx.stroke();
      ctx.restore(); }
  }
  if (hero && m > .02) { // bota branca/rosa com laço
    const a = clamp(m * 3), r = m; ctx.save(); ctx.globalAlpha = a;
    const sh = P.shoe, top = [l[2][0] + (l[1][0] - l[2][0]) * .42, l[2][1] + (l[1][1] - l[2][1]) * .42];
    c2limb(ctx, Q, [[fx, fy - .1], top], [.24, .26], '#fff4fa', '#f6d3e6', '#d78ab8', { norim: true });
    c2group(ctx, Q, [{ t: 'e', x: fxc + sd * .06, y: fy - .08, rx: .52, ry: .27 }], '#fff4fa', '#f6d3e6', '#d78ab8');
    ctx.beginPath(); ctx.ellipse(fxc + sd * .06, fy + .04, .52, .09, 0, 0, TAU); ctx.fillStyle = sh; ctx.fill(); ctx.strokeStyle = '#d78ab8'; ctx.lineWidth = Q.ol * 1.4; ctx.stroke();
    ctx.fillStyle = '#ff5fa8'; ctx.strokeStyle = '#a83d78'; ctx.lineWidth = Q.ol * 1.3; [-1, 1].forEach(q => { ctx.beginPath(); ctx.ellipse(top[0] + q * .17, top[1] + .02, .17, .1, q * .6, 0, TAU); ctx.fill(); ctx.stroke(); }); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(top[0], top[1] + .02, .07, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function c2arm(ctx, Q, P, cfg, k, side, pose, m, t, o, hold) {
  const a = side < 0 ? k.aL : k.aR, mode = (side < 0 ? pose.hL : pose.hR) || 'open', hero = cfg === C2W.hero;
  let slv = cfg.slv != null ? cfg.slv : ({ hoodie: .97, coat: .82, tee: .36, vest: .96, dress: .36, cloak: 1, }[cfg.top_] || .5);
  if (hero) slv = lerp(.97, .3, E.io2(m));
  const skinF = P.skin, rs = [.27, .22, .17], sleeveC = cfg.top_ === 'cloak' ? P.top : P.top, shC = cfg.top_ === 'cloak' ? P.topSh : P.topSh;
  c2limb(ctx, Q, a, rs, skinF, P.skinSh, c2ink(P, skinF, .6));
  // manga
  const L1 = Math.hypot(a[1][0] - a[0][0], a[1][1] - a[0][1]), L2 = Math.hypot(a[2][0] - a[1][0], a[2][1] - a[1][1]), D = slv * (L1 + L2);
  let pts, e;
  const up = (p, q, d) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [p[0] + (q[0] - p[0]) / L * d, p[1] + (q[1] - p[1]) / L * d]; };
  if (D <= L1) { e = up(a[0], a[1], D); pts = [a[0], e]; } else { e = up(a[1], a[2], D - L1); pts = [a[0], a[1], e]; }
  const puff = hero ? m : 0, r0 = .36 + puff * .08, r1 = .31 + puff * .06;
  const rr = pts.length === 2 ? [r0, r1] : [r0, (r0 + r1) / 2, r1];
  if (slv > .05 && cfg.top_ !== 'dress' || (cfg.top_ === 'dress' || slv > .05)) c2limb(ctx, Q, pts, rr, sleeveC, shC, c2ink(P, sleeveC, .55));
  // punho/barra
  const pe = pts[pts.length - 1], pp = pts[pts.length - 2], cuffC = hero ? mix(P.trim, '#ffb0d6', m) : (cfg.top_ === 'coat' ? P.topSh : P.trim);
  const d = Math.hypot(pe[0] - pp[0], pe[1] - pp[1]) || 1, bx = pe[0] - (pe[0] - pp[0]) / d * .2, by = pe[1] - (pe[1] - pp[1]) / d * .2;
  if (slv > .05 && cfg.top_ !== 'cloak') c2limb(ctx, Q, [[bx, by], pe], [r1 + .02, r1 + .02], cuffC, c2dk(cuffC, .22), c2ink(P, cuffC, .55), { norim: true });
  if (hero && m > .05) { ctx.save(); ctx.globalAlpha = m; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .1; ctx.lineCap = 'round'; const wx = a[2][0] + (a[1][0] - a[2][0]) * .12, wy = a[2][1] + (a[1][1] - a[2][1]) * .12; ctx.beginPath(); ctx.arc(wx, wy, .21, 0, TAU); ctx.stroke(); ctx.restore(); }
  if (!hold) { const dd = Math.atan2(a[2][1] - a[1][1], a[2][0] - a[1][0]); c2hand(ctx, Q, P, a[2], dd, side, cfg.thief ? 'claw' : mode); }
}

function c2torso(ctx, Q, P, cfg, k, pose, m, t, o, Env) {
  const nk = k.neck, sL = [k.shL[0] - .14, k.shL[1] - .12], sR = [k.shR[0] + .14, k.shR[1] - .12], hw = Env.hw, hy = Env.hy, kind = cfg.top_, hero = cfg === C2W.hero;
  const ink = c2ink(P, P.top, .56), wv = Env.wv;
  let tp;
  if (kind === 'cloak') {
    tp = b => { if (b !== false) ctx.beginPath(); ctx.moveTo(sL[0] - .1, sL[1] + .3); ctx.quadraticCurveTo(sL[0] - .1, sL[1] - .02, sL[0] + .3, sL[1] - .05); ctx.quadraticCurveTo(nk[0], nk[1] - .3, sR[0] - .3, sR[1] - .05); ctx.quadraticCurveTo(sR[0] + .1, sR[1] - .02, sR[0] + .1, sR[1] + .3);
      ctx.bezierCurveTo(hw + .5, hy - .5, hw + .9, hy + .8, hw + .8, hy + 1.6);
      const n = 7; for (let i = 0; i < n; i++) { const u = (i + .5) / n, x = lerp(hw + .8, -hw - .8, u), y = hy + 1.6 + Math.sin(t * 3 + i * 1.7) * .12 * wv + (i % 2 ? .45 : .1); ctx.lineTo(x, y); ctx.lineTo(lerp(hw + .8, -hw - .8, (i + 1) / n), hy + 1.6 + Math.sin(t * 3 + i * 1.7 + 1) * .1 * wv); }
      ctx.bezierCurveTo(-hw - .9, hy + .8, -hw - .5, hy - .5, sL[0] - .1, sL[1] + .3); ctx.closePath(); };
  } else {
    tp = b => { if (b !== false) ctx.beginPath(); ctx.moveTo(sL[0], sL[1] + .28); ctx.quadraticCurveTo(sL[0] - .04, sL[1] - .02, sL[0] + .3, sL[1] - .04); ctx.quadraticCurveTo(nk[0], nk[1] - .3, sR[0] - .3, sR[1] - .04); ctx.quadraticCurveTo(sR[0] + .04, sR[1] - .02, sR[0], sR[1] + .28);
      ctx.bezierCurveTo(sR[0] + .01, sR[1] + .7, hw + .06, hy - .5, hw, hy); ctx.quadraticCurveTo(0, hy + .2, -hw, hy); ctx.bezierCurveTo(-hw - .06, hy - .5, sL[0] - .01, sL[1] + .7, sL[0], sL[1] + .28); ctx.closePath(); };
  }
  const topC = P.top; tp(); ctx.fillStyle = topC; ctx.fill(); c2shadePath(ctx, Q, tp, P.topSh, .3);
  // dobras + luz de recorte
  ctx.save(); tp(); ctx.clip();
  ctx.strokeStyle = rgba(P.topSh, .8); ctx.lineWidth = Q.ol * .9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sL[0] + .2, hy - .35); ctx.quadraticCurveTo(sL[0] + .3, hy - .65, sL[0] + .15, hy - .9); ctx.moveTo(sR[0] - .25, hy - .3); ctx.quadraticCurveTo(sR[0] - .1, hy - .7, sR[0] - .3, hy - 1.0); ctx.stroke();
  if (Q.rimA > 0) { ctx.strokeStyle = rgba(Q.rim, Q.rimA * .9); ctx.lineWidth = .12; const sd = Q.sx > 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo((sd > 0 ? sR : sL)[0] - sd * .02, sR[1] + .25); ctx.bezierCurveTo((sd > 0 ? sR : sL)[0] + sd * .0, sR[1] + .7, sd * (hw + .06), hy - .5, sd * hw, hy); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.lineJoin = 'round'; tp(); ctx.stroke();
  const cx = nk[0] * .9;
  // ---- detalhes por tipo ----
  if (kind === 'hoodie') {
    const a = 1 - clamp(m * 1.5);
    if (a > .01) { ctx.save(); ctx.globalAlpha = a; tp(); ctx.clip();
      // barra canelada
      ctx.fillStyle = P.trim; ctx.fillRect(-hw - .1, hy - .24, hw * 2 + .2, .4); ctx.strokeStyle = rgba(c2dk(P.trim, .3), .6); ctx.lineWidth = .02; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * .11, hy - .22); ctx.lineTo(i * .11, hy + .12); ctx.stroke(); }
      ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 1.2; ctx.beginPath(); ctx.moveTo(-hw - .1, hy - .24); ctx.lineTo(hw + .1, hy - .24); ctx.stroke();
      // bolso canguru
      const py0 = hy - 1.0, py1 = hy - .26; ctx.beginPath(); ctx.moveTo(-.56, py0); ctx.quadraticCurveTo(0, py0 - .06, .56, py0); ctx.lineTo(.7, py1); ctx.lineTo(-.7, py1); ctx.closePath(); ctx.fillStyle = mix(P.top, P.topSh, .45); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 1.3; ctx.stroke();
      ctx.setLineDash([.08, .06]); ctx.strokeStyle = rgba(c2dk(P.top, .4), .7); ctx.lineWidth = .025; ctx.beginPath(); ctx.moveTo(-.52, py0 + .08); ctx.lineTo(.52, py0 + .08); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      // cordinhas
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = P.top2; ctx.lineWidth = .06; ctx.lineCap = 'round';
      [-1, 1].forEach(sd => { const sw = Math.sin(t * 2.2 + sd) * .04 * wv; ctx.beginPath(); ctx.moveTo(cx + sd * .22, nk[1] + .34); ctx.quadraticCurveTo(cx + sd * .3 + sw, nk[1] + .75, cx + sd * .24 + sw, nk[1] + 1.1); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.strokeStyle = c2dk(P.top2, .5); ctx.lineWidth = .02; ctx.beginPath(); ctx.arc(cx + sd * .24 + sw, nk[1] + 1.14, .05, 0, TAU); ctx.fill(); ctx.strokeStyle = P.top2; ctx.lineWidth = .06; });
      ctx.restore(); }
    // capuz (gola) em volta do pescoço
    { const hs = 1 - clamp(m * 1.3); if (hs > .01) { ctx.save(); ctx.translate(nk[0], nk[1] + .02); ctx.scale(hs, hs); c2group(ctx, Q, [{ t: 'e', x: 0, y: .0, rx: .8, ry: .3 }], P.top, P.topSh, ink, { off: .12 }); ctx.beginPath(); ctx.ellipse(0, .02, .52, .15, 0, 0, TAU); ctx.fillStyle = c2dk(P.topSh, .25); ctx.fill(); ctx.restore(); } }
  } else if (kind === 'coat') {
    tp(); ctx.save(); ctx.clip();
    ctx.fillStyle = P.top2; ctx.beginPath(); ctx.moveTo(cx - .5, nk[1] - .05); ctx.lineTo(cx + .5, nk[1] - .05); ctx.lineTo(cx, nk[1] + 1.0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 1.3; ctx.beginPath(); ctx.moveTo(cx, nk[1] + .6); ctx.lineTo(cx, hy + .3); ctx.stroke();
    ctx.restore();
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(cx + sd * .5, nk[1] - .08); ctx.lineTo(cx + sd * .06, nk[1] + .95); ctx.lineTo(cx + sd * .62, nk[1] + .68); ctx.closePath(); ctx.fillStyle = c2lt(P.top, .35); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 1.3; ctx.stroke(); });
    ctx.fillStyle = P.trim; [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(cx, nk[1] + 1.2 + i * .3, .05, 0, TAU); ctx.fill(); });
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx + .15, nk[1] + 1.0, .36, .3, .05) : ctx.rect(cx + .15, nk[1] + 1.0, .36, .3); ctx.fillStyle = P.topSh; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol; ctx.stroke(); // crachá
    ctx.fillStyle = P.trim; ctx.fillRect(cx + .19, nk[1] + 1.05, .28, .06);
    ctx.strokeStyle = rgba(ink, .6); ctx.lineWidth = Q.ol; ctx.beginPath(); ctx.moveTo(-hw * .78, hy - .7); ctx.lineTo(-hw * .3, hy - .7); ctx.lineTo(-hw * .3, hy - .15); ctx.stroke(); // bolso
  } else if (kind === 'vest') {
    tp(); ctx.save(); ctx.clip(); const vc = cfg.vest || '#8a6a3a'; ctx.fillStyle = vc;
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(cx + sd * .55, nk[1]); ctx.lineTo(cx + sd * .08, nk[1] + 1.3); ctx.lineTo(cx + sd * 1.2, hy + .3); ctx.lineTo(cx + sd * 1.2, nk[1] - .2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = c2ink(P, vc, .55); ctx.lineWidth = Q.ol * 1.4; ctx.stroke(); });
    ctx.fillStyle = c2dk(vc, .3); [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(cx, nk[1] + 1.3 + i * .27, .045, 0, TAU); ctx.fill(); }); ctx.restore();
  } else if (kind === 'tee' || kind === 'dress') {
    // gola
    ctx.strokeStyle = cfg.trimC || P.trim; ctx.lineWidth = .1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - .36, nk[1] + .02); ctx.quadraticCurveTo(cx, nk[1] + (cfg.deco && cfg.deco.includes('jersey') ? .7 : .38), cx + .36, nk[1] + .02); ctx.stroke();
    if (cfg.deco && cfg.deco.includes('star')) { ctx.fillStyle = P.acc; c2star5(ctx, cx, hy - .62, .3, .13); ctx.fill(); ctx.strokeStyle = c2ink(P, P.acc); ctx.lineWidth = Q.ol * 1.2; ctx.lineJoin = 'round'; ctx.stroke(); }
    if (cfg.deco && cfg.deco.includes('jersey')) { ctx.save(); tp(); ctx.clip(); ctx.fillStyle = cfg.trimC; ctx.fillRect(-hw - .2, hy - .3, hw * 2 + .4, .12); ctx.fillStyle = rgba(cfg.trimC, .9); ctx.fillRect(hw - .12, sL[1], .12, 3); ctx.fillRect(-hw, sL[1], .12, 3); ctx.restore(); }
    if (kind === 'dress') { ctx.strokeStyle = rgba(P.top2 || '#fff', .8); ctx.lineWidth = .04; ctx.beginPath(); ctx.moveTo(cx - hw * .7, hy - .5); ctx.lineTo(cx + hw * .7, hy - .5); ctx.stroke(); ctx.fillStyle = P.trim; ctx.fillRect(-hw, hy - .32, hw * 2, .22); }
  } else if (kind === 'cloak') {
    ctx.save(); tp(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(-3, -3, 6, 6); ctx.restore();
  }
  // ---- traje de garota mágica (sobre o moletom) ----
  if (hero && m > .02) {
    ctx.save(); ctx.globalAlpha = clamp(m * 1.8); tp(); ctx.clip();
    ctx.fillStyle = P.topSh; ctx.fillRect(-hw - .3, sL[1], hw * 2 + .6, 4); ctx.globalAlpha = 1;
    ctx.restore();
    tp(); ctx.fillStyle = topC; ctx.fill(); c2shadePath(ctx, Q, tp, P.topSh, .3);
    // gola marinheira
    ctx.save(); ctx.translate(cx, nk[1] + .06); ctx.scale(m, m);
    const col = '#ffb0d6'; ctx.beginPath(); ctx.moveTo(-.78, -.04); ctx.quadraticCurveTo(-.5, -.28, 0, -.2); ctx.quadraticCurveTo(.5, -.28, .78, -.04); ctx.lineTo(.62, .55); ctx.lineTo(0, .96); ctx.lineTo(-.62, .55); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#d78ab8'; ctx.lineWidth = Q.ol * 1.8; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = .06; ctx.beginPath(); ctx.moveTo(-.64, .06); ctx.lineTo(-.5, .5); ctx.lineTo(0, .84); ctx.lineTo(.5, .5); ctx.lineTo(.64, .06); ctx.stroke(); ctx.restore();
    // faixa na cintura
    ctx.save(); ctx.globalAlpha = clamp(m * 1.5); tp(); ctx.clip(); ctx.fillStyle = P.bow; ctx.fillRect(-hw - .1, hy - .5, hw * 2 + .2, .34); ctx.fillStyle = rgba('#fff', .5); ctx.fillRect(-hw - .1, hy - .46, hw * 2 + .2, .05); ctx.strokeStyle = c2dk(P.bow, .4); ctx.lineWidth = Q.ol * 1.2; ctx.strokeRect(-hw - .1, hy - .5, hw * 2 + .2, .34); ctx.restore();
  }
  // ---- abertura do moletom + cicatriz ----
  const sc = clamp(o.scar || 0), ov = clamp(o.open != null ? o.open : sc * 3);
  if (ov > .02 || (sc > 0)) {
    const w = .5 * ov + .14, tipY = nk[1] + .25 + 1.15 * ov; ctx.save();
    ctx.beginPath(); ctx.moveTo(cx - w, nk[1] + .0); ctx.lineTo(cx + w, nk[1] + .0); ctx.quadraticCurveTo(cx + w * .6, tipY * .75 + nk[1] * .25, cx, tipY); ctx.quadraticCurveTo(cx - w * .6, tipY * .75 + nk[1] * .25, cx - w, nk[1] + .0); ctx.closePath();
    ctx.fillStyle = P.skin; ctx.fill(); ctx.clip(); ctx.fillStyle = rgba(P.skinSh, .9); ctx.beginPath(); ctx.ellipse(cx + Q.sx * .3, nk[1] + .05, w * 1.2, .26, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = c2ink(P, P.top, .6); ctx.lineWidth = Q.ol * 1.6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(cx - w, nk[1] + .0); ctx.quadraticCurveTo(cx - w * .6, tipY * .75 + nk[1] * .25, cx, tipY); ctx.quadraticCurveTo(cx + w * .6, tipY * .75 + nk[1] * .25, cx + w, nk[1] + .0); ctx.stroke();
    ctx.strokeStyle = P.trim; ctx.lineWidth = .06; ctx.beginPath(); ctx.moveTo(cx - w - .02, nk[1] + .02); ctx.quadraticCurveTo(cx - w * .6 - .02, tipY * .75 + nk[1] * .25, cx - .02, tipY + .02); ctx.stroke();
  }
  if (sc > 0) c2scar(ctx, cx + .02, nk[1] + .86, .72, sc, t, Q);
}
/* cicatriz dourada (kintsugi) — centro (cx,cy), comprimento len em unidades locais; glow 0..1 */
function c2scar(ctx, cx, cy, len, glow, t, Q) {
  const pts = [], n = 6; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([cx + (u - .5) * len * .38 + (i % 2 ? .018 : -.018) * len * (i === 0 || i === n ? 0 : 1), cy + (u - .5) * len]); }
  const pul = .8 + .2 * Math.sin(t * 4.5), g = clamp(glow) * pul;
  const path = () => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(90,30,20,.45)'; ctx.lineWidth = len * .19; path(); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cx, cy, 0, len * 1.5, [[0, `rgba(255,215,120,${.4 * g})`], [.35, `rgba(255,190,80,${.14 * g})`], [1, 'rgba(255,170,60,0)']]); ctx.beginPath(); ctx.arc(cx, cy, len * 1.5, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = lg(ctx, cx, cy - len / 2, cx, cy + len / 2, [[0, '#fff0b0'], [.5, '#ffc94a'], [1, '#e0951a']]); ctx.lineWidth = len * .115; path(); ctx.stroke();
  ctx.strokeStyle = `rgba(255,252,225,${.5 + .5 * g})`; ctx.lineWidth = len * .035; path(); ctx.stroke();
  if (g > .5) { ctx.globalCompositeOperation = 'lighter'; sparkle(ctx, pts[0][0], pts[0][1], len * .2 * g, t, '#fff6c8'); sparkle(ctx, pts[n][0], pts[n][1], len * .14 * g, -t, '#ffe6a0'); }
  ctx.restore();
}
/* para cenas: cicatriz solta em px (x,y centro; len px) */
function drawScar(ctx, x, y, len, glow = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(len, len); c2scar(ctx, 0, 0, 1, glow, t, c2Q(ctx, {})); ctx.restore(); }

/* varinha-bússola (estrela de 8 pontas). h = mão (coords locais) */
function c2wand(ctx, Q, P, h, wd, m, t, o) {
  const wa = rad(o.wandAng == null ? 22 : o.wandAng), dx = Math.sin(wa), dy = -Math.cos(wa), L = 2.9 * E.io2(clamp(wd * 1.4)), R = .86 * clamp(wd * 1.3);
  const tx = h[0] + dx * L, ty = h[1] + dy * L, bx = h[0] - dx * .85, by = h[1] - dy * .85;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#a8761a'; ctx.lineWidth = .26 + Q.ol * 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.strokeStyle = lg(ctx, bx, by, tx, ty, [[0, '#ffe08a'], [.5, '#ffc94a'], [1, '#fff0b0']]); ctx.lineWidth = .17; ctx.stroke();
  ctx.strokeStyle = '#ff8fc8'; ctx.lineWidth = .14; ctx.beginPath(); ctx.moveTo(bx + dx * .1, by + dy * .1); ctx.lineTo(bx + dx * .5, by + dy * .5); ctx.stroke();
  // fitinha amarrada
  const wv = Math.sin(t * 5) * .1; ctx.strokeStyle = '#ff7ab8'; ctx.lineWidth = .08; const rx = tx - dx * .45, ry = ty - dy * .45;
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + .3, ry + .45 + wv, rx + .55 + wv, ry + .9); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx - .25, ry + .5, rx - .4 - wv, ry + .85); ctx.stroke();
  // brilho
  const pul = 1 + Math.sin(t * 8) * .07;
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, tx, ty, 0, R * 3.4 * pul, [[0, 'rgba(255,240,200,.65)'], [.3, 'rgba(255,190,230,.28)'], [1, 'rgba(255,170,220,0)']]); ctx.beginPath(); ctx.arc(tx, ty, R * 3.4 * pul, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .05; ctx.beginPath(); ctx.arc(tx, ty, R * .98, 0, TAU); ctx.stroke(); ctx.lineWidth = .025; ctx.beginPath(); ctx.arc(tx, ty, R * 1.1, 0, TAU); ctx.stroke();
  compassStar(ctx, tx, ty, R, o.wandSpin != null ? o.wandSpin : Math.sin(t * 2) * .12, '#fff2a0', '#ffc02e', '#9a5b10', Q.ol * 1.4);
  ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.3, rr = R * (1.6 + .5 * Math.sin(t * 5 + i * 2)); sparkle(ctx, tx + Math.cos(a) * rr, ty + Math.sin(a) * rr, R * (.28 + .2 * Math.sin(t * 7 + i)), a, i % 2 ? '#fff6c8' : '#ffc2ea'); }
  ctx.restore();
}

/* ---------------- personagem ---------------- */
function drawCharFull(ctx, x, y, s, pose, o = {}) {
  const cfg = c2cfg(o), f = o.flip ? -1 : 1, t = o.t || 0, m = cfg.mag ? clamp(o.magical || 0) : 0, hero = cfg === C2W.hero;
  pose = Object.assign({}, POSE.stand, pose);
  const P = Object.assign({}, c2pal(cfg, o, m)); Object.assign(P, c2eyeExtras(cfg, m, o, P));
  const k = skeleton(pose), seed = P._seed || 0;
  // respiração e balanço da cabeça
  const br = Math.sin(t * 2.3 + seed) * .028 + (pose.bounce ? -pose.bounce * .06 : 0);
  [k.neck, k.head, k.shL, k.shR, k.chest, k.aL[0], k.aR[0]].forEach(p => { p[1] -= br; });
  k.ha += rad(Math.sin(t * 1.15 + seed) * 1.1);
  const sc = cfg.sc * (o.scale || 1), hkS = cfg.hkS || 1, wv = o.wind == null ? 1 : o.wind;
  const lift = (pose.air || 0) * 2 + (pose.lift || 0);
  const spinC = o.spin != null ? Math.cos(o.spin) : 1;
  ctx.save(); ctx.translate(x, y); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.scale(s * f * sc, s * sc);
  if (o.spin != null) ctx.scale(Math.max(.08, Math.abs(spinC)), 1);
  const Q = c2Q(ctx, o, f); if (cfg.flat) Q.rimA = Math.max(Q.rimA, .85);
  const Qh = Object.assign({}, Q, { ol: Q.ol / hkS });
  // sombra de contato (suave)
  if (o.shadow !== false) {
    const sa = (o.shadowA == null ? .34 : o.shadowA) * (1 - clamp(lift / 3) * .6), sx = (pose.dx || 0) + (lift > .3 ? 0 : 0);
    ctx.save(); ctx.translate(sx, 0); ctx.scale(1, .2); ctx.fillStyle = rg(ctx, 0, 0, 0, 2.7, [[0, `rgba(10,6,24,${sa})`], [.55, `rgba(10,6,24,${sa * .55})`], [1, 'rgba(10,6,24,0)']]); ctx.beginPath(); ctx.arc(0, 0, 2.7, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.translate(pose.dx || 0, (pose.hipAnchor ? .1 : -k.foot) - lift + (o.sink || 0));
  if (o.squash) { ctx.translate(0, k.foot); ctx.scale(1 + o.squash * .5, 1 - o.squash); ctx.translate(0, -k.foot); }
  if (o.rot) ctx.rotate(o.rot);
  // sombra sob os pés (mais escura)
  if (o.shadow !== false && lift < 1.2) { ctx.save(); ctx.fillStyle = 'rgba(10,6,24,.22)'; [k.lL, k.lR].forEach(l => { ctx.beginPath(); ctx.ellipse(l[2][0] + .08, k.foot + lift - .02, .55, .1, 0, 0, TAU); ctx.fill(); }); ctx.restore(); }
  const Env = { hw: Math.max(.5, (pose.hs == null ? .5 : pose.hs) * C2K + .32) * (cfg.bw || 1), hy: .16 + (cfg.top_ === 'coat' ? cfg.tl || 0 : 0), wv };
  const ink = c2ink(P, P.top, .56), headTf = () => { ctx.translate(k.head[0], k.head[1]); ctx.rotate(k.ha); ctx.scale(hkS, hkS); };
  // fitas esvoaçantes (traseiras)
  if (hero && m > .03) { ctx.save(); ctx.globalAlpha = clamp(m * 3);
    const wy = Env.hy - .35; c2ribbon(ctx, Q, -Env.hw * .6, wy, -1, 2.4 * m, .3, '#ffb3da', '#c9a8ff', 0, t, wv, '#d78ab8'); c2ribbon(ctx, Q, Env.hw * .6, wy, 1, 2.2 * m, .3, '#c9a8ff', '#ffb3da', 1.7, t, wv, '#d78ab8'); ctx.restore(); }
  // cabelo (camada de trás: pufes, chiquinhas, capuz)
  ctx.save(); headTf(); c2head(ctx, Qh, P, cfg, o, t, m, o.hair, 'back'); ctx.restore();
  // pernas
  const isPants = cfg.bot_ === 'pants', sockM = hero ? clamp(m * 1.5) : 0;
  [k.lL, k.lR].forEach((l, li) => {
    const sd = li ? 1 : -1, ph = li * 2;
    const fill = isPants ? P.bot : (sockM > 0 ? mix(P.skin, '#fff6fb', sockM) : P.skin), sh = isPants ? P.botSh : (sockM > 0 ? mix(P.skinSh, '#f1d6e8', sockM) : P.skinSh);
    c2shoe(ctx, Q, P, cfg, l, sd, m, t, ph);
    c2limb(ctx, Q, [l[0], l[1], l[2]], [.34, .26, .2], fill, sh, c2ink(P, fill, .56));
    if (sockM > .05) { ctx.save(); ctx.globalAlpha = sockM; ctx.strokeStyle = '#ff8fc8'; ctx.lineWidth = .08; ctx.lineCap = 'butt'; [.3, .5, .7].forEach(u => { const px = lerp(l[1][0], l[2][0], u), py = lerp(l[1][1], l[2][1], u); ctx.beginPath(); ctx.moveTo(px - .27, py); ctx.lineTo(px + .27, py); ctx.stroke(); }); ctx.restore(); }
    if (hero && li === 0 && m < .6) { // curativo no joelho
      ctx.save(); ctx.globalAlpha = 1 - clamp(m * 1.7); ctx.translate(l[1][0] + .02, l[1][1] - .03); ctx.rotate(-.2); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-.2, -.13, .4, .26, .06) : ctx.rect(-.2, -.13, .4, .26);
      ctx.fillStyle = '#f6dcc0'; ctx.fill(); ctx.strokeStyle = '#a8785a'; ctx.lineWidth = Q.ol * 1.2; ctx.stroke(); ctx.fillStyle = '#e7bf9a'; ctx.fillRect(-.07, -.12, .14, .24); ctx.restore(); }
    if (cfg.bot_ === 'shorts') { // bermuda/shorts
      const e1 = c2legPt(l, .8), cuffC = P.bot;
      c2limb(ctx, Q, [l[0], e1], [.42, .38], cuffC, P.botSh, c2ink(P, cuffC, .55));
      const e0 = c2legPt(l, .66); ctx.save(); ctx.strokeStyle = rgba(P.botSh, .9); ctx.lineWidth = Q.ol * 1.2; ctx.beginPath(); ctx.moveTo(e0[0] - .36, e0[1]); ctx.lineTo(e0[0] + .36, e0[1]); ctx.stroke(); ctx.restore();
      if (hero) { ctx.save(); ctx.globalAlpha = 1 - clamp(m * 1.3); ctx.strokeStyle = rgba('#c8dcff', .55); ctx.lineWidth = .025; ctx.setLineDash([.06, .05]); ctx.beginPath(); ctx.moveTo(l[0][0] - sd * .1, l[0][1] + .2); ctx.lineTo(l[0][0] - sd * .1 + (e1[0] - l[0][0]) * .6, l[0][1] + .2 + (e1[1] - l[0][1]) * .6); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    }
  });
  // quadril
  { const hw = Env.hw; ctx.beginPath(); ctx.ellipse(0, .14, hw + .04, .36, 0, 0, TAU); ctx.fillStyle = cfg.top_ === 'cloak' ? P.bot : P.bot; ctx.fill(); ctx.strokeStyle = c2ink(P, P.bot, .55); ctx.lineWidth = Q.ol * 2; ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, .14, hw + .04, .36, 0, 0, TAU); ctx.fill(); }
  // saia(s)
  if (cfg.bot_ === 'skirt') c2skirt(ctx, Q, P, k, Env.hw, cfg.hf || 1.5, .38, 0, P.bot, P.botSh, c2lt(P.bot, .3), c2ink(P, P.bot, .55), t, wv, seed, Env.hy);
  if (hero && m > .03) {
    const mm = E.io2(m); ctx.save(); ctx.globalAlpha = clamp(m * 3.5);
    c2skirt(ctx, Q, P, k, Env.hw, .5 + .55 * mm, .75 * mm, 7, '#ffb3da', '#f08cc0', null, '#d78ab8', t, wv, 0.5, Env.hy);
    c2skirt(ctx, Q, P, k, Env.hw, .5 + .38 * mm, .52 * mm, 6, '#fff7fb', '#f1d6e8', '#ffd23f', '#d78ab8', t, wv, 1.2, Env.hy);
    c2skirt(ctx, Q, P, k, Env.hw, .5 + .2 * mm, .3 * mm, 5, '#d8c4ff', '#b49cf0', null, '#9a82d8', t, wv, 2.1, Env.hy);
    ctx.restore(); }
  // braço de trás
  const wd = clamp(o.wand || 0);
  if (!pose.frontL) c2arm(ctx, Q, P, cfg, k, -1, pose, m, t, o, false);
  if (!pose.frontR) c2arm(ctx, Q, P, cfg, k, 1, pose, m, t, o, wd > .01);
  // bolsa (mãe): alça em diagonal e bolsa no quadril
  if (cfg.bag) { const bx = -Env.hw - .15, by = Env.hy + .1; ctx.save(); ctx.strokeStyle = c2dk('#c0566a', .5); ctx.lineWidth = .22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(k.shR[0] - .1, k.shR[1] - .08); ctx.lineTo(bx + .1, by - .35); ctx.stroke(); ctx.strokeStyle = '#c0566a'; ctx.lineWidth = .14; ctx.stroke(); ctx.restore();
    c2group(ctx, Q, [{ t: 'poly', p: [[bx - .5, by - .35], [bx + .52, by - .35], [bx + .6, by + .7], [bx - .6, by + .7]] }], '#d96a7e', '#a8465a', c2dk('#d96a7e', .5, '#3a1020'), { off: .12 });
    ctx.fillStyle = '#e88a9a'; ctx.beginPath(); ctx.moveTo(bx - .5, by - .35); ctx.lineTo(bx + .52, by - .35); ctx.lineTo(bx + .5, by + .12); ctx.quadraticCurveTo(bx, by + .3, bx - .52, by + .12); ctx.closePath(); ctx.fill(); ctx.strokeStyle = c2dk('#d96a7e', .5, '#3a1020'); ctx.lineWidth = Q.ol * 1.4; ctx.stroke(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(bx, by + .22, .07, 0, TAU); ctx.fill(); ctx.stroke(); }
  // pescoço + tronco
  ctx.beginPath(); ctx.arc(k.neck[0], k.neck[1] - .1, .3, 0, TAU); ctx.fillStyle = P.skin; ctx.fill();
  c2torso(ctx, Q, P, cfg, k, pose, m, t, o, Env);
  // sombra do queixo sobre o corpo
  { ctx.save(); ctx.translate(k.head[0], k.head[1]); ctx.rotate(k.ha); ctx.scale(hkS, hkS); ctx.beginPath(); ctx.ellipse(.04, 1.02, .66, .32, 0, 0, TAU); ctx.fillStyle = rgba(c2dk(P.topSh, .45, '#000'), .38); ctx.fill(); ctx.restore(); }
  // laço grande (mágico)
  if (hero && m > .03) { ctx.save(); ctx.translate(k.neck[0] * .9, k.neck[1] + 1.0); ctx.scale(m, m); ctx.rotate(Math.sin(t * 2) * .03);
    const bc = P.bow, bi = c2dk(bc, .45, '#4a0a30');
    [-1, 1].forEach(q => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(q * .3, -.5, q * .9, -.55, q * 1.05, -.1); ctx.bezierCurveTo(q * 1.1, .3, q * .8, .55, q * .3, .3); ctx.closePath(); ctx.fillStyle = bc; ctx.fill(); ctx.strokeStyle = bi; ctx.lineWidth = Q.ol * 1.6; ctx.stroke(); ctx.fillStyle = rgba('#fff', .45); ctx.beginPath(); ctx.ellipse(q * .6, -.2, .22, .08, q * -.4, 0, TAU); ctx.fill(); });
    ctx.fillStyle = bc; [[-.12, .15, -.5, 1.0], [.12, .15, .5, 1.0]].forEach(r => { ctx.beginPath(); ctx.moveTo(r[0], r[1]); ctx.lineTo(r[2] - .1, r[3]); ctx.lineTo(r[2] + .12, r[3] - .1); ctx.lineTo(r[0] + .12, r[1]); ctx.closePath(); ctx.fill(); ctx.strokeStyle = bi; ctx.stroke(); });
    ctx.beginPath(); ctx.arc(0, 0, .28, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-.07, -.08, .07, 0, TAU); ctx.fill(); ctx.restore(); }
  // pingente-estrela
  const pend = hero ? (o.pendant == null ? 1 : o.pendant) : 0;
  if (pend > .01 && m < .98) { const cx = k.neck[0] * .88, cy = k.neck[1] + ((o.scar || 0) > 0 ? .42 : .55); ctx.save(); ctx.globalAlpha = pend * (1 - m);
    ctx.strokeStyle = '#d9a030'; ctx.lineWidth = .045; ctx.beginPath(); ctx.moveTo(cx - .36, k.neck[1] + .05); ctx.quadraticCurveTo(cx, cy + .1, cx + .36, k.neck[1] + .05); ctx.stroke();
    if (o.pendantGlow) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cx, cy + .12, 0, .9, [[0, `rgba(255,214,120,${.6 * o.pendantGlow})`], [1, 'rgba(255,214,120,0)']]); ctx.beginPath(); ctx.arc(cx, cy + .12, .9, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    compassStar(ctx, cx, cy + .14, .24, Math.sin(t * 1.4) * .08, '#fff2a0', '#ffbf2e', '#8a5410', Q.ol * 1.2, { gem: '#ffe9a8' }); ctx.restore(); }
  // braços da frente
  if (pose.frontL) c2arm(ctx, Q, P, cfg, k, -1, pose, m, t, o, false);
  if (pose.frontR) c2arm(ctx, Q, P, cfg, k, 1, pose, m, t, o, wd > .01);
  // varinha + mão por cima da haste
  if (wd > .01) { const h = k.aR[2]; c2wand(ctx, Q, P, h, wd, m, t, o); c2hand(ctx, Q, P, h, Math.atan2(h[1] - k.aR[1][1], h[0] - k.aR[1][0]), 1, 'hold'); }
  // cabeça
  ctx.save(); headTf(); c2head(ctx, Qh, P, cfg, o, t, m, o.hair, 'front'); ctx.restore();
  // fumaça do ladrão
  if (cfg.thief) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; for (let i = 0; i < 9; i++) { const u = (i / 9 + t * .25) % 1, xx = Math.sin(i * 2.3) * 1.5 + Math.sin(t * 2 + i) * .3, yy = Env.hy + 1.5 - u * 3.2; ctx.fillStyle = rg(ctx, xx, yy, 0, .3 + u * .6, [[0, `rgba(30,16,50,${.32 * (1 - u)})`], [1, 'rgba(30,16,50,0)']]); ctx.beginPath(); ctx.arc(xx, yy, .3 + u * .6, 0, TAU); ctx.fill(); } ctx.restore(); }
  // brilhos
  const I = clamp(m * 1.1) * .55 + Math.max(0, m * (1 - m) * 4) * .9;
  if (hero && I > .03) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const n = Math.round(4 + I * 7), cols = ['#fff6c8', '#ffc2ea', '#d8c4ff', '#ffffff'];
    for (let i = 0; i < n; i++) { const a = t * 1.3 + i * TAU / n + i * .7, rr = 2.4 + (i % 3) * .8 + Math.sin(t * 2 + i) * .35; sparkle(ctx, Math.cos(a) * rr * .85, -1.8 + Math.sin(a) * rr * 1.1, (.14 + .28 * Math.pow(Math.sin(t * 5 + i * 2.1) * .5 + .5, 2)) * Math.min(1, I + .3), a * .5, cols[i % 4]); }
    ctx.restore(); }
  ctx.restore();
  return k;
}


/* ============================================================
   MODO STICK — corpo de palitos coloridos (contorno escuro), cabeça/cabelo/rosto do kit original.
   CHAR_STYLE = 'stick' (padrão) | 'full' (corpo completo). Também por chamada: o.style.
   ============================================================ */
var CHAR_STYLE = 'flat'; // 'flat' (stick sólido, padrão) | 'stick' (palitos com cabeça detalhada) | 'full'
function drawChar(ctx, x, y, s, pose, o = {}) { const st = o.style || CHAR_STYLE; return (st === 'full' ? drawCharFull : st === 'stick' ? drawCharStick : drawCharFlat)(ctx, x, y, s, pose, o); }
function c2lum(c) { const a = hex(c); return (a[0] * .299 + a[1] * .587 + a[2] * .114) / 255; }
function drawCharStick(ctx, x, y, s, pose, o = {}) {
  const cfg = c2cfg(o), f = o.flip ? -1 : 1, t = o.t || 0, m = cfg.mag ? clamp(o.magical || 0) : 0, hero = cfg === C2W.hero;
  pose = Object.assign({}, POSE.stand, pose);
  const P = Object.assign({}, c2pal(cfg, o, m)); Object.assign(P, c2eyeExtras(cfg, m, o, P));
  const k = skeleton(pose), seed = P._seed || 0;
  const br = Math.sin(t * 2.3 + seed) * .028 + (pose.bounce ? -pose.bounce * .06 : 0);
  [k.neck, k.head, k.shL, k.shR, k.chest, k.aL[0], k.aR[0]].forEach(p => { p[1] -= br; });
  k.ha += rad(Math.sin(t * 1.15 + seed) * 1.1);
  const sc = cfg.sc * (o.scale || 1), hkS = cfg.hkS || 1, wv = o.wind == null ? 1 : o.wind, lift = (pose.air || 0) * 2 + (pose.lift || 0), spinC = o.spin != null ? Math.cos(o.spin) : 1;
  ctx.save(); ctx.translate(x, y); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.scale(s * f * sc, s * sc); if (o.spin != null) ctx.scale(Math.max(.08, Math.abs(spinC)), 1);
  const Q = c2Q(ctx, o, f), Qh = Object.assign({}, Q, { ol: Q.ol / hkS }), pxu = Q.pxu;
  if (o.shadow !== false) {
    const sa = (o.shadowA == null ? .34 : o.shadowA) * (1 - clamp(lift / 3) * .6);
    ctx.save(); ctx.translate(pose.dx || 0, 0); ctx.scale(1, .2); ctx.fillStyle = rg(ctx, 0, 0, 0, 2.2, [[0, `rgba(10,6,24,${sa})`], [.55, `rgba(10,6,24,${sa * .55})`], [1, 'rgba(10,6,24,0)']]); ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.translate(pose.dx || 0, (pose.hipAnchor ? .1 : -k.foot) - lift + (o.sink || 0));
  if (o.squash) { ctx.translate(0, k.foot); ctx.scale(1 + o.squash * .5, 1 - o.squash); ctx.translate(0, -k.foot); }
  if (o.rot) ctx.rotate(o.rot);
  const Env = { hw: Math.max(.5, (pose.hs == null ? .5 : pose.hs) * C2K + .32) * (cfg.bw || 1), hy: .16, wv };
  const headTf = () => { ctx.translate(k.head[0], k.head[1]); ctx.rotate(k.ha); ctx.scale(hkS, hkS); };
  const W0 = Math.max(.15, 5.2 / pxu), OL = Math.max(Q.ol * 1.6, 2.2 / pxu); // espessura do palito e do contorno (unidades)
  const inkOf = c => (c2lum(c) < .2 ? '#7a66b8' : c2dk(c, .62, '#120a22'));
  const stk = (pts, w, col, ink) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = ink || inkOf(col); ctx.lineWidth = w + OL * 2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); };
  const dot = (p, r, col) => { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = inkOf(col); ctx.lineWidth = OL * 1.2; ctx.stroke(); };
  const topC = P.top, botC = P.bot, skin = P.skin, shoeC = cfg.shoeK === 'none' ? botC : P.shoe;
  // fitas esvoaçantes (hero mágico)
  if (hero && m > .03) { ctx.save(); ctx.globalAlpha = clamp(m * 3); const wy = Env.hy - .35;
    c2ribbon(ctx, Q, -Env.hw * .6, wy, -1, 2.4 * m, .3, '#ffb3da', '#c9a8ff', 0, t, wv, '#d78ab8'); c2ribbon(ctx, Q, Env.hw * .6, wy, 1, 2.2 * m, .3, '#c9a8ff', '#ffb3da', 1.7, t, wv, '#d78ab8'); ctx.restore(); }
  // cabelo de trás
  ctx.save(); headTf(); c2head(ctx, Qh, P, cfg, o, t, m, o.hair, 'back'); ctx.restore();
  // pernas + pés
  const legCol = hero && m > .5 ? mix(botC, '#fff6fb', .6) : botC;
  [k.lL, k.lR].forEach((l, li) => {
    stk([l[0], l[1], l[2]], W0 * .92, legCol);
    if (cfg.shoeK !== 'none' && !cfg.thief) { const fx = l[2][0], fy = l[2][1] + .02; stk([[fx - .05, fy], [fx + .5, fy + .02]], W0 * 1.05, hero && m > .5 ? '#ff8fc8' : shoeC); }
    if (hero && li === 0 && m < .6) { ctx.save(); ctx.globalAlpha = 1 - clamp(m * 1.7); ctx.translate(l[1][0], l[1][1]); ctx.rotate(-.2); ctx.fillStyle = '#f6dcc0'; ctx.strokeStyle = '#a8785a'; ctx.lineWidth = OL; ctx.fillRect(-.16, -.1, .32, .2); ctx.strokeRect(-.16, -.1, .32, .2); ctx.restore(); } // curativo
  });
  if (Math.abs(k.lR[0][0] - k.lL[0][0]) > .2) stk([k.lL[0], k.lR[0]], W0 * .9, legCol);
  // saia mágica
  if (hero && m > .03) { const mm = E.io2(m); ctx.save(); ctx.globalAlpha = clamp(m * 3.5);
    c2skirt(ctx, Q, P, k, Env.hw, .5 + .55 * mm, .75 * mm, 7, '#ffb3da', '#f08cc0', null, '#d78ab8', t, wv, 0.5, Env.hy);
    c2skirt(ctx, Q, P, k, Env.hw, .5 + .38 * mm, .52 * mm, 6, '#fff7fb', '#f1d6e8', '#ffd23f', '#d78ab8', t, wv, 1.2, Env.hy);
    c2skirt(ctx, Q, P, k, Env.hw, .5 + .2 * mm, .3 * mm, 5, '#d8c4ff', '#b49cf0', null, '#9a82d8', t, wv, 2.1, Env.hy); ctx.restore(); }
  else if (cfg.bot_ === 'skirt') c2skirt(ctx, Q, P, k, Env.hw, cfg.hf || 1.5, .38, 0, P.bot, P.botSh, c2lt(P.bot, .3), c2ink(P, P.bot, .55), t, wv, seed, Env.hy);
  const arm = (a, front) => { const c = hero && m > .5 ? mix(topC, '#fff3f8', .7) : topC; stk([a[0], a[1], a[2]], W0 * .9, c); };
  if (!pose.frontL) arm(k.aL); if (!pose.frontR) arm(k.aR);
  // bolsa da mãe
  if (cfg.bag) { const bx = -Env.hw - .15, by = Env.hy + .1; stk([[k.shR[0] - .1, k.shR[1] - .08], [bx + .1, by - .35]], .08, '#c0566a');
    c2group(ctx, Q, [{ t: 'poly', p: [[bx - .5, by - .35], [bx + .52, by - .35], [bx + .6, by + .7], [bx - .6, by + .7]] }], '#d96a7e', '#a8465a', c2dk('#d96a7e', .5, '#3a1020'), { off: .12 }); }
  // pescoço, tronco (hip→peito→pescoço) e ombros
  const tc = hero && m > .5 ? mix(topC, '#fff3f8', .7) : topC;
  stk([k.neck, k.head], W0 * .7, skin);
  ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(k.chest[0] * 1.05, k.chest[1] * .9, k.neck[0], k.neck[1] + .1);
  ctx.strokeStyle = inkOf(tc); ctx.lineWidth = W0 * 1.15 + OL * 2; ctx.stroke(); ctx.strokeStyle = tc; ctx.lineWidth = W0 * 1.15; ctx.stroke(); ctx.restore();
  stk([k.shL, k.shR], W0 * .9, tc);
  if (cfg.top_ === 'hoodie' && m < .6) { ctx.save(); ctx.globalAlpha = 1 - clamp(m * 1.7); ctx.strokeStyle = c2dk(topC, .35); ctx.lineWidth = W0 * .3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(k.neck[0] - .12, k.neck[1] + .22); ctx.lineTo(k.neck[0] - .1, k.neck[1] + .85); ctx.moveTo(k.neck[0] + .12, k.neck[1] + .22); ctx.lineTo(k.neck[0] + .1, k.neck[1] + .85); ctx.stroke(); ctx.restore(); } // cordinhas do moletom
  // laço grande (mágico)
  if (hero && m > .03) { ctx.save(); ctx.translate(k.neck[0] * .9, k.neck[1] + .95); ctx.scale(m, m); ctx.rotate(Math.sin(t * 2) * .03); const bc = P.bow, bi = c2dk(bc, .45, '#4a0a30');
    [-1, 1].forEach(q => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(q * .3, -.5, q * .9, -.55, q * 1.05, -.1); ctx.bezierCurveTo(q * 1.1, .3, q * .8, .55, q * .3, .3); ctx.closePath(); ctx.fillStyle = bc; ctx.fill(); ctx.strokeStyle = bi; ctx.lineWidth = Q.ol * 1.6; ctx.stroke(); });
    ctx.beginPath(); ctx.arc(0, 0, .26, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.stroke(); ctx.restore(); }
  // cicatriz dourada no peito
  if ((o.scar || 0) > .01) c2scar(ctx, k.chest[0] * .98, k.chest[1] + .02, .95, o.scar, t, Q);
  // pingente-estrela
  const pend = hero ? (o.pendant == null ? 1 : o.pendant) : 0;
  if (pend > .01 && m < .98 && !(o.scar > .5)) { const cx = k.chest[0], cy = k.chest[1] + .05; ctx.save(); ctx.globalAlpha = pend * (1 - m);
    if (o.pendantGlow) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cx, cy, 0, .9, [[0, `rgba(255,214,120,${.6 * o.pendantGlow})`], [1, 'rgba(255,214,120,0)']]); ctx.beginPath(); ctx.arc(cx, cy, .9, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    compassStar(ctx, cx, cy, .24, Math.sin(t * 1.4) * .08, '#fff2a0', '#ffbf2e', '#8a5410', Q.ol * 1.2, { gem: '#ffe9a8' }); ctx.restore(); }
  if (pose.frontL) arm(k.aL); if (pose.frontR) arm(k.aR);
  // mãos (bolinhas)
  const hands = [k.aL[2], k.aR[2]]; const wd = clamp(o.wand || 0);
  hands.forEach((h, i) => { if (i === 1 && wd > .01) return; dot(h, W0 * .62, skin); });
  if (wd > .01) { const h = k.aR[2]; c2wand(ctx, Q, P, h, wd, m, t, o); dot(h, W0 * .62, skin); }
  // cabeça (rosto, cabelo, acessórios)
  ctx.save(); headTf(); c2head(ctx, Qh, P, cfg, o, t, m, o.hair, 'front'); ctx.restore();
  if (cfg.thief) { ctx.save(); for (let i = 0; i < 9; i++) { const u = (i / 9 + t * .25) % 1, xx = Math.sin(i * 2.3) * 1.5 + Math.sin(t * 2 + i) * .3, yy = Env.hy + 1.5 - u * 3.2; ctx.fillStyle = rg(ctx, xx, yy, 0, .3 + u * .6, [[0, `rgba(30,16,50,${.32 * (1 - u)})`], [1, 'rgba(30,16,50,0)']]); ctx.beginPath(); ctx.arc(xx, yy, .3 + u * .6, 0, TAU); ctx.fill(); } ctx.restore(); }
  const I = clamp(m * 1.1) * .55 + Math.max(0, m * (1 - m) * 4) * .9;
  if (hero && I > .03) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const n = Math.round(4 + I * 7), cols = ['#fff6c8', '#ffc2ea', '#d8c4ff', '#ffffff'];
    for (let i = 0; i < n; i++) { const a = t * 1.3 + i * TAU / n + i * .7, rr = 2.4 + (i % 3) * .8 + Math.sin(t * 2 + i) * .35; sparkle(ctx, Math.cos(a) * rr * .85, -1.8 + Math.sin(a) * rr * 1.1, (.14 + .28 * Math.pow(Math.sin(t * 5 + i * 2.1) * .5 + .5, 2)) * Math.min(1, I + .3), a * .5, cols[i % 4]); } ctx.restore(); }
  ctx.restore();
  return k;
}


/* ============================================================
   MODO FLAT — stick figure sólido (referência: animações de stickman)
   palitos grossos de pontas redondas, cabeça lisa + acessórios geométricos, rosto mínimo.
   ============================================================ */
function drawHead(ctx, P, o = {}, hairKind, t = 0) {
  if ((o.style || CHAR_STYLE) !== 'flat') return drawHeadFull(ctx, P, o, hairKind, t);
  if (typeof P === 'string') { o = Object.assign({}, o, { who: P }); P = null; }
  const cfg = c2cfg(o), m = cfg.mag ? clamp(o.magical || 0) : 0, pal = (P && P.skin) ? P : c2pal(cfg, o, m);
  const mf = (P === PAL.hero && m > 0) ? palMix(PAL.hero, PAL.heroMagic, m) : pal, W2 = Object.assign({}, mf, c2eyeExtras(cfg, m, o, mf));
  ctx.save(); if (o.headFlip) ctx.scale(-1, 1); flatHead(ctx, W2, cfg, o, t || o.t || 0, m); ctx.restore();
}
const FL_INK = '#2a1a2e';
function flBlink(t, seed) { return typeof c2blinkOp === 'function' ? c2blinkOp(t, seed) : 1; }
function flFace(ctx, P, f, t, seed, big) {
  const nm = typeof f === 'string' ? f : (f && f.name) || '', F = typeof f === 'object' && f ? f : {};
  const preset = { neutral: ['dot', 'flat'], sleepy: ['line', 'flat'], sad: ['dot', 'frown'], determined: ['dot', 'flat', 'brow'], cry: ['dot', 'frown', 'tear'], grin: ['dot', 'grin'], scared: ['wide', 'open', 'sweat'], love: ['heart', 'smile'], stars: ['star', 'grin'], happy: ['arc', 'smile'], closed: ['line', 'smile'], shock: ['wide', 'open'], sing: ['arc', 'open'], yawn: ['line', 'open'], pout: ['dot', 'frown'], wink: ['dot', 'smile', 'wink'] }[nm] || [F.eye === 'happy' ? 'arc' : F.eye === 'closed' ? 'line' : F.eye === 'stars' ? 'star' : 'dot', F.mouth === 'grin' ? 'grin' : F.mouth === 'open' ? 'open' : F.mouth === 'frown' ? 'frown' : F.mouth === 'flat' ? 'flat' : 'smile'];
  const eye = F.eye && typeof F.eye === 'string' && !nm ? ({ happy: 'arc', closed: 'line', stars: 'star', shock: 'wide', love: 'heart' }[F.eye] || preset[0]) : preset[0], mouth = preset[1], ex = preset[2];
  const lk = F.look || [0, 0], bl = flBlink(t, seed), col = P._faceCol || FL_INK;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.fillStyle = col;
  if (P.blush && (F.cheek !== false)) { ctx.fillStyle = rgba(c2hexish(P.blush), .5); [-1, 1].forEach(sg => { ctx.beginPath(); ctx.arc(sg * .64, .3, .17, 0, TAU); ctx.fill(); }); ctx.fillStyle = col; }
  [-1, 1].forEach((sg, i) => {
    const x = sg * .36 + lk[0] * .1, y = -.02 + lk[1] * .08;
    if (eye === 'dot') { ctx.beginPath(); ctx.ellipse(x, y, .11, .11 * Math.max(.1, bl), 0, 0, TAU); ctx.fill(); }
    else if (eye === 'arc') { ctx.lineWidth = .09; ctx.beginPath(); ctx.arc(x, y + .08, .15, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    else if (eye === 'line') { ctx.lineWidth = .09; ctx.beginPath(); ctx.arc(x, y - .06, .15, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
    else if (eye === 'wide') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, .17, 0, TAU); ctx.fill(); ctx.lineWidth = .05; ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + lk[0] * .05, y, .06, 0, TAU); ctx.fill(); }
    else if (eye === 'star') { ctx.fillStyle = '#ffd23f'; c2star5(ctx, x, y, .2, .09); ctx.fill(); ctx.lineWidth = .04; ctx.stroke(); ctx.fillStyle = col; }
    else if (eye === 'heart') { ctx.fillStyle = '#ff5f9a'; c2heart(ctx, x, y, .17); ctx.fill(); ctx.fillStyle = col; }
    if (ex === 'brow') { ctx.lineWidth = .08; ctx.beginPath(); ctx.moveTo(x - sg * .2, y - .25 + (sg > 0 ? 0 : .0)); ctx.lineTo(x + sg * .16, y - .15 - .08 * -sg * 0); ctx.stroke(); }
    if (ex === 'tear' && eye) { ctx.fillStyle = '#7fd4ff'; ctx.beginPath(); ctx.ellipse(x, y + .3 + (t * 1.2 + i) % 1 * .3, .06, .1, 0, 0, TAU); ctx.fill(); ctx.fillStyle = col; }
  });
  if (ex === 'sweat') { ctx.fillStyle = '#9fe0ff'; ctx.beginPath(); ctx.ellipse(.82, -.4, .07, .12, .3, 0, TAU); ctx.fill(); ctx.fillStyle = col; }
  const my = .43; ctx.lineWidth = .085;
  if (mouth === 'smile') { ctx.beginPath(); ctx.arc(0, my - .14, .2, .12 * Math.PI, .88 * Math.PI); ctx.stroke(); }
  else if (mouth === 'grin') { ctx.beginPath(); ctx.moveTo(-.3, my - .12); ctx.quadraticCurveTo(0, my + .5, .3, my - .12); ctx.closePath(); ctx.fillStyle = '#7a2438'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-.22, my - .11, .44, .09); }
  else if (mouth === 'open') { ctx.beginPath(); ctx.ellipse(0, my, .13, .18, 0, 0, TAU); ctx.fillStyle = '#7a2438'; ctx.fill(); ctx.stroke(); }
  else if (mouth === 'flat') { ctx.beginPath(); ctx.moveTo(-.16, my); ctx.lineTo(.16, my); ctx.stroke(); }
  else if (mouth === 'frown') { ctx.beginPath(); ctx.arc(0, my + .2, .18, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
  ctx.restore();
}
function c2hexish(c) { return c; }
/* cabeça (raio 1, centro na origem) com acessórios de identidade */
function flatHead(ctx, P, cfg, o, t, m) {
  const hair = P.hair, skin = P.skin, hero = cfg === C2W.hero, who = o.who || (o.pal && o.pal._who) || 'hero', seed = P._seed || 0, hk = cfg.hk, ink = 'rgba(20,10,30,.42)';
  const OLW = Math.max(.035, 1.8 / Math.max(1, c2Q(ctx, o).pxu));
  const circ = (x, y, r, col, lw) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = lw || OLW; ctx.stroke(); };
  const mag = hero && m > .02;
  // atrás: volume de cabelo
  if (mag) { ctx.save(); ctx.globalAlpha = clamp(m * 2.5); [-1, 1].forEach((sg, i) => { const sw = Math.sin(t * 2.2 + i * 1.6) * .22 * (o.wind == null ? 1 : o.wind); ctx.beginPath(); ctx.moveTo(sg * .6, -.7); ctx.bezierCurveTo(sg * 1.9, -.9 + sw, sg * 2.5, .7, sg * 1.7 + sw * 1.4, 2.1); ctx.bezierCurveTo(sg * 1.3, .9, sg * 1.1, -.2, sg * .6, -.2); ctx.closePath(); ctx.fillStyle = lg(ctx, 0, -1, 0, 2, [[0, '#ff8fcb'], [1, '#c3a2ff']]); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = OLW; ctx.stroke(); }); ctx.restore(); }
  if (hero && m < .98) { ctx.save(); ctx.globalAlpha = 1 - clamp(m * 2.5); [-1, 1].forEach(sg => circ(sg * .82, -.8, .64, hair)); ctx.restore(); }
  if (!hero) { if (hk === 'afro') circ(0, -.2, 1.55, hair); else if (hk === 'curly' || hk === 'wisp') circ(0, -.15, 1.32, hair); else if (hk === 'sides') { circ(-.92, .05, .4, hair); circ(.92, .05, .4, hair); } }
  // cabeça
  if (who === 'ladrao') { ctx.beginPath(); ctx.moveTo(-1.1, .5); ctx.quadraticCurveTo(-1.25, -1.1, 0, -1.9); ctx.quadraticCurveTo(1.25, -1.1, 1.1, .5); ctx.quadraticCurveTo(0, 1.35, -1.1, .5); ctx.fillStyle = '#0d0914'; ctx.fill(); ctx.strokeStyle = '#7a66b8'; ctx.lineWidth = OLW * 1.4; ctx.stroke();
    ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.ellipse(0, .05, .78, .6, 0, 0, TAU); ctx.fill(); const ec = P.eyeCol || '#ffe14a'; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = ec; [-1, 1].forEach(sg => { ctx.beginPath(); ctx.ellipse(sg * .3, .02, .17, .07, sg * -.25, 0, TAU); ctx.fill(); }); ctx.fillStyle = rg(ctx, 0, 0, 0, 1.3, [[0, rgba(ec, .25)], [1, rgba(ec, 0)]]); ctx.beginPath(); ctx.arc(0, 0, 1.3, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; return; }
  if (who === 'pai') { circ(0, 0, 1, '#1b1827'); ctx.fillStyle = '#1b1827'; return; }
  circ(0, 0, 1, skin);
  // cabelo da frente (calota no topo da cabeça)
  const cap = (col, h) => { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, -1.0 - (.5 - h) * 1.2, 1.35, .95 + h * .9, 0, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 1, Math.PI * 1.08, Math.PI * 1.92); ctx.strokeStyle = ink; ctx.lineWidth = OLW; ctx.stroke(); };
  if (mag) { ctx.save(); ctx.globalAlpha = clamp(m * 2.5); cap('#ff8fcb', .45); ctx.restore(); }
  if (hero) { ctx.save(); ctx.globalAlpha = 1 - clamp(m * 2.5); cap(hair, .3); [-1, 1].forEach(sg => { ctx.beginPath(); ctx.arc(sg * .6, -.72, .2, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = 'rgba(120,70,0,.5)'; ctx.lineWidth = OLW; ctx.stroke(); }); ctx.restore();
    if (mag) { ctx.save(); ctx.globalAlpha = clamp(m * 2.5); ctx.fillStyle = '#ffd23f'; c2star5(ctx, 0, -.98, .3, .13); ctx.fill(); ctx.strokeStyle = 'rgba(150,90,0,.6)'; ctx.stroke(); [-1, 1].forEach(sg => { ctx.fillStyle = '#ff5fa8'; ctx.beginPath(); ctx.moveTo(sg * .86, -.55); ctx.lineTo(sg * 1.3, -.9); ctx.lineTo(sg * 1.3, -.2); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(sg * .86, -.55); ctx.lineTo(sg * .5, -.9); ctx.lineTo(sg * .5, -.2); ctx.closePath(); ctx.fill(); }); ctx.restore(); } }
  else if (hk === 'short' || hk === 'kid' || hk === 'sides' || (hk === 'afro')) { if (cfg.gear !== 'hat') cap(hair, hk === 'afro' ? .15 : .28); }
  else if (hk === 'curly' || hk === 'wisp') { if (cfg.gear !== 'wrap') cap(hair, .2); }
  if (cfg.gear === 'wrap') { const wc = P.wrap || '#f59f00'; ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, -1.05, 1.3, 1.0, 0, 0, TAU); ctx.fillStyle = wc; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(.78, -.78, .26, 0, TAU); ctx.fillStyle = wc; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke(); [[1.1, -1.35, 1.35, -.8], [.62, -1.35, .35, -.9]].forEach(a => { ctx.beginPath(); ctx.moveTo(.78, -.78); ctx.lineTo(a[0], a[1]); ctx.lineTo(a[2], a[3]); ctx.closePath(); ctx.fillStyle = wc; ctx.fill(); ctx.stroke(); }); }
  if (cfg.gear === 'cap') { const cc = P.cap || '#1971c2'; ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, -.95, 1.2, .85, 0, 0, TAU); ctx.fillStyle = cc; ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.ellipse(.62, -.3, .85, .17, .08, 0, TAU); ctx.fillStyle = c2dk(cc, .2, '#000'); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke(); }
  if (cfg.gear === 'hat') { const hc = P.hat || '#d9b66a'; ctx.beginPath(); ctx.ellipse(0, -.55, 1.85, .3, 0, 0, TAU); ctx.fillStyle = hc; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-.95, -.55); ctx.quadraticCurveTo(-.9, -1.55, 0, -1.55); ctx.quadraticCurveTo(.9, -1.55, .95, -.55); ctx.closePath(); ctx.fillStyle = hc; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#8a4a2a'; ctx.fillRect(-.93, -.78, 1.86, .2); }
  if (cfg.deco && cfg.deco.includes('glasses')) { ctx.strokeStyle = '#2a1a2e'; ctx.lineWidth = .06; [-1, 1].forEach(sg => { ctx.beginPath(); ctx.arc(sg * .38, 0, .24, 0, TAU); ctx.stroke(); }); ctx.beginPath(); ctx.moveTo(-.14, 0); ctx.lineTo(.14, 0); ctx.stroke(); }
  if (cfg.deco && (cfg.deco.includes('beard'))) { ctx.beginPath(); ctx.moveTo(-.85, .2); ctx.quadraticCurveTo(0, 1.55, .85, .2); ctx.quadraticCurveTo(0, .55, -.85, .2); ctx.fillStyle = hair; ctx.fill(); }
  if (cfg.deco && cfg.deco.includes('mustache')) { ctx.beginPath(); ctx.ellipse(0, .33, .4, .1, 0, 0, TAU); ctx.fillStyle = '#e8e0d0'; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke(); }
  // rosto mínimo
  if (!cfg.noFace && (FLAT_FACES || o.faceOn)) flFace(ctx, P, o.face || 'neutral', t, seed, true);
}
function drawCharFlat(ctx, x, y, s, pose, o = {}) {
  const cfg = c2cfg(o), f = o.flip ? -1 : 1, t = o.t || 0, m = cfg.mag ? clamp(o.magical || 0) : 0, hero = cfg === C2W.hero;
  pose = Object.assign({}, POSE.stand, pose);
  const P = Object.assign({}, c2pal(cfg, o, m)); Object.assign(P, c2eyeExtras(cfg, m, o, P));
  const k = skeleton(pose), seed = P._seed || 0, who = o.who || (o.pal && o.pal._who) || 'hero';
  const br = Math.sin(t * 2.3 + seed) * .03 + (pose.bounce ? -pose.bounce * .06 : 0);
  [k.neck, k.head, k.shL, k.shR, k.chest, k.aL[0], k.aR[0]].forEach(p => { p[1] -= br; });
  k.ha += rad(Math.sin(t * 1.15 + seed) * 1.1);
  const sc = cfg.sc * (o.scale || 1) * FLAT_SC, hkS = (cfg.hkS || 1) * FLAT_HR, wv = o.wind == null ? 1 : o.wind, lift = (pose.air || 0) * 2 + (pose.lift || 0), spinC = o.spin != null ? Math.cos(o.spin) : 1;
  ctx.save(); ctx.translate(x, y); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.scale(s * f * sc, s * sc); if (o.spin != null) ctx.scale(Math.max(.08, Math.abs(spinC)), 1);
  const Q = c2Q(ctx, o, f), pxu = Q.pxu;
  if (o.shadow !== false) { const sa = (o.shadowA == null ? .34 : o.shadowA) * (1 - clamp(lift / 3) * .6);
    ctx.save(); ctx.translate(pose.dx || 0, 0); ctx.scale(1, .2); ctx.fillStyle = rg(ctx, 0, 0, 0, 2.2, [[0, `rgba(10,6,24,${sa})`], [.55, `rgba(10,6,24,${sa * .55})`], [1, 'rgba(10,6,24,0)']]); ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.translate(pose.dx || 0, (pose.hipAnchor ? .1 : -k.foot) - lift + (o.sink || 0));
  if (o.squash) { ctx.translate(0, k.foot); ctx.scale(1 + o.squash * .5, 1 - o.squash); ctx.translate(0, -k.foot); }
  if (o.rot) ctx.rotate(o.rot);
  const Env = { hw: Math.max(.5, (pose.hs == null ? .5 : pose.hs) * C2K + .32) * (cfg.bw || 1), hy: .16, wv };
  const W0 = Math.max(.4, 6.5 / pxu), W1 = W0 * 1.15, OLn = Math.max(1.2 / pxu, .025);
  const dark = who === 'ladrao' || who === 'pai';
  const stk = (pts, w, col) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const path = () => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };
    path(); ctx.strokeStyle = dark ? '#7a66b8' : 'rgba(14,8,28,.3)'; ctx.lineWidth = w + OLn * 2; ctx.stroke(); path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  const topC = who === 'pai' ? '#1b1827' : who === 'ladrao' ? '#16101f' : P.top, botC = who === 'pai' ? '#1b1827' : who === 'ladrao' ? '#120d1a' : P.bot;
  const mt = hero && m > 0 ? clamp(m * 1.6) : 0, monoBase = hero ? '#ffc93c' : topC, bodyC = mt ? mix(monoBase, '#fff1f8', mt) : monoBase, legC = bodyC, shoeC = bodyC;
  const mm = hero ? E.io2(m) : 0;
  // fitas (mágico)
  if (hero && m > .03) { ctx.save(); ctx.globalAlpha = clamp(m * 3); const wy = Env.hy - .35;
    c2ribbon(ctx, Q, -Env.hw * .6, wy, -1, 2.4 * m, .3, '#ffb3da', '#c9a8ff', 0, t, wv, '#d78ab8'); c2ribbon(ctx, Q, Env.hw * .6, wy, 1, 2.2 * m, .3, '#c9a8ff', '#ffb3da', 1.7, t, wv, '#d78ab8'); ctx.restore(); }
  // pernas e pés
  [k.lL, k.lR].forEach(l => { stk([l[0], l[1], l[2]], W0, legC); });
  if (Math.abs(k.lR[0][0] - k.lL[0][0]) > .2) stk([k.lL[0], k.lR[0]], W0, legC);
  // saia (triângulos achatados)
  if (hero && m > .03) { ctx.save(); ctx.globalAlpha = clamp(m * 3); const sw = Math.sin(t * 3) * .12;
    [['#ffb3da', 1.5, 1.05], ['#fff7fb', 1.25, .78], ['#d8c4ff', 1.0, .56]].forEach(([c, w2, h2], i) => { const ww = w2 * (.5 + .5 * mm), hh = h2 * (.5 + .5 * mm); ctx.beginPath(); ctx.moveTo(-.55, Env.hy - .1); ctx.lineTo(.55, Env.hy - .1); ctx.lineTo(ww + sw * (i + 1) * .3, Env.hy + hh); for (let j = 4; j >= 0; j--) ctx.lineTo(lerp(-ww, ww, j / 4) + sw * (i + 1) * .3, Env.hy + hh + (j % 2 ? .12 : 0)); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = 'rgba(160,80,140,.4)'; ctx.lineWidth = OLn; ctx.stroke(); }); ctx.restore(); }
  else if (cfg.bot_ === 'skirt') { ctx.beginPath(); ctx.moveTo(-.6, Env.hy - .1); ctx.lineTo(.6, Env.hy - .1); ctx.lineTo(1.15, Env.hy + 1.5); ctx.lineTo(-1.15, Env.hy + 1.5); ctx.closePath(); ctx.fillStyle = P.bot; ctx.fill(); ctx.strokeStyle = 'rgba(14,8,28,.3)'; ctx.lineWidth = OLn; ctx.stroke(); }
  const arm = a => stk([a[0], a[1], a[2]], W0, bodyC);
  if (!pose.frontL) arm(k.aL); if (!pose.frontR) arm(k.aR);
  if (cfg.bag) { const bx = -Env.hw - .15, by = Env.hy + .1; stk([[k.shR[0] - .1, k.shR[1] - .08], [bx + .1, by - .35]], .1, '#c0566a'); ctx.beginPath(); ctx.moveTo(bx - .5, by - .35); ctx.lineTo(bx + .52, by - .35); ctx.lineTo(bx + .6, by + .7); ctx.lineTo(bx - .6, by + .7); ctx.closePath(); ctx.fillStyle = '#d96a7e'; ctx.fill(); ctx.strokeStyle = 'rgba(14,8,28,.3)'; ctx.lineWidth = OLn; ctx.stroke(); }
  // tronco + ombros
  ctx.save(); ctx.lineCap = 'round'; const tp = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(k.chest[0] * 1.05, k.chest[1] * .9, k.neck[0], k.neck[1] + .12); };
  tp(); ctx.strokeStyle = dark ? '#7a66b8' : 'rgba(14,8,28,.3)'; ctx.lineWidth = W1 + OLn * 2; ctx.stroke(); tp(); ctx.strokeStyle = bodyC; ctx.lineWidth = W1; ctx.stroke(); ctx.restore();
  stk([k.shL, k.shR], W0, bodyC);
  // laço (triângulos) — mágico
  if (hero && m > .03) { ctx.save(); ctx.translate(k.chest[0] * .98, k.chest[1] - .05); ctx.scale(m, m); ctx.rotate(Math.sin(t * 2) * .04);
    [-1, 1].forEach(q => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(q * .95, -.5); ctx.lineTo(q * .95, .5); ctx.closePath(); ctx.fillStyle = '#ff5fa8'; ctx.fill(); ctx.strokeStyle = 'rgba(120,20,80,.45)'; ctx.lineWidth = OLn; ctx.stroke(); });
    ctx.beginPath(); ctx.arc(0, 0, .24, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.stroke(); ctx.restore(); }
  if ((o.scar || 0) > .01) c2scar(ctx, k.chest[0] * .98, k.chest[1] + .02, 1.0, o.scar, t, Q);
  const pend = hero ? (o.pendant == null ? 1 : o.pendant) : 0;
  if (pend > .01 && m < .98 && !(o.scar > .5)) { const cx = k.chest[0], cy = k.chest[1] + .05; ctx.save(); ctx.globalAlpha = pend * (1 - m);
    if (o.pendantGlow) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cx, cy, 0, .9, [[0, `rgba(255,214,120,${.6 * o.pendantGlow})`], [1, 'rgba(255,214,120,0)']]); ctx.beginPath(); ctx.arc(cx, cy, .9, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    compassStar(ctx, cx, cy, .26, Math.sin(t * 1.4) * .08, '#fff2a0', '#ffbf2e', '#8a5410', Q.ol * 1.2, { gem: '#ffe9a8' }); ctx.restore(); }
  if (pose.frontL) arm(k.aL); if (pose.frontR) arm(k.aR);
  const wd = clamp(o.wand || 0); if (wd > .01) c2wand(ctx, Q, P, k.aR[2], wd, m, t, o);
  // cabeça
  ctx.save(); ctx.translate(k.head[0], k.head[1]); ctx.rotate(k.ha); ctx.scale(hkS, hkS); flatHead(ctx, P, cfg, o, t, m); ctx.restore();
  if (cfg.thief) { ctx.save(); for (let i = 0; i < 9; i++) { const u = (i / 9 + t * .25) % 1, xx = Math.sin(i * 2.3) * 1.5 + Math.sin(t * 2 + i) * .3, yy = Env.hy + 1.5 - u * 3.2; ctx.fillStyle = rg(ctx, xx, yy, 0, .3 + u * .6, [[0, `rgba(30,16,50,${.32 * (1 - u)})`], [1, 'rgba(30,16,50,0)']]); ctx.beginPath(); ctx.arc(xx, yy, .3 + u * .6, 0, TAU); ctx.fill(); } ctx.restore(); }
  const I = clamp(m * 1.1) * .55 + Math.max(0, m * (1 - m) * 4) * .9;
  if (hero && I > .03) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const n = Math.round(4 + I * 7), cols = ['#fff6c8', '#ffc2ea', '#d8c4ff', '#ffffff'];
    for (let i = 0; i < n; i++) { const a = t * 1.3 + i * TAU / n + i * .7, rr = 2.4 + (i % 3) * .8 + Math.sin(t * 2 + i) * .35; sparkle(ctx, Math.cos(a) * rr * .85, -1.8 + Math.sin(a) * rr * 1.1, (.14 + .28 * Math.pow(Math.sin(t * 5 + i * 2.1) * .5 + .5, 2)) * Math.min(1, I + .3), a * .5, cols[i % 4]); } ctx.restore(); }
  ctx.restore();
  return k;
}

/* casaco no gancho (ausência do pai) — (x,y) = ponto do gancho; s = escala em px por unidade (~altura 2.8) */
function coatOnHook(ctx, x, y, s, o = {}) {
  const t = o.t || 0, sw = Math.sin(t * 1.3) * .03 * (o.wind == null ? 1 : o.wind), col = o.col || '#4a4f6a', sh = c2dk(col, .35, '#0a0814'), ink = c2dk(col, .6, '#05030c');
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const Q = c2Q(ctx, o);
  // gancho
  ctx.strokeStyle = '#8a8f9c'; ctx.lineWidth = .1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -.1); ctx.lineTo(0, .12); ctx.arc(0, .28, .16, -Math.PI / 2, Math.PI * .9); ctx.stroke(); ctx.fillStyle = '#5a5f6c'; ctx.beginPath(); ctx.arc(0, -.12, .14, 0, TAU); ctx.fill();
  ctx.translate(sw, 0); ctx.rotate(sw);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(.15, 1.5, .8, 1.5, 0, 0, TAU); ctx.fill();
  const tp = b => { if (b !== false) ctx.beginPath(); ctx.moveTo(-.12, .32); ctx.quadraticCurveTo(-.5, .4, -.7, .62); ctx.bezierCurveTo(-.92, 1.4, -.8, 2.0, -.74, 2.7); ctx.quadraticCurveTo(0, 2.82, .74, 2.7); ctx.bezierCurveTo(.8, 2.0, .92, 1.4, .7, .62); ctx.quadraticCurveTo(.5, .4, .12, .32); ctx.quadraticCurveTo(0, .5, -.12, .32); ctx.closePath(); };
  tp(); ctx.fillStyle = col; ctx.fill(); c2shadePath(ctx, Q, tp, sh, .35); tp(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol * 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); tp(); ctx.clip(); ctx.strokeStyle = rgba(sh, .9); ctx.lineWidth = Q.ol; ctx.beginPath(); ctx.moveTo(0, .55); ctx.lineTo(0, 2.8); ctx.moveTo(-.4, .8); ctx.quadraticCurveTo(-.5, 1.6, -.46, 2.7); ctx.moveTo(.4, .8); ctx.quadraticCurveTo(.5, 1.6, .44, 2.7); ctx.stroke();
  ctx.fillStyle = c2lt(col, .12); ctx.beginPath(); ctx.moveTo(-.12, .32); ctx.lineTo(0, 1.0); ctx.lineTo(.12, .32); ctx.fill(); ctx.restore();
  [0, 1, 2].forEach(i => { ctx.fillStyle = '#c9ced8'; ctx.beginPath(); ctx.arc(.08, .95 + i * .5, .055, 0, TAU); ctx.fill(); });
  ctx.fillStyle = rgba(sh, .9); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-.62, 1.5, .42, .5, .05) : ctx.rect(-.62, 1.5, .42, .5); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Q.ol; ctx.stroke();
  ctx.strokeStyle = rgba(Q.rim, .5); ctx.lineWidth = .08; ctx.beginPath(); ctx.moveTo(.72, .75); ctx.bezierCurveTo(.88, 1.4, .8, 2.0, .74, 2.6); ctx.stroke();
  ctx.restore();
}
