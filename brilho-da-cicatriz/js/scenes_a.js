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

/* ---- lista provisória (será substituída) ---- */
const SCENES_A = [
  { t0: 0, t1: 2.0, name: 'a_crack', fn: (c, t, L, D) => a_crackClose(c, t, L, D) },
  { t0: 2.0, t1: 4.25, name: 'a_road', fn: (c, t, L, D) => a_crackRoad(c, t, L, D) },
  { t0: 4.25, t1: 7.25, name: 'a_map', fn: (c, t, L, D) => a_openMap(c, t, L, D) },
  { t0: 7.25, t1: 9.5, name: 'a_sky', fn: (c, t, L, D) => a_tiltSky(c, t, L, D) },
  { t0: 9.5, t1: 11.3, name: 'a_dawn', fn: (c, t, L, D) => a_dawnWindow(c, t, L, D) },
];
globalThis.SCENES_A = SCENES_A;
