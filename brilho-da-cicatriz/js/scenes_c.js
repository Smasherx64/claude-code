'use strict';
/* ============================================================
   scenes_c.js — REFRÃO 1 (36.0 – 48.3): DROP · HENSHIN · dança · constelação · mão estendida
   Mahou shoujo kawaii ancorado na história. Prefixo c_/C_. Sem texto.
   Grade de batidas (offset .73): 35.98 36.73 37.48 38.23 38.98 39.73 40.48 41.23 41.98 42.73 43.48 44.23 44.98 45.73 46.48 47.23 47.98
   ============================================================ */
const C_ON2 = t => Math.floor(t * 12) / 12;
const C_FACE = { eye: 'happy', mouth: 'grin' };

/* ---------- utilidades ---------- */
function c_hero(ctx, x, y, s, pose, t, o = {}) {
  return drawChar(ctx, x, y, s, pose, Object.assign({ t: C_ON2(t), wind: 1.6, face: C_FACE, magical: 1, wand: 1, pendant: 0 }, o));
}
/* ponta da varinha (tela) — mesma geometria de c2wand */
function c_wandTip(x, y, s, pose, ang = 22, len = 2.9) {
  const p = Object.assign({}, POSE.stand, pose), k = skeleton(p), h = k.aR[2], a = rad(ang);
  return charPt(x, y, s, p, [h[0] + Math.sin(a) * len, h[1] - Math.cos(a) * len]);
}
function c_handPt(x, y, s, pose) { const p = Object.assign({}, POSE.stand, pose); return charPt(x, y, s, p, skeleton(p).aR[2]); }
function c_headPt(x, y, s, pose) { const p = Object.assign({}, POSE.stand, pose); return charPt(x, y, s, p, skeleton(p).head); }

/* dimensão do henshin: gradiente cósmico + raios + brilho holográfico */
function c_dim(ctx, t, cx, cy, a = 1, o = {}) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = lg(ctx, 0, -300, 0, H + 300, [[0, o.top || '#2b1a7a'], [.45, o.mid || '#8a3aa8'], [.8, o.bot || '#ff8fc8'], [1, '#ffd6ec']]); ctx.fillRect(-500, -400, W + 1000, H + 800);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha *= .8; drawNebula(ctx, -100, -100, W + 200, H + 200, { z: 1.5, ox: t * 14 }); ctx.restore();
  rays(ctx, cx, cy, t * 1.6, { n: 16, a: o.rays == null ? .2 : o.rays, len: 1500, sp: .22, col: '255,222,245' });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = holoGrad(ctx, cx, cy, t * 1.5, .09); ctx.fillRect(-500, -400, W + 1000, H + 800); ctx.restore();
  ctx.restore();
}
/* chão de laje pastel (primeiro plano) para planos próximos */
function c_floorGlow(ctx, y, t, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 260, [[0, '#ffc7e8'], [.5, '#c9a8ff'], [1, '#7e6bd8']]); ctx.fillRect(-500, y, W + 1000, 500);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, y - 4, 0, y + 70, [[0, 'rgba(255,255,255,.75)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-500, y - 4, W + 1000, 74);
  ctx.restore();
}
/* círculo mágico achatado no chão */
function c_groundCircle(ctx, x, y, R, t, a = 1, kind = 'heart') {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .26); heartCircle(ctx, 0, 0, R, t, a, { kind, nofill: false }); ctx.restore();
}
/* mundo pastel da quebrada à noite (mood 2.2→3) + pisca-pisca; retorna bases */
function c_world(ctx, t, camX, y0, mood = 3, o = {}) {
  const r = drawQuebrada(ctx, camX, y0, mood, { t, lights: o.lights, fog: o.fog == null ? .6 : o.fog, sky: o.sky, poles: o.poles });
  if (o.wash !== false) { // lavagem pastel suave por cima
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = (o.wash == null ? .5 : o.wash) * clamp((mood - 1.5)); ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#b69cff'], [.6, '#ff9fd6'], [1, '#ffe6f2']]); ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore();
  }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.dark == null ? .4 : o.dark; ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#6a4cc0'], [1, '#c8a0e8']]); ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore();
  return r;
}
function c_stars(ctx, t, cx, cy, n, seed, R, size, a = 1) { // brilhos pastel espalhados em órbita elíptica
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const r = rng(seed + i * 13), an = r() * TAU + t * (.6 + r()), d = R * (.35 + r() * .8); sparkle(ctx, cx + Math.cos(an) * d, cy + Math.sin(an) * d * .6, size * (.4 + r() * .8) * (.6 + .4 * Math.sin(t * 6 + i)), t * 2 + i, PST_LIST[i % 6]); }
  ctx.restore();
}
function c_orbit(ctx, t, cx, cy, n, rx, ry, a = 1, sp = 3, seed = 0) { // corações, estrelas e luas orbitando
  for (let i = 0; i < n; i++) {
    const an = t * sp + i / n * TAU, wob_ = Math.sin(i * 2.3 + seed) * .25, px = cx + Math.cos(an) * rx * (1 + wob_ * .3), py = cy + Math.sin(an) * ry + (i % 3 - 1) * 24, depth = .6 + .4 * Math.sin(an), sz = (11 + (i % 3) * 4) * depth;
    ctx.save(); ctx.globalAlpha = a * (.55 + .45 * depth); const k = i % 4;
    if (k === 0) heartShape(ctx, px, py, sz, an * .5, PST.pink, '#fff', 2); else if (k === 1) starShape5(ctx, px, py, sz * 1.15, an, PST.gold, '#fff', 2); else if (k === 2) heartShape(ctx, px, py, sz * .9, -an * .5, PST.lilac, '#fff', 2); else crescent(ctx, px, py, sz * 1.1, an * .6, PST.pearl, '#ffd6ec', 2);
    ctx.restore();
  }
}

/* ============================================================
   1. DROP — a parede estilhaça, a estrela de 8 pontas explode (36.0 – 36.73)
   ============================================================ */
function c_drop(ctx, t, L, D) {
  const b = beatInfo(t), u = L / D, p = E.out2(seg(L, 0.0, .62));
  const k = E.out5(seg(L, 0, .3)), z = 1 + .55 * (1 - k) + .08 * u, sh = shakeV(t, 14 * (1 - seg(L, 0, .45)), 40, 3);
  ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  cam(ctx, { x: W / 2 + sh[0], y: H / 2 + sh[1], z, r: (1 - k) * .07 });
  // parede (concreto) estilhaçando; atrás, o cosmos pastel do henshin
  fxBurstWall(ctx, -60, -60, W + 120, H + 120, p, {
    tone: 'night', bx: W / 2, by: 330, power: 1.25, glow: 1, behind: c => {
      c_dim(c, t, W / 2, 330, 1, { rays: .34 });
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, W / 2, 330, 0, 620, [[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,225,160,.8)'], [1, 'rgba(255,160,220,0)']]); c.fillRect(-300, -300, W + 600, H + 600); c.restore();
    }
  });
  // estrela de 8 pontas explode pela fenda
  const sr = lerp(40, 330, E.out3(seg(L, .0, .5)));
  fxStar8(ctx, W / 2, 330, sr, { rot: .2 * L, glow: 1.3, t, pulse: b.pulse, flare: 1, rays: 1 });
  fxShards(ctx, W / 2, 330, seg(L, .02, 1.0) * 1.1, { n: 70, R: 760, seed: 11, time: t, g: .45, size: 1.25 });
  fxShards(ctx, W / 2, 330, seg(L, .05, 1.0) * 1.05, { n: 26, R: 1000, seed: 29, time: t, g: .3, size: 1.9 });
  speedLines(ctx, W / 2, 330, t, { n: 60, r0: 190, r1: 1100, col: '#fff6dd', a: .55 * (1 - u), seed: 7 });
  shockRing(ctx, W / 2, 330, E.out3(seg(L, 0, .55)) * 900, 22 * (1 - seg(L, 0, .55)), 1 - seg(L, 0, .55));
  // brilhos pastel brotando ao final
  glitter(ctx, t, 21, 36, 0, 0, W, H, { size: 20, a: seg(L, .2, .5) });
  ctx.restore();
  flash(ctx, 1 - E.out2(seg(L, 0, .2)), '255,255,255');
  flash(ctx, .35 * (1 - seg(L, .0, .5)), '255,236,200');
  bloom(ctx, .18, 12);
  if (L > .62) flash(ctx, seg(L, .62, D) * .55, '255,240,252'); // ponte p/ o branco do henshin
}

/* ============================================================
   2. HENSHIN (36.73 – 38.78) — 3 planos: ascensão · giro · revelação
   ============================================================ */
const C_RIBS = [['255,140,200', '255,230,250'], ['190,160,255', '255,220,250'], ['150,225,255', '230,250,255'], ['255,225,150', '255,250,230']];
function c_henA(ctx, t, L, D) { // 36.73–37.48: heroína (ainda a menina) ergue-se numa coluna de luz; orbe-estrela entra no peito
  const b = beatInfo(t), u = L / D, cx = W / 2, fy = 590, s = 64;
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2 + lerp(25, 0, E.io2(u)), z: lerp(.96, 1.1, E.io2(u)), r: lerp(.06, -.03, u) });
  c_dim(ctx, t, cx, 330, 1, { rays: .25 });
  c_floorGlow(ctx, fy - 4, t, .35);
  c_groundCircle(ctx, cx, fy + 6, 260 * E.out3(seg(L, 0, .5)), t * 2.5, .9);
  // coluna de luz
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, cx - 160, 0, cx + 160, 0, [[0, 'rgba(255,200,240,0)'], [.5, `rgba(255,245,252,${.55 * seg(L, 0, .3)})`], [1, 'rgba(255,200,240,0)']]); ctx.fillRect(cx - 160, -200, 320, fy + 220); ctx.restore();
  const m = sstep(.5, 1, u) * .2, pose = lerpPose(POSE.stand, POSE.hensCross, E.out3(seg(L, .05, .4)));
  pose.air = E.io2(seg(L, .25, .75)) * .4;
  const lift = pose.air * 2 * s, yb = fy - lift, yt = yb - 6 * s, hg = seg(L, .1, .6);
  C_RIBS.forEach((c, i) => ribbonHelix(ctx, cx, yb + 20, yt, 150 + 30 * (i % 3), 1.6, i * TAU / 4 + t * 6, 8, c[0], c[1], 'back', .8, E.out2(hg)));
  if (u < .62) c_hero(ctx, cx, fy, s, pose, t, { magical: m, wand: 0, shadow: true, face: { eye: 'closed', mouth: 'smile' } });
  else charSilhouette(ctx, cx, fy, s, pose, { magical: m, wand: 0, t: C_ON2(t), wind: 1.6, face: C_FACE, pendant: 0 }, sstep(.62, .85, u), E.out2(seg(u, .62, 1)) * TAU);
  C_RIBS.forEach((c, i) => ribbonHelix(ctx, cx, yb + 20, yt, 150 + 30 * (i % 3), 1.6, i * TAU / 4 + t * 6, 8, c[0], c[1], 'front', .75, E.out2(hg)));
  // orbe-estrela entra no peito (a estrela de 8 pontas da capa vira luz)
  const ob = E.io2(seg(L, .0, .42)), ox = lerp(cx + 360, cx, ob), oy = lerp(120, yb - 3.4 * s, ob);
  if (ob < 1) { fxStar8(ctx, ox, oy, 46 * (1 - ob * .5), { rot: t * 3, glow: 1.2, t }); ribbonFollow(ctx, tt => { const q = E.io2(seg(tt - (t - L), 0, .42)); return [lerp(cx + 360, cx, q), lerp(120, yb - 3.4 * s, q)]; }, t, .22, 14, 12, '255,225,150', '255,240,200', .8, { sparks: 14 }); }
  c_orbit(ctx, t, cx, (yb + yt) / 2, 10, 260, 90, hg, 4, 1);
  glitter(ctx, t, 31, 40, 0, 0, W, H, { size: 20, a: .8 }); bubbles(ctx, t, 5, 8, { rMin: 8, rMax: 26 });
  ctx.restore();
  flash(ctx, (1 - seg(L, 0, .14)) * .6, '255,240,252');
  flash(ctx, sstep(.62, 1, u) * .35, '255,235,250');
}
function c_henB(ctx, t, L, D) { // 37.48–38.23: SILHUETA girando — troca de roupa/cabelo escondida pela luz
  const b = beatInfo(t), u = L / D, cx = W / 2, fy = 590, s = 64;
  const camA = lerp(-.12, .1, E.io2(u));
  ctx.save(); cam(ctx, { x: W / 2 + Math.sin(u * 3) * 24, y: H / 2 - 10, z: lerp(1.0, 1.14, E.io2(u)), r: camA });
  c_dim(ctx, t, cx, 340, 1, { rays: .16, top: '#281478', mid: '#7a2e9c', bot: '#d65aae' });
  c_groundCircle(ctx, cx, fy + 2, 360, t * 3, .95, 'star');
  const pose = lerpPose(POSE.hensCross, POSE.hensUp, E.io2(seg(u, 0, 1)));
  pose.air = .4 + .08 * Math.sin(u * 5);
  const m = sstep(.08, .88, u); // 0→1 sempre dentro do branco
  const lift = pose.air * 2 * s, yb = fy - lift, yt = yb - 6 * s;
  C_RIBS.forEach((c, i) => ribbonHelix(ctx, cx, yb + 20, yt, 150 + u * 90, 1.5, i * TAU / 4 + t * 7, 8, c[0], c[1], 'back', .8, 1));
  charSilhouette(ctx, cx, fy, s, pose, { magical: m, wand: sstep(.7, .95, u), t: C_ON2(t), wind: 2, face: C_FACE, pendant: 0 }, 1, E.in2(u) * .2 * TAU + u * TAU * 3.2);
  // luz branca cobre o meio da transição
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const core = Math.sin(clamp(u) * Math.PI); ctx.fillStyle = rg(ctx, cx, yb - 3.2 * s, 0, 360, [[0, `rgba(255,255,255,${.3 * core})`], [.5, `rgba(255,205,240,${.15 * core})`], [1, 'rgba(255,205,240,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  C_RIBS.forEach((c, i) => ribbonHelix(ctx, cx, yb + 20, yt, 150 + u * 90, 1.5, i * TAU / 4 + t * 7, 8, c[0], c[1], 'front', .75, 1));
  c_orbit(ctx, t, cx, (yb + yt) / 2, 14, 280 + u * 120, 110, 1, 5.5, 3);
  speedLines(ctx, cx, yb - 3.2 * s, t, { n: 40, r0: 260, r1: 1000, col: '#fff0fa', a: .35, seed: 4 });
  glitter(ctx, t, 41, 50, 0, 0, W, H, { size: 22 });
  ctx.restore();
  flash(ctx, Math.sin(clamp(u) * Math.PI) * .1, '255,240,252');
  bloom(ctx, .12, 12);
}
function c_henC(ctx, t, L, D) { // 38.23–38.78: ESTOURO na batida — pose final com a varinha-bússola
  const b = beatInfo(t), u = L / D, cx = W / 2, fy = 586, s = 64;
  const k = E.out5(seg(L, 0, .4));
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2 + 10 - 20 * u, z: 1.12 - .08 * k + .03 * u, r: lerp(.1, -.02, k) });
  c_dim(ctx, t, cx, 330, 1 - sstep(.2, .55, u) * .4, { rays: .35, top: '#6f3ad0', mid: '#f06cc0', bot: '#ffc0e6' });
  c_world(ctx, t, 0, fy + 10, 3, { sky: false, wash: .3 }); // a quebrada pastel aparece por trás
  ctx.save(); ctx.globalAlpha = 0; ctx.restore();
  // véu de dimensão por cima da quebrada que vai se dissolvendo
  c_dim(ctx, t, cx, 330, 1 - sstep(.1, .6, u), { rays: .3, top: '#6f3ad0', mid: '#f06cc0', bot: '#ffc0e6' });
  c_groundCircle(ctx, cx, fy + 4, 360 * (1 + .3 * k), t * 3, .8 * (1 - u * .4));
  const pose = lerpPose(POSE.hensUp, POSE.hensPose, E.out3(seg(L, 0, .3)));
  pose.air = .4 * (1 - E.out2(seg(L, .0, .55)));
  const bw = fy - pose.air * 2 * s - 3.3 * s;
  wingsButterfly(ctx, cx, fy - pose.air * 2 * s - 4.6 * s, s * .85, t * 9, .9 * seg(L, .05, .3), 0);
  c_hero(ctx, cx, fy, s, pose, t, { magical: 1, wand: 1 });
  const tip = c_wandTip(cx, fy, s, pose);
  // estouro: anéis, rajada de estrelas, raios
  const bu = seg(L, 0, 1.0);
  shockRing(ctx, cx, bw, 80 + E.out3(seg(L, 0, .6)) * 800, 16 * (1 - bu), 1 - bu); shockRing(ctx, cx, bw, 40 + E.out3(seg(L, .03, .6)) * 520, 7, (1 - bu) * .8);
  starBurst(ctx, cx, bw, bu, 30, 14, 600, 30);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - bu; starShape5(ctx, cx, bw, 460 * E.out3(seg(L, 0, .4)), L * 2, 'rgba(255,230,250,.3)', 'rgba(255,255,255,.9)', 5, .45); ctx.restore();
  glint(ctx, tip[0], tip[1], 80 * (1 - bu * .4), L * 4, '#fff');
  prismFlare(ctx, tip[0], tip[1], .8 + .5 * (1 - k), .5, t);
  sakura(ctx, t, 8, 26, { size: 14, wind: 190, fall: 60, a: seg(L, .1, .4) }); glitter(ctx, t, 12, 40, 0, 0, W, H, { size: 22 });
  ctx.restore();
  flash(ctx, (1 - E.out3(seg(L, 0, .26))) * .95, '255,240,250');
  bloom(ctx, .16, 12);
}

/* ============================================================
   3. DANÇA NA LAJE (38.78 – 41.82)
   ============================================================ */
function c_laje(ctx, t, camX, y, mood) { // laje de primeiro plano sob a heroína
  drawLaje(ctx, -200 - camX * .0, y, W + 400, mood, { h: 26, drop: 120, mureta: 0, rebar: false, tank: 0, varal: false, ant: 0, dish: 0, plants: 0, seed: 9, t });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, y - 6, 0, y + 26, [[0, 'rgba(255,225,245,.5)'], [1, 'rgba(255,225,245,0)']]); ctx.fillRect(-300, y - 6, W + 600, 32); ctx.restore();
}
function c_dance(ctx, t, L, D) { // 38.78–40.48: plano aberto, dança, círculo mágico atrás, fita da varinha
  const b = beatInfo(t), u = L / D, cx = W / 2 - 60 + u * 80, fy = 556, s = 60, mood = lerp(2.5, 3, E.out2(u));
  const camX = lerp(-40, 120, u);
  ctx.save(); cam(ctx, { x: W / 2 + lerp(-90, 60, E.io2(u)), y: H / 2 + lerp(0, -20, u), z: 1.0 + .03 * b.pulse + .05 * u, r: lerp(-.04, .04, E.io2(u)) });
  c_world(ctx, t, camX, fy + 54, mood, {});
  fxBokeh(ctx, t, 4, 14, { cols: ['255,190,230', '210,190,255', '170,235,255', '255,240,170'], r0: 10, r1: 44, a: .4, y0: 60, y1: 400, x0: -200, x1: W + 200 });
  heartCircle(ctx, cx, 330, 230, t * 1.1, .5 + .2 * b.pulse);
  rays(ctx, cx, 300, t, { n: 14, a: .12, len: 1100, sp: .15, col: '255,222,245' });
  c_laje(ctx, t, camX, fy, mood);
  c_groundCircle(ctx, cx, fy + 10, 220, t * 1.3, .55 + .25 * b.pulse, 'star');
  const pf = tt => dancePose(tt, 0, 1);
  const pose = pf(t); const hy = fy - (pose.bounce || 0) * 8;
  ribbonFollow(ctx, tt => c_wandTip(cx, fy - (pf(tt).bounce || 0) * 8, s, pf(tt)), t, .5, 22, 15, '255,140,200', '190,170,255', .92, { sparks: 18 });
  wingsButterfly(ctx, cx, fy - 4.5 * s, s * .62, t * 8, .75, rad(pose.lean || 0));
  c_hero(ctx, cx, hy, s, pose, t, { magical: 1, wand: 1 });
  const tip = c_wandTip(cx, hy, s, pose); glint(ctx, tip[0], tip[1], 40 + 24 * b.pulse, t * 3, '#fff');
  sakura(ctx, t, 21, 30, { size: 14, wind: 120, fall: 80 }); glitter(ctx, t, 31, 44, 0, 0, W, H, { size: 20 });
  floatHearts(ctx, t, 41, 8, { size: 18, a: .9 });
  prismFlare(ctx, tip[0], tip[1], .55 + .25 * b.pulse, .35, t);
  ctx.restore();
  fxGrade(ctx, 'kawaii', .6); bloom(ctx, .14, 12);
  if (L < .1) flash(ctx, (1 - L / .1) * .5, '255,240,250');
}
function c_faceCU(ctx, t, L, D) { // 40.48–41.23: olhos em estrela (close extremo)
  const b = beatInfo(t), u = L / D, cy = 330, S = 170 + u * 40;
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + .06 * b.pulse + .06 * u, r: lerp(-.06, .05, E.io2(u)) });
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#ffd0ee'], [.5, '#d4c0ff'], [1, '#bfe9ff']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  rays(ctx, W / 2, cy, t, { n: 18, a: .22, len: 1300, sp: .3, col: '255,244,252' });
  fxBokeh(ctx, t, 8, 18, { cols: ['255,190,230', '210,190,255', '170,235,255', '255,240,170'], r0: 14, r1: 54, a: .5 });
  eyesCU(ctx, W / 2, cy, S, { magical: 1, style: 'stars', t, look: [Math.sin(u * 3) * .3, -.1], starIris: true, glowIris: .5, lash: 2, hair: '#ff7ac0', autoBlink: false, blink: 0 });
  // franja rosa/lilás nas laterais e topo (cabelo mágico)
  ctx.save();
  const hairG = lg(ctx, 0, 0, 0, cy - S * .8, [[0, '#d85aa8'], [1, '#ff8fcb']]);
  for (let i = -8; i <= 8; i++) { const hx = W / 2 + i * S * .3, hy = cy - S * (1.05 + (Math.abs(i) % 2) * .12) + Math.sin(t * 3 + i) * 2; ctx.beginPath(); ctx.ellipse(hx, hy - 70, S * .24, S * .62, i * .05, 0, TAU); ctx.fillStyle = i % 3 ? hairG : '#b69cff'; ctx.fill(); ctx.strokeStyle = '#a8458a'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(hx - S * .06, hy - 90, S * .05, S * .28, i * .05, 0, TAU); ctx.fill(); }
  ctx.restore();
  c_stars(ctx, t, W / 2, cy, 14, 5, 560, 26);
  for (const sg of [-1, 1]) ribbonWave(ctx, W / 2 + sg * 520, 120, sg > 0 ? Math.PI * .8 : Math.PI * .2, 360, t + sg, 40, 20, '255,120,190', '255,235,250', .95, { twist: 8, ph: t * 4 });
  glitter(ctx, t, 55, 40, 0, 0, W, H, { size: 24 });
  for (let i = 0; i < 8; i++) { const a = t * 1.5 + i / 8 * TAU; if (i % 2) heartShape(ctx, W / 2 + Math.cos(a) * 470, 200 + Math.sin(a) * 160 + 120, 20, a, PST_LIST[i % 4], '#fff', 2); else starShape5(ctx, W / 2 + Math.cos(a) * 470, 200 + Math.sin(a) * 160 + 120, 22, a, PST.gold, '#fff', 2); }
  ctx.restore();
  flash(ctx, (1 - seg(L, 0, .1)) * .6, '255,240,250'); bloom(ctx, .14, 12);
}
function c_feet(ctx, t, L, D) { // 41.23–41.82: pés girando (botas aladas), plano baixo
  const b = beatInfo(t), u = L / D, fy = 530, s = 230;
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + .04 * b.pulse, r: lerp(-.1, .08, E.io2(u)) });
  kawaiiSkyLite(ctx, t);
  c_floorGlow(ctx, fy - 6, t, 1);
  speedLines(ctx, W / 2, 330, t, { n: 46, r0: 200, r1: 1100, col: '#fff0fa', a: .4, seed: 8 });
  c_groundCircle(ctx, W / 2, fy + 18, 520, t * 1.8, .75, 'star');
  const st = u, pose = lerpPose(POSE.kick, POSE.twirl, E.io2(st));
  ctx.save(); ctx.translate(W / 2, fy); const sp = st * TAU * 2.2; ctx.scale(.55 + .45 * Math.abs(Math.cos(sp)), 1); ctx.translate(-W / 2, -fy);
  c_hero(ctx, W / 2, fy, s, pose, t, { shadow: false });
  ctx.restore();
  shockRing(ctx, W / 2, fy + 18, seg(L, .05, .5) * 760, 10 * (1 - seg(L, .05, .5)), 1 - seg(L, .05, .5), .2);
  sakura(ctx, t, 8, 26, { size: 20, wind: 300, fall: 40 }); glitter(ctx, t, 12, 36, 0, 0, W, H, { size: 24 });
  ctx.restore(); bloom(ctx, .14, 12);
}
function kawaiiSkyLite(ctx, t) { drawKawaiiSky(ctx, t, { y1: 540, neb: .5, rainbow: true, clouds: true, stars: true }); }

/* ============================================================
   4. CONSTELAÇÃO (41.82 – 44.3) — a câmera sobe; as luzes ligam-se; ela aponta p/ a estrela guia
   ============================================================ */
function c_constPts(camX, y0, camShift, n = 14) { // pontos sobre as casas (camadas 2 e 3), em tela
  const pts = []; const r = rng(81);
  for (const li of [1, 2, 3]) {
    const step = li === 1 ? 190 : li === 2 ? 220 : 260;
    for (let wx = -900; wx <= 900; wx += step) {
      const b = quebradaBlock(li, camX * [1, .3, .55, .85][li] * 0 + wx + (li * 37)), hh = b.h * (.55 + r() * .3);
      const sp = quebradaToScreen(li, b.x + b.w * (.3 + r() * .4), hh, camX, y0 + camShift);
      if (sp[0] > -40 && sp[0] < W + 40 && sp[1] > 80 && sp[1] < 620) pts.push([sp[0], sp[1], 3 + r() * 3]);
    }
  }
  return pts.sort((a, b) => a[0] - b[0]);
}
function c_mapSky(ctx, t, L, D, o) { // fundo comum: noite pastel + constelação sobre as casas
  const u = L / D, camX = o.camX, y0 = o.y0;
  c_world(ctx, t, camX, y0, 3, { wash: .4 });
  const pts = c_constPts(camX, y0, 0);
  const edges = []; for (let i = 0; i < pts.length - 1; i++) edges.push([i, i + 1]); for (let i = 0; i < pts.length - 3; i += 2) edges.push([i, i + 3]);
  const prog = o.prog == null ? E.io2(seg(u, .05, .8)) : o.prog;
  fxConstellation(ctx, pts, prog, { edges, t, lw: 1.8, twinkle: 1, travel: 1 });
  return pts;
}
function c_const(ctx, t, L, D) { // 41.82–43.48 : crane up
  const b = beatInfo(t), u = L / D, k = E.io2(u);
  const y0 = lerp(560, 790, k), camX = lerp(-200, 120, u);
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + .02 * b.pulse, r: lerp(.05, -.03, u) });
  // céu: a lua crescente e a estrela guia mais para cima à direita
  const pts = c_mapSky(ctx, t, L, D, { camX, y0 });
  const gx = W * .74, gy = lerp(80, 150, k);
  // lua crescente grande, cometas
  crescent(ctx, W * .18, lerp(120, 190, k), 66, -.4, PST.pearl, '#ffd6ec', 3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, W * .18, lerp(120, 190, k), 0, 220, [[0, 'rgba(255,240,252,.4)'], [1, 'rgba(255,240,252,0)']]); ctx.fillRect(0, 0, 500, 500); ctx.restore();
  for (let i = 0; i < 3; i++) { const cu = ((t * .5 + i * .37) % 1); comet(ctx, W * (1.1 - cu * 1.4) + i * 90, 60 + cu * 300 + i * 60, 2.6, 190, 4 + i, .9 * Math.sin(cu * Math.PI)); }
  fxGodRays(ctx, gx, gy, t, { n: 16, len: 800, a: .18, col: '255,236,190', sp: .06 });
  fxStar8(ctx, gx, gy, 54 + 8 * b.pulse, { rot: t * .25, glow: 1.1, t, pulse: b.pulse });
  // linha dourada da constelação até a estrela guia
  const last = pts[pts.length - 1]; if (last) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,224,150,.6)'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 20; ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(gx, gy); ctx.stroke(); ctx.restore(); }
  // heroína pequena em primeiro plano (laje) apontando
  const hs = 66, hx = W * .24, hyF = 660 + lerp(0, 60, k) * 0;
  c_laje(ctx, t, camX, hyF, 3);
  const pose = lerpPose(POSE.point, { ...POSE.point, aR: [158, 166] }, .5); pose.aR = [150 + 12 * Math.sin(t * 1.5), 160];
  c_hero(ctx, hx, hyF, hs, pose, t, { wand: 1, flip: false, face: { eye: 'happy', mouth: 'smile', look: [1, -1] } });
  const tip = c_wandTip(hx, hyF, hs, pose); glint(ctx, tip[0], tip[1], 34 + 14 * b.pulse, t * 3, '#fff');
  sakura(ctx, t, 31, 20, { size: 12, wind: 80, fall: 60 }); glitter(ctx, t, 17, 40, 0, 0, W, 520, { size: 18 });
  ctx.restore();
  fxGrade(ctx, 'kawaii', .45); bloom(ctx, .14, 12);
  if (L < .1) flash(ctx, (1 - L / .1) * .45, '255,240,250');
}
function c_pointCU(ctx, t, L, D) { // 43.48–44.3 : varinha → estrela guia
  const b = beatInfo(t), u = L / D, k = E.io2(u), s = 105, fx = W * .3, fy = 800;
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2 + lerp(40, -50, k), z: 1 + .05 * b.pulse + .06 * u, r: lerp(.12, .04, k) });
  drawNightSkyPastel(ctx, t);
  const gx = W * .76, gy = 150;
  fxGodRays(ctx, gx, gy, t, { n: 20, len: 1000, a: .24, col: '255,236,190' });
  fxStar8(ctx, gx, gy, 90 + 14 * b.pulse, { rot: t * .3, glow: 1.3, t, pulse: b.pulse });
  const pose = { lean: -6, head: -12, spread: .85, hs: .7, aR: [160, 164], aL: [-30, 70], lR: [26, -4], lL: [-6, 8] };
  c_hero(ctx, fx, fy, s, pose, t, { wand: 1, face: { eye: 'happy', mouth: 'smile', look: [1, -1] } });
  const tip = c_wandTip(fx, fy, s, pose);
  // raio dourado ligando varinha e estrela guia
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const pr = E.out3(seg(L, .05, .5)); const ex = lerp(tip[0], gx, pr), ey = lerp(tip[1], gy, pr);
  ctx.strokeStyle = 'rgba(255,224,150,.55)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(ex, ey); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
  ribbonWave(ctx, tip[0], tip[1], Math.atan2(gy - tip[1], gx - tip[0]), Math.hypot(gx - tip[0], gy - tip[1]) * pr, t, 22, 9, '255,225,150', '255,250,240', .8, { sp: 7 });
  glint(ctx, tip[0], tip[1], 56 + 20 * b.pulse, t * 4, '#fff');
  c_stars(ctx, t, W / 2, 300, 18, 9, 600, 24);
  sakura(ctx, t, 41, 22, { size: 16, wind: 120, fall: 50 }); glitter(ctx, t, 7, 40, 0, 0, W, H, { size: 20 });
  ctx.restore(); bloom(ctx, .15, 12);
  flash(ctx, (1 - seg(L, 0, .1)) * .4, '255,240,250');
}
function drawNightSkyPastel(ctx, t) { // céu de noite lilás com estrelas, bom para closes
  ctx.fillStyle = lg(ctx, 0, -300, 0, H + 300, [[0, '#2b1f78'], [.4, '#6a46c0'], [.75, '#d27ad0'], [1, '#ffb9d9']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .8; drawNebula(ctx, -100, -100, W + 200, H + 200, { z: 1.4, ox: t * 8 }); ctx.restore();
  drawStars(ctx, t, 55, 90, -100, -100, W + 200, H, .9);
  for (let i = 0; i < 4; i++) { const x = ((i * 420 + t * (6 + i * 2)) % (W + 700)) - 300; wqDrawCloud(ctx, x, 520 + (i % 2) * 40, 1.6, .55, '255,210,240', '190,150,230', .5); }
}

/* ============================================================
   5. PLANO HEROICO (44.3 – 48.3)
   ============================================================ */
function c_hero1(ctx, t, L, D) { // 44.3–46.48: ela se vira e estende a mão para a câmera
  const b = beatInfo(t), u = L / D, k = E.io2(u);
  const turn = E.io2(seg(L, 0, .6)), fy = 592, s = lerp(62, 70, k);
  ctx.save(); cam(ctx, { x: W / 2, y: lerp(H / 2 + 50, H / 2 - 20, k), z: lerp(1.04, 1.0, k) + .02 * b.pulse, r: lerp(-.08, .03, k) });
  drawNightSkyPastel(ctx, t);
  const sun = [W / 2, 300];
  rainbow(ctx, W / 2, 560, 600, 150, .55); rainbow(ctx, W / 2, 560, 770, 110, .22);
  fxGodRays(ctx, sun[0], sun[1], t, { n: 22, len: 1200, a: .26, col: '255,236,200', sp: .08 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, sun[0], sun[1], 0, 330, [[0, 'rgba(255,255,255,.95)'], [.3, 'rgba(255,225,245,.5)'], [1, 'rgba(255,200,240,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  fxStar8(ctx, sun[0], sun[1], 70 + 10 * b.pulse, { rot: t * .25, glow: 1.2, t, pulse: b.pulse });
  c_world(ctx, t, 260, fy + 40, 3, { sky: false, wash: .45, fog: 1 });
  c_laje(ctx, t, 0, fy, 3);
  c_groundCircle(ctx, W / 2, fy + 14, 300, t * 1.2, .55 + .2 * b.pulse);
  // virar de costas → frente (flip + spin leve)
  const pose = lerpPose({ ...POSE.stand, lean: 2, aR: [20, 10], aL: [-20, -10] }, POSE.pointCam, E.out3(seg(L, .25, .85)));
  pose.aRs = lerp(1, .5, seg(L, .25, .85)); pose.hR = 'cam';
  ctx.save(); ctx.translate(W / 2, fy); ctx.scale(lerp(.5, 1, E.out3(seg(L, 0, .55))), 1); ctx.translate(-W / 2, -fy);
  wingsAngel(ctx, W / 2, fy - 4.6 * s, s * 1.05, .3 + .3 * Math.sin(t * 3), .85 * seg(L, .3, .8));
  c_hero(ctx, W / 2, fy, s, pose, t, { wand: 0, face: { eye: 'happy', mouth: 'smile' } });
  ctx.restore();
  const hp = c_handPt(W / 2, fy, s, pose); const hb = seg(L, .5, 1); glint(ctx, hp[0], hp[1], 40 * hb + 10, t * 3, '#fff');
  // ondas de luz saindo da mão
  shockRing(ctx, hp[0], hp[1], ((t * 1.3) % 1) * 360, 6, (1 - (t * 1.3) % 1) * .6 * hb, .8);
  sakura(ctx, t, 3, 44, { size: 16, wind: 160, fall: 70 }); glitter(ctx, t, 5, 50, 0, 0, W, H, { size: 22 });
  floatHearts(ctx, t, 9, 8, { size: 18, a: .9 });
  prismFlare(ctx, sun[0], sun[1], .9, .35, t);
  ctx.restore();
  fxGrade(ctx, 'kawaii', .4); bloom(ctx, .16, 12);
  if (L < .1) flash(ctx, (1 - L / .1) * .5, '255,240,250');
}
function c_hero2(ctx, t, L, D) { // 46.48–47.8: close — rosto sorrindo + mão estendida enorme para a câmera
  const b = beatInfo(t), u = L / D, k = E.io2(u), s = lerp(215, 245, k);
  const pose = { ...POSE.pointCam, aR: [112, 138], aRs: .55, lean: -2, head: 4 };
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + .03 * b.pulse, r: lerp(.09, -.05, k) });
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#ffe3f2'], [.5, '#d9c8ff'], [1, '#bfe9ff']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  rays(ctx, W * .4, 300, t, { n: 20, a: .3, len: 1400, sp: .3, col: '255,244,252' });
  rainbow(ctx, W * .5, 700, 640, 160, .5);
  fxBokeh(ctx, t, 21, 16, { cols: ['255,190,230', '210,190,255', '170,235,255', '255,240,170'], r0: 14, r1: 52, a: .5 });
  const hx = W * .42, hy = 280 + 5.3 * s;
  c_hero(ctx, hx, hy, s, pose, t, { wand: 0, face: { eye: 'happy', mouth: 'smile' } });
  const hp = c_handPt(hx, hy, s, pose); glint(ctx, hp[0], hp[1], 60 + 20 * b.pulse, t * 3, '#fff');
  shockRing(ctx, hp[0], hp[1], ((t * 1.2) % 1) * 420, 8, (1 - (t * 1.2) % 1) * .7, .85);
  sakura(ctx, t, 31, 30, { size: 26, wind: 200, fall: 50 }); glitter(ctx, t, 17, 44, 0, 0, W, H, { size: 28 });
  for (let i = 0; i < 9; i++) { const a = t * 1.2 + i / 9 * TAU, px = W * .42 + Math.cos(a) * 520, py = 330 + Math.sin(a) * 200; if (i % 2) heartShape(ctx, px, py, 22, a, PST_LIST[i % 4], '#fff', 2); else starShape5(ctx, px, py, 24, a, PST.gold, '#fff', 2); }
  ctx.restore();
  fxGrade(ctx, 'kawaii', .35); bloom(ctx, .15, 12);
  flash(ctx, (1 - seg(L, 0, .1)) * .45, '255,240,250');
}
function c_end(ctx, t, L, D) { // 47.8–48.3: brilho recua — a menina simples, mundo azul-cinza; respiro
  const u = L / D, rev = sstep(.08, .24, u); // flash cobre a troca
  const m = 1 - rev;
  const fy = 585, s = 68;
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1.04, 1, u), r: 0 });
  // fundo: cor → azul-cinza silencioso
  const gray = rev;
  c_world(ctx, t, 150, fy + 40, lerp(3, 2, E.io2(gray)), { wash: .0, fog: 1, lights: 1 - gray * .85 });
  ctx.fillStyle = `rgba(120,138,160,${.25 * gray})`; ctx.fillRect(-300, -300, W + 600, H + 600);
  drawLaje(ctx, -200, fy, W + 400, lerp(3, 2, gray), { h: 26, drop: 120, mureta: 0, rebar: false, tank: 0, varal: false, ant: 0, dish: 0, plants: 0, seed: 9, t });
  const pose = lerpPose(POSE.pointCam, POSE.stand, E.io2(seg(u, .1, .5)));
  c_hero(ctx, W / 2, fy, s, pose, t, { magical: m, wand: m, pendant: 1 - m, scar: 0, face: { eye: 'neutral', mouth: 'smile' }, shadow: true });
  // brilho que recua
  c_stars(ctx, t, W / 2, 330, 14, 5, 520, 22, 1 - u);
  glitter(ctx, t, 17, 36, 0, 0, W, H, { size: 20, a: 1 - sstep(.1, .6, u) });
  sakura(ctx, t, 3, 20, { size: 14, wind: 120, fall: 60, a: 1 - sstep(0, .5, u) });
  ctx.restore();
  fxGrade(ctx, 'dayFaded', gray * .7);
  // flash branco curto na troca
  flash(ctx, (sstep(0, .06, u)) * (1 - sstep(.1, .3, u)), '255,255,255');
  // respiro: vinheta fria
  fxVignette(ctx, .35 * gray, '8,16,34');
}

/* ============================================================
   CENAS
   ============================================================ */
var SCENES_C = [
  { t0: 36.00, t1: 36.73, name: 'c_drop', fn: c_drop },
  { t0: 36.73, t1: 37.48, name: 'c_henA', fn: c_henA },
  { t0: 37.48, t1: 38.23, name: 'c_henB', fn: c_henB },
  { t0: 38.23, t1: 38.78, name: 'c_henC', fn: c_henC },
  { t0: 38.78, t1: 40.48, name: 'c_dance', fn: c_dance },
  { t0: 40.48, t1: 41.23, name: 'c_faceCU', fn: c_faceCU },
  { t0: 41.23, t1: 41.82, name: 'c_feet', fn: c_feet },
  { t0: 41.82, t1: 43.48, name: 'c_const', fn: c_const },
  { t0: 43.48, t1: 44.30, name: 'c_pointCU', fn: c_pointCU },
  { t0: 44.30, t1: 46.48, name: 'c_hero1', fn: c_hero1 },
  { t0: 46.48, t1: 47.80, name: 'c_hero2', fn: c_hero2 },
  { t0: 47.80, t1: 48.30, name: 'c_end', fn: c_end },
];
var IMPACTS_C = [
  { t: 36.00, d: .05, type: 'white' },
  { t: 38.23, d: .06, type: 'white' },
  { t: 47.80, d: .05, type: 'white' },
];
