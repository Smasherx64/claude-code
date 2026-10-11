'use strict';
/* ============================================================
   chars.js — personagens SIMPLES (traço básico), poses por ângulos
   Convenção: ângulos em graus a partir de "para baixo"; + = para a direita da tela.
   ============================================================ */
const PAL = {
  hero: { skin: '#f7d0ab', hair: '#16142a', sheen: '#4d5fa8', jacket: '#2a4278', trim: '#f4f1e8', pants: '#3b4b7d', shoe: '#f6f3ea', scarf: '#ff3b4e', scarf2: '#c41f36', ol: '#15122a', cheek: '#ff9a8c' },
  thief: { skin: '#2a2a33', hair: '#14141a', sheen: '#2a2a33', jacket: '#1a1a22', trim: '#1a1a22', pants: '#202029', shoe: '#101015', scarf: '#1a1a22', scarf2: '#101015', ol: '#0a0a0f', cheek: '#2a2a33' },
};
const NEIGH_COLORS = [['#ff9f43', '#6c5ce7'], ['#2ec4b6', '#e8590c'], ['#e56b9d', '#2b8a3e'], ['#9b8cff', '#f59f00'], ['#5ec8ff', '#d6336c'], ['#ffd43b', '#364fc7']];
/* vizinhos: cinza (c=0) -> colorido (c=1) */
function neighPal(i, c) {
  const [j, p] = NEIGH_COLORS[i % NEIGH_COLORS.length], gj = ['#7b8089', '#6a6f78', '#8a8f98'][i % 3], gp = ['#575c65', '#4a4f58', '#60656e'][i % 3];
  const skins = ['#f4cba5', '#d9a27a', '#b9805b', '#f7d6b8'];
  return {
    skin: mix('#9b9ea5', skins[i % 4], c), hair: mix('#3a3d44', ['#2b1d14', '#5a3a22', '#d8a64a', '#1d1d26'][i % 4], c), sheen: mix('#555960', '#6a5036', c),
    jacket: mix(gj, j, c), trim: mix('#a0a4ab', '#ffffff', c), pants: mix(gp, p, c), shoe: mix('#3a3d44', '#f4f1e8', c),
    scarf: mix(gj, j, c), scarf2: mix(gp, p, c), ol: mix('#23262b', '#1a1530', c), cheek: mix('#9b9ea5', '#ff9a8c', c),
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
function drawFace(ctx, P, f = {}, t = 0) {
  const e = f.eye || 'open', m = f.mouth || 'smile', lx = (f.look ? f.look[0] : 0) * .14, ly = (f.look ? f.look[1] : 0) * .1;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const eyes = [-.4, .4];
  eyes.forEach((ex, i) => {
    const x = ex + lx, y = .08 + ly;
    ctx.fillStyle = P.ol; ctx.strokeStyle = P.ol; ctx.lineWidth = .1;
    if (e === 'open' || e === 'determined') {
      ctx.beginPath(); ctx.ellipse(x, y, .13, .2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + .045, y - .07, .05, 0, TAU); ctx.fill();
    } else if (e === 'closed') { ctx.beginPath(); ctx.arc(x, y - .06, .15, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
    else if (e === 'happy') { ctx.beginPath(); ctx.arc(x, y + .1, .16, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    else if (e === 'shock') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, .2, 0, TAU); ctx.fill(); ctx.lineWidth = .07; ctx.stroke(); ctx.fillStyle = P.ol; ctx.beginPath(); ctx.arc(x + lx * .5, y, .06, 0, TAU); ctx.fill(); }
    else if (e === 'dot') { ctx.beginPath(); ctx.arc(x, y, .1, 0, TAU); ctx.fill(); }
    else if (e === 'spiral') {
      ctx.lineWidth = .06; ctx.beginPath(); for (let k = 0; k < 40; k++) { const a = k / 40 * TAU * 2.6 + t * 8 * (i ? 1 : -1), r = .02 + k / 40 * .2; k ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke();
    } else if (e === 'squint') { ctx.lineWidth = .09; ctx.beginPath(); ctx.moveTo(x - .14, y - .04 - (i ? 0 : .04)); ctx.lineTo(x + .14, y + .04); ctx.stroke(); }
    if (e === 'determined') { ctx.lineWidth = .11; ctx.beginPath(); ctx.moveTo(x - .2 * (i ? -1 : 1), y - .34 + (i ? .0 : 0)); ctx.lineTo(x + .2 * (i ? -1 : 1), y - .22 - .1 * (i ? 0 : 0)); ctx.stroke(); }
  });
  if (f.cheek !== false && P.cheek) { ctx.fillStyle = rgba(P.cheek.startsWith('#') ? P.cheek : '#ff9a8c', .5); ctx.beginPath(); ctx.ellipse(-.68, .4, .14, .08, 0, 0, TAU); ctx.ellipse(.68, .4, .14, .08, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = P.ol; ctx.fillStyle = P.ol; ctx.lineWidth = .09;
  const my = .52;
  if (m === 'smile') { ctx.beginPath(); ctx.arc(0, my - .12, .2, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-.3, my - .1); ctx.quadraticCurveTo(0, my + .45, .3, my - .1); ctx.closePath(); ctx.fillStyle = '#7a1f2b'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-.22, my - .1, .44, .1); }
  else if (m === 'open') { ctx.beginPath(); ctx.ellipse(0, my, .14, .2, 0, 0, TAU); ctx.fillStyle = '#7a1f2b'; ctx.fill(); ctx.stroke(); }
  else if (m === 'flat') { ctx.beginPath(); ctx.moveTo(-.16, my); ctx.lineTo(.16, my); ctx.stroke(); }
  else if (m === 'frown') { ctx.beginPath(); ctx.arc(0, my + .16, .2, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
  else if (m === 'wavy') { ctx.beginPath(); ctx.moveTo(-.25, my); for (let k = 1; k <= 8; k++) ctx.lineTo(-.25 + k * .0625, my + (k % 2 ? -.05 : .05)); ctx.stroke(); }
}
function drawHair(ctx, P, kind = 0) {
  ctx.fillStyle = P.hair; ctx.strokeStyle = P.ol; ctx.lineWidth = .1; ctx.lineJoin = 'round';
  const sets = [
    [[-1.08, .25], [-1.4, -.45], [-1.0, -.6], [-1.3, -1.25], [-.55, -1.0], [-.5, -1.75], [.05, -1.2], [.5, -1.7], [.8, -1.0], [1.35, -1.1], [1.02, -.55], [1.12, -.1], [.62, -.5], [.3, -.25], [0, -.55], [-.35, -.3], [-.9, .35]], // espetado (herói)
    [[-1.08, .3], [-1.12, -.7], [-.7, -1.2], [0, -1.35], [.7, -1.2], [1.12, -.7], [1.08, .3], [.9, -.4], [.3, -.6], [-.4, -.55], [-.9, -.3]], // curto
    [[-1.15, .9], [-1.15, -.6], [-.7, -1.25], [0, -1.4], [.7, -1.25], [1.15, -.6], [1.15, .9], [.9, -.45], [0, -.7], [-.9, -.45]], // médio
    [[-1.05, .1], [-.9, -1.0], [-.3, -1.5], [0, -1.25], [.3, -1.6], [.9, -1.0], [1.05, .1], [.7, -.55], [0, -.45], [-.7, -.55]], // topete
  ];
  const pts = sets[kind % sets.length]; poly(ctx, pts); ctx.fill(); ctx.stroke();
  if (kind === 0) { ctx.strokeStyle = P.sheen; ctx.lineWidth = .1; ctx.beginPath(); ctx.moveTo(-.45, -1.35); ctx.quadraticCurveTo(0, -1.2, .35, -1.4); ctx.stroke(); }
}
/* cabeça isolada (raio = 1 unidade) — usada também nos closes */
function drawHead(ctx, P, o = {}, hairKind = 0, t = 0) {
  ctx.save(); if (o.headFlip) ctx.scale(-1, 1);
  ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fillStyle = P.skin; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = .13; ctx.stroke();
  ctx.save(); ctx.translate(o.faceShift || 0, 0); drawFace(ctx, P, o.face || {}, t); ctx.restore();
  drawHair(ctx, P, hairKind);
  ctx.restore();
}
/* desenha um personagem; (x,y)=chão sob os pés. s = px por raio-de-cabeça. */
function drawChar(ctx, x, y, s, pose, o = {}) {
  const P = o.pal || PAL.hero, f = o.flip ? -1 : 1, k = skeleton(pose), t = o.t || 0, ol = .13;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s); ctx.translate(0, -k.foot - (pose.air || 0) * 2 + (o.sink || 0));
  if (o.squash) { ctx.translate(0, k.foot); ctx.scale(1 + o.squash * .5, 1 - o.squash); ctx.translate(0, -k.foot); }
  if (o.rot) { ctx.rotate(o.rot); }
  const hairKind = o.hair == null ? 0 : o.hair;
  // sombra
  if (o.shadow !== false) { ctx.save(); ctx.translate(0, k.foot + (pose.air || 0) * 2); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, .1, 2.2, .45, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // cauda do cachecol (atrás de tudo)
  const scarfDir = pose.scarfDir == null ? -1 : pose.scarfDir, wind = o.wind == null ? 1 : o.wind;
  const tail = (front) => {
    const n = 10, len = (o.scarfLen || 3.4), top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, wv = Math.sin(t * 9 - i * .75) * .3 * u * wind, bx = k.neck[0] + scarfDir * (.5 + u * len), by = k.neck[1] + .3 + u * .4 * (1 - wind * .5) + wv + u * u * (1 - wind) * 1.6;
      const w = .36 * (1 - u * .25); top.push([bx, by - w]); bot.push([bx, by + w]);
    }
    poly(ctx, top.concat(bot.reverse())); ctx.fillStyle = P.scarf; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.stroke();
  };
  tail();
  // pernas
  [k.lL, k.lR].forEach(l => {
    strokeLimb(ctx, l, .82, P.pants, P.ol, ol);
    ctx.fillStyle = P.shoe; ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.beginPath(); ctx.ellipse(l[2][0] + .22, l[2][1] + .1, .62, .34, 0, 0, TAU); ctx.fill(); ctx.stroke();
  });
  // braços de trás (não "front")
  const arm = (a, sh) => { strokeLimb(ctx, a, .66, P.jacket, P.ol, ol); ctx.fillStyle = P.skin; ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.beginPath(); ctx.arc(a[2][0], a[2][1], .36, 0, TAU); ctx.fill(); ctx.stroke(); };
  if (!pose.frontL) arm(k.aL); if (!pose.frontR) arm(k.aR);
  // tronco (jaqueta)
  const sw = Math.max(.6, (pose.spread == null ? .8 : pose.spread) + .25), hw = Math.max(.5, (pose.hs == null ? .5 : pose.hs) + .25);
  const sL = [k.shL[0] - .25, k.shL[1] - .1], sR = [k.shR[0] + .25, k.shR[1] - .1];
  poly(ctx, [sL, sR, [hw, .3], [-hw, .3]]); ctx.fillStyle = P.jacket; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = P.trim; ctx.lineWidth = .1; ctx.beginPath(); ctx.moveTo(k.neck[0], k.neck[1] + .5); ctx.lineTo(0, .25); ctx.stroke();
  ctx.fillStyle = P.trim; ctx.fillRect(-hw + .05, .05, hw * 2 - .1, .16);
  // braços da frente
  if (pose.frontL) arm(k.aL); if (pose.frontR) arm(k.aR);
  // faixa do cachecol no pescoço
  ctx.save(); ctx.translate(k.neck[0], k.neck[1] + .05); ctx.rotate(rad(pose.lean || 0));
  rrect(ctx, -.8, -.28, 1.6, .62, .3); ctx.fillStyle = P.scarf; ctx.fill(); ctx.strokeStyle = P.ol; ctx.lineWidth = ol; ctx.stroke(); ctx.restore();
  // cabeça
  ctx.save(); ctx.translate(k.head[0], k.head[1]); ctx.rotate(k.ha);
  drawHead(ctx, P, o, hairKind, t);
  ctx.restore();
  ctx.restore();
  return k;
}
/* posição na tela de um ponto do esqueleto (para colocar efeitos na mão/peito) */
function charPt(x, y, s, pose, pt, o = {}) {
  const k = skeleton(pose), f = o.flip ? -1 : 1, p = typeof pt === 'string' ? k[pt] : pt;
  const q = p.length === 3 ? p : p; // [x,y]
  return [x + q[0] * s * f, y + (q[1] - k.foot - (pose.air || 0) * 2) * s];
}
