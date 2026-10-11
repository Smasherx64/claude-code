'use strict';
/* ============================================================
   scenes_g.js — REFRÃO FINAL e FIM (102.4 → 123.1)  [agente CENAS G]
   Prefixo g_ / G_. Sem texto: o overlay faz karaokê (y>560), 'O SEU SONHO É REAL.' (topo 117.1+) e o cartão final (base 119.4+).
   Grade de batida: 0,63 + n·0,75  (102.63 103.38 104.13 104.88 105.63 106.38 107.13 107.88 108.63 109.38 110.13 110.88 111.63 112.38 113.13 ...)
   ============================================================ */
const g_GOLD = '255,214,130';
const g_pt = t => Math.floor(t * 12) / 12;            // personagem "on twos"
const g_ez = (L, a, b, f = E.io3) => f(seg(L, a, b));
const g_beat = t => beatInfo(t).pulse;

/* ---------- cosmos kawaii: céu pastel profundo + nebulosa + ouro ---------- */
function g_cosmos(ctx, t, o = {}) {
  ctx.save();
  drawKawaiiSky(ctx, t, { y1: H + 260, clouds: o.clouds === true, rainbow: false });
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = o.deep == null ? .55 : o.deep;
  ctx.fillStyle = lg(ctx, 0, -300, 0, H + 300, [[0, '#2b1a86'], [.55, '#b04fd0'], [1, '#ff9ad0']]); ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.gold == null ? .5 : o.gold;
  ctx.fillStyle = rg(ctx, o.gx == null ? 640 : o.gx, o.gy == null ? 340 : o.gy, 0, 760, [[0, 'rgba(255,224,150,.8)'], [.35, 'rgba(255,170,200,.3)'], [1, 'rgba(255,170,200,0)']]); ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  drawStars(ctx, t, o.seed || 5, 70, -200, -200, W + 400, H + 400, .8);
  ctx.restore();
}
function g_dust(ctx, t, seed, n, a = 1, o = {}) { // poeira dourada flutuante
  const r = rng(seed), x0 = o.x0 || 0, y0 = o.y0 || 0, w = o.w || W, h = o.h || H; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sp = 4 + r() * 10, x = x0 + (((r() * w + Math.sin(t * .5 + i) * 14) % w) + w) % w, y = y0 + (((r() * h - t * sp) % h) + h) % h, s = .7 + r() * 1.8, tw = .4 + .6 * Math.abs(Math.sin(t * (.7 + r()) + i));
    ctx.fillStyle = `rgba(255,${222 + r() * 30 | 0},${150 + r() * 60 | 0},${a * tw * .75})`; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    if (s > 2.1) sparkle(ctx, x, y, s * 3.2 * tw, 0, `rgba(255,244,210,${a * .8})`);
  }
  ctx.restore();
}
function g_ringStars(ctx, x, y, rx, ry, t, n, size, sp = .5, rot = 0) { // anel de estrelas girando
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  for (let i = 0; i < n; i++) {
    const a = t * sp + i / n * TAU, px = Math.cos(a) * rx, py = Math.sin(a) * ry, k = i % 3, s = size * (.7 + .3 * Math.sin(t * 4 + i * 2));
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, px, py, 0, s * 2.6, [[0, 'rgba(255,230,170,.5)'], [1, 'rgba(255,230,170,0)']]); ctx.fillRect(px - s * 2.6, py - s * 2.6, s * 5.2, s * 5.2);
    ctx.globalCompositeOperation = 'source-over';
    if (k === 0) starShape5(ctx, px, py, s, a * 2, PST.gold, '#fff', 1.6); else if (k === 1) heartShape(ctx, px, py, s * .8, Math.sin(a) * .4, PST.pink, '#fff', 1.4, true); else starShape5(ctx, px, py, s * .85, -a, PST.baby, '#fff', 1.4);
  }
  ctx.restore();
}
/* heroína (magical 1, varinha) */
function g_hero(ctx, x, y, s, pose, t, o = {}) { return drawChar(ctx, x, y, s, pose, Object.assign({ who: 'hero', magical: 1, wand: 1, t: g_pt(t), wind: .7 }, o)); }
function g_dance(ctx, who, x, y, s, t, off, style, o = {}) {
  const tt = g_pt(t), ps = dancePose(tt, off, style);
  return drawChar(ctx, x, y, s, ps, Object.assign({ who, color: 1, t: tt, wind: .5 }, o));
}
function g_vig(ctx, a = .35, col = '70,20,110') { fxVignette(ctx, a, col); }

/* ---------- elenco ---------- */
const G_CAST = [['mae', 0, 1], ['irmao', .4, 3], ['viz0', .2, 2], ['viz1', .6, 0], ['viz2', .1, 1], ['viz3', .5, 2], ['viz4', .3, 3], ['viz5', .7, 0], ['viz6', .15, 1], ['viz7', .45, 2]];
/* escolhe layout para o plano geral: lista de {who,x,y,s,off,style} */
const G_WIDE = (() => {
  const L = [], xs = [110, 215, 330, 440, 560, 720, 830, 945, 1060, 1170], ys = [632, 600, 636, 604, 640, 602, 634, 600, 638, 604];
  G_CAST.forEach((c, i) => { const front = i % 2 === 0; L.push({ who: c[0], x: xs[i], y: ys[i], s: front ? 13.5 : 11, off: c[1], style: c[2] }); });
  return L;
})();

/* ============================================================
   1. DROP — a parede da capa explode, a estrela de 8 pontas ilumina tudo
   ============================================================ */
function g_s1(ctx, t, L, D) {
  const p = L / D, bt = g_beat(t), pb = E.out2(seg(L, .03, .88));
  const z = lerp(1.75, 1.0, E.out3(p)), r = lerp(.55, 0, E.out3(p));
  ctx.save(); cam(ctx, { x: 640, y: 340, z, r });
  g_cosmos(ctx, t, { gold: 1 });
  fxGodRays(ctx, 640, 340, t, { n: 24, a: .5, sp: .4 });
  fxBurstWall(ctx, 0, 0, W, H, pb, { tone: 'night', bx: 640, by: 340, power: 1.5, cols: 12, rows: 7,
    behind: c => { g_cosmos(c, t, { gold: 1, deep: .35 }); c.fillStyle = rg(c, 640, 340, 0, 700, [[0, 'rgba(255,250,225,1)'], [.35, 'rgba(255,222,150,.7)'], [1, 'rgba(255,180,220,0)']]); c.fillRect(0, 0, W, H); } });
  fxStar8(ctx, 640, 340, lerp(40, 360, E.out3(pb)) * (1 + .05 * bt), { t, glow: 1.5, pulse: bt });
  fxShards(ctx, 640, 340, pb * 1.05, { n: 66, R: 760, seed: 3, time: t, g: .3, size: 1.2 });
  ctx.restore();
  shockRing(ctx, 640, 340, 80 + 900 * E.out3(seg(L, 0, .6)), 22 * (1 - seg(L, 0, .6)), 1 - seg(L, .1, .6), .8);
  speedLines(ctx, 640, 340, t, { n: 50, r0: 260, r1: 1100, col: '#fff3d0', a: .55 * (1 - p), seed: 3 });
  g_vig(ctx, .3);
  flash(ctx, 1 - seg(L, 0, .5), '255,246,222');
}

/* ============================================================
   2. ela surge/voa dentro da estrela (entrada triunfal, henshin relâmpago)
   ============================================================ */
function g_s2(ctx, t, L, D) {
  const p = L / D, bt = g_beat(t);
  ctx.save(); cam(ctx, { x: 640, y: 360, z: lerp(1.0, 1.3, E.in2(p)), r: lerp(-.4, .22, E.io2(p)) });
  g_cosmos(ctx, t, { gold: .8 });
  fxGodRays(ctx, 640, 350, t, { n: 26, a: .45, sp: .6 });
  ctx.restore();
  ctx.save(); cam(ctx, { x: 640, y: 360, z: 1 + .12 * Math.sin(p * 3), r: 0 });
  fxStar8(ctx, 640, 350, lerp(300, 470, p), { t, glow: 1.3, pulse: bt, rot: t * .25 });
  heartCircle(ctx, 640, 365, lerp(120, 360, E.out3(clamp(p * 1.6))), t * 1.4, .75, { kind: 'star' });
  const e = E.out3(seg(p, 0, .75)), s = lerp(5, 30, e), y = lerp(340, 610, E.out3(p)), pose = lerpPose(POSE.hensUp, POSE.hensPose, E.io2(seg(p, .2, 1)));
  const amt = 1 - seg(p, .25, .7);
  charSilhouette(ctx, 640 + Math.sin(p * 5) * 30 * (1 - p), y, s, pose, { who: 'hero', magical: 1, wand: 1, t: g_pt(t), wind: .8 }, amt, (1 - e) * 14);
  glitter(ctx, t, 21, 36, 240, 80, 800, 520, { size: 18 });
  sakura(ctx, t, 8, 22, { size: 11, wind: -160, fall: 120 });
  ctx.restore();
  shockRing(ctx, 640, 380, 40 + 700 * E.out3(seg(L, .05, .6)), 14, 1 - seg(L, .05, .6), .9);
  g_vig(ctx, .3);
}

/* ============================================================
   3. pose heroica, cosmos em espiral
   ============================================================ */
function g_s3(ctx, t, L, D) {
  const p = L / D, bt = g_beat(t), tt = g_pt(t);
  ctx.save(); cam(ctx, { x: 640, y: 360, z: lerp(1.32, 1.0, E.out3(p)), r: lerp(.3, -.05, E.io2(p)) });
  g_cosmos(ctx, t, { gold: .7, gy: 380 });
  fxGodRays(ctx, 640, 380, t, { n: 20, a: .35, sp: .35 });
  heartCircle(ctx, 640, 380, 330, t * 1.2, .8, { kind: 'heart' });
  g_ringStars(ctx, 640, 380, 400, 130, t, 14, 22, .6, -.25);
  comet(ctx, lerp(1300, -100, p), lerp(60, 330, p), 2.7, 260, 7, .9);
  comet(ctx, lerp(900, -300, (p + .4) % 1), lerp(-40, 260, (p + .4) % 1), 2.7, 200, 5, .7);
  wingsAngel(ctx, 640, 440, 190, .5 + .5 * Math.sin(tt * 7), .9);
  const pose = lerpPose(POSE.hensPose, POSE.twirl, E.io2(seg(p, 0, .6)));
  g_hero(ctx, 640, 640 - 14 * Math.sin(tt * 4), 34, pose, t, { face: 'happy', rot: Math.sin(tt * 3) * .05 });
  for (const sd of [-1, 1]) ribbonWave(ctx, 640 + sd * 40, 480, sd > 0 ? .3 : Math.PI - .3, 340, t, 26, 14, '255,156,207', '201,166,255', .8);
  glitter(ctx, t, 31, 40, 100, 60, 1080, 560, { size: 20 });
  sakura(ctx, t, 17, 24, { size: 12, wind: 140, fall: 90 });
  prismFlare(ctx, 640, 300, .7 + .2 * bt, .22, t);
  ctx.restore();
  g_vig(ctx, .32);
}

/* ============================================================
   4. plano geral aéreo da quebrada em festa (grua descendo) + rede dourada
   ============================================================ */
function g_festaBG(ctx, t, camX, y0, mood = 3) {
  drawQuebrada(ctx, camX, y0, mood, { t, sky: false, lit: 1 });
  drawBecoGround(ctx, y0, mood, camX, {});
}
function g_festaFX(ctx, t, o = {}) {
  // pipas luminosas, lanternas flutuando, glitter, sakura
  const a = o.a == null ? 1 : o.a;
  for (let i = 0; i < 6; i++) fxGlowKite(ctx, 120 + i * 210 + Math.sin(t * .6 + i) * 20, 120 + (i % 3) * 70 + Math.sin(t * .9 + i * 2) * 14, .8 + (i % 2) * .25, t + i, { a: .95 * a, col: ['255,214,130', '255,170,220', '170,230,255', '190,255,220'][i % 4], hold: [160 + i * 190, 520] });
  for (let i = 0; i < 8; i++) fxLantern(ctx, 90 + i * 160 + Math.sin(t * .8 + i) * 18, 380 - ((t * 24 + i * 70) % 330) + (i % 2) * 40, .8 + (i % 3) * .15, t + i, { col: i % 2 ? '255,170,70' : '255,150,190', a });
}
function g_s4(ctx, t, L, D) {
  const p = L / D, e = E.io2(p), bt = g_beat(t);
  g_cosmos(ctx, t, { gold: .6, gy: 300, clouds: true });
  ctx.save(); cam(ctx, { x: 640, y: lerp(60, 330, e), z: lerp(1.45, 1.0, e), r: lerp(.07, -.02, e) });
  g_festaBG(ctx, t, lerp(-60, 60, p), 560);
  const anchors = [];
  for (const q of G_WIDE.slice().sort((a, b) => a.y - b.y)) { g_dance(ctx, q.who, q.x, q.y - 55, q.s * 1.1, t, q.off, q.style); anchors.push([q.x, q.y - 55 - q.s * 6]); }
  const hs = 19, hy = 578;
  g_hero(ctx, 640, hy, hs, dancePose(g_pt(t), 0, 1), t, { face: 'happy' });
  anchors.push([640, hy - hs * 5.6]);
  fxGoldNet(ctx, anchors, seg(L, .2, 1.2), t, { hub: [640, hy - hs * 3.6], rings: 2, sag: 18, w: 1.6 });
  ctx.restore();
  g_festaFX(ctx, t);
  sakura(ctx, t, 4, 26, { size: 12, wind: 120, fall: 80 });
  glitter(ctx, t, 6, 36, 0, 0, W, H, { size: 18 });
  fxLightShafts(ctx, 640, -60, Math.PI / 2, 720, { n: 6, spread: .6, w: 90, a: .12, t });
  g_vig(ctx, .3);
}

/* ============================================================
   5. grupo médio, câmera orbitando em paralaxe, constelações ligando todos
   ============================================================ */
const G_MED = [['viz1', 150, 612, 22, 0, 0], ['viz4', 305, 618, 24, .3, 3], ['mae', 470, 622, 29, 0, 1], ['hero', 640, 632, 34, 0, 1], ['irmao', 818, 622, 24, .4, 3], ['viz6', 975, 618, 25, .15, 1], ['viz3', 1125, 612, 22, .5, 2]];
function g_s5(ctx, t, L, D) {
  const p = L / D, bt = g_beat(t), tt = g_pt(t);
  g_cosmos(ctx, t, { gold: .6, gy: 260 });
  ctx.save(); cam(ctx, { x: 640 + lerp(-40, 40, p), y: 360, z: lerp(1.05, 1.18, p), r: lerp(-.05, .05, E.io2(p)) });
  g_festaBG(ctx, t, lerp(0, 260, p), 590);
  fxLightShafts(ctx, 640, -40, Math.PI / 2, 700, { n: 7, spread: .7, w: 90, a: .1, t });
  const pts = [], edges = [];
  G_MED.forEach((c, i) => {
    const hero = c[0] === 'hero', s = c[3];
    if (hero) g_hero(ctx, c[1], c[2], s, dancePose(tt, c[4], 1), t, { face: 'happy' }); else g_dance(ctx, c[0], c[1], c[2], s, t, c[4], c[5]);
    pts.push([c[1], c[2] - s * 6.8, 2.8]);
  });
  for (let i = 0; i < pts.length - 1; i++) edges.push([i, i + 1]);
  fxConstellation(ctx, pts, seg(L, .05, .9), { edges, t, lw: 1.6, travel: t * .4 });
  fxGoldNet(ctx, pts.map(q => [q[0], q[1] + 60]), seg(L, .1, 1.1), t, { hub: [640, 330], rings: 1, sag: 20, sparks: 0 });
  ctx.restore();
  g_festaFX(ctx, t, { a: .9 });
  sakura(ctx, t, 14, 22, { size: 14, wind: 130, fall: 70 });
  glitter(ctx, t, 16, 40, 0, 0, W, H, { size: 20 });
  g_vig(ctx, .3);
}

/* ============================================================
   6. closes de rostos felizes — painéis de mangá diagonais
   ============================================================ */
const G_FACES = [['mae', 'happy', '#ffd0e4', '#ff9ccf'], ['irmao', 'grin', '#d6ecff', '#8fd6ff'], ['hero', 'wink', '#fff0b8', '#ffc24d'], ['viz2', 'love', '#d9ffe9', '#a2f5da'], ['viz4', 'happy', '#e8dcff', '#c9a6ff']];
function g_s6(ctx, t, L, D) {
  const bt = g_beat(t), n = 4, sl = 70, gap = 10, order = [0, 1, 2, 3];
  g_cosmos(ctx, t, { gold: .5 });
  ctx.fillStyle = '#fff8fc'; ctx.fillRect(0, 0, W, H);
  const faces = [G_FACES[0], G_FACES[1], G_FACES[2], G_FACES[3]];
  faces.forEach((f, i) => {
    const x0 = i * W / n - sl, x1 = (i + 1) * W / n + sl, enter = E.out3(seg(L, i * .17, i * .17 + .4)), dir = i % 2 ? 1 : -1;
    ctx.save(); ctx.translate(0, dir * (1 - enter) * 760);
    const poly4 = [[x0 + sl * 2 + gap, -10], [x1 + gap * .5 + 0, -10], [x1 - sl * 2 - gap * .5, H + 10], [x0 + gap * .5, H + 10]];
    // painel
    ctx.beginPath(); poly4.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.save(); ctx.clip();
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, f[2]], [1, mix(f[2], f[3], .6)]]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rg(ctx, (x0 + x1) / 2, 330, 0, 300, [[0, 'rgba(255,255,255,.9)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(x0 - 100, 0, x1 - x0 + 200, H);
    halftone(ctx, x0, 0, x1 - x0, H, 5, rgba(f[3], 1), t, i % 2 ? 1 : -1, .25);
    fxBokeh(ctx, t, 20 + i, 7, { cols: ['255,255,255', '255,214,130'], r0: 10, r1: 36, a: .5, x0: x0, x1: x1, y0: 100, y1: 620 });
    const cxp = (x0 + x1) / 2, zoom = 1 + .07 * seg(L, 0, D) + .03 * bt, bob = Math.sin(t * 2 + i) * 4;
    const s = 88 * zoom, feet = 340 + s * 5.35 + bob + (i % 2 ? 24 : -14);
    const tt = g_pt(t), hero = f[0] === 'hero';
    drawChar(ctx, cxp + (i - 1.5) * 4, feet, s, { ...POSE.stand, head: Math.sin(tt * 2 + i) * 6, hs: .5 }, { who: f[0], color: 1, magical: hero ? 1 : 0, t: tt, face: f[1], shadow: false, wind: .6 });
    glitter(ctx, t, 50 + i, 12, x0, 120, x1 - x0, 440, { size: 22 });
    ctx.restore();
    ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; ctx.beginPath(); poly4.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.stroke();
    ctx.restore();
  });
  floatHearts(ctx, t, 9, 10, { size: 18, a: .9 });
  sakura(ctx, t, 12, 16, { size: 12, wind: 100, fall: 100 });
  g_vig(ctx, .15);
}

/* ============================================================
   7. grande tilt-up até o céu: a constelação gigante da protagonista
   ============================================================ */
const G_FIG = { // girl em oração, coordenadas normalizadas (±1 = meia altura)
  p: [[0, -.76, 3.6], [-.2, -.97, 2], [.2, -.97, 2], [-.6, -.52, 2.6], [.6, -.52, 2.6], [0, -.58, 1.6], [-.17, -.46, 1.7], [.17, -.46, 1.7], [0, -.26, 4.2], [-.3, -.31, 1.7], [.3, -.31, 1.7], [-.1, -.08, 1.6], [.1, -.08, 1.6], [-.42, .32, 2.2], [.42, .32, 2.2], [0, .4, 2], [-.12, .78, 2.4], [.12, .78, 2.4], [-.8, -.1, 2], [.8, -.1, 2], [-.3, -.76, 1.6], [.3, -.76, 1.6]],
  e: [[1, 0], [0, 2], [1, 3], [2, 4], [0, 5], [5, 6], [5, 7], [6, 9], [7, 10], [9, 8], [10, 8], [6, 11], [7, 12], [11, 13], [12, 14], [13, 15], [14, 15], [11, 12], [15, 16], [15, 17], [3, 18], [4, 19], [20, 0], [21, 0]],
};
function g_figure(ctx, t, cx, cy, h, prog, o = {}) {
  const pts = G_FIG.p.map(q => [cx + q[0] * h * .5, cy + q[1] * h * .5, q[2] * (o.k || 1)]);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cx, cy, 0, h * .8, [[0, `rgba(255,200,230,${.28 * Math.min(1, prog * 1.4)})`], [1, 'rgba(255,200,230,0)']]); ctx.fillRect(cx - h, cy - h, h * 2, h * 2);
  fxConstellation(ctx, pts, prog, { edges: G_FIG.e, t, lw: o.lw || 2.1, travel: prog >= 1 ? t * .35 : null });
  ctx.restore();
}
function g_s7(ctx, t, L, D) { // 109.30 → 110.88 (tilt-up)
  const pr = L / D, e = E.io2(pr), dy = e * 900, bt = g_beat(t);
  ctx.save(); ctx.translate(0, dy * .22); g_cosmos(ctx, t, { gold: .55, gy: 200 - dy * .1, seed: 5 }); ctx.restore();
  // céu mais fundo conforme sobe
  ctx.fillStyle = `rgba(20,10,60,${.4 * e})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(0, dy * .5); drawStars(ctx, t, 41, 60, -50, -700, W + 100, 700, .9 * e); ctx.restore();
  // lua e cometas no alto
  crescent(ctx, 1000, lerp(-380, 140, e) , 80, -.5, '#fff0b0', 'rgba(255,255,255,.6)', 2); glint(ctx, 1000, lerp(-380, 140, e), 70, t, '#fff');
  for (let i = 0; i < 3; i++) { const u = (t * .35 + i * .33) % 1; comet(ctx, lerp(1300, 200, u) - i * 60, lerp(-350, 400, u) + i * 40, 2.6, 240, 6, .85 * Math.sin(u * Math.PI)); }
  // a constelação sobe e se completa
  g_figure(ctx, t, 640, 330 + (1 - e) * 760, 520, seg(pr, .15, .92));
  // grous de luz subindo
  for (let i = 0; i < 7; i++) { const u = ((t * .22 + i / 7) % 1), x = 140 + i * 165 + Math.sin(u * 6 + i) * 40, y = lerp(700, -80, u) - dy * .15; ctx.save(); ctx.globalAlpha = .9 * Math.sin(u * Math.PI); drawCrane(ctx, x, y, .5 + (i % 3) * .15, t * 6 + i, { gold: true, body: '#fff3cf', wing: '#ffe9a8', shade: '#ffd68a', edge: '#b9791c' }); ctx.restore(); }
  // a quebrada desce para fora do quadro
  ctx.save(); ctx.translate(0, dy);
  if (dy < 760) {
    drawQuebrada(ctx, 60, 560, 3, { t, sky: false, lit: 1 }); drawBecoGround(ctx, 560, 3, 60, {});
    for (const q of G_WIDE) g_dance(ctx, q.who, q.x, q.y - 55, q.s * 1.1, t, q.off, q.style, { }); g_hero(ctx, 640, 578, 19, dancePose(g_pt(t), 0, 1), t, { face: 'happy' });
  }
  ctx.restore();
  // luzes (lanternas) acompanham a subida
  for (let i = 0; i < 8; i++) fxLantern(ctx, 100 + i * 160 + Math.sin(t + i) * 15, 420 - ((t * 40 + i * 90) % 520) + e * 80, .75, t + i, { a: .9 });
  glitter(ctx, t, 77, 34, 0, 0, W, H, { size: 18 });
  g_vig(ctx, .3, '40,16,90');
}

/* ============================================================
   8. prece: mãos juntas, estrela-bússola brilhando, sob a constelação dela
   ============================================================ */
function g_s8(ctx, t, L, D) { // 110.88 → 111.76
  const p = L / D, bt = g_beat(t), tt = g_pt(t), z = lerp(1.0, 1.55, E.io2(p));
  ctx.save(); cam(ctx, { x: 640, y: lerp(340, 470, E.io2(p)), z, r: lerp(-.03, .02, p) });
  g_cosmos(ctx, t, { gold: .6, gy: 400, seed: 5 }); ctx.fillStyle = 'rgba(20,10,60,.4)'; ctx.fillRect(-300, -300, W + 600, H + 600);
  crescent(ctx, 1000, 140, 80, -.5, '#fff0b0', 'rgba(255,255,255,.6)', 2);
  g_figure(ctx, t, 640, 330, 520, 1);
  for (let i = 0; i < 2; i++) { const u = (t * .5 + i * .5) % 1; comet(ctx, lerp(1300, 100, u), lerp(-100, 380, u), 2.65, 220, 5, .8 * Math.sin(u * Math.PI)); }
  fxGodRays(ctx, 640, 505, t, { n: 16, a: .22 + .2 * p, sp: .1 });
  const hy = 610, s = 31;
  g_hero(ctx, 640, hy, s, POSE.pray, t, { face: 'closed', wand: 0, shadow: false });
  const sx = 640, sy = hy - s * 3.15, R = lerp(26, 60, p) * (1 + .06 * bt);
  fxStar8(ctx, sx, sy, R, { t, glow: 1.5 + p, pulse: bt, rot: Math.sin(t) * .1 });
  g_ringStars(ctx, 640, sy, 140 + 80 * p, 60, t, 10, 12, .4);
  g_dust(ctx, t, 8, 60, 1);
  glitter(ctx, t, 79, 28, 180, 100, 920, 500, { size: 18 });
  ctx.restore();
  g_vig(ctx, .35, '40,16,90');
}

/* ============================================================
   9. CLÍMAX A — ela se vira e estende a mão à câmera
   ============================================================ */
function g_s9(ctx, t, L, D) { // 111.76 → 112.90
  const p = L / D, bt = g_beat(t), tt = g_pt(t), z = lerp(1.25, 1.0, E.out3(p));
  ctx.save(); cam(ctx, { x: 640, y: 360, z, r: lerp(.45, -.1, E.out3(p)) });
  g_cosmos(ctx, t, { gold: 1, gy: 360, deep: .45 });
  fxGodRays(ctx, 640, 380, t, { n: 28, a: .5, sp: -.5 });
  fxLightShafts(ctx, 640, 400, -Math.PI / 2, 760, { n: 9, spread: .6, w: 80, a: .2, t });
  heartCircle(ctx, 640, 400, 380 + 20 * bt, t * 1.1, .7, { kind: 'star' });
  g_ringStars(ctx, 640, 400, 430, 150, t, 16, 24, .7, .35);
  g_ringStars(ctx, 640, 400, 300, 90, t, 10, 18, -.9, -.4);
  ctx.restore();
  ctx.save(); cam(ctx, { x: 640, y: 360, z: 1 + .02 * bt, r: 0 });
  const spin = Math.PI * (1 - E.io2(seg(p, .12, .36))), pose = lerpPose(POSE.hensPose, POSE.pointCam, E.io2(seg(p, .3, .8)));
  fxStar8(ctx, 640, 410, 130 + 30 * bt, { t, glow: 1.3, pulse: bt, rays: 0 });
  g_hero(ctx, 640, 660, 44, pose, t, { face: p < .5 ? 'happy' : 'sing', spin, wand: 0, shadow: false, light: 1 });
  glitter(ctx, t, 91, 44, 100, 80, 1080, 560, { size: 22 });
  ctx.restore();
  speedLines(ctx, 640, 400, t, { n: 40, r0: 330, r1: 1000, col: '#fff0d0', a: .4, seed: 9 });
  g_vig(ctx, .3);
}

/* ============================================================
   10. CLÍMAX B — close do olho: o céu inteiro refletido (starIris)
   ============================================================ */
function g_s10(ctx, t, L, D) { // 112.90 → 114.30
  const p = L / D, bt = g_beat(t), S = lerp(190, 235, E.io2(p)) * (1 + .015 * bt);
  g_cosmos(ctx, t, { gold: .8 });
  ctx.save(); cam(ctx, { x: 640, y: 360, z: 1, r: lerp(.06, -.05, E.io2(p)) });
  eyesCU(ctx, 640, 345, S, { t, open: 1, magical: 1, brow: .35, look: [Math.sin(t * 1.3) * .35, -.35], starIris: true, glowIris: .8, style: 'stars', lash: 2, iris0: '#5a3bd0', iris1: '#ffc6ee', hair: '#d070b0', refl: true });
  // reflexo do céu/constelação dentro das íris
  for (const sg of [-1, 1]) {
    const ex = 640 + sg * .74 * S + Math.sin(t * 1.3) * .35 * S * .1, ey = 345 - .35 * S * .12;
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, 345, S * .56, S * .72, 0, 0, TAU); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const q = G_FIG.p.map(a => [ex + a[0] * S * .55, 345 + a[1] * S * .6, a[2] * .6]);
    fxConstellation(ctx, q, 1, { edges: G_FIG.e, t, lw: 1.2 });
    ctx.restore();
    for (let i = 0; i < 6; i++) { const a = t * .6 + i / 6 * TAU, rr = S * .3; sparkle(ctx, ex + Math.cos(a) * rr, 345 + Math.sin(a) * rr * 1.2, S * .06 * (.7 + .3 * Math.sin(t * 5 + i)), a, '#fff'); }
    glint(ctx, ex - S * .12, 345 - S * .2, S * .16, t * .4, '#fff', '255,214,240');
  }
  ctx.restore();
  g_ringStars(ctx, 640, 345, 560, 200, t, 14, 22, .5, 0);
  fxGodRays(ctx, 640, 345, t, { n: 20, a: .28, sp: .3, len: 900 });
  glitter(ctx, t, 93, 34, 0, 60, W, 560, { size: 22 });
  g_vig(ctx, .38, '60,20,100');
}

/* ============================================================
   11. CLÍMAX C — plano heroico girando; a rede de luz sobe da quebrada
   ============================================================ */
function g_s11(ctx, t, L, D) { // 114.30 → 115.60
  const p = L / D, bt = g_beat(t), tt = g_pt(t), e = E.io2(p);
  ctx.save(); cam(ctx, { x: 640, y: 360, z: lerp(1.0, 1.28, e), r: lerp(-.3, .3, e) });
  g_cosmos(ctx, t, { gold: .9, gy: 330, deep: .55 });
  fxGodRays(ctx, 640, 340, t, { n: 26, a: .3, sp: .7, len: 1500 });
  heartCircle(ctx, 640, 350, 360, t * 1.3, .8, { kind: 'heart' });
  g_ringStars(ctx, 640, 350, 480, 170, t, 18, 26, .8, -.3);
  g_ringStars(ctx, 640, 350, 330, 100, t, 12, 18, -1, .3);
  // fios de luz subindo da quebrada (luzes lá embaixo) até a mão dela
  for (let i = 0; i < 11; i++) { const x = 40 + i * 120; fxThread(ctx, x, 800, 640 + (x - 640) * .12, 470, { p: 1, sag: -50, w: 1.5, t: t + i, sway: 8, col: g_GOLD }); }
  for (let i = 0; i < 14; i++) { const x = 40 + i * 92; ctx.fillStyle = `rgba(255,${200 + (i % 3) * 20},${150 + (i % 4) * 25},.95)`; ctx.globalAlpha = .6 + .4 * Math.sin(t * 3 + i); ctx.beginPath(); ctx.arc(x, 770 - (i % 2) * 20, 5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  wingsAngel(ctx, 640, 410, 210, .5 + .5 * Math.sin(tt * 6), .9);
  g_hero(ctx, 640, 545 + 8 * Math.sin(tt * 3.5), 38, lerpPose(POSE.cheer, POSE.hensUp, .6 + .4 * Math.sin(tt * 3)), t, { face: 'happy', wand: 1, rot: Math.sin(tt * 1.5) * .07, shadow: false });
  for (let i = 0; i < 4; i++) { const u = (t * .5 + i * .25) % 1; comet(ctx, lerp(-100, 1400, u), lerp(560, -50, u) + i * 40, -.8, 200, 5, .6); }
  glitter(ctx, t, 95, 46, -100, -50, 1480, 860, { size: 26 });
  sakura(ctx, t, 18, 22, { size: 14, wind: 200, fall: -60, a: .9 });
  ctx.restore();
  prismFlare(ctx, 640, 260, .8 + .5 * p, .25 + .25 * p, t);
  g_vig(ctx, .3, '60,20,100');
}

/* ============================================================
   12. CLÍMAX D — a mão estendida; a luz cresce ao máximo; recolhe em 116.8
   ============================================================ */
function g_s12(ctx, t, L, D) { // 115.60 → 116.85
  const p = L / D, bt = g_beat(t), tt = g_pt(t), up = E.in3(seg(L, .1, 1.0)), out = seg(L, 1.0, 1.25);
  g_cosmos(ctx, t, { gold: 1, gy: 330 });
  ctx.save(); cam(ctx, { x: 640, y: 360, z: lerp(1.0, 1.12, p), r: lerp(.1, -.06, E.io2(p)) });
  fxGodRays(ctx, 640, 340, t, { n: 32, a: .3 + .35 * up, sp: .9, len: 1500 });
  g_ringStars(ctx, 640, 340, 430, 140, t, 16, 24, 1.1, .2);
  g_hero(ctx, 400, 650, 46, POSE.pointCam, t, { face: 'happy', wand: 0, shadow: false });
  ctx.restore();
  // mão enorme em primeiro plano, esticada para a câmera, estrela-bússola na ponta
  const hs = lerp(2.3, 2.8, E.out3(seg(p, 0, .7))), hx = lerp(960, 880, E.out3(seg(p, 0, .5))) + Math.sin(t * 1.7) * 5, hyy = lerp(960, 850, E.out3(seg(p, 0, .5))), hr = -.38;
  ctx.save(); bigHand(ctx, hx, hyy, hs, hr, 0, { col: '#fde2d4', ol: '#a85a78', sh: '#f2b9b0', cuff: '#fff3f8' }); ctx.restore();
  const tx = hx + Math.sin(-hr) * -1 * 505 * hs / 2.8 * 1, ty = hyy - Math.cos(hr) * 505 * hs / 2.8;
  fxStar8(ctx, 700, 330, 70 + 60 * up + 14 * bt, { t, glow: 1.6, pulse: bt });
  glitter(ctx, t, 97, 56, 0, 0, W, H, { size: 28 });
  prismFlare(ctx, 700, 330, .8 + 1.2 * up, .35 + .5 * up, t);
  shockRing(ctx, 700, 330, 100 + 1000 * E.out3(seg(L, .4, 1.1)), 18, .6 * (1 - seg(L, .4, 1.1)), .9);
  // luz total
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 700, 330, 0, 140 + 1300 * up, [[0, `rgba(255,252,236,${.95 * up})`], [.6, `rgba(255,230,190,${.5 * up})`], [1, 'rgba(255,214,170,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  flash(ctx, up * .6 * (1 - out), '255,248,230');
  // recolhe (≈116.8): tudo se contrai em um ponto
  if (out > 0) { ctx.save(); ctx.fillStyle = `rgba(8,10,22,${E.out2(out) * .96})`; ctx.fillRect(0, 0, W, H); ctx.restore(); flare(ctx, 640, 330, .5 + .8 * (1 - out), '255,214,150', 1 - out * .6, .6 * (1 - out)); }
}

/* ============================================================
   13–14. A CAPA RECRIADA — parede rachada, estrela de 8 pontas, constelação descendo pela fenda
   ============================================================ */
const G_SIL = (() => { let c = null; return () => { if (!c) { c = document.createElement('canvas'); c.width = 520; c.height = 520; } return c; }; })();
function g_coverHero(ctx, cx, y, s, t, a, lightCol = '255,200,110') {
  const c = G_SIL(), g = c.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 520, 520);
  g.setTransform(2, 0, 0, 2, 0, 0);
  drawChar(g, 130, 240, s, { ...POSE.stand, aR: [14, 4], aL: [-14, -4] }, { who: 'hero', magical: 1, wand: 0, spin: Math.PI, t: g_pt(t), shadow: false, wind: .4, pendant: 0 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(22,16,44,.74)'; g.fillRect(0, 0, 520, 520);
  g.fillStyle = lg(g, 0, 0, 0, 480, [[0, 'rgba(255,170,90,.38)'], [.6, 'rgba(255,140,80,.0)']]); g.fillRect(0, 0, 520, 520);
  ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = `rgba(${lightCol},.95)`; ctx.shadowBlur = 16; ctx.drawImage(c, 0, 0, 520, 520, cx - 130, y - 240, 260, 260); ctx.shadowBlur = 0; ctx.restore();
}
function g_cover(ctx, t, o) {
  // o: p (rachadura), star, constel, shards, zoom, light(0..1 branco), fade(0..1 preto), topDark, botDark, hero(0..1)
  const cx = 640, cy = 300, br = .5 + .5 * Math.sin(t * TAU / 3.4), bt = g_beat(t);
  ctx.save(); cam(ctx, { x: 640, y: 380, z: o.zoom || 1, r: o.rot || 0 });
  fxCrackWall(ctx, cx, cy, t, { p: o.p == null ? 1 : o.p, star: o.star == null ? 1 : o.star, constel: o.constel == null ? 1 : o.constel, shards: o.shards || 0, shardFade: o.shardFade, pulse: o.pulse == null ? br * .8 : o.pulse, glow: o.glow == null ? 1 : o.glow, R: 128, tone: 'night' });
  g_dust(ctx, t, 31, 70, (o.dust == null ? 1 : o.dust) * .9, { y0: 0, h: H });
  if (o.hero > 0) g_coverHero(ctx, 640, 552, 19, t, o.hero);
  ctx.restore();
  // topo e base limpos para as legendas
  const td = o.topDark == null ? 0 : o.topDark, bd = o.botDark == null ? 0 : o.botDark;
  if (td > 0) { ctx.fillStyle = lg(ctx, 0, 0, 0, 200, [[0, `rgba(4,6,16,${.9 * td})`], [.55, `rgba(4,6,16,${.55 * td})`], [1, 'rgba(4,6,16,0)']]); ctx.fillRect(0, 0, W, 200); }
  if (bd > 0) { ctx.fillStyle = lg(ctx, 0, 540, 0, H, [[0, 'rgba(4,6,16,0)'], [.3, `rgba(4,6,16,${.7 * bd})`], [1, `rgba(4,6,16,${.95 * bd})`]]); ctx.fillRect(0, 540, W, H - 540); }
  fxVignette(ctx, .55, '2,4,12');
  if (o.light > 0) { flash(ctx, o.light, '255,246,222'); }
  if (o.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${o.fade})`; ctx.fillRect(0, 0, W, H); }
}
function g_s13(ctx, t, L, D) { // 116.85 → 118.90 — a luz vira a capa; câmera recua
  const p = L / D, e = E.out3(seg(L, 0, 1.9)), lt = 1 - E.out3(seg(L, .05, 1.0));
  g_cover(ctx, t, { p: 1, star: lerp(.35, 1, E.out3(seg(L, 0, .9))), constel: seg(L, .3, 1.7), shards: seg(L, 0, 1.6), shardFade: clamp(1.3 - seg(L, 0, 1.6) * 1.1), zoom: lerp(1.45, 1.0, e), rot: lerp(-.04, 0, e), light: lt, topDark: seg(L, .2, .9), botDark: .55 * seg(L, .4, 1.4), hero: seg(L, .7, 1.5), dust: seg(L, .5, 1.5) });
  // um último eco de luz da nota que acabou
  if (L < .5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; shockRing(ctx, 640, 300, 60 + 900 * E.out3(seg(L, 0, .5)), 12, .5 * (1 - seg(L, 0, .5)), .9); ctx.restore(); }
}
function g_s14(ctx, t, L, D) { // 118.90 → 123.10 — silêncio; respira; fade para preto
  const z = lerp(1.0, 1.035, L / D);
  g_cover(ctx, t, { p: 1, star: 1, constel: 1, zoom: z, topDark: 1, botDark: .6 + .4 * seg(L, 0, .5), hero: 1, glow: .85 + .15 * Math.sin(t * TAU / 3.4), fade: E.io2(seg(L, 1.5, 3.9)) });
}

/* ---------- exportação ---------- */
var SCENES_G = [
  { t0: 102.40, t1: 103.38, name: 'g_drop_burst', fn: g_s1 },
  { t0: 103.38, t1: 104.13, name: 'g_star_entrance', fn: g_s2 },
  { t0: 104.13, t1: 105.12, name: 'g_hero_pose', fn: g_s3 },
  { t0: 105.12, t1: 106.63, name: 'g_aerial_party', fn: g_s4 },
  { t0: 106.63, t1: 107.88, name: 'g_group_orbit', fn: g_s5 },
  { t0: 107.88, t1: 109.30, name: 'g_face_panels', fn: g_s6 },
  { t0: 109.30, t1: 110.88, name: 'g_tilt_up_constellation', fn: g_s7 },
  { t0: 110.88, t1: 111.76, name: 'g_prayer_compass', fn: g_s8 },
  { t0: 111.76, t1: 112.90, name: 'g_climax_turn', fn: g_s9 },
  { t0: 112.90, t1: 114.30, name: 'g_climax_eye', fn: g_s10 },
  { t0: 114.30, t1: 115.60, name: 'g_climax_orbit', fn: g_s11 },
  { t0: 115.60, t1: 116.85, name: 'g_climax_hand_light', fn: g_s12 },
  { t0: 116.85, t1: 118.90, name: 'g_cover_recreated', fn: g_s13 },
  { t0: 118.90, t1: 123.10, name: 'g_cover_end', fn: g_s14 },
];
var IMPACTS_G = [
  { t: 102.40, d: .22, type: 'white' },
  { t: 103.38, d: .14, type: 'flash' },
  { t: 105.12, d: .16, type: 'white' },
  { t: 109.30, d: .12, type: 'flash' },
  { t: 111.76, d: .22, type: 'white' },
  { t: 112.90, d: .12, type: 'flash' },
  { t: 114.30, d: .12, type: 'flash' },
  { t: 115.60, d: .12, type: 'flash' },
];
