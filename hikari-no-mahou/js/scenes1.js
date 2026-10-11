'use strict';
/* ============================================================
   scenes1.js — o mundo cinza: intro, acordar, peso, boletos, geladeira
   ============================================================ */
function charAtHip(ctx, x, hipY, s, pose, o) { return drawChar(ctx, x, hipY + skeleton(pose).foot * s + (o && o.sink ? 0 : 0), s, pose, o); }
function findBlock(li, wx) { return CITY[li].blocks.find(b => wx >= b.x && wx <= b.x + b.w); }
function winRect(li, wx, col, row, camX, y0) {
  const b = findBlock(li, wx), L = CITY[li], cw = b.w / b.cols;
  return { x: W / 2 - camX * L.par + b.x + col * cw + cw * .22, y: y0 - row * b.rowH - b.rowH * .1, w: cw * .56, h: b.rowH * .56, b };
}
function letterbox(ctx, h) { if (h > .5) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); } }
function streetGround(ctx, y0, c = 0) {
  ctx.fillStyle = lg(ctx, 0, y0, 0, y0 + 300, [[0, mix('#4b4f57', '#1a2150', c)], [1, mix('#2a2c32', '#0c1030', c)]]); ctx.fillRect(-300, y0, W + 600, 1000);
  ctx.fillStyle = mix('#7b8089', '#3a4590', c); ctx.fillRect(-300, y0, W + 600, 14); // calçada
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-300, y0 + 14, W + 600, 3);
}
function lampPost(ctx, x, y0, h, c = 0, on = 0) {
  ctx.fillStyle = mix('#2c2f35', '#0a1030', c); ctx.fillRect(x - 5, y0 - h, 10, h); ctx.fillRect(x - 5, y0 - h, 56, 8);
  ctx.fillStyle = on ? '#ffe8a8' : '#d8dbdf'; ctx.fillRect(x + 36, y0 - h + 8, 28, 10);
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x + 50, y0 - h + 14, 0, 140, [[0, 'rgba(255,220,140,.5)'], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(x - 100, y0 - h - 130, 300, 300); ctx.restore(); }
}
function birds(ctx, t, seed, n, x0, y0, spread, col = '#2c2f35') {
  const r = rng(seed); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const bx = x0 + r() * spread + t * (30 + r() * 20), by = y0 + (r() - .5) * 80 + Math.sin(t * 2 + i) * 6, f = Math.sin(t * 11 + i * 2) * 5, s = 7 + r() * 5;
    ctx.beginPath(); ctx.moveTo(bx - s, by + f); ctx.quadraticCurveTo(bx - s * .4, by - 3, bx, by); ctx.quadraticCurveTo(bx + s * .4, by - 3, bx + s, by + f); ctx.stroke();
  }
}

/* ---------- 0. INTRO (0 – 2,92 s): amanhecer cinza, tilt-up até a "lua" rachada ---------- */
function sceneIntro(ctx, t, L, D) {
  const p = E.io2(seg(L, 0, D)), y0 = lerp(660, 1030, p), z = lerp(1.0, 1.1, p);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.fillStyle = lg(ctx, 0, y0 - 1100, 0, y0, [[0, '#8a929d'], [.55, '#bcc1c8'], [1, '#e9e9e8']]); ctx.fillRect(-300, -700, W + 600, H + 1700);
  ctx.fillStyle = rg(ctx, W * .5, y0 - 30, 0, 700, [[0, 'rgba(255,238,215,.5)'], [1, 'rgba(255,238,215,0)']]); ctx.fillRect(-300, y0 - 800, W + 600, 900);
  // a "lua"/sol apagado e rachado (a esfera da capa), batendo como um coração
  const hb = Math.exp(-((t % 1.25) * 5)) + .6 * Math.exp(-(((t + .38) % 1.25) * 6)), sx = W * .64, sy = y0 - 700;
  drawSphere(ctx, sx, sy, 84, { crack: 1, glow: .12 + .35 * hb, t });
  ctx.fillStyle = 'rgba(150,157,167,.46)'; ctx.beginPath(); ctx.arc(sx, sy, 85, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, sx, sy, 80, 260, [[0, `rgba(255,205,120,${.1 + .22 * hb})`], [1, 'rgba(255,205,120,0)']]); ctx.fillRect(sx - 300, sy - 300, 600, 600); ctx.restore();
  birds(ctx, t, 4, 7, 100, y0 - 560, 600);
  // grua de papel cruzando o céu
  const cp = seg(L, .5, D + .2), cx = lerp(-120, W + 120, E.io2(cp)), cy = sy + 70 - Math.sin(cp * Math.PI) * 60;
  drawCrane(ctx, cx, cy, .6, t * 8, { rot: -.12 + Math.sin(t * 3) * .05, body: '#f4f1ea', wing: '#fffdf8', shade: '#c9c5bb', edge: '#4a4a55' });
  drawCity(ctx, 0, y0, 0, { lit: .05, night: 0 });
  streetGround(ctx, y0);
  lampPost(ctx, 190, y0, 330); lampPost(ctx, 1010, y0, 330);
  // janela do herói acende (calor no mundo cinza)
  const w = winRect(2, -60, 2, 8, 0, y0), on = seg(L, 2.05, 2.35);
  if (on > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba('#ffcf6a', .95 * on); ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = rg(ctx, w.x + w.w / 2, w.y + w.h / 2, 0, 130, [[0, `rgba(255,200,100,${.5 * on})`], [1, 'rgba(255,200,100,0)']]); ctx.fillRect(w.x - 150, w.y - 150, 300 + w.w, 300 + w.h);
    const ring = seg(L, 2.1, 2.9); ctx.strokeStyle = `rgba(255,220,150,${(1 - ring) * .8})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 20 + ring * 150, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  letterbox(ctx, lerp(96, 0, E.io3(seg(L, 2.35, 2.92))));
  flash(ctx, 1 - seg(L, 0, .5), '0,0,0');
}

/* ---------- 1. ACORDAR (2,92 – 4,80): extremo close nos olhos, persiana, "sol na cara" ---------- */
function sceneWake(ctx, t, L, D) {
  const z = lerp(1, 1.17, E.out2(L / D)), tt = t;
  let open = 0, brow = 0;
  if (t < 3.62) { open = 0; brow = .1; }
  else if (t < 3.9) { open = seg(t, 3.62, 3.9) * .1; brow = -.3; }
  else if (t < 4.34) { open = .08 + .04 * Math.sin(t * 40); brow = -.9; }
  else { open = E.back(seg(t, 4.34, 4.56)) * 1.02; brow = lerp(-.4, .35, seg(t, 4.4, 4.7)); }
  const pupil = lerp(.18, .42, E.out2(seg(t, 4.45, 4.8)));
  ctx.save(); ctx.fillStyle = '#d9d2c8'; ctx.fillRect(0, 0, W, H);
  cam(ctx, { x: W / 2, y: H / 2, z, r: lerp(.025, -.01, L / D) });
  eyesCU(ctx, W / 2, H / 2 + 20, 305, { open, brow, look: [lerp(-.3, .25, seg(t, 4.4, 4.8)), -.1], pupil, refl: true, t, glowIris: seg(t, 4.5, 4.8) * .0 });
  fringe(ctx, W / 2, 86, 300, t);
  // luz da persiana
  const a = lerp(.08, .3, seg(t, 3.0, 3.9)) + seg(t, 3.9, 4.3) * .3 - seg(t, 4.5, 4.8) * .3;
  blinds(ctx, t, a, { w: lerp(36, 100, seg(t, 3.7, 4.3)), gap: 92, ang: -.5 });
  ctx.fillStyle = `rgba(255,236,190,${seg(t, 3.9, 4.28) * .55})`; ctx.fillRect(-200, -200, W + 400, H + 400);
  motes(ctx, t, 8, 46, 0, 0, W, H, '255,230,160', { a: .8 * seg(t, 3.2, 3.8) });
  ctx.restore();
  letterbox(ctx, 118);
  // rasgo de flare da persiana no flash
  const f = seg(t, 4.18, 4.3) * (1 - seg(t, 4.3, 4.62));
  flash(ctx, f, '255,248,225');
  if (f > 0) flare(ctx, W * .72, H * .38, 1.2, '255,210,140', f, .9);
}

/* ---------- 2. PESADO (4,80 – 5,92): o peso de 1000 kg ---------- */
function sceneWeight(ctx, t, L, D) {
  const hit = 5.19, ht = t - hit;
  const z = lerp(1, 1.06, L / D), rot = ht < 0 ? -.035 : -.07 + Math.sin(ht * 30) * .01 * Math.exp(-ht * 4);
  ctx.save(); cam(ctx, { x: W / 2 + (ht > 0 ? shakeV(t, 8 * Math.exp(-ht * 7), 30)[0] : 0), y: H / 2 + (ht > 0 ? shakeV(t, 8 * Math.exp(-ht * 7), 30, 4)[1] : 0), z, r: rot });
  // quarto
  ctx.fillStyle = lg(ctx, 0, -100, 0, 640, [[0, '#6f7a92'], [1, '#8d96a8']]); ctx.fillRect(-300, -300, W + 600, 1000);
  ctx.fillStyle = '#4a4458'; ctx.fillRect(-300, 636, W + 600, 400); ctx.fillStyle = '#5a5468'; ctx.fillRect(-300, 636, W + 600, 8);
  // janela com persiana e luz do amanhecer
  ctx.fillStyle = '#2a2740'; ctx.fillRect(86, 70, 250, 300); ctx.fillStyle = lg(ctx, 0, 80, 0, 360, [[0, '#ffe6a8'], [1, '#ffd0a0']]); ctx.fillRect(96, 80, 230, 280);
  ctx.fillStyle = 'rgba(90,86,110,.9)'; for (let y = 84; y < 360; y += 22) ctx.fillRect(96, y, 230, 12);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 200, 200, 700, 640, [[0, 'rgba(255,220,150,.28)'], [1, 'rgba(255,220,150,0)']]); poly(ctx, [[96, 360], [326, 360], [840, 700], [380, 700]]); ctx.fill(); ctx.restore();
  // cama
  ctx.fillStyle = '#3a3550'; ctx.fillRect(-100, 560, 760, 90); ctx.fillStyle = '#d7d3e6'; rrect(ctx, -80, 450, 740, 120, 28); ctx.fill(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#8f9bd0'; rrect(ctx, -60, 395, 360, 100, 40); ctx.fill(); ctx.stroke(); // cobertor amassado
  ctx.fillStyle = '#f2efe8'; rrect(ctx, 20, 330, 190, 80, 34); ctx.fill(); ctx.stroke(); // travesseiro
  // herói sentado
  const s = 78, hx = 600, hipY = 458;
  const sit = { lean: 14, head: 26, spread: .8, hs: .28, aR: [38, 22], aL: [-14, 4], lR: [88, 4], lL: [80, 0], frontR: true };
  const pose = Object.assign({}, sit, ht > 0 ? { lean: 24, head: 36 } : { lean: 14 + Math.sin(t * 3) * 1.5 });
  const sq = ht > 0 ? .34 * Math.exp(-ht * 5) * Math.cos(ht * 22) : 0;
  const hp = charPt(hx, hipY + skeleton(pose).foot * s, s, pose, 'head'), topY0 = hp[1] - s * 1.08;
  if (ht > 0 && ht < .5) burst(ctx, hp[0], topY0 + 20, 150 * E.out3(seg(ht, 0, .12)) + 40, 11, 0, '#fff7c8', '#14122a', 6);
  const tq = Math.floor(t * 12) / 12;
  charAtHip(ctx, hx, hipY, s, pose, { t: tq, squash: Math.max(0, sq), wind: .15, face: ht > .06 ? { eye: 'spiral', mouth: 'wavy' } : { eye: 'closed', mouth: 'frown', cheek: false }, shadow: false });
  // o peso
  const topY = hp[1] - s * (1.08 - Math.max(0, sq) * .3), wy = ht < 0 ? lerp(-260, topY - 44, E.in3(seg(t, 5.0, hit))) : topY - 44 + Math.sin(ht * 20) * 6 * Math.exp(-ht * 6);
  if (t > 4.95) weight1000(ctx, hp[0] + 6, wy, .58, ht > 0 ? Math.sin(ht * 17) * .05 * Math.exp(-ht * 5) : 0);
  if (ht > 0) {
    starRing(ctx, hp[0], topY - 90, 120, 26, t, 5, 18);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; // rachaduras no chão
    ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx - 80, 640); ctx.lineTo(hx - 150, 660); ctx.lineTo(hx - 220, 652); ctx.moveTo(hx + 90, 640); ctx.lineTo(hx + 170, 664); ctx.lineTo(hx + 240, 652); ctx.stroke();
  }
  ctx.restore();
  if (ht > 0 && ht < .5) speedLines(ctx, hp[0] * 1 + 0, hp[1] - 40, t, { n: 46, r0: 170, r1: 900, col: '#14122a', a: .75 * (1 - ht * 2), seed: 11, thick: 5 });
  letterbox(ctx, 0);
}

/* ---------- 3. CONTAS (5,92 – 7,17): boletos desabam na mesa ---------- */
const BILLS = [
  { t0: 6.00, label: 'LUZ', amt: 'R$ 389,90', col: '#e0a31a', tx: 560, ty: 536, rot: -.22, from: [-220, 120, -2.4] },
  { t0: 6.30, label: 'ÁGUA', amt: 'R$ 142,35', col: '#2f8fe0', tx: 720, ty: 540, rot: .18, from: [1500, 80, 2.8] },
  { t0: 6.52, label: 'ALUGUEL', amt: 'R$ 1.800,00', col: '#d6403c', tx: 640, ty: 522, rot: -.06, from: [640, -260, -3.6] },
  { t0: 6.70, label: 'NET', amt: 'R$ 119,90', col: '#7a4ae0', tx: 500, ty: 514, rot: .3, from: [-240, 400, 2.2] },
  { t0: 6.90, label: 'CONDOMÍNIO', amt: 'R$ 640,00', col: '#2a9d6a', tx: 790, ty: 510, rot: -.28, from: [1500, 360, -2.6] },
  { t0: 7.04, label: 'IPTU', amt: 'R$ 2.350,00', col: '#e0612a', tx: 640, ty: 496, rot: .1, from: [640, -280, 3.2] },
];
function sceneBills(ctx, t, L, D) {
  const z = lerp(1.0, 1.1, L / D);
  ctx.save(); cam(ctx, { x: W / 2, y: H / 2 + 20, z, r: -.012 });
  // cozinha
  ctx.fillStyle = '#a2abae'; ctx.fillRect(-300, -300, W + 600, 1000);
  ctx.strokeStyle = 'rgba(70,80,86,.35)'; ctx.lineWidth = 2;
  for (let x = -280; x < W + 300; x += 90) { ctx.beginPath(); ctx.moveTo(x, -300); ctx.lineTo(x, 520); ctx.stroke(); }
  for (let y = -280; y < 520; y += 90) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); ctx.stroke(); }
  ctx.fillStyle = '#2a2740'; ctx.fillRect(80, 60, 260, 270); ctx.fillStyle = '#cfd3d6'; ctx.fillRect(90, 70, 240, 250); ctx.fillStyle = '#2a2740'; ctx.fillRect(205, 70, 10, 250); ctx.fillRect(90, 190, 240, 10);
  // relógio de parede 5:47 -> estressado
  ctx.fillStyle = '#f4f1e8'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(1030, 150, 62, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1030, 150); ctx.lineTo(1030 + Math.sin(rad(-20)) * 32, 150 - Math.cos(rad(-20)) * 32); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1030, 150); ctx.lineTo(1030 + Math.sin(t * 6) * 44, 150 - Math.cos(t * 6) * 44); ctx.stroke();
  // herói com a cabeça nas mãos
  const prog = seg(t, 5.92, 7.1), pose = { lean: lerp(10, 30, E.in2(prog)), head: lerp(20, 44, prog), spread: .85, hs: .5, aR: [128, -142], aL: [-128, 142], lR: [4, 0], lL: [-4, 0], frontR: true, frontL: true };
  charAtHip(ctx, 640, 566, 96, pose, { t: Math.floor(t * 12) / 12, wind: .1, face: { eye: prog > .1 ? 'spiral' : 'closed', mouth: 'wavy', cheek: false }, shadow: false });
  // mesa
  ctx.fillStyle = '#6b5a4c'; ctx.fillRect(-300, 484, W + 600, 400); ctx.fillStyle = '#7d6a5a'; ctx.fillRect(-300, 484, W + 600, 26); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let x = -300; x < W + 300; x += 120) ctx.fillRect(x, 510, 4, 300);
  ctx.strokeStyle = '#14122a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-300, 484); ctx.lineTo(W + 300, 484); ctx.stroke();
  // boletos
  BILLS.forEach((b, i) => {
    const u = seg(t, b.t0 - .24, b.t0), lt = t - b.t0;
    if (t < b.t0 - .24) return;
    const e = E.in2(u), x = lerp(b.from[0], b.tx, E.out2(u)), y = lerp(b.from[1], b.ty, e), rot = lerp(b.from[2], b.rot, E.out3(u)), flat = seg(u, .55, 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(1, lerp(1, .36, flat)); billSheet(ctx, 0, 0, rot, lerp(.8, .62, flat), b.label, b.amt, b.col, i % 2 === 0); ctx.restore();
    if (lt > 0 && lt < .3) { ctx.save(); ctx.strokeStyle = `rgba(20,18,42,${1 - lt / .3})`; ctx.lineWidth = 4; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(b.tx + k * 50, b.ty - 40); ctx.lineTo(b.tx + k * 90, b.ty - 40 - 50 * (1 - lt / .3)); ctx.stroke(); } ctx.restore(); }
  });
  ctx.restore();
  // o último boleto vem "na cara" da câmera (corte-cortina para a geladeira)
  const sl = seg(t, 7.05, 7.17);
  if (sl > 0) { ctx.save(); ctx.translate(W / 2, H / 2); const k = lerp(.8, 6, E.in3(sl)); billSheet(ctx, 0, 0, .12, k, 'ÚLTIMO AVISO', 'R$ 999,99', '#d6403c', true); ctx.restore(); }
}

/* ---------- 4. GELADEIRA PELA METADE (7,17 – 8,92) ---------- */
function sceneFridge(ctx, t, L, D) {
  const z = lerp(1.0, 1.2, E.out2(L / D)), open = E.back(seg(t, 7.2, 7.5)), th = rad(112) * Math.min(open, 1.06);
  const fx = 460, fw = 360, ft = 60, fb = 700, dTop = 266;
  ctx.save(); cam(ctx, { x: W / 2 + lerp(60, -30, L / D), y: H / 2 + 10, z, r: lerp(.02, -.015, L / D) });
  ctx.fillStyle = '#a9afb2'; ctx.fillRect(-400, -300, W + 800, 1100);
  ctx.fillStyle = '#7f858a'; ctx.fillRect(-400, 660, W + 800, 300);
  // luz que escapa da geladeira
  const lightOn = seg(t, 7.22, 7.4);
  // corpo
  ctx.fillStyle = '#3d4249'; ctx.fillRect(fx - 12, ft - 12, fw + 24, fb - ft + 24);
  // interior (porta de baixo aberta)
  ctx.fillStyle = lg(ctx, 0, dTop, 0, fb, [[0, '#f1fbff'], [1, '#bfe9f7']]); ctx.fillRect(fx, dTop, fw, fb - dTop);
  const half = seg(t, 7.82, 8.15), drop = E.in3(seg(t, 8.12, 8.5)), cutY = 470;
  ctx.save(); ctx.beginPath(); ctx.rect(fx, dTop, fw, fb - dTop); ctx.clip();
  ctx.strokeStyle = 'rgba(90,150,170,.6)'; ctx.lineWidth = 6; for (let y = 350; y < 700; y += 90) { ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx + fw, y); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(fx, y, fw, 10); }
  lemon(ctx, fx + 90, 340, 26); ketchup(ctx, fx + 285, 350, .95); egg(ctx, fx + 190, 438, 1.0);
  ctx.restore();
  // metade de baixo vira "fantasma" (planta azul tracejada)
  if (half > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(fx, cutY, fw, fb - cutY); ctx.clip(); ctx.translate(0, drop * 120); ctx.globalAlpha = 1 - drop * .0;
    ctx.fillStyle = '#17316b'; ctx.fillRect(fx, cutY, fw, fb - cutY); ctx.strokeStyle = 'rgba(150,200,255,.5)'; ctx.lineWidth = 1.5;
    for (let x = fx; x <= fx + fw; x += 30) { ctx.beginPath(); ctx.moveTo(x, cutY); ctx.lineTo(x, fb); ctx.stroke(); } for (let y = cutY; y <= fb; y += 30) { ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx + fw, y); ctx.stroke(); }
    ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeStyle = '#d6ecff'; ctx.strokeRect(fx + 8, cutY + 8, fw - 16, fb - cutY - 16); ctx.beginPath(); ctx.moveTo(fx + 8, 560); ctx.lineTo(fx + fw - 8, 560); ctx.moveTo(fx + 8, 630); ctx.lineTo(fx + fw - 8, 630); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `64px ${FONTS.comic}`; ctx.textAlign = 'center'; ctx.fillStyle = '#d6ecff'; ctx.fillText('???', fx + fw / 2, 595);
    ctx.restore();
    // tesoura percorrendo a linha pontilhada
    const sc = seg(t, 7.82, 8.14); if (sc < 1) { ctx.setLineDash([12, 9]); ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx - 20, cutY); ctx.lineTo(fx - 20 + (fw + 40) * sc, cutY); ctx.stroke(); ctx.setLineDash([]); emoji(ctx, '✂️', fx - 20 + (fw + 40) * sc, cutY - 4, 64, Math.sin(t * 40) * .15); }
  }
  // luz fria vazando
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, fx, 400, fx - 560, 700, [[0, `rgba(190,235,255,${.38 * lightOn})`], [1, 'rgba(190,235,255,0)']]); poly(ctx, [[fx, dTop], [fx, fb], [fx - 640, 900], [fx - 640, 380]]); ctx.fill(); ctx.restore();
  // porta de cima (fechada) e porta de baixo (abrindo, dobradiça à esquerda)
  const door = (y0, y1, th2, bw) => {
    const xf = fx + fw * Math.cos(th2), k = 1 + .2 * Math.sin(th2), h = (y1 - y0) / 2, cy = (y0 + y1) / 2;
    poly(ctx, [[fx, y0], [xf, cy - h * k], [xf, cy + h * k], [fx, y1]]); ctx.fillStyle = th2 > Math.PI / 2 ? '#e8ecee' : lg(ctx, fx, 0, xf, 0, [[0, '#d9dde0'], [1, '#f2f4f5']]); ctx.fill(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    if (th2 < Math.PI / 2) { ctx.fillStyle = '#7b8189'; const hx = fx + (fw - 34) * Math.cos(th2); ctx.fillRect(hx - 7, cy - 60, 12, 120); }
    else { ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 4; const a = fx + (xf - fx) * .25, b = fx + (xf - fx) * .75; ctx.beginPath(); ctx.moveTo(a, cy - h * .6); ctx.lineTo(a, cy + h * .6); ctx.moveTo(b, cy - h * .6 * k); ctx.lineTo(b, cy + h * .6 * k); ctx.stroke(); }
    return xf;
  };
  door(ft, dTop - 6, 0);
  // bilhete na porta de cima
  ctx.save(); ctx.translate(fx + 110, 140); ctx.rotate(-.07); ctx.fillStyle = '#ffe98a'; ctx.fillRect(-60, -44, 120, 88); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 3; ctx.strokeRect(-60, -44, 120, 88); ctx.font = `26px ${FONTS.hand}`; ctx.textAlign = 'center'; ctx.fillStyle = '#14122a'; ctx.fillText('COMPRAR:', 0, -12); ctx.fillText('TUDO', 0, 22); ctx.restore();
  door(dTop, fb, th);
  ctx.restore();
  // herói assustado em primeiro plano (iluminado pela luz fria)
  ctx.save(); ctx.translate(190 + Math.sin(t * 2) * 4, 640 + lerp(60, 0, E.out3(seg(L, 0, .3)))); ctx.rotate(-.12); ctx.scale(150, 150);
  drawHead(ctx, PAL.hero, { face: { eye: t > 7.3 ? 'shock' : 'open', mouth: 'open', look: [1, -.3] } }, 0, t);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 1, -.5, -1, .5, [[0, 'rgba(170,230,255,.35)'], [1, 'rgba(170,230,255,0)']]); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill();
  ctx.restore();
  // grilo 🦗 ... silêncio
  if (t > 7.55 && t < 8.6) { const u = seg(t, 7.55, 8.6); emoji(ctx, '🦗', lerp(1350, 700, E.io2(u)), 520 + Math.sin(u * 12) * 20, 54, Math.sin(u * 14) * .3); }
  // bateria 50%
  const bb = seg(t, 8.16, 8.4); if (bb > 0) batteryBadge(ctx, 1010, 200, E.back(bb) * 1.05, .5, t);
}
