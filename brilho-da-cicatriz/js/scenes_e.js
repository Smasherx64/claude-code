'use strict';
/* ============================================================
   scenes_e.js — REFRÃO 2 (72.8–86.5) + RESPIRO (86.5–91.28)
   mágico kawaii emocional · payoff da REDE DE APOIO dourada · calma da laje
   prefixo e_ / E_
   ============================================================ */
const E_T = t => Math.floor(t * 12) / 12;
const E_LY = 400, E_RX0 = 385, E_RX1 = 895, E_RY = 335, E_SAG = 22;           // palco da corda bamba
const E_PEOPLE = [['viz1', 40, 3], ['viz0', 110, 0], ['viz7', 175, 2], ['mae', 245, 1], ['irmao', 312, 4],
  ['viz2', 968, 1], ['viz3', 1035, 3], ['viz4', 1105, 2], ['viz5', 1170, 0], ['viz6', 1238, 4]];
const E_LCOL = ['255,170,70', '255,150,190', '190,170,255', '150,230,210', '255,210,110'];
const E_ROSE = ['rgba(255,170,220,', 'rgba(255,230,160,'];
const E_HUB = [640, 450];

/* ---------------- helpers ---------------- */
function e_moon(ctx, x, y, R, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, R * .6, R * 4.2, [[0, 'rgba(255,225,245,.42)'], [.4, 'rgba(255,190,235,.12)'], [1, 'rgba(255,190,235,0)']]); ctx.fillRect(x - R * 4.2, y - R * 4.2, R * 8.4, R * 8.4);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rg(ctx, x - R * .3, y - R * .3, R * .1, R * 1.15, [[0, '#fffdf6'], [.7, '#ffeef8'], [1, '#f2d4f0']]); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(230,170,215,.22)';
  for (const [dx, dy, r] of [[-.3, -.2, .2], [.25, .3, .28], [.35, -.35, .12], [-.2, .45, .12]]) { ctx.beginPath(); ctx.arc(x + dx * R, y + dy * R, r * R, 0, TAU); ctx.fill(); } ctx.restore();
  ctx.restore();
}
/* fundo em paralaxe: sky kawaii + lua + quebrada (câmera amortecida) */
function e_bg(ctx, t, cm, o = {}) {
  const k = o.par == null ? .4 : o.par;
  ctx.save();
  cam(ctx, { x: W / 2 + (cm.x - W / 2) * k, y: H / 2 + (cm.y - H / 2) * k, z: Math.max(1, 1 + ((cm.z || 1) - 1) * k), r: (cm.r || 0) * .8 });
  if (o.mood == null || o.mood > 2.5) {
    drawKawaiiSky(ctx, t, { neb: .55, rainbow: false });
    e_moon(ctx, o.moonX == null ? 1000 : o.moonX, o.moonY == null ? 150 : o.moonY, o.moonR || 64, o.moonA == null ? 1 : o.moonA);
    drawQuebrada(ctx, o.camX || 0, o.y0 || 480, o.mood == null ? 3 : o.mood, { t, sky: false, night: o.night || 0, lit: o.lit, lights: o.lights, fog: o.fog });
  } else drawQuebrada(ctx, o.camX || 0, o.y0 || 480, o.mood, { t, night: o.night || 0, lit: o.lit, lights: o.lights, fog: o.fog });
  if (o.floor !== false) { const fy = (o.y0 || 480) + 30; ctx.fillStyle = lg(ctx, 0, fy, 0, fy + 260, [[0, 'rgba(120,84,190,0)'], [.35, 'rgba(96,64,168,.8)'], [1, o.mood != null && o.mood < 2.5 ? '#1a1238' : '#4b3290']]); ctx.fillRect(-500, fy, W + 1000, 900); }
  ctx.restore();
}
function e_fin(ctx, t, o = {}) {
  fxGrade(ctx, 'kawaii', o.grade == null ? .7 : o.grade);
  fxVignette(ctx, o.vig == null ? .38 : o.vig, o.vcol || '58,20,92');
}
function e_tip(x, y, s, pose, o = {}) { // ponta da varinha
  const p = Object.assign({}, POSE.stand, pose), k = skeleton(p), a = rad(o.wandAng == null ? 22 : o.wandAng), h = k.aR[2];
  return charPt(x, y, s, p, [h[0] + Math.sin(a) * 2.9, h[1] - Math.cos(a) * 2.9], o);
}
function e_hero(ctx, x, y, s, pose, t, o = {}) {
  return drawChar(ctx, x, y, s, pose, Object.assign({ t: E_T(t), wind: 2, magical: 1, wand: 1, face: { eye: 'happy', mouth: 'grin' } }, o));
}
function e_trail(ctx, fn, t, dur = .55, w = 9, a = .9) { ribbonFollow(ctx, fn, t, dur, 14, w, '255,156,207', '201,166,255', a, { sparks: 1 }); }
function e_fgPetals(ctx, t, n = 18, a = .9, sz = 18) { sakura(ctx, t, 31, n, { size: sz, a, wind: 110, fall: 90 }); }
function e_ground(ctx, y, t) { // piso de laje pastel largo
  drawLaje(ctx, -420, y, 2120, 3, { h: 46, mureta: 0, rebar: false, drop: 260, t });
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, 0, y - 6, 0, y + 40, [[0, 'rgba(255,200,240,.45)'], [1, 'rgba(255,200,240,0)']]); ctx.fillRect(-400, y - 6, W + 800, 50); ctx.restore();
}
function e_shine(ctx, x, y, R, a = 1, col = '255,226,246') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y, 0, R, [[0, `rgba(${col},${.55 * a})`], [.4, `rgba(${col},${.2 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - R, y - R, R * 2, R * 2); ctx.restore(); }
function e_dim(ctx, a, col = '14,8,40') { if (a > .005) { ctx.save(); ctx.fillStyle = `rgba(${col},${clamp(a)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }

/* ---------------- 1. 72.8–74.04  surge da luz ---------------- */
function e_A(ctx, t, L, D) {
  const k = E.out3(seg(L, 0, D)), b = beatInfo(t), cm = { x: 640, y: 372 - 16 * k, z: 1.32 - .2 * k, r: (1 - k) * .05 };
  e_bg(ctx, t, cm, { camX: t * 8, y0: 500 });
  ctx.save(); cam(ctx, cm);
  e_ground(ctx, 520, t);
  rays(ctx, 640, 330, t, { n: 18, a: .28 * (1 - .4 * k), len: 1000, sp: .22, col: '255,222,245' });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const cw = 150 + 80 * (1 - k); ctx.fillStyle = lg(ctx, 640 - cw, 0, 640 + cw, 0, [[0, 'rgba(255,200,240,0)'], [.5, `rgba(255,245,252,${.55 * (1 - k * .6)})`], [1, 'rgba(255,200,240,0)']]); ctx.fillRect(640 - cw, -100, cw * 2, 640); ctx.restore();
  const rise = E.out3(seg(L, 0, .6)), y = 522 + 26 * (1 - rise), s = 46;
  const dp = dancePose(E_T(t), 0, 0), pose = lerpPose(POSE.hensPose, dp, E.io2(seg(L, .35, .95)));
  const amt = 1 - seg(L, .05, .85);
  if (amt > .02) charSilhouette(ctx, 640, y, s, pose, { t: E_T(t), wind: 2, magical: 1, wand: 1, face: { eye: 'happy', mouth: 'grin' } }, amt, L * 5);
  else e_hero(ctx, 640, y, s, pose, t);
  shockRing(ctx, 640, 430, 40 + E.out3(seg(L, .05, .8)) * 520, 14 * (1 - seg(L, .05, .8)), 1 - seg(L, .05, .8), .4);
  starBurst(ctx, 640, 380, seg(L, .05, 1.0), 26, 8, 560, 24);
  glitter(ctx, t, 5, 36, 100, 120, 1080, 420, { size: 20 });
  e_fgPetals(ctx, t, 14);
  ctx.restore();
  e_fin(ctx, t, { grade: .6 });
}

/* ---------------- 2. 74.04–76.29  dança em arco ---------------- */
function e_B(ctx, t, L, D) {
  const k = E.io2(seg(L, 0, D)), cm = { x: lerp(500, 790, k), y: lerp(392, 360, k), z: lerp(1.12, 1.0, k) + .03 * Math.sin(k * 3), r: lerp(-.045, .05, k) };
  e_bg(ctx, t, cm, { camX: -300 + t * 14, y0: 500 });
  ctx.save(); cam(ctx, cm);
  e_ground(ctx, 548, t);
  // luzinhas distantes (a magia ainda acesa)
  for (let i = 0; i < 9; i++) fxLantern(ctx, 80 + i * 150 + Math.sin(i * 3) * 30, 190 + (i % 3) * 38 - L * 8, .42 + (i % 2) * .12, t + i, { col: E_LCOL[i % 5], glow: .7, a: .8 });
  const hx = 640 + 60 * Math.sin(L * 2.2), s = 47, pose = dancePose(E_T(t), 0, 1);
  e_shine(ctx, hx, 380, 340, .6);
  e_trail(ctx, tt => e_tip(hx, 548, s, dancePose(E_T(tt), 0, 1)), t);
  e_hero(ctx, hx, 548, s, pose, t, { face: { eye: 'happy', mouth: 'grin' } });
  glitter(ctx, t, 9, 30, 0, 100, 1280, 460, { size: 18 });
  ctx.restore();
  fxBokeh(ctx, t, 4, 10, { cols: PST_RGB, r0: 20, r1: 60, a: .5, y0: 380, y1: 720 });
  e_fgPetals(ctx, t, 22, .95, 22);
  e_fin(ctx, t);
}

/* ---------------- 3. 76.29–77.79  close, círculo mágico ---------------- */
function e_C(ctx, t, L, D) {
  const k = E.io2(seg(L, 0, D)), cm = { x: 640 + lerp(-40, 40, k), y: 360, z: 1.0 + .08 * k, r: lerp(.04, -.03, k) };
  fxDOF(ctx, c => { e_bg(c, t, cm, { camX: 200 + t * 10, y0: 520, moonX: 300, moonY: 170, moonR: 80 }); }, 5);
  ctx.save(); cam(ctx, cm);
  const hx = 640, s = 112, fy = 880 - 16 * k;
  e_shine(ctx, hx, 300, 520, .9);
  heartCircle(ctx, hx, 320, 270, t, .85, { kind: L < .75 ? 'star' : 'heart' });
  const pose = lerpPose(POSE.hensPose, POSE.hold, .0);
  const tipP = e_tip(hx, fy, s, pose);
  e_trail(ctx, tt => e_tip(hx + Math.sin(tt * 2) * 6, fy, s, pose), t, .5, 12, .7);
  e_hero(ctx, hx, fy, s, pose, t, { face: L > .9 ? 'stars' : { eye: 'happy', mouth: 'grin' }, wandAng: 22 });
  prismFlare(ctx, tipP[0], tipP[1], 1.1, .8, t);
  glitter(ctx, t, 21, 34, 100, 60, 1080, 540, { size: 26 });
  ctx.restore();
  e_fgPetals(ctx, t, 16, .95, 26);
  e_fin(ctx, t, { grade: .5 });
}

/* ---------------- 4. 77.79–79.29  low angle, lua gigante ---------------- */
function e_D(ctx, t, L, D) {
  const k = E.io2(seg(L, 0, D)), cm = { x: lerp(560, 700, k), y: lerp(440, 330, k), z: lerp(1.18, 1.0, k), r: lerp(.06, -.02, k) };
  e_bg(ctx, t, cm, { camX: 500 - t * 6, y0: 520, moonX: 820, moonY: 250, moonR: 190 });
  ctx.save(); cam(ctx, cm);
  const gy = 556;
  drawLaje(ctx, -300, gy, 1500, 3, { h: 44, mureta: 18, rebar: 'LR', drop: 260, tank: .78, varal: [.04, .4], plants: 3, seed: 7, t });
  const hx = 520, s = 54, pose = dancePose(E_T(t), .3, 2);
  heartCircle(ctx, hx, 330, 190, t, .5, { kind: 'star', nofill: false });
  e_trail(ctx, tt => e_tip(hx, gy - 18, s, dancePose(E_T(tt), .3, 2)), t, .6, 10, .9);
  e_hero(ctx, hx, gy - 18, s, pose, t);
  for (let i = 0; i < 3; i++) comet(ctx, 1100 - ((t * 140 + i * 400) % 1500) * .9 + 400, 80 + i * 70 + ((t * 40 + i * 99) % 60), 2.6, 140, 4, .8);
  for (let i = 0; i < 7; i++) fxLantern(ctx, 120 + i * 190, 140 + (i * 53) % 150 - (L * 18), .5, t + i, { col: E_LCOL[i % 5], glow: .8 });
  glitter(ctx, t, 14, 30, 0, 40, 1280, 520, { size: 20 });
  ctx.restore();
  e_fgPetals(ctx, t, 16);
  e_fin(ctx, t);
}

/* ---------------- 5. 79.29–80.54  tropeça ---------------- */
function e_E(ctx, t, L, D) {
  const k = seg(L, 0, D), cm = { x: lerp(600, 640, k), y: 372, z: lerp(1.0, 1.26, E.out2(k)), r: lerp(0, -.05, E.io2(seg(L, .35, 1))) };
  const sh = L > .55 && L < .85 ? shakeV(t, 6 * (1 - seg(L, .55, .85)), 30, 3) : [0, 0];
  e_bg(ctx, t, cm, { camX: 120 + t * 10, y0: 505, night: .28 * E.in2(seg(L, .3, 1)), lights: .6 });
  ctx.save(); cam(ctx, { x: cm.x + sh[0], y: cm.y + sh[1], z: cm.z, r: cm.r });
  const gy = 540; e_ground(ctx, gy, t); e_dim(ctx, .0);
  const tt = E_T(t), dp = dancePose(tt, 0, 3);
  let pose = dp;
  const f1 = E.in2(seg(L, .5, .78)), f2 = E.out2(seg(L, .78, 1.0)), f3 = E.io2(seg(L, 1.05, 1.25));
  pose = lerpPose(dp, POSE.fall, f1); pose = lerpPose(pose, POSE.hands2knees, f2); pose = lerpPose(pose, POSE.rise, f3);
  const hx = 600 + 30 * f1 + 40 * f2, s = 58;
  if (L < .5) e_trail(ctx, q => e_tip(hx, gy, s, dancePose(E_T(q), 0, 3)), t, .5, 8, .8);
  e_hero(ctx, hx, gy, s, pose, t, { wand: 1 - .45 * f2, face: L < .5 ? { eye: 'happy', mouth: 'grin' } : L < .8 ? 'shock' : 'sad' });
  if (L > .7 && L < 1.2) { const u = seg(L, .7, 1.2); shockRing(ctx, hx + 60, gy, 20 + u * 220, 8 * (1 - u), (1 - u) * .8, .16); starBurst(ctx, hx + 30, gy - 20, u, 12, 4, 200, 12); }
  glitter(ctx, t, 17, 16 - Math.round(8 * f2), 100, 100, 1080, 440, { size: 16, a: 1 - f2 * .6 });
  ctx.restore();
  e_fgPetals(ctx, t, 10, .7);
  e_fin(ctx, t, { grade: .55, vig: .5 });
}

/* ---------------- 6. 80.54–81.95  close, lágrima -> determinação ---------------- */
function e_F(ctx, t, L, D) {
  const ph2 = seg(L, .85, 1.1), k = E.io2(seg(L, 0, D)), cm = { x: 640, y: 360, z: lerp(1.0, 1.1, k), r: lerp(.02, -.015, k) };
  fxDOF(ctx, c => { e_bg(c, t, cm, { camX: 40, y0: 520, night: .2, moonX: 1000, moonY: 160, moonR: 90 }); }, 6);
  ctx.save(); cam(ctx, cm);
  e_shine(ctx, 640, 320, 520, .6);
  const s = 118, fy = 880 + 10 * (1 - k), x = 640 + Math.sin(t * 30) * (1 - ph2) * .8;
  const face = ph2 < .5 ? { eye: 'sad', mouth: 'wavy', brow: -1, wet: 1, tear: 1, cheek: 1.4 } : { eye: 'determined', mouth: 'flat', brow: 1, op: .95, cheek: 1.1 };
  e_hero(ctx, x, fy, s, { lean: 0, head: ph2 < .5 ? 10 : -6, spread: .8, hs: .5, aR: [8, 6], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] }, t, { face, wand: 0, autoBlink: ph2 > 0 });
  // lágrimas cintilantes
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const u = ((t * .8 + i * .21) % 1); sparkle(ctx, 640 - 55 + (i % 2) * 110 + Math.sin(i) * 6, 305 + u * 150, 7 * (1 - u) + 2, t * 3, '#d8f0ff'); }
  ctx.restore();
  if (ph2 > 0) { e_shine(ctx, 1100, 330, 600 * ph2, .9 * ph2, '255,214,150'); flash(ctx, (1 - ph2) * .0); rays(ctx, 1180, 330, t, { n: 12, a: .25 * ph2, len: 1200, sp: .1, col: '255,226,170' }); }
  glitter(ctx, t, 41, 30, 120, 60, 1040, 540, { size: 22, a: .8 });
  ctx.restore();
  e_fgPetals(ctx, t, 8, .5, 20);
  e_fin(ctx, t, { grade: .5, vig: .52 });
}

/* ---------------- palco da rede de apoio ---------------- */
/* cm = câmera; o.ig = segundos desde a ignição; o.net 0..1; o.hub; o.hero = fn(ctx) */
function e_stage(ctx, t, cm, o = {}) {
  const ig = o.ig == null ? -1 : o.ig, netP = o.net || 0, hub = o.hub || E_HUB, bgN = o.night == null ? .12 : o.night;
  e_bg(ctx, t, cm, { camX: 300 + t * 6, y0: 470, night: bgN + (1 - clamp(ig * 2 + 1)) * 0, lights: 1, moonX: 640, moonY: 120, moonR: 70 });
  ctx.save(); cam(ctx, cm);
  // lajes + postes
  drawLaje(ctx, -420, E_LY, 800, 3, { h: 40, mureta: 14, rebar: 'L', drop: 300, tank: .12, varal: [.5, .85], plants: 2, seed: 11, t });
  drawLaje(ctx, 900, E_LY, 800, 3, { h: 40, mureta: 14, rebar: 'R', drop: 300, tank: .88, ant: .5, plants: 2, seed: 21, t });
  for (const px of [E_RX0, E_RX1]) { // postes de ancoragem
    ctx.fillStyle = lg(ctx, px - 8, 0, px + 8, 0, [[0, '#d7b6dc'], [1, '#a98cc4']]); ctx.fillRect(px - 8, E_RY - 6, 16, E_LY - E_RY + 6);
    ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(px, E_RY, 8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#a07a5a'; ctx.lineWidth = 2; ctx.stroke();
  }
  drawTightrope(ctx, E_RX0, E_RY, E_RX1, E_RY, E_SAG, t, { wob: o.wob == null ? .6 : o.wob, col: '#f6ead0', lw: 3.4, anchors: false });
  // pessoas
  const hands = [];
  E_PEOPLE.forEach(([who, x, pk], i) => {
    const ti = i * .085 + (i > 4 ? .05 : 0), li = clamp((ig - ti) / .4), s = 24, tt = E_T(t);
    const alt = [POSE.Vup, POSE.wave, POSE.heart, POSE.cheer, POSE.Vup][(i + pk) % 5];
    let pose = lerpPose(Object.assign({}, POSE.stand, { lean: 3 * Math.sin(tt * 1.3 + i), head: o.worried ? 10 : 0 }), alt, E.out2(li));
    pose = Object.assign({}, pose, { dx: 0 }); if (alt === POSE.Vup) pose.hR = 'hold';
    const op = { who, color: lerp(.25, 1, E.out2(li)), t: tt + i * .3, wind: 1, face: li > .3 ? { eye: 'happy', mouth: 'grin' } : { eye: 'sad', mouth: 'small', brow: -.5 }, flip: x > 640 };
    const flipOk = x > 640;
    drawChar(ctx, x, E_LY + 1, s, pose, op);
    const hp = charPt(x, E_LY + 1, s, pose, 'aR', { who, flip: flipOk });
    hands.push([x, E_LY - 6.4 * s * (C2W[who].sc || 1) * .93, hp, li, i]);
  });
  // lanternas acesas
  hands.forEach(h => {
    const li = h[3], i = h[4]; if (li <= 0) return;
    const rise = Math.max(0, ig - i * .085 - .9) * 38 * (o.rise == null ? 1 : o.rise);
    fxLantern(ctx, h[0], h[2][1] - 44 - rise - (i % 3) * 8, .5 + .15 * li, t + i, { col: E_LCOL[i % 5], glow: li, a: li });
  });
  if (o.kites) for (let i = 0; i < 6; i++) {
    const hh = hands[[1, 3, 4, 6, 8, 9][i]], u = clamp((ig - 1.0 - i * .12) / .5) * o.kites; if (u <= 0) continue;
    const kx = hh[0] + (i % 2 ? 1 : -1) * (40 + i * 18) * u, ky = hh[2][1] - 130 - 90 * u - (i % 3) * 30 - Math.max(0, ig - 1.4) * 20;
    fxGlowKite(ctx, kx, ky, .42, t + i, { col: i % 2 ? '255,214,130' : '255,170,214', hold: [hh[2][0], hh[2][1]], a: u, rot: Math.sin(t + i) * .2 });
  }
  if (o.hero) o.hero(ctx);
  if (netP > 0) {
    const anchors = hands.map(h => [h[2][0] + (h[0] > 640 ? -6 : 6), h[2][1] - 4]);
    anchors.push([E_RX0, E_RY], [E_RX1, E_RY], [460, 548], [640, 580], [820, 548]);
    fxGoldNet(ctx, anchors, netP, t, { hub, rings: 3, sag: 36, w: 1.9, sway: 5 * (o.sway == null ? 1 : o.sway), glow: 1.2 });
  }
  ctx.restore();
  return hands;
}

/* ---------------- 7. 81.95–83.29  a comunidade acende ---------------- */
function e_G(ctx, t, L, D) {
  const k = E.io2(seg(L, 0, D)), cm = { x: lerp(400, 640, k), y: lerp(372, 350, k), z: lerp(1.14, .98, k), r: lerp(-.03, .015, k) };
  const u = lerp(.38, .5, E.io2(seg(L, 0, D)));
  e_stage(ctx, t, cm, { ig: L, net: E.in2(seg(L, .7, 1.3)) * .5, kites: 1, worried: false, hero(c) {
    const p = tightropePt(E_RX0, E_RY, E_RX1, E_RY, E_SAG, u, t, .6), pose = balancePose(E_T(t), .35), lk = Math.sin(L * 5);
    e_hero(c, p[0], p[1] + 2, 27, pose, t, { face: L < .5 ? { eye: 'open', mouth: 'small', brow: -.3 } : { eye: 'happy', mouth: 'grin' } });
  } });
  glitter(ctx, t, 8, 24, 0, 60, 1280, 440, { size: 18 });
  e_fgPetals(ctx, t, 10, .8);
  e_fin(ctx, t, { grade: .55 });
}

/* ---------------- 8. 83.29–84.04  escorrega ---------------- */
function e_H(ctx, t, L, D) {
  const k = seg(L, 0, D), fallP = E.in2(seg(L, .22, D)), y0 = tightropePt(E_RX0, E_RY, E_RX1, E_RY, E_SAG, .5, t, .9)[1];
  const hy = y0 + fallP * 90, hx = 640 + 22 * fallP;
  const cm = { x: 640, y: lerp(352, 420, E.in2(k)), z: lerp(2.0, 1.25, E.out2(k)), r: lerp(-.09, .05, k) };
  const sh = shakeV(t, 3 * (1 - k), 30, 5);
  e_stage(ctx, t, { x: cm.x + sh[0], y: cm.y + sh[1], z: cm.z, r: cm.r }, { ig: 1.4 + L, net: lerp(.5, .78, k), wob: 2.4 * (1 - k * .3), hub: [640, 450], kites: 1, hero(c) {
    const pose = lerpPose(balancePose(E_T(t), 1), POSE.fall, E.out2(seg(L, .08, .38)));
    const flail = Math.sin(E_T(t) * 30) * 6 * seg(L, .2, .7);
    if (L > .12 && L < .5) { const wu = seg(L, .12, .5); const tp = e_tip(hx, hy, 27, pose); sparkle(c, tp[0] + wu * 60, tp[1] - wu * 40, 16 * (1 - wu), t * 5, '#fff'); }
    e_hero(c, hx, hy, 27, Object.assign({}, pose, { lean: (pose.lean || 0) + flail }), t, { face: L < .15 ? { eye: 'open', mouth: 'small' } : 'shock', wand: 1 - seg(L, .2, .7) * .3, rot: fallP * .5 });
  } });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,120,${.18 * seg(L, .3, D)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  e_fin(ctx, t, { grade: .5, vig: .45 });
}

/* ---------------- 9. 84.04–85.29  PEGA pela rede — plano geral épico, câmera sobe ---------------- */
function e_I(ctx, t, L, D) {
  const k = E.io2(seg(L, 0, D)), bnc = Math.exp(-L * 3.2) * Math.cos(L * 13), hub = [640, E_HUB[1] + 34 * bnc + 14];
  const cm = { x: 640, y: lerp(470, 262, k), z: lerp(1.3, .98, k), r: lerp(.035, -.01, k) };
  e_stage(ctx, t, cm, { ig: 2.3 + L, net: 1, hub, kites: 1, rise: 1.3, sway: 1.5 + 2 * Math.exp(-L * 2), hero(c) {
    const hs = 28, hx = hub[0], hy = hub[1] - 12;
    const pose = lerpPose(POSE.fall, POSE.hensOpen, E.out2(seg(L, .12, .7)));
    e_shine(c, hx, hy - 60, 300, 1, '255,226,160');
    e_hero(c, hx, hy + 22, hs, pose, t, { face: L < .5 ? 'shock' : { eye: 'happy', mouth: 'grin' }, rot: lerp(.5, 0, E.out2(seg(L, 0, .8))), wand: 1, sink: 0 });
    shockRing(c, hx, hy, 30 + E.out3(seg(L, 0, .9)) * 480, 10 * (1 - seg(L, 0, .9)), 1 - seg(L, 0, .9), .35);
    starBurst(c, hx, hy - 40, seg(L, 0, 1.1), 30, 12, 520, 20);
  } });
  ctx.save(); cam(ctx, cm);
  fxConstellation(ctx, [[60, 140, 3], [260, 90, 2.4], [470, 150, 2.6], [640, 70, 3.4], [820, 150, 2.6], [1020, 90, 2.4], [1220, 140, 3]], seg(L, .3, 1.2), { t, lw: 1.3 });
  ctx.restore();
  fxLightShafts(ctx, 640, 520, -Math.PI / 2, 560, { n: 9, spread: .6, w: 70, col: '255,224,160', a: .24 * seg(L, 0, .5), t });
  glitter(ctx, t, 3, 44, 0, 0, 1280, 560, { size: 24 });
  e_fgPetals(ctx, t, 18, .9);
  e_fin(ctx, t, { grade: .6, vig: .34 });
}

/* ---------------- 10. 85.29–85.9  close do sorriso emocionado ---------------- */
function e_J(ctx, t, L, D) {
  const k = E.out2(seg(L, 0, D)), cm = { x: 640, y: 360, z: lerp(1.02, 1.12, k), r: lerp(-.02, .015, k) };
  fxDOF(ctx, c => { e_bg(c, t, cm, { camX: 120, y0: 520, moonX: 300, moonY: 190, moonR: 90 }); fxBokeh(c, t, 7, 14, { cols: ['255,214,140', '255,170,214'], r0: 20, r1: 70, a: .8, y0: 80, y1: 640 }); }, 7);
  ctx.save(); cam(ctx, cm);
  e_shine(ctx, 640, 330, 560, .9, '255,226,170');
  e_hero(ctx, 640, 890, 120, { lean: 0, head: 6, spread: .8, hs: .5, aR: [8, 6], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] }, t, { face: { eye: 'open', mouth: 'grin', tear: 1, wet: 1, cheek: 1.5, brow: -.2 }, wand: 0 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) { const u = (t * .7 + i * .23) % 1; sparkle(ctx, 640 + (i % 2 ? 58 : -58), 310 + u * 140, 8 * (1 - u) + 2, t * 3, '#fff2c0'); }
  ctx.restore();
  glitter(ctx, t, 55, 34, 100, 60, 1080, 520, { size: 26 });
  ctx.restore();
  e_fgPetals(ctx, t, 8, .6, 22);
  e_fin(ctx, t, { grade: .5 });
}

/* ---------------- 11. 85.9–86.5  abraço coletivo, rede baixa ---------------- */
function e_K(ctx, t, L, D) {
  const k = E.io2(seg(L, 0, D)), fade = E.in2(seg(L, .0, D)), cm = { x: 640, y: lerp(340, 352, k), z: lerp(1.15, .98, k), r: 0 };
  e_bg(ctx, t, cm, { camX: 200, y0: 500, night: .15 + .3 * fade, lights: 1 - .5 * fade });
  ctx.save(); cam(ctx, cm);
  e_ground(ctx, 540, t);
  const gy = 540, tt = E_T(t), mg = 1 - .55 * fade;
  const dim = 1 - .5 * fade;
  // comunidade ao redor
  [['viz1', 330, 0], ['viz0', 420, 1], ['viz7', 880, 2], ['viz2', 970, 3], ['viz4', 270, 4], ['viz3', 1030, 5], ['viz6', 205, 6], ['viz5', 1095, 7]].forEach(([w, x, i]) => {
    drawChar(ctx, x, gy - (i % 2) * 6, 42, lerpPose(POSE.stand, POSE.heart, .6 + .4 * Math.sin(tt * 2 + i)), { who: w, t: tt + i, face: { eye: 'happy', mouth: 'grin' }, color: 1, flip: x > 640, wind: 1 });
  });
  drawChar(ctx, 560, gy + 4, 50, POSE.hug, { who: 'mae', t: tt, face: { eye: 'closed', mouth: 'smile' }, wind: 1 });
  drawChar(ctx, 726, gy + 4, 36, POSE.hug, { who: 'irmao', t: tt, flip: true, face: { eye: 'happy', mouth: 'grin' }, wind: 1 });
  e_hero(ctx, 640, gy + 8, 48, lerpPose(POSE.hugged, POSE.hug, .5), t, { magical: mg, wand: 0, face: { eye: 'closed', mouth: 'smile', tear: 1, cheek: 1.4 } });
  // rede acima brilhando e baixando
  const na = 1 - .65 * fade;
  ctx.save(); ctx.globalAlpha = na;
  const an = [[40, 200], [210, 150], [380, 190], [560, 110], [720, 110], [900, 190], [1070, 150], [1240, 200], [640, 300], [330, 330], [950, 330]];
  fxGoldNet(ctx, an, 1, t, { hub: [640, 190], rings: 2, sag: 26, w: 1.6, glow: 1 });
  ctx.restore();
  glitter(ctx, t, 6, Math.round(26 * dim), 0, 60, 1280, 440, { size: 18, a: dim });
  ctx.restore();
  e_fgPetals(ctx, t, 6, .5 * dim);
  e_fin(ctx, t, { grade: .5 * dim });
  e_dim(ctx, .5 * fade, '12,10,44');
}

/* ---------------- RESPIRO: laje à noite ---------------- */
function e_netNodes(camX, y0) { // casas viram nós de uma rede de luz
  const pts = [], blocks = [];
  for (const li of [2, 3]) for (let ci = -2; ci <= 1; ci++) for (const b of wqBlocks(li, ci)) {
    const p = quebradaToScreen(li, b.x + b.w * .5, b.h * (li === 2 ? .55 : .45), camX, y0);
    if (p[0] > -40 && p[0] < W + 40 && p[1] > 180 && p[1] < 520) pts.push([p[0], p[1], li === 2 ? 2.2 : 3.0]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  const edges = []; for (let i = 0; i < pts.length - 1; i++) { edges.push([i, i + 1]); if (i + 2 < pts.length && i % 2 === 0) edges.push([i, i + 2]); }
  return { pts, edges };
}
function e_calmBg(ctx, t, cm, o = {}) {
  e_bg(ctx, t, cm, { mood: 0, camX: o.camX == null ? 80 : o.camX, y0: 470, night: .1, lights: 1, par: o.par });
  ctx.save(); ctx.fillStyle = 'rgba(70,40,130,.22)'; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function e_L(ctx, t, L, D) {
  const k = L / D, z = 1.0 + .07 * k, cm = { x: 640 - 30 * k, y: 360 + 6 * k, z, r: 0 };
  e_calmBg(ctx, t, cm, { camX: 80 });
  ctx.save(); cam(ctx, cm);
  // estrelas extras piscando
  drawStars(ctx, t, 91, 60, 0, 0, 1280, 280, .9);
  // rede de luz tênue
  const nn = e_netNodes(80, 470 + 0);
  fxConstellation(ctx, nn.pts, E.out2(seg(L, 0, 1.6)) * 1, { edges: nn.edges, t, lw: 1.0, col: '255,214,140', twinkle: 1, travel: (t * .05) % 1 });
  // laje de primeiro plano
  const ly = 536; drawLaje(ctx, -200, ly, 760, 0, { h: 40, mureta: 0, rebar: false, drop: 260, tank: .1, varal: [.62, .95], plants: 2, seed: 4, t });
  ctx.fillStyle = 'rgba(30,20,70,.35)'; ctx.fillRect(-200, ly, 760, 8);
  // ela sentada na beirada, olhando a cidade
  const br = Math.sin(t * 1.3) * .5 + .5, hx = 470, s = 24;
  e_shine(ctx, hx + 6, ly - 70, 130, .35 + .15 * br, '255,214,140');
  e_hero(ctx, hx, ly - 3, s, POSE.sitLedge, t, { magical: 0, wand: 0, scar: .55 + .15 * br, pendant: 0, face: { eye: 'open', mouth: 'smile', op: .85, look: [.4, -.1] }, wind: 1.6, turn: .4 });
  ctx.restore();
  fxDust(ctx, t, { x: 0, y: 100, w: 1280, h: 560, n: 36, col: '255,230,190', a: .55, seed: 3 });
  e_dim(ctx, .55 * (1 - E.out2(seg(L, 0, .9))), '10,6,36');
  fxVignette(ctx, .5, '10,6,34');
}
function e_M1(ctx, t, L, D) {
  const k = L / D, cm = { x: 640, y: 360, z: 1.0 + .06 * k, r: 0 };
  fxDOF(ctx, c => { e_calmBg(c, t, cm, { camX: 200 }); const nn = e_netNodes(200, 470); fxConstellation(c, nn.pts, 1, { edges: nn.edges, t, lw: 1.0, col: '255,214,140' }); drawStars(c, t, 91, 40, 0, 0, 1280, 280, .8); }, 6);
  ctx.save(); cam(ctx, cm);
  e_shine(ctx, 640, 330, 460, .35, '255,214,150');
  const open = E.io2(seg(L, 0, 1.0)), blink = 1 - open;
  e_hero(ctx, 640, 905 - 8 * k, 118, { lean: 0, head: 8 - 6 * k, spread: .8, hs: .5, aR: [8, 6], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] }, t, { magical: 0, wand: 0, scar: .6, face: { eye: 'open', mouth: 'smile', op: .8, tear: seg(L, .6, 1.4), wet: 1, cheek: 1.2, look: [.1, .15], m: 0 }, blink: Math.max(blink, 0) * .9, autoBlink: false, wind: 1.4 });
  ctx.restore();
  fxDust(ctx, t, { x: 0, y: 80, w: 1280, h: 600, n: 30, col: '255,230,190', a: .5, seed: 5 });
  fxVignette(ctx, .55, '10,6,34');
}
function e_M2(ctx, t, L, D) {
  const k = L / D, g = E.in2(k), cm = { x: 640, y: 360, z: 1.0 + .14 * k, r: 0 };
  fxDOF(ctx, c => { e_calmBg(c, t, cm, { camX: 200 }); }, 9);
  ctx.save(); cam(ctx, { x: 640, y: 360, z: cm.z, r: 0 });
  const b = beatInfo(t), p = .6 + .4 * Math.exp(-((t - 90.6) % .38) * 6);
  e_hero(ctx, 640, 990, 170, { lean: 0, head: 0, spread: .8, hs: .5, aR: [8, 6], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] }, t, { magical: 0, wand: 0, scar: .85 + .15 * g, face: 'closed', wind: 1 });
  ctx.restore();
  // brilho da cicatriz crescendo (centro ~ y 330)
  const R = lerp(160, 760, g * g);
  e_shine(ctx, 640, 340, R, .5 + .5 * g * p, '255,214,120');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,90,${.34 * g * g * p})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  rays(ctx, 640, 340, t, { n: 14, a: .2 * g, len: 900, sp: .1, col: '255,226,160' });
  fxVignette(ctx, .5 * (1 - g * .6), '10,6,34');
}

/* ============================================================ */
const SCENES_E = [
  { t0: 72.8, t1: 74.04, name: 'e_A_surge', fn: e_A },
  { t0: 74.04, t1: 76.29, name: 'e_B_danca', fn: e_B },
  { t0: 76.29, t1: 77.79, name: 'e_C_circulo', fn: e_C },
  { t0: 77.79, t1: 79.29, name: 'e_D_lua', fn: e_D },
  { t0: 79.29, t1: 80.54, name: 'e_E_tropeca', fn: e_E },
  { t0: 80.54, t1: 81.95, name: 'e_F_lagrima', fn: e_F },
  { t0: 81.95, t1: 83.29, name: 'e_G_acendem', fn: e_G },
  { t0: 83.29, t1: 84.04, name: 'e_H_escorrega', fn: e_H },
  { t0: 84.04, t1: 85.29, name: 'e_I_rede', fn: e_I },
  { t0: 85.29, t1: 85.9, name: 'e_J_sorriso', fn: e_J },
  { t0: 85.9, t1: 86.5, name: 'e_K_abraco', fn: e_K },
  { t0: 86.5, t1: 89.0, name: 'e_L_laje', fn: e_L },
  { t0: 89.0, t1: 90.5, name: 'e_M1_rosto', fn: e_M1 },
  { t0: 90.5, t1: 91.28, name: 'e_M2_cicatriz', fn: e_M2 },
];
const IMPACTS_E = [
  { t: 72.8, d: .55, type: 'white' },
  { t: 81.95, d: .2, type: 'flash' },
  { t: 83.29, d: .12, type: 'white' },
  { t: 84.04, d: .3, type: 'white' },
];
globalThis.SCENES_E = SCENES_E; globalThis.IMPACTS_E = IMPACTS_E; // main.js lê via globalThis (const de topo não vira propriedade)
