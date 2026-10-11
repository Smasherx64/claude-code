'use strict';
/* ============================================================
   scenes_a.js — CENAS A (0 → 24.0 s) do remake vertical de "Luz na Periferia"
   abertura · corrida sob a lua · salto · nascer do sol · "Acordo cedo" · boletos/geladeira · rua/escola · multidão
   ============================================================ */
var A_RED = '#c8283a';

/* ---------- utilidades ---------- */
function a_t12(t) { return Math.floor(t * 12) / 12; }
/* keyframes suaves (Hermite com tangentes por diferença finita): k = [[t,v],...] */
function a_kf(t, k) {
  const n = k.length; if (t <= k[0][0]) return k[0][1]; if (t >= k[n - 1][0]) return k[n - 1][1];
  let i = 1; while (t > k[i][0]) i++;
  const a = k[i - 1], b = k[i], h = b[0] - a[0], u = (t - a[0]) / h;
  const m0 = i > 1 ? (b[1] - k[i - 2][1]) / (b[0] - k[i - 2][0]) : (b[1] - a[1]) / h;
  const m1 = i < n - 1 ? (k[i + 1][1] - a[1]) / (k[i + 1][0] - a[0]) : (b[1] - a[1]) / h;
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * m1;
}
/* câmera do fundo: mesma rotação/zoom (atenuado), translação com paralaxe */
function a_bgCam(ctx, c, par, zp) {
  const z = Math.max(c.r ? 1.12 : 1, 1 + ((c.z || 1) - 1) * (zp == null ? .5 : zp));
  cam(ctx, { x: W / 2 + ((c.x == null ? W / 2 : c.x) - W / 2) * par, y: H / 2 + ((c.y == null ? H / 2 : c.y) - H / 2) * par, z: z, r: c.r || 0 });
}
function a_cam(ctx, c) { cam(ctx, c); }
/* herói com contorno de luz "falso" (crisp em qualquer escala): cópia deslocada na cor da luz por baixo */
function a_rimHero(ctx, x, y, s, pose, o, col, dx, dy, col2, dx2, dy2) {
  // contorno de luz "falso" e barato: cópias deslocadas na cor da luz por baixo da silhueta
  const base = Object.assign({}, o, { cap: false, shadow: false, rim: null });
  if (col2) drawHero(ctx, x + dx2, y + dy2, s, pose, Object.assign({}, base, { col: col2 }));
  drawHero(ctx, x + dx, y + dy, s, pose, Object.assign({}, base, { col: col }));
  drawHero(ctx, x, y, s, pose, o);
}
/* fantasmas baratos (afterimage aditiva): fn(ctx, tt, col) desenha o herói no tempo tt com a cor col */
function a_ghosts(ctx, t, n, dt, rgb, a0, fn) {
  for (let k = n; k >= 1; k--) {
    const a = a0 * Math.pow(1 - (k - 1) / (n + .6), 1.4); if (a < .02) continue;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    fn(ctx, t - k * dt, `rgb(${Math.round(rgb[0] * a)},${Math.round(rgb[1] * a)},${Math.round(rgb[2] * a)})`); ctx.restore();
  }
}
function a_black(ctx, a) { if (a > .003) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore(); } }
function a_streak(ctx, u, x0, y0, x1, y1, a) { // estrela cadente própria
  if (u < 0 || u > 1.3) return;
  const k = E.out2(clamp(u)), hx = lerp(x0, x1, k), hy = lerp(y0, y1, k), L = 230, dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy), tl = Math.min(L, d * k + 20);
  const tx = hx - dx / d * tl, ty = hy - dy / d * tl, fade = u > 1 ? clamp(1 - (u - 1) * 3.4) : 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  ctx.strokeStyle = lg(ctx, tx, ty, hx, hy, [[0, 'rgba(255,214,140,0)'], [1, `rgba(255,236,190,${.95 * fade * a})`]]);
  ctx.lineWidth = 8; ctx.globalAlpha = .3; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = rg(ctx, hx, hy, 0, 38, [[0, `rgba(255,255,255,${fade * a})`], [.35, `rgba(255,220,150,${.5 * fade * a})`], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(hx - 40, hy - 40, 80, 80);
  ctx.restore();
}
/* bloco de laje no mundo (x0..x1), topo em y */
function a_roofBlock(ctx, x0, x1, y, mood, seed) {
  const M = wrMood(mood), col = mix('#07070d', M.tint, .14);
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 520, [[0, col], [1, mix(col, '#000', .6)]]); ctx.fillRect(x0, y, x1 - x0, 900);
  ctx.fillStyle = wrCol(M.rim, .5); ctx.fillRect(x0, y, x1 - x0, 2.5);
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 30, [[0, wrCol(M.rim, .16)], [1, wrCol(M.rim, 0)]]); ctx.fillRect(x0, y, x1 - x0, 30);
  // parede lateral com janelinhas acesas (face voltada ao vão)
  const edge = x0 < -1000 ? x1 : x0, dir = x0 < -1000 ? -1 : 1, R = rng(seed * 7 + 5);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
    if (R() < .55) continue; const wx = edge + dir * (24 + c * 46) - (dir < 0 ? 22 : 0), wy = y + 70 + r * 78;
    ctx.fillStyle = R() < .5 ? 'rgba(255,196,90,.9)' : 'rgba(255,160,70,.8)'; ctx.fillRect(wx, wy, 22, 30);
  }
  // mureta
  ctx.fillStyle = mix(col, M.tint, .25); ctx.fillRect(x0, y - 22, x1 - x0, 22); ctx.fillStyle = wrCol(M.rim, .25); ctx.fillRect(x0, y - 23, x1 - x0, 2);
  ctx.restore();
}
/* varal de bandeirinhas entre dois pontos */
function a_bunting(ctx, x0, y0, x1, y1, sag, t, s) {
  const N = 26; ctx.save(); ctx.strokeStyle = 'rgba(20,16,40,.9)'; ctx.lineWidth = 2.2 * s;
  const pt = u => [lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)];
  ctx.beginPath(); for (let i = 0; i <= 30; i++) { const p = pt(i / 30); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
  const cols = ['#e8c24a', '#d8504a', '#4a9ad8', '#e8e0d0', '#4ab88a', '#e07aa0'];
  for (let i = 1; i < N; i++) { const u = i / N, p = pt(u), sw = Math.sin(t * 2 + i) * 2.4 * s; ctx.fillStyle = cols[i % 6]; ctx.beginPath(); ctx.moveTo(p[0] - 9 * s, p[1]); ctx.lineTo(p[0] + 9 * s, p[1]); ctx.lineTo(p[0] + sw, p[1] + 22 * s); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

/* =========================================================
   1) 0 – 2.4  ABERTURA: negro → noite estrelada, estrela cadente, garoto soltando a pipa
   ========================================================= */
function a_open(ctx, t, L, D) {
  const e = E.io2(clamp(t / 2.4));
  const c = { x: lerp(350, 440, e), y: lerp(790, 870, e), z: lerp(1.0, 1.4, e), r: 0 };
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_bgCam(ctx, c, .3, .6);
  drawSky(ctx, 0, t, { hy: 1000, cam: t * 14, stars: 1 });
  a_streak(ctx, (t - .55) / .5, 650, 70, 250, 330, 1);
  drawSkyline(ctx, (c.x - 360) * 1.6 + t * 4, 1215, 0, { t, lit: .95, hillH: 520, seed: 2, noLayer: [3, 4, 5] });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  const rx = 30 + t * 6;
  drawRoofline(ctx, 900, rx, { t, mood: 0, seed: 3 });
  // postes ao fundo/frente com bandeirinhas
  drawPoles(ctx, rx * 1.1, 900, { t, gap: 520, h: 520, flags: true, mood: 0, par: 1 });
  const bx = 470, by = 900, s = 32, q = a_t12(t);
  const br = Math.sin(q * 2.1) * 3, pose = { lean: -3, head: -24, spread: .8, hs: .55, aR: [130 + br, 148 + br], aL: [-8, -4], lR: [3, 0], lL: [-3, 0], hR: 'flat' };
  const hand = charPt(bx, by, s, pose, 'handR');
  const kx = 585 + Math.sin(t * .9) * 14, ky = 475 + Math.cos(t * 1.1) * 10;
  drawKite(ctx, kx, ky, .8, .35 + Math.sin(t * 1.3) * .08, t, { anchor: { x: hand[0], y: hand[1] }, glow: true, tail: 220 });
  a_rimHero(ctx, bx, by, s, pose, { t: q }, '#ff9a5a', -2, -.6);
  fxParticles(ctx, t, 'fireflies', { x: 0, y: 640, w: W, h: 400 }, { n: 22, seed: 2, a: .9 });
  ctx.restore();
  fxVignette(ctx, .55);
  a_black(ctx, 1 - E.out2(seg(t, 0, 1.05)));
  ctx.restore();
}

/* =========================================================
   2) corrida pelas lajes sob a lua gigante  (2.4 – 3.8 lateral, 3.8 – 5.0 baixa/próxima)
   ========================================================= */
var A_V = 540;
function a_runBase(ctx, t, o) {
  const camX = t * A_V, c = o.c, roofY = o.roofY;
  ctx.save(); ctx.fillStyle = '#04050e'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_bgCam(ctx, c, .22, .5);
  drawSky(ctx, o.mood, t, { hy: 1000, cam: camX });
  const mx = o.moon[0] - camX * .012;
  drawMoon(ctx, mx, o.moon[1], o.moon[2], { glow: 1.1 });
  godRays(ctx, mx, o.moon[1], t, { n: 8, len: 1300, a: .07, col: '255,240,210', sp: .02 });
  drawSkyline(ctx, camX, 1230, o.mood, { t, lit: .85, hillH: 520, seed: 2, noLayer: [4, 5] });
  drawPoles(ctx, camX * .55, roofY - 60, { t, gap: 380, h: 330, s: .6, par: 1, flags: true, mood: o.mood, col: '#0b0b1e' });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  drawRoofline(ctx, roofY, camX, { t, mood: o.mood, seed: 5 });
  drawPoles(ctx, camX * 1.1 + 80, roofY, { t, gap: 470, h: 560, flags: true, mood: o.mood, par: 1 });
  return camX;
}
function a_runHero(ctx, t, x, y, s, o) {
  const ph = t * TAU * 2.45, pose = runPose(ph, o.lean, o.amp);
  const hand = charPt(x, y, s, pose, 'handL');
  const kx = x - 120 - Math.sin(t * 2) * 12, ky = y - 380 + Math.sin(t * 1.7) * 18;
  drawKite(ctx, kx, ky, o.ks, -.5 + Math.sin(t * 1.3) * .1, t, { anchor: { x: hand[0], y: hand[1] }, glow: true, tail: 200, sag: .03 });
  // poeira nos passos
  const f = 2 * 2.45, k0 = Math.floor(t * f);
  for (let k = k0 - 3; k <= k0; k++) { const t0 = k / f; ctx.save(); ctx.translate(-A_V * (t - t0), 0); dustPuff(ctx, x - 20 * s / 60, y, t0, t, { size: s * .36, n: 6, dir: -1, dur: .55, seed: k + 3, a: .4, col: '150,140,190' }); ctx.restore(); }
  a_ghosts(ctx, t, 3, .05, [150, 140, 255], .5, (g, tt, col) => drawHero(g, x, y, s, runPose(tt * TAU * 2.45, o.lean, o.amp), { t: tt, shadow: false, cap: false, col: col }));
  a_rimHero(ctx, x, y, s, pose, { t: t, sweat: o.sweat || 0 }, '#b9a8ff', -3, -1, '#ffd0a0', 3, -1.5);
}
function a_run1(ctx, t, L, D) {
  const u = L / D, e = E.io2(u);
  const c = { x: 360, y: lerp(690, 720, e), z: lerp(1.0, 1.16, e), r: lerp(-.03, .025, e) };
  const camX = a_runBase(ctx, t, { c: c, mood: .15, roofY: 1020, moon: [430, 690, 215] });
  a_runHero(ctx, t, 250 + Math.sin(t * 2) * 8, 1020, 58, { lean: 20, amp: 1.05, ks: .55 });
  // poste gigante em primeiro plano (paralaxe forte)
  ctx.save(); ctx.globalAlpha = .9; drawPoles(ctx, camX * 1.9 + 300, 1160, { t, gap: 900, h: 880, s: 1.7, flags: false, wires: 3, mood: .15, col: '#05050c' }); ctx.restore();
  fxParticles(ctx, t, 'dust', { x: 0, y: 500, w: W, h: 600 }, { n: 30, seed: 4, a: .6, speed: 8 });
  ctx.restore();
  fxSpeed(ctx, t, { kind: 'dir', ang: 0, n: 16, a: .13, thick: 3, seed: 8 });
  fxVignette(ctx, .55);
  ctx.restore();
}
function a_run2(ctx, t, L, D) {
  const u = L / D, e = E.io2(u);
  const c = { x: 360, y: lerp(760, 700, e), z: lerp(1.22, 1.4, e), r: lerp(-.075, .05, e) };
  const camX = a_runBase(ctx, t, { c: c, mood: .25, roofY: 1070, moon: [400, 650, 240] });
  const s = lerp(62, 74, e);
  a_runHero(ctx, t, lerp(210, 270, e), 1070, s, { lean: 26, amp: 1.2, ks: .7, sweat: .6 });
  ctx.save(); ctx.globalAlpha = .85; drawPoles(ctx, camX * 2.2 + 150, 1230, { t, gap: 800, h: 980, s: 1.9, flags: false, mood: .2, col: '#05050c' }); ctx.restore();
  ctx.restore();
  fxSpeed(ctx, t, { kind: 'dir', ang: 0, n: 24, a: .18, thick: 4, seed: 9 });
  fxFlare(ctx, 440 - camX * .012, 650, .8, { a: .16 * (.6 + .4 * Math.sin(t * 3)), col: '255,240,210', ghosts: false, streak: .6 });
  fxVignette(ctx, .6);
  ctx.restore();
}

/* =========================================================
   3) SALTO sobre a lua (5.0 – 8.0)
   ========================================================= */
var A_G = 820, A_RY = 950, A_T0 = 5.5, A_T1 = 7.0;
function a_leapState(t) {
  const s = 46;
  if (t < A_T0) return { x: -10 - (A_T0 - t) * 520, y: A_RY, pose: sprintPose(t * TAU * 2.6), mode: 'run' };
  if (t < A_T1) {
    const u = (t - A_T0) / (A_T1 - A_T0), u2 = clamp(u + .14 * Math.sin(u * TAU)), p = leapPose(u2, 5.2);
    return { x: lerp(-10, A_G + 10, E.io2(u2) * .35 + u2 * .65), y: A_RY, pose: p, mode: 'air', u: u2 };
  }
  const q = a_t12(t), k = seg(q, 7.12, 7.95), p = lerpPose(POSE.crouch, POSE.lookUp, E.out2(k));
  p.sq = (p.sq || 0) + .16 * (1 - seg(q, 7.0, 7.25)); p.ph = 0;
  return { x: A_G + 10, y: A_RY, pose: p, mode: 'land' };
}
function a_leap(ctx, t, L, D) {
  const s = 46;
  const c = { x: a_kf(t, [[5, -20], [5.5, 70], [6.25, 430], [7.0, 770], [8.0, 860]]), y: a_kf(t, [[5, 860], [5.5, 850], [6.25, 690], [7.0, 880], [8.0, 790]]),
    z: a_kf(t, [[5, 1.05], [5.5, 1.1], [6.25, 1.38], [7.0, 1.2], [7.15, 1.3], [8.0, 1.12]]), r: a_kf(t, [[5, -.05], [5.6, -.01], [6.25, .07], [7.0, .0], [8.0, -.03]]) };
  ctx.save(); ctx.fillStyle = '#04050e'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_bgCam(ctx, c, .14, .5);
  drawSky(ctx, .2, t, { hy: 1000, cam: c.x });
  const mx = 390 - (c.x - 360) * .03, my = 700 + (c.y - 800) * .03, mR = 245 * (1 + .04 * Math.sin(t * 1.4));
  drawMoon(ctx, mx, my, mR, { glow: 1.3 });
  const ap = seg(t, 5.7, 6.3) * (1 - seg(t, 6.9, 7.4));
  godRays(ctx, mx, my, t, { n: 16, len: 1700, a: .05 + .17 * ap, col: '255,236,200', sp: .05 });
  drawSkyline(ctx, c.x * 1.2, 1300, .2, { t, lit: .9, hillH: 520, seed: 2, camY: (c.y - 800) * .5, noLayer: [4, 5] });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  // abismo entre as lajes: névoa escura
  ctx.fillStyle = lg(ctx, 0, A_RY + 40, 0, A_RY + 700, [[0, 'rgba(8,6,28,0)'], [1, 'rgba(4,3,14,.85)']]); ctx.fillRect(-100, A_RY, A_G + 200, 800);
  a_roofBlock(ctx, -3000, 0, A_RY, .2, 1); a_roofBlock(ctx, A_G, A_G + 3000, A_RY, .2, 2);
  a_bunting(ctx, -30, A_RY - 190, A_G + 30, A_RY - 215, 55, t, 1);
  // tanque / antena nas bordas
  ctx.fillStyle = '#07070f'; ctx.fillRect(-170, A_RY - 130, 12, 108); ctx.fillRect(A_G + 140, A_RY - 160, 10, 138);
  const st = a_leapState(t);
  if (st.mode === 'air') {
    const dr = (g, tt, col) => { const q = a_leapState(tt); drawHero(g, q.x, q.y, s, q.pose, { t: tt, shadow: false, cap: false, col: col }); };
    a_ghosts(ctx, t, 6, .075, [255, 150, 200], .6, dr);
    a_ghosts(ctx, t, 3, .04, [170, 215, 255], .45, dr);
  }
  a_rimHero(ctx, st.x, st.y, s, st.pose, { t: st.mode === 'land' ? a_t12(t) : t }, '#fff3d0', -3, -1.4, '#8f86ff', 3, 1.5);
  // pousada
  dustPuff(ctx, A_G + 10, A_RY, A_T1, t, { size: 46, n: 12, ring: true, dir: 0, dur: 1.1, seed: 4, a: .6, col: '170,160,210' });
  dustPuff(ctx, A_G + 10, A_RY, A_T1, t, { size: 30, n: 7, dir: 1, dur: .9, seed: 9, a: .5, col: '200,190,230' });
  fxShock(ctx, A_G + 10, A_RY - 4, A_T1, t, { dur: .6, R: 420, w: 30, col: '255,236,200' });
  // decolagem
  dustPuff(ctx, -10, A_RY, A_T0, t, { size: 40, n: 10, dir: -1, dur: .8, seed: 6, a: .55, col: '170,160,210' });
  fxShock(ctx, -10, A_RY - 8, A_T0, t, { dur: .45, R: 260, w: 22, col: '200,200,255' });
  fxParticles(ctx, t, 'dust', { x: -200, y: 300, w: 1300, h: 800 }, { n: 34, seed: 7, a: .6, speed: 6 });
  ctx.restore();
  // speed lines no impulso e no mergulho
  const sp = Math.max(1 - seg(t, 5.5, 5.95), 0) * seg(t, 5.0, 5.5) + .0;
  if (t < 5.95) fxSpeed(ctx, t, { kind: 'radial', cx: 300, cy: 760, n: 40, a: .35 * (t < 5.5 ? seg(t, 5.0, 5.5) * .6 : 1 - seg(t, 5.5, 5.95)), r0: 260, r1: 900, seed: 3 });
  if (t > 6.0 && t < 7.0) fxSpeed(ctx, t, { kind: 'radial', cx: W / 2, cy: 640, n: 26, a: .16 * Math.sin((t - 6) * Math.PI), r0: 360, r1: 1000, seed: 5 });
  fxVignette(ctx, .55);
  ctx.restore();
}

/* =========================================================
   4) NASCER DO SOL (8.0 – 13.1)
   ========================================================= */
function a_sunMood(t) { return .5 + 2.5 * E.io2(seg(t, 8, 12.8)); }
function a_sunSky(ctx, t, c, par) {
  const m = a_sunMood(t), lit = lerp(.95, .32, seg(t, 8.4, 12.8));
  const sx = 455, sy = a_kf(t, [[8, 900], [10.5, 720], [11.6, 690], [12.4, 600], [13.1, 560]]);
  const R = a_kf(t, [[8, 150], [11.6, 190], [12.2, 300], [12.7, 560], [13.1, 1050]]);
  ctx.save(); a_bgCam(ctx, c, par, .5);
  drawSky(ctx, m, t, { hy: 1000, cam: 0 });
  const ra = lerp(.05, .24, seg(t, 8, 11)) * (1 + .6 * seg(t, 12, 13));
  drawSun(ctx, sx, sy, R, { t, glow: 1, rayA: ra, nRays: 18, col: '255,208,150' });
  drawSkyline(ctx, (c.x - 360) * 1.3 + t * 3, 1270, m, { t, lit: lit, hillH: 500, seed: 2, camY: (c.y - 700) * .4, noLayer: [3, 4, 5] });
  ctx.restore();
  return { m: m, sx: sx, sy: sy, R: R };
}
function a_sunA(ctx, t, L, D) {
  const e = E.io2(clamp(L / D)), c = { x: lerp(390, 360, e), y: lerp(560, 690, e), z: lerp(1.12, 1.0, e), r: 0 };
  ctx.save(); ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, W, H);
  const S = a_sunSky(ctx, t, c, .3);
  ctx.save(); a_cam(ctx, c);
  drawRoofline(ctx, 980, 40 + t * 5, { t, mood: S.m, seed: 3 });
  drawPoles(ctx, (40 + t * 5) * 1.1, 980, { t, gap: 520, h: 500, flags: true, mood: S.m, par: 1 });
  const bx = 290, by = 980, s = 40, q = a_t12(t), br = Math.sin(q * 1.9) * 3;
  const pose = { lean: -4, head: -26, spread: .8, hs: .55, aR: [128 + br, 146 + br], aL: [-8, -4], lR: [3, 0], lL: [-3, 0], hR: 'flat' };
  const hand = charPt(bx, by, s, pose, 'handR');
  const kx = 540 + Math.sin(t * .9) * 16, ky = 470 + Math.cos(t * 1.1) * 12 - seg(t, 8, 10.5) * 20;
  drawKite(ctx, kx, ky, .9, .3 + Math.sin(t * 1.3) * .08, t, { anchor: { x: hand[0], y: hand[1] }, glow: true, tail: 240 });
  a_rimHero(ctx, bx, by, s, pose, { t: q }, '#ffd9a0', 3, -1);
  fxParticles(ctx, t, 'fireflies', { x: 0, y: 700, w: W, h: 300 }, { n: 14, seed: 5, a: .8 * (1 - seg(t, 8, 10)) });
  fxParticles(ctx, t, 'dust', { x: 0, y: 300, w: W, h: 700 }, { n: 26, seed: 6, a: .7, col: '255,226,180' });
  ctx.restore();
  fxFlare(ctx, S.sx, S.sy, .7, { a: .25 * seg(t, 8.6, 10.5), ghosts: false, streak: .7 });
  fxVignette(ctx, .45);
  ctx.restore();
}
function a_sunB(ctx, t, L, D) {
  const e = E.io2(clamp(L / D)), c = { x: lerp(430, 360, e), y: lerp(540, 760, e), z: lerp(1.35, 1.12, e), r: lerp(.03, -.01, e) };
  ctx.save(); ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, W, H);
  const S = a_sunSky(ctx, t, c, .35);
  ctx.save(); a_cam(ctx, c);
  drawRoofline(ctx, 1010, 60 + t * 6, { t, mood: S.m, seed: 4 });
  const bx = 250, by = 1010, s = 62, q = a_t12(t), k = seg(t, 10.5, 12.2);
  const pose = lerpPose({ lean: -4, head: -26, spread: .8, hs: .55, aR: [128, 146], aL: [-8, -4], lR: [3, 0], lL: [-3, 0], hR: 'flat' }, { lean: -6, head: -20, spread: .85, hs: .6, aR: [150, 168], aL: [-20, -10], lR: [3, 0], lL: [-3, 0], hR: 'flat' }, E.io2(k));
  const hand = charPt(bx, by, s, pose, 'handR');
  const kx = 520 + Math.sin(t * .9) * 18, ky = 420 - k * 60 + Math.cos(t * 1.1) * 12;
  drawKite(ctx, kx, ky, 1.1, .3 + Math.sin(t * 1.3) * .08, t, { anchor: { x: hand[0], y: hand[1] }, glow: true, tail: 260 });
  a_rimHero(ctx, bx, by, s, pose, { t: q, shadow: true }, '#ffe2b0', 5, -1.5);
  ctx.restore();
  fxFlare(ctx, S.sx, S.sy + (c.y - 700) * -.2, 1.0, { a: .4 + .6 * seg(t, 11.5, 13), ghosts: true, streak: 1 });
  fxVignette(ctx, .4);
  ctx.restore();
  flash(ctx, .95 * E.in3(seg(t, 12.45, 13.1)), '255,240,208');
}

/* =========================================================
   5) 13.1 – 16.4  "Acordo cedo, sol na cara, mais um dia pesado"
   ========================================================= */
function a_dawnBG(ctx, t, c, sx, sy, R, a) {
  ctx.save(); a_bgCam(ctx, c, .2, .4);
  drawSky(ctx, 3, t, { hy: 900, cam: 0 });
  drawSun(ctx, sx, sy, R, { t, glow: 1.1, rayA: a, nRays: 20, col: '255,214,160' });
  drawSkyline(ctx, 0, 1270, 3, { t, lit: .3, hillH: 480, seed: 2, haze: 1.2, noLayer: [4, 5] });
  ctx.restore();
}
function a_closeHead(ctx, t, c, s, hx, hy, sunSY, sunR, o) {
  const q = a_t12(t), br = Math.sin(t * 1.6) * 1.5, tilt = o.tilt || 0;
  const pose = { lean: 2, head: -9 + tilt + br, spread: .5, hs: .4, aR: [8, 10], aL: [-6, -4], lR: [2, 0], lL: [-2, 0] };
  const p0 = charPt(0, 0, s, pose, 'head'), X = hx - p0[0], Y = hy - p0[1];
  a_dawnBG(ctx, t, c, o.sunX, sunSY, sunR, o.rayA);
  ctx.save(); a_cam(ctx, c);
  a_rimHero(ctx, X, Y, s, pose, { t: q, shadow: false, amb: '#7a3a50', ambA: .35 }, '#ffcf8a', 7, -2);
  // olho: apertado contra o sol
  const hp = charPt(X, Y, s, pose, 'head'), sq = o.squint == null ? 1 : o.squint;
  ctx.save(); ctx.translate(hp[0] + s * .3, hp[1] - s * .03); ctx.rotate(rad(pose.lean + pose.head) * .6);
  ctx.strokeStyle = 'rgba(255,214,150,.95)'; ctx.lineWidth = s * .028; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s * .09, 0); ctx.quadraticCurveTo(0, s * (.05 - .05 * sq), s * .09, -s * .01 * sq); ctx.stroke(); ctx.restore();
  ctx.restore();
  return { hp: hp };
}
function a_dawn1(ctx, t, L, D) { // 13.1 – 14.3 : perfil gigante, sol ainda baixo
  const e = E.io2(clamp(L / D)), c = { x: lerp(330, 360, e), y: 640, z: lerp(1.0, 1.1, e), r: lerp(-.02, .01, e) };
  ctx.save(); ctx.fillStyle = '#201830'; ctx.fillRect(0, 0, W, H);
  const sy = lerp(980, 780, E.out2(seg(t, 13.1, 14.3))), R = 150;
  a_closeHead(ctx, t, c, 310, 290, 560, sy, R, { sunX: 600, rayA: .12, squint: 0, tilt: 3 });
  fxFlare(ctx, 600, sy, .9, { a: .3, ghosts: false, streak: .8 });
  fxVignette(ctx, .5);
  ctx.restore();
  flash(ctx, .85 * (1 - E.out2(seg(t, 13.1, 13.5))), '255,240,208');
}
function a_dawn2(ctx, t, L, D) { // 14.3 – 15.7 : sol na linha do olhar, flares em "sol"/"cara"
  const e = E.io2(clamp(L / D)), c = { x: lerp(390, 450, e), y: lerp(600, 560, e), z: lerp(1.5, 1.85, e), r: lerp(.015, -.01, e) };
  ctx.save(); ctx.fillStyle = '#201830'; ctx.fillRect(0, 0, W, H);
  const sy = lerp(780, 560, E.out3(seg(t, 14.3, 15.2))), R = lerp(150, 230, E.out2(seg(t, 14.3, 15.7)));
  const info = a_closeHead(ctx, t, c, 310, 290, 560, sy, R, { sunX: 600, rayA: lerp(.12, .3, seg(t, 14.3, 15)), squint: seg(t, 14.3, 14.8), tilt: -3 * seg(t, 14.3, 15) });
  // flares: 'sol' 14.30 / 'cara' 14.72
  const f1 = t >= 14.3 ? Math.exp(-(t - 14.3) * 4.5) : 0, f2 = t >= 14.72 ? Math.exp(-(t - 14.72) * 3.6) : 0;
  const k = .55 + .35 * seg(t, 14.3, 15.6) + .9 * f1 + 1.2 * f2;
  ctx.save(); a_cam(ctx, c); fxFlare(ctx, 600, sy, k, { a: clamp(.5 + .5 * f1 + .6 * f2), ghosts: true, streak: 1.1 }); ctx.restore();
  fxVignette(ctx, .5);
  ctx.restore();
  flash(ctx, .55 * f2 + .25 * f1, '255,244,222');
}
function a_weight(ctx, t, L, D) { // 15.7 – 16.4 : o dia vira peso
  const k = seg(t, 15.7, 15.98), land = k >= 1, tl = t - 15.98;
  const sh = land ? shakeV(t, 14 * Math.exp(-tl * 5), 34, 3) : shakeV(t, 3, 30, 1);
  const c = { x: 360 + sh[0], y: 700 + sh[1], z: lerp(1.35, 1.15, E.out2(seg(t, 15.7, 16.4))), r: lerp(.04, -.015, seg(t, 15.7, 16.4)) };
  ctx.save(); ctx.fillStyle = '#1a1424'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_bgCam(ctx, c, .25, .5);
  drawSky(ctx, 3, t, { hy: 900 }); drawSkyline(ctx, 0, 1270, 3, { t, lit: .25, hillH: 480, seed: 2, haze: 1.3, noLayer: [4, 5] });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  ctx.fillStyle = lg(ctx, 0, 1000, 0, 1300, [[0, '#2a2036'], [1, '#0a0810']]); ctx.fillRect(-100, 1000, W + 200, 400);
  const bx = 360, by = 1010, s = 70, ex = E.out2(seg(t, 15.98, 16.2));
  const crush = lerpPose(POSE.hunch, { lean: 50, head: 38, spread: .7, hs: .4, aR: [34, 20], aL: [-24, -12], lR: [30, -34], lL: [-26, -38], sq: .2 }, ex);
  const pose = lerpPose(POSE.stand, crush, E.in2(seg(t, 15.85, 16.05)));
  // relógio-sol gigante desce sobre os ombros
  const cy = lerp(-320, 585, E.in3(k)) + (land ? -Math.exp(-tl * 9) * 0 : 0), cR = 235, bounce = land ? Math.sin(tl * 22) * 14 * Math.exp(-tl * 7) : 0;
  ctx.save(); ctx.translate(0, bounce);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 360, cy, cR * .8, cR * 2.4, [[0, 'rgba(255,190,110,.5)'], [1, 'rgba(255,190,110,0)']]); ctx.fillRect(360 - cR * 2.4, cy - cR * 2.4, cR * 4.8, cR * 4.8); ctx.globalCompositeOperation = 'source-over';
  drawClock(ctx, 360, cy, cR, 0, { glow: .8, h: .1 + (1 - E.out3(k)) * 2, m: (t - 15.7) * 8, col: '#3a2a3a' });
  ctx.restore();
  a_rimHero(ctx, bx, by, s, pose, { t: a_t12(t) }, '#ffc890', -3, -1);
  if (land) {
    dustPuff(ctx, 360, by, 15.98, t, { size: 52, n: 14, ring: true, dir: 0, dur: 1, seed: 8, a: .6, col: '220,190,170' });
    fxShock(ctx, 360, by - 10, 15.98, t, { dur: .5, R: 420, w: 30, col: '255,200,150' });
  }
  ctx.restore();
  if (land) a_black(ctx, .0);
  fxVignette(ctx, .6);
  ctx.restore();
}

/* =========================================================
   6) 16.4 – 18.9  "Conta pra pagar, geladeira pela metade"
   ========================================================= */
function a_bills(ctx, t, L, D) { // 16.4 – 17.4
  const buried = t >= 16.9, tb = t - 16.9, sh = buried ? shakeV(t, 12 * Math.exp(-tb * 6), 34, 2) : [0, 0];
  const c = { x: 360 + sh[0], y: 700 + sh[1], z: lerp(1.0, 1.18, E.io2(clamp(L / D))), r: lerp(-.03, .03, E.io2(clamp(L / D))) };
  ctx.save(); ctx.fillStyle = '#0a0c1a'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_bgCam(ctx, c, .3, .5);
  drawSky(ctx, 1, t, { hy: 900, stars: .2 }); drawSkyline(ctx, 0, 1270, 1.2, { t, lit: .5, hillH: 470, seed: 5, haze: 1.2, noLayer: [4, 5] });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  ctx.fillStyle = lg(ctx, 0, 1000, 0, 1300, [[0, '#1c2038'], [1, '#07080f']]); ctx.fillRect(-100, 1000, W + 200, 400);
  billRain(ctx, t, 3, { n: 18, box: { x: -60, y: -160, w: W + 120, h: H + 360 }, speed: 1.4, a: .6 });
  const bx = 360, by = 1000, s = 62, k = E.out2(seg(t, 16.88, 17.1));
  const pose = lerpPose(POSE.slump, POSE.cower, k);
  pose.sq = (pose.sq || 0) + .08 * Math.exp(-Math.max(0, tb) * 6) * (buried ? 1 : 0);
  a_rimHero(ctx, bx, by, s, pose, { t: a_t12(t) }, '#7ab8ff', -3, -1);
  // monte de boletos até a cintura
  if (t > 16.9) {
    const R = rng(77), n = 70, items = [];
    for (let i = 0; i < n; i++) { const g = (R() + R() + R()) / 3, x = 360 + (g - .5) * 400, hmax = 190 * (1 - Math.pow(Math.abs(g - .5) * 2, 1.6) * .75), fy = by - 14 - R() * hmax, d = .7 + R() * .5, st = 16.9 + (i / n) * .38 + R() * .05; items.push({ x: x, fy: fy, rot: (R() - .5) * 1.4, d: d, st: st, stamp: R() < .3 }); }
    items.sort((a, b) => a.fy - b.fy);
    for (const it of items) {
      const u = clamp((t - it.st) / .22); if (u <= 0) continue;
      const y = lerp(-80, it.fy, E.in2(u)), sq = u >= 1 ? 1 + .0 : 1;
      drawBill(ctx, it.x, y, it.rot * (u >= 1 ? 1 : 1 + (1 - u) * 2), it.d * .9, { stamp: it.stamp });
    }
    dustPuff(ctx, 360, by, 17.12, t, { size: 40, n: 10, dir: 0, dur: .9, seed: 3, a: .35, col: '220,214,200' });
  }
  billRain(ctx, t + 3.3, 9, { n: 12, box: { x: -60, y: -160, w: W + 120, h: H + 360 }, speed: 1.9, a: 1 });
  ctx.restore();
  fxVignette(ctx, .55);
  ctx.restore();
}
function a_fridge(ctx, t, L, D) { // 17.4 – 18.9
  const u = clamp(L / D), open = E.out3(seg(t, 17.4, 17.95));
  const c = { x: lerp(300, 372, E.io2(u)), y: lerp(700, 660, E.io2(u)), z: lerp(1.0, 1.85, E.io2(u)), r: lerp(-.03, .0, u) };
  ctx.save(); ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_cam(ctx, c);
  // cozinha escura
  ctx.fillStyle = lg(ctx, 0, 0, 0, 1280, [[0, '#0b0e18'], [.8, '#10141f'], [1, '#05070b']]); ctx.fillRect(-300, -300, W + 600, 1900);
  ctx.fillStyle = 'rgba(255,255,255,.025)'; for (let x = -300; x < 1000; x += 90) ctx.fillRect(x, 120, 2, 960); // azulejo
  // luz fria no chão
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 470, 1010, 20, 460, [[0, `rgba(150,210,255,${.35 * open})`], [1, 'rgba(150,210,255,0)']]); ctx.save(); ctx.translate(470, 1010); ctx.scale(1.4, .3); ctx.translate(-470, -1010); ctx.fillRect(0, 700, 1000, 700); ctx.restore(); ctx.restore();
  // herói pequeno olhando
  const pose = lerpPose(POSE.slump, POSE.lookUp, .5); pose.head = 4; pose.lean = 6;
  a_rimHero(ctx, 135, 1010, 60, pose, { t: a_t12(t) }, '#aee0ff', 3, -1);
  const fx = 470, fy = 700, fs = 1.18;
  drawFridge(ctx, fx, fy, fs, open, { t: t });
  // "pela metade": a metade esquerda do interior (e da luz) se apaga em 'metade' 18.02 -> 18.32
  const wipe = E.io2(seg(t, 18.02, 18.32));
  if (wipe > .001) {
    ctx.save(); ctx.translate(fx, fy); ctx.scale(fs, fs);
    const w = 260, h = 560, x0 = -w / 2 + 8, x1 = x0 + (w - 16) * .5 * wipe, y0 = -h / 2 + 8;
    ctx.fillStyle = '#05070b'; ctx.globalAlpha = .93; ctx.fillRect(x0, y0, x1 - x0, h - 16);
    ctx.fillStyle = lg(ctx, x1 - 18, 0, x1 + 18, 0, [[0, 'rgba(5,7,11,.93)'], [1, 'rgba(5,7,11,0)']]); ctx.fillRect(x1 - 18, y0, 36, h - 16);
    ctx.globalAlpha = 1; ctx.restore();
    // a luz que vaza também some pela metade
    ctx.save(); ctx.fillStyle = `rgba(5,7,11,${.6 * wipe})`; ctx.fillRect(-300, 0, fx - 300 + 300 - 4, 1500); ctx.restore();
  }
  ctx.restore();
  fxVignette(ctx, .6);
  ctx.restore();
}

/* =========================================================
   7) 18.9 – 21.6  "A rua me ensinou o que escola não deu"
   ========================================================= */
function a_street(ctx, t, L, D) { // 18.9 – 20.2
  const u = clamp(L / D), e = E.io2(u), c = { x: 360, y: lerp(660, 610, e), z: lerp(1.0, 1.3, e), r: lerp(.025, -.015, e) };
  ctx.save(); ctx.fillStyle = '#6a6d74'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_cam(ctx, c);
  const S = drawStreetVP(ctx, t, { mood: 5, speed: 1.25, vy: 560, glow: 1.3, fog: 1.2 });
  const z = lerp(1.7, 3.1, u), gy = S.groundY(z), s = 52 / z;
  const hx = 360 + Math.sin(t * 1.6) * 3 * (1 / z), ph = t * 6.2;
  const pose = walkPose(ph, 5); pose.sx = .32;
  a_rimHero(ctx, hx, gy, s, pose, { t: t, pack: true, shadowA: .3 }, '#fff4d8', 0, -1.6);
  fxFog(ctx, 440, 760, '230,226,214', .35, t);
  fxLightCone(ctx, 360, 560, Math.PI / 2, 700, 260, '255,244,214', .16);
  ctx.restore();
  fxVignette(ctx, .45);
  ctx.restore();
}
function a_wall(ctx, t, L, D) { // 20.2 – 21.6 : portão fechado + muro-lousa, tilt-up
  const u = clamp(L / D), sx = 260 * (t - 20.2), tilt = E.io2(seg(t, 20.9, 21.6));
  const c = { x: 360, y: lerp(640, 120, tilt), z: lerp(1.05, 1.0, u), r: lerp(.0, -.03, tilt) };
  ctx.save(); ctx.fillStyle = '#7a7c82'; ctx.fillRect(0, 0, W, H);
  // céu cinza-claro (cobre o topo ao inclinar para cima)
  ctx.save(); const M = wrMood(5);
  ctx.fillStyle = M.top; ctx.fillRect(0, -700, W, 800);
  ctx.translate(0, 120 * tilt * .5 + 40); drawSky(ctx, 5, t, { hy: 700, stars: 0 });
  drawSkyline(ctx, sx * .3, 1100, 5, { t, lit: 0, hillH: 420, seed: 9, haze: 1.3, camY: -(640 - c.y) * .3, noLayer: [4, 5] });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  const top = 450, hh = 620;
  // portão (sai pela esquerda), depois o muro
  const gx = 40 - sx, wx = gx + 600;
  drawGrafWall(ctx, wx, top, 1700, hh, { seed: 11, words: ['TROCO', 'ATENTO', 'CALA E OBSERVA', 'VIDA REAL', 'FOME', 'RESPEITO'], mood: 5, light: .9 });
  drawSchoolGate(ctx, gx, top, 600, hh, { mood: 5, open: 0, t: t });
  ctx.fillStyle = lg(ctx, 0, top + hh, 0, top + hh + 260, [[0, '#55575d'], [1, '#2a2b30']]); ctx.fillRect(-100, top + hh, W + 200, 600);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-100, top + hh, W + 200, 3);
  // herói andando de mochila
  const hx = 300, hy = top + hh + 6, s = 58;
  a_rimHero(ctx, hx, hy, s, walkPose(t * 6.4, 6), { t: t, pack: true, shadowA: .5 }, '#fff4d8', -2.5, -.8);
  ctx.restore();
  fxVignette(ctx, .45);
  ctx.restore();
}

/* =========================================================
   8) 21.6 – 24.0  "Sobreviver não é vitória, é obrigação aqui"
   ========================================================= */
function a_crowd(ctx, t, L, D) {
  const u = clamp(L / D), camX = (t - 21.6) * 210;
  const c = { x: 360, y: lerp(660, 620, u), z: lerp(1.0, 1.16, E.io2(u)), r: lerp(-.025, .02, E.io2(u)) };
  const M = wrMood(5);
  ctx.save(); ctx.fillStyle = M.top; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_bgCam(ctx, c, .25, .5);
  drawSky(ctx, 5, t, { hy: 700, stars: 0 });
  drawSkyline(ctx, camX * .5, 1130, 5, { t, lit: 0, hillH: 430, seed: 9, haze: 1.2, noLayer: [3, 4, 5] });
  ctx.restore();
  ctx.save(); a_cam(ctx, c);
  // muro com a palavra
  const wallTop = 330, gy = 1020;
  ctx.fillStyle = lg(ctx, 0, wallTop, 0, gy, [[0, '#8e93a0'], [1, '#6a6f7c']]); ctx.fillRect(-200, wallTop, W + 400, gy - wallTop);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-200, wallTop, W + 400, 3); ctx.fillStyle = 'rgba(20,24,40,.35)'; ctx.fillRect(-200, wallTop + 3, W + 400, 14);
  const px = ((-camX * .55) % 220 + 220) % 220 - 220; ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let x = px; x < W + 100; x += 220) ctx.fillRect(x, wallTop + 17, 3, gy - wallTop);
  const tx = 360 + (23.0 - t) * 60;
  ctx.save(); ctx.translate(tx, 640); ctx.rotate(-.04);
  ctx.font = '96px "Permanent Marker", "Bangers", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(10,14,30,.55)'; ctx.lineWidth = 14; ctx.strokeText('OBRIGAÇÃO', 4, 6);
  ctx.fillStyle = '#e8f0ff'; ctx.fillText('OBRIGAÇÃO', 0, 0);
  ctx.fillStyle = 'rgba(232,240,255,.9)'; for (let i = 0; i < 6; i++) { const dx = -260 + i * 100 + (i % 2) * 20, dl = 30 + (i * 37) % 60; ctx.fillRect(dx, 12, 6, dl); ctx.beginPath(); ctx.arc(dx + 3, 12 + dl, 5, 0, TAU); ctx.fill(); }
  ctx.restore();
  // chão
  ctx.fillStyle = lg(ctx, 0, gy, 0, 1300, [[0, '#5a5e6a'], [1, '#2a2d38']]); ctx.fillRect(-200, gy, W + 400, 500);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-200, gy, W + 400, 3);
  const cool = '#3a4668';
  // plano distante
  for (let i = 0; i < 16; i++) {
    const R = rng(i * 31 + 7), wx = (((R() * 1100 - camX * .55) % 1100) + 1100) % 1100 - 190;
    drawSil(ctx, wx, 920 + R() * 12, 21, 'walk', { who: i % 6 === 2 ? 'old' : (i % 5 === 0 ? 'mae' : 'crowd'), seed: i + 3, t: t, walk: 6.6, col: '#262c40', amb: cool, ambA: .5, alpha: .8, shadow: false });
  }
  // plano médio (anda junto com a câmera): herói no meio
  const mid = [[70, 'crowd'], [150, 'mae'], [235, 'crowd'], [470, 'old'], [560, 'crowd'], [650, 'adult']];
  mid.forEach((m, i) => drawSil(ctx, m[0] + Math.sin(t * 1.3 + i) * 5, gy + 4, 39, 'walk', { who: m[1], seed: i * 5 + 1, t: t, walk: 5.5 + (i % 3) * .3, col: '#171c30', amb: cool, ambA: .45}));
  a_rimHero(ctx, 360, gy + 6, 50, walkPose(t * 5.9, 6), { t: t, pack: true }, '#cfd8f0', -2, -.8);
  // plano próximo (passa mais devagar que a câmera => desliza para trás)
  [[40, 'crowd'], [330, 'old'], [640, 'mae']].forEach((m, i) => {
    const x = (((m[0] - camX * 1.45) % 980) + 980) % 980 - 130;
    drawSil(ctx, x, 1215, 70, 'walk', { who: m[1], seed: i * 7 + 20, t: t, walk: 5.3, col: '#0a0d1a', amb: '#26304c', ambA: .5});
  });
  fxFog(ctx, 880, 1100, '190,200,220', .22, t);
  ctx.restore();
  // tons frios: lavagem azul-cinza, o boné vermelho permanece (desenhado depois sem lavagem)
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(176,192,226,.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); a_cam(ctx, c); // boné vermelho por cima da lavagem
  const hp = charPt(360, gy + 6, 50, walkPose(t * 5.9, 6), 'head');
  ctx.beginPath(); ctx.rect(hp[0] - 50, hp[1] - 60, 120, 100); ctx.clip();
  drawHero(ctx, 360, gy + 6, 50, walkPose(t * 5.9, 6), { t: t, pack: true, shadow: false });
  ctx.restore();
  fxVignette(ctx, .55, '8,10,22');
  // a luz cai: dip de energia
  a_black(ctx, .96 * E.in2(seg(t, 23.52, 24.0)));
  ctx.restore();
}

/* ---------- lista de cenas ---------- */
var SCENES_A = [
  { t0: 0, t1: 2.4, name: 'a_open', fn: a_open },
  { t0: 2.4, t1: 3.8, name: 'a_run1', fn: a_run1 },
  { t0: 3.8, t1: 5.0, name: 'a_run2', fn: a_run2 },
  { t0: 5.0, t1: 8.0, name: 'a_leap', fn: a_leap },
  { t0: 8.0, t1: 10.5, name: 'a_sunA', fn: a_sunA },
  { t0: 10.5, t1: 13.1, name: 'a_sunB', fn: a_sunB },
  { t0: 13.1, t1: 14.3, name: 'a_dawn1', fn: a_dawn1 },
  { t0: 14.3, t1: 15.7, name: 'a_dawn2', fn: a_dawn2 },
  { t0: 15.7, t1: 16.4, name: 'a_weight', fn: a_weight },
  { t0: 16.4, t1: 17.4, name: 'a_bills', fn: a_bills },
  { t0: 17.4, t1: 18.9, name: 'a_fridge', fn: a_fridge },
  { t0: 18.9, t1: 20.2, name: 'a_street', fn: a_street },
  { t0: 20.2, t1: 21.6, name: 'a_wall', fn: a_wall },
  { t0: 21.6, t1: 24.0, name: 'a_crowd', fn: a_crowd },
];
var IMPACTS_A = [
  { t: 5.5, d: .07, type: 'white' },
  { t: 7.0, d: .07, type: 'white' },
  { t: 14.72, d: .08, type: 'flash' },
  { t: 15.70, d: .12, type: 'invert' },
  { t: 16.90, d: .07, type: 'flash' },
];
