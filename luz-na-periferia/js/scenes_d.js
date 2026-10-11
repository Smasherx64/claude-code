'use strict';
/* ============================================================
   scenes_d.js — VERSO 2 (66.7 → 80.0 s), pôr do sol rosa-roxo
   queda/levanta (montagem) · corda bamba sobre o vazio · mão ao sol velado / sem sinal · linha neon → escada de luz → estrela
   Tudo determinístico. Prefixo d_ / D_.  Mundo: laje (chão) em y=900; câmera = cam(ctx,{x,y,z,r}).
   ============================================================ */

var D_HR = { rim: [{ col: '#ffc48a', dx: -1, dy: -.5, a: .95 }, { col: '#ff6ab8', dx: 1, dy: -.2, a: .45, w: .8 }], amb: '#7a3a70', ambA: .28 };
function d_hero(ctx, x, y, s, pose, o) { const q = {}; for (const k in D_HR) q[k] = D_HR[k]; if (o) for (const k in o) q[k] = o[k]; drawHero(ctx, x, y, s, pose, q); }
function d_two(t) { return Math.floor(t * 12 + 1e-6) / 12; }         // animação "on twos" (12 fps)
function d_ez(u) { return E.io2(clamp(u)); }

/* câmera por chaves [t,x,y,z,r] (spline cardinal suave) */
function d_kf(t, k) {
  const n = k.length; if (t <= k[0][0]) return { x: k[0][1], y: k[0][2], z: k[0][3], r: k[0][4] || 0 };
  if (t >= k[n - 1][0]) { const b = k[n - 1]; return { x: b[1], y: b[2], z: b[3], r: b[4] || 0 }; }
  let i = 0; while (i < n - 2 && t > k[i + 1][0]) i++;
  const a = k[i], b = k[i + 1], p0 = k[Math.max(0, i - 1)], p3 = k[Math.min(n - 1, i + 2)], u = (t - a[0]) / (b[0] - a[0]), o = {};
  [['x', 1], ['y', 2], ['z', 3], ['r', 4]].forEach(([nm, j]) => {
    const v1 = a[j] || 0, v2 = b[j] || 0, v0 = p0[j] || 0, v3 = p3[j] || 0, m1 = (v2 - v0) * .5 * (b[0] - a[0]) / ((b[0] - p0[0]) || 1) * (i === 0 ? 0 : 1), m2 = (v3 - v1) * .5 * (b[0] - a[0]) / ((p3[0] - a[0]) || 1) * (i === n - 2 ? 0 : 1);
    const u2 = u * u, u3 = u2 * u; o[nm] = (2 * u3 - 3 * u2 + 1) * v1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * v2 + (u3 - u2) * m2;
  });
  return o;
}
function d_view(c, pad) { const z = c.z || 1, hw = 360 / z * (pad || 1.35), hh = 640 / z * (pad || 1.35); return { x0: c.x - hw, x1: c.x + hw, y0: c.y - hh, y1: c.y + hh }; }
function d_s2w(c, sx, sy) { return [c.x + (sx - 360) / c.z, c.y + (sy - 640) / c.z]; }

/* fundo em tela: céu + sol + cidade em camadas.  o: T (y de tela da base da cidade), mood, sx, sy, sunR, sunGlow, rayA, veil */
function d_bg(ctx, t, c, o) {
  o = o || {}; const z = c.z || 1, r = c.r || 0, zb = Math.max(1, 1 + (z - 1) * .5) * (1 + Math.abs(r) * 1.3);
  const T0 = o.T != null ? o.T : 640 + (1010 - c.y) * z, yb = 640 + (T0 - 640) / zb, mood = o.mood == null ? 2 : o.mood;
  ctx.save(); ctx.translate(360, 640); ctx.rotate(r); ctx.scale(zb, zb); ctx.translate(-360, -640);
  drawSky(ctx, mood, t, { hy: clamp(yb - 60, 300, 1100), cam: c.x, clouds: o.clouds == null ? 1 : o.clouds, glow: o.skyGlow == null ? 1 : o.skyGlow, sx: o.sx == null ? 130 : o.sx });
  const sx = o.sx == null ? 130 - (c.x - 360) * .05 : o.sx, sy = o.sy == null ? yb - 150 : o.sy;
  if (o.sun !== false) drawSun(ctx, sx, sy, o.sunR || 60, { t, glow: o.sunGlow == null ? 1 : o.sunGlow, rayA: o.rayA == null ? .24 : o.rayA, col: o.sunCol || '255,196,150', nRays: o.nRays || 16 });
  if (o.after) o.after(ctx, sx, sy);
  const info = drawSkyline(ctx, c.x - 360, yb, mood, { t, seed: o.seed || 7, hillH: o.hillH || 520, haze: o.haze == null ? 1 : o.haze, beat: o.beat });
  ctx.restore();
  const m = Math.cos(r) * zb, n = Math.sin(r) * zb;
  const toS = (x, y) => [360 + (x - 360) * m - (y - 640) * n, 640 + (x - 360) * n + (y - 640) * m];
  return { yb, zb, sun: toS(sx, sy), toS, info };
}
function d_bgW(ctx, t, c, o) { return d_bg(ctx, t, c, o); }

/* chão de laje largo em mundo */
function d_roof(ctx, y, t, o) {
  o = o || {}; const x0 = o.x0 == null ? -400 : o.x0, x1 = o.x1 == null ? 1120 : o.x1;
  ctx.save(); ctx.fillStyle = '#0d0716'; ctx.fillRect(x0 - 200, y + 120, x1 - x0 + 400, 2400); ctx.restore();
  for (let k = Math.floor(x0 / 720); k <= Math.floor((x1 - 1) / 720); k++) { ctx.save(); ctx.translate(k * 720, 0); drawRoofline(ctx, y, k * 720, { t, mood: o.mood == null ? 2 : o.mood, seed: o.seed || 3, s: o.s || 1 }); ctx.restore(); }
}

/* torre / laje alta (para a corda bamba): bloco de prédio com janelas acesas. side: -1 esquerda (borda direita em xb), 1 direita */
function d_tower(ctx, xa, xb, top, t, seed, v, o) {
  o = o || {}; const bot = top + 3200, rim = o.rim || 'rgba(255,190,140,.75)';
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, top, 0, top + 2400, [[0, '#33193f'], [.35, '#22112f'], [1, '#0a0612']]); ctx.fillRect(xa, top, xb - xa, bot - top);
  // luz do poente na quina voltada ao vazio
  const edge = o.side < 0 ? xb : xa; ctx.fillStyle = rim; ctx.fillRect(o.side < 0 ? xb - 3 : xa, top, 3, 2600);
  ctx.fillStyle = lg(ctx, o.side < 0 ? xb - 60 : xa + 60, 0, edge, 0, [[0, 'rgba(255,150,120,0)'], [1, 'rgba(255,150,120,.2)']]); ctx.fillRect(o.side < 0 ? xb - 60 : xa, top, 60, 2600);
  ctx.fillStyle = rim; ctx.fillRect(xa, top - 2, xb - xa, 3);
  ctx.fillStyle = 'rgba(255,170,130,.12)'; ctx.fillRect(xa, top, xb - xa, 22);
  // janelas
  const cw = 38, chh = 52, y0 = Math.max(top + 70, v.y0), y1 = Math.min(bot, v.y1 + 60), x0 = Math.max(xa + 16, v.x0 - 40), x1 = Math.min(xb - 16, v.x1 + 40);
  const WC = ['#ffd25a', '#ffe08a', '#ffb347', '#fff0c0', '#ff9a4a'];
  for (let j = Math.floor((y0 - top) / chh); j * chh + top < y1; j++) {
    const yy = top + j * chh, fa = clamp(1 - (yy - top) / 1700, .12, 1);
    for (let i = Math.floor((x0 - xa) / cw); xa + i * cw < x1; i++) {
      const h = hash2(i, j, seed); if (h > .36) { continue; }
      const xx = xa + i * cw, on = h < .2 || Math.sin(t * (.4 + h * 3) + h * 99) > -.2;
      ctx.globalAlpha = (on ? .9 : .25) * fa; ctx.fillStyle = WC[(h * 100 | 0) % 5]; ctx.fillRect(xx, yy, 15, 21);
    }
  }
  ctx.globalAlpha = 1; ctx.restore();
}
function d_tops(ctx, xa, xb, top, seed, side) { // coisas em cima da laje: caixa d'água, antena, varal
  const R = rng(seed * 17 + 3), col = '#120a1e';
  ctx.save();
  const tx = side < 0 ? xb - 190 : xa + 90;
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tx - 30, top); ctx.lineTo(tx - 26, top - 52); ctx.moveTo(tx + 30, top); ctx.lineTo(tx + 26, top - 52); ctx.stroke(); rrect(ctx, tx - 40, top - 112, 80, 62, 12); ctx.fill(); ctx.fillRect(tx - 44, top - 118, 88, 9);
  ctx.fillStyle = 'rgba(255,190,140,.55)'; ctx.fillRect(side < 0 ? tx + 36 : tx - 40, top - 108, 3, 54);
  const ax = side < 0 ? xb - 60 : xa + 36; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, top - 170); for (let k = 0; k < 4; k++) { ctx.moveTo(ax - 34 + k * 5, top - 170 + k * 22); ctx.lineTo(ax + 34 - k * 5, top - 170 + k * 22); } ctx.stroke();
  ctx.restore();
}
function d_flags(ctx, x0, y0, x1, y1, sag, t, seed, a) {
  const cols = ['#ffd24a', '#ff6a8a', '#6ac8ff', '#fff0d0', '#7affb0'], cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + sag * 2;
  ctx.save(); ctx.globalAlpha = a == null ? 1 : a; ctx.strokeStyle = 'rgba(30,12,40,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
  for (let u = .04; u < .97; u += .036) {
    const px = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1, py = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1, w = 7 + Math.sin(t * 5 + u * 40 + seed) * 2.2, h = 17 + Math.sin(t * 4 + u * 31) * 3.5;
    ctx.fillStyle = mix(cols[(u * 120 | 0) % 5], '#3a2050', .35); ctx.beginPath(); ctx.moveTo(px - 7, py); ctx.lineTo(px + 7, py); ctx.lineTo(px + w * .3, py + h); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function d_birds(ctx, t, n, seed, box, o) {
  o = o || {}; const sp = o.speed || 60, col = o.col || '#1b0b28', sc = o.s || 1;
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const R = rng(seed * 101 + i * 13 + 5), per = box.w + 400, ph = R() * per, x = box.x + ((ph + t * sp * (.7 + R() * .6)) % per) - 200, y = box.y + R() * box.h + Math.sin(t * .8 + i * 2) * 14, fl = Math.sin(t * (9 + R() * 4) + i * 3), s = (9 + R() * 8) * sc;
    ctx.lineWidth = Math.max(1.4, s * .17); ctx.beginPath(); ctx.moveTo(x - s, y - fl * s * .7 + s * .2); ctx.quadraticCurveTo(x - s * .45, y - s * .38 - fl * s * .3, x, y); ctx.quadraticCurveTo(x + s * .45, y - s * .38 - fl * s * .3, x + s, y - fl * s * .7 + s * .2); ctx.stroke();
  }
  ctx.restore();
}
function d_wind(ctx, t, seed, a, ang) { // fiapos de vento em tela
  const n = 14; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const R = rng(seed * 57 + i * 7), per = .9 + R() * .9, q = ((t + R() * per) % per) / per, y = 80 + R() * 880, x = -220 + q * 1200, L = 90 + R() * 200, al = Math.sin(q * Math.PI) * a * (.4 + R() * .6);
    ctx.strokeStyle = `rgba(255,214,190,${al})`; ctx.lineWidth = 1 + R() * 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - L * .5, y + Math.sin(q * 9 + i) * 8, x - L, y + (ang || 0) * L); ctx.stroke();
  }
  ctx.restore();
}
function d_net(ctx, x, y, s, rot, t, seed, a) { // rede de circo rasgada
  const cols = 9, rows = 7, R = rng(seed * 29 + 1), V = [];
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = a == null ? 1 : a;
  for (let j = 0; j <= rows; j++) { V[j] = []; for (let i = 0; i <= cols; i++) { const wv = Math.sin(t * 2.2 + i * .7 + j * .5) * 7, torn = (i + j * 2 + seed) % 7 === 3 || R() < .08 || (j > 4 && R() < .3); V[j][i] = { x: (i - cols / 2) * 36 + (R() - .5) * 8 + wv, y: (j - rows / 2) * 36 + (R() - .5) * 8 + Math.sin(t * 1.7 + i) * 6 + Math.pow((i - cols / 2) / 5, 2) * 14, ok: !torn }; } }
  ctx.lineCap = 'round';
  const pass = (lw, col) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) { const p = V[j][i]; if (!p.ok) continue; if (i < cols && V[j][i + 1].ok) { ctx.moveTo(p.x, p.y); ctx.lineTo(V[j][i + 1].x, V[j][i + 1].y); } if (j < rows && V[j + 1][i].ok) { ctx.moveTo(p.x, p.y); ctx.lineTo(V[j + 1][i].x, V[j + 1][i].y); } else if (j < rows && !V[j + 1][i].ok && p.ok) { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.sin(t * 3 + i) * 6, p.y + 30 + (i % 3) * 12); } } ctx.stroke(); };
  pass(7, 'rgba(30,10,40,.9)'); pass(3.6, 'rgba(255,205,170,.9)');
  ctx.restore();
}

/* pós-processamento em pixels (depois do restore da câmera) */
function d_post(ctx, o) {
  o = o || {}; if (o.grade) fxGrade(ctx, 'sunset', o.grade); if (o.bloom) fxBloom(ctx, o.bloom, o.blur || 10); if (o.vig) fxVignette(ctx, o.vig, o.vigCol || '28,6,44');
}
function d_fadeIn(ctx, L) { // preto rápido → clarão quente → pôr do sol
  const k = 1 - sstep(.0, .3, L); if (k > .004) flash(ctx, k, '4,2,10'); const f = Math.max(0, 1 - Math.abs(L - .34) / .16); if (f > 0 && L > .26) flash(ctx, .28 * f, '255,236,214');
}
function d_walkTo(t0, ph0) { return (t0 - ph0) * 9.5; }
function d_flatShock(ctx, x, y, ti, t, R, col) { ctx.save(); ctx.translate(x, y); ctx.scale(1, .24); ctx.globalAlpha = .55; fxShock(ctx, 0, 0, ti, t, { R: (R || 280) * .75, w: 16, dur: .5, col: col || '255,176,140' }); ctx.restore(); }

/* =====================  1) QUEDAS (montagem)  66.7 – 69.42  ===================== */
function d_fallPoseAt(t, ts, TF, tr, TR, walkPh) {
  const q = d_two(t);
  if (t < ts) return walkPose(walkPh + q * 10, 6);
  const u = (t - ts) / TF;
  if (t < tr) { const p = lerpPose(walkPose(walkPh + ts * 10, 6), fallPose(u), sstep(0, .14, u)); return p; }
  return risePose(clamp((q - tr) / TR));
}

function d_s1(ctx, t, L) {
  const ts = 66.86, TF = .62, ti = ts + TF * .76, tr = 67.34;
  const c = d_kf(t, [[66.7, 250, 800, 1.75, -.09], [67.2, 330, 790, 1.55, -.04], [67.72, 420, 800, 1.42, .04]]), k = t > ti ? Math.exp(-(t - ti) * 7) : 0, sk = shakeV(t, 18 * k, 30, 3);
  c.x += sk[0]; c.y += sk[1]; c.z *= 1 + .03 * k;
  const bg = d_bg(ctx, t, c, { seed: 5, beat: beatInfo(t).pulse });
  ctx.save(); cam(ctx, c);
  d_roof(ctx, 900, t, { seed: 3, x0: -200, x1: 1000 });
  const hx = 250 + 70 * E.out2(seg(t, 66.7, ti)) + 26 * seg(t, ti, tr + 1.2), pose = d_fallPoseAt(t, ts, TF, tr, 1.5, 0);
  const crawl = t > tr ? 1 : 0;
  d_hero(ctx, hx, 900, 54, pose, { t: d_two(t), sweat: t > ti ? .9 : .35, shadowA: .5 });
  if (t > ti) { dustPuff(ctx, hx + 70, 900, ti, t, { size: 46, n: 12, col: '236,170,150', ring: true, a: .75, dur: 1.1, seed: 2 }); d_flatShock(ctx, hx + 60, 900, ti, t, 300); }
  ctx.restore();
  fxParticles(ctx, t, 'dust', { x: 0, y: 200, w: 720, h: 800 }, { n: 40, seed: 3, a: .6, speed: 3 });
  d_post(ctx, { grade: .38, bloom: .22, vig: .55 });
  fxFlare(ctx, bg.sun[0], bg.sun[1], .8, { a: .45, ghosts: false, col: '255,170,150' });
  d_fadeIn(ctx, L);
}

function d_s2(ctx, t, L) {
  const ts = 67.76, TF = .5, ti = ts + TF * .76, sw = 92, sh = 64, n = 8, x0 = 60, y0 = 1010, ang = Math.atan2(sh, sw);
  const c = d_kf(t, [[67.72, 470, 640, 1.15, .34], [68.1, 460, 700, 1.45, .22], [68.46, 400, 760, 1.7, .1]]), k = t > ti ? Math.exp(-(t - ti) * 8) : 0, shk = shakeV(t, 16 * k, 32, 9);
  c.x += shk[0]; c.y += shk[1];
  const bg = d_bg(ctx, t, c, { seed: 8, T: 760 - (c.y - 640) * 1.1 + 160, sx: 560, sy: 470, rayA: .2, beat: beatInfo(t).pulse });
  ctx.save(); cam(ctx, c);
  ctx.fillStyle = '#0d0716'; ctx.fillRect(-500, y0 + 4, 2000, 1400);
  const steps = drawStairs(ctx, x0, y0, n, { sw, sh, mood: 2, rail: true, col: '#4a2552' });
  const stp = steps[3], u = clamp((t - ts) / TF), q = d_two(t);
  const hx = stp.x + 20 + 40 * E.out2(u) * (t < ti + .1 ? 1 : 1), hy = stp.y - 64 * (E.in2(u) > .6 ? .5 : 0) * 0;
  const pose = t < ts ? POSE.hunch : (t < 68.3 ? fallPose(u) : lerpPose(fallFlat(), risePose(clamp((q - 68.3) / 1.1)), 1));
  const rot = -ang * sstep(.3, .75, u) * (t < 68.3 ? 1 : 1 - sstep(68.3, 68.46, t) * .0);
  d_hero(ctx, hx, hy, 52, pose, { t: q, rot: rot, sweat: .9, shadow: false });
  if (t > ti) { dustPuff(ctx, hx + 90, stp.y - 60, ti, t, { size: 40, n: 11, col: '236,170,150', ring: false, a: .75, dur: 1.0, seed: 4 }); }
  ctx.restore();
  d_post(ctx, { grade: .38, bloom: .2, vig: .6 });
  if (t > ti && t < ti + .12) flash(ctx, .35 * (1 - (t - ti) / .12), '255,230,210');
}
function fallFlat() { return POSE.fallFlat; }

function d_s3(ctx, t, L) {
  const ts = 68.28, TF = .32, ti = ts + TF * .76, tr = 68.7, TR = .72;
  const c = d_kf(t, [[68.46, 380, 905, 1.95, .07], [69.0, 365, 800, 1.55, .02], [69.42, 360, 700, 1.3, -.02]]), k = t > ti ? Math.exp(-(t - ti) * 9) : 0, shk = shakeV(t, 20 * k, 30, 5);
  c.x += shk[0]; c.y += shk[1];
  const bg = d_bg(ctx, t, c, { seed: 6, T: 1000 - (c.y - 700) * 1.4, sx: 370, sy: 500 - (c.y - 800) * .3, sunR: 78, rayA: .3, sunGlow: 1.2, nRays: 20, beat: beatInfo(t).pulse });
  ctx.save(); cam(ctx, c);
  d_roof(ctx, 900, t, { seed: 11, x0: -200, x1: 1000 });
  const q = d_two(t), u = (t - ts) / TF;
  let pose; if (t < tr) pose = fallPose(clamp(u)); else pose = risePose(clamp((q - tr) / TR));
  const hx = 340 + 40 * E.out2(clamp(u)) ;
  d_hero(ctx, hx, 900, 52, pose, { t: q, sweat: 1, shadowA: .6 });
  if (t > ti) { dustPuff(ctx, hx + 50, 900, ti, t, { size: 52, n: 14, col: '240,176,150', ring: true, a: .8, dur: 1.2, seed: 6 }); d_flatShock(ctx, hx + 40, 900, ti, t, 340); }
  ctx.restore();
  fxParticles(ctx, t, 'dust', { x: 0, y: 300, w: 720, h: 700 }, { n: 45, seed: 5, a: .7, speed: 3 });
  d_post(ctx, { grade: .35, bloom: .3, vig: .55 });
  fxFlare(ctx, bg.sun[0], bg.sun[1], 1.1, { a: .5 * clamp(.5 + (t - 68.46) * 1.2), ghosts: true, col: '255,180,140' });
}

/* =====================  2) CORDA BAMBA  69.42 – 72.88  ===================== */
var D_RY = 600;
function d_ropeScene(ctx, t, c, o) {
  const bg = d_bg(ctx, t, c, { seed: 9, T: o.T, sx: o.sx == null ? 90 : o.sx, sy: o.sy, sunR: 58, rayA: .26, hillH: 560, haze: 1.9, beat: beatInfo(t).pulse });
  const v = d_view(c, 1.5);
  ctx.save(); cam(ctx, c);
  // vazio: névoa do abismo entre as torres
  ctx.fillStyle = lg(ctx, 0, D_RY + 80, 0, D_RY + 1700, [[0, 'rgba(255,150,170,0)'], [.1, 'rgba(210,110,170,.5)'], [.4, 'rgba(100,44,126,.84)'], [1, 'rgba(36,14,56,.97)']]); ctx.fillRect(-200, D_RY + 80, 1120, 2200);
  if (o.flags !== false) { d_flags(ctx, -60, D_RY - 330, 780, D_RY - 400, 34, t, 2, .75); d_flags(ctx, -60, D_RY - 250, 780, D_RY - 270, 40, t + 2, 5, .6); }
  d_birds(ctx, t, o.birds == null ? 6 : o.birds, 3, { x: -100, y: D_RY - 380, w: 900, h: 300 }, { speed: 55, s: 1.1 });
  if (o.net) { const nt = o.net; d_net(ctx, nt.x, nt.y, nt.s, nt.rot, t, 4, nt.a); }
  d_tower(ctx, -1300, 40, D_RY, t, 3, v, { side: -1 }); d_tower(ctx, 680, 2000, D_RY + 6, t, 8, v, { side: 1 });
  d_tops(ctx, -1300, 40, D_RY, 1, -1); d_tops(ctx, 680, 2000, D_RY + 6, 2, 1);
  const rp = drawTightrope(ctx, 40, D_RY, 680, D_RY + 6, t, { sag: 20, sway: 1, mood: 2, vib: o.vib || 0 });
  const hx = 360 + Math.sin(t * .9) * 12, hy = rp.yAt(hx) - 1, q = d_two(t), look = o.look == null ? 0 : o.look, pose = balancePose(q, o.nerv == null ? .55 : o.nerv);
  pose.head += -look * 34; pose.lean += look < 0 ? 8 * -look : 0;
  if (o.ghost) drawTrail(ctx, (g, tt) => { const p2 = balancePose(d_two(tt), .8); d_hero(g, hx, hy, o.s || 34, p2, { t: tt, shadow: false }); }, t, 3, .05, { a: .25, col: '#ff9ac8', comp: 'lighter' });
  d_hero(ctx, hx, hy, o.s || 34, pose, { t: q, shadow: false });
  ctx.restore();
  d_wind(ctx, t, o.seed || 1, .35, -.05);
  return { bg, hx, hy, rp };
}
function d_s4a(ctx, t, L) { // 69.42–70.38 plano geral
  const c = d_kf(t, [[69.42, 300, 640, .92, -.05], [70.38, 350, 620, 1.12, .02]]);
  c.x += Math.sin(t * 1.3) * 6; c.y += Math.cos(t * 1.1) * 5;
  const r = d_ropeScene(ctx, t, c, { T: 1330, s: 36, seed: 2, ghost: false });
  d_post(ctx, { grade: .35, bloom: .25, vig: .55 });
  fxFlare(ctx, r.bg.sun[0], r.bg.sun[1], .8, { a: .4, ghosts: false, col: '255,170,150' });
}
function d_s4b(ctx, t, L) { // 70.38–71.74 tilt para baixo: o vazio, nenhuma rede
  const u = d_ez(seg(t, 70.38, 71.5)), c = d_kf(t, [[70.38, 350, 620, 1.12, .02], [71.0, 360, 900, 1.0, -.03], [71.74, 360, 1180, .9, -.06]]);
  const nu = seg(t, 70.5, 71.9), net = { x: 300 + nu * 120 + Math.sin(t * 1.4) * 14, y: 1000 + nu * 800, s: lerp(2.3, 1.1, nu), rot: -.5 + nu * 2.2, a: .95 * (1 - nu * .55) };
  c.x += Math.sin(t * 1.3) * 4;
  const r = d_ropeScene(ctx, t, c, { T: lerp(1330, 700, u), look: -1 * sstep(70.38, 70.65, t), nerv: .8, s: 36, net, seed: 3, birds: 3 });
  fxFog(ctx, 520, 1180, '120,60,130', .35 * u, t);
  d_post(ctx, { grade: .35, bloom: .2, vig: .62 });
}
function d_s4c(ctx, t, L) { // 71.74–72.88 close: pés e braços; em "destino" ergue o olhar
  const c = d_kf(t, [[71.74, 350, D_RY - 10, 2.4, .05], [72.3, 352, D_RY - 70, 2.1, .0], [72.88, 360, D_RY - 260, 1.5, -.035]]);
  const sk = shakeV(t, 3, 14, 4); c.x += sk[0]; c.y += sk[1];
  const look = -1 + 2 * sstep(72.38, 72.7, t);
  const r = d_ropeScene(ctx, t, c, { T: lerp(700, 1000, seg(t, 71.74, 72.88)), look: Math.min(look, 1), nerv: .9, s: 52, seed: 4, birds: 2, vib: 4 * Math.exp(-(t - 71.74) * 2), flags: false });
  d_post(ctx, { grade: .35, bloom: .28, vig: .6 });
}

/* =====================  3) SINAL QUE NUNCA VEIO  72.88 – 75.94  ===================== */
function d_skyVeil(ctx, t, sx, sy, k, emb) {
  drawEmblem(ctx, sx, sy, 50, t, { a: emb, rays: false, flare: false, glow: .35 * emb });
  drawCloudBand(ctx, sy - 30, t, { col: '#9a4a86', hi: '#ffb890', a: .7 * k, speed: 14, scale: 1.9, n: 4, h: 20, seed: 12, sq: .5 });
  drawCloudBand(ctx, sy + 40, t, { col: '#8a3f78', hi: '#ffa890', a: .62 * k, speed: 9, scale: 1.5, n: 4, h: 24, seed: 4, sq: .45 });
  ctx.save(); ctx.fillStyle = rg(ctx, sx, sy, 10, 150, [[0, 'rgba(240,150,190,' + (.5 * k) + ')'], [.6, 'rgba(240,150,190,' + (.3 * k) + ')'], [1, 'rgba(255,170,170,0)']]); ctx.fillRect(sx - 200, sy - 200, 400, 400); ctx.restore();
}
function d_s5a(ctx, t, L) { // 72.88–74.2 contra-plongée: herói alcança o sol velado
  const sx = 480, sy = 290, c = d_kf(t, [[72.88, 300, 800, 1.05, -.05], [74.2, 320, 740, 1.2, .035]]);
  const bg = d_bg(ctx, t, c, { seed: 4, T: 1060, sx, sy, sunR: 60, sunGlow: .55, rayA: .2, nRays: 18, after: (g, x, y) => { d_skyVeil(g, t, x, y, 1, .5 * sstep(73.0, 73.9, t)); } });
  ctx.save(); cam(ctx, c);
  d_roof(ctx, 960, t, { seed: 13, x0: -300, x1: 1100 });
  const u = d_ez(seg(t, 72.95, 73.9)), q = d_two(t), tg = d_s2w(c, bg.sun[0], bg.sun[1]);
  const pose = reachUp(u); const hx = 230, s = 98;
  if (u > .2) { const sp = charPt(hx, 960, s, pose, 'shoulderR', { flip: false }), a = Math.atan2(tg[0] - sp[0], tg[1] - sp[1]) * 180 / Math.PI; const ar = lerp(pose.aR[0], a, .9); pose.aR = [ar, ar + 6]; pose.aRs = 1.06; }
  d_hero(ctx, hx, 960, s, pose, { t: q, sweat: .4, shadowA: .5 });
  ctx.restore();
  fxParticles(ctx, t, 'dust', { x: 0, y: 100, w: 720, h: 900 }, { n: 30, seed: 7, a: .45, speed: 4 });
  d_wind(ctx, t, 6, .25, -.03);
  d_post(ctx, { grade: .3, bloom: .25, vig: .6 });
  fxFlare(ctx, bg.sun[0], bg.sun[1], .8, { a: .3, ghosts: false, col: '255,180,170' });
}
function d_s5b(ctx, t, L) { // 74.2–75.94 close da mão; celular sem sinal; a mão cai devagar
  const fall = sstep(75.2, 75.94, t), c = d_kf(t, [[74.2, 340, 700, 1.0, .02], [75.2, 350, 690, 1.06, .0], [75.94, 350, 760, 1.0, -.02]]);
  const sx = 470 - (c.x - 340) * .6, sy = 300 + fall * 40, dim = 1 - fall * .55;
  const bg = d_bg(ctx, t, c, { seed: 4, T: 1060 + fall * 40, sx, sy, sunR: 64, sunGlow: .72 * dim, rayA: .2 * dim, nRays: 18, skyGlow: dim, after: (g, x, y) => { d_skyVeil(g, t, x, y, 1 + fall * .5, .42 * (1 - sstep(75.15, 75.7, t))); } });
  const rise = d_ez(seg(t, 74.2, 75.1)), hy = lerp(1180, 600, rise) + fall * 260 + Math.sin(t * 21) * 2.4 * (1 - fall) * rise, hx = 345 + Math.sin(t * 3) * 3 * rise + fall * -30;
  const curl = .0 + fall * .55 + .05 * Math.sin(t * 5) * rise, rot = -.06 + fall * .3 + Math.sin(t * 2.2) * .02;
  drawGiantHand(ctx, hx, hy, 74, rot, curl, { t: t * .8, arm: 6, rim: [{ col: '#ffc48a', dx: -1, dy: -.4, a: .9 }, { col: '#ff6ab8', dx: 1, dy: -.1, a: .4 }], amb: '#7a3a70', seed: 3 });
  // celular 'sem sinal' passando em primeiro plano
  const pu = seg(t, 74.05, 75.0);
  if (pu > 0 && pu < 1) { const px = lerp(700, 90, E.io2(pu)), py = 820 + Math.sin(pu * 3) * 50 - pu * 120, pr = .4 + pu * 1.1; ctx.save(); ctx.globalAlpha = Math.min(1, Math.sin(pu * Math.PI) * 1.6); drawPhone(ctx, px, py, 1.15, pr, { t, msg: 'Sem sinal' }); ctx.restore(); }
  d_wind(ctx, t, 11, .35 + fall * .2, -.06);
  fxParticles(ctx, t, 'dust', { x: 0, y: 100, w: 720, h: 900 }, { n: 26, seed: 9, a: .4, speed: 5 });
  d_post(ctx, { grade: .3 * dim, bloom: .22, vig: .6 + fall * .3, vigCol: '24,6,40' });
  fxFlare(ctx, bg.sun[0], bg.sun[1], .7, { a: .28 * dim, ghosts: false, col: '255,180,170' });
}

/* =====================  4) A LINHA DE LUZ  75.94 – 79.3  ===================== */
var D_HX = 230, D_GY = 900;
var D_PATH = [[272, 896], [380, 856], [274, 814], [384, 772], [278, 730], [392, 688],           // rabisco junto ao herói
  [170, 560], [560, 440], [170, 320], [560, 200], [170, 80], [560, -40], [170, -160], [560, -280], [170, -400], [560, -520], [360, -640]];
var D_PL = null;
function d_pathInit() {
  if (D_PL) return D_PL; const cum = [0]; for (let i = 1; i < D_PATH.length; i++) cum.push(cum[i - 1] + Math.hypot(D_PATH[i][0] - D_PATH[i - 1][0], D_PATH[i][1] - D_PATH[i - 1][1]));
  return (D_PL = { cum, tot: cum[cum.length - 1], sq: cum[5] });
}
function d_pathAt(s) { // posição + inclinação por comprimento de arco
  const P = d_pathInit(); s = clamp(s, 0, P.tot); let i = 1; while (i < P.cum.length - 1 && P.cum[i] < s) i++;
  const a = D_PATH[i - 1], b = D_PATH[i], u = (s - P.cum[i - 1]) / ((P.cum[i] - P.cum[i - 1]) || 1);
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), dx: b[0] - a[0], dy: b[1] - a[1] };
}
function d_tip(t) { // comprimento do traço desenhado
  const P = d_pathInit(); if (t < 76.15) return 0;
  if (t < 77.3) return P.sq * d_ez(seg(t, 76.15, 77.3));
  return lerp(P.sq, P.tot, E.io2(seg(t, 77.3, 78.66)) * .4 + E.out3(seg(t, 77.3, 78.66)) * .6);
}
function d_heroS(t) { const P = d_pathInit(), u = clamp((t - 77.42) / 1.82); return P.tot * (u * u * .4 + u * .6); }
function d_starScr(ctx, t, c, a) { // estrela-bússola no alto (fixa no céu; "aproxima" conforme a câmera sobe)
  const WY = -930, z = c.z, wy = 640 + (WY - c.y) * z, pin = 190, Rw = 190 * z, d = Math.max(0, pin - wy);
  const sy = Math.max(wy, pin), R = Rw * (.2 + .8 * Math.exp(-d / 800));
  drawEmblem(ctx, 360 + (360 - c.x) * .15, sy, R, t, { a: a == null ? 1 : a, glow: 1, rays: R > 40, spin: .0 });
  return { y: sy, R };
}
function d_sparks(ctx, t, s0, s1, n, seed) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const R = rng(seed * 131 + i * 17 + Math.floor(t * 30) * 7), s = s0 - R() * 340, p = d_pathAt(s), age = R(), x = p.x + (R() - .5) * 26 + age * -18 * Math.sign(p.dx || 1), y = p.y + (R() - .5) * 18 - age * 34 + age * age * 40, r = 1.4 + R() * 3.2;
    ctx.fillStyle = `rgba(255,${190 + R() * 60 | 0},${90 + R() * 80 | 0},${(1 - age) * .9})`; ctx.fillRect(x - r / 2, y - r / 2, r, r); if (R() < .3) wrSpark(ctx, x, y, r * 2.4, (1 - age));
  }
  ctx.restore();
}
function d_ticks(ctx, t, tipL) { // degraus de luz: pontos ao longo do traço
  const P = d_pathInit(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let s = 30; s < tipL; s += 34) { const p = d_pathAt(s), m = Math.hypot(p.dx, p.dy) || 1, nx = -p.dy / m, ny = p.dx / m, a = .5 * (1 - clamp((tipL - s) / 1.0 * 0 + 0)) * (.6 + .4 * Math.sin(t * 6 + s * .05)); ctx.strokeStyle = `rgba(255,214,120,${a * .6})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x - nx * 3, p.y - ny * 3); ctx.lineTo(p.x + nx * 14, p.y + ny * 14); ctx.stroke(); }
  ctx.restore();
}
function d_neon(ctx, t, tipL) { const P = d_pathInit(); return drawNeonPath(ctx, D_PATH, clamp(tipL / P.tot), t, { w: 5.5, glow: 1.15 }); }

function d_s6a(ctx, t, L) { // 75.94–77.30: o herói risca a linha de luz no ar
  const c = d_kf(t, [[75.94, 300, 760, 1.0, -.03], [76.6, 320, 730, 1.15, .0], [77.3, 340, 700, 1.3, .04]]);
  const bg = d_bg(ctx, t, c, { seed: 4, mood: 1.8, T: 1100 - (c.y - 700) * .8, beat: beatInfo(t).pulse });
  d_starScr(ctx, t, c, clamp(.5 + (t - 75.94)));
  ctx.save(); cam(ctx, c);
  d_roof(ctx, D_GY, t, { seed: 17, x0: -300, x1: 1100, mood: 1.8 });
  const tip = d_tip(t), q = d_two(t), tp = d_pathAt(tip), sUp = d_ez(seg(t, 76.0, 76.9));
  let pose = lerpPose(POSE.crouch, POSE.stand, sUp); if (t < 76.0) pose = lerpPose(POSE.slump, POSE.crouch, d_ez(seg(t, 75.94, 76.0)));
  if (tip > 0) { const sp = charPt(D_HX, D_GY, 70, pose, 'shoulderR', {}), a = Math.atan2(tp.x - sp[0], tp.y - sp[1]) * 180 / Math.PI; pose.aR = [a, a + 4]; pose.hR = 'point'; pose.lean += 8; pose.head = -14; }
  d_hero(ctx, D_HX, D_GY, 70, pose, { t: q, glow: .55 * sstep(76.1, 76.8, t), sweat: .3, shadowA: .5 });
  d_ticks(ctx, t, tip); d_neon(ctx, t, tip);
  if (tip > 0 && tip < d_pathInit().sq) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const R = rng(Math.floor(t * 24)); for (let i = 0; i < 10; i++) { const a = R() * TAU, d = 6 + R() * 40; ctx.fillStyle = `rgba(255,${200 + R() * 55 | 0},120,${R()})`; ctx.fillRect(tp.x + Math.cos(a) * d, tp.y + Math.sin(a) * d, 2.5, 2.5); } ctx.restore(); }
  ctx.restore();
  fxParticles(ctx, t, 'fireflies', { x: 0, y: 250, w: 720, h: 650 }, { n: 22, seed: 4, a: .6, col: '255,214,120' });
  d_post(ctx, { grade: .3, bloom: .3, vig: .55 });
  fxFlare(ctx, bg.sun[0], bg.sun[1], .7, { a: .3, ghosts: false, col: '255,160,160' });
}
function d_s6b(ctx, t, L) { // 77.30–79.30: crane seguindo a linha; ele sobe correndo
  const hs = d_heroS(t), hp = d_pathAt(hs), tip = d_tip(t), P = d_pathInit();
  const sm = d_pathAt(d_heroS(t - .12)), lead = d_pathAt(Math.min(P.tot, hs + 260));
  const c = { x: 360 + (sm.x - 360) * .3 + Math.sin(t * 2.3) * 4, y: sm.y - 200 + (lead.y - sm.y) * .35, z: lerp(1.28, .82, d_ez(seg(t, 77.3, 79.0))), r: -.05 * Math.sin((t - 77.3) * 1.7) + .02 };
  const bg = d_bg(ctx, t, c, { seed: 4, mood: lerp(1.8, 1.55, seg(t, 77.3, 79.3)), T: 1100 + (Math.max(0, 900 - sm.y)) * .9, beat: beatInfo(t).pulse, sunGlow: .9 });
  const st = d_starScr(ctx, t, c, 1);
  ctx.save(); cam(ctx, c);
  if (c.y > 100) d_roof(ctx, D_GY, t, { seed: 17, x0: -300, x1: 1100, mood: 1.8 });
  d_ticks(ctx, t, tip); d_neon(ctx, t, tip);
  const q = t, dir = hp.dx >= 0 ? 1 : -1, slope = Math.atan2(hp.dy, Math.abs(hp.dx)) * dir * (dir > 0 ? 1 : -1) * (dir > 0 ? 1 : 1);
  const run = hs > 6 && hs < P.tot - 4, ph = hs / 34;
  const pose = run ? sprintPose(ph) : POSE.cheer; const rot = Math.atan(hp.dy / (hp.dx || 1));
  if (run) drawTrail(ctx, (g, tt) => { const p = d_pathAt(d_heroS(tt)); d_hero(g, p.x, p.y, 40, sprintPose(d_heroS(tt) / 34), { flip: p.dx < 0, rot: Math.atan(p.dy / (p.dx || 1)), t: tt, shadow: false, cap: true }); }, t, 2, .05, { a: .4, col: '#ffc060', comp: 'lighter' });
  d_hero(ctx, hp.x, hp.y, 40, pose, { flip: dir < 0, rot: run ? rot : 0, t, shadow: false, glow: .5 });
  if (run) d_sparks(ctx, t, hs, hs, 26, 2);
  ctx.restore();
  if (hs > 10 && hs < P.tot) fxSpeed(ctx, t, { kind: 'radial', cx: 360, cy: 700, n: 26, a: .22, r0: 330, r1: 1100, seed: 3, thick: 5 });
  d_post(ctx, { grade: .25, bloom: .32, vig: .55 });
  if (st.R > 30) fxFlare(ctx, 360, st.y, st.R / 190 * .9, { a: .55 * clamp(st.R / 120), ghosts: true, col: '255,230,200' });
}
function d_s7(ctx, t, L, D) { // 79.3–80.0: plano aberto silencioso
  const u = seg(t, 79.3, 80.0), e = E.io2(u), fin = D_PATH[D_PATH.length - 1];
  const c = { x: lerp(360, 360, e), y: lerp(-760, -380, E.out2(u)), z: lerp(.82, .5, E.out2(u)), r: 0 };
  const bg = d_bg(ctx, t, c, { seed: 4, mood: 1.55, T: lerp(1480, 1130, E.out2(u)), sunGlow: 1, beat: 0 });
  const st = d_starScr(ctx, t, c, 1);
  ctx.save(); cam(ctx, c);
  d_roof(ctx, D_GY, t, { seed: 17, x0: -700, x1: 1400, mood: 1.8 });
  d_ticks(ctx, t, 1e9); d_neon(ctx, t, d_pathInit().tot);
  const hx = fin[0], hy = fin[1], q = d_two(t);
  const pose = lerpPose(POSE.cheer, POSE.Vup, .5 + .5 * Math.sin(t * 3));
  d_hero(ctx, hx, hy, 40, POSE.lookUp, { t: q, glow: .7, shadow: false });
  drawKite(ctx, hx + 190, hy - 190 + Math.sin(t * 1.6) * 8, .9, .35 + Math.sin(t * 1.2) * .08, t, { anchor: { x: hx + 12, y: hy - 150 }, tail: 140, glow: true, sag: .03 });
  ctx.restore();
  fxParticles(ctx, t, 'fireflies', { x: 0, y: 200, w: 720, h: 900 }, { n: 28, seed: 6, a: .7, col: '255,214,120' });
  d_post(ctx, { grade: .25, bloom: .3, vig: .5 + .38 * sstep(79.74, 80.0, t) });
  fxFlare(ctx, 360, st.y, st.R / 190 * .8, { a: .5, ghosts: false, col: '255,230,200' });
}

var SCENES_D = [
  { t0: 66.70, t1: 67.72, name: 'd_queda_laje', fn: d_s1 },
  { t0: 67.72, t1: 68.46, name: 'd_queda_escada', fn: d_s2 },
  { t0: 68.46, t1: 69.42, name: 'd_queda_rua_levanta', fn: d_s3 },
  { t0: 69.42, t1: 70.38, name: 'd_corda_geral', fn: d_s4a },
  { t0: 70.38, t1: 71.74, name: 'd_corda_vazio', fn: d_s4b },
  { t0: 71.74, t1: 72.88, name: 'd_corda_pes', fn: d_s4c },
  { t0: 72.88, t1: 74.20, name: 'd_ceu_alcanca', fn: d_s5a },
  { t0: 74.20, t1: 75.94, name: 'd_mao_sem_sinal', fn: d_s5b },
  { t0: 75.94, t1: 77.30, name: 'd_risca_linha', fn: d_s6a },
  { t0: 77.30, t1: 79.30, name: 'd_escada_de_luz', fn: d_s6b },
  { t0: 79.30, t1: 80.00, name: 'd_final_aberto', fn: d_s7 },
];
var IMPACTS_D = [{ t: 77.30, d: .1, type: 'flash' }];
