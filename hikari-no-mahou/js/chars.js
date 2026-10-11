'use strict';
/* ============================================================
   chars.js — personagens SIMPLES (traço básico), poses por ângulos
   Convenção: ângulos em graus a partir de "para baixo"; + = para a direita da tela.
   Herói: moleque/moleca de favela (o.magical=0) <-> garota/garoto mágico (o.magical=1), o.wand = varinha.
   ============================================================ */
const PAL = {
  /* herói: moleque/moleca de favela — pele marrom, boné vermelho de aba reta, regata amarela, bermuda jeans, havaiana */
  hero: { skin: '#b97a52', skinSh: '#98603f', hair: '#1e1410', hair2: '#1e1410', sheen: '#4a3326', jacket: '#f2c230', trim: '#1f9d55', stripe: '#d9a30f', pants: '#43639c', pants2: '#34507f', shoe: '#2b6fd6', sole: '#f6f3ea', scarf: '#e5283a', scarf2: '#a8141f', cap: '#e5283a', gold: '#ffd23f', phones: '#2a2a33', chain: 1, ol: '#1a1224', cheek: '#e0806a', iris: '#7b4bd8' },
  /* versão garota/garoto mágico (mahou shoujo) — pele igual */
  heroMagic: { skin: '#b97a52', skinSh: '#98603f', hair: '#ff8fcb', hair2: '#b69cff', sheen: '#ffd6ee', jacket: '#fff1f8', trim: '#ffd23f', stripe: '#ffd6ec', pants: '#fff4fa', pants2: '#ffd9ec', shoe: '#ff8fc8', sole: '#fff4fa', scarf: '#ff7ab8', scarf2: '#c9a8ff', cap: '#ff8fcb', gold: '#ffd23f', phones: '#ffb3da', chain: 1, ol: '#3a1d4a', cheek: '#ff7a9c', iris: '#7b4bd8', skirt1: '#ffb3da', skirt2: '#fff6fb', skirt3: '#ff8fc8', bow: '#ff5fa8', sock: '#fff6fb', sockStripe: '#ff8fc8' },
  thief: { skin: '#2a2a33', hair: '#14141a', sheen: '#2a2a33', jacket: '#1a1a22', trim: '#1a1a22', pants: '#202029', shoe: '#101015', scarf: '#1a1a22', scarf2: '#101015', ol: '#0a0a0f', cheek: '#2a2a33' },
};
function palMix(a, b, t) { if (t <= 0) return a; const o = {}; for (const k in a) o[k] = (k in b && typeof a[k] === 'string' && typeof b[k] === 'string') ? mix(a[k], b[k], t) : a[k]; for (const k in b) if (!(k in o)) o[k] = b[k]; o.cap = a.cap; o.chain = a.chain; return o; }
/* vizinhos da comunidade: cinza (c=0) -> colorido (c=1). P.cap/P.hat/P.wrap = acessórios opcionais; P.hk = cabelo sugerido */
const NEIGH_V = [
  { skin: '#8d5a3b', hair: '#2a1a12', hk: 2, shirt: '#e56b9d', pants: '#5c4a8a', wrap: '#f59f00', strap: '#2f9e44' }, // tia de lenço
  { skin: '#a8704a', hair: '#dcdcdc', hk: 1, shirt: '#ece4d0', pants: '#6b5a46', hat: '#d9b66a', strap: '#2b6fd6' }, // senhor de chapéu
  { skin: '#6b4430', hair: '#14100e', hk: 1, shirt: '#2ec4b6', pants: '#e8590c', cap: '#1971c2', strap: '#ffd23f' }, // moleque de boné azul
  { skin: '#c98e62', hair: '#2b1d14', hk: 2, shirt: '#9b8cff', pants: '#364fc7', strap: '#2b6fd6' }, // moça cacheada
  { skin: '#7a4a30', hair: '#1d1d26', hk: 3, shirt: '#ffd43b', pants: '#2b8a3e', strap: '#2f9e44' }, // tio black power, camisa da seleção
  { skin: '#d9a27a', hair: '#3a2416', hk: 0, shirt: '#f4f1e8', pants: '#d6336c', cap: '#2b8a3e', strap: '#2b6fd6' }, // criança de boné verde
  { skin: '#f1c9a0', hair: '#d8a64a', hk: 0, shirt: '#5ec8ff', pants: '#d6336c', strap: '#ffd23f' }, // loiro de camiseta azul
  { skin: '#a8704a', hair: '#1a120e', hk: 2, shirt: '#e8590c', pants: '#2b6fd6', wrap: '#5ec8ff', strap: '#2f9e44' }, // tia de lenço azul
];
const _gray = c => { const A = hex(c), l = A[0] * .3 + A[1] * .59 + A[2] * .11, v = Math.round(lerp(l, 125, .4)); return `rgb(${v},${v + 2},${v + 7})`; };
function neighPal(i, c) {
  const v = NEIGH_V[((i % NEIGH_V.length) + NEIGH_V.length) % NEIGH_V.length], mc = col => mix(_gray(col), col, c), dk = (col, a) => mix(col, '#000000', a);
  return {
    skin: mc(v.skin), skinSh: mc(dk(v.skin, .18)), hair: mc(v.hair), hair2: mc(v.hair), sheen: mc('#6a5036'), jacket: mc(v.shirt), trim: mc(dk(v.shirt, .25)), pants: mc(v.pants), pants2: mc(dk(v.pants, .2)),
    shoe: mc(v.strap), sole: mix('#8a8d93', '#f4f1e8', c), scarf: mc(v.pants), scarf2: mc(dk(v.pants, .2)), ol: mix('#23262b', '#1a1224', c), cheek: mix('#9b9ea5', '#e0806a', c), hk: v.hk,
    cap: v.cap ? mc(v.cap) : undefined, hat: v.hat ? mc(v.hat) : undefined, wrap: v.wrap ? mc(v.wrap) : undefined,
  };
}

const POSE = {
  stand: { lean: 0, head: 0, spread: .8, hs: .5, aR: [8, 6], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] },
  slump: { lean: 18, head: 26, spread: .8, hs: .5, aR: [10, 4], aL: [-10, -4], lR: [6, 0], lL: [-6, 0] },
  fist: { lean: -4, head: -4, spread: .8, hs: .55, aR: [25, 200], aL: [-25, -200], lR: [10, 0], lL: [-10, 0] },
  Vup: { lean: -3, head: -8, spread: .85, hs: .75, aR: [145, 165], aL: [-145, -165], lR: [20, 2], lL: [-20, -2] },
  point: { lean: -6, head: -10, spread: .85, hs: .7, aR: [168, 176], aL: [-30, 70], lR: [26, -4], lL: [-6, 8] },
  sweep: { lean: 20, head: 14, spread: .8, hs: .7, aR: [95, 80], aL: [-100, -140], lR: [52, -40], lL: [-22, 10] },
  wide: { lean: 0, head: 0, spread: .85, hs: .8, aR: [100, 98], aL: [-100, -98], lR: [24, 4], lL: [-24, -4] },
  hip: { lean: 6, head: 8, spread: .8, hs: .6, aR: [60, -20], aL: [-60, 20], lR: [14, 0], lL: [-20, 8] },
  kick: { lean: -10, head: -6, spread: .85, hs: .5, aR: [150, 130], aL: [-70, -20], lR: [75, 20], lL: [-6, 4] },
  crouch: { lean: 28, head: 20, spread: .8, hs: .7, aR: [60, 30], aL: [-70, -40], lR: [62, -70], lL: [-62, 70] },
  reach: { lean: -12, head: -14, spread: .9, hs: .6, aR: [112, 90], aL: [-30, -10], lR: [14, 0], lL: [-10, 6] },
};
function lerpPose(a, b, t) {
  const o = {};
  for (const k in a) { const A = a[k], B = b[k]; o[k] = Array.isArray(A) ? [lerp(A[0], B[0], t), lerp(A[1], B[1], t)] : lerp(A, B, t); }
  return o;
}
/* anda (vista de lado): ph em radianos */
function walkPose(ph, lean = 4) {
  const A = 30, sA = Math.sin(ph), sB = Math.sin(ph + Math.PI), bendR = Math.max(0, Math.cos(ph)), bendL = Math.max(0, Math.cos(ph + Math.PI));
  return { lean, head: 0, spread: .15, hs: .12, aR: [-sA * 24, -sA * 24 + 18 + sA * 8], aL: [-sB * 24, -sB * 24 + 18 + sB * 8], lR: [sA * A, sA * A - 38 * bendR], lL: [sB * A, sB * A - 38 * bendL], air: Math.abs(Math.cos(ph)) * .14 };
}
/* dança: sequência de poses presas à batida do refrão */
const DANCE_SEQ = ['Vup', 'point', 'sweep', 'wide', 'hip', 'kick', 'Vup', 'crouch'];
function dancePose(t, tOffset = 0) {
  const p = (t + tOffset - 17.35) / (BEAT / 2), i = Math.floor(p), f = p - i, n = DANCE_SEQ.length;
  const a = POSE[DANCE_SEQ[((i % n) + n) % n]], b = POSE[DANCE_SEQ[(((i + 1) % n) + n) % n]];
  const ps = lerpPose(a, b, E.io2(clamp(f * 1.4)));
  ps.air = Math.max(0, Math.sin(f * Math.PI)) * .5; ps.bounce = Math.exp(-f * 4) * .3;
  return ps;
}

function skeleton(p) {
  const T = 2.5, la = rad(p.lean || 0);
  const neck = [Math.sin(la) * T, -Math.cos(la) * T], ha = rad((p.lean || 0) + (p.head || 0));
  const head = [neck[0] + Math.sin(ha) * 1.2, neck[1] - Math.cos(ha) * 1.2];
  const lim = (o, a, b, L1, L2) => { const j = [o[0] + Math.sin(rad(a)) * L1, o[1] + Math.cos(rad(a)) * L1]; return [o, j, [j[0] + Math.sin(rad(b)) * L2, j[1] + Math.cos(rad(b)) * L2]]; };
  const sp = p.spread == null ? .8 : p.spread, hs = p.hs == null ? .5 : p.hs;
  const shR = [neck[0] * .88 + sp, neck[1] * .88 + .1], shL = [neck[0] * .88 - sp, neck[1] * .88 + .1];
  const k = { neck, head, ha, shR, shL,
    aR: lim(shR, p.aR[0], p.aR[1], 1.55, 1.5), aL: lim(shL, p.aL[0], p.aL[1], 1.55, 1.5),
    lR: lim([hs, 0], p.lR[0], p.lR[1], 2, 2), lL: lim([-hs, 0], p.lL[0], p.lL[1], 2, 2) };
  k.foot = Math.max(k.lR[2][1], k.lL[2][1]);
  return k;
}
function strokeLimb(ctx, pts, w, col, ol, olw) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.strokeStyle = ol; ctx.lineWidth = w + olw * 2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
function starPath(ctx, x, y, R, r, rot = -Math.PI / 2) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, q = i % 2 ? r : R; i ? ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.closePath(); }
function drawFace(ctx, P, f = {}, t = 0) {
  const e = f.eye || 'open', m = f.mouth || 'smile', M = clamp(f.m || 0), lx = (f.look ? f.look[0] : 0) * .14, ly = (f.look ? f.look[1] : 0) * .1;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const eyes = [-.4, .4];
  eyes.forEach((ex, i) => {
    const x = ex + lx, y = .08 + ly;
    ctx.fillStyle = P.ol; ctx.strokeStyle = P.ol; ctx.lineWidth = .1;
    if (e === 'open' || e === 'determined') {
      if (M > .02) { // olhão kawaii com brilho de estrela
        ctx.save(); ctx.translate(x, y + .02); ctx.scale(1 + .55 * M, 1 + .6 * M);
        ctx.fillStyle = lg(ctx, 0, -.2, 0, .2, [[0, mix(P.ol, '#2a1458', M)], [.6, mix(P.ol, P.iris || '#7b4bd8', M)], [1, mix(P.ol, '#ff9be0', M)]]);
        ctx.beginPath(); ctx.ellipse(0, 0, .14, .2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(.05, -.08, .06, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-.05, .09, .03, 0, TAU); ctx.fill();
        ctx.globalAlpha = M; ctx.strokeStyle = P.ol; ctx.lineWidth = .05; ctx.beginPath(); ctx.moveTo(i ? .1 : -.1, -.2); ctx.lineTo(i ? .24 : -.24, -.27); ctx.stroke(); ctx.restore();
      } else {
        ctx.beginPath(); ctx.ellipse(x, y, .13, .2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + .045, y - .07, .05, 0, TAU); ctx.fill();
      }
    } else if (e === 'closed') { ctx.beginPath(); ctx.arc(x, y - .06, .15, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
    else if (e === 'happy') { ctx.beginPath(); ctx.arc(x, y + .1, .16, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    else if (e === 'shock') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, .2, 0, TAU); ctx.fill(); ctx.lineWidth = .07; ctx.stroke(); ctx.fillStyle = P.ol; ctx.beginPath(); ctx.arc(x + lx * .5, y, .06, 0, TAU); ctx.fill(); }
    else if (e === 'dot') { ctx.beginPath(); ctx.arc(x, y, .1, 0, TAU); ctx.fill(); }
    else if (e === 'spiral') {
      ctx.lineWidth = .06; ctx.beginPath(); for (let k = 0; k < 40; k++) { const a = k / 40 * TAU * 2.6 + t * 8 * (i ? 1 : -1), r = .02 + k / 40 * .2; k ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke();
    } else if (e === 'squint') { ctx.lineWidth = .09; ctx.beginPath(); ctx.moveTo(x - .14, y - .04 - (i ? 0 : .04)); ctx.lineTo(x + .14, y + .04); ctx.stroke(); }
    if (e === 'determined') { ctx.lineWidth = .11; ctx.beginPath(); ctx.moveTo(x - .2 * (i ? -1 : 1), y - .34); ctx.lineTo(x + .2 * (i ? -1 : 1), y - .22); ctx.stroke(); }
  });
  if (f.cheek !== false && P.cheek) { const ca = .5 + .3 * M; ctx.fillStyle = rgba(P.cheek.startsWith('#') || P.cheek[0] === 'r' ? P.cheek : '#e0806a', ca); ctx.beginPath(); ctx.ellipse(-.68, .4, .14 + .06 * M, .08 + .03 * M, 0, 0, TAU); ctx.ellipse(.68, .4, .14 + .06 * M, .08 + .03 * M, 0, 0, TAU); ctx.fill(); }
  if (P.skinSh) { ctx.strokeStyle = P.skinSh; ctx.lineWidth = .06; ctx.beginPath(); ctx.arc(0, .27, .08, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); } // narizinho
  ctx.strokeStyle = P.ol; ctx.fillStyle = P.ol; ctx.lineWidth = .09;
  const my = .52;
  if (m === 'smile') { ctx.beginPath(); ctx.arc(0, my - .12, .2, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-.3, my - .1); ctx.quadraticCurveTo(0, my + .45, .3, my - .1); ctx.closePath(); ctx.fillStyle = '#7a1f2b'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-.22, my - .1, .44, .1); }
  else if (m === 'open') { ctx.beginPath(); ctx.ellipse(0, my, .14, .2, 0, 0, TAU); ctx.fillStyle = '#7a1f2b'; ctx.fill(); ctx.stroke(); }
  else if (m === 'flat') { ctx.beginPath(); ctx.moveTo(-.16, my); ctx.lineTo(.16, my); ctx.stroke(); }
  else if (m === 'frown') { ctx.beginPath(); ctx.arc(0, my + .16, .2, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
  else if (m === 'wavy') { ctx.beginPath(); ctx.moveTo(-.25, my); for (let k = 1; k <= 8; k++) ctx.lineTo(-.25 + k * .0625, my + (k % 2 ? -.05 : .05)); ctx.stroke(); }
}
/* tufos de cabelo (círculos): traço por baixo, preenchimento por cima => silhueta única com contorno */
function lumps(ctx, arr, fill, ol, lw, sc = 1) {
  ctx.strokeStyle = ol; ctx.lineWidth = lw; arr.forEach(c => { ctx.beginPath(); ctx.arc(c[0], c[1], c[2] * sc, 0, TAU); ctx.stroke(); });
  ctx.fillStyle = fill; arr.forEach(c => { ctx.beginPath(); ctx.arc(c[0], c[1], c[2] * sc, 0, TAU); ctx.fill(); });
}
const HAIR_TOP = [
  [[-.8, -.55, .4], [-.45, -.9, .44], [.02, -1.1, .48], [.5, -.92, .44], [.82, -.55, .4], [0, -.95, .66]], // 0 degradê crespo com topete
  [[-.82, -.45, .32], [-.42, -.82, .36], [.08, -.94, .38], [.54, -.8, .36], [.86, -.42, .3], [0, -.85, .6]], // 1 curto/raspadinho
  [[-.85, -.5, .4], [-.4, -.9, .46], [.1, -1.0, .5], [.6, -.85, .44], [.9, -.4, .38], [0, -.9, .68]], // 2 cacheado longo (+ laterais atrás)
  [[0, -1.0, .8], [-.9, -.62, .52], [.9, -.62, .52], [-.55, -1.3, .52], [.55, -1.3, .52], [0, -1.55, .46]], // 3 black power
];
const HAIR_BACK = [null, null, [[-1.18, .2, .46], [-1.22, .78, .44], [-1.12, 1.3, .38], [1.18, .2, .46], [1.22, .78, .44], [1.12, 1.3, .38]], [[-1.2, -.3, .5], [1.2, -.3, .5]]];
function hairFill(ctx, P, m) { return m > 0 || (P.hair2 && P.hair2 !== P.hair) ? lg(ctx, 0, -1.8, 0, 1.4, [[0, P.hair], [1, P.hair2 || P.hair]]) : P.hair; }
function hairBack(ctx, P, kind, m, t, o) {
  const hb = HAIR_BACK[kind % HAIR_TOP.length], fill = hairFill(ctx, P, m), lw = .2;
  if (hb) lumps(ctx, hb, fill, P.ol, lw);
  if (m > .01) { // maria-chiquinhas
    const wind = o.wind == null ? 1 : o.wind;
    [-1, 1].forEach(sd => {
      const L = 3.1 * m, n = 9, top = [], bot = [];
      for (let i = 0; i <= n; i++) { const u = i / n, sw = Math.sin(t * 4 + i * .55 + (sd > 0 ? 1.3 : 0)) * .22 * u * (.4 + wind * .6), cx = sd * (1.12 + Math.sin(u * 2.4) * .55 * m + u * .15) + sw, cy = -.55 + u * L, w = .48 * Math.sin(Math.PI * Math.min(1, .25 + u * .85)) * (1 - u * .35) + .06; top.push([cx - w, cy]); bot.push([cx + w, cy]); }
      poly(ctx, top.concat(bot.reverse())); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .12; ctx.lineJoin = 'round'; ctx.stroke();
    });
  }
}
function drawHead(ctx, P, o = {}, hairKind, t = 0) {
  if (hairKind == null) hairKind = o.hair != null ? o.hair : (P.hk != null ? P.hk : 0);
  const m = clamp(o.magical || 0);
  if (m > 0 && !o._mixed && P === PAL.hero) P = palMix(PAL.hero, PAL.heroMagic, m);
  ctx.save(); if (o.headFlip) ctx.scale(-1, 1);
  hairBack(ctx, P, hairKind, m, t, o);
  // orelhas
  ctx.fillStyle = P.skin; ctx.strokeStyle = P.ol; ctx.lineWidth = .1;
  [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 1.0, .12, .2, .27, 0, 0, TAU); ctx.fill(); ctx.stroke(); });
  ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fillStyle = P.skin; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .13; ctx.stroke();
  ctx.save(); ctx.translate(o.faceShift || 0, 0); drawFace(ctx, P, { ...(o.face || {}), m }, t); ctx.restore();
  // cabelo da frente
  const fill = hairFill(ctx, P, m), top = HAIR_TOP[hairKind % HAIR_TOP.length];
  lumps(ctx, top, fill, P.ol, .2);
  if (hairKind % 4 !== 3) { // costeletas / degradê
    ctx.fillStyle = rgba(P.hair, .85); [-1, 1].forEach(sd => { rrect(ctx, sd * .92 - .07, -.28, .14, .42, .06); ctx.fill(); });
  }
  if (m > .01) { // franja e mechas laterais
    lumps(ctx, [[-.7, -.58, .3], [-.3, -.66, .3], [.2, -.66, .3], [.66, -.58, .3], [-1.05, .05, .27], [-1.07, .45, .25], [-1.04, .8, .2], [1.05, .05, .27], [1.07, .45, .25], [1.04, .8, .2]], fill, P.ol, .2, m);
  }
  const fadeOut = 1 - clamp(m * 1.6);
  if (fadeOut > .01) {
    const capCol = o.cap === false ? null : (typeof o.cap === 'string' ? o.cap : P.cap);
    if (capCol) {
      ctx.save(); ctx.globalAlpha = fadeOut; ctx.translate(0, -m * 1.2); ctx.rotate(m * .6);
      const dark = mix(capCol, '#000000', .28);
      ctx.beginPath(); ctx.ellipse(0, -.42, 1.1, 1.0, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = capCol; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .13; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.strokeStyle = dark; ctx.lineWidth = .07; ctx.beginPath(); ctx.moveTo(0, -1.42); ctx.lineTo(0, -.5); ctx.stroke();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0, -1.42, .1, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.globalAlpha = fadeOut * .9; ctx.beginPath(); ctx.arc(-.42, -.88, .13, 0, TAU); ctx.fill(); ctx.globalAlpha = fadeOut;
      rrect(ctx, -1.5, -.5, 3.0, .3, .12); ctx.fillStyle = dark; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .12; ctx.stroke();
      ctx.restore();
    }
    if (P.hat) { // chapéu de palha
      ctx.save(); ctx.globalAlpha = fadeOut; ctx.translate(0, -m * 1.2);
      ctx.beginPath(); ctx.ellipse(0, -.5, .95, .8, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = P.hat; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .12; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -.42, 1.7, .3, 0, 0, TAU); ctx.fillStyle = mix(P.hat, '#ffffff', .15); ctx.fill(); ctx.stroke();
      ctx.fillStyle = mix(P.hat, '#7a3a1a', .5); ctx.fillRect(-.93, -.62, 1.86, .16);
      ctx.restore();
    }
    if (P.wrap) { // lenço na cabeça
      ctx.save(); ctx.globalAlpha = fadeOut; ctx.translate(0, -m * 1.2);
      ctx.beginPath(); ctx.ellipse(0, -.35, 1.08, .95, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = P.wrap; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .12; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; [[-.6, -.8], [-.1, -1.0], [.5, -.85], [.2, -.5], [-.5, -.45], [.85, -.5]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], .08, 0, TAU); ctx.fill(); });
      poly(ctx, [[.55, -1.12], [1.2, -1.45], [1.0, -.85]]); ctx.fillStyle = P.wrap; ctx.fill(); ctx.stroke(); poly(ctx, [[.55, -1.12], [.95, -1.55], [1.35, -1.1]]); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(.58, -1.1, .15, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
  if (m > .01) { // tiara de ouro + estrela + laços das chiquinhas
    ctx.save(); ctx.globalAlpha = clamp(m * 1.3); ctx.lineCap = 'round';
    ctx.strokeStyle = P.ol; ctx.lineWidth = .2; ctx.beginPath(); ctx.arc(0, -.28, .86, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke();
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .1; ctx.stroke();
    starPath(ctx, 0, -1.0, .3 * m, .13 * m); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .07; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = '#ff5fa8'; ctx.beginPath(); ctx.arc(0, -.9, .1, 0, TAU); ctx.fill();
    [-1, 1].forEach(sd => { ctx.save(); ctx.translate(sd * 1.1, -.62); ctx.scale(m, m); [-1, 1].forEach(q => { ctx.beginPath(); ctx.ellipse(q * .27, 0, .27, .17, q * sd * .5, 0, TAU); ctx.fillStyle = '#ff5fa8'; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .08; ctx.stroke(); }); ctx.beginPath(); ctx.arc(0, 0, .1, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.stroke(); ctx.restore(); });
    ctx.restore();
  }
  ctx.restore();
}
/* desenha um personagem; (x,y)=chão sob os pés. s = px por raio-de-cabeça.
   opções: pal, flip, t, wind, scarfLen, hair, face, shadow, squash, rot, sink, cap(false|cor), magical(0..1), wand(0..1), wandAng(graus) */
function drawChar(ctx, x, y, s, pose, o = {}) {
  let P = o.pal || PAL.hero; const f = o.flip ? -1 : 1, k = skeleton(pose), t = o.t || 0, ol = .13, m = clamp(o.magical || 0);
  if (m > 0 && P === PAL.hero) P = palMix(PAL.hero, PAL.heroMagic, m);
  const oo = { ...o, pal: P, magical: m, _mixed: true }, hairKind = o.hair == null ? (P.hk != null ? P.hk : 0) : o.hair;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s); ctx.translate(0, -k.foot - (pose.air || 0) * 2 + (o.sink || 0));
  if (o.squash) { ctx.translate(0, k.foot); ctx.scale(1 + o.squash * .5, 1 - o.squash); ctx.translate(0, -k.foot); }
  if (o.rot) { ctx.rotate(o.rot); }
  const sw = Math.max(.6, (pose.spread == null ? .8 : pose.spread) + .25), hw = Math.max(.5, (pose.hs == null ? .5 : pose.hs) + .25);
  // sombra
  if (o.shadow !== false) { ctx.save(); ctx.translate(0, k.foot + (pose.air || 0) * 2); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, .1, 2.2, .45, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // pano na cintura (favela) -> fitas longas (mágico). Mesmas opções: wind, scarfLen, pose.scarfDir
  const scarfDir = pose.scarfDir == null ? -1 : pose.scarfDir, wind = o.wind == null ? 1 : o.wind;
  const tail = (ph, col, col2, lenK, wK, dy) => {
    const n = 10, len = (o.scarfLen || 3.4) * lenK, top = [], bot = [], ax = scarfDir * (hw * .8), ay = .1 + dy;
    for (let i = 0; i <= n; i++) {
      const u = i / n, wv = Math.sin(t * 9 - i * .75 + ph) * .3 * u * wind, bx = ax + scarfDir * (.3 + u * len), by = ay + u * .4 * (1 - wind * .5) + wv + u * u * (1 - wind) * 1.6 + u * u * .5;
      const w = wK * (1 - u * .25); top.push([bx, by - w]); bot.push([bx, by + w]);
    }
    poly(ctx, top.concat(bot.reverse())); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.strokeStyle = col2; ctx.lineWidth = .07; ctx.globalAlpha = .7; ctx.beginPath(); for (let i = 0; i <= n; i++) { const p = top[i], q = bot[n - i]; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; i ? ctx.lineTo(mx, my) : ctx.moveTo(mx, my); } ctx.stroke(); ctx.globalAlpha = 1;
  };
  const showTail = o.tail != null ? o.tail : !!(P.chain || o.scarfLen != null);
  if (showTail && m > .02) tail(1.7, mix(P.scarf2, '#ffffff', .2), P.scarf, 1.0 * m, .2, .3);
  if (showTail) tail(0, P.scarf, P.scarf2, .62 + m * .5, .3 - .1 * m, 0);
  // pernas: canela (pele / meia listrada) + bermuda/calcinha + calçado (havaiana / bota)
  const sockCol = mix(P.skin, P.sock || '#fff6fb', m);
  [k.lL, k.lR].forEach((l, li) => {
    strokeLimb(ctx, [l[1], l[2]], .6, sockCol, P.ol, ol);
    if (m > .05) { const dx = l[2][0] - l[1][0], dy = l[2][1] - l[1][1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; ctx.save(); ctx.globalAlpha = m; ctx.strokeStyle = P.sockStripe || '#ff8fc8'; ctx.lineWidth = .1; ctx.lineCap = 'butt'; [.3, .5, .7].forEach(u => { const px = l[1][0] + dx * u, py = l[1][1] + dy * u; ctx.beginPath(); ctx.moveTo(px - nx * .3, py - ny * .3); ctx.lineTo(px + nx * .3, py + ny * .3); ctx.stroke(); }); ctx.restore(); }
    // calçado
    const fx = l[2][0], fy = l[2][1];
    ctx.save(); ctx.lineJoin = 'round';
    if (m > .3) { const wf = Math.sin(t * 8 + li * 2) * .12; ctx.globalAlpha = clamp((m - .3) * 2); [-1, 1].forEach(q => { ctx.save(); ctx.translate(fx - .2, fy - .35); ctx.rotate(-1.1 - wf + q * .35); ctx.beginPath(); ctx.ellipse(.45, 0, .5, .17, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .08; ctx.stroke(); ctx.restore(); }); ctx.globalAlpha = 1; }
    ctx.fillStyle = P.sole || '#f6f3ea'; ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.beginPath(); ctx.ellipse(fx + .22, fy + .17, .66, .2 + .06 * m, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = mix(P.skin, P.shoe, m); ctx.beginPath(); ctx.ellipse(fx + .2, fy + .02 - .05 * m, .5 + .1 * m, .27 + .1 * m, 0, 0, TAU); ctx.fill(); ctx.stroke();
    if (m < .95) { ctx.globalAlpha = 1 - m; ctx.strokeStyle = P.shoe; ctx.lineWidth = .13; ctx.beginPath(); ctx.moveTo(fx - .05, fy - .12); ctx.lineTo(fx + .5, fy + .12); ctx.lineTo(fx + .02, fy + .18); ctx.stroke(); ctx.globalAlpha = 1; }
    if (m > .05) { ctx.globalAlpha = m; ctx.fillStyle = '#ff5fa8'; ctx.strokeStyle = P.ol; ctx.lineWidth = .07; [-1, 1].forEach(q => { ctx.beginPath(); ctx.ellipse(fx + .1 + q * .17, fy - .33, .17, .1, q * .6, 0, TAU); ctx.fill(); ctx.stroke(); }); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(fx + .1, fy - .33, .07, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.restore();
    // bermuda (coxa) — vira calçola branca sob a saia
    strokeLimb(ctx, [l[0], l[1]], .9, P.pants, P.ol, ol);
    if (m < .9) { ctx.save(); ctx.globalAlpha = 1 - m; ctx.strokeStyle = P.pants2 || P.pants; ctx.lineWidth = .06; ctx.beginPath(); ctx.moveTo(l[1][0] - (l[1][0] - l[0][0]) * .12 - .3, l[1][1] - (l[1][1] - l[0][1]) * .12); ctx.lineTo(l[1][0] - (l[1][0] - l[0][0]) * .12 + .3, l[1][1] - (l[1][1] - l[0][1]) * .12); ctx.stroke(); ctx.restore(); }
  });
  // saia em camadas (acompanha as pernas)
  if (m > .03) {
    const hem = (l, dx) => { const a = l[0], b = l[1], hx = a[0] + (b[0] - a[0]) * .9, hy = a[1] + (b[1] - a[1]) * .9; return [hx + dx, hy]; };
    const hL = hem(k.lL, -.5), hR = hem(k.lR, .5), wL = [-hw, .0], wR = [hw, .0];
    const layer = (sc, col, trim, nsc) => {
      const e = (a, h) => [a[0] + (h[0] - a[0]) * sc * m, a[1] + (h[1] - a[1]) * sc * m + (1 - m) * .0];
      const A = e(wL, hL), B = e(wR, hR), n = nsc, pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(A[0], B[0], u), lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * .15 * m]); }
      ctx.beginPath(); ctx.moveTo(wL[0] - .1, wL[1]); ctx.lineTo(A[0], A[1]); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[i + 1]; ctx.quadraticCurveTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + .32 * m, q[0], q[1]); } ctx.lineTo(wR[0] + .1, wR[1]); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol * .9; ctx.lineJoin = 'round'; ctx.stroke();
      if (trim) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .05; ctx.beginPath(); ctx.moveTo(A[0], A[1] - .06); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[i + 1]; ctx.quadraticCurveTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + .24 * m, q[0], q[1] - .06); } ctx.stroke(); }
    };
    ctx.save(); ctx.globalAlpha = clamp(m * 2.2);
    layer(1, P.skirt1 || '#ffb3da', false, 6); layer(.82, P.skirt2 || '#fff6fb', true, 5); layer(.58, P.skirt3 || '#ff8fc8', false, 4);
    ctx.restore();
  }
  // braços de trás (não "front")
  const arm = (a, side) => {
    strokeLimb(ctx, a, .6, P.skin, P.ol, ol);
    if (m > .02) { ctx.save(); ctx.globalAlpha = clamp(m * 1.5); const sh = side < 0 ? k.shL : k.shR; ctx.beginPath(); ctx.arc(sh[0] + side * .05, sh[1] + .1, .5 * m, 0, TAU); ctx.fillStyle = P.jacket; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol * .9; ctx.stroke(); ctx.restore(); }
    // pulseira vermelha / punho dourado
    const bp = [lerp(a[2][0], a[1][0], .2), lerp(a[2][1], a[1][1], .2)];
    if (side < 0 || m > .05) { ctx.save(); ctx.globalAlpha = side < 0 ? 1 : m; ctx.strokeStyle = side < 0 ? mix('#e5283a', '#ff8fc8', m) : '#ffd23f'; ctx.lineWidth = .17; ctx.beginPath(); ctx.arc(bp[0], bp[1], .33, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = P.skin; ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.beginPath(); ctx.arc(a[2][0], a[2][1], .36, 0, TAU); ctx.fill(); ctx.stroke();
  };
  if (!pose.frontL) arm(k.aL, -1); if (!pose.frontR) arm(k.aR, 1);
  // tronco: regata/camisa -> corpete
  const sL = [k.shL[0] - .25, k.shL[1] - .1], sR = [k.shR[0] + .25, k.shR[1] - .1], torso = [sL, sR, [hw, .3], [-hw, .3]];
  poly(ctx, torso); ctx.fillStyle = P.jacket; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); poly(ctx, torso); ctx.clip();
  if (P.stripe && m < .98) { ctx.globalAlpha = (1 - m) * .5; ctx.fillStyle = P.stripe; for (let i = -3; i <= 3; i++) ctx.fillRect(i * .42 - .08, -3, .16, 4); ctx.globalAlpha = 1; }
  ctx.fillStyle = P.trim; ctx.fillRect(-hw - .1, .08, hw * 2 + .2, .22); // barra
  ctx.restore();
  // decote (regata): pele em V
  poly(ctx, [[k.neck[0] - .5, k.neck[1] + .05], [k.neck[0] + .5, k.neck[1] + .05], [k.neck[0], k.neck[1] + .85 - .3 * m]]); ctx.fillStyle = P.skin; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol * .7; ctx.stroke();
  ctx.strokeStyle = P.trim; ctx.lineWidth = .09; ctx.beginPath(); ctx.moveTo(k.neck[0] - .5, k.neck[1] + .08); ctx.lineTo(k.neck[0], k.neck[1] + .85 - .3 * m); ctx.lineTo(k.neck[0] + .5, k.neck[1] + .08); ctx.stroke();
  // fone de ouvido no pescoço + correntinha dourada
  if (P.phones && m < .98) { ctx.save(); ctx.globalAlpha = 1 - m; const nx = k.neck[0], ny = k.neck[1];
    ctx.strokeStyle = P.ol; ctx.lineWidth = .28; ctx.beginPath(); ctx.moveTo(nx - .85, ny + .25); ctx.quadraticCurveTo(nx, ny + 1.5, nx + .85, ny + .25); ctx.stroke(); ctx.strokeStyle = P.phones; ctx.lineWidth = .14; ctx.stroke();
    [-1, 1].forEach(q => { rrect(ctx, nx + q * .88 - .17, ny + .02, .34, .5, .14); ctx.fillStyle = P.phones; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .08; ctx.stroke(); }); ctx.restore(); }
  if (P.chain) { ctx.save(); const nx = k.neck[0], ny = k.neck[1]; ctx.strokeStyle = P.gold || '#ffd23f'; ctx.lineWidth = .06; ctx.beginPath(); ctx.moveTo(nx - .42, ny + .12); ctx.quadraticCurveTo(nx, ny + 1.15, nx + .42, ny + .12); ctx.stroke(); ctx.fillStyle = P.gold || '#ffd23f'; ctx.beginPath(); ctx.arc(nx, ny + .78, .1, 0, TAU); ctx.fill(); ctx.restore(); }
  // laço grande no peito
  if (m > .03) { ctx.save(); ctx.translate(k.neck[0] * .9, k.neck[1] + 1.15); ctx.scale(m, m); ctx.globalAlpha = clamp(m * 1.4); ctx.lineJoin = 'round';
    [-1, 1].forEach(q => { poly(ctx, [[0, 0], [q * .9, -.45], [q * 1.05, .1], [q * .9, .55]]); ctx.fillStyle = P.bow || '#ff5fa8'; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .09; ctx.stroke(); });
    poly(ctx, [[-.15, .1], [-.5, 1.0], [-.15, .85]]); ctx.fillStyle = P.bow || '#ff5fa8'; ctx.fill(); ctx.stroke(); poly(ctx, [[.15, .1], [.5, 1.0], [.15, .85]]); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, .28, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-.06, -.07, .07, 0, TAU); ctx.fill(); ctx.restore(); }
  // faixa da cintura (obi/cinto) e nó do pano
  ctx.save(); ctx.globalAlpha = clamp(m * 1.5); ctx.fillStyle = P.bow || '#ff5fa8'; ctx.fillRect(-hw - .02, .02, hw * 2 + .04, .2); ctx.restore();
  if (showTail) { ctx.beginPath(); ctx.arc(scarfDir * hw * .8, .12, .27, 0, TAU); ctx.fillStyle = P.scarf; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol * .9; ctx.stroke(); }
  // braços da frente
  if (pose.frontL) arm(k.aL, -1); if (pose.frontR) arm(k.aR, 1);
  // cabeça
  ctx.save(); ctx.translate(k.head[0], k.head[1]); ctx.rotate(k.ha);
  drawHead(ctx, P, oo, hairKind, t);
  ctx.restore();
  // varinha mágica na mão direita
  const wd = clamp(o.wand || 0);
  if (wd > .01) {
    const h = k.aR[2], wa = rad(o.wandAng == null ? 22 : o.wandAng), dx = Math.sin(wa), dy = -Math.cos(wa), L = 3.0 * E.io2(clamp(wd * 1.5));
    const tx = h[0] + dx * L, ty = h[1] + dy * L, bx = h[0] - dx * .7, by = h[1] - dy * .7;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = P.ol; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .16; ctx.stroke();
    ctx.strokeStyle = '#ff8fc8'; ctx.lineWidth = .1; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + dx * .45, by + dy * .45); ctx.stroke();
    ctx.fillStyle = P.skin; ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.beginPath(); ctx.arc(h[0], h[1], .36, 0, TAU); ctx.fill(); ctx.stroke(); // mão por cima da haste
    const R = .72 * clamp(wd * 1.3), pul = 1 + Math.sin(t * 8) * .08;
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, tx, ty, 0, R * 3.2 * pul, [[0, 'rgba(255,220,245,.9)'], [.35, 'rgba(255,140,205,.35)'], [1, 'rgba(255,140,205,0)']]); ctx.beginPath(); ctx.arc(tx, ty, R * 3.2 * pul, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    starPath(ctx, tx, ty, R, R * .48, -Math.PI / 2 + Math.sin(t * 3) * .12); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .09; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = '#ff5fa8'; ctx.beginPath(); const hr = R * .3; ctx.moveTo(tx, ty + hr * .9); ctx.bezierCurveTo(tx - hr * 1.5, ty - hr * .2, tx - hr * .5, ty - hr * 1.2, tx, ty - hr * .3); ctx.bezierCurveTo(tx + hr * .5, ty - hr * 1.2, tx + hr * 1.5, ty - hr * .2, tx, ty + hr * .9); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6, rr = R * (1.5 + .5 * Math.sin(t * 5 + i * 2)); sparkle(ctx, tx + Math.cos(a) * rr, ty + Math.sin(a) * rr, R * (.3 + .2 * Math.sin(t * 7 + i)), a, i % 2 ? '#fff6c8' : '#ffc2ea'); } ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }
  // brilhos em volta (mais intensos na transformação)
  const I = clamp(m * 1.1) * .6 + Math.max(0, m * (1 - m) * 4) * .9;
  if (I > .03) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const n = Math.round(4 + I * 7), cols = ['#fff6c8', '#ffc2ea', '#d8c4ff', '#ffffff'];
    for (let i = 0; i < n; i++) { const a = t * 1.3 + i * TAU / n * 1.0 + i * .7, rr = 2.6 + (i % 3) * .9 + Math.sin(t * 2 + i) * .35; sparkle(ctx, Math.cos(a) * rr * .85, -1.6 + Math.sin(a) * rr * 1.05, (.16 + .3 * Math.pow(Math.sin(t * 5 + i * 2.1) * .5 + .5, 2)) * Math.min(1, I + .3), a * .5, cols[i % 4]); }
    ctx.restore();
  }
  ctx.restore();
  return k;
}
/* posição na tela de um ponto do esqueleto (para colocar efeitos na mão/peito) */
function charPt(x, y, s, pose, pt, o = {}) {
  const k = skeleton(pose), f = o.flip ? -1 : 1, p = typeof pt === 'string' ? k[pt] : pt;
  const q = p.length === 3 ? p : p; // [x,y]
  return [x + q[0] * s * f, y + (q[1] - k.foot - (pose.air || 0) * 2) * s];
}
