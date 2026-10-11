'use strict';
/* ============================================================
   scenes_b.js — CENAS B (24.0 → 42.6 s) do remake vertical de "Luz na Periferia"
   mãe/pai · peso na escada · olhos no escuro · fé que explode · corrida ao sol · cicatrizes de ouro · porta de luz
   ============================================================ */

/* ---------- utilitários ---------- */
function b_two(t, fps) { fps = fps || 12; return Math.floor(t * fps + 1e-6) / fps; }
function b_pls(t) { return beatInfo(t).pulse; }
function b_dark(ctx, a, col) { if (a > .003) { ctx.save(); ctx.fillStyle = `rgba(${col || '0,0,0'},${clamp(a)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
function b_post(ctx, o) {
  if (o.grade) fxGrade(ctx, o.grade, o.ga == null ? 1 : o.ga);
  if (o.bloom) fxBloom(ctx, o.bloom, o.blur || 10);
  if (o.vig != null) fxVignette(ctx, o.vig, o.vcol);
}
function b_bokeh(ctx, t, seed, n, col, a, y0, y1) {
  const R = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x0 = R() * (W + 200) - 100, y = (y0 || 0) + R() * ((y1 || H) - (y0 || 0)), r = 12 + R() * 46, ph = R() * 6.28, sp = 6 + R() * 14;
    const px = x0 + Math.sin(t * .3 + ph) * 22 - (t * sp) % 40, py = y - Math.sin(t * .4 + ph) * 14, al = a * (.3 + .7 * Math.pow(.5 + .5 * Math.sin(t * .9 + ph * 3), 2));
    ctx.fillStyle = rg(ctx, px, py, 0, r, [[0, `rgba(${col},${al})`], [.7, `rgba(${col},${al * .5})`], [1, `rgba(${col},0)`]]); ctx.fillRect(px - r, py - r, r * 2, r * 2);
  }
  ctx.restore();
}
/* cidade em blocos para planos escuros/amanhecer (mundo, x0..x1) */
function b_city(ctx, x0, x1, by, col, litA, seed, t, winCol, hMax) {
  const R = rng(seed); let x = x0; ctx.save();
  while (x < x1) {
    const w = 34 + R() * 70, h = 40 + R() * (hMax || 150) * (.4 + .6 * Math.pow(Math.sin((x - x0) * .004 + seed) * .5 + .5, 1.2));
    ctx.fillStyle = col; ctx.fillRect(x, by - h, w, h + 400);
    const nx = Math.floor(w / 14), ny = Math.floor(h / 18);
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const q = R(); if (q < .26 * litA * 3) { ctx.fillStyle = winCol; ctx.globalAlpha = (.35 + .65 * (Math.sin(t * 1.3 + x * .1 + j) * .5 + .5)) * Math.min(1, litA * 2.2); ctx.fillRect(x + 5 + i * 14, by - h + 6 + j * 18, 6, 8); ctx.globalAlpha = 1; }
    }
    x += w + R() * 8;
  }
  ctx.restore();
}

/* ============================================================
   24.0–26.4  mãe e pai
   ============================================================ */
function b_polaBG(ctx, t, u, seed) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#08050c'], [.55, '#190d14'], [1, '#2a1410']]); ctx.fillRect(-400, -400, W + 800, H + 800);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, W / 2, 560, 60, 700, [[0, 'rgba(255,170,90,.42)'], [.4, 'rgba(255,120,60,.14)'], [1, 'rgba(255,100,40,0)']]); ctx.fillRect(-400, -200, W + 800, H + 400); ctx.restore();
  fxLightCone(ctx, W / 2 - 40, -80, Math.PI / 2 + .05, 1200, 760, '255,190,110', .26);
  b_bokeh(ctx, t, seed, 20, '255,170,90', .22);
}
function b_s_pola1(ctx, t, L, D) {
  const u = L / D;
  ctx.save(); cam(ctx, { x: W / 2 + wob(t, .7, 1) * 14 - 12 + 24 * u, y: H / 2 + 36 - 40 * u, z: lerp(1.0, 1.34, E.io2(u)), r: -.035 + .03 * u });
  b_polaBG(ctx, t, u, 11);
  drawPolaroid(ctx, W / 2, 560, 1.72, -.05 + Math.sin(t * 1.4) * .012, { t, fade: 0 });
  ctx.restore();
  fxParticles(ctx, t, 'dust', { x: 0, y: 0, w: W, h: H }, { n: 60, seed: 3, a: .8, col: '255,200,140' });
  b_dark(ctx, .6 * (1 - seg(L, 0, .55)));        // dip de energia em 24 s
  b_post(ctx, { bloom: .16, vig: .7 });
}
function b_s_dobrado(ctx, t, L, D) {
  const u = L / D, sh = shakeV(t, 7 * (1 - u), 30, 4), pz = b_pls(t);
  ctx.save(); cam(ctx, { x: W / 2 + sh[0] - (u - .5) * 70, y: H / 2 + sh[1], z: 1.2 - u * .14 + .04 * pz, r: .07 * (1 - u) - .025 });
  const X = [-300, 1020];
  // noite inteira, dia recortado na diagonal
  ctx.fillStyle = lg(ctx, 0, -300, 0, 1500, [[0, '#0c0e3c'], [.6, '#2a2468'], [1, '#3a2a7a']]); ctx.fillRect(X[0], -300, X[1] - X[0], 1900);
  fxParticles(ctx, t, 'dust', { x: 380, y: 0, w: 640, h: 1000 }, { n: 40, seed: 5, a: .6, col: '190,200,255', clip: false });
  ctx.save(); ctx.beginPath(); ctx.moveTo(X[0], -300); ctx.lineTo(500, -300); ctx.lineTo(230, 1500); ctx.lineTo(X[0], 1500); ctx.closePath(); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, -300, 0, 1300, [[0, '#ffd27a'], [.5, '#ff9a50'], [1, '#c2503a']]); ctx.fillRect(X[0], -300, 900, 1900);
  drawSun(ctx, 120, 600, 110, { t, glow: 1.1, rayA: .22 });
  ctx.fillStyle = 'rgba(40,10,10,.55)'; ctx.fillRect(X[0], 930, 800, 600);
  ctx.restore();
  // linha da divisão
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,230,170,.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(500, -300); ctx.lineTo(230, 1500); ctx.stroke(); ctx.strokeStyle = 'rgba(255,200,120,.25)'; ctx.lineWidth = 30; ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(8,6,20,.85)'; ctx.fillRect(380, 930, 640, 600);
  // relógios
  drawClock(ctx, 150, 215, 92, t, { h: t * 1.1, m: t * 13, sec: t * 70, glow: .9 });
  drawClock(ctx, 570, 200, 92, t, { h: 5 + t * 1.1, m: t * 13, sec: t * 70, glow: .6, col: '#1a1a30' });
  // duas mães (dois turnos)
  const ph = t * 7.5;
  drawSil(ctx, 150, 930, 100, walkPose(ph, 10), { who: 'mae', t, rim: { col: '#fff0c0' }, amb: '#5a2a20', seed: 2 });
  drawSil(ctx, 570, 930, 100, walkPose(ph + 1.1, 18), { who: 'mae', t: t + 1, rim: { col: '#8fb0ff', a: .9 }, amb: '#2a2a6a', seed: 4, alpha: .98 });
  ctx.restore();
  speedLines(ctx, W / 2, H / 2, t, { n: 24, r0: 300, r1: 900, a: .35 * (1 - u), seed: 9 });
  b_post(ctx, { bloom: .2, vig: .6 });
}
function b_s_pola2(ctx, t, L, D) {
  const u = L / D, fade = clamp((t - 25.45) / .52), tC = 25.62;
  const cx = lerp(250, 360, E.io2(u)), cy = lerp(600, 560, E.io2(u));
  ctx.save(); cam(ctx, { x: cx + wob(t, .8, 3) * 10, y: cy, z: lerp(1.65, 1.02, E.out3(u)), r: .03 * (1 - u) });
  b_polaBG(ctx, t, u, 17);
  drawPolaroid(ctx, W / 2, 560, 1.72, -.05 + Math.sin(t * 1.4) * .012, { t, fade });
  // pedacinhos de papel ao vento
  if (fade > 0) {
    const R = rng(71); ctx.save();
    for (let i = 0; i < 46; i++) {
      const t0 = 25.45 + R() * .5, a = (t - t0); if (a < 0) { R(); R(); R(); R(); continue; }
      const sx = 160 + R() * 110, sy = 440 + R() * 330, vx = -(90 + R() * 260), vy = -(30 + R() * 130), r0 = 2 + R() * 4.5;
      const px = sx + vx * a + Math.sin(a * 5 + i) * 10, py = sy + vy * a + a * a * 20, al = clamp(1 - a / 1.2);
      ctx.save(); ctx.translate(px, py); ctx.rotate(a * (3 + i % 4) + i); ctx.globalAlpha = al; ctx.fillStyle = i % 3 ? '#2a1818' : '#e8d8b0'; ctx.fillRect(-r0, -r0 * .6, r0 * 2, r0 * 1.2); ctx.restore();
    }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 200, 590, 0, 260, [[0, `rgba(255,190,120,${.35 * Math.sin(fade * Math.PI)})`], [1, 'rgba(255,190,120,0)']]); ctx.fillRect(-100, 300, 600, 600); ctx.restore();
  }
  // pipa: presa por uma linha, depois solta e voa para longe
  let kx, ky, kr;
  if (t < tC) { kx = 520 + Math.sin(t * 2) * 8; ky = 330 + Math.sin(t * 1.7) * 10; kr = -.4 + Math.sin(t * 2.3) * .06; drawKite(ctx, kx, ky, 1.25, kr, t, { anchor: { x: 470, y: 1180 }, sag: .02, glow: true }); }
  else { const q = (t - tC) / .78; kx = 520 - 760 * E.in2(q) - 40 * q; ky = 330 - 420 * E.in2(q) + Math.sin(q * 6) * 14; kr = -.4 - q * 1.2; drawKite(ctx, kx, ky, 1.25 - q * .4, kr, t, { cut: true, lineLen: 320, glow: true }); }
  ctx.restore();
  b_dark(ctx, 0);
  b_post(ctx, { bloom: .16, vig: .72 });
}

/* ============================================================
   26.4–28.9  escadaria — peso
   ============================================================ */
var B_ST = { t0: 26.4, step: .375, sw: 92, sh: 64, x0: -300, y0: 1300, k0: 3, n: 26 };
function b_stairHero(t) {
  const S = B_ST, pp = Math.max(0, (t - S.t0) / S.step), k = Math.floor(pp), f = pp - k, idx = S.k0 + k;
  const yy = E.out2(seg(f, .1, .55)), xx = E.io2(seg(f, .35, .86));
  const x = S.x0 + S.sw * (idx + .5) + S.sw * xx, y = S.y0 - S.sh * (idx + 1) - S.sh * yy - 7 * Math.sin(Math.PI * seg(f, .1, .86));
  const imp = f > .86 ? (f - .86) / .14 * .5 : Math.exp(-f * 9) * .6 + (f > .86 ? 0 : 0);
  return { x, y, pp, k, f, idx, imp, ph: Math.PI * pp + .4 };
}
function b_stairs(ctx, x, y, n, sw, sh, t) {
  const M = wrMood(2), col = mix(mix(M.tint, '#2c2a3c', .55), M.fog, .1), ex = x + n * sw, ey = y - n * sh, steps = [];
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, y + 4); for (let k = 0; k < n; k++) { ctx.lineTo(x + k * sw, y - (k + 1) * sh); ctx.lineTo(x + (k + 1) * sw, y - (k + 1) * sh); } ctx.lineTo(ex, y + 4000); ctx.lineTo(x, y + 4000); ctx.closePath();
  ctx.fillStyle = lg(ctx, x, ey, ex, y + 600, [[0, mix(col, '#ffffff', .08)], [1, mix(col, '#000000', .55)]]); ctx.fill();
  ctx.save(); ctx.clip();
  for (let k = 0; k < n; k++) {
    const sx = x + k * sw, sy = y - (k + 1) * sh;
    ctx.fillStyle = 'rgba(255,200,140,.6)'; ctx.fillRect(sx, sy, sw + 1, 4);
    ctx.fillStyle = lg(ctx, sx, sy, sx, sy + sh, [[0, 'rgba(0,0,0,.34)'], [.3, 'rgba(0,0,0,.1)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(sx, sy + 4, sw, sh);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(sx, sy + 4, 4, sh);
    ctx.fillStyle = 'rgba(255,170,110,.06)'; ctx.fillRect(sx + 4, sy + 4, 2, sh);
  }
  ctx.restore();
  // corrimão + postes com lâmpada
  const rc = wrSilCol(M, .15); ctx.strokeStyle = rc; ctx.lineCap = 'round'; ctx.lineWidth = 6;
  for (let k = 0; k < n; k++) { const px = x + k * sw + sw * .3, py = y - (k + 1) * sh; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 96); ctx.stroke(); }
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + sw * .3, y - sh - 96); ctx.lineTo(ex - sw * .7, ey - 96 + sh); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,140,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + sw * .3, y - sh - 98); ctx.lineTo(ex - sw * .7, ey - 98 + sh); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 4; k < n; k += 5) { const px = x + k * sw + sw * .3, py = y - (k + 1) * sh - 250; ctx.fillStyle = rc; ctx.fillRect(px - 3, py, 6, 154); ctx.fillStyle = rg(ctx, px, py, 0, 150, [[0, 'rgba(255,200,120,.5)'], [1, 'rgba(255,170,90,0)']]); ctx.fillRect(px - 150, py - 150, 300, 300); }
  ctx.restore();
}
function b_rock(ctx, cx, cy, R, t, imp, rot) {
  const r = rng(33), pts = [], n = 13;
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = R * (.84 + .2 * r()); pts.push([Math.cos(a) * rr, Math.sin(a) * rr * .92]); }
  ctx.save(); ctx.translate(cx, cy + 7 * imp); ctx.rotate(rot); ctx.scale(1 + .03 * imp, 1 - .045 * imp);
  ctx.fillStyle = 'rgba(255,190,120,.9)'; poly(ctx, pts); ctx.fill();                       // rim quente
  ctx.save(); poly(ctx, pts); ctx.clip(); ctx.translate(-5, 6); ctx.fillStyle = lg(ctx, -R, -R, R, R, [[0, '#1e1a2c'], [.5, '#0f0d1a'], [1, '#07060d']]); poly(ctx, pts); ctx.fill(); ctx.restore();
  ctx.save(); poly(ctx, pts); ctx.clip();
  // facetas
  ctx.strokeStyle = 'rgba(80,70,110,.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < n; i += 2) { ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[(i + 5) % n][0] * .2, pts[(i + 5) % n][1] * .2); ctx.stroke(); }
  // rachaduras de ouro
  ctx.globalCompositeOperation = 'lighter'; const q = .35 + .5 * imp + .1 * Math.sin(t * 4);
  for (let i = 0; i < 4; i++) {
    const a0 = i * 1.7 + .6; ctx.beginPath(); let px = Math.cos(a0) * R * .1, py = Math.sin(a0) * R * .1; ctx.moveTo(px, py); const rr = rng(i * 9 + 4);
    for (let j = 0; j < 7; j++) { px += Math.cos(a0 + (rr() - .5) * 1.3) * R * .14; py += Math.sin(a0 + (rr() - .5) * 1.3) * R * .14; ctx.lineTo(px, py); }
    ctx.strokeStyle = `rgba(255,150,40,${q * .35})`; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = `rgba(255,220,130,${q})`; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore(); ctx.restore();
}
function b_stairsScene(ctx, t, L, D, P) {
  const u = L / D, H0 = b_stairHero(t), S = B_ST, s = 66;
  const eff = .6 + .5 * u + (P.eff || 0), pose0 = carryPose(H0.ph, eff), cl = climbPose(H0.ph, .9);
  const pose = Object.assign({}, pose0, { lR: cl.lR, lL: cl.lL }); pose.sq = (pose.sq || 0) + .09 * H0.imp;
  const sh = shakeV(t, 3 + 5 * H0.imp * P.shk, 26, 2);
  const cxp = H0.x + P.ox, cyp = H0.y - P.oy;
  // céu e cidade (tela)
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + (P.z - 1) * .35, r: P.r * .6 });
  drawSky(ctx, 2, t, { hy: 900, cam: cxp });
  drawSun(ctx, 120 - cxp * .02, 640, 120, { t, glow: .8, rayA: .12 });
  drawSkyline(ctx, cxp, 1040, 2, { t, camY: cyp - 900, lit: .8, hillH: 520 });
  ctx.restore();
  ctx.save(); cam(ctx, { x: cxp + sh[0], y: cyp + sh[1], z: P.z, r: P.r });
  b_stairs(ctx, S.x0, S.y0, S.n, S.sw, S.sh, t);
  // poeira por degrau
  for (let j = Math.max(0, H0.k - 3); j <= H0.k + 1; j++) {
    const tc = S.t0 + (j + .88) * S.step, idx = S.k0 + j, fx = S.x0 + S.sw * (idx + 1.02), fy = S.y0 - S.sh * (idx + 1);
    dustPuff(ctx, fx - 16, fy, tc, t, { size: 22, n: 8, dir: -1, col: '230,190,160', dur: .7, seed: j + 3, a: .5 });
  }
  // peso
  const neck = charPt(H0.x, H0.y, s, pose, 'neck', { rim: 1 });
  const R = 2.3 * s, rcx = neck[0] - 1.05 * s - 2 * Math.sin(t * 30) * H0.imp, rcy = neck[1] - 1.05 * s;
  b_rock(ctx, rcx, rcy, R, t, H0.imp, -.12 + .03 * Math.sin(t * 5) + .02 * H0.imp);
  // lascas que caem
  { const rr = rng(8); ctx.save(); ctx.fillStyle = '#1a1626'; for (let i = 0; i < 10; i++) { const t0 = S.t0 + Math.floor((t - S.t0) / S.step) * S.step - i * .12; const a = t - (t0 + .1); if (a < 0 || a > .8) { rr(); rr(); continue; } ctx.fillRect(rcx + (rr() - .5) * R * 1.4 - 2, rcy + R * .6 + a * a * 420 - 2 + rr() * 8, 4, 4); } ctx.restore(); }
  drawHero(ctx, H0.x, H0.y, s, pose, { t, rim: { col: '#ffc890', dx: -1, dy: -.5, a: 1 }, sweat: .9, squash: .02, cap: true });
  // linhas de esforço
  if (H0.imp > .12) { ctx.save(); ctx.strokeStyle = `rgba(255,236,210,${H0.imp * 1.1})`; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const a = -2.3 + i * .38, r0 = R * 1.12, r1 = r0 + 36 * H0.imp + 10; ctx.beginPath(); ctx.moveTo(rcx + Math.cos(a) * r0, rcy + Math.sin(a) * r0); ctx.lineTo(rcx + Math.cos(a) * r1, rcy + Math.sin(a) * r1); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
  // neblina e brasas
  fxFog(ctx, 760, 1100, '255,150,120', .16, t);
  fxParticles(ctx, t, 'dust', { x: 0, y: 150, w: W, h: 800 }, { n: 40, seed: 6, a: .55, col: '255,210,170' });
  b_dark(ctx, .5 * (1 - seg(L, 0, .22)) * 0);
  b_post(ctx, { grade: 'sunset', ga: .7, bloom: .2, vig: .62 + .08 * H0.imp });
}
function b_s_stairs1(ctx, t, L, D) { const u = L / D; b_stairsScene(ctx, t, L, D, { z: lerp(.92, 1.04, E.io2(u)), r: -.015 + .02 * u, ox: 150 - 40 * u, oy: 150 + 60 * Math.sin(u * Math.PI) - 20, eff: 0, shk: .6 }); }
function b_s_stairs2(ctx, t, L, D) { const u = L / D; b_stairsScene(ctx, t, L, D, { z: lerp(1.25, 1.62, E.io2(u)), r: .075 - .13 * u, ox: 70 - 30 * u, oy: 120 - 60 * u, eff: .5, shk: 1.3 }); }

/* ============================================================
   28.9–33.94  olhos no escuro · mãos · fé
   ============================================================ */
var B_HX = 360, B_HY = 800, B_HS = 36;
function b_void(ctx, t, o) {
  const hx = B_HX, hy = B_HY, s = B_HS;
  ctx.fillStyle = lg(ctx, 0, -500, 0, 1500, [[0, '#020208'], [.45, '#0a0510'], [.64, '#2e1020'], [.72, '#3a1626'], [.78, '#120712'], [1, '#04020a']]); ctx.fillRect(-900, -900, 2500, 2800);
  b_city(ctx, -900, 1600, hy - 20, '#0a0612', .13 * (o.cityLit == null ? 1 : o.cityLit), 5, t, '#ffb050', 150);
  ctx.fillStyle = lg(ctx, 0, hy - 20, 0, hy + 400, [[0, '#120a14'], [1, '#030206']]); ctx.fillRect(-900, hy - 20, 2500, 900);
  // brilho no chão
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = o.glow;
  ctx.fillStyle = rg(ctx, hx, hy + 6, 0, 340 * (.4 + gl), [[0, `rgba(255,190,80,${.35 * gl})`], [1, 'rgba(255,150,40,0)']]); ctx.save(); ctx.translate(hx, hy + 6); ctx.scale(1, .22); ctx.translate(-hx, -(hy + 6)); ctx.fillRect(hx - 400, hy - 400, 800, 800); ctx.restore(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, hx, hy - 120, 0, 900, [[0, `rgba(150,50,70,${.34 + .2 * gl})`], [.5, 'rgba(90,25,50,.14)'], [1, 'rgba(60,15,40,0)']]); ctx.fillRect(hx - 950, hy - 1100, 1900, 1900); ctx.restore();
  // olhos
  const chest = [hx, hy - 3.1 * s];
  if (o.eyeA > .01) drawEyeField(ctx, t, 7, 46, { x: -260, y: -140, w: 1240, h: 860 }, { target: chest, sMin: 10, sMax: 34, a: o.eyeA });
  // mãos
  const N = 9, hR = (o.dTip + 4.4 * o.handS) / .92;
  const hand = i => {
    const ang = -.3 + i * TAU / N + .22 * Math.sin(i * 2.1), rr = hR * (1 + .06 * Math.sin(t * 1.3 + i * 1.7)) * (1 + .05 * (i % 3)), wx = chest[0] + Math.cos(ang) * rr * .82, wy = chest[1] + Math.sin(ang) * rr;
    const vx = chest[0] - wx, vy = chest[1] - wy, d = Math.hypot(vx, vy) || 1, rot = Math.atan2(vx, -vy) + .06 * Math.sin(t * 2 + i), curl = clamp(o.curl + .08 * Math.sin(t * 3 + i * 2));
    drawGiantHand(ctx, wx, wy, o.handS * (.85 + .3 * ((i * 37) % 5) / 4), rot, curl, { t, seed: i + 1, arm: 5, alpha: o.handA, rim: i % 3 === 0 ? { col: '#ff9a6a', dx: -vx / d, dy: -vy / d, a: .5 * (.4 + gl) } : null, amb: '#2a1020' });
  };
  if (o.handA > .01) for (let i = 0; i < N; i++) if (i % 3) hand(i);
  // herói
  const pose = o.pose || POSE.slump;
  drawHero(ctx, hx, hy, s, pose, { t: b_two(t, 12), glow: gl, rim: [{ col: '#ffd890', dx: 0, dy: -1, a: .9 * gl }, { col: '#ff9a6a', dx: -1, dy: -.3, a: .4 }] });
  // luz do peito
  const c2 = charPt(hx, hy, s, pose, 'chest', {}); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, c2[0], c2[1], 0, 220 * gl + 20, [[0, `rgba(255,214,110,${.5 * gl})`], [1, 'rgba(255,170,50,0)']]); ctx.fillRect(c2[0] - 300, c2[1] - 300, 600, 600); ctx.restore();
  if (o.handA > .01) for (let i = 0; i < N; i += 3) hand(i);
  return c2;
}
function b_s_eyes1(ctx, t, L, D) {
  const u = L / D, e = E.io2(u);
  ctx.save(); cam(ctx, { x: 360 + wob(t, .5, 2) * 8, y: lerp(620, 690, e), z: lerp(1.0, 1.2, e), r: .03 - .045 * u });
  b_void(ctx, t, { glow: .35 + .1 * Math.sin(t * 4.5), eyeA: 1, handA: 1, dTip: lerp(270, 230, e), handS: 58, curl: .28, pose: lerpPose(POSE.cower, POSE.slump, .5) });
  ctx.restore();
  fxParticles(ctx, t, 'dust', { x: 0, y: 0, w: W, h: H }, { n: 30, seed: 8, a: .35, col: '255,200,150' });
  b_post(ctx, { bloom: .12, vig: .95 });
}
function b_s_eyes2(ctx, t, L, D) {
  const u = L / D, e = E.io3(u), gt = seg(t, 30.56, 31.15), glow = lerp(.45, 1, E.out3(gt)) + .06 * Math.sin(t * 9);
  const pose = lerpPose(POSE.slump, POSE.lookUp, E.out2(gt));
  ctx.save(); cam(ctx, { x: 360, y: lerp(690, 700, e), z: lerp(1.2, 1.6, e), r: -.015 + .03 * u });
  const c = b_void(ctx, t, { glow, eyeA: 1, handA: 1, dTip: lerp(230, 190, e), handS: 62, curl: .38, pose });
  fxShock(ctx, c[0], c[1], 30.56, t, { dur: .9, R: 520, col: '255,214,120' });
  ctx.restore();
  b_dark(ctx, 0);
  b_post(ctx, { bloom: .18 + .2 * gt, vig: .9 - .3 * gt });
}
function b_s_grab1(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), pz = b_pls(t);
  ctx.save(); cam(ctx, { x: 360 + wob(t, 6, 5) * 5 * u, y: lerp(690, 720, e), z: lerp(1.6, 1.8, e) + .02 * pz, r: .02 - .05 * u });
  const c = b_void(ctx, t, { glow: .9 + .1 * Math.sin(t * 10), eyeA: 1, handA: 1, dTip: lerp(190, 125, E.in2(u)), handS: 66, curl: lerp(.25, .6, e), pose: POSE.lookUp });
  ctx.restore();
  b_post(ctx, { bloom: .22, vig: .85 });
}
function b_s_grab2(ctx, t, L, D) {
  const u = L / D, e = E.in2(u), pz = b_pls(t), sh = shakeV(t, 4 + 8 * u, 34, 6);
  ctx.save(); cam(ctx, { x: 360 + sh[0], y: lerp(715, 735, u) + sh[1], z: lerp(1.95, 2.25, E.io2(u)), r: -.03 + .07 * u });
  b_void(ctx, t, { glow: .95 - .25 * u + .08 * Math.sin(t * 14), eyeA: 1 - .2 * u, handA: 1, dTip: lerp(125, 70, e), handS: 74, curl: lerp(.5, .88, e), pose: POSE.lookUp });
  ctx.restore();
  b_post(ctx, { bloom: .2, vig: .9 });
}
/* 33.28–33.94 — em 33.52 o brilho explode */
function b_s_burst(ctx, t, L, D) {
  const tE = 33.52, hx = B_HX, hy = B_HY, s = B_HS, u = clamp((t - tE) / .42), pre = t < tE;
  const sh = shakeV(t, pre ? 6 + 10 * seg(t, 33.28, tE) : 8 * (1 - u), 40, 9);
  const z = pre ? lerp(2.25, 2.55, seg(t, 33.28, tE)) : lerp(2.2, 1.18, E.out3(u));
  const cy = pre ? 735 : lerp(720, 640, E.out3(u));
  ctx.save(); cam(ctx, { x: 360 + sh[0], y: cy + sh[1], z, r: pre ? .04 : lerp(.04, 0, E.out3(u)) });
  const chest = [hx, hy - 3.1 * s];
  if (pre) {
    const k = seg(t, 33.28, tE);
    b_void(ctx, t, { glow: .7 + .5 * k * Math.sin(t * 40), eyeA: 1, handA: 1, dTip: lerp(70, 35, k), handS: 78, curl: lerp(.9, 1, k), pose: POSE.crouch });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, chest[0], chest[1], 0, 60 + 80 * k, [[0, `rgba(255,255,230,${.9 * k})`], [1, 'rgba(255,200,80,0)']]); ctx.fillRect(chest[0] - 200, chest[1] - 200, 400, 400); ctx.restore();
  } else {
    // amanhecer
    ctx.fillStyle = lg(ctx, 0, -600, 0, 1500, [[0, '#2e3a7a'], [.4, '#c97fa0'], [.62, '#ffb070'], [.74, '#ffe0a0'], [.76, '#3a1e2a'], [1, '#120712']]); ctx.fillRect(-900, -900, 2500, 2800);
    godRays(ctx, chest[0], chest[1], t * 1.4, { n: 16, len: 3000, a: .7 * (1 - u * .35), col: '255,226,150', w: .5, sp: .05, seed: 4 });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, chest[0], chest[1], 0, 700, [[0, 'rgba(255,240,190,.95)'], [.25, 'rgba(255,200,110,.5)'], [1, 'rgba(255,150,60,0)']]); ctx.fillRect(chest[0] - 800, chest[1] - 800, 1600, 1600); ctx.restore();
    drawSun(ctx, chest[0], chest[1] - 30, lerp(30, 120, E.out3(u)), { t, glow: 1.4, rayA: .3, nRays: 22 });
    b_city(ctx, -900, 1600, hy - 8, '#2a1424', .3, 5, t, '#ffd070', 160);
    ctx.fillStyle = '#0c0610'; ctx.fillRect(-900, hy - 8, 2500, 900);
    // mãos queimando e recuando
    const N = 9, k = E.out3(u); for (let i = 0; i < N; i++) {
      const ang = -.3 + i * TAU / N + .22 * Math.sin(i * 2.1), rr = lerp(420, 1300, k) * (1 + .06 * (i % 3)), wx = chest[0] + Math.cos(ang) * rr * .82, wy = chest[1] + Math.sin(ang) * rr;
      const vx = chest[0] - wx, vy = chest[1] - wy, rot = Math.atan2(vx, -vy) + .5 * k * (i % 2 ? 1 : -1), a = u < .6 ? 1 : 0;
      if (a > .02) { drawGiantHand(ctx, wx, wy, 78, rot, lerp(1, .1, k), { t, seed: i + 1, arm: 5, alpha: 1, rim: i % 3 === 0 ? { col: '#ffe6a0', dx: -vx / Math.hypot(vx, vy), dy: -vy / Math.hypot(vx, vy), a: 1, w: 2 } : null, amb: '#ff6a20' });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, wx, wy, 0, 190, [[0, `rgba(255,170,60,${.5 * a})`], [1, 'rgba(255,120,30,0)']]); ctx.fillRect(wx - 190, wy - 190, 380, 380); ctx.restore(); }
    }
    fxParticles(ctx, t, 'embers', { x: -300, y: -100, w: 1000, h: 1000 }, { n: 50, seed: 3, a: 1, speed: 4, clip: false });
    // herói de pé contra o sol
    const hp = lerpPose(POSE.crouch, POSE.Vup, E.out3(clamp(u * 2)));
    drawHero(ctx, hx, hy, s, hp, { t: b_two(t, 15), glow: 1, rim: [{ col: '#fff0c0', dx: 0, dy: -1, a: 1, w: 1.4 }, { col: '#ffd890', dx: -1, dy: 0, a: .8 }] });
    fxShock(ctx, chest[0], chest[1], tE, t, { dur: .55, R: 760, col: '255,230,160', w: 60 });
    fxShock(ctx, chest[0], chest[1], tE + .07, t, { dur: .5, R: 520, col: '255,170,90', w: 30 });
    fxFlare(ctx, chest[0], chest[1], 2.2 - u, { a: 1 - u * .5, col: '255,214,140' });
  }
  ctx.restore();
  if (!pre) {
    fxImpact(ctx, tE, t, { dur: .1, x: W / 2, y: H / 2 - 30 });
    flash(ctx, .85 * Math.pow(1 - clamp((t - tE - .04) / .17), 2) * (t > tE + .03 ? 1 : 0), '255,238,190');
    fxSpeed(ctx, t, { kind: 'radial', cx: W / 2, cy: H / 2 - 40, n: 50, col: '#fff3d0', a: .5 * (1 - u), r0: 180, r1: 1000, seed: 3 });
  }
  b_post(ctx, { bloom: pre ? .2 : .32, vig: pre ? .9 : .5 });
}

/* ============================================================
   33.94–37.1  corrida ao sol poente / linha de largada
   ============================================================ */
var B_RUN = { t0: 33.94, V0: 470, acc: 34, f: 2.75 };
function b_camX(t) { const a = t - B_RUN.t0; return B_RUN.V0 * a + .5 * B_RUN.acc * a * a; }
var B_LINEX = b_camX(36.6) + 300;
function b_runScene(ctx, t, L, D, P) {
  const gy = P.gy, s = P.s, cx = b_camX(t), hx = P.hx, u = L / D;
  const ph = (t - B_RUN.t0) * TAU * B_RUN.f, pose = sprintPose(ph);
  ctx.save(); cam(ctx, { x: W / 2 + (P.cx || 0), y: H / 2 + (P.cy || 0), z: P.z, r: P.r });
  drawSky(ctx, 2, t, { hy: gy - 50, sx: P.sunX, glow: 1.3 });
  drawSun(ctx, P.sunX, P.sunY, P.sunR, { t, glow: 1.5, rayA: .3, nRays: 16 });
  fxFlare(ctx, P.sunX, P.sunY, 1.1, { a: .35, col: '255,190,120', streak: .5 });
  drawSkyline(ctx, cx * .9, gy + 10, 2, { t, lit: .95, hillH: 300, camY: 0 });
  drawPoles(ctx, cx * .55, gy, { par: 1, h: 330, flags: true, mood: 2, t, gap: 380, s: .62, sag: 30 });
  drawRoofline(ctx, gy, cx, { t, mood: 2, seed: 3 });
  // faixa do chão (laje vista de cima) + linha de largada
  ctx.fillStyle = lg(ctx, 0, gy, 0, gy + 70, [[0, 'rgba(255,170,100,.34)'], [1, 'rgba(255,170,100,0)']]); ctx.fillRect(0, gy, W, 70);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let x = -(cx % 140) - 140; x < W + 140; x += 140) { ctx.beginPath(); ctx.moveTo(x, gy + 4); ctx.lineTo(x - 26, gy + 70); ctx.lineTo(x - 24, gy + 70); ctx.lineTo(x + 2, gy + 4); ctx.fill(); }
  const lx = B_LINEX - cx;
  if (lx > -200 && lx < W + 200) {
    const gate = seg(t, 35.3, 36.5) , pz = b_pls(t);
    ctx.save();
    ctx.fillStyle = '#fff4d0'; ctx.beginPath(); ctx.moveTo(lx - 15, gy + 3); ctx.lineTo(lx + 15, gy + 3); ctx.lineTo(lx + 38, gy + 70); ctx.lineTo(lx + 4, gy + 70); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8283a'; for (let k = 0; k < 4; k++) { const y0 = gy + 3 + k * 17, y1 = y0 + 8.5; ctx.beginPath(); ctx.moveTo(lx - 15 + (y0 - gy - 3) * .34, y0); ctx.lineTo(lx + 15 + (y0 - gy - 3) * .34, y0); ctx.lineTo(lx + 15 + (y1 - gy - 3) * .34, y1); ctx.lineTo(lx - 15 + (y1 - gy - 3) * .34, y1); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lg(ctx, 0, gy - 560, 0, gy, [[0, 'rgba(255,214,120,0)'], [1, `rgba(255,214,120,${.2 + .45 * gate + .1 * pz})`]]); ctx.fillRect(lx - 24 - 16 * gate, gy - 560, 48 + 32 * gate, 560);
    ctx.fillStyle = lg(ctx, lx - 80, 0, lx + 80, 0, [[0, 'rgba(255,200,90,0)'], [.5, `rgba(255,236,170,${.3 + .5 * gate})`], [1, 'rgba(255,200,90,0)']]); ctx.fillRect(lx - 80, gy - 400, 160, 400);
    ctx.restore();
  }
  // poeira dos passos
  const dt0 = Math.PI / 2 / (TAU * B_RUN.f), per = .5 / B_RUN.f;
  for (let j = Math.max(0, Math.floor((t - B_RUN.t0 - dt0) / per) - 3); j <= Math.floor((t - B_RUN.t0 - dt0) / per); j++) {
    const tc = B_RUN.t0 + dt0 + j * per; dustPuff(ctx, hx - (cx - b_camX(tc)) - 10, gy + 20, tc, t, { size: 18 + 6 * P.dust, n: 6, dir: -1, col: '255,200,150', dur: .55, seed: j % 9 + 1, a: .45 });
  }
  // herói
  const hy = gy + 18, drawH = (c, tt, info) => { const pp = sprintPose((tt - B_RUN.t0) * TAU * B_RUN.f); drawHero(c, hx - (info ? info.k * 22 : 0), hy, s, pp, { t: tt, rim: { col: '#fff0c0', dx: -1, dy: -.5, a: 1 }, flip: false }); };
  if (P.trail) drawTrail(ctx, drawH, t, P.trail, .028, { a: .38 });
  drawH(ctx, t, null);
  // pipa subindo
  const hand = charPt(hx, hy, s, pose, 'handR', {}), kq = clamp((t - 33.94) / 3.2), kx = lerp(430, 560, kq) + Math.sin(t * 1.6) * 10, ky = lerp(560, 220, E.out2(kq)) + Math.sin(t * 2.1) * 8;
  drawKite(ctx, kx, ky, 1.0, -.55 + Math.sin(t * 2) * .08, t, { anchor: { x: hand[0] + 10, y: hand[1] }, sag: .04, glow: true });
  drawPoles(ctx, cx, gy + 12, { par: 1, h: 520, flags: true, mood: 2, t, gap: 560, s: 1, sag: 40, col: '#0a0710' });
  ctx.restore();
  fxFog(ctx, gy - 80, gy + 60, '255,170,120', .18, t);
  if (P.speed) fxSpeed(ctx, t, { kind: 'dir', ang: -.08, n: 22, col: '#fff0d0', a: P.speed, thick: 3, seed: 5 });
  return { lx, cx, hy };
}
function b_s_run1(ctx, t, L, D) {
  const u = L / D; b_runScene(ctx, t, L, D, { gy: 905, s: 74, hx: lerp(230, 290, u), z: lerp(1.0, 1.1, E.io2(u)), r: -.012 + .02 * Math.sin(u * 3), cy: lerp(30, -20, u), sunX: 500, sunY: 540, sunR: 210, dust: 0, speed: .3 });
  b_post(ctx, { grade: 'sunset', ga: .5, bloom: .28, vig: .55 });
}
function b_s_run2(ctx, t, L, D) {
  const u = L / D, e = E.io2(u);
  b_runScene(ctx, t, L, D, { gy: 930, s: 78, hx: lerp(290, 300, e), z: lerp(1.12, 1.3, e), r: lerp(.02, -.04, e), cx: lerp(0, 40, e), cy: lerp(-30, -90, e), sunX: lerp(430, 380, e), sunY: 540, sunR: lerp(240, 300, e), trail: 2, dust: 1, speed: .45 });
  b_post(ctx, { grade: 'sunset', ga: .5, bloom: .34, vig: .5 });
}
function b_s_run3(ctx, t, L, D) {
  const tX = 36.6, u = L / D, a = t - tX, e = E.out3(u), sh = shakeV(t, 7 * Math.exp(-a * 5), 36, 3);
  const r = b_runScene(ctx, t, L, D, { gy: 930, s: 78, hx: 300, z: lerp(1.3, 1.05, e) + .06 * Math.exp(-a * 6), r: lerp(-.04, .02, e), cx: 40 * (1 - e) + sh[0], cy: lerp(-90, -30, e) + sh[1], sunX: 380, sunY: 540, sunR: 310, trail: 2, dust: 1.5, speed: .6 });
  const ly = 930 + 18; fxShock(ctx, 300, ly - 120, tX, t, { dur: .5, R: 620, col: '255,226,160', w: 16 });
  fxFlare(ctx, 300, ly - 220, 1.2 * Math.exp(-a * 3) + .4, { a: Math.exp(-a * 3) * .35, col: '255,210,140' });
  fxSpeed(ctx, t, { kind: 'radial', cx: 300, cy: ly - 200, n: 60, col: '#fff3d0', a: .55 * Math.exp(-a * 4), r0: 200, r1: 1000, seed: 11 });
  flash(ctx, .25 * Math.exp(-a * 14), '255,240,200');
  b_post(ctx, { grade: 'sunset', ga: .5, bloom: .42, vig: .45 });
}

/* ============================================================
   37.1–40.0  cicatrizes de ouro
   ============================================================ */
function b_torso(ctx, t, o) {
  const s = o.s, pose = Object.assign({}, POSE.stand, { lean: 0, head: -4 + 3 * Math.sin(t * .8), spread: .85 + .0, hs: .6, aR: [14, 8], aL: [-14, -8] });
  const p0 = charPt(0, 0, s, pose, 'chest', {}), x = 360 - p0[0], y = 620 - p0[1];
  const k = fxHeartbeat(ctx, t, { bpm: 72, draw: false }), cp = charPt(x, y, s, pose, 'chest', {});
  ctx.fillStyle = lg(ctx, 0, -300, 0, 1700, [[0, '#040208'], [.5, '#120810'], [1, '#2a0f10']]); ctx.fillRect(-900, -900, 2500, 3200);
  godRays(ctx, cp[0], cp[1], t, { n: 18, len: 1700, a: .13 * (.6 + .6 * k), col: '255,170,70', sp: .03, w: .35, seed: 6 });
  fxHeartbeat(ctx, t, { bpm: 72, x: cp[0], y: cp[1], R: 600, a: .9 });
  drawHero(ctx, x, y, s, pose, { t, scar: o.scar, glow: .55 + .3 * k, bpm: 72, seed: 7, rim: [{ col: '#ffb060', dx: -1, dy: -.6, a: .9 }, { col: '#ff8040', dx: 1, dy: -.2, a: .35 }], squash: .006 * k, cap: true });
  // raios dourados que escapam do peito
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const R = rng(15), nB = 11;
  for (let i = 0; i < nB; i++) {
    const ang = -Math.PI / 2 + (i - (nB - 1) / 2) * .62 + (R() - .5) * .3, len = 360 + R() * 460, gr = clamp((t - 37.2 - i * .05) * 1.3) * (o.scar > .3 ? 1 : .2), pts = [[cp[0] + Math.cos(ang) * s * .2, cp[1] + Math.sin(ang) * s * .2]];
    for (let j = 1; j <= 8; j++) { const pr = pts[j - 1], a2 = ang + (R() - .5) * .9; pts.push([pr[0] + Math.cos(a2) * len / 8, pr[1] + Math.sin(a2) * len / 8]); }
    const upto = Math.floor(gr * 8); if (upto < 1) continue;
    for (const pass of [0, 1]) { ctx.strokeStyle = pass ? `rgba(255,236,170,${.45 * (.5 + .5 * k)})` : `rgba(255,150,40,${.18 + .12 * k})`; ctx.lineWidth = pass ? 1.6 : 7; ctx.beginPath(); for (let j = 0; j <= upto; j++) j ? ctx.lineTo(pts[j][0], pts[j][1]) : ctx.moveTo(pts[j][0], pts[j][1]); ctx.stroke(); }
  }
  ctx.restore();
  return { k, cp };
}
function b_s_scar1(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), k = fxHeartbeat(ctx, t, { bpm: 72, draw: false });
  ctx.save(); cam(ctx, { x: lerp(210, 400, e), y: lerp(760, 530, e), z: lerp(1.5, 1.2, e) + .018 * k, r: .045 - .06 * u });
  b_torso(ctx, t, { s: 270, scar: .85 * seg(t, 37.15, 38.0) });
  ctx.restore();
  fxParticles(ctx, t, 'embers', { x: 0, y: 200, w: W, h: 1000 }, { n: 60, seed: 4, a: .9, speed: 1.2 });
  b_post(ctx, { bloom: .3, vig: .8 });
}
function b_s_scar2(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), k = fxHeartbeat(ctx, t, { bpm: 72, draw: false });
  ctx.save(); cam(ctx, { x: lerp(430, 330, e), y: lerp(420, 760, e), z: lerp(1.0, 1.28, e) + .015 * k, r: -.03 + .05 * u });
  b_torso(ctx, t, { s: 290, scar: .9 });
  ctx.restore();
  fxParticles(ctx, t, 'embers', { x: 0, y: 200, w: W, h: 1000 }, { n: 45, seed: 9, a: .75, speed: .8 });
  fxParticles(ctx, t, 'dust', { x: 0, y: 0, w: W, h: H }, { n: 30, seed: 2, a: .4, col: '255,190,110' });
  b_post(ctx, { bloom: .26, vig: .9 });
}

/* ============================================================
   40.0–42.6  escuridão → porta de luz → a mão
   ============================================================ */
function b_final(ctx, t, o) {
  const gy = 930;
  ctx.fillStyle = lg(ctx, 0, -300, 0, 1500, [[0, '#010106'], [.55, '#0a0716'], [.8, '#150a24'], [1, '#050310']]); ctx.fillRect(-900, -900, 2500, 3000);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 360, 800, 0, 620, [[0, 'rgba(110,90,190,.28)'], [1, 'rgba(60,40,120,0)']]); ctx.fillRect(-300, 200, 1000, 1200); ctx.restore();
  const dw = 150 * (.35 + .65 * o.door), dh = 330 * o.door, dx = 360 - dw / 2, dy = 150;
  if (o.door > .01) drawDoorLight(ctx, dx, dy, dw, Math.max(4, dh), t, { col: '255,236,190', a: .55 + .45 * o.door, coneLen: 640 + 160 * o.door, spread: 3.2 });
  ctx.fillStyle = lg(ctx, 0, gy, 0, gy + 300, [[0, '#0c0818'], [1, '#020108']]); ctx.fillRect(-900, gy, 2500, 900);
  if (o.door > .01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 360, gy + 5, 0, 330, [[0, `rgba(255,226,170,${.35 * o.door})`], [1, 'rgba(255,200,120,0)']]); ctx.save(); ctx.translate(360, gy + 5); ctx.scale(1, .2); ctx.translate(-360, -(gy + 5)); ctx.fillRect(-100, gy - 400, 900, 800); ctx.restore(); ctx.restore(); }
  const s = 74, pose = o.pose;
  drawHero(ctx, 360 + (o.hdx || 0), gy, s, pose, { t: b_two(t, 12), glow: o.glow, rim: [{ col: '#fff0d0', dx: 0, dy: -1, a: o.door * .95 }, { col: '#ffc060', dx: -1, dy: -.3, a: .3 }] });
  const c = charPt(360 + (o.hdx || 0), gy, s, pose, 'chest', {});
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, c[0], c[1], 0, 130, [[0, `rgba(255,200,90,${.4 * o.glow})`], [1, 'rgba(255,160,40,0)']]); ctx.fillRect(c[0] - 150, c[1] - 150, 300, 300); ctx.restore();
  return c;
}
function b_s_dark(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), pose = slKeys([[0, POSE.fallFlat], [.5, POSE.fallFlat], [1, POSE.hands2knees]], u);
  pose.ph = 0; pose.lean += .8 * Math.sin(t * 2.1);
  ctx.save(); cam(ctx, { x: lerp(300, 345, e), y: lerp(640, 760, e), z: lerp(1.35, 1.0, E.out2(u)), r: .035 - .035 * u });
  b_final(ctx, t, { door: seg(t, 41.0, 41.3) * .15, glow: .3 + .1 * Math.sin(t * 5), pose, hdx: -60 });
  ctx.restore();
  fxParticles(ctx, t, 'starrain', { x: 0, y: 0, w: W, h: H }, { n: 34, seed: 2, a: .33, speed: .45 });
  fxParticles(ctx, t, 'dust', { x: 0, y: 0, w: W, h: H }, { n: 50, seed: 7, a: .6, col: '255,230,170' });
  b_post(ctx, { bloom: .14, vig: .92 });
}
function b_s_door(ctx, t, L, D) {
  const u = L / D, door = E.out3(seg(t, 41.2, 41.85)), ru = E.io2(seg(t, 41.25, 42.1)), pose = risePose(.28 + ru * .7);
  ctx.save(); cam(ctx, { x: 360, y: lerp(760, 560, E.io2(u)), z: lerp(1.0, .95, u) + .02 * door, r: -.025 + .03 * u });
  b_final(ctx, t, { door: .15 + .85 * door, glow: .3 + .35 * ru, pose, hdx: lerp(-60, 0, ru) });
  ctx.restore();
  fxParticles(ctx, t, 'starrain', { x: 0, y: 0, w: W, h: H }, { n: 30, seed: 3, a: .3 * (1 - door * .5), speed: .45 });
  fxParticles(ctx, t, 'dust', { x: 0, y: 0, w: W, h: H }, { n: 50, seed: 8, a: .6, col: '255,236,190' });
  flash(ctx, .35 * Math.exp(-(t - 41.2) * 9) * (t > 41.2 ? 1 : 0), '255,244,210');
  b_post(ctx, { bloom: .2 + .15 * door, vig: .85 - .25 * door });
}
function b_s_reach(ctx, t, L, D) {
  const u = L / D, ru = E.out2(seg(t, 42.1, 42.4)), pose = reachUp(ru), grow = E.in2(seg(t, 42.18, 42.6));
  ctx.save(); cam(ctx, { x: 360, y: lerp(600, 480, E.io2(u)), z: lerp(1.0, 1.22, E.in2(u)), r: .02 - .03 * u });
  const c = b_final(ctx, t, { door: 1, glow: .7 + .3 * ru, pose, hdx: 0 });
  const hp = charPt(360, 930, 74, pose, 'handR', {});
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, hp[0], hp[1], 0, 90, [[0, `rgba(255,255,230,${.9 * ru})`], [1, 'rgba(255,220,150,0)']]); ctx.fillRect(hp[0] - 100, hp[1] - 100, 200, 200); ctx.restore();
  fxShock(ctx, hp[0], hp[1], 42.3, t, { dur: .3, R: 340, col: '255,236,190' });
  ctx.restore();
  // a luz cresce e quase engole o quadro
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const R0 = lerp(200, 1700, grow), cy = lerp(300, 420, grow);
  ctx.fillStyle = rg(ctx, W / 2, cy, 0, R0, [[0, `rgba(255,248,232,${.8 * grow + .06})`], [.55, `rgba(255,226,170,${.48 * grow})`], [1, 'rgba(255,200,130,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  b_dark(ctx, 0);
  fxParticles(ctx, t, 'dust', { x: 0, y: 0, w: W, h: H }, { n: 50, seed: 8, a: .7, col: '255,240,200' });
  flash(ctx, .1 * grow, '255,246,226');
  b_post(ctx, { bloom: .3 + .2 * grow, vig: .6 - .45 * grow });
}

/* ============================================================
   montagem
   ============================================================ */
var SCENES_B = [
  { t0: 24.00, t1: 24.70, name: 'b_pola1', fn: b_s_pola1 },
  { t0: 24.70, t1: 25.18, name: 'b_dobrado', fn: b_s_dobrado },
  { t0: 25.18, t1: 26.40, name: 'b_pola2', fn: b_s_pola2 },
  { t0: 26.40, t1: 27.66, name: 'b_stairs1', fn: b_s_stairs1 },
  { t0: 27.66, t1: 28.90, name: 'b_stairs2', fn: b_s_stairs2 },
  { t0: 28.90, t1: 30.50, name: 'b_eyes1', fn: b_s_eyes1 },
  { t0: 30.50, t1: 31.30, name: 'b_eyes2', fn: b_s_eyes2 },
  { t0: 31.30, t1: 32.50, name: 'b_grab1', fn: b_s_grab1 },
  { t0: 32.50, t1: 33.28, name: 'b_grab2', fn: b_s_grab2 },
  { t0: 33.28, t1: 33.94, name: 'b_burst', fn: b_s_burst },
  { t0: 33.94, t1: 35.50, name: 'b_run1', fn: b_s_run1 },
  { t0: 35.50, t1: 36.60, name: 'b_run2', fn: b_s_run2 },
  { t0: 36.60, t1: 37.10, name: 'b_run3', fn: b_s_run3 },
  { t0: 37.10, t1: 38.50, name: 'b_scar1', fn: b_s_scar1 },
  { t0: 38.50, t1: 40.00, name: 'b_scar2', fn: b_s_scar2 },
  { t0: 40.00, t1: 41.20, name: 'b_dark', fn: b_s_dark },
  { t0: 41.20, t1: 42.10, name: 'b_door', fn: b_s_door },
  { t0: 42.10, t1: 42.60, name: 'b_reach', fn: b_s_reach },
];
var IMPACTS_B = [
  { t: 24.70, d: .08, type: 'flash' },
  { t: 25.45, d: .10, type: 'flash' },
  { t: 28.88, d: .06, type: 'invert' },
  { t: 37.14, d: .06, type: 'flash' },
];
