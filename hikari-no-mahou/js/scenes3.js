'use strict';
/* ============================================================
   scenes3.js — o refrão MAHOU SHOUJO KAWAII: henshin, magia, estrelas, final
   (usa magic.js para o visual pastel holográfico)
   ============================================================ */
const HERO_X = W / 2;
/* mundo kawaii: céu pastel + nuvens + arco-íris + cidade (drawCity) com lavagem pastel por cima */
function kawaiiWorld(ctx, t, camX, y0, o = {}) {
  kawaiiSky(ctx, t, { neb: o.neb, ox: o.ox, oy: o.oy, top: o.top, mid: o.mid, bot: o.bot, gx: o.gx, gy: o.gy });
  if (o.rainbow !== false) rainbow(ctx, W * .5 - camX * .08, y0 + 40, 560, 120, .38);
  if (o.clouds !== false) { cloud(ctx, ((t * 9 + 120) % (W + 500)) - 250 - camX * .1, 150, 1.4, .9); cloud(ctx, ((t * 6 + 760) % (W + 500)) - 250, 90, 1.0, .85, '210,225,255'); cloud(ctx, ((t * 12 + 420) % (W + 500)) - 250, 270, .8, .7, '255,225,200'); }
  drawCity(ctx, camX, y0, 1, { night: o.night == null ? .1 : o.night, lit: .32, t, fog: o.fog });
  streetGround(ctx, y0, 1);
  pastelWash(ctx, o.wash == null ? 1 : o.wash, t);
  // chão pastel brilhante
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, 0, y0, 0, y0 + 120, [[0, 'rgba(255,200,235,.55)'], [1, 'rgba(190,170,255,.3)']]); ctx.fillRect(-400, y0, W + 800, 600); ctx.restore();
}
function grayWorld(ctx, camX, y0) {
  drawSky(ctx, 0, 0, -300, y0); ctx.fillStyle = lg(ctx, 0, -300, 0, y0, [[0, '#8e96a1'], [1, '#e1e3e5']]); ctx.fillRect(-300, -300, W + 600, y0 + 300);
  drawCity(ctx, camX, y0, 0, { lit: .05 }); streetGround(ctx, y0, 0);
}
/* ---- herói mágico (asas de borboleta + varinha + fitas) ---- */
function handTip(x, y, s, pose, ext = 1.5) {
  const k = skeleton(pose), a = rad(pose.aR[1]), h = k.aR[2];
  return charPt(x, y, s, pose, [h[0] + Math.sin(a) * ext, h[1] + Math.cos(a) * ext]);
}
function heroWings(ctx, x, y, s, pose, t, a = 1, size = .8) {
  const nk = charPt(x, y, s, pose, skeleton(pose).neck); wingsButterfly(ctx, nk[0], nk[1] + s * .9, s * size, t * 9, a, rad(pose.lean || 0));
}
function heroDraw(ctx, x, y, s, pose, t, o = {}) {
  if (o.wings !== false) heroWings(ctx, x, y, s, pose, t, o.wingA == null ? .95 : o.wingA, o.wingS || .8);
  return drawChar(ctx, x, y, s, pose, { t: Math.floor(t * 12) / 12, wind: 2, scarfLen: 4, hair: 0, shadow: o.shadow, face: o.face || { eye: 'happy', mouth: 'grin' }, magical: o.magical == null ? 1 : o.magical, wand: o.wand == null ? 1 : o.wand });
}
/* grua que vira luz: rastro de brilhos */
function kawaiiCranes(ctx, t, cx, cy, n, rx, ry, sc = .38, fade = 0) {
  for (let i = 0; i < n; i++) {
    const pos = tt => { const a = tt * .9 + i / n * TAU; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * (.5 + .5 * Math.sin(i))]; };
    const a = t * .9 + i / n * TAU, p = pos(t);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 1; k < 7; k++) { const q = pos(t - k * .045); sparkle(ctx, q[0], q[1], (7 - k) * 2.6 * (1 - fade), t * 4 + k, PST_LIST[(i + k) % 6]); }
    ctx.restore();
    if (fade < 1) { ctx.save(); ctx.globalAlpha = 1 - fade; drawCrane(ctx, p[0], p[1], sc * (.7 + .3 * Math.sin(a)), t * 8 + i, { gold: i % 2 === 0, rot: Math.sin(a + 1.5) * .3, body: i % 2 ? '#fff0f8' : '#fff8ea', wing: '#ffe4f2' }); ctx.restore(); }
    if (fade > 0) glint(ctx, p[0], p[1], 30 * (1 - fade * .5), t * 3 + i, '#fff');
  }
}
/* raios pastel */
function pastelRays(ctx, x, y, t, a = .2, n = 14, len = 1200) { rays(ctx, x, y, t, { n, a, len, sp: .18, col: '255,222,245' }); }

/* ---------- 9. DROP (17,35 – 21,10): "光の中で踊ろう" ---------- */
function henshin(ctx, t, L, b, y0) {
  const cx = HERO_X, fy = y0 + 62, s = 60, k1 = E.out3(seg(L, 0, 1.05));
  const dim = sstep(.26, .4, L) * (1 - sstep(.8, 1.05, L));
  ctx.save(); cam(ctx, { x: W / 2 + (1 - k1) * 30, y: H / 2 - (1 - k1) * 20, z: 1.2 - .18 * k1 + b.pulse * .02, r: (1 - k1) * .06 });
  const camX = Math.sin(t * 1.3) * 140;
  if (L < .42) { // cidade cinza -> colorida (onda de luz)
    const bx = lerp(W + 260, -320, E.io2(seg(L, 0, .4)));
    grayWorld(ctx, 0, y0);
    ctx.save(); poly(ctx, [[bx, -400], [W + 500, -400], [W + 500, H + 400], [bx - 240, H + 400]]); ctx.clip(); kawaiiWorld(ctx, t, camX, y0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [w, c] of [[30, 'rgba(255,170,230,.4)'], [9, '#ffe9a8'], [3, '#ffffff']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(bx, -100); ctx.lineTo(bx - 240, H + 100); ctx.stroke(); } ctx.restore();
  } else kawaiiWorld(ctx, t, camX, y0);
  // dimensão da transformação
  if (dim > .01) {
    ctx.save(); ctx.globalAlpha = dim; kawaiiSky(ctx, t, { top: '#3d24a8', mid: '#a8348f', bot: '#2f6fc8', gy: 380, neb: .8 });
    pastelRays(ctx, cx, 380, t * 2, .14, 18, 1300);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = holoGrad(ctx, cx, 380, t * 2, .1); ctx.fillRect(0, 0, W, H); ctx.restore();
    heartCircle(ctx, cx, 360, 330 * E.back(seg(L, .3, .5)), t * 2.5, .9);
    bubbles(ctx, t, 5, 10, { rMin: 8, rMax: 28 }); glitter(ctx, t * 1.5, 11, 40, 0, 0, W, H, { size: 20 });
    ctx.restore();
  }
  // esfera estilhaça e vira orbe de luz que entra no peito
  const sh = seg(L, 0, .3), orb = seg(L, .12, .34);
  if (L < .3) drawSphere(ctx, W / 2, 300, 120, { shatter: E.out3(sh), t });
  if (L < .36) { const ox = lerp(W / 2, cx, E.io2(orb)), oy = lerp(300, 440, E.io2(orb)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, ox, oy, 0, 90, [[0, 'rgba(255,255,255,1)'], [.4, 'rgba(255,200,235,.7)'], [1, 'rgba(255,200,235,0)']]); ctx.fillRect(ox - 90, oy - 90, 180, 180); ctx.restore(); }
  // pose / levitação / spin
  let pose;
  if (L < .3) pose = lerpPose(POSE.stand, POSE.Vup, E.out3(seg(L, .02, .3)));
  else if (L < .75) pose = lerpPose(POSE.Vup, POSE.wide, E.io2(seg(L, .3, .5)));
  else pose = lerpPose(POSE.wide, POSE.point, E.out3(seg(L, .75, .95)));
  pose.air = L < .3 ? 0 : L < .75 ? E.out3(seg(L, .3, .52)) * 1.3 : 1.3 * (1 - E.out3(seg(L, .75, 1.0))) + (L > 1 ? 0 : 0);
  const m = sstep(.45, .66, L), wand = sstep(.66, .8, L);
  const lift = pose.air * 2 * s, yb = fy - lift, yt = yb - 9.2 * s, hg = seg(L, .3, .55), un = seg(L, .75, 1.05);
  const rib = [['255,140,200', '255,230,250'], ['190,160,255', '255,220,250'], ['150,225,255', '230,250,255'], ['255,225,150', '255,250,230']];
  const showRib = L > .3 && L < 1.05;
  if (showRib) rib.forEach((c, i) => ribbonHelix(ctx, cx, yb + 20, yt, (150 + un * 260) * (1 - .0 * i), 2.4, i * TAU / 4 + t * 7, 12 * (1 - un * .5), c[0], c[1], 'back', .85 * (1 - un), E.out2(hg)));
  if (L >= .3 && L < .78) charSilhouette(ctx, cx, fy, s, pose, { magical: m, wand: wand, t: Math.floor(t * 12) / 12, wind: 2, scarfLen: 4, hair: 0, face: { eye: 'happy', mouth: 'grin' } }, sstep(.3, .4, L) * (1 - sstep(.62, .78, L)), E.out2(seg(L, .3, .76)) * TAU * 3);
  else heroDraw(ctx, cx, fy, s, pose, t, { magical: L < .3 ? 0 : 1, wand: L < .3 ? 0 : 1, wings: L > .78, wingA: seg(L, .78, 1.0), face: { eye: 'happy', mouth: 'grin' } });
  if (showRib) rib.forEach((c, i) => ribbonHelix(ctx, cx, yb + 20, yt, (150 + un * 260), 2.4, i * TAU / 4 + t * 7, 12 * (1 - un * .5), c[0], c[1], 'front', .85 * (1 - un), E.out2(hg)));
  // órbita de corações e estrelas
  if (L > .3 && L < 1.0) for (let i = 0; i < 12; i++) { const an = t * 5 + i / 12 * TAU, rr = 230 + 40 * Math.sin(i), px = cx + Math.cos(an) * rr, py = (yb + yt) / 2 + Math.sin(an) * rr * .35 - (i % 4) * 30; ctx.globalAlpha = hg * (1 - un); if (i % 2) heartShape(ctx, px, py, 14, an, PST_LIST[i % 4], '#fff', 2); else starShape5(ctx, px, py, 16, an, PST_LIST[(i + 1) % 6], '#fff', 2); ctx.globalAlpha = 1; }
  // estouro da transformação na batida (L=.75)
  const bu = seg(L, .75, 1.55);
  if (L >= .75) {
    shockRing(ctx, cx, yb - 3.2 * s, 80 + E.out3(seg(L, .75, 1.2)) * 700, 14 * (1 - bu), 1 - bu); shockRing(ctx, cx, yb - 3.2 * s, 40 + E.out3(seg(L, .78, 1.2)) * 480, 6, (1 - bu) * .8);
    starBurst(ctx, cx, yb - 3.2 * s, bu, 26, 4, 560, 28);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - bu); starShape5(ctx, cx, yb - 3.2 * s, 420 * E.out3(seg(L, .75, 1.05)), L * 2, 'rgba(255,230,250,.35)', 'rgba(255,255,255,.9)', 5, .45); ctx.restore();
    const hp = handTip(cx, fy - lift, s, pose, 1.2); glint(ctx, hp[0], hp[1], 70 * (1 - bu * .4), L * 4, '#fff');
  }
  ctx.restore();
  flash(ctx, (1 - E.out3(seg(L, 0, .22))) + sstep(.73, .75, L) * (1 - sstep(.75, .88, L)) * .75, '255,240,250');
  flash(ctx, sstep(.27, .3, L) * (1 - sstep(.3, .36, L)) * .5, '255,214,240');
}
function sceneDrop(ctx, t, L, D) {
  const b = beatInfo(t), y0 = 640;
  const sub = L < 1.05 ? 0 : L < 2.3 ? 1 : L < 2.85 ? 2 : 3;
  if (sub === 0) {
    henshin(ctx, t, L, b, y0);
  } else if (sub === 1) { // dança no mundo pastel
    const u = seg(L, 1.05, 2.3), camX = Math.sin(t * 1.3) * 140;
    ctx.save(); cam(ctx, { x: W / 2 + Math.sin(t * .9) * 50, y: H / 2 + Math.cos(t * .9) * 18, z: 1.03 + b.pulse * .035 + u * .03, r: Math.sin(t * 1.1) * .025 });
    kawaiiWorld(ctx, t, camX, y0);
    pastelRays(ctx, W / 2, 330, t, .22);
    heartCircle(ctx, W / 2, 330, 215, t * 1.1, .38 + .25 * b.pulse);
    kawaiiCranes(ctx, t, W / 2, 300, 8, 480, 220);
    const pose = dancePose(t); pose.scarfDir = -1; const hy = y0 + 78 - pose.bounce * 20, hs = 70;
    ribbonFollow(ctx, tt => { const p = dancePose(tt); return handTip(W / 2, y0 + 78 - p.bounce * 20, hs, p, 1.4); }, t, .42, 20, 14, '255,140,200', '190,170,255', .9, { sparks: 16 });
    heroDraw(ctx, W / 2, hy, hs, pose, t);
    const ht = handTip(W / 2, hy, hs, pose, 1.4); glint(ctx, ht[0], ht[1], 34 + 20 * b.pulse, t * 3, '#fff');
    sakura(ctx, t, 21, 36, { size: 13, wind: 110, fall: 80 }); glitter(ctx, t, 31, 44, 0, 0, W, H, { size: 18 });
    floatHearts(ctx, t, 41, 9, { size: 18, a: .9 }); bubbles(ctx, t, 17, 6);
    bokeh(ctx, t, 31, 12, ['#ffd0ec', '#d8c2ff', '#bfe9ff', '#fff2b0'], { a: .45, rMin: 14, rMax: 50, sp: 20, dy: 1 });
    prismFlare(ctx, W / 2, 380, .8 + b.pulse * .3, .45, t);
    shockRing(ctx, W / 2, y0 + 40, b.f * 520, 6, (1 - b.f) * .6, .18);
    ctx.restore();
    flash(ctx, seg(L, 1.05, 1.07) * (1 - seg(L, 1.07, 1.25)) * .7, '255,235,250');
  } else if (sub === 2) { // close nos pés dançando + rodopio
    const st = seg(L, 2.3, 2.85), pose = lerpPose(POSE.kick, POSE.wide, E.io2(st));
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .05, r: lerp(-.1, .06, st) });
    kawaiiSky(ctx, t, { top: '#c6a8ff', mid: '#ffb0dc', bot: '#c0ecff', gy: 350 });
    ctx.fillStyle = lg(ctx, 0, 560, 0, 760, [[0, '#ffc2e6'], [1, '#b99cf5']]); ctx.fillRect(-200, 590, W + 400, 300);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, 590, 0, 700, [[0, 'rgba(255,255,255,.7)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-200, 585, W + 400, 8); ctx.restore();
    speedLines(ctx, W / 2, 380, t, { n: 46, r0: 200, r1: 1100, col: '#fff0fa', a: .5, seed: 8 });
    heartCircle(ctx, W / 2, 640, 300, t * 1.6, .55, { kind: 'star' }); // círculo no chão (achatado)
    ctx.save(); ctx.translate(W / 2 + 10, 640); const sp = st * TAU * 2; ctx.scale(.55 + .45 * Math.abs(Math.cos(sp)), 1); ctx.translate(-(W / 2 + 10), -640);
    drawChar(ctx, W / 2 + 10, 640, 190, pose, { t: Math.floor(t * 12) / 12, face: { eye: 'happy', mouth: 'grin' }, shadow: false, magical: 1, wand: 1, hair: 0 });
    ctx.restore(); sakura(ctx, t, 8, 30, { size: 18, wind: 260, fall: 40 }); glitter(ctx, t, 12, 36, 0, 0, W, H, { size: 22 });
    ctx.restore();
    const ring = seg(L, 2.5, 2.8); ctx.save(); ctx.globalAlpha = 1 - ring; ctx.lineWidth = 6; ctx.strokeStyle = holoGrad(ctx, W / 2, 640, 0, 1); ctx.beginPath(); ctx.ellipse(W / 2, 640, 120 + ring * 520, 22 + ring * 80, 0, 0, TAU); ctx.stroke(); ctx.restore();
  } else { // close no rosto sorrindo
    const st = seg(L, 2.85, D);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .05 + st * .1, r: lerp(-.3, .25, E.io2(st)) });
    kawaiiSky(ctx, t, { top: '#ffd0ee', mid: '#ffb4dc', bot: '#d4c0ff', ox: -200, gx: W / 2, gy: H / 2 });
    pastelRays(ctx, W / 2, H / 2, t, .35, 16, 1300);
    heartCircle(ctx, W / 2, H / 2, 400, t, .45);
    for (const sg of [-1, 1]) ribbonWave(ctx, W / 2 + sg * 160, H / 2 - 190, sg > 0 ? -.25 : Math.PI + .25, 380, t + sg, 40, 22, '255,120,190', '255,235,250', .95, { twist: 8, ph: t * 4 });
    ctx.save(); ctx.translate(W / 2, H / 2 + 20); ctx.scale(230, 230); ctx.rotate(Math.sin(t * 5) * .08); drawHead(ctx, (typeof PAL !== 'undefined' && PAL.heroMagic) || PAL.hero, { face: { eye: 'happy', mouth: 'grin' }, magical: 1 }, 0, t); ctx.restore();
    for (let i = 0; i < 12; i++) { const a = t * 1.5 + i / 12 * TAU, d = 350 + Math.sin(t * 4 + i) * 30, px = W / 2 + Math.cos(a) * d, py = H / 2 + Math.sin(a) * d * .7; if (i % 3 === 0) heartShape(ctx, px, py, 20, a, PST_LIST[i % 4], '#fff', 2); else if (i % 3 === 1) starShape5(ctx, px, py, 22, a, PST.gold, '#fff', 2); else glint(ctx, px, py, 22, a, '#fff'); }
    glitter(ctx, t, 55, 40, 0, 0, W, H, { size: 22 });
    ctx.restore();
  }
  bloom(ctx, .14, 12);
}

/* ---------- 10. MAGIA (21,10 – 23,80): "魔法はまだ消えていない" ---------- */
function sceneMagic(ctx, t, L, D) {
  const b = beatInfo(t), y0 = 640;
  if (L < .95) { // círculo mágico + 魔法 em slam
    const p = E.back(seg(L, 0, .3)), kz = 1 + (1 - E.out5(seg(L, 0, .22))) * 1.6;
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2 - 10 * (1 - p), z: 1 + b.pulse * .04 + (1 - p) * .1, r: (1 - p) * .05 });
    kawaiiWorld(ctx, t, 60, y0, { wash: 1.1 });
    ctx.fillStyle = 'rgba(70,30,120,.28)'; ctx.fillRect(-400, -400, W + 800, H + 800);
    pastelRays(ctx, W / 2, 400, t * 2, .28, 18);
    heartCircle(ctx, W / 2, 400, 290 * p, t * 1.5 + (1 - p) * 4, 1);
    const pose = { lean: -4, head: -16, spread: .85, hs: .55, aR: [172, 176], aL: [-14, -6], lR: [8, 0], lL: [-8, 0] };
    const hs = 46, tip = handTip(W / 2, y0 + 62, hs, pose, 1.5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, 0, 0, tip[1], [[0, 'rgba(255,230,250,0)'], [1, 'rgba(255,230,250,.5)']]); ctx.fillRect(tip[0] - 26 - 30 * b.pulse, 0, 52 + 60 * b.pulse, tip[1]); ctx.restore();
    heroDraw(ctx, W / 2, y0 + 62, hs, pose, t, { face: { eye: 'determined', mouth: 'open', look: [0, -1] } });
    glint(ctx, tip[0], tip[1], 56 + 20 * b.pulse, t * 4, '#fff');
    starBurst(ctx, W / 2, 400, seg(L, 0, .8), 24, 6, 600, 26);
    sakura(ctx, t, 3, 30, { size: 14, wind: 130 }); glitter(ctx, t, 5, 40, 0, 0, W, H, { size: 20 });
    shockRing(ctx, W / 2, 400, E.out3(seg(L, 0, .5)) * 900, 12, 1 - seg(L, 0, .5));
    ctx.restore(); flash(ctx, 1 - seg(L, 0, .22), '255,240,252');
  } else if (L < 1.75) { // olho com estrelas
    const u = seg(L, .95, 1.75);
    ctx.save(); ctx.fillStyle = '#c9a8ff'; ctx.fillRect(0, 0, W, H); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1, 1.12, u), r: 0 });
    kawaiiSky(ctx, t, { top: '#a58cff', mid: '#ff9fd6', bot: '#9fdcff', z: 1.8, ox: 100 });
    pastelRays(ctx, W / 2, H / 2, t, .25, 16);
    const Sx = 285, ey = H / 2 + 10;
    eyesCU(ctx, W / 2, ey, Sx, { open: 1, brow: .4, look: [Math.sin(t * 2) * .5, -.4], iris: .27, pupil: .36, starIris: true, glowIris: .5, t, irisIn: '#ffe6fa', irisMid: '#d78bff', irisOut: '#6a3bc4', skinTop: '#f7d3c2', skin: '#fde7d9', skinBot: '#f6cdbb', hair: '#2a1a3e' });
    // estrelinhas e corações nas íris
    for (const sg of [-1, 1]) { const ex = W / 2 + sg * .74 * Sx + Math.sin(t * 2) * .5 * .075 * Sx - sg * .015 * Sx, ei = ey + (-.4) * .06 * Sx + .02 * Sx; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a = t * 1.2 + i / 7 * TAU, d = Sx * .1 * (i % 2 ? 1 : .5); starShape5(ctx, ex + Math.cos(a) * d, ei + Math.sin(a) * d, Sx * .028 * (.8 + .4 * Math.sin(t * 8 + i)), a, PST_LIST[i % 6]); } sparkle(ctx, ex, ei, Sx * .12, t * 2, '#fff'); ctx.restore(); }
    fringe(ctx, W / 2, 60, 290, t, '#2a1a4e');
    heartCircle(ctx, W / 2, H / 2, 430, t * 1.2, .26);
    glitter(ctx, t, 77, 50, 0, 0, W, H, { size: 26 }); floatHearts(ctx, t, 9, 8, { size: 20 });
    ctx.restore(); letterbox(ctx, 112);
  } else { // janelas formam um coração
    const u = seg(L, 1.75, D), hx = W / 2, cy = 330;
    ctx.save(); cam(ctx, { x: W / 2 + Math.sin(u * 3) * 25, y: H / 2, z: lerp(1.15, 1, E.out2(u)), r: lerp(.03, 0, u) });
    kawaiiWorld(ctx, t, 0, y0, { wash: 1.0, night: .25 });
    ctx.fillStyle = 'rgba(70,30,120,.32)'; ctx.fillRect(-400, -400, W + 800, H + 800);
    const R = 210; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let gx = -280; gx <= 280; gx += 26) for (let gy = -250; gy <= 260; gy += 26) {
      const x = gx / R * 1.25, y = -gy / R * 1.25, f = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y; if (f > 0) continue;
      const dly = Math.hypot(gx, gy) / 420 * .55, on = seg(u, dly, dly + .1), fl = .7 + .3 * Math.sin(t * 12 + gx * .1 + gy * .07);
      const col = PST_RGB[Math.abs(Math.round(gx / 26 + gy / 26)) % 5];
      ctx.fillStyle = `rgba(${col},${on * fl * .95})`; ctx.fillRect(hx + gx - 8, cy + gy - 28, 16, 16);
      ctx.fillStyle = `rgba(${col},${on * .16})`; ctx.fillRect(hx + gx - 20, cy + gy - 40, 40, 40);
    }
    ctx.restore();
    const hOn = seg(u, .45, .9); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = holoGrad(ctx, hx, cy - 20, t, hOn * .9); ctx.lineWidth = 6; heartPath(ctx, hx, cy - 20, R * .9, 0); ctx.stroke(); ctx.restore();
    heartCircle(ctx, W / 2, 190, 150, t, .5 * hOn, { kind: 'star' });
    const pose = lerpPose(POSE.stand, POSE.Vup, .6 + .4 * Math.sin(t * 6)); const hs = 56;
    heroDraw(ctx, W / 2, y0 + 74, hs, pose, t, { face: { eye: 'happy', mouth: 'smile' } });
    floatHearts(ctx, t, 19, 12, { size: 20 }); sakura(ctx, t, 13, 28, { size: 13, wind: 80 }); glitter(ctx, t, 29, 44, 0, 0, W, H, { size: 20 });
    prismFlare(ctx, W / 2, 330, .7, .35 * hOn, t);
    ctx.restore();
  }
  bloom(ctx, .14, 12);
}

/* ---------- 11. ESTRELAS (23,80 – 26,90): "星が導く 信じて" ---------- */
const CONST_PTS = [[160, 560], [300, 470], [420, 500], [560, 380], [700, 330], [800, 230], [940, 250], [1060, 140], [1180, 90]];
function sceneStars(ctx, t, L, D) {
  const b = beatInfo(t);
  if (L < 2.2) {
    const u = E.io3(seg(L, 0, 2.1)), gy = lerp(560, 1250, u);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .02, r: Math.sin(L * 1.2) * .02 });
    kawaiiSky(ctx, t, { top: '#3f35b8', mid: '#a15ad8', bot: '#ff9fcf', ox: lerp(-200, 200, u), oy: lerp(180, -180, u), z: 1.25, neb: .9, gx: 900, gy: 200 });
    glitter(ctx, t, 7, 80, 0, 0, W, H, { size: 20 }); drawStars(ctx, t, 7, 90, 0, 0, W, H, 1);
    crescent(ctx, 170, 150, 80, -.5, '#fff6c8', 'rgba(255,255,255,.9)', 3); glint(ctx, 140, 110, 34, t, '#fff');
    // constelação (linha pérola) + estrelas de 5 pontas
    const prog = seg(L, .5, 2.1) * (CONST_PTS.length - 1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < CONST_PTS.length - 1; i++) { const p = clamp(prog - i); if (p <= 0) continue; const a = CONST_PTS[i], c = CONST_PTS[i + 1]; for (const [w, col] of [[10, 'rgba(255,170,230,.28)'], [2.8, 'rgba(255,248,252,.95)']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], c[0], p), lerp(a[1], c[1], p)); ctx.stroke(); } }
    ctx.restore();
    CONST_PTS.forEach((p, i) => { if (prog >= i - .1) { const pop = E.back(clamp((prog - i + .1) * 3)); ctx.save(); starShape5(ctx, p[0], p[1], 20 * pop * (1 + .12 * Math.sin(t * 5 + i)), t * .5 + i, i % 2 ? PST.gold : PST.pink, '#fff', 2.5); ctx.restore(); glint(ctx, p[0], p[1], 34 * pop, t * .5, '#fff'); } });
    for (let i = 0; i < 3; i++) { const k = ((t * .5 + i * .37) % 1.2) / 1.2; comet(ctx, 1300 - k * 1500 + i * 200, -50 + k * 700 + i * 40, 2.2, 260, 4, 1 - k * .5); }
    // revoada de gruas seguindo o caminho (viram brilhos)
    for (let i = 0; i < 7; i++) { const f = clamp(seg(L, .7 + i * .12, 2.2)), kk = f * (CONST_PTS.length - 1), a = Math.min(Math.floor(kk), CONST_PTS.length - 2), c = kk - a; if (f <= 0) continue; const x = lerp(CONST_PTS[a][0], CONST_PTS[a + 1][0], c) + (i % 3 - 1) * 40, y = lerp(CONST_PTS[a][1], CONST_PTS[a + 1][1], c) + (i % 3 - 1) * 26 + Math.sin(t * 3 + i) * 14; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let q = 1; q < 6; q++) sparkle(ctx, x - q * 18, y + q * 6, (6 - q) * 3, t * 3 + q, PST_LIST[(i + q) % 6]); ctx.restore(); drawCrane(ctx, x, y, .36 + (i % 3) * .05, t * 9 + i, { gold: true, rot: -.4, body: '#fff0f8', wing: '#ffe4f2' }); }
    // chão: bairro com vizinhos dançando felizes
    ctx.save(); ctx.translate(0, gy - 640);
    drawCity(ctx, 0, 640, 1, { night: .2, lit: .32, fog: 0 }); streetGround(ctx, 640, 1); pastelWash(ctx, 1, t);
    for (let i = 0; i < 6; i++) {
      const x = 150 + i * 195 + (i > 2 ? 30 : 0), hero = i === 3, pose = dancePose(t, i * .19), s = hero ? 62 : 52;
      if (hero) { heroWings(ctx, x, 700, s, pose, t, .95, .8); drawChar(ctx, x, 700, s, pose, { hair: 0, t: Math.floor(t * 12) / 12, wind: 2, magical: 1, wand: 1, face: { eye: 'happy', mouth: 'grin' } }); }
      else { drawChar(ctx, x, 700, s, pose, { pal: neighPal(i, 1), hair: i % 4, t: Math.floor(t * 12) / 12, wind: 1.4, face: { eye: 'happy', mouth: 'grin' } }); const hh = Math.abs(Math.sin(t * 3 + i)) * 10; heartShape(ctx, x + 18, 700 - 9.4 * s - 20 - hh, 11, .2, PST_LIST[i % 4], '#fff', 1.5); }
    }
    sakura(ctx, t, 31, 24, { x0: 0, y0: 400, w: W, h: 320, size: 12 });
    ctx.restore(); ctx.restore();
  } else { // mãos em prece, asas de anjo
    const u = seg(L, 2.2, D);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1, 1.1, u), r: lerp(.04, -.02, u) });
    kawaiiSky(ctx, t, { top: '#8f78f0', mid: '#f3a2dc', bot: '#a8e4ff', ox: 300, oy: -150, z: 1.4, gx: W / 2, gy: 330 });
    pastelRays(ctx, W / 2, 360, t, .3, 14);
    heartCircle(ctx, W / 2, 340, 340, t, .6);
    cloud(ctx, 160, 600, 1.6, .95); cloud(ctx, 1130, 620, 1.7, .95, '210,225,255'); cloud(ctx, 640, 700, 2.2, .98);
    const pose = { lean: 0, head: -14, spread: .85, hs: .55, aR: [34, -128], aL: [-34, 128], lR: [6, 0], lL: [-6, 0], frontR: true, frontL: true };
    const hips = 600, hs = 92, foot = skeleton(pose).foot, nk = charPt(W / 2, hips + foot * hs, hs, pose, skeleton(pose).neck);
    wingsAngel(ctx, nk[0], nk[1] + 30, 260, .5 + .5 * Math.sin(t * 2.5), 1);
    drawChar(ctx, W / 2, hips + foot * hs, hs, pose, { t: Math.floor(t * 12) / 12, wind: 1.4, scarfLen: 4, shadow: false, hair: 0, magical: 1, wand: 0, face: { eye: 'closed', mouth: 'smile', look: [0, -1] } });
    const hp = charPt(W / 2, hips + foot * hs, hs, pose, [0, -1.1]);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, -50, 0, hp[1], [[0, 'rgba(255,230,250,0)'], [1, 'rgba(255,230,250,.45)']]); ctx.fillRect(hp[0] - 40, -50, 80, hp[1] + 50); ctx.restore();
    drawSphere(ctx, hp[0], hp[1], 38 + b.pulse * 3, { crack: 1, glow: 1, t });
    glint(ctx, hp[0], hp[1], 80 + 20 * b.pulse, t * 2, '#fff');
    // halo de plumas
    sakura(ctx, t, 23, 36, { size: 14, wind: 60, fall: 60 }); glitter(ctx, t, 41, 50, 0, 0, W, H, { size: 22 }); floatHearts(ctx, t, 6, 8, { size: 18, a: .9 }); bubbles(ctx, t, 9, 8);
    ctx.restore();
  }
  bloom(ctx, .14, 12);
}

/* ---------- 12. FINAL (26,90 – 30,60): "あなたの夢は本物だよ" → capa recriada ---------- */
function sceneFinale(ctx, t, L, D) {
  const b = beatInfo(t);
  if (L < 1.5) {
    const u = seg(L, 0, 1.5);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .03 + u * .08, r: lerp(-.04, .03, u) });
    kawaiiSky(ctx, t, { top: '#ffc9ec', mid: '#ffb0d8', bot: '#c9bbff', ox: 100, gx: W / 2, gy: 330 });
    speedLines(ctx, W / 2, 330, t, { n: 60, r0: 240, r1: 1200, col: '#fff3fb', a: .5, seed: 12 });
    heartCircle(ctx, W / 2, 330, 330, t, .4, { kind: 'star' });
    const kf = seg(t, 27.7, 28.0) * (1 - seg(t, 28.15, 28.4));
    if (kf > 0) { glowKanji(ctx, '夢', W / 2, 340, 760, kf, 0); starBurst(ctx, W / 2, 340, 1 - kf, 20, 3, 600, 26); }
    const pose = { lean: -2, head: 2, spread: .85, hs: .55, aR: [118, 100], aL: [-14, -6], lR: [6, 0], lL: [-6, 0], frontR: true };
    const hip = 640, hs = 92, fy = hip + skeleton(pose).foot * hs;
    heroWings(ctx, 330, fy, hs, pose, t, .95, .75);
    drawChar(ctx, 330, fy, hs, pose, { t: Math.floor(t * 12) / 12, wind: 1.8, scarfLen: 4, shadow: false, hair: 0, magical: 1, wand: 1, face: { eye: 'open', mouth: 'smile', look: [0, 0] } });
    const hsz = lerp(1.4, 3.0, E.in2(seg(L, .1, 1.5)));
    bigHand(ctx, lerp(1020, 930, u), lerp(860, 730, u), hsz, -.25, .0, { cuff: '#ff8fc8', col: '#fde7d9' });
    const fp = [900 - Math.sin(.5) * 0, 820 - 100 * hsz]; // aprox. ponta dos dedos
    ctx.save(); ctx.globalAlpha = seg(L, .3, .6); floatHearts(ctx, t, 17, 10, { x0: 640, w: 520, y0: 0, h: 600, size: 22 }); ctx.restore();
    glint(ctx, 840 + u * 40, 330 - u * 10, 70 + 20 * b.pulse, t * 2, '#fff');
    sakura(ctx, t, 63, 36, { size: 15, wind: 220, fall: 40 }); glitter(ctx, t, 71, 50, 0, 0, W, H, { size: 22 });
    ctx.restore();
  } else {
    const u = seg(L, 1.5, D), z = lerp(1.7, 1, E.out3(seg(L, 1.5, 2.9))), reveal = E.io2(seg(L, 1.6, 3.2)), lx = lerp(560, 400, reveal), fade = seg(t, 29.1, 29.8);
    ctx.save(); cam(ctx, { x: W / 2, y: 330, z: z, r: 0 });
    drawNebula(ctx, -100, -100, W + 200, H + 200, { z: 1.0 });
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, 0, 0, W, H, [[0, 'rgba(255,170,225,.12)'], [1, 'rgba(180,160,255,.3)']]); ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore();
    // metade esquerda: prédios cinza (como a capa) - a cor pastel avança devagar
    ctx.save(); poly(ctx, [[-300, -300], [lx, -300], [lx - 90, 1000], [-300, 1000]]); ctx.clip(); grayWorld(ctx, -220, 700); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = holoLin(ctx, 0, -300, 0, 1000, .95, Math.floor(t * 3) % 5); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx, -300); ctx.lineTo(lx - 90, 1000); ctx.stroke(); ctx.restore();
    pastelRays(ctx, W / 2, 330, t, .18);
    heartCircle(ctx, W / 2, 330, 250 + 10 * b.pulse, t * .8, .45 * seg(L, 1.8, 2.5), { nofill: true });
    drawSphere(ctx, W / 2, 330, 120 * (1 + b.pulse * .03), { crack: 1, glow: .45, t });
    kawaiiCranes(ctx, t, W / 2, 330, 6, 440, 190, .38, fade);
    ctx.save(); ctx.globalAlpha = 1 - fade; drawCrane(ctx, 1080, 560, .8, t * 6, { rot: -.3 }); drawCrane(ctx, 1190, 120, .5, t * 7 + 2, { rot: .3 }); ctx.restore();
    prismFlare(ctx, W / 2, 330, .8 + .08 * b.pulse, .45, t);
    const pose = lerpPose(POSE.stand, POSE.Vup, E.out3(seg(L, 1.6, 2.0)));
    heroDraw(ctx, 300, 700, 44, pose, t, { face: { eye: 'happy', mouth: 'smile' }, wingS: .75 });
    const tip = handTip(300, 700, 44, pose, 1.4); glint(ctx, tip[0], tip[1], 30, t * 3, '#fff');
    sakura(ctx, t, 83, 30, { size: 12, wind: 70 }); glitter(ctx, t, 91, 46, 0, 0, W, H, { size: 20 }); bubbles(ctx, t, 3, 6);
    ctx.restore();
  }
  bloom(ctx, .14, 12);
  flash(ctx, seg(t, 29.9, 30.6), '0,0,0');
}
