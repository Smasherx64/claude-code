'use strict';
/* ============================================================
   scenes_b.js — 19.36 → 36.0 s  (verso 1b + pré-refrão)
   mãe/dois turnos · pai/pipa cortada · escadaria · vizinhos · ladrão ZAP · mapa · cicatriz · apagão · rachadura
   ============================================================ */
const B_T0 = 19.36;
const b_tw = t => Math.floor(t * 12) / 12;                       // "on twos"
const b_pz = (t, k = 6) => { const p = beatInfo(t); return p.pulse; };
const b_ez = (a, b, u, f = E.io2) => lerp(a, b, f(clamp(u)));
function b_vig(ctx, a = .55, col = '4,8,16') { vignette(ctx, a, col); }
function b_poseCarry(ph, lean = 26) {
  const w = walkPose(ph, lean);
  return Object.assign(w, { head: -10, aR: [-24, 40], aL: [-4, -22], hR: 'fist', hL: 'fist' });
}
/* dois balões de relógio (dois turnos) */
function b_clock(ctx, x, y, R, hrs, mins, icon, t, col = '#fff7e6') {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = col; ctx.strokeStyle = '#2c2a4a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(40,40,70,.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(Math.sin(a) * R * .8, -Math.cos(a) * R * .8); ctx.lineTo(Math.sin(a) * R * .92, -Math.cos(a) * R * .92); ctx.stroke(); }
  const h = ((hrs % 12) + mins / 60) / 12 * TAU, m = mins / 60 * TAU;
  ctx.lineCap = 'round'; ctx.strokeStyle = '#2c2a4a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(h) * R * .45, -Math.cos(h) * R * .45); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(m) * R * .7, -Math.cos(m) * R * .7); ctx.stroke();
  ctx.fillStyle = '#e8503a'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
  // ícone sol / lua
  ctx.translate(0, R * .46);
  if (icon === 'sun') { ctx.fillStyle = '#ffc24d'; ctx.beginPath(); ctx.arc(0, 0, R * .17, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffc24d'; ctx.lineWidth = 2.5; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * .24, Math.sin(a) * R * .24); ctx.lineTo(Math.cos(a) * R * .33, Math.sin(a) * R * .33); ctx.stroke(); } }
  else { ctx.fillStyle = '#5b6fd0'; ctx.beginPath(); ctx.arc(0, 0, R * .19, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff7e6'; ctx.beginPath(); ctx.arc(R * .09, -R * .04, R * .17, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function b_thoughtTail(ctx, x0, y0, x1, y1, R) { // bolinhas de pensamento
  for (let i = 0; i < 3; i++) { const u = (i + 1) / 4; ctx.fillStyle = '#fff7e6'; ctx.strokeStyle = '#2c2a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lerp(x0, x1, u), lerp(y0, y1, u), R * (.12 - i * .028), 0, TAU); ctx.fill(); ctx.stroke(); }
}
/* trouxa pesada (sacola de pano cheia: pão, boletos, panela) */
function b_sack(ctx, x, y, S, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(S, S);
  const col = o.col || '#c79a62', sh = mix(col, '#3a1a30', .35), ink = mix(col, '#2a1020', .65), lt = mix(col, '#fff2d0', .35);
  // itens saindo
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = .045;
  ctx.fillStyle = '#e8c27a'; ctx.strokeStyle = '#8a5a26'; ctx.beginPath(); ctx.ellipse(.42, -.98, .13, .5, .5, 0, TAU); ctx.fill(); ctx.stroke(); // pão
  ctx.strokeStyle = '#a8742f'; ctx.lineWidth = .03; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(.34 + i * .06, -1.25 + i * .12); ctx.lineTo(.42 + i * .06, -1.18 + i * .12); ctx.stroke(); }
  ctx.save(); ctx.rotate(-.35); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#7a8aa8'; ctx.lineWidth = .04; ctx.fillRect(-.6, -1.2, .46, .56); ctx.strokeRect(-.6, -1.2, .46, .56); ctx.fillStyle = '#e03a3a'; ctx.fillRect(-.55, -1.12, .36, .06); ctx.fillStyle = '#9ab'; ctx.fillRect(-.55, -1.0, .3, .03); ctx.fillRect(-.55, -.93, .24, .03); ctx.restore(); // boleto
  ctx.fillStyle = '#9aa4b4'; ctx.strokeStyle = '#4a5468'; ctx.lineWidth = .045; ctx.beginPath(); ctx.arc(-.05, -.92, .2, Math.PI, TAU); ctx.fill(); ctx.stroke(); // tampa panela
  ctx.restore();
  // corpo
  const body = () => { ctx.beginPath(); ctx.moveTo(-.28, -.9); ctx.bezierCurveTo(-1.2, -.7, -1.35, .5, -.7, .95); ctx.bezierCurveTo(-.2, 1.2, .5, 1.2, .95, .8); ctx.bezierCurveTo(1.4, .3, 1.2, -.7, .3, -.9); ctx.quadraticCurveTo(0, -.78, -.28, -.9); ctx.closePath(); };
  body(); ctx.fillStyle = col; ctx.fill();
  ctx.save(); body(); ctx.clip();
  ctx.fillStyle = rgba(sh, .5); ctx.beginPath(); ctx.ellipse(.7, .7, 1.1, 1.0, 0, 0, TAU); ctx.fill();           // sombra cel
  ctx.fillStyle = rgba(lt, .55); ctx.beginPath(); ctx.ellipse(-.55, -.25, .22, .5, .4, 0, TAU); ctx.fill();         // brilho
  ctx.strokeStyle = rgba(sh, .8); ctx.lineWidth = .035; ctx.setLineDash([.08, .06]); ctx.beginPath(); ctx.moveTo(-.2, -.8); ctx.bezierCurveTo(-.4, 0, -.2, .6, .1, 1.1); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#6fb7a8'; ctx.fillRect(.2, .0, .42, .38); ctx.strokeStyle = '#2a5a50'; ctx.setLineDash([.05, .04]); ctx.strokeRect(.2, .0, .42, .38); ctx.setLineDash([]); // remendo
  ctx.fillStyle = '#e8708a'; ctx.beginPath(); ctx.arc(-.55, .55, .17, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = .055; ctx.lineJoin = 'round'; body(); ctx.stroke();
  // nó
  ctx.fillStyle = sh; ctx.strokeStyle = ink; ctx.lineWidth = .05; ctx.beginPath(); ctx.ellipse(0, -.86, .32, .15, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function b_sweat(ctx, x, y, t, s = 1, n = 3) {
  for (let i = 0; i < n; i++) { const u = (t * 1.6 + i / n) % 1; const px = x + (i - 1) * 26 * s + u * 10, py = y - 16 * s + u * 46 * s; ctx.fillStyle = `rgba(190,235,255,${(1 - u) * .9})`; ctx.strokeStyle = `rgba(80,140,200,${(1 - u) * .9})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py - 8 * s); ctx.quadraticCurveTo(px + 6 * s, py + 2, px, py + 7 * s); ctx.quadraticCurveTo(px - 6 * s, py + 2, px, py - 8 * s); ctx.fill(); ctx.stroke(); }
}
function b_dustp(ctx, x, y, u, s = 1) { // poeirinha de pisada
  if (u <= 0 || u >= 1) return; for (let i = 0; i < 4; i++) { const d = (i - 1.5) * 18 * s * (.4 + u), up = -u * 14 * s; ctx.fillStyle = `rgba(200,205,220,${(1 - u) * .45})`; ctx.beginPath(); ctx.arc(x + d, y + up, (5 + u * 9) * s, 0, TAU); ctx.fill(); }
}

/* ───────────────────────── 1. ponto de ônibus (19.36–20.56) ───────────────────────── */
function b_busStop(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), y0 = 610;
  ctx.save(); cam(ctx, { x: b_ez(600, 690, u, E.io2), y: 360 + 10 * (1 - u), z: b_ez(1.0, 1.14, u), r: b_ez(-.012, .006, u) });
  drawBusStop(ctx, 250, y0, 1.7, 0, t, { scene: true, camX: 80 + u * 40 });
  // farol do ônibus chegando ao longe
  const hl = E.in2(seg(u, .45, 1)); if (hl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 1230, y0 - 70, 0, 280 * hl, [[0, `rgba(255,236,170,${.55 * hl})`], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(700, y0 - 400, 700, 600); flare(ctx, 1160 + hl * 0, y0 - 70, 1.3 * hl, '255,230,160', .8 * hl, 1); ctx.restore(); }
  // mãe e filha
  const hb = Math.sin(tt * 3) * .5;
  drawChar(ctx, 620, y0 + 10, 64, Object.assign({}, POSE.stand, { lean: -2, head: 4, aR: [14, 8], aL: [-16, 20 + hb * 6] }), { who: 'mae', t: tt, face: u < .5 ? 'sleepy' : 'happy', light: 1, rim: '#ffd89a', rimA: .5 });
  const wv = Math.sin(tt * 16) * 14;
  drawChar(ctx, 930, y0 + 10, 56, Object.assign({}, POSE.wave, { aR: [150 + wv * .4, 172 + wv] }), { who: 'hero', t: tt, flip: true, face: 'happy', light: -1, rim: '#ffd89a', rimA: .45 });
  // dois relógios (dois turnos)
  const pop1 = E.back(seg(L, .1, .4)), pop2 = E.back(seg(L, .42, .72)), bob = Math.sin(t * 3) * 4;
  b_thoughtTail(ctx, 560, 250, 500, 262, 58);
  ctx.save(); ctx.translate(330, 300 + bob); ctx.scale(pop1, pop1); b_clock(ctx, 0, 0, 58, 6, 0, 'sun', t); ctx.restore();
  ctx.save(); ctx.translate(450, 225 - bob); ctx.scale(pop2, pop2); b_clock(ctx, 0, 0, 58, 10, 0, 'moon', t, '#e6ecff'); ctx.restore();
  if (pop2 > .1) { ctx.save(); ctx.translate(392, 262); ctx.scale(pop2, pop2); txt(ctx, '+', 0, 0, { size: 56, fill: '#ffc24d', stroke: '#2c2a4a', sw: 8 }); ctx.restore(); }
  ctx.restore();
  fxDust(ctx, t, { x: 0, y: 150, w: W, h: 450, n: 30, a: .5, seed: 4 });
  b_vig(ctx, .6);
}

/* ───────────────────────── 2. mesa da família (20.56–21.44) ───────────────────────── */
function b_table(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t);
  ctx.save(); cam(ctx, { x: b_ez(470, 760, u, E.io3), y: b_ez(330, 370, u), z: b_ez(1.35, 1.12, u), r: b_ez(.02, -.01, u) });
  const T = intFamilyTable(ctx, t, { light: 1, steam: 1 });
  // pipa de linha cortada voando pela janela (clip na janela)
  ctx.save(); ctx.beginPath(); ctx.rect(110, 110, 240, 230); ctx.clip();
  const k = E.io2(u); const px = lerp(150, 330, k) , py = lerp(300, 130, k), s = lerp(26, 11, k);
  drawPipa(ctx, px, py, s, -.5 + Math.sin(t * 6) * .12, t, { cut: 1, tail: 9, anchor: null });
  ctx.restore();
  // brilho dourado terno
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, T.coat ? T.coat.x : 900, T.coat ? T.coat.y + 60 : 300, 0, 260, [[0, 'rgba(255,200,120,.16)'], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  fxDust(ctx, t, { x: 0, y: 100, w: W, h: 500, n: 22, a: .55, seed: 8, col: '255,226,170' });
  b_vig(ctx, .62, '14,8,20');
}

/* ───────────────────────── 3. escadaria (21.44–23.54) ───────────────────────── */
const B_ST = { x0: -240, y0: 700, w: 130, h: 68, n: 26 };
function b_climbF(t) { return 0.5 + Math.max(0, b_tw(t) - 21.44) / 0.375; }  // índice contínuo de degrau (1 por meia-batida)
function b_stairs(ctx, t, c, o = {}) {
  const f = b_climbF(t), i = Math.floor(f), fr = f - i, S = B_ST;
  const top = k => S.y0 - (k + 1) * S.h, px = k => S.x0 + k * S.w;
  const kAt = Math.max(0, i), eas = E.out2(Math.min(1, fr * 1.6));
  const hx = px(kAt) + S.w * .5 + (px(kAt + 1) - px(kAt)) * 0 + S.w * (eas - 1) * (kAt > 0 ? 1 : 0) * 0;
  const hy = lerp(kAt > 0 ? top(kAt - 1) : S.y0, top(kAt), eas);
  const hxx = lerp(kAt > 0 ? px(kAt - 1) + S.w * .5 : px(0), px(kAt) + S.w * .5, eas);
  // fundo com paralaxe
  ctx.save();
  drawQuebrada(ctx, hxx * .5 + 400, 520 + (hy - 520) * .12 + 40, 0, { t, lit: 1, fog: 1 });
  ctx.restore();
  ctx.save(); cam(ctx, c(hxx, hy));
  drawEscadaria(ctx, S.x0, S.y0, S.n, 0, { w: S.w, h: S.h, rail: true, wall: true, t, depth: 600 });
  const ph = f * Math.PI, pose = b_poseCarry(ph, 28), tt = b_tw(t);
  // sombra do esforço
  const sx = hxx, sy = hy;
  const hp = charPt(sx, sy, 60, pose, 'neck', { who: 'hero' });
  b_sack(ctx, sx - 60 * 1.5, hp[1] + 60 * .3, 60 * .95, -.18 + Math.sin(ph * 2) * .03, t);
  drawChar(ctx, sx, sy, 60, pose, { who: 'hero', t: tt, face: 'determined', turn: .8, light: 1, rim: '#9ac4ff', rimA: .55, pendant: 1, wind: .6 });
  { const sh = charPt(sx, sy, 60, pose, 'shL', { who: 'hero' }); ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sh[0] - 6, sh[1] - 4); ctx.quadraticCurveTo(sh[0] - 50, sh[1] + 10, sx - 60 * 1.1, hp[1] - 60 * .45); ctx.stroke(); }
  b_sweat(ctx, sx + 24, hp[1] - 40, t, 1, 3);
  b_dustp(ctx, sx - 20, sy, (fr - .2) * 2.2, 1.2);
  ctx.restore();
  return { hx: hxx, hy, f, pose };
}
function b_stairs1(ctx, t, L, D) {
  const u = L / D;
  b_stairs(ctx, t, (hx, hy) => ({ x: hx + 150 + b_ez(60, 0, u), y: hy - 215, z: b_ez(.95, 1.12, u), r: b_ez(.05, -.025, u) }));
  const p = beatInfo(t).pulse; speedLines(ctx, W * .5, H * .5, t, { n: 14, a: .08 + p * .05 });
  b_vig(ctx, .6);
}
function b_stairs2(ctx, t, L, D) {
  const u = L / D;
  // close dos pés/mão: câmera baixa, ampliada
  b_stairs(ctx, t, (hx, hy) => ({ x: hx - 10 + shakeV(t, 2)[0], y: hy - 165, z: b_ez(1.6, 1.95, u), r: -.1 + b_ez(0, .05, u) }));
  b_vig(ctx, .7);
}


/* ───────────────────────── 4. vizinhos cochichando (23.54–24.48) ───────────────────────── */
function b_whisper(ctx, x, y, str, t, t0, o = {}) {
  const k = E.back(seg(t, t0, t0 + .18)); if (k <= 0) return;
  const size = o.size || 30; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(o.rot || 0);
  ctx.font = `${size}px ${FONTS.fat}`; const w = ctx.measureText(str).width + 26, h = size * 1.5;
  ctx.fillStyle = 'rgba(232,238,252,.94)'; ctx.strokeStyle = '#3a4468'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-8 * (o.fl || 1), h / 2 - 2); ctx.lineTo(-18 * (o.fl || 1), h / 2 + 18); ctx.lineTo(8 * (o.fl || 1), h / 2 - 2); ctx.fillStyle = 'rgba(232,238,252,.94)'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a4468'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 0, 2);
  ctx.restore();
}
function b_gossip(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), camx = b_ez(430, 880, u, E.io2);
  // fundo em tela com paralaxe
  drawQuebrada(ctx, camx * .55, 600, 0, { t, lit: 1 });
  ctx.save(); cam(ctx, { x: camx, y: 360, z: b_ez(1.0, 1.12, u), r: b_ez(.03, -.02, u) });
  drawBecoGround(ctx, 660, 0, camx, { lamps: [300, 1100] });
  const lj = [[20, 470, 380, 3], [470, 395, 360, 5], [880, 480, 380, 7], [1300, 410, 340, 9]];
  lj.forEach(([x, y, w, sd], i) => drawLaje(ctx, x, y, w, 0, { h: 24, drop: 260, seed: sd, t, tank: i % 2 ? false : .8, varal: i === 2 ? [.0, .8] : false, plants: i % 2 ? 2 : 0, ant: false, dish: false }));
  const V = [[100, 470, 0, false, '...?'], [230, 470, 7, true, null], [530, 395, 1, false, 'coitada...'], [650, 395, 4, true, null], [940, 480, 3, false, 'sonhando?'], [1070, 480, 2, true, null], [1350, 410, 5, false, null], [1460, 410, 6, true, '...?']];
  V.forEach(([x, y, w, fl, txtv], i) => {
    const lean = (fl ? -1 : 1) * (6 + Math.sin(tt * 9 + i) * 2);
    drawChar(ctx, x, y, 34, Object.assign({}, POSE.stand, { lean, head: lean * .8 + 6, aR: [26, 70], aL: [-26, -70], hR: i % 2 ? 'flat' : 'open' }), { who: 'viz' + w, color: .12, t: tt, flip: fl, face: 'pout', light: -1, rim: '#8fa8d8', rimA: .35 });
    if (txtv) b_whisper(ctx, x + (fl ? -40 : 40), y - 270 - (i % 3) * 8, txtv, t, 23.6 + i * .09, { size: 26, rot: (fl ? -1 : 1) * .06, fl: fl ? -1 : 1 });
  });
  // ela, por baixo, passando em frente, decidida
  const hx = lerp(150, 1350, E.io2(u)) - 0, ph = tt * 9.5;
  drawChar(ctx, hx, 690, 52, Object.assign(walkPose(ph, 6), { head: -4 }), { who: 'hero', t: tt, face: 'determined', turn: .9, light: -1, rim: '#ffd89a', rimA: .6, pendant: 1, wind: .8 });
  ctx.restore();
  b_vig(ctx, .65);
}

/* ───────────────────────── 4b. olhos determinados (24.48–25.16) ───────────────────────── */
function b_eyes(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), S = b_ez(150, 240, u, E.out3);
  ctx.save(); cam(ctx, { x: 640 + shakeV(t, 1.4)[0], y: 360, z: b_ez(1.0, 1.12, u), r: b_ez(-.06, .0, u) });
  ctx.fillStyle = '#120c16'; ctx.fillRect(-200, -200, W + 400, H + 400);
  eyesCU(ctx, 640, 350, S, { style: 'determined', brow: .6, glowIris: .35 + .65 * E.out2(seg(u, .1, .7)), t: tt, autoBlink: false, blink: 0, look: [.1, -.05] });
  fringe(ctx, 640, 350 - S * 1.0, S, t);
  // luz dourada que nasce nos olhos
  ctx.globalCompositeOperation = 'lighter';
  for (const sg of [-1, 1]) { const ex = 640 + sg * .74 * S; ctx.fillStyle = rg(ctx, ex, 350, 0, S * 1.4, [[0, `rgba(255,205,110,${.30 * E.out2(seg(u, .2, .8))})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(ex - S * 1.5, 350 - S * 1.5, S * 3, S * 3); }
  ctx.globalCompositeOperation = 'source-over';
  const g = E.out2(seg(u, .35, 1)); glitter && glitter(ctx, t, 3, 14, 200, 150, 880, 400, { a: g });
  ctx.restore();
  flare(ctx, 640, 350, 1.2 * E.out2(seg(u, .5, 1)), '255,214,130', .6, 1);
  b_vig(ctx, .75, '8,4,12');
}

/* ───────────────────────── 5. ladrão de sonhos (25.16–27.42) ───────────────────────── */
function b_bolt(ctx, x, y, ang, len, seed, u, col = '255,230,150', w = 4) {
  if (u <= 0) return; const r = rng(seed), n = 9, pts = [[x, y]]; let a = ang;
  for (let i = 1; i <= n; i++) { a += (r() - .5) * 1.0; const d = len / n; const p = pts[i - 1]; pts.push([p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d]); }
  const m = Math.max(2, Math.floor(pts.length * clamp(u * 1.4)));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [lw, a2, c] of [[w * 3.4, .22, col], [w * 1.4, .8, col], [w * .5, 1, '255,255,255']]) { ctx.strokeStyle = `rgba(${c},${a2 * (1 - Math.max(0, u - .7) * 2.5)})`; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i < m; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  ctx.restore();
}
function b_nightBG(ctx, t, camx, lit = 1, y0 = 600) { drawQuebrada(ctx, camx, y0, 0, { t, lit, night: .15 }); drawBecoGround(ctx, y0 + 40, 0, camx, { lamps: [] }); }
function b_thief(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), HX = 470, HY = 620, S = 62;
  b_nightBG(ctx, t, 60 + u * 25);
  ctx.save(); cam(ctx, { x: b_ez(700, 560, u, E.io2), y: b_ez(380, 360, u), z: b_ez(1.0, 1.25, u, E.in2), r: b_ez(.0, -.03, u) + shakeV(t, 1.2 * u)[0] * .004 });
  // sombra que cresce no chão e na parede
  const grow = E.out3(seg(u, 0, .7)), tx = lerp(1150, 790, E.out2(seg(u, .05, .9)));
  ctx.fillStyle = lg(ctx, 0, 0, 1280, 0, [[0, 'rgba(0,0,10,0)'], [1, 'rgba(0,0,10,.0)']]);
  ctx.fillStyle = 'rgba(2,2,12,.55)'; ctx.beginPath(); ctx.ellipse(lerp(tx, HX, .5) - 60, HY + 12, (tx - HX) * .6 * grow + 40, 22, 0, 0, TAU); ctx.fill();
  // hero
  const pend = 1;
  drawChar(ctx, HX, HY, S, Object.assign({}, POSE.stand, { head: 4 }), { who: 'hero', t: tt, face: u < .55 ? 'determined' : 'shock', light: -1, rim: '#ffd89a', rimA: .5, pendant: pend, pendantGlow: .4 + .3 * Math.sin(t * 5), turn: -.3, wind: .6 });
  // ladrão
  const pose = Object.assign({}, POSE.reach, { lean: -14 + 6 * Math.sin(tt * 5), aR: [lerp(40, 112, E.out2(seg(u, .35, .95))), lerp(40, 100, E.out2(seg(u, .35, .95)))], hR: 'claw' });
  const chest = charPt(HX, HY, S, POSE.stand, 'chest', { who: 'hero' });
  const th = charPt(tx, HY, S, pose, 'aR', { who: 'ladrao', flip: true });
  const dx = u > .55 ? (chest[0] + 18 - th[0]) * E.out2(seg(u, .6, .96)) : 0;
  ctx.save(); ctx.globalAlpha *= E.out2(seg(u, 0, .25));
  // névoa escura
  ctx.fillStyle = rg(ctx, tx + dx, HY - 220, 20, 300, [[0, 'rgba(6,4,14,.75)'], [1, 'rgba(6,4,14,0)']]); ctx.fillRect(tx + dx - 320, HY - 520, 640, 640);
  drawChar(ctx, tx + dx, HY, S, pose, { who: 'ladrao', t: tt, flip: true, eyeCol: '#ff4a4a', rim: '#6a7ab8', rimA: .5 });
  ctx.restore();
  ctx.restore();
  b_vig(ctx, .7, '2,2,10');
}
function b_pendantCU(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), CX = 620, CY = 400;
  ctx.save(); cam(ctx, { x: 640 + shakeV(t, 1.5 + 4 * u)[0], y: 360 + shakeV(t, 1.5 + 4 * u, 28, 3)[1], z: b_ez(1.0, 1.35, u, E.in2), r: b_ez(.03, -.06, u) });
  // peito: pele + gola do moletom
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#c08258'], [1, '#8f5638']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.fillStyle = '#e9a52a'; ctx.strokeStyle = '#8a5a14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(W + 300, -300); ctx.lineTo(W + 300, 120); ctx.quadraticCurveTo(900, 150, CX + 150, 270); ctx.lineTo(CX, 330 + 120); ctx.lineTo(CX - 150, 270); ctx.quadraticCurveTo(380, 150, -300, 120); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-300, 100, W + 600, 20);
  // luz fria do beco + corrente
  ctx.fillStyle = rg(ctx, CX, CY, 40, 520, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(10,8,30,.6)']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CX - 210, 150); ctx.quadraticCurveTo(CX - 60, 380, CX - 6, CY - 120); ctx.moveTo(CX + 210, 150); ctx.quadraticCurveTo(CX + 60, 380, CX + 6, CY - 120); ctx.stroke();
  // estrela-pingente
  const glow = .3 + .7 * E.in2(seg(u, .55, 1)) + .15 * Math.sin(t * 9);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, CX, CY, 20, 330, [[0, `rgba(255,214,130,${.45 * glow})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(CX - 340, CY - 340, 680, 680); ctx.restore();
  compassStar(ctx, CX, CY, 118, Math.sin(t * 3) * .04, '#ffe08a', '#e9a21a', '#7a4a10', 5, { gem: '#ff7ab0' });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,240,190,${.2 * glow})`; ctx.beginPath(); ctx.arc(CX, CY, 90, 0, TAU); ctx.fill(); ctx.restore();
  // mão sombria avançando
  const k = E.in2(seg(u, .0, .85)), hx = lerp(1500, CX + 70, k), hy = lerp(700, CY + 90, k);
  bigHand(ctx, hx, hy, 2.0, lerp(-2.1, -1.55, k), lerp(.0, .75, E.in2(seg(u, .4, 1))), { col: '#1a1426', ol: '#05030c', sh: '#0a0814', olw: 7, cuff: '#0d0a16' });
  // faíscas de aviso na ponta dos dedos
  if (u > .6) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) sparkle(ctx, CX + 40 + Math.cos(i * 1.7 + t * 9) * 80, CY + 20 + Math.sin(i * 2.3 + t * 7) * 60, 10 + 8 * (i % 3), t * 4 + i, '#fff3c0'); ctx.restore(); }
  ctx.restore();
  b_vig(ctx, .7, '2,2,10');
}
function b_zap(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), HX = 520, HY = 620, S = 62;
  b_nightBG(ctx, t, 85, 1);
  const sh = shakeV(t, 14 * (1 - u), 36);
  ctx.save(); cam(ctx, { x: 640 + sh[0], y: 380 + sh[1], z: b_ez(1.18, 1.05, u, E.out2), r: .0 });
  const chest = charPt(HX, HY, S, POSE.stand, 'chest', { who: 'hero' });
  // ladrão arremessado
  const k = E.out3(seg(u, 0, .9)), tx = 790 + k * 330, tilt = k * .35;
  ctx.save(); ctx.translate(tx, HY); ctx.rotate(tilt); ctx.translate(-tx, -HY);
  drawChar(ctx, tx, HY, S, Object.assign({}, POSE.cower, { lean: -26, aR: [70, 150], aL: [30, 120] }), { who: 'ladrao', t: tt, flip: true, eyeCol: '#ffd24a', rim: '#ffc24d', rimA: .9 });
  ctx.restore();
  // mão queimando: faíscas laranja
  const hand = [tx - 70, HY - 190]; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, hand[0], hand[1], 0, 90, [[0, 'rgba(255,170,60,.8)'], [1, 'rgba(255,100,20,0)']]); ctx.fillRect(hand[0] - 100, hand[1] - 100, 200, 200); ctx.restore();
  drawChar(ctx, HX, HY, S, Object.assign({}, POSE.stand, { lean: -3, aR: [30, 50], aL: [-30, -50] }), { who: 'hero', t: tt, face: 'determined', light: -1, rim: '#ffe6a0', rimA: .9, pendant: 1, pendantGlow: 1, turn: .3 });
  // raios do pingente
  for (let i = 0; i < 9; i++) b_bolt(ctx, chest[0], chest[1], -1.9 + i * .5 + (i % 2) * .1, 260 + (i % 3) * 90, 40 + i, 1 - u * .8 + (i % 2) * .15);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, chest[0], chest[1], 0, 420 * (1 - u * .4), [[0, `rgba(255,236,170,${.95 - u * .4})`], [.3, `rgba(255,190,80,${.4 - u * .2})`], [1, 'rgba(255,170,60,0)']]); ctx.fillRect(chest[0] - 440, chest[1] - 440, 880, 880); ctx.restore();
  fxStar8(ctx, chest[0], chest[1], 46 * (1 - u * .3), { glow: 1, t, rot: t, flare: 1 });
  ctx.restore();
  rays && rays(ctx, chest[0], chest[1], t, { n: 14, len: 800, a: .22 * (1 - u) });
  b_vig(ctx, .6, '4,2,12');
}


/* ───────────────────────── 6. crane up → mapa (27.42–29.66) ───────────────────────── */
const B_MAP_PTS = [[470, 520, 6], [560, 450, 5], [640, 500, 8], [740, 430, 5], [830, 480, 6], [900, 400, 5], [560, 360, 4], [700, 330, 6], [800, 300, 4], [980, 330, 5], [1040, 250, 7], [350, 430, 4], [420, 330, 4], [640, 250, 5]];
const B_MAP_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 7], [3, 7], [7, 8], [5, 9], [9, 10], [0, 11], [11, 12], [12, 6], [7, 13], [2, 4], [8, 9]];
function b_map(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t);
  const k = E.io3(seg(u, 0, .5));            // crane up
  const mapA = E.io2(seg(u, .36, .62));      // dissolve para o mapa
  ctx.save();
  if (mapA < 1) {
    ctx.save(); cam(ctx, { x: 640, y: b_ez(380, 250, k), z: b_ez(1.0, .72, k), r: b_ez(0, -.03, k) });
    drawQuebrada(ctx, 90 + k * 40, 560 + k * 260, 0, { t, lit: 1, layerY: [k * 30, k * 80, k * 160, k * 260], fog: 1 });
    ctx.restore();
    // luzes que viram nós
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    B_MAP_PTS.forEach(p => { ctx.fillStyle = rg(ctx, p[0], p[1], 0, 30 * mapA + 6, [[0, `rgba(255,222,140,${.7 * mapA})`], [1, 'rgba(255,200,100,0)']]); ctx.fillRect(p[0] - 40, p[1] - 40, 80, 80); });
    ctx.restore();
  }
  if (mapA > 0) {
    ctx.save(); ctx.globalAlpha *= mapA;
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#0c2238'], [1, '#12324a']]); ctx.fillRect(0, 0, W, H);
    ctx.save(); cam(ctx, { x: 640, y: 360, z: b_ez(1.12, 1.0, u), r: b_ez(.03, 0, u) });
    fxMapGrid(ctx, 0, 0, W, H, { a: .55, contours: 5, compass: true, reveal: E.out2(seg(u, .4, .75)), t, cell: 80 });
    fxConstellation(ctx, B_MAP_PTS, E.out2(seg(u, .5, 1)), { edges: B_MAP_EDGES, t, lw: 1.8, twinkle: 1 });
    // pin
    const pinD = E.out2(seg(u, .5, .72)), morph = E.io2(seg(L, 29.26 - 27.42 - .12, 29.26 - 27.42 + .1));
    fxPin(ctx, 640, 500, 'VOCÊ ESTÁ AQUI', t, { drop: pinD, morph, label2: 'PARTIDA' });
    // a estrada de luz que sai do pin depois do "partida"
    const road = E.out3(seg(L, 29.26 - 27.42, 29.6 - 27.42));
    if (road > 0) { fxThread(ctx, 640, 500, 760, 330, { p: road, w: 3, col: '255,214,140', t, sag: -30 }); fxThread(ctx, 760, 330, 1040, 250, { p: clamp(road * 2 - 1), w: 3, col: '255,214,140', t, sag: -20 }); }
    ctx.restore();
    ctx.restore();
  }
  const bl = Math.exp(-Math.abs(L - (29.26 - 27.42)) * 9) * .55; if (bl > .02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; flare(ctx, 640, 410, 1.6 * bl, '255,214,130', bl, 1); ctx.restore(); }
  ctx.restore();
  b_vig(ctx, .6, '2,6,14');
}

/* ───────────────────────── 7. cicatriz (29.66–31.70) ───────────────────────── */
function b_scarOpen(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), S = 96;
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#17142a'], [1, '#2a1c34']]); ctx.fillRect(0, 0, W, H);
  fxBokeh(ctx, t, 6, 16, { cols: ['255,200,110', '170,160,255'], a: .2, y0: 80, y1: 640 });
  const open = E.io2(seg(u, .25, .62)), scar = E.out2(seg(u, .5, .95));
  const pose = lerpPose(Object.assign({}, POSE.hensCross, { hR: 'fist', hL: 'fist' }), { lean: 0, head: 2, aR: [78, 48], aL: [-78, -48], hR: 'fist', hL: 'fist' }, open);
  const ch0 = charPt(640, 640, S, pose, 'chest', { who: 'hero' }), HY = 640 + (430 - ch0[1]);
  ctx.save(); cam(ctx, { x: 640, y: b_ez(370, 400, u), z: b_ez(1.0, 1.14, u), r: b_ez(-.02, .02, u) });
  drawChar(ctx, 640, HY, S, pose, { who: 'hero', t: tt, face: u < .5 ? 'determined' : 'closed', open, scar, light: -1, rim: '#ffd89a', rimA: .6, pendant: 1 - open, wind: .5 });
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 640, 430, 0, 320, [[0, `rgba(255,205,110,${.45 * scar})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(300, 100, 680, 680);
  ctx.restore();
  b_vig(ctx, .7, '6,4,14');
}
function b_scarCU(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), S = 360;
  const pose = POSE.stand, ch = charPt(640, 900, S, pose, 'chest', { who: 'hero' });
  const beat = beatInfo(t).pulse;
  ctx.fillStyle = '#0c0912'; ctx.fillRect(0, 0, W, H);
  ctx.save(); cam(ctx, { x: 640 + shakeV(t, 1 + beat * 2)[0], y: 360, z: b_ez(1.0, 1.12, u) * (1 + .015 * beat), r: b_ez(.0, -.03, u) });
  drawChar(ctx, 640 - (ch[0] - 640) * 1, 900 + (380 - ch[1]) + 0, S, pose, { who: 'hero', t: tt, scar: 1, open: 1, light: -1, rim: '#ffd89a', rimA: .6, pendant: 0, shadow: false });
  ctx.restore();
  // luz dourada pulsando no ritmo
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 640, 380, 20, 520, [[0, `rgba(255,205,110,${.25 + .25 * beat})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  // eletrocardiograma → rachadura
  const crack = E.io2(seg(L, .3, 1.0));
  ctx.save(); ctx.fillStyle = 'rgba(8,6,16,.55)'; ctx.fillRect(0, 470, W, 130); ctx.restore();
  fxHeartbeatLine(ctx, 90, 545, 1100, t, { amp: 46, prog: E.out2(seg(u, 0, .2)), crack, speed: 1 });
  b_vig(ctx, .65, '4,2,10');
}

/* ───────────────────────── 8. apagão + parede (31.70–33.68) ───────────────────────── */
function b_blackout(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), lit = 1 - E.out2(seg(L, .05, .55));
  b_nightBG(ctx, t, 100, lit, 600);
  ctx.save(); ctx.fillStyle = `rgba(2,4,12,${.15 + .55 * (1 - lit)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  const HX = 640, HY = 640, S = b_ez(78, 66, u), pose = Object.assign({}, POSE.stand, { lean: 0, aR: [14, 10], aL: [-14, -10] });
  const ch = charPt(HX, HY, S, pose, 'chest', { who: 'hero' });
  ctx.save(); cam(ctx, { x: 640, y: b_ez(400, 360, u), z: b_ez(1.35, 1.0, u, E.out3), r: 0 });
  drawChar(ctx, HX, HY, S, pose, { who: 'hero', t: tt, face: 'determined', open: 1, scar: 1, light: -1, rim: '#ffd89a', rimA: .8, pendant: 0, turn: .2 });
  ctx.restore();
  // escuridão com um buraco de luz na cicatriz
  const cc = [HX + (ch[0] - HX) * b_ez(1.35, 1.0, u, E.out3) , 360 + (ch[1] - b_ez(400, 360, u)) * b_ez(1.35, 1.0, u, E.out3)];
  const dark = 1 - lit;
  ctx.save(); ctx.fillStyle = rg(ctx, cc[0], cc[1], 20, 440, [[0, 'rgba(2,3,10,0)'], [.5, `rgba(2,3,10,${.55 * dark})`], [1, `rgba(2,3,10,${.93 * dark})`]]); ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cc[0], cc[1], 0, 200, [[0, `rgba(255,205,110,${.3 * dark})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(0, 0, W, H);
  ctx.restore();
  b_vig(ctx, .7, '0,0,6');
}
const B_WALL = { cx: 900, cy: 330, seed: 2 };
function b_wallBase(ctx, t, o) {
  const { p, glow, shake, hero } = o;
  fxConcrete(ctx, 0, 0, W, H, { tone: 'night', seed: B_WALL.seed, light: .2 + .5 * glow, side: 'right', lightCol: '255,200,120', vig: .6, shade: .5 });
  const anchors = [[B_WALL.cx + 90, -60], [B_WALL.cx + 20, 140], [B_WALL.cx, B_WALL.cy], [B_WALL.cx - 40, 500], [B_WALL.cx - 10, 760]];
  // luz que vaza pela fresta
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, B_WALL.cx, B_WALL.cy, 0, 520 * (.4 + glow), [[0, `rgba(255,214,130,${.5 * glow})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  const pulse = Math.max(0, Math.sin(t * Math.PI * 2 / .75)) ** 4;
  const cr = fxCrack(ctx, anchors, { p, w: 3 + 9 * glow, glow, t, seed: 5, branches: Math.min(1, p * 1.2), chips: p, dust: .6 * p, pulse, fall: glow });
  return cr;
}
function b_wallHero(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t);
  ctx.save(); cam(ctx, { x: b_ez(520, 760, u, E.io2), y: 360, z: b_ez(1.0, 1.35, u, E.in2), r: b_ez(-.02, .015, u) });
  const p = b_ez(.18, .42, u); b_wallBase(ctx, t, { p, glow: .25 + .25 * u });
  // ela (perfil, só a luz da cicatriz a ilumina)
  const HX = 360, HY = 640, S = 72, pose = Object.assign({}, POSE.stand, { lean: 4, head: 2, aR: [10, 10], aL: [-14, -8] });
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(HX + 20, HY + 6, 120, 16, 0, 0, TAU); ctx.fill();
  drawChar(ctx, HX, HY, S, pose, { who: 'hero', t: tt, face: 'determined', open: 1, scar: 1, light: 1, rim: '#ffd89a', rimA: .85, pendant: 0, turn: 1, wind: .4 });
  ctx.restore();
  ctx.save(); ctx.fillStyle = rg(ctx, 640, 360, 200, 760, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.6)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  b_vig(ctx, .6, '0,0,6');
}

/* ───────────────────────── 9. build do pré-refrão (33.68–36.0) ───────────────────────── */
function b_preA(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), tr = shakeV(t, 1 + 5 * u, 31);
  ctx.save(); cam(ctx, { x: b_ez(690, 820, u, E.in2) + tr[0], y: b_ez(370, 340, u) + tr[1], z: b_ez(1.2, 1.6, u, E.in3), r: b_ez(.015, -.02, u) });
  const p = b_ez(.45, .85, u, E.in2), glow = b_ez(.5, 1, u, E.in2);
  b_wallBase(ctx, t, { p, glow });
  const HX = 360, HY = 640, S = 72;
  drawChar(ctx, HX, HY, S, Object.assign({}, POSE.stand, { lean: 6, head: 4, aR: [20, 30], aL: [-14, -8] }), { who: 'hero', t: tt, face: 'determined', open: 1, scar: 1, light: 1, rim: '#ffe0a0', rimA: 1, pendant: 0, turn: 1, wind: .8 });
  // cacos tremendo
  fxShards(ctx, B_WALL.cx, B_WALL.cy, .05 + .04 * Math.sin(t * 40), { n: 24, R: 90 + 140 * u, seed: 3, size: .7 * (.5 + u), time: t });
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fx = 640 + (B_WALL.cx - 760) * 0.0; flare(ctx, 800, 330, 1.1 * u, '255,214,130', .55 * u, 1); ctx.restore();
  b_vig(ctx, .55, '0,0,6');
}
function b_preB(ctx, t, L, D) {
  const u = L / D, tt = b_tw(t), tr = shakeV(t, 4 + 8 * u, 33);
  const WH = E.in3(seg(t, 35.35, 35.98));
  ctx.save(); cam(ctx, { x: B_WALL.cx - 10 + tr[0], y: B_WALL.cy + 20 + tr[1], z: b_ez(2.0, 3.6, u, E.in3), r: b_ez(-.03, .05, u) });
  b_wallBase(ctx, t, { p: 1, glow: 1 });
  fxShards(ctx, B_WALL.cx, B_WALL.cy, .06 + .05 * u, { n: 30, R: 160 + 200 * u, seed: 5, size: 1, time: t });
  const R = lerp(10, 230, E.in3(u));
  fxStar8(ctx, B_WALL.cx, B_WALL.cy, R, { glow: 1, t, rot: u * .4, pulse: 1, flare: 1 });
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = E.in2(u); ctx.fillStyle = rg(ctx, 640, 360, 0, 900 * (.2 + g), [[0, `rgba(255,236,170,${.6 * g})`], [1, 'rgba(255,190,80,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  flare(ctx, 640, 360, 1 + 2.2 * u, '255,226,160', .9 * u, 1);
  // quase branco com estrela no fim
  if (WH > 0) {
    ctx.save(); ctx.fillStyle = `rgba(255,250,236,${.94 * WH})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.globalAlpha = WH; fxStar8(ctx, 640, 360, 330, { glow: .5, t, rot: .4, flare: 1, facets: 1 }); ctx.restore();
  }
  b_vig(ctx, .4 * (1 - WH), '0,0,6');
}

const SCENES_B = [
  { t0: 19.36, t1: 20.56, name: 'b_busStop', fn: b_busStop },
  { t0: 20.56, t1: 21.44, name: 'b_table', fn: b_table },
  { t0: 21.44, t1: 22.50, name: 'b_stairs1', fn: b_stairs1 },
  { t0: 22.50, t1: 23.54, name: 'b_stairs2', fn: b_stairs2 },
  { t0: 23.54, t1: 24.48, name: 'b_gossip', fn: b_gossip },
  { t0: 24.48, t1: 25.16, name: 'b_eyes', fn: b_eyes },
  { t0: 25.16, t1: 26.40, name: 'b_thief', fn: b_thief },
  { t0: 26.40, t1: 26.96, name: 'b_pendantCU', fn: b_pendantCU },
  { t0: 26.96, t1: 27.42, name: 'b_zap', fn: b_zap },
  { t0: 27.42, t1: 29.66, name: 'b_map', fn: b_map },
  { t0: 29.66, t1: 30.62, name: 'b_scarOpen', fn: b_scarOpen },
  { t0: 30.62, t1: 31.70, name: 'b_scarCU', fn: b_scarCU },
  { t0: 31.70, t1: 32.66, name: 'b_blackout', fn: b_blackout },
  { t0: 32.66, t1: 33.68, name: 'b_wallHero', fn: b_wallHero },
  { t0: 33.68, t1: 34.90, name: 'b_preA', fn: b_preA },
  { t0: 34.90, t1: 36.0, name: 'b_preB', fn: b_preB },
];
const IMPACTS_B = [
  { t: 23.54, d: .07, type: 'flash' }, { t: 26.96, d: .09, type: 'invert' }, { t: 27.05, d: .14, type: 'white' },
  { t: 29.26, d: .09, type: 'flash' }, { t: 31.70, d: .07, type: 'flash' }, { t: 33.68, d: .08, type: 'invert' },
];
globalThis.SCENES_B = SCENES_B; globalThis.IMPACTS_B = IMPACTS_B;
