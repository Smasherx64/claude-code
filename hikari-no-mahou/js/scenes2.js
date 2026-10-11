'use strict';
/* ============================================================
   scenes2.js — a virada: rua, esfera, fé, "hikari ga koko ni aru"
   ============================================================ */

/* ---------- 5. RUA (8,92 – 10,90): "me chamam de louco por ainda acreditar" ---------- */
const NEIGH = [
  { x: 800, i: 0, hair: 1, say: ['?!', 9.30, 10.9], tail: -1 },
  { x: 1070, i: 1, hair: 2, say: ['sonhador...', 9.62, 10.9], tail: -1 },
  { x: 1340, i: 2, hair: 3, say: ['LOUCO!', 9.96, 10.9], tail: -1 },
  { x: 1610, i: 3, hair: 1, say: ['kkkkk', 10.3, 10.9], tail: -1 },
];
function sceneStreet(ctx, t, L, D) {
  const camX = L * 170, y0 = 610;
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1, 1.06, L / D), r: -.012 });
  ctx.fillStyle = lg(ctx, 0, -200, 0, y0, [[0, '#8f97a2'], [1, '#d5d7da']]); ctx.fillRect(-300, -300, W + 600, y0 + 400);
  drawCity(ctx, camX * .9, y0 + 90, 0, { lit: .06 });
  streetGround(ctx, y0);
  // postes passando em primeiro plano
  for (let k = 0; k < 4; k++) { const x = ((k * 560 - camX * 1.25) % 2240 + 2240) % 2240 - 300; lampPost(ctx, x, y0 + 40, 360); }
  // vizinhos cinzas apontando e rindo
  NEIGH.forEach(n => {
    const sx = n.x - camX, lt = t - n.say[1], a = lt > 0 ? 1 : 0;
    const pose = { lean: -4, head: -6 + (lt > 0 ? Math.sin(t * 18 + n.i) * 6 : 0), spread: .8, hs: .5, aR: [10, 6], aL: [lt > -.2 ? -92 : -10, lt > -.2 ? -94 : -6], lR: [4, 0], lL: [-4, 0] };
    drawChar(ctx, sx, y0 + 66, 54, pose, { pal: neighPal(n.i, 0), hair: n.hair, flip: false, t: Math.floor(t * 12) / 12, face: { eye: lt > 0 && n.i === 2 ? 'spiral' : lt > 0 ? 'squint' : 'dot', mouth: lt > 0 ? 'grin' : 'flat', cheek: false }, wind: .2 });
  });
  NEIGH.forEach(n => bubble(ctx, t, n.say[1], n.say[2], n.say[0], n.x - camX - 10, y0 - 120 - n.i % 2 * 46, { size: 34, rot: -.06 + n.i * .03, tail: [-.6, 1] }));
  // herói caminhando
  const tq = Math.floor(t * 12) / 12, wp = walkPose(tq * 9.5, 8);
  const hx = 380, hy = y0 + 76; drawChar(ctx, hx, hy, 62, wp, { t: tq, wind: 1.3, face: { eye: t > 10.2 ? 'determined' : 'open', mouth: 'flat', look: [1, 0] } });
  ctx.restore();
  // painel diagonal de mangá: close no olho (acreditar)
  const pw = E.out5(seg(t, 10.12, 10.45)) * 560;
  if (pw > 1) {
    ctx.save(); const sl = 130; poly(ctx, [[W - pw + sl, 0], [W + 30, 0], [W + 30, H], [W - pw, H]]); ctx.clip();
    ctx.fillStyle = '#17142e'; ctx.fillRect(0, 0, W, H); drawNebula(ctx, W - pw, 0, pw + 40, H, { z: 1.4 });
    ctx.fillStyle = 'rgba(10,8,30,.5)'; ctx.fillRect(W - pw, 0, pw + 40, H);
    ctx.save(); ctx.translate(W - pw * .5 + 60, 360); ctx.scale(.95, .95); ctx.translate(-(W - pw * .5 + 60), -360);
    eyesCU(ctx, W - pw * .5 + 60, 360, 150, { open: 1, brow: -.9, look: [1, -.2], pupil: .36, glowIris: .5 + .3 * Math.sin(t * 8), t });
    ctx.restore(); fringe(ctx, W - pw * .5 + 60, 120, 150, t);
    motes(ctx, t, 3, 20, W - pw, 0, pw, H, '255,215,120', { a: .9 });
    ctx.restore();
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(W - pw + 130, -4); ctx.lineTo(W - pw - 4, H + 4); ctx.stroke(); ctx.restore();
  }
}

/* ---------- 6. A ESFERA NA PALMA (10,90 – 11,92): "acreditar" ---------- */
function sceneShard(ctx, t, L, D) {
  const z = lerp(1.0, 1.16, E.out2(L / D)), beat = beatInfo(t);
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2 + 20, z, r: .03 });
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#7d8592'], [1, '#bfc3c9']]); ctx.fillRect(-300, -300, W + 600, 1100);
  bokeh(ctx, t, 21, 18, ['#ffffff', '#d8dce6', '#ffe2a0'], { a: .35, rMin: 30, rMax: 90, sp: 6, mode: 'source-over' });
  ctx.fillStyle = rg(ctx, W / 2, 330, 0, 480, [[0, 'rgba(255,208,110,.3)'], [1, 'rgba(255,208,110,0)']]); ctx.fillRect(-300, -300, W + 600, 1100);
  // mão aberta (palma para cima) + punho da jaqueta
  bigHand(ctx, 640, 900, 3.1, .12, .18, { cuff: '#2a4278' });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 640, 480, 0, 380, [[0, 'rgba(255,210,120,.25)'], [1, 'rgba(255,210,120,0)']]); ctx.fillRect(200, 200, 880, 600); ctx.restore();
  const bob = Math.sin(t * 3) * 8, R = 96 * (1 + beat.pulse * .05);
  drawSphere(ctx, 640, 400 + bob, R, { crack: lerp(.4, 1, seg(L, 0, .9)), glow: 1, t });
  motes(ctx, t, 6, 40, 380, 120, 520, 480, '255,226,150', { a: 1, sp: 40 });
  ctx.restore();
  flare(ctx, 640, 400 + Math.sin(t * 3) * 8, .6 + beat.pulse * .1, '255,210,140', .22, .5);
}

/* ---------- 7. FÉ (11,92 – 14,92): a luz no peito que ninguém rouba ---------- */
function padlock(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = '#14122a'; ctx.lineWidth = 36; ctx.beginPath(); ctx.arc(0, -50, 52, Math.PI, 0); ctx.lineTo(52, -20); ctx.moveTo(-52, -50); ctx.lineTo(-52, -20); ctx.stroke();
  ctx.strokeStyle = '#e8e8ee'; ctx.lineWidth = 20; ctx.stroke();
  rrect(ctx, -86, -30, 172, 140, 24); ctx.fillStyle = lg(ctx, 0, -30, 0, 110, [[0, '#ffe08a'], [1, '#e0a020']]); ctx.fill(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#14122a'; ctx.beginPath(); ctx.arc(0, 36, 17, 0, TAU); ctx.fill(); ctx.fillRect(-7, 40, 14, 42);
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-72, -18, 18, 100); ctx.restore();
}
function lightning(ctx, x0, y0, x1, y1, t, col = '#fff6a0') {
  const r = rng(Math.floor(t * 30)); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, c] of [[16, 'rgba(255,200,60,.45)'], [5, col]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); for (let i = 1; i < 9; i++) { const u = i / 9; ctx.lineTo(lerp(x0, x1, u) + (r() - .5) * 60, lerp(y0, y1, u) + (r() - .5) * 60); } ctx.lineTo(x1, y1); ctx.stroke(); }
  ctx.restore();
}
function sceneFaith(ctx, t, L, D) {
  const cxW = 470, cyW = 420, punch = E.in3(seg(t, 14.5, 14.92));
  const shk = t > 14.36 && t < 14.7 ? shakeV(t, 14 * (1 - seg(t, 14.36, 14.7)), 34) : [0, 0];
  ctx.save(); cam(ctx, { x: cxW + shk[0] + 70 * seg(t, 12.9, 14.3), y: cyW - 80 + shk[1], z: lerp(1, 1.12, L / 2.4) * (1 + punch * 1.6), r: lerp(-.1, -.06, seg(L, 0, 2.4)) * (1 - punch) });
  ctx.fillStyle = lg(ctx, 0, -300, 0, 800, [[0, '#142a3a'], [1, '#2b4a58']]); ctx.fillRect(-1200, -800, 3200, 2200);
  const chest = [cxW + 4, cyW + 4], glow = .75 + .25 * Math.sin(t * 9) + seg(t, 14.3, 14.4) * 1.2;
  ctx.fillStyle = rg(ctx, chest[0], chest[1], 0, 620, [[0, `rgba(255,200,100,${.8 * Math.min(1, glow)})`], [1, 'rgba(255,200,100,0)']]); ctx.fillRect(-1200, -800, 3200, 2200);
  speedLines(ctx, chest[0], chest[1], t, { n: 80, r0: 200, r1: 1300, col: 'rgba(255,240,200,1)', a: .55, seed: 9 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; rays(ctx, chest[0], chest[1], t, { n: 10, a: .28, len: 1200 }); ctx.restore();
  // herói com a mão no peito
  const pose = { lean: 2, head: -6, spread: .85, hs: .55, aR: [28, -108], aL: [-14, -4], lR: [6, 0], lL: [-6, 0], frontR: true };
  charAtHip(ctx, cxW - 6, 566, 118, pose, { t: Math.floor(t * 12) / 12, wind: 1.7, scarfLen: 4, shadow: false, face: { eye: t > 13.3 ? 'determined' : 'closed', mouth: t > 13.3 ? 'flat' : 'smile', look: [1, 0] } });
  // luz saindo dos dedos
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, chest[0], chest[1], 0, 130, [[0, 'rgba(255,245,200,.95)'], [.4, 'rgba(255,200,100,.6)'], [1, 'rgba(255,200,100,0)']]); ctx.fillRect(chest[0] - 140, chest[1] - 140, 280, 280); ctx.restore();
  // a mão do ladrão
  const ha = seg(t, 12.95, 14.12), hx = lerp(1500, chest[0] + 130, E.out3(ha)), curl = lerp(.1, .95, seg(t, 13.9, 14.3)), zap = t - 14.36;
  if (t > 12.95) {
    let ox = 0; if (zap > 0) ox = E.out3(seg(zap, 0, .35)) * 900;
    ctx.save(); const wob = Math.sin(t * 25) * 2;
    if (zap > 0 && zap < .12) { ctx.filter = 'brightness(8)'; }
    bigHand(ctx, hx + ox, chest[1] + wob, 2.4, -Math.PI / 2 + zap * 0 + (zap > 0 ? zap * 2 : 0), curl, { col: '#23232d', ol: '#07070c', cuff: '#101018', olw: 8 });
    ctx.restore();
    if (zap > -.4 && zap < .5) { lightning(ctx, chest[0], chest[1], hx + ox, chest[1], t); lightning(ctx, chest[0], chest[1] - 20, hx + ox - 30, chest[1] + 60, t + .1); }
    if (zap > 0 && zap < .45) burst(ctx, chest[0] + 90, chest[1], 260 * E.out3(seg(zap, 0, .15)) + 40, 13, zap * 2, '#fff7c8', '#14122a', 8);
  }
  // cadeado dourado "CLANG"
  const lk = seg(t, 14.48, 14.66); if (lk > 0) padlock(ctx, chest[0] + 8, chest[1] + 10, E.back(lk) * 1.2 * (1 - punch * .5), -.12);
  ctx.restore();
  flash(ctx, punch * punch, '255,236,190');
}

/* ---------- 8. HIKARI GA KOKO NI ARU (14,92 – 17,35): o 光 se escreve em ouro ---------- */
/* regiões de cada traço de 光 em unidades u=metade do corpo da fonte: [x0,y0,x1,y1, direção] */
const KANJI_STROKES = [[-.18, -.95, .12, -.1, 'v'], [-.8, -.82, -.18, -.14, 'v'], [.08, -.88, .8, -.16, 'v'], [-1, -.3, 1, -.04, 'h'], [-1, -.06, -.1, .95, 'v'], [.02, -.06, 1, .95, 'v']];
function drawKanjiStrokes(ctx, ch, cx, cy, size, prog, o = {}) {
  const u = size / 2; ctx.save(); ctx.font = `${size}px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  KANJI_STROKES.forEach((s, i) => {
    const p = clamp(prog * KANJI_STROKES.length - i); if (p <= 0) return;
    ctx.save(); const x0 = cx + s[0] * u, y0 = cy + s[1] * u, w = (s[2] - s[0]) * u, h = (s[3] - s[1]) * u;
    ctx.beginPath(); if (s[4] === 'v') ctx.rect(x0, y0, w, h * E.out2(p)); else ctx.rect(x0, y0, w * E.out2(p), h); ctx.clip();
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 40; }
    ctx.fillStyle = lg(ctx, 0, cy - u, 0, cy + u, [[0, '#fff3c0'], [.5, '#ffc94a'], [1, '#e08a1a']]); ctx.fillText(ch, cx, cy + (o.dy || 0)); ctx.restore();
  });
  ctx.restore();
}
function sceneHikari(ctx, t, L, D) {
  const z = lerp(1, 1.09, L / D), beat = beatInfo(t);
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z });
  ctx.fillStyle = lg(ctx, 0, -100, 0, H + 100, [[0, '#04050f'], [1, '#161b33']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.globalAlpha = .55; drawCity(ctx, 0, 760, 0, { night: 1, lit: .02, fog: 0 }); ctx.globalAlpha = 1;
  // brilho de fundo cresce
  const g = seg(L, .2, 2.1); ctx.fillStyle = rg(ctx, W / 2, 300, 0, 700, [[0, `rgba(255,190,90,${.35 * g})`], [1, 'rgba(255,190,90,0)']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  motes(ctx, t, 14, 60, 0, 0, W, H, '255,214,120', { a: .9, sp: 22 });
  drawKanjiStrokes(ctx, '光', W / 2, 318, 520, seg(L, .25, 1.9), { glow: '#ffb347' });
  // grua dourada
  [0, 1, 2].forEach(i => { const u = seg(L, .3 + i * .25, 2.2); if (u > 0 && u < 1) drawCrane(ctx, lerp(i ? 1380 : -100, i === 1 ? 960 : 330, E.out3(u)), 190 + i * 120 - Math.sin(u * 3) * 40, .5 + i * .08, t * 9 + i, { gold: true, rot: i ? .1 : -.1 }); });
  // herói segurando a esfera
  const pose = { lean: -4, head: -14, spread: .85, hs: .55, aR: [170, 172], aL: [-12, -6], lR: [8, 0], lL: [-8, 0] };
  const hx = W / 2, gy = 700, s = 56, k = skeleton(pose);
  drawChar(ctx, hx, gy, s, pose, { t: Math.floor(t * 12) / 12, wind: 1, face: { eye: 'open', mouth: 'smile', look: [0, -1] }, shadow: false });
  const hand = charPt(hx, gy, s, pose, k.aR[2]);
  const R = 46 * (1 + beat.pulse * .06) + seg(L, 1.6, D) * 30;
  drawSphere(ctx, hand[0], hand[1] - R - 14, R, { crack: seg(L, .1, 1.7), glow: 1, t });
  // flare horizontal (a linha da capa) cresce até o drop
  const fl = seg(L, 1.3, D); if (fl > 0) flare(ctx, hand[0], hand[1] - R - 14, 1 + fl * 3, '255,200,120', Math.min(1, fl * 1.4), .2 + fl * 1.3);
  ctx.restore();
  flash(ctx, E.in3(seg(L, 2.1, D)), '255,246,222');
}
