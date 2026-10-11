'use strict';
/* ============================================================
   scenes1.js — o mundo cinza: intro, acordar, peso, boletos, geladeira
   ============================================================ */
function charAtHip(ctx, x, hipY, s, pose, o) { return drawChar(ctx, x, hipY + skeleton(pose).foot * s + (o && o.sink ? 0 : 0), s, pose, o); }
function findBlock(li, wx) { return CITY[li].blocks.find(b => wx >= b.x && wx <= b.x + b.w); }
function winRect(li, wx, col, row, camX, y0) { // janela do andar `row` (0 = térreo) da casa que contém wx
  const b = findBlock(li, wx), L = CITY[li], cw = b.w / b.cols;
  return { x: W / 2 - camX * L.par + b.x + col * cw + cw * .27, y: y0 - (row + 1) * b.rowH + b.rowH * .3, w: cw * .46, h: b.rowH * .46, b };
}
function letterbox(ctx, h) { if (h > .5) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); } }
/* chão de concreto de viela: meio-fio, juntas, remendos e um fiozinho de esgoto. camX faz o chão rolar com a câmera */
function streetGround(ctx, y0, c = 0, camX = 0) {
  ctx.fillStyle = lg(ctx, 0, y0, 0, y0 + 300, [[0, mix('#8a8d93', '#3a2a7a', c)], [1, mix('#5d6067', '#1a1250', c)]]); ctx.fillRect(-300, y0, W + 600, 1000);
  ctx.fillStyle = mix('#a9acb2', '#6a5ab0', c); ctx.fillRect(-300, y0, W + 600, 12); // degrau/calçada de concreto
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-300, y0, W + 600, 3);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-300, y0 + 12, W + 600, 3);
  ctx.strokeStyle = mix('#40434a', '#0f0a38', c); ctx.globalAlpha = .55; ctx.lineWidth = 2; ctx.beginPath();
  for (let k = -2; k < 14; k++) { const x = ((k * 150 - camX) % 2100 + 2100) % 2100 - 400; ctx.moveTo(x, y0 + 16); ctx.lineTo(x - 26, y0 + 70); ctx.lineTo(x - 70, y0 + 300); }
  ctx.moveTo(-300, y0 + 62); ctx.lineTo(W + 300, y0 + 62); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = mix('#6f7279', '#2c1f66', c); ctx.globalAlpha = .5;
  for (let k = 0; k < 9; k++) { const x = ((k * 263 - camX) % 2300 + 2300) % 2300 - 400; rrect(ctx, x, y0 + 30 + (k % 3) * 26, 70 + (k % 4) * 24, 9, 4); ctx.fill(); }
  ctx.globalAlpha = 1;
}
/* poste de concreto com cruzeta, lâmpada e fios saindo (gambiarra). o.span = distância até o próximo poste */
function lampPost(ctx, x, y0, h, c = 0, on = 0, o = {}) {
  const span = o.span || 560, wc = mix('#2a2c30', '#0d0a2e', c), pc = mix('#7b7e85', '#6d5a9a', c);
  ctx.fillStyle = pc; ctx.fillRect(x - 6, y0 - h, 12, h); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 2, y0 - h, 4, h);
  ctx.fillStyle = mix('#3b3e45', '#1a1250', c); ctx.fillRect(x - 38, y0 - h + 12, 76, 7); ctx.fillRect(x - 28, y0 - h + 40, 56, 6); ctx.fillRect(x - 5, y0 - h, 56, 7);
  ctx.fillStyle = on ? '#ffe8a8' : '#d8dbdf'; ctx.fillRect(x + 36, y0 - h + 7, 26, 9);
  ctx.strokeStyle = wc; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
  for (let k = 0; k < 6; k++) { const ox = (k - 2.5) * 13, oy = 14 + (k < 3 ? 0 : 28) + (k % 3) * 2, sag = span * (.055 + k * .006); ctx.moveTo(x + ox, y0 - h + oy); ctx.quadraticCurveTo(x + span / 2 + ox, y0 - h + oy + sag * 2, x + span + ox, y0 - h + oy + (k % 3 - 1) * 5); }
  ctx.stroke(); ctx.lineWidth = 1.4; ctx.beginPath();
  for (let k = 0; k < 4; k++) { const bx = x + (hash2(k, x | 0, 1) - .5) * 70, by = y0 - h + 16 + hash2(k, x | 0, 2) * 40; ctx.moveTo(bx + 9, by); ctx.ellipse(bx, by, 9, 5 + k, 0, 0, TAU * .8); }
  ctx.stroke();
  if (h > 250) { ctx.fillStyle = mix('#555960', '#2a1a6a', c); rrect(ctx, x + 6, y0 - h + 62, 26, 38, 6); ctx.fill(); } // transformador
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x + 50, y0 - h + 14, 0, 140, [[0, 'rgba(255,220,140,.5)'], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(x - 100, y0 - h - 130, 300, 300); ctx.restore(); }
}

/* ---------- interiores de casa de morro: reboco inacabado, tijolo aparente, janela com grade ---------- */
function plasterWall(ctx, x0, y0, x1, y1, base, o = {}) {
  const r = rng(o.seed || 5), dark = mix(base, '#2a2740', .16), brick = o.brick || '#8b7e7a';
  ctx.fillStyle = base; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  ctx.fillStyle = dark; ctx.globalAlpha = .35; for (let i = 0; i < 14; i++) { const w = 60 + r() * 160, h = 30 + r() * 90; ctx.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), w, h); } ctx.globalAlpha = 1;
  // barrado (faixa pintada embaixo)
  if (o.band) { ctx.fillStyle = o.band; ctx.fillRect(x0, o.bandY, x1 - x0, y1 - o.bandY); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x0, o.bandY, x1 - x0, 4); }
  // remendos de tijolo à vista
  for (const [bx, by, bw, bh] of (o.patches || [])) {
    ctx.fillStyle = brick; poly(ctx, [[bx, by + 6], [bx + bw * .4, by], [bx + bw, by + 10], [bx + bw - 8, by + bh], [bx + 10, by + bh - 6]]); ctx.fill();
    ctx.save(); poly(ctx, [[bx, by + 6], [bx + bw * .4, by], [bx + bw, by + 10], [bx + bw - 8, by + bh], [bx + 10, by + bh - 6]]); ctx.clip();
    ctx.strokeStyle = mix(brick, '#2a2740', .45); ctx.lineWidth = 2; ctx.beginPath();
    for (let yy = by, k = 0; yy < by + bh; yy += 14, k++) { ctx.moveTo(bx, yy); ctx.lineTo(bx + bw, yy); for (let xx = bx + (k % 2 ? 14 : 0); xx < bx + bw; xx += 28) { ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 14); } }
    ctx.stroke(); ctx.restore();
  }
}
/* silhueta do morro vista pela janela */
function hillView(ctx, x, y, w, h, t, dawn = 1) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, '#c9cdd3'], [1, dawn ? '#ffe3b8' : '#e4e6e8']]); ctx.fillRect(x, y, w, h);
  const r = rng(41);
  for (let k = 0; k < 2; k++) { let xx = x - 10; while (xx < x + w) { const bw = 36 + r() * 40, bh = (k ? 70 : 110) + r() * 90; ctx.fillStyle = k ? '#8a8f98' : '#aab0b9'; ctx.fillRect(xx, y + h - bh * (k ? .8 : 1) - k * 0, bw, bh + 40); ctx.fillStyle = k ? '#555a63' : '#7e848e'; for (let wy = y + h - bh + 12; wy < y + h - 6; wy += 22) ctx.fillRect(xx + 8, wy, 8, 8); if (r() < .4) ctx.fillRect(xx + bw * .3, y + h - bh * (k ? .8 : 1) - 14, 20, 14); xx += bw + 2; } }
  ctx.restore();
}
/* grade de ferro por cima de uma janela */
function windowGrille(ctx, x, y, w, h, col = '#23212f', n = 5) {
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 1; i < n; i++) { ctx.moveTo(x + w * i / n, y); ctx.lineTo(x + w * i / n, y + h); }
  ctx.moveTo(x, y + h * .33); ctx.lineTo(x + w, y + h * .33); ctx.moveTo(x, y + h * .66); ctx.lineTo(x + w, y + h * .66); ctx.stroke();
  ctx.lineWidth = 7; ctx.strokeRect(x, y, w, h);
}
function wallFan(ctx, x, y, s, t) { // ventilador de coluna
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.fillStyle = '#4a4d57'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 330, 62, 14, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6a6e79'; ctx.fillRect(-7, 80, 14, 250); ctx.strokeRect(-7, 80, 14, 250);
  ctx.fillStyle = '#d6d9de'; ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.clip(); ctx.rotate(t * 14); ctx.fillStyle = 'rgba(70,76,92,.55)';
  for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(46, -30, 70, -6); ctx.quadraticCurveTo(46, 10, 0, 0); ctx.fill(); }
  ctx.restore(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.arc(0, 0, 60, 0, TAU); ctx.moveTo(-80, 0); ctx.lineTo(80, 0); ctx.moveTo(0, -80); ctx.lineTo(0, 80); ctx.stroke();
  ctx.fillStyle = '#14122a'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill(); ctx.restore();
}
function wallCalendar(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(.02);
  ctx.fillStyle = '#f2efe8'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4; ctx.fillRect(0, 0, 150, 190); ctx.strokeRect(0, 0, 150, 190);
  ctx.fillStyle = '#8a8f98'; ctx.fillRect(0, 0, 150, 56); ctx.strokeRect(0, 0, 150, 56);
  ctx.fillStyle = '#f2efe8'; ctx.beginPath(); ctx.arc(75, 28, 16, 0, TAU); ctx.fill(); // foto
  ctx.strokeStyle = '#8a8f98'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 1; i < 6; i++) { ctx.moveTo(i * 25, 64); ctx.lineTo(i * 25, 186); } for (let j = 0; j < 5; j++) { ctx.moveTo(4, 78 + j * 24); ctx.lineTo(146, 78 + j * 24); } ctx.stroke();
  ctx.strokeStyle = '#b8403c'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k < 17; k++) { const cx = (k % 6) * 25 + 4, cy = 66 + Math.floor(k / 6) * 24; ctx.moveTo(cx + 3, cy + 3); ctx.lineTo(cx + 21, cy + 19); ctx.moveTo(cx + 21, cy + 3); ctx.lineTo(cx + 3, cy + 19); } ctx.stroke();
  ctx.restore();
}
function hangingBulb(ctx, x, y, len, on = .5) {
  ctx.strokeStyle = '#14122a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
  ctx.fillStyle = '#2a2740'; ctx.fillRect(x - 7, y + len, 14, 14); ctx.fillStyle = on > .4 ? '#fff3c4' : '#d8d5c8'; ctx.beginPath(); ctx.arc(x, y + len + 26, 15, 0, TAU); ctx.fill(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y + len + 26, 0, 200, [[0, `rgba(255,230,160,${.3 * on})`], [1, 'rgba(255,230,160,0)']]); ctx.fillRect(x - 200, y + len - 170, 400, 400); ctx.restore();
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
  lampPost(ctx, 190, y0, 330, 0, 0, { span: 820 }); lampPost(ctx, 1010, y0, 330, 0, 0, { span: 820 });
  // janela do herói acende (calor no mundo cinza)
  const w = winRect(2, -60, 0, 7, 0, y0), on = seg(L, 2.05, 2.35);
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
  // quarto de casa de morro: reboco inacabado, tijolo à vista, piso de cimento
  plasterWall(ctx, -300, -300, W + 300, 640, '#7f8aa0', { seed: 8, band: '#5d6780', bandY: 500, patches: [[430, 150, 150, 110], [1000, 470, 190, 100], [-60, 300, 100, 120]] });
  ctx.fillStyle = 'rgba(20,18,42,.22)'; ctx.fillRect(-300, 636, W + 600, 14);
  ctx.fillStyle = '#4a4458'; ctx.fillRect(-300, 636, W + 600, 400); ctx.fillStyle = '#5a5468'; ctx.fillRect(-300, 636, W + 600, 8);
  ctx.strokeStyle = 'rgba(20,18,42,.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = -260; x < W + 300; x += 150) { ctx.moveTo(x, 650); ctx.lineTo(x - 40, 760); } ctx.stroke();
  // janela com grade e o morro lá fora; persiana só no alto
  ctx.fillStyle = '#2a2740'; ctx.fillRect(86, 70, 250, 300); hillView(ctx, 96, 80, 230, 280, t);
  ctx.fillStyle = 'rgba(90,86,110,.9)'; for (let y = 84; y < 170; y += 22) ctx.fillRect(96, y, 230, 12);
  windowGrille(ctx, 96, 80, 230, 280, '#23212f', 5);
  ctx.fillStyle = '#5a5468'; ctx.fillRect(76, 370, 270, 12);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 200, 200, 700, 640, [[0, 'rgba(255,220,150,.28)'], [1, 'rgba(255,220,150,0)']]); poly(ctx, [[96, 360], [326, 360], [840, 700], [380, 700]]); ctx.fill(); ctx.restore();
  wallCalendar(ctx, 840, 110, .95); hangingBulb(ctx, 560, -40, 120, .35);
  wallFan(ctx, 1090, 330, .8, t);
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
  // cozinha de morro: parede de reboco inacabado, botijão, fogão simples, panela
  plasterWall(ctx, -300, -300, W + 300, 520, '#a7aeb2', { seed: 3, band: '#8d959a', bandY: 380, patches: [[440, 220, 170, 120], [-40, 330, 120, 130]] });
  ctx.fillStyle = '#2a2740'; ctx.fillRect(80, 60, 260, 270); ctx.fillStyle = '#cfd3d6'; ctx.fillRect(90, 70, 240, 250); hillView(ctx, 90, 70, 240, 250, t, 0);
  windowGrille(ctx, 90, 70, 240, 250, '#23212f', 4); ctx.fillStyle = '#7b8189'; ctx.fillRect(74, 322, 272, 12);
  hangingBulb(ctx, 560, -40, 110, .3);
  // relógio de parede 5:47 -> estressado
  ctx.fillStyle = '#f4f1e8'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(1030, 150, 62, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1030, 150); ctx.lineTo(1030 + Math.sin(rad(-20)) * 32, 150 - Math.cos(rad(-20)) * 32); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1030, 150); ctx.lineTo(1030 + Math.sin(t * 6) * 44, 150 - Math.cos(t * 6) * 44); ctx.stroke();
  // fogão simples + panela + botijão
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 5;
  ctx.fillStyle = '#b9a98a'; rrect(ctx, 1146, 300, 96, 220, 24); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#8f8068'; ctx.fillRect(1166, 280, 56, 24); ctx.strokeRect(1166, 280, 56, 24); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(1156, 330, 10, 150); ctx.fillStyle = '#6f6350'; ctx.fillRect(1146, 372, 96, 14);
  ctx.fillStyle = '#d9dde0'; ctx.fillRect(900, 410, 220, 100); ctx.strokeRect(900, 410, 220, 100); ctx.fillStyle = '#3a3d44'; ctx.fillRect(892, 396, 236, 18); ctx.strokeRect(892, 396, 236, 18);
  ctx.fillStyle = '#14122a'; for (const kx of [940, 1010, 1080]) { ctx.beginPath(); ctx.arc(kx, 450, 11, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#7b8189'; ctx.fillRect(930, 386, 40, 10); ctx.fillRect(1030, 386, 40, 10);
  ctx.fillStyle = '#8a8f98'; rrect(ctx, 920, 316, 98, 72, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#6d727b'; ctx.fillRect(908, 326, 14, 10); ctx.fillRect(1016, 326, 14, 10); ctx.fillStyle = '#c4c8cd'; ctx.fillRect(926, 322, 86, 8);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 6; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(950 + k * 22, 304); ctx.bezierCurveTo(940 + k * 22, 280 + Math.sin(t * 4 + k) * 6, 962 + k * 22, 262, 950 + k * 22, 236 + Math.sin(t * 3 + k) * 5); ctx.stroke(); } ctx.restore();
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
  plasterWall(ctx, -400, -300, W + 400, 700, '#a9afb2', { seed: 12, band: '#8e959a', bandY: 520, patches: [[1000, 150, 170, 130], [-80, 120, 120, 150]] });
  ctx.fillStyle = '#7f858a'; ctx.fillRect(-400, 660, W + 800, 300); ctx.fillStyle = 'rgba(20,18,42,.25)'; ctx.fillRect(-400, 660, W + 800, 10);
  ctx.strokeStyle = '#23212f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(940, 60); ctx.quadraticCurveTo(960, 200, 920, 330); ctx.stroke(); ctx.fillStyle = '#d9dde0'; ctx.fillRect(900, 330, 40, 30); ctx.strokeRect(900, 330, 40, 30); // tomada com gambiarra
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
