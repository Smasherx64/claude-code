'use strict';
/* ============================================================
   scenes_f.js — VERSO 3 (rap curto e forte)  91.28 -> 102.4
   cerca -> estrelas · pipa além do céu · giz/formatura · build da cicatriz
   ============================================================ */
const F_GOLD = '255,194,77';
const f_tw = t => Math.floor(t * 12) / 12;                       // "on twos"
const f_hero = (ctx, x, y, s, pose, t, o = {}) => drawChar(ctx, x, y, s, pose, Object.assign({ who: 'hero', t: f_tw(t), scar: 1, wind: 1 }, o));
function f_world(ctx, t, camX, y0, mood, o = {}) {
  drawQuebrada(ctx, camX, y0, mood, Object.assign({ t }, o));
  if (o.ground !== false) drawBecoGround(ctx, y0, mood, camX);
}
function f_glow(ctx, x, y, r, a = 1, col = F_GOLD) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, `rgba(${col},${a})`], [.4, `rgba(${col},${a * .35})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
/* ---------- cerca de arame farpado que vira estrelas ---------- */
function f_fence(ctx, x0, x1, yb, h, t, p, o = {}) {
  const step = 30, wires = 4, r = rng(o.seed || 9), nx = Math.ceil((x1 - x0) / step);
  const post = 120, pa = 1 - clamp(p * 1.6);
  const wy = (i, x) => yb - h * (.1 + i * .27) + Math.sin((x - x0) / post * Math.PI) * 5;
  ctx.save(); ctx.lineCap = 'round';
  if (pa > .01) {
    for (let x = x0; x <= x1; x += post) {
      ctx.save(); ctx.globalAlpha *= pa; ctx.translate(x, yb);
      ctx.fillStyle = lg(ctx, -7, 0, 7, 0, [[0, '#3b4650'], [.6, '#26303a'], [1, '#161c24']]); ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-5, -h - 30); ctx.lineTo(5, -h - 30); ctx.lineTo(6, 6); ctx.fill();
      ctx.fillStyle = 'rgba(150,200,220,.35)'; ctx.fillRect(-6, -h - 30, 2, h + 34);
      ctx.strokeStyle = '#4d5a66'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -h - 28); ctx.lineTo(22, -h - 48); ctx.moveTo(0, -h - 14); ctx.lineTo(22, -h - 34); ctx.stroke();
      ctx.restore();
    }
  }
  const stars = [];
  for (let i = 0; i < wires; i++) {
    let prev = null;
    for (let j = 0; j <= nx; j++) {
      const x = x0 + j * step, rr = rng(i * 977 + j * 31 + 5), order = (x - x0) / (x1 - x0) * .45 + rr() * .2;
      const q = clamp((p * 1.35 - order) / .55), y = wy(i, x);
      const sx = x + Math.sin(q * 5 + j) * 26 * q, sy = y - E.out2(q) * (140 + rr() * 260) - q * q * 160;
      const node = { x: sx, y: sy, q, base: [x, y], rr: rr() };
      if (prev && q < .98 && prev.q < .98) {
        ctx.globalAlpha = (1 - Math.max(q, prev.q)); ctx.strokeStyle = '#a9b6c2'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(sx, sy); ctx.stroke();
        ctx.globalAlpha *= 1; ctx.globalAlpha = 1 - Math.max(q, prev.q);
        if (j % 1 === 0 && q < .02) { ctx.strokeStyle = '#7e8a96'; ctx.lineWidth = 1.2; ctx.beginPath(); const bx = (x + prev.x) / 2, by = (sy + prev.y) / 2; ctx.moveTo(bx - 4, by - 4); ctx.lineTo(bx + 4, by + 4); ctx.moveTo(bx + 4, by - 4); ctx.lineTo(bx - 4, by + 4); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      if (q > .02 && sy > -60 && sx > -40 && sx < W + 40) stars.push(node);
      prev = node;
    }
  }
  ctx.restore();
  // estrelinhas + linhas de constelação
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 1; k < stars.length; k++) {
    const a = stars[k - 1], b = stars[k]; if (Math.abs(a.base[1] - b.base[1]) > 3 || Math.abs(a.x - b.x) > 60) continue;
    ctx.strokeStyle = `rgba(${F_GOLD},${.45 * Math.min(a.q, b.q) * (1 - clamp((p - .85) / .15))})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
  for (const s of stars) { const sz = (4 + s.rr * 9) * (o.big ? 1.35 : 1) * Math.min(1, s.q * 3); sparkle(ctx, s.x, s.y, sz, t * 2 + s.rr * 6, s.rr > .6 ? '#fff4c8' : '#ffd36b'); if (s.rr > .55) f_glow(ctx, s.x, s.y, sz * 4, .5); }
}
/* ---------- pipa que sobe até o espaço: coordenadas de altitude ---------- */
const F_KITE_ALT = u => 360 + 4300 * E.io2(clamp(u));
function f_skyColor(a) { // a = altitude do ponto
  const k = clamp(a / 3600), c = k < .35 ? mix('#0e3a52', '#17206a', k / .35) : mix('#17206a', '#05030f', clamp((k - .35) / .65));
  return c;
}
function f_climb(ctx, t, u, o = {}) {
  const cam0 = F_KITE_ALT(u) - 372 + 20, tt = f_tw(t);
  const sy = a => 690 + cam0 - a;            // altitude -> y de tela
  ctx.save();
  const zOut = o.zoom || 1;
  if (zOut !== 1) { ctx.translate(W / 2, 330); ctx.scale(zOut, zOut); ctx.translate(-W / 2, -330); }
  // céu em gradiente por altitude
  const aTop = cam0 + 690 + 300, aBot = cam0 - 30;
  ctx.fillStyle = lg(ctx, 0, -300, 0, 720, [[0, f_skyColor(aTop)], [.5, f_skyColor((aTop + aBot) / 2)], [1, f_skyColor(aBot)]]); ctx.fillRect(-500, -400, W + 1000, H + 800);
  const sa = sstep(100, 2400, cam0);
  // nebulosa
  if (sa > .05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .5 * sa; drawNebula(ctx, -100, -100, W + 200, H + 200, { z: 1.4, ox: 80 + cam0 * .04 }); ctx.restore(); }
  // estrelas (paralaxe por profundidade)
  const rs = rng(77);
  for (let i = 0; i < 190; i++) {
    const d = .25 + rs() * .75, a = 300 + rs() * 5200, x = rs() * W, sz = .8 + rs() * 2.2 * d, ph = rs() * 9;
    const y = 360 + (cam0 - a) * d * .8 + 200; if (y < -10 || y > 730) continue;
    const al = clamp(sa * (.35 + .65 * d) + (a < cam0 + 400 ? 0 : .0)) * (.7 + .3 * Math.sin(t * 3 + ph)); if (al < .02) continue;
    ctx.globalAlpha = al; ctx.fillStyle = rs() > .8 ? '#ffe9b0' : '#e8f0ff';
    if (sz > 1.9) sparkle(ctx, x, y, sz * 2.2, 0, ctx.fillStyle); else { ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  // brilho da cidade lá embaixo
  if (cam0 < 1400) f_glow(ctx, W * .4, sy(-60), 900, .5 * (1 - cam0 / 1400), '255,170,80');
  // quebrada no fundo
  if (cam0 < 800) {
    const k = [.25, .4, .65, 1], ly = k.map(v => -cam0 * (1 - v));
    drawQuebrada(ctx, 0, 560 + cam0, 0, { sky: false, kites: false, t, layerY: ly, fog: 1 });
    ctx.fillStyle = lg(ctx, 0, 560 + cam0, 0, 760 + cam0, [[0, '#1c2c34'], [1, '#0a1218']]); ctx.fillRect(-400, 560 + cam0, W + 800, 400);
    const hx = 380; f_hero(ctx, hx, 700 + cam0, 70, { lean: -6, head: -22, spread: .85, hs: .6, aR: [170, 176], aL: [-8, -6], lR: [6, 0], lL: [-6, 0], hR: 'fist' }, t, { face: { eye: 'happy', mouth: 'grin' } });
  }
  // nuvens
  const rc = rng(31);
  const clouds = [];
  for (let i = 0; i < 22; i++) { const d = .55 + rc() * .9, a = 520 + i * 125 + rc() * 120, x = rc() * (W + 700) - 350, s = (.9 + rc() * 1.2) * d; clouds.push({ d, a, x, s, al: .38 + rc() * .35, i }); }
  clouds.sort((p, q) => p.d - q.d);
  const drawCl = c => {
    const y = 360 + (cam0 - c.a) * c.d + 330, cx = ((c.x + t * 9 * c.d + 350) % (W + 700)) - 350; if (y < -160 || y > 900) return;
    const ca = sstep(3200, 2300, c.a) * c.al * (1 - sstep(3000, 3800, c.a)), warm = clamp(1 - c.a / 1800);
    wqDrawCloud(ctx, cx, y, c.s, ca, warm > .3 ? '90,100,150' : '60,70,130', '10,14,40', .7);
    if (warm > .2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ca * warm * .35; wqDrawCloud(ctx, cx, y + 14 * c.s, c.s * .9, 1, '255,160,90', '40,20,10', .4); ctx.restore(); }
  };
  clouds.filter(c => c.d < 1.05).forEach(drawCl);
  // pipa
  const ak = F_KITE_ALT(u), kx = 740 + Math.sin(t * 1.3) * 26 + (u - .5) * 120, ky = sy(ak), anchor = [380 + 40, 700 + cam0 - 300];
  const glow = sstep(.0, .35, u);
  ctx.save(); ctx.globalAlpha = 1;
  // linha longa (aqui desenhada à mão p/ não depender de distância)
  { const hx = anchor[0], hy = anchor[1]; ctx.strokeStyle = `rgba(255,236,190,${.55 + .3 * glow})`; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(kx, ky + 46); const midx = (kx + hx) / 2 + 40, midy = (ky + hy) / 2; ctx.quadraticCurveTo(midx + Math.sin(t * 2) * 8, midy, hx, hy); ctx.stroke(); }
  drawPipa(ctx, kx, ky, 42, Math.sin(t * 2.1) * .2 + .08, t, { glow: .4 + glow * 1.3, tail: 12 });
  if (u > .0) fxGlowKite(ctx, kx, ky, 1.6, t, { a: glow * .85, col: '255,214,130' });
  ctx.restore();
  // estrelas douradas da cerca subindo junto
  const rg2 = rng(5);
  for (let i = 0; i < 30; i++) { const a = 200 + rg2() * 2800 + t * 200, x = rg2() * W, y = sy(a % 3400), d = 1 + rg2(); if (y < 0 || y > H) continue; sparkle(ctx, x, y, 3 + rg2() * 5, t * 3 + i, 'rgba(255,224,150,.9)'); }
  clouds.filter(c => c.d >= 1.05).forEach(drawCl);
  // constelação formando ao redor da pipa quando chega ao espaço
  const cs = sstep(.62, 1, u);
  if (cs > 0) {
    const P = [[kx - 330, ky + 110], [kx - 210, ky - 30], [kx - 120, ky + 60], [kx - 20, ky - 120], [kx + 150, ky - 40], [kx + 270, ky - 150], [kx + 360, ky + 20]];
    fxConstellation(ctx, P, cs, { t, lw: 1.5 });
    fxStar8(ctx, kx + 270, ky - 150, 16 * cs, { t, glow: cs, rays: 0 });
  }
  ctx.restore();
  return { kx, ky };
}

/* ---------- quedas -> estrelas (flashbacks) ---------- */
function f_chalkStars(ctx, t, L, bx, by, scale) { // estrelas que brotam no quadro
  const pts = [[600, 150, 0.0], [740, 270, .45], [880, 190, .85], [1000, 330, 1.25], [450, 330, 1.6]];
  pts.forEach(([x, y, d], i) => {
    const u = clamp((L - d) / .5); if (u <= 0) return; const e = E.back(u);
    fxStar8(ctx, x, y, 20 * e, { t, glow: u, rays: 0, a: 1 }); sparkle(ctx, x + 26, y - 22, 8 * e, t * 3 + i, '#fff6d0');
  });
}
function f_bell(ctx, x, y, s, swing, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(swing);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-120, -118, 240, 22); ctx.strokeStyle = '#2e1c10'; ctx.lineWidth = 3; ctx.strokeRect(-120, -118, 240, 22);
  ctx.beginPath(); ctx.moveTo(-26, -96); ctx.lineTo(-30, -70); ctx.lineTo(30, -70); ctx.lineTo(26, -96); ctx.fillStyle = '#b88a2a'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, -70); ctx.bezierCurveTo(-150, -70, -80, 20, -128, 62); ctx.lineTo(128, 62); ctx.bezierCurveTo(80, 20, 150, -70, 40, -70); ctx.closePath();
  ctx.fillStyle = lg(ctx, -120, 0, 120, 0, [[0, '#a8741a'], [.35, '#ffe08a'], [.6, '#ffc24d'], [1, '#8a5a12']]); ctx.fill(); ctx.strokeStyle = '#5c3a0c'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#8a5a12'; ctx.fillRect(-132, 56, 264, 14); ctx.strokeRect(-132, 56, 264, 14);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-48, -4, 8, 40, .2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4a3010'; ctx.beginPath(); ctx.arc(Math.sin(t * 40) * 6, 76, 14, 0, TAU); ctx.fill();
  ctx.restore();
}
function f_cap(ctx, x, y, s, rot, t, o = {}) { // capelo
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const ink = '#10101c', k = o.col || '#1d2038';
  ctx.fillStyle = mix(k, '#000', .2); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-14, 14); ctx.quadraticCurveTo(0, 22, 14, 14); ctx.lineTo(14, 0); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = .08; ctx.stroke();
  ctx.fillStyle = k; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(34, 0); ctx.lineTo(0, 12); ctx.lineTo(-34, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(34, 0); ctx.lineTo(0, 0); ctx.fill();
  ctx.strokeStyle = '#ffc24d'; ctx.lineWidth = 1.4; const sw = Math.sin(t * 9 + x * .02) * 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, 4); ctx.lineTo(28 + sw, 20); ctx.stroke();
  ctx.fillStyle = '#ffc24d'; ctx.beginPath(); ctx.arc(28 + sw, 22, 3, 0, TAU); ctx.fill();
  ctx.restore();
}
function f_crowdHead(ctx, i, x, y, s, clap, t, o = {}) {
  const pose = clap ? POSE.pray : POSE.cheer;
  const col = o.dark == null ? .5 : o.dark;
  ctx.save(); if (col < 1) ctx.filter = `brightness(${col}) saturate(.8)`;
  drawChar(ctx, x, y, s, Object.assign({}, pose), Object.assign({ who: 'viz' + i, t: f_tw(t), color: .6, face: 'happy', flip: o.flip }, o.o || {}));
  ctx.restore();
}

/* ============================================================
   CENAS
   ============================================================ */
var SCENES_F = [
  /* ---- "Eu sou da quebrada" low angle ---- */
  { t0: 91.28, t1: 92.72, name: 'f_quebrada_low', fn(ctx, t, L, D) {
    const u = L / D, e = E.out2(u), b = beatInfo(t);
    ctx.save(); cam(ctx, { x: 640 + lerp(34, -14, e), y: 400 - 30 * e, z: 1 + .16 * e, r: -.05 + .02 * u });
    f_world(ctx, t, 120 + L * 14, 520, 0);
    f_fence(ctx, -420, 1700, 560, 210, t, 0);
    // asfalto à frente
    f_glow(ctx, 600, 640, 420, .22 + .1 * b.pulse, '255,180,90');
    const pose = Object.assign({}, POSE.hip, { lean: 4 - 8 * e, head: -6, bounce: b.pulse * .5 });
    f_hero(ctx, 560, 770, 86, pose, t, { face: u < .55 ? 'determined' : { eye: 'open', mouth: 'grin', brow: .3 }, open: 1, light: -1, rim: '#ffd9a0' });
    ctx.restore();
    fxLightShafts(ctx, 940, -60, 1.9, 900, { n: 5, a: .12, t, col: '255,214,150' });
    fxVignette(ctx, .55, '3,8,16'); fxGrade(ctx, 'nightTeal', .7);
    const sp = seg(u, .75, 1); if (sp > 0) { ctx.save(); ctx.globalAlpha = sp * .5; speedLines(ctx, 560, 380, t, { n: 40, r0: 300, r1: 900, a: 1 }); ctx.restore(); }
  } },
  /* ---- close dos olhos ---- */
  { t0: 92.72, t1: 93.96, name: 'f_olhos_cerca', fn(ctx, t, L, D) {
    const u = L / D, tt = f_tw(t), S = lerp(170, 235, E.io2(u));
    ctx.fillStyle = '#050c16'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.filter = 'blur(7px)'; f_world(ctx, t, 400, 640, 0); f_fence(ctx, -200, 1500, 650, 300, t, 0); ctx.restore();
    ctx.save(); cam(ctx, { x: 640 + wob(t, 3, 2) * 3, y: 360 + 6 - u * 10, z: 1, r: .03 - .02 * u });
    const cy = 360 - 20;
    eyesCU(ctx, 640, cy, S, { t: tt, style: 'determined', brow: .5, look: [lerp(.3, 0, u), lerp(.1, -.9, E.io2(u))], pupil: .5 });
    fringe(ctx, 640, cy - S * 1.28, S * 1.1, tt, '#2d1b13');
    // reflexo da cerca / estrelas nos olhos
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = seg(u, .5, 1);
    for (const sg of [-1, 1]) { f_glow(ctx, 640 + sg * .74 * S, cy, S * .6, .35 * gl); sparkle(ctx, 640 + sg * .74 * S - 10, cy - S * .12, 6 + 12 * gl, t * 3, '#fff'); }
    ctx.restore();
    ctx.restore();
    // fio farpado desfocado cruzando o quadro
    ctx.save(); ctx.filter = 'blur(3px)'; ctx.strokeStyle = 'rgba(8,14,22,.9)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-40, 90 + u * 14); ctx.quadraticCurveTo(640, 140 + u * 14, 1320, 70); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, 650 - u * 12); ctx.quadraticCurveTo(640, 620 - u * 12, 1320, 660); ctx.stroke(); ctx.restore();
    fxVignette(ctx, .5, '3,8,16');
    if (u > .8) { ctx.save(); ctx.globalAlpha = (u - .8) * 2; speedLines(ctx, 640, 340, t, { n: 50, r0: 280, r1: 900, a: .6 }); ctx.restore(); }
  } },
  /* ---- 'cerca': desfaz em estrelas ---- */
  { t0: 93.96, t1: 94.28, name: 'f_cerca_estrelas', fn(ctx, t, L, D) {
    const u = L / D;
    ctx.save(); cam(ctx, { x: 640, y: 330 - 20 * u, z: 1.0 + .03 * u, r: -.02 });
    f_world(ctx, t, 150, 520, 0);
    f_fence(ctx, -420, 1700, 560, 210, t, .3 + .7 * E.out2(u), { big: 1 });
    f_hero(ctx, 560, 770, 86, Object.assign({}, POSE.Vup, { lean: -6 }), t, { face: 'happy', rim: '#ffd9a0' });
    ctx.restore(); fxVignette(ctx, .5, '3,8,16');
    flash(ctx, (1 - u) * .5, '255,236,180');
  } },
  /* ---- tilt-up: pipa sobe ---- */
  { t0: 94.28, t1: 95.5, name: 'f_pipa_sobe', fn(ctx, t, L, D) {
    const u0 = 0, u1 = .55, u = lerp(u0, u1, L / D);
    f_climb(ctx, t, u);
    fxVignette(ctx, .4, '2,6,16');
    parallelLines(ctx, Math.PI / 2, t, { n: 24, a: .05 + .08 * Math.sin(L / D * Math.PI) });
  } },
  { t0: 95.5, t1: 96.44, name: 'f_pipa_espaco', fn(ctx, t, L, D) {
    const uu = L / D, u = lerp(.55, 1, uu);
    ctx.save(); cam(ctx, { x: 640, y: 360, z: 1 - .06 * E.io2(uu), r: .02 * Math.sin(uu * 3) });
    f_climb(ctx, t, u, { zoom: 1 });
    ctx.restore();
    const g = sstep(.5, 1, uu); fxGodRays(ctx, 880, 240, t, { a: .1 * g, n: 14 });
    flare(ctx, 740, 300, .8 + g * .8, '255,214,130', .5 * g, .8);
    fxVignette(ctx, .45, '2,4,14');
    const wh = 1 - seg(uu, 0, .08); if (wh > 0) flash(ctx, wh * .8, '255,255,255');
  } },
  /* ---- 'Cada queda': flashback queda ---- */
  { t0: 96.44, t1: 97.2, name: 'f_queda1', fn(ctx, t, L, D) {
    const u = L / D, tt = f_tw(t);
    ctx.fillStyle = '#10161c'; ctx.fillRect(0, 0, W, H);
    ctx.save(); cam(ctx, { x: 640 + shakeV(t, u > .45 && u < .6 ? 10 : 0)[0], y: 380, z: 1.08 + .1 * u, r: .04 - .06 * u });
    f_world(ctx, t, 600 + L * 140, 560, 2); ctx.fillStyle = 'rgba(20,24,40,.35)'; ctx.fillRect(-100, -100, W + 200, H + 200);
    const run = runPose(tt * 3), fall = lerpPose(POSE.fall, POSE.fallFlat, clamp((u - .5) / .3));
    const pose = u < .42 ? run : u < .5 ? lerpPose(run, POSE.fall, (u - .42) / .08) : fall;
    const x = 380 + u * 200 + (u > .5 ? 30 * Math.min(1, (u - .5) * 6) : 0);
    f_hero(ctx, x, 640, 74, pose, t, { scar: 0, face: u < .45 ? 'determined' : 'shock' });
    if (u > .5) { const du = (u - .5) / .5; ctx.save(); ctx.fillStyle = `rgba(190,185,170,${.5 * (1 - du)})`; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI; ctx.beginPath(); ctx.arc(x + 80 + Math.cos(a) * 60 * du * 2 - 40, 636 - Math.sin(a) * 40 * du * 2, 10 + 24 * du, 0, TAU); ctx.fill(); } ctx.restore(); }
    ctx.restore();
    // estrela nasce do joelho
    const st = seg(u, .72, 1); if (st > 0) { const sx = 560, sy = 590; fxStar8(ctx, sx, sy, 34 * E.back(st), { t, glow: st, rays: 1 }); f_glow(ctx, sx, sy, 160, st * .6); }
    fxVignette(ctx, .6, '4,6,12'); fxGrade(ctx, 'dayFaded', .6);
    if (u > .48 && u < .56) { ctx.save(); ctx.globalAlpha = .5; speedLines(ctx, 560, 560, t, { n: 40, r0: 100, r1: 700, a: 1, col: '#fff' }); ctx.restore(); }
  } },
  /* ---- 'foi lição': giz ---- */
  { t0: 97.2, t1: 98.24, name: 'f_giz_licao', fn(ctx, t, L, D) {
    const u = L / D, p = lerp(.05, .6, E.out2(u));
    ctx.save(); cam(ctx, { x: lerp(560, 860, E.io2(u)), y: lerp(250, 230, u), z: lerp(1.1, 1.75, E.io2(u)), r: -.015 });
    const r = intChalkWall(ctx, t, { p, tone: 'day', board: true });
    f_chalkStars(ctx, t, L + .4, r.board.x, r.board.y, 1);
    // estrelas voam da cicatriz desenhada
    ctx.restore();
    // mão/giz
    ctx.save(); cam(ctx, { x: lerp(560, 860, E.io2(u)), y: lerp(250, 230, u), z: lerp(1.1, 1.75, E.io2(u)), r: -.015 });
    f_glow(ctx, r.tip[0], r.tip[1], 50, .5, '255,255,230'); ctx.restore();
    fxGrade(ctx, 'dayFaded', .35); fxVignette(ctx, .5, '10,12,18');
    const wh = 1 - seg(u, 0, .1); flash(ctx, wh * .8, '255,255,255');
  } },
  /* ---- 'cada dor': levanta ---- */
  { t0: 98.24, t1: 99.04, name: 'f_dor_levanta', fn(ctx, t, L, D) {
    const u = L / D, tt = f_tw(t);
    ctx.fillStyle = '#10161c'; ctx.fillRect(0, 0, W, H);
    const up = E.io2(seg(u, .45, .9));
    ctx.save(); cam(ctx, { x: 640, y: lerp(420, 370, up), z: lerp(1.25, 1.08, up), r: lerp(-.05, .02, up) });
    f_world(ctx, t, 900, 580, 2); ctx.fillStyle = 'rgba(20,24,40,.3)'; ctx.fillRect(-100, -100, W + 200, H + 200);
    const pose = lerpPose(lerpPose(POSE.sitKnees, POSE.rise, seg(u, .35, .6)), POSE.stand, seg(u, .6, .9));
    pose.bounce = u > .5 ? beatInfo(t).pulse * .4 : 0;
    f_hero(ctx, 640, 680, 92, pose, t, { scar: seg(u, .2, .8), face: u < .45 ? 'cry' : u < .75 ? 'determined' : { eye: 'open', mouth: 'grin', brow: .3 } });
    ctx.restore();
    const g = seg(u, .45, 1); if (g > 0) { f_glow(ctx, 640, 420, 300 * g, .35 * g); }
    for (let i = 0; i < 6; i++) { const v = seg(u, .55 + i * .05, 1); if (v > 0) sparkle(ctx, 640 + Math.sin(i * 2.4) * 160, 430 - v * 220 - i * 8, 6 + 6 * (1 - v), t * 4 + i, '#ffe9a8'); }
    fxVignette(ctx, .6, '4,6,12'); fxGrade(ctx, 'dayFaded', .5 * (1 - up));
  } },
  /* ---- 'escola': sino ---- */
  { t0: 99.04, t1: 99.5, name: 'f_sino', fn(ctx, t, L, D) {
    const u = L / D; ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#2a1a3a'], [1, '#6a3a2a']]); ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.filter = 'blur(10px)'; fxBokeh(ctx, t, 8, 24, { cols: ['255,200,100', '255,150,180', '255,255,220'], a: .5 }); ctx.restore();
    fxGodRays(ctx, 640, 360, t, { a: .3, n: 22, sp: .2 });
    const sw = Math.sin(L * 38) * .28 * (1 - u * .6);
    ctx.save(); cam(ctx, { x: 640, y: 360, z: 1.1 - .06 * u, r: .05 * Math.sin(L * 38) * (1 - u) }); f_bell(ctx, 640, 330, 2.0, sw, t); ctx.restore();
    for (let i = 0; i < 3; i++) { const v = (L * 3 + i * .33) % 1; shockRing(ctx, 640, 430, 80 + v * 520, 6 * (1 - v), (1 - v) * .8, .8); }
    speedLines(ctx, 640, 380, t, { n: 50, r0: 330, r1: 900, a: .35, col: '#fff1b0' });
    flash(ctx, (1 - seg(u, 0, .25)) * .9, '255,246,210');
    fxVignette(ctx, .5, '10,4,16');
  } },
  /* ---- formatura: ela na beca (capelo + diploma) ---- */
  { t0: 99.5, t1: 100.2, name: 'f_formatura', fn(ctx, t, L, D) {
    const u = L / D, b = beatInfo(t);
    ctx.save(); cam(ctx, { x: 640, y: lerp(380, 340, u), z: lerp(.96, 1.1, E.out2(u)), r: .03 * (1 - u) });
    f_world(ctx, t, 1500, 540, 3);
    // varal de luzes + faixa
    // plateia silhueta
    [[130, 690, 70, 0, 1], [320, 650, 60, 1, 0], [980, 650, 60, 2, 1], [1150, 700, 72, 3, 0], [820, 640, 54, 4, 1]].forEach(([x, y, s, i, fl], k) => f_crowdHead(ctx, i, x, y + (b.n + k) % 2 * -4, s, (Math.floor(t * 6) + k) % 2, t, { flip: fl, dark: .45 }));
    f_hero(ctx, 640, 700, 74, lerpPose(POSE.hold, POSE.Vup, E.out2(seg(u, .3, 1))), t, { face: { eye: 'happy', mouth: 'grin', brow: .1 }, scar: 1 });
    const hp = charPt(640, 700, 74, lerpPose(POSE.hold, POSE.Vup, E.out2(seg(u, .3, 1))), 'head');
    f_cap(ctx, hp[0] + 2, hp[1] - 75, 1.4, -.08, t);
    ctx.restore();
    f_glow(ctx, 640, 380, 480, .25 + .1 * b.pulse, '255,200,150');
    fxBokeh(ctx, t, 21, 14, { cols: ['255,190,120', '255,160,200'], a: .35, y0: 0, y1: 300 });
    fxVignette(ctx, .45, '20,8,30');
  } },
  /* ---- vitória: capelos voando, diploma vira estrelas ---- */
  { t0: 100.2, t1: 100.96, name: 'f_capelos', fn(ctx, t, L, D) {
    const u = L / D, b = beatInfo(t);
    ctx.save(); cam(ctx, { x: 640, y: lerp(400, 320, E.io2(u)), z: lerp(1.05, .92, u), r: -.03 * u });
    f_world(ctx, t, 1500, 560, 3);
    const jump = Math.sin(clamp(u * 1.6) * Math.PI) * 60;
    // plateia: mãe, irmão, vizinhos
    f_crowdHead(ctx, 0, 190, 700, 66, (Math.floor(t * 8)) % 2, t, { dark: .6 });
    f_crowdHead(ctx, 3, 1100, 700, 66, (Math.floor(t * 8) + 1) % 2, t, { dark: .6, flip: 1 });
    drawChar(ctx, 410, 710, 68, (Math.floor(t * 8)) % 2 ? POSE.pray : POSE.cheer, { who: 'mae', t: f_tw(t), face: 'happy' });
    drawChar(ctx, 880, 720, 62, (Math.floor(t * 8) + 1) % 2 ? POSE.pray : POSE.cheer, { who: 'irmao', t: f_tw(t), face: 'happy', flip: 1 });
    const pose = Object.assign({}, POSE.cheer, { air: 0.2 + jump / 120 });
    f_hero(ctx, 650, 700, 74, pose, t, { face: 'happy', scar: 1 });
    if (u < .22) { const hh = charPt(650, 700, 74, pose, 'head'); f_cap(ctx, hh[0], hh[1] - 75, 1.4, -.08 + u * 2, t); }
    const hp = charPt(650, 700, 74, pose, 'aR');
    // capelos voando
    const rc = rng(15);
    for (let i = 0; i < 12; i++) { const x0 = 120 + rc() * 1040, v = clamp(u * 1.3 - rc() * .2), ph = rc(); if (v <= 0) continue; const x = x0 + Math.sin(v * 5 + ph * 6) * 30, y = 600 - E.out2(v) * (700 + rc() * 300) + E.in2(v) * 120; f_cap(ctx, x, y, .9 + rc() * .5, v * 7 * (ph - .5) * 3, t, { col: i % 4 ? '#1d2038' : '#2a2a58' }); }
    ctx.restore();
    // diploma vira estrelas
    const ds = seg(u, .1, .9); const dx = 620 + Math.sin(ds * 3) * 40, dy = 300 - ds * 160;
    fxConstellation(ctx, [[620, 340], [700, 260], [790, 300], [860, 200], [960, 240]], ds, { t, lw: 2 });
    for (let i = 0; i < 14; i++) { const v = seg(u, .1 + i * .02, 1); if (v > 0) fxStar8(ctx, 640 + Math.cos(i * 1.9) * 40 * (1 + v * 8), 330 - v * 260 - Math.sin(i) * 40, (5 + (i % 4) * 3) * Math.min(1, v * 4), { t, glow: .8, rays: 0 }); }
    sparkle(ctx, dx, dy, 18, t * 3, '#fff'); // diploma
    f_glow(ctx, 650, 380, 520, .35 + .2 * b.pulse, '255,200,120');
    fxVignette(ctx, .4, '20,8,30');
  } },
  /* ---- 'Motto kagayake' BUILD 1: peito ---- */
  { t0: 100.96, t1: 101.7, name: 'f_build_push', fn(ctx, t, L, D) {
    const u = L / D, g = E.in2(u);
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);
    ctx.save(); cam(ctx, { x: lerp(640, 650, u), y: lerp(430, 330, E.io2(u)), z: lerp(.95, 1.7, E.in2(u)), r: lerp(-.06, .03, u) });
    f_world(ctx, t, 100 + L * 8, 520, 0, { night: .2 });
    f_glow(ctx, 650, 460, 600, .35 + .5 * g);
    f_hero(ctx, 650, 790, 110, Object.assign({}, POSE.fist, { lean: -6 }), t, { face: { eye: 'determined', mouth: 'flat', brow: .8 }, scar: 1, pendant: 0, rim: '#ffe6a8' });
    ctx.restore();
    fxGodRays(ctx, 650, 430, t, { a: .15 + .35 * g, n: 22, sp: .15 });
    fxLightShafts(ctx, 650, 430, -1.57, 800, { n: 7, a: .2 * g, t });
    ctx.save(); ctx.globalAlpha = .3 + .5 * g; speedLines(ctx, 650, 430, t, { n: 70, r0: 220, r1: 1000, a: 1, col: '#ffe9a8' }); ctx.restore();
    f_glow(ctx, 650, 440, 220 + 300 * g, .3 + .5 * g);
    fxVignette(ctx, .6, '3,4,10');
  } },
  /* ---- BUILD 2: extreme close da cicatriz até quase branco ---- */
  { t0: 101.7, t1: 102.4, name: 'f_build_cicatriz', fn(ctx, t, L, D) {
    const u = L / D, g = E.in2(u), pose = Object.assign({}, POSE.fist, { lean: -6 });
    const cp = charPt(650, 790, 110, pose, 'chest');
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);
    ctx.save(); cam(ctx, { x: cp[0], y: cp[1] + 14, z: lerp(2.2, 6.5, E.in3(u)), r: lerp(.03, -.02, u) + wob(t, 30, 1) * .004 * g });
    f_glow(ctx, cp[0], cp[1], 400, .5 + .5 * g);
    f_hero(ctx, 650, 790, 110, pose, t, { face: { eye: 'determined', mouth: 'flat', brow: .8 }, scar: 1, pendant: 0, rim: '#ffe6a8' });
    ctx.restore();
    const cx = W / 2, cy = H / 2 - 14;
    fxGodRays(ctx, cx, cy, t, { a: .3 + .5 * g, n: 28, sp: .3 });
    fxLightShafts(ctx, cx, cy, -1.57, 900, { n: 9, a: .35 * g, t }); fxLightShafts(ctx, cx, cy, 1.57, 900, { n: 9, a: .35 * g, t });
    ctx.save(); ctx.globalAlpha = .55; speedLines(ctx, cx, cy, t, { n: 90, r0: 160, r1: 1100, a: 1, col: '#fff3c4' }); ctx.restore();
    f_glow(ctx, cx, cy, 300 + 800 * g, .6 + .4 * g, '255,214,130');
    flare(ctx, cx, cy, 1 + 2.5 * g, '255,200,110', .6 + .4 * g, 1.5);
    for (let i = 0; i < 16; i++) { const v = (t * 1.6 + i * .37) % 1, a = i * 2.4; sparkle(ctx, cx + Math.cos(a) * v * 700, cy + Math.sin(a) * v * 500, 4 + 10 * (1 - v), t * 4 + i, '#fff6d0'); }
    // quase branco-dourado no final
    const wh = seg(u, .45, 1); if (wh > 0) { ctx.save(); ctx.fillStyle = rg(ctx, cx, cy, 0, 900, [[0, `rgba(255,252,238,${Math.min(1, wh * 1.25)})`], [.55, `rgba(255,236,176,${wh * .96})`], [1, `rgba(255,214,120,${wh * .88})`]]); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  } },
];
var IMPACTS_F = [
  { t: 93.96, d: .07, type: 'invert' },
  { t: 94.28, d: .06, type: 'flash' },
  { t: 96.44, d: .07, type: 'invert' },
  { t: 97.67, d: .04, type: 'white' },
  { t: 99.04, d: .08, type: 'white' },
  { t: 99.92, d: .06, type: 'invert' },
  { t: 100.96, d: .07, type: 'invert' },
  { t: 101.7, d: .05, type: 'flash' },
];
