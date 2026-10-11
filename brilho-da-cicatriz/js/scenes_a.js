'use strict';
/* ============================================================
   scenes_a.js — 0 → 19.36 s : intro instrumental (rachadura → mapa estelar → quebrada → amanhecer → janela)
   + verso 1a (acordar, boletos/geladeira, a rua ensina, sobreviver é obrigação)
   Prefixo a_/A_ em tudo. Personagem "on twos".
   ============================================================ */
const A_GOLD = '255,194,77';
const a_tw = t => Math.floor(t * 12) / 12;
function a_cam(ctx, x, y, z = 1, r = 0) { cam(ctx, { x, y, z, r }); }
function a_letterbox(ctx, h) { if (h > .5) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); } }
/* palavra: 0..1 a partir do instante (para "bater" na palavra) */
const a_at = (t, t0, d = .12) => seg(t, t0, t0 + d);

/* ---------- ponto de luz com halo (estrelinha) ---------- */
function a_glowDot(ctx, x, y, r, a = 1, col = A_GOLD) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, r * 5, [[0, `rgba(${col},${.55 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
  sparkle(ctx, x, y, r * 2.2, 0, `rgba(255,248,225,${.95 * a})`); ctx.restore();
}

/* ============================================================
   1. RACHADURA (mundo próprio, câmera percorre a fenda)
   ============================================================ */
const A_CRK = [[610, -400], [650, -120], [600, 160], [668, 430], [612, 720], [660, 1000], [606, 1300], [650, 1600], [640, 1900]];
let A_CRK_PTS = null;
function a_crkPts() { if (!A_CRK_PTS) A_CRK_PTS = fxCrackPts(A_CRK, {}); return A_CRK_PTS; }
function a_crackWorld(ctx, t, o) {
  // concreto em coordenadas de mundo (esticado para cobrir a viagem)
  fxConcrete(ctx, -500, -600, 2280, 2700, { tone: 'night', seed: 1, light: o.light == null ? .5 : o.light, side: 'left', vig: 0, shade: 0 });
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#04070d'; ctx.fillRect(-500, -600, 2280, 2700); ctx.restore();
  fxCrack(ctx, A_CRK, { p: 1, w: o.w, glow: o.glow, t, pulse: o.pulse, branches: o.br == null ? .4 : o.br, chips: 1, dust: o.dust == null ? .8 : o.dust, seed: 3 });
}
/* A1: close extremo, batimento */
function a_crackClose(ctx, t, L, D) {
  const k = L / D, b = beatInfo(t), pulse = b.pulse, beat2 = Math.exp(-((b.f + .16) % 1) * 9) * .55; // "lub-dub"
  const hb = Math.max(pulse, beat2 * .7), fade = sstep(.0, .9, L);
  ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H);
  ctx.save(); a_cam(ctx, 640 + 26 * k, 40 + 190 * E.io2(k), 2.7 - .55 * k, -.03 + .05 * k);
  a_crackWorld(ctx, t, { w: 3.4 + .8 * hb, glow: (.18 + .85 * hb) * fade, pulse: hb, light: .55, br: .3 });
  ctx.restore();
  // halo pulsante em tela
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const hy = 360;
  ctx.fillStyle = rg(ctx, 650, hy, 0, 420, [[0, `rgba(${A_GOLD},${(.1 + .25 * hb) * fade})`], [1, `rgba(${A_GOLD},0)`]]); ctx.fillRect(0, 0, W, H); ctx.restore();
  fxDust(ctx, t, { x: 200, y: 60, w: 880, h: 600, n: 40, col: A_GOLD, a: .8 * fade, seed: 2, size: 1.4 });
  fxVignette(ctx, .85, '2,3,8');
  ctx.fillStyle = `rgba(0,0,0,${1 - fade})`; ctx.fillRect(0, 0, W, H);
  a_letterbox(ctx, 64 * (1 - E.out3(seg(L, 1.2, 2.0))) + 0);
}
/* A2: viaja pela fenda, ela vira estrada de luz com constelação; câmera rola 90° no fim */
function a_crackRoad(ctx, t, L, D) {
  const k = L / D, b = beatInfo(t), hb = Math.max(b.pulse * .8, .25);
  const roll = -E.io3(seg(k, .55, 1)) * Math.PI / 2;
  const cy = lerp(160, 1180, E.io2(k) * .85 + k * .15), cx = lerp(640, 640, k);
  ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H);
  const glow = .7 + 1.1 * E.in2(seg(k, .35, 1)) + .4 * hb, w = 4 + 6 * E.in2(seg(k, .3, 1));
  ctx.save(); a_cam(ctx, cx, cy, lerp(1.7, 1.05, E.io2(k)), roll);
  a_crackWorld(ctx, t, { w, glow, pulse: hb, light: .45, br: .3 + .1 * k });
  // constelação nascendo ao longo da fenda
  const tp = a_crkPts(), pts = []; for (let i = 0; i < tp.length; i += 4) { const p = tp[i], r = rng(i * 13 + 5); pts.push([p[0] + (r() - .5) * 150 + (i % 2 ? 110 : -110), p[1] + (r() - .5) * 60, 1.3 + r() * 1.5]); }
  const fl = []; for (let i = 0; i < tp.length; i += 5) fl.push([tp[i][0], tp[i][1], 2.4]);
  fxConstellation(ctx, pts, E.out2(seg(k, .08, .8)), { t, lw: 1.3, twinkle: 1 });
  fxConstellation(ctx, fl, E.out2(seg(k, .0, .55)), { t, lw: 1.1 });
  ctx.restore();
  // brilho horizontal (flare) cresce ao final: a fenda vira linha de horizonte
  const fa = E.in2(seg(k, .6, 1)); if (fa > 0) flare(ctx, 640, 360, .6 + fa * .8, A_GOLD, .5 * fa, .8);
  fxDust(ctx, t, { x: 0, y: 0, w: W, h: H, n: 46, col: A_GOLD, a: .8, seed: 6, size: 1.5 });
  fxVignette(ctx, .7, '2,3,8');
}

/* ============================================================
   2. QUEBRADA (noite → amanhecer) com constelação de lajes
   ============================================================ */
const A_Y0 = 640;
/* bloco-alvo (casa da protagonista) — camada 3 */
let A_TGT = null;
function a_target() {
  if (A_TGT) return A_TGT;
  let best = null;
  for (let wx = 700; wx < 1900; wx += 6) { const b = quebradaBlock(3, wx); if (b.nf >= 4 && b.w >= 150 && b.cols >= 3 && (!best || b.nf > best.nf)) { if (b.x > 700 && b.x < 1700) best = b; } }
  best = best || quebradaBlock(3, 1000);
  const col = Math.min(1, best.cols - 1), floor = 2, w = quebradaWindow(3, best.x + best.w * .4, floor, col);
  A_TGT = { b: best, wx: w.x + w.w / 2, wy: -(w.y + w.h / 2), win: w, rx: best.x + best.w / 2, rh: best.h };
  return A_TGT;
}
/* pontos de laje (camadas 2 e 3) em coordenadas de mundo da camada */
function a_roofs(li, x0, x1) {
  const out = []; for (let ci = Math.floor(x0 / WQ_CH); ci <= Math.floor(x1 / WQ_CH); ci++) for (const b of wqBlocks(li, ci)) if (b.x > x0 && b.x < x1) out.push({ x: b.x + b.w * (.3 + (b.seed % 5) * .1), h: b.h + 6, b });
  return out;
}
/* desenha a quebrada com câmera (camX no mundo da camada 3), dy = deslocamento vertical (tilt), zoom em (zx,zy) */
function a_quebrada(ctx, t, camX, dy, mood, o = {}) {
  ctx.save();
  if (o.z && o.z !== 1) { ctx.translate(o.zx, o.zy); ctx.scale(o.z, o.z); ctx.translate(-o.zx, -o.zy); }
  const lit = o.lit == null ? 1 : o.lit;
  ctx.save(); ctx.translate(0, dy * .45); drawSkyMood(ctx, mood, t, Object.assign({ y1: 1000 }, o.skyOpts || {})); ctx.restore();
  ctx.translate(0, dy);
  drawQuebrada(ctx, camX, A_Y0, mood, { t, lit, sky: false, fog: o.fog });
  ctx.restore();
}
/* constelação ligando lajes da camada li; retorna pts na tela (já com dy) */
function a_constel(ctx, t, camX, dy, prog, o = {}) {
  const li = o.li == null ? 3 : o.li, par = [.1, .24, .5, 1][li], cx = camX * par;
  const roofs = a_roofs(li, cx - 700, cx + 700).sort((a, b) => a.x - b.x), pts = [], tg = a_target();
  roofs.forEach((r, i) => { if (i % (o.step || 2) === 0) { const s = quebradaToScreen(li, r.x, r.h, camX, A_Y0); pts.push([s[0], s[1] + dy, 3 + (r.b.seed % 3) * .6]); } });
  // estrelas do céu ligando as lajes (rota do mapa)
  const extra = o.sky || [];
  const all = pts.concat(extra); const edges = []; for (let i = 1; i < pts.length; i++) edges.push([i - 1, i]);
  extra.forEach((e, j) => { let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p[0] - e[0], p[1] - e[1]); if (d < bd) { bd = d; bi = i; } }); edges.push([bi, pts.length + j]); });
  ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; fxConstellation(ctx, all, prog, { edges, t, lw: o.lw || 1.5, twinkle: 1 }); ctx.restore();
  return all;
}

/* A3: o horizonte de luz se abre e revela a quebrada à noite */
function a_openMap(ctx, t, L, D) {
  const k = L / D, open = E.out3(seg(L, 0, 1.0)), hh = 3 + 400 * open;
  const camX = a_target().wx - 560 + 70 * k, dy = lerp(215, 175, E.io2(k));
  ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 360 - hh, W, hh * 2); ctx.clip();
  ctx.translate(W / 2, H / 2); const z = lerp(1.18, 1.0, E.out3(k)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  a_quebrada(ctx, t, camX, dy, 0, {});
  // estrelas extras e rede de constelação
  const sky = [[330, 90, 2.6], [520, 70, 1.8], [980, 120, 2.4], [1130, 60, 1.8], [760, 200, 1.6]];
  const prog = E.io2(seg(L, .9, 2.8));
  ctx.restore();
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.beginPath(); ctx.rect(0, 360 - hh, W, hh * 2); ctx.clip();
  a_constel(ctx, t, camX, dy, prog, { li: 3, step: 1, sky: [[560, 150 + dy * .2, 2.4], [880, 130 + dy * .2, 2.2]], a: .95 });
  a_constel(ctx, t, camX, dy, prog * .9, { li: 2, step: 2, a: .6, lw: 1.1 });
  ctx.restore();
  // bordas luminosas da fenda
  if (open < .995) { const g = 1 - open; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const sg of [-1, 1]) { const y = 360 + sg * hh; ctx.fillStyle = lg(ctx, 0, y - 22, 0, y + 22, [[0, `rgba(${A_GOLD},0)`], [.5, `rgba(255,236,190,${.9 * g + .2})`], [1, `rgba(${A_GOLD},0)`]]); ctx.fillRect(0, y - 22, W, 44); } ctx.restore(); flare(ctx, 640, 360, .9 * g + .1, A_GOLD, .6 * g, 1); }
  // véu escuro para o título (quadrante superior esquerdo calmo)
  a_titleVeil(ctx, .55 * sstep(0, 1.2, L));
  fxVignette(ctx, .55, '2,4,12');
}
function a_titleVeil(ctx, a) {
  if (a <= 0) return; ctx.save(); ctx.fillStyle = rg(ctx, 480, 280, 60, 520, [[0, `rgba(3,6,16,${a * .75})`], [1, 'rgba(3,6,16,0)']]); ctx.fillRect(0, 0, 1100, 620); ctx.restore();
}

/* A4: tilt-up ao céu — a quebrada vai ficando embaixo e a constelação vira mapa; estrela-bússola */
function a_tiltSky(ctx, t, L, D) {
  const k = L / D, e = E.io2(k), mood = lerp(0, .35, E.in2(k));
  const camX = a_target().wx - 490 + 40 * k, dy = lerp(175, 560, e);
  a_quebrada(ctx, t, camX, dy, mood, {});
  // mapa estelar no céu: grade + curvas de nível finas
  const ga = sstep(.1, .6, k) * (1 - sstep(.85, 1, k)) * .5;
  fxMapGrid(ctx, 0, 0, W, 520, { a: ga, col: A_GOLD, contours: 3, compass: false, reveal: seg(k, .1, .7), t, cell: 90 });
  // estrelas do mapa e a rota da constelação até a casa dela
  const tg = a_target(), s3 = quebradaToScreen(3, tg.rx, tg.rh, camX, A_Y0); const hx = s3[0], hy = s3[1] + dy;
  const ptsS = [[160, 410 + dy * .0, 1.6], [420, 370, 2.2], [690, 300, 2.8], [900, 230, 2.2], [1090, 160, 2.6], [1190, 90, 1.8]];
  const route = [[hx, hy, 3]]; // casa -> rota
  const pr = E.io2(seg(k, .05, .8));
  ctx.save(); ctx.globalAlpha = 1;
  const pts = [[hx, hy, 3.2], [hx - 150, hy - 120 + dy * .0 - 80 * k, 2.2], [hx - 330, hy - 220, 1.8], [hx - 530, hy - 190, 2.4], [hx - 720, hy - 300, 1.6], [hx - 160, hy - 330, 2.0], [hx + 120, hy - 270, 2.4], [hx + 240, hy - 410, 1.8]];
  fxConstellation(ctx, pts, pr, { edges: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7]], t, lw: 1.5, twinkle: 1 });
  ctx.restore();
  // estrela-bússola de 8 pontas surgindo alto
  const sa = E.out3(seg(k, .45, .95)), sx = lerp(1010, 960, k), sy = lerp(-60, 110, e);
  if (sa > 0 && sy > -40) fxStar8(ctx, sx, sy, 38 * sa, { glow: .9 * sa, a: sa, t, rays: 1, flare: 1, rot: t * .1 });
  a_titleVeil(ctx, .5);
  fxVignette(ctx, .5, '2,4,12');
}

/* A5: amanhecer chega e a câmera desce até a janela dela */
function a_dawnWindow(ctx, t, L, D) {
  const k = L / D, tg = a_target(), mood = lerp(.45, 1, E.io2(k));
  const dy = lerp(560, -40, E.io3(seg(k, 0, .8)));
  const camXs = lerp(tg.wx - 450, tg.wx - 120, E.io2(seg(k, 0, .8))); // janela vem p/ perto do centro
  const wsx = quebradaToScreen(3, tg.wx, tg.wy, camXs, A_Y0); // posição da janela sem dy
  const zk = E.in3(seg(k, .55, 1)), z = lerp(1, 7.5, zk);
  // o zoom acompanha o ponto da janela (com dy)
  const wy = wsx[1] + dy;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-lerp(W / 2, wsx[0], zk), -lerp(H / 2, wy, zk));
  a_quebrada(ctx, t, camXs, dy, mood, { skyOpts: { p: E.io2(k) } });
  // brilho aconchegante da janela dela
  const win = tg.win, wp = quebradaToScreen(3, tg.win.x, 0, camXs, A_Y0), gx = wp[0], gy = A_Y0 + tg.win.y + dy, ga = E.out2(seg(k, .3, .8));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, gx + win.w / 2, gy + win.h / 2, 0, 80, [[0, `rgba(255,214,140,${.9 * ga})`], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(gx - 80, gy - 80, win.w + 160, win.h + 160);
  ctx.fillStyle = `rgba(255,226,160,${.95 * ga})`; ctx.fillRect(gx, gy, win.w, win.h); ctx.restore();
  ctx.restore();
  // luz dourada final preenche
  const wa = E.in3(seg(k, .86, 1)); if (wa > 0) { ctx.fillStyle = `rgba(255,226,170,${wa})`; ctx.fillRect(0, 0, W, H); }
  a_titleVeil(ctx, .45 * (1 - zk));
  fxVignette(ctx, .45, '20,10,16');
}


/* ============================================================
   3. QUARTO — despertador, olhos, peso do dia
   ============================================================ */
/* menina na cama (deitada), com cobertor por cima do corpo. awake 0..1 muda o rosto */
function a_heroBed(ctx, t, o = {}) {
  const tt = a_tw(t), br = Math.sin(t * 2.2) * 1.6, x = 252, y = 452 + br * .5;
  drawChar(ctx, x, y, 30, POSE.sleep, { who: 'hero', t: tt, face: o.face || 'closed', flip: true, shadow: false, autoBlink: false });
  // cobertor mostarda por cima do corpo (deixa cabeça/ombro de fora)
  ctx.save(); ctx.beginPath(); ctx.moveTo(262, 452 + br); ctx.bezierCurveTo(300, 436 + br, 360, 456, 420, 440); ctx.bezierCurveTo(470, 428, 520, 442, 564, 450); ctx.lineTo(564, 516); ctx.lineTo(262, 516); ctx.closePath();
  ctx.fillStyle = lg(ctx, 0, 430, 0, 516, [[0, '#f6c24a'], [1, '#d99a22']]); ctx.fill(); ctx.strokeStyle = '#a8741a'; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,170,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(270, 456 + br); ctx.bezierCurveTo(310, 440 + br, 360, 460, 420, 444); ctx.stroke(); ctx.restore();
}
/* mão da menina batendo no despertador (u 0..1: chega, bate, volta) */
function a_slapHand(ctx, u, cx, cy) {
  if (u <= 0 || u >= 1) return;
  const go = E.out3(seg(u, 0, .28)), back = E.in2(seg(u, .55, 1)), k = go * (1 - back);
  const sx = 250, sy = 380, hx = lerp(sx, cx - 6, k), hy = lerp(sy, cy - 40, k) + Math.sin(u * 9) * 2 * (1 - k);
  ctx.save(); ctx.strokeStyle = '#a8741a'; ctx.lineCap = 'round'; ctx.lineWidth = 44; ctx.beginPath(); ctx.moveTo(sx - 30, sy - 40); ctx.quadraticCurveTo(lerp(sx, hx, .4), lerp(sy - 60, hy - 60, .5), hx - 14, hy - 26); ctx.stroke();
  ctx.strokeStyle = '#ecaa2a'; ctx.lineWidth = 38; ctx.stroke(); ctx.restore();
  bigHand(ctx, hx, hy, .42, 2.45 - k * .35, .1 + .5 * (1 - k), { cuff: null });
}
function a_roomClock(ctx, t, L, D) {
  const k = L / D, tHit = 11.76, ring = t < tHit ? 1 : 0, zk = E.io3(seg(L, 0, .75));
  ctx.save(); const z = lerp(1.0, 2.0, zk); ctx.translate(W / 2, H / 2); ctx.rotate(lerp(-.02, .03, zk)); ctx.scale(z, z); ctx.translate(-lerp(640, 600, zk), -lerp(360, 400, zk));
  const r = intRoom(ctx, t, { sun: .35 + .65 * E.out2(seg(L, 0, .5)), ring, time: '05:00' });
  a_heroBed(ctx, t, { face: t < tHit ? 'pout' : 'closed' });
  a_slapHand(ctx, seg(t, 11.66, 12.12), r.clock.x, r.clock.y);
  // impacto: linhas de "tchan"
  const hu = t - tHit; if (hu > 0 && hu < .3) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${1 - hu / .3})`; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r0 = 44 + hu * 80, r1 = r0 + 26; ctx.beginPath(); ctx.moveTo(r.clock.x + Math.cos(a) * r0, r.clock.y - 20 + Math.sin(a) * r0); ctx.lineTo(r.clock.x + Math.cos(a) * r1, r.clock.y - 20 + Math.sin(a) * r1); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
  fxDust(ctx, t, { x: 0, y: 0, w: W, h: H, n: 24, col: '255,236,180', a: .5, seed: 8, size: 1.2 });
  fxVignette(ctx, .4, '8,14,28');
  a_letterbox(ctx, 0);
}
/* close dos olhos com a luz do sol cruzando (vidraça trincada) */
function a_eyesShot(ctx, t, L, D) {
  const k = L / D, tOpen = 12.6, o = E.out2(seg(t, tOpen, tOpen + .22)), flut = t < tOpen ? .05 + .05 * Math.max(0, Math.sin(t * 15)) * seg(t, 12.3, 12.55) : 0;
  const op = t < tOpen ? flut : lerp(.05, 1, o), cx = 640 + 12 * Math.sin(t * .8) - 20 * k, cy = 392, S = 158 * (1 + .06 * k);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(lerp(-.04, .02, k)); ctx.translate(-W / 2, -H / 2);
  // travesseiro ao fundo
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#f4e6dc'], [1, '#dcc4b8']]); ctx.fillRect(-100, -100, W + 200, H + 200);
  ctx.strokeStyle = 'rgba(150,110,100,.22)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-50, 520 + i * 40); ctx.quadraticCurveTo(400, 480 + i * 40 + 20 * Math.sin(i), W + 50, 540 + i * 36); ctx.stroke(); }
  eyesCU(ctx, cx, cy, S, { t: a_tw(t), open: 1, blink: 1 - op, autoBlink: false, brow: t < tOpen ? -.55 : lerp(-.4, .25, o), style: 'open', lash: 2, seed: 4 });
  fringe(ctx, cx, cy - S * 1.02, S * .98, a_tw(t));
  // luz do sol: faixa diagonal que cruza o rosto, com sombras de rachadura
  const sx = lerp(-380, 1500, E.io2(seg(L, 0.0, D * .96))), warm = sstep(11.9, 12.5, t);
  ctx.save(); ctx.translate(sx, 360); ctx.rotate(-.42);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, -190, 0, 190, 0, [[0, 'rgba(255,214,130,0)'], [.5, `rgba(255,222,150,${.5 + .2 * warm})`], [1, 'rgba(255,214,130,0)']]); ctx.fillRect(-190, -700, 380, 1400);
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(70,40,30,.2)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const rr = rng(21); ctx.beginPath(); for (let i = 0; i < 9; i++) { let x = (rr() - .5) * 280, y = -500 + i * 120 + rr() * 40; ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (rr() - .5) * 60; y += 24 + rr() * 30; ctx.lineTo(x, y); } } ctx.stroke(); ctx.restore();
  ctx.restore();
  flare(ctx, sx - 100, 250, 1.0, A_GOLD, .5 * warm, .6);
  fxDust(ctx, t, { x: 0, y: 0, w: W, h: H, n: 26, col: '255,236,190', a: .9, seed: 4, size: 1.6 });
  fxVignette(ctx, .55, '40,24,24');
}
/* pedra "SEG" cai e achata o travesseiro — o dia pesa */
function a_rock(ctx, x, y, s, sq, face) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + sq * .22), s * (1 - sq * .3)); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-86, 0); ctx.bezierCurveTo(-96, -70, -50, -112, 6, -108); ctx.bezierCurveTo(70, -104, 104, -60, 92, 0); ctx.closePath();
  ctx.fillStyle = lg(ctx, -90, -110, 90, 0, [[0, '#9aa3b4'], [1, '#5c6578']]); ctx.fill(); ctx.strokeStyle = '#2c3144'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(-40, -78, 26, 11, -.5, 0, TAU); ctx.fill();
  // calendário colado
  ctx.save(); ctx.translate(22, -52); ctx.rotate(.08); ctx.fillStyle = '#fffaf0'; ctx.fillRect(-30, -26, 60, 56); ctx.strokeStyle = '#2c3144'; ctx.lineWidth = 3; ctx.strokeRect(-30, -26, 60, 56); ctx.fillStyle = '#e8453c'; ctx.fillRect(-30, -26, 60, 18); ctx.strokeRect(-30, -26, 60, 18);
  ctx.fillStyle = '#fff'; ctx.font = `15px ${FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SEG', 0, -17); ctx.fillStyle = '#2c3144'; ctx.font = `26px ${FONTS.comic}`; ctx.fillText('5', 0, 12); ctx.restore();
  // carinha cansada
  ctx.strokeStyle = '#2c3144'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  if (face === 'x') { for (const sx of [-44, -10]) { ctx.beginPath(); ctx.moveTo(sx - 7, -64); ctx.lineTo(sx + 7, -50); ctx.moveTo(sx + 7, -64); ctx.lineTo(sx - 7, -50); ctx.stroke(); } }
  else { for (const sx of [-44, -10]) { ctx.beginPath(); ctx.arc(sx, -56, 8, .1, Math.PI - .1); ctx.stroke(); } }
  ctx.beginPath(); ctx.arc(-27, -30, 8, Math.PI + .3, -.3); ctx.stroke(); ctx.fillStyle = 'rgba(255,120,140,.55)'; ctx.beginPath(); ctx.ellipse(-58, -42, 8, 5, 0, 0, TAU); ctx.ellipse(6, -42, 8, 5, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function a_weightShot(ctx, t, L, D) {
  const tHit = 13.38, u = seg(t, 13.18, tHit), fall = E.in3(u), after = t - tHit;
  const sq = after > 0 ? Math.exp(-after * 9) * Math.cos(after * 38) * .6 + .45 * Math.exp(-after * 4) : 0;
  const sh = after > 0 && after < .35 ? shakeV(t, 14 * Math.exp(-after * 9), 40, 3) : [0, 0];
  ctx.save(); ctx.translate(W / 2 + sh[0], H / 2 + sh[1]); const z = lerp(1.2, 1.35, E.out3(seg(L, 0, D))); ctx.scale(z, z); ctx.translate(-lerp(380, 340, seg(L, 0, D)), -440);
  const r = intRoom(ctx, t, { sun: 1, ring: 0 });
  const dent = after > 0 ? E.out3(seg(after, 0, .12)) : 0;
  ctx.save(); ctx.translate(0, dent * 8); a_heroBed(ctx, t, { face: after > 0 ? 'shock' : 'closed' }); ctx.restore();
  // pedra cai sobre o travesseiro
  const ry = lerp(-260, 452, fall); a_rock(ctx, 190, ry + dent * 6, .95, after > 0 ? sq : 0, after > 0 ? 'x' : 'n');
  // estrelinhas de impacto
  if (after > 0 && after < .4) { ctx.save(); for (let i = 0; i < 6; i++) { const a = -Math.PI * (i + .5) / 6 - .1, d = 70 + after * 300; sparkle(ctx, 190 + Math.cos(a) * d * 1.2, 440 + Math.sin(a) * d * .9, 12 * (1 - after / .4), after * 8, '#fff6c8'); } ctx.restore(); }
  ctx.restore();
  fxVignette(ctx, .45, '8,14,28');
}

/* ============================================================
   4. COZINHA — boletos e geladeira meio vazia
   ============================================================ */
function a_billsShot(ctx, t, L, D) {
  const k = L / D, bills = E.out2(seg(t, 13.56, 14.06)), zk = E.io2(k);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(lerp(.025, -.01, k)); const z = lerp(1.0, 1.3, zk); ctx.scale(z, z); ctx.translate(-lerp(640, 800, zk), -lerp(360, 300, zk));
  const r = intKitchen(ctx, t, { open: 0, bills, light: 1 });
  // menina olha o mural (sonolenta -> chocada em 'pagar')
  const face = t < 13.84 ? 'sleepy' : t < 14.4 ? 'shock' : 'sad';
  const bob = Math.sin(a_tw(t) * 6) * 1.2;
  drawChar(ctx, 760, r.floorY + 6 + bob, 46, POSE.slump, { who: 'hero', t: a_tw(t), face, flip: false, turn: .4 });
  // boletos extras estourando em torno do mural nos acentos 'Conta' e 'pagar'
  for (const [tt, bx, by, rot, lab, amt] of [[13.56, 1090, 320, .2, 'LUZ', 'R$ 187,40'], [13.88, 940, 360, -.25, 'ÁGUA', 'R$ 94,10'], [13.72, 1180, 250, .1, 'GÁS', 'R$ 110,00']]) {
    const u = a_at(t, tt, .22); if (u <= 0 || u >= 1 && t > tt + .45) continue; const fy = Math.max(0, t - tt - .1) * 90;
    if (t > tt + .45) continue; ctx.save(); ctx.globalAlpha = 1 - seg(t, tt + .25, tt + .45); billSheet(ctx, bx, by + fy, rot, .24 * E.back(u), lab, amt, '#e0523a', false); ctx.restore();
  }
  ctx.restore();
  fxVignette(ctx, .4, '24,18,30');
}
/* a geladeira com só um limão e um ovo; 'pela metade' parte os dois ao meio */
function a_fridgeShot(ctx, t, L, D) {
  const k = L / D, op = E.out3(seg(t, 14.12, 14.4)), zk = E.out3(seg(L, 0, .5));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(lerp(-.02, .015, k)); const z = lerp(1.1, 1.85, E.io2(k)); ctx.scale(z, z); ctx.translate(-lerp(380, 250, k), -lerp(360, 410, k));
  const r = intKitchen(ctx, t, { open: op, bills: 1, light: 1 });
  const fr = r.fridge, ix = fr.x + 14, iy = fr.y + 150, iw = fr.w - 28, ih = fr.h - 164, sy = j => iy + 20 + j * (ih - 40) / 3.1;
  if (op > .3) {
    // esvazia o interior (sobrepõe) e deixa só 2 itens
    ctx.fillStyle = lg(ctx, 0, iy, 0, iy + ih, [[0, '#f4fbff'], [1, '#c9dce6']]); ctx.fillRect(ix, iy, iw, ih); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(ix, iy, 10, ih); ctx.fillRect(ix + iw - 8, iy, 8, ih);
    for (let j = 0; j < 4; j++) { const y = sy(j); ctx.fillStyle = 'rgba(190,220,235,.85)'; ctx.fillRect(ix, y, iw, 7); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(ix, y, iw, 2); }
    const half = E.out3(seg(t, 14.7, 14.95)), wob = Math.sin(t * 14) * 1.5 * (1 - half);
    // limão
    if (half < .01) lemon(ctx, ix + 70, sy(1) - 12, 22); else for (const sg of [-1, 1]) { ctx.save(); ctx.translate(ix + 70 + sg * (8 + 14 * half), sy(1) - 12 - Math.sin(half * Math.PI) * 10); ctx.rotate(sg * half * .3); ctx.beginPath(); ctx.ellipse(0, 0, 14, 20, 0, 0, TAU); ctx.fillStyle = '#ffe14a'; ctx.fill(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 3.5; ctx.stroke(); ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.ellipse(sg * -2, 0, 9, 14, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#f0c820'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sg * -2, -13); ctx.lineTo(sg * -2, 13); ctx.moveTo(-9, 0); ctx.lineTo(5, 0); ctx.stroke(); ctx.restore(); }
    // ovo
    if (half < .01) { ctx.save(); ctx.translate(ix + 165, sy(2) - 4 + wob); egg(ctx, 0, 0, .5); ctx.restore(); } else for (const sg of [-1, 1]) { ctx.save(); ctx.translate(ix + 165 + sg * (8 + 13 * half), sy(2) - 14 - Math.sin(half * Math.PI) * 12); ctx.rotate(sg * half * .5); ctx.beginPath(); ctx.moveTo(-sg * 14, 12); ctx.lineTo(-sg * 10, -4); ctx.lineTo(-sg * 4, 2); ctx.lineTo(sg * 0, -8); ctx.lineTo(sg * 6, 0); ctx.lineTo(sg * 12, -6); ctx.bezierCurveTo(sg * 18, 8, sg * 10, 20, 0, 22); ctx.bezierCurveTo(-sg * 8, 22, -sg * 14, 18, -sg * 14, 12); ctx.closePath(); ctx.fillStyle = '#fff3dd'; ctx.fill(); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#ffb82e'; ctx.beginPath(); ctx.arc(-sg * 3, 8, 6, 0, TAU); ctx.fill(); ctx.restore(); }
    // luz fria vazando para a cozinha
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, ix, iy + 40, ix + 380, iy + 120, [[0, `rgba(180,225,255,${.32 * op})`], [1, 'rgba(180,225,255,0)']]); poly(ctx, [[ix + iw, iy], [ix + iw + 380, iy + 60], [ix + iw + 480, r.floorY + 40], [ix + iw, iy + ih]]); ctx.fill(); ctx.restore();
  }
  // menina espia (olhando a geladeira)
  const lookIn = op; const hx = lerp(560, 468, E.out3(seg(t, 14.0, 14.3)));
  drawChar(ctx, hx, r.floorY + 6, 46, lerpPose(POSE.stand, POSE.slump, .7), { who: 'hero', t: a_tw(t), face: t > 14.7 ? 'sad' : 'shock', flip: true, turn: -.5, rim: '180,225,255', light: -1 });
  ctx.restore();
  fxVignette(ctx, .4, '24,18,30');
}

/* ============================================================
   5. A RUA ENSINOU — portão de escola trancado, muro de giz
   ============================================================ */
function a_walkHero(ctx, x, y, s, t, o = {}) {
  const ph = a_tw(t) * TAU * 1.5, bob = Math.abs(Math.sin(ph)) * 3;
  return drawChar(ctx, x, y - bob * 0, s, walkPose(ph, o.lean == null ? 6 : o.lean), Object.assign({ who: 'hero', t: a_tw(t), face: 'neutral' }, o));
}
function a_gateShot(ctx, t, L, D) {
  const k = L / D, camX = lerp(0, 230, E.io2(k));
  ctx.save(); ctx.translate(W / 2, H / 2); const z = lerp(1.0, 1.1, k); ctx.rotate(lerp(-.015, .01, k)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2 + 18);
  // portão no mundo x=720 ; câmera anda p/ a direita (paralaxe: fundo via camX)
  const gx = 800 - camX * 1.0; drawSchoolGate(ctx, gx, 560, 1, 1, t, { scene: true, camX: camX * .9, lock: 1, w: 420 });
  const lockWob = Math.max(0, 1 - Math.abs(t - 15.7) * 6) * Math.sin(t * 50) * .05;
  // menina passa andando, olha de lado para o cadeado ('rua me ensinou')
  const hx = lerp(150, 1010, E.io2(k)) - camX * 0 , face = (t > 15.3 && t < 16.0) ? 'sad' : 'neutral';
  a_walkHero(ctx, hx, 618, 46, t, { face, turn: (t > 15.3 && t < 16.0) ? -.5 : .2 });
  // pétala/papel voando (vida) — e poeira
  fxDust(ctx, t, { x: 0, y: 300, w: W, h: 320, n: 20, col: '255,220,170', a: .5, seed: 11, size: 1.4 });
  ctx.restore();
  fxVignette(ctx, .4, '26,10,30');
}
function a_chalkShot(ctx, t, L, D) {
  const k = L / D, p = E.io2(seg(L, 0.05, D * .92)), panX = lerp(20, -90, E.io2(k));
  ctx.save(); ctx.translate(W / 2, H / 2); const z = lerp(1.08, 1.16, k); ctx.rotate(lerp(.01, -.012, k)); ctx.scale(z, z); ctx.translate(-W / 2 + panX, -H / 2 - 14);
  const r = intChalkWall(ctx, t, { p, tone: 'day' });
  // menina anda em frente ao muro desenhando com o giz na mão
  const hx = lerp(240, 1000, E.io2(k)); const ph = a_tw(t) * TAU * 1.5;
  const pose = Object.assign(walkPose(ph, 4), { aR: [150 + Math.sin(ph) * 8, 168], hR: 'hold' });
  drawChar(ctx, hx, 606, 38, pose, { who: 'hero', t: a_tw(t), face: 'happy', turn: -.3 });
  // pozinho de giz saindo da ponta
  if (r.tip) { for (let i = 0; i < 6; i++) { const u = (t * 2.2 + i / 6) % 1; ctx.fillStyle = `rgba(255,255,255,${.7 * (1 - u)})`; ctx.beginPath(); ctx.arc(r.tip[0] + (i - 3) * 3, r.tip[1] + u * 26, 1.8, 0, TAU); ctx.fill(); } }
  ctx.restore();
  // poste em primeiro plano (paralaxe rápida)
  ctx.save(); ctx.filter = 'blur(3px)'; ctx.fillStyle = 'rgba(14,16,24,.88)'; const fx = lerp(1180, 40, E.io2(k) * 1.0); ctx.fillRect(fx - 26, -20, 52, 760); ctx.restore();
  fxVignette(ctx, .4, '20,14,26');
}

/* ============================================================
   6. SOBREVIVER É OBRIGAÇÃO — obstáculos e placa
   ============================================================ */
function a_obstacleRun(ctx, t, L, D) {
  const k = L / D, scroll = L * 520, hx = 470;
  ctx.save(); ctx.translate(W / 2, H / 2); const z = lerp(1.0, 1.08, k); ctx.rotate(lerp(.018, -.01, k)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2 + 6);
  drawQuebrada(ctx, 300 + scroll, 560, 1, { t, sky: true, kites: true, poles: false });
  drawBecoGround(ctx, 560, 1, scroll, { puddles: false });
  // obstáculos (coordenadas de mundo = scroll): poça, fio baixo, degrau
  const ob = [{ k: 'poca', x: 710 }, { k: 'fio', x: 1120 }, { k: 'deg', x: 1480 }];
  let jump = 0, duck = 0, jumpU = 0;
  for (const o of ob) { const sx = o.x - scroll; const d = hx - sx; // d>0: já passou
    if (o.k === 'poca') { /* poça */ ctx.save(); ctx.fillStyle = 'rgba(120,170,220,.75)'; ctx.beginPath(); ctx.ellipse(sx, 600, 90, 16, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, 600, 90 * (1 + .04 * Math.sin(t * 7)), 16, 0, 0, TAU); ctx.stroke(); ctx.restore(); if (Math.abs(d) < 150) { jumpU = (d + 150) / 300; jump = Math.sin(jumpU * Math.PI) * 120; } }
    if (o.k === 'fio') { ctx.save(); ctx.strokeStyle = '#1a1620'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 150, 380); ctx.quadraticCurveTo(sx, 470, sx + 150, 380); ctx.stroke(); ctx.fillStyle = '#d8d0c0'; ctx.fillRect(sx - 162, 360, 10, 250); ctx.fillRect(sx + 152, 360, 10, 250); ctx.restore(); if (Math.abs(d) < 130) duck = Math.cos((d / 130) * Math.PI / 2); }
    if (o.k === 'deg') { ctx.save(); ctx.fillStyle = '#9a9aa6'; ctx.fillRect(sx - 60, 556, 120, 50); ctx.fillStyle = '#c4c4d0'; ctx.fillRect(sx - 60, 556, 120, 8); ctx.strokeStyle = '#3a3a48'; ctx.lineWidth = 3; ctx.strokeRect(sx - 60, 556, 120, 50); ctx.restore(); if (Math.abs(d) < 130) { const u = (d + 130) / 260; jump = Math.sin(u * Math.PI) * 110 + 50 * (u > .5 ? 1 : 0) * 0; jumpU = u; } }
  }
  const ph = a_tw(t) * TAU * 2.4;
  let pose = runPose(ph, 18);
  if (jump > 4) pose = lerpPose(runPose(ph, 12), { lean: 14, head: -8, spread: .2, hs: .15, aR: [-80, -40], aL: [60, 90], lR: [60, -50], lL: [20, -100], hR: 'fist', hL: 'fist' }, .85);
  if (duck > .1) pose = lerpPose(runPose(ph, 18), { lean: 34, head: 14, spread: .2, hs: .15, aR: [-30, 60], aL: [30, 80], lR: [40, -75], lL: [-20, -50], hR: 'fist', hL: 'fist' }, duck * .9);
  const bounce = Math.abs(Math.sin(ph)) * 4;
  drawChar(ctx, hx, 606 - jump - bounce * 0, 44, pose, { who: 'hero', t: a_tw(t), face: 'determined', autoBlink: false, scar: 0 });
  // poeira e linhas de velocidade
  parallelLines(ctx, 0, t, { n: 14, a: .22, col: '#fff' });
  ctx.restore();
  fxVignette(ctx, .4, '26,10,30');
}
function a_signShot(ctx, t, L, D) {
  const k = L / D, tFlip = 19.0, f = seg(t, tFlip - .02, tFlip + .14), flipA = E.io2(f) * Math.PI, face = flipA > Math.PI / 2;
  ctx.save(); ctx.translate(W / 2, H / 2); const z = lerp(1.0, 1.22, E.io2(k)); ctx.rotate(lerp(-.015, .01, k)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  fxConcrete(ctx, 0, 0, W, 590, { tone: 'day', seed: 31, light: .7, side: 'right', vig: .3, shade: .2, clean: true });
  ctx.fillStyle = '#5c5a62'; ctx.fillRect(0, 590, W, H - 590); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, 590, W, 3);
  // placa pendurada por correntes de um fio
  const sx = 760, sy = 150 + Math.sin(t * 2.4) * 3;
  ctx.strokeStyle = '#1a1620'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(300, 78); ctx.quadraticCurveTo(760, 110, 1220, 70); ctx.stroke();
  ctx.save(); ctx.translate(sx, sy); const cs = Math.cos(flipA); ctx.rotate(Math.sin(t * 2.4) * .02);
  ctx.strokeStyle = '#3a3640'; ctx.lineWidth = 4; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sg * 140, -52); ctx.lineTo(sg * 150 * Math.abs(cs), 0); ctx.stroke(); }
  ctx.scale(Math.max(.04, Math.abs(cs)), 1);
  if (!face) { // frente: VITÓRIA com troféu
    rrect(ctx, -170, 0, 340, 200, 18); ctx.fillStyle = lg(ctx, 0, 0, 0, 200, [[0, '#fff0a8'], [1, '#f3c13a']]); ctx.fill(); ctx.strokeStyle = '#7a5410'; ctx.lineWidth = 6; ctx.stroke();
    // troféu
    ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#7a5410'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, 20); ctx.lineTo(34, 20); ctx.quadraticCurveTo(30, 70, 0, 78); ctx.quadraticCurveTo(-30, 70, -34, 20); ctx.fill(); ctx.stroke(); ctx.fillRect(-6, 78, 12, 20); ctx.fillRect(-26, 98, 52, 12); ctx.strokeRect(-26, 98, 52, 12);
    ctx.beginPath(); ctx.arc(-38, 36, 14, Math.PI * .5, Math.PI * 1.5); ctx.arc(38, 36, 14, -Math.PI * .5, Math.PI * .5); ctx.stroke();
    sparkle(ctx, 0, 44, 12, 0, '#fff8d8');
    ctx.font = `46px ${FONTS.fat || FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 7; ctx.strokeStyle = '#7a5410'; ctx.strokeText('VITÓRIA', 0, 150); ctx.fillStyle = '#fffbe8'; ctx.fillText('VITÓRIA', 0, 150);
  } else { ctx.scale(-1, 1); // verso: OBRIGAÇÃO, placa de aviso cinza com correntes
    rrect(ctx, -170, 0, 340, 200, 18); ctx.fillStyle = lg(ctx, 0, 0, 0, 200, [[0, '#59606e'], [1, '#2f3440']]); ctx.fill(); ctx.strokeStyle = '#14161c'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,214,90,.9)'; ctx.lineWidth = 4; ctx.setLineDash([16, 10]); rrect(ctx, -154, 14, 308, 172, 12); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ffc24d'; ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(26, 70); ctx.lineTo(-26, 70); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2f3440'; ctx.font = `30px ${FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 55);
    ctx.font = `44px ${FONTS.fat || FONTS.comic}`; ctx.lineWidth = 7; ctx.strokeStyle = '#14161c'; ctx.strokeText('OBRIGAÇÃO', 0, 134); ctx.fillStyle = '#ffd25a'; ctx.fillText('OBRIGAÇÃO', 0, 134);
  }
  ctx.restore();
  // menina olhando para a placa, determinada (estado final)
  const wk = E.out2(seg(L, 0, .55)), hx = lerp(-60, 330, wk);
  const ph = a_tw(t) * TAU * 1.5, pose = wk < .98 ? walkPose(ph, 8) : POSE.stand;
  drawChar(ctx, hx, 618, 50, lerpPose(pose, POSE.fist || pose, 0), { who: 'hero', t: a_tw(t), face: t > tFlip ? 'determined' : 'sad', turn: .5, rim: '255,224,170' });
  ctx.restore();
  if (f > 0 && f < 1) flash(ctx, .5 * Math.sin(f * Math.PI), '255,240,200');
  fxDust(ctx, t, { x: 0, y: 0, w: W, h: H, n: 16, col: '255,230,180', a: .5, seed: 12, size: 1.3 });
  fxVignette(ctx, .45, '24,12,28');
}

/* ============================================================ LISTA ============================================================ */
const SCENES_A = [
  { t0: 0, t1: 2.0, name: 'a_crack', fn: (c, t, L, D) => a_crackClose(c, t, L, D) },
  { t0: 2.0, t1: 4.25, name: 'a_road', fn: (c, t, L, D) => a_crackRoad(c, t, L, D) },
  { t0: 4.25, t1: 7.25, name: 'a_map', fn: (c, t, L, D) => a_openMap(c, t, L, D) },
  { t0: 7.25, t1: 9.5, name: 'a_sky', fn: (c, t, L, D) => a_tiltSky(c, t, L, D) },
  { t0: 9.5, t1: 11.3, name: 'a_dawn', fn: (c, t, L, D) => a_dawnWindow(c, t, L, D) },
  { t0: 11.3, t1: 12.1, name: 'a_clock', fn: (c, t, L, D) => a_roomClock(c, t, L, D) },
  { t0: 12.1, t1: 13.2, name: 'a_eyes', fn: (c, t, L, D) => a_eyesShot(c, t, L, D) },
  { t0: 13.2, t1: 13.56, name: 'a_weight', fn: (c, t, L, D) => a_weightShot(c, t, L, D) },
  { t0: 13.56, t1: 14.1, name: 'a_bills', fn: (c, t, L, D) => a_billsShot(c, t, L, D) },
  { t0: 14.1, t1: 15.04, name: 'a_fridge', fn: (c, t, L, D) => a_fridgeShot(c, t, L, D) },
  { t0: 15.04, t1: 16.3, name: 'a_gate', fn: (c, t, L, D) => a_gateShot(c, t, L, D) },
  { t0: 16.3, t1: 17.6, name: 'a_chalk', fn: (c, t, L, D) => a_chalkShot(c, t, L, D) },
  { t0: 17.6, t1: 18.4, name: 'a_obst', fn: (c, t, L, D) => a_obstacleRun(c, t, L, D) },
  { t0: 18.4, t1: 19.36, name: 'a_sign', fn: (c, t, L, D) => a_signShot(c, t, L, D) },
];
const IMPACTS_A = [
  { t: 4.25, d: .1, type: 'white' }, { t: 11.76, d: .05, type: 'white' }, { t: 13.38, d: .06, type: 'invert' },
  { t: 14.7, d: .04, type: 'flash' }, { t: 19.0, d: .05, type: 'invert' },
];
globalThis.SCENES_A = SCENES_A; globalThis.IMPACTS_A = IMPACTS_A;
