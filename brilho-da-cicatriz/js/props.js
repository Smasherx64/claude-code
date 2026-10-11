'use strict';
/* ============================================================
   props.js — adereços e "closes": olhos, boletos, geladeira, mão, bokeh…
   ============================================================ */

/* ---------- olhos em close (extreme close-up) — usa o mesmo olho de anime de chars.js (c2eye) ---------- */
/* cx,cy = ponto entre os olhos; S = escala (olhos a ±0,74·S). Opções: skin/skinTop/skinBot, magical(0..1), open, look[x,y], brow(-1..1),
   irisIn/irisMid/irisOut (compat) ou iris0/iris1, pupil, starIris, glowIris, refl, tear(0..1), hair (sobrancelha), lash(0-2), t, style('open'|'love'|'stars'|'sad'|'determined'|'scared'), blink(0..1), autoBlink */
function eyesCU(ctx, cx, cy, S, o = {}) {
  const t = o.t || 0, m = clamp(o.magical || 0), brow = o.brow || 0;
  const skin = o.skin || mix('#b8754d', '#fdeadf', m), skinSh = o.skinSh || mix('#94583a', '#f1c6bc', m), blush = mix('#d65a4c', '#ff8fae', m);
  const iris0 = o.iris0 || o.irisOut && mix(o.irisOut, '#3a1c10', .0) || mix('#3a1c10', '#5a3bd0', m), iris1 = o.iris1 || o.irisIn || mix('#cf8c48', '#ff9bdc', m);
  ctx.fillStyle = lg(ctx, 0, cy - S * 1.2, 0, cy + S * 1.2, [[0, o.skinTop || mix(skin, '#000000', .06)], [.5, skin], [1, o.skinBot || mix(skin, skinSh, .5)]]); ctx.fillRect(-100, cy - S * 1.6, W + 200, S * 3.2);
  // luz de recorte no topo e sombra do nariz
  ctx.fillStyle = lg(ctx, cx - S * .34, 0, cx + S * .34, 0, [[0, rgba(skinSh, 0)], [.5, rgba(skinSh, .38)], [1, rgba(skinSh, 0)]]); ctx.fillRect(cx - S * .34, cy - S * .6, S * .68, S * 1.6);
  for (const sg of [-1, 1]) { const ex = cx + sg * .74 * S; ctx.fillStyle = rg(ctx, ex, cy + S * .62, S * .05, S * .62, [[0, rgba(blush, .55)], [1, rgba(blush, 0)]]); ctx.fillRect(ex - S * .7, cy, S * 1.4, S * 1.4); }
  const u = S * 2.2, open = o.open == null ? 1 : o.open, bl = o.blink != null ? o.blink : (o.autoBlink === false ? 0 : 1 - c2blinkOp(t, o.seed || 1));
  const st = o.style || 'open', tilt = st === 'determined' ? .85 : st === 'sad' ? -.7 : brow * .2;
  for (const sg of [-1, 1]) {
    const ex = cx + sg * .74 * S;
    ctx.save(); ctx.translate(ex, cy); ctx.scale(u, u);
    const Q = c2Q(ctx, {}); Q.ol = .012; Q.pxu = u;
    const look = o.look || [0, 0];
    c2eye(ctx, Q, { sd: sg, rx: .265, ry: .335, op: open * (1 - bl), tilt, look, iris0, iris1, ink: o.ink || mix(mix('#1c0e10', '#4a1f5a', m), '#000', .2), lash: o.lash == null ? 2 : o.lash, style: st, t, big: true, hl: 3, wet: o.tear || st === 'sad', glow: o.glowIris, star: o.starIris, tear: o.tear || 0, skinSh, pupil: o.pupil, white: o.white });
    if (o.refl) { ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 3; k++) ctx.fillRect(-.12, -.2 + k * .06, .2, .02); }
    ctx.restore();
    // sobrancelha
    const ib = ex - sg * .3 * S, ob = ex + sg * .5 * S, by = cy - S * (.7 + open * .06 + brow * .07);
    ctx.strokeStyle = o.hair || mix('#1c110c', '#d070b0', m); ctx.lineCap = 'round'; ctx.lineWidth = S * .07;
    ctx.beginPath(); ctx.moveTo(ib, by + (brow < 0 ? -brow * .06 * S : brow * -.05 * S)); ctx.quadraticCurveTo(ex, by - .1 * S - (brow > 0 ? .02 * S : 0), ob, by + .05 * S + (brow < 0 ? brow * .05 * S : 0)); ctx.stroke();
  }
  // narizinho
  ctx.strokeStyle = rgba(skinSh, .95); ctx.lineWidth = S * .026; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - S * .08, cy + S * .62); ctx.quadraticCurveTo(cx, cy + S * .7, cx + S * .08, cy + S * .62); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(cx - S * .02, cy + S * .52, S * .035, S * .025, 0, 0, TAU); ctx.fill();
}
/* franja cacheada (bolinhas com contorno colorido e brilho) por cima do close */
function fringe(ctx, cx, y0, S, t = 0, col = '#2d1b13') {
  const pts = []; for (let i = -9; i <= 9; i++) pts.push([cx + i * S * .27, y0 + (Math.abs(i) % 2 ? .14 : .02) * S + Math.sin(t * 2 + i) * 1.2 + Math.abs(i) * .012 * S, S * (.3 + (Math.abs(i * 7) % 3) * .03)]);
  const ink = mix(col, '#14081a', .55), sh = mix(col, '#0a0414', .45), hi = mix(col, '#ffffff', .42);
  ctx.strokeStyle = ink; ctx.lineWidth = S * .05; pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, TAU); ctx.stroke(); });
  ctx.fillStyle = col; ctx.fillRect(cx - S * 3, y0 - S * 1.6, S * 6, S * 1.6); pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, TAU); ctx.fill(); });
  pts.forEach((p, i) => { ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, TAU); ctx.clip(); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(p[0] + p[2] * .3, p[1] + p[2] * .35, p[2] * .95, 0, TAU); ctx.rect(p[0] - p[2] * 2, p[1] - p[2] * 2, p[2] * 4, p[2] * 4); ctx.fill('evenodd'); ctx.restore();
    ctx.strokeStyle = rgba(hi, .6); ctx.lineWidth = S * .025; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(p[0], p[1], p[2] * .66, 3.5, 4.5); ctx.stroke();
    ctx.strokeStyle = rgba(ink, .8); ctx.lineWidth = S * .018; ctx.beginPath(); ctx.arc(p[0] + p[2] * .1, p[1] + p[2] * .15, p[2] * .22, i, i + 4.2); ctx.stroke(); });
  ctx.fillStyle = lg(ctx, 0, y0 - S * .1, 0, y0 + S * .4, [[0, 'rgba(60,30,20,.35)'], [1, 'rgba(60,30,20,0)']]);
}

/* ---------- persianas: faixas diagonais de luz ---------- */
function blinds(ctx, t, a, o = {}) {
  const ang = o.ang == null ? -.45 : o.ang, wd = o.w || 40, gap = o.gap || 84, col = o.col || '255,224,150', sp = o.sp == null ? 24 : o.sp;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ang); ctx.globalCompositeOperation = o.mode || 'lighter';
  for (let y = -1400 + ((t * sp) % gap); y < 1400; y += gap) { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(-1800, y, 3600, wd); ctx.fillStyle = `rgba(${col},${a * .35})`; ctx.fillRect(-1800, y - 6, 3600, 6); ctx.fillRect(-1800, y + wd, 3600, 6); }
  ctx.restore();
}
/* bokeh e poeira de luz */
function bokeh(ctx, t, seed, n, cols, o = {}) {
  const r = rng(seed), x0 = o.x0 || 0, y0 = o.y0 || 0, w = o.w || W, h = o.h || H, a = o.a == null ? .5 : o.a;
  ctx.save(); ctx.globalCompositeOperation = o.mode || 'lighter';
  for (let i = 0; i < n; i++) {
    const rr = (o.rMin || 14) + r() * (o.rMax || 60), sp = (o.sp || 10) * (.3 + r()), x = x0 + ((r() * w + t * sp * (o.dx == null ? 1 : o.dx)) % w + w) % w, y = y0 + ((r() * h - t * sp * (o.dy || 0)) % h + h) % h;
    const col = cols[Math.floor(r() * cols.length)], pulse = .6 + .4 * Math.sin(t * (1 + r() * 2) + i);
    ctx.fillStyle = rg(ctx, x, y, rr * .55, rr, [[0, rgba(col, a * .5 * pulse)], [.85, rgba(col, a * pulse)], [1, rgba(col, 0)]]); ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function motes(ctx, t, seed, n, x0, y0, w, h, col = '255,226,150', o = {}) {
  const r = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sp = (o.sp || 18) * (.4 + r()), x = x0 + ((r() * w + Math.sin(t * .8 + i) * 24) % w + w) % w, y = y0 + (((r() * h - t * sp) % h) + h) % h, s = (o.s || 2.6) * (.4 + r()), tw = .5 + .5 * Math.sin(t * 3 + i * 1.7);
    ctx.fillStyle = `rgba(${col},${(.35 + .65 * tw) * (o.a == null ? 1 : o.a)})`; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(${col},${.12 * tw})`; ctx.beginPath(); ctx.arc(x, y, s * 4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/* ---------- boleto ---------- */
function billSheet(ctx, x, y, rot, s, label, amt, col = '#e03a3a', stamp = true) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-86, -104, 190, 240);
  ctx.fillStyle = '#fbf8ee'; ctx.fillRect(-95, -120, 190, 240); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 3; ctx.strokeRect(-95, -120, 190, 240);
  ctx.fillStyle = col; ctx.fillRect(-95, -120, 190, 54); ctx.strokeRect(-95, -120, 190, 54);
  ctx.font = `38px ${FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(label, 0, -92);
  ctx.fillStyle = '#c9c5b8'; for (let i = 0; i < 4; i++) ctx.fillRect(-72, -48 + i * 18, 144 - (i % 2) * 40, 7);
  ctx.fillStyle = '#14122a'; ctx.font = `26px ${FONTS.comic}`; ctx.fillText(amt, 0, 52);
  for (let i = 0; i < 22; i++) ctx.fillRect(-72 + i * 6.6, 78, (i % 3) + 2, 28);
  if (stamp) { ctx.rotate(-.35); ctx.strokeStyle = '#e03a3a'; ctx.fillStyle = '#e03a3a'; ctx.lineWidth = 4; ctx.strokeRect(-68, 4, 136, 30); ctx.font = `22px ${FONTS.comic}`; ctx.fillText('VENCE HOJE', 0, 20); }
  ctx.restore();
}
/* peso de 1000 kg (clássico de desenho animado) */
function weight1000(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.strokeStyle = '#14122a'; ctx.lineWidth = 7; ctx.fillStyle = '#4a4f5a';
  ctx.beginPath(); ctx.arc(0, -118, 34, Math.PI, 0); ctx.arc(0, -118, 18, 0, Math.PI, true); ctx.closePath(); ctx.fill(); ctx.stroke();
  poly(ctx, [[-70, -96], [70, -96], [118, 70], [-118, 70]]); ctx.fillStyle = lg(ctx, -118, 0, 118, 0, [[0, '#6b717e'], [.5, '#4a4f5a'], [1, '#2f333c']]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; poly(ctx, [[-60, -86], [-34, -86], [-82, 60], [-108, 60]]); ctx.fill();
  ctx.font = `52px ${FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = '#14122a'; ctx.strokeText('1000', 0, -14); ctx.fillStyle = '#ffd23f'; ctx.fillText('1000', 0, -14);
  ctx.font = `44px ${FONTS.comic}`; ctx.strokeText('KG', 0, 32); ctx.fillStyle = '#fff'; ctx.fillText('KG', 0, 32);
  ctx.restore();
}
/* mão grande de close (aponta para cima; origem no pulso). curl 0=aberta … 1=punho. o: col, ol (contorno), sh (sombra), cuff */
function bigHand(ctx, x, y, s, rot, curl, o = {}) {
  const col = o.col || '#b8754d', ol = o.ol || mix(col, '#2a1020', .62), sh = o.sh || mix(col, '#5a2418', .3), olw = o.olw || 6, hi = mix(col, '#ffffff', .3);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fing = [[-33, 62, -4, 25], [-11, 74, 0, 25], [11, 68, 3, 24], [33, 54, 7, 21]];
  const segf = (bx, by, L, base, c) => {
    const a1 = rad(base + c * 62), a2 = rad(base + c * 62 + c * 85), p1 = [bx + Math.sin(a1) * L * .55, by - Math.cos(a1) * L * .55], p2 = [p1[0] + Math.sin(a2) * L * .45, p1[1] - Math.cos(a2) * L * .45];
    return [[bx, by], p1, p2];
  };
  const fs = fing.map(f => segf(f[0], -92, f[1], f[2], curl));
  const ta = rad(-55 + curl * 38), tp1 = [-42 + Math.sin(ta) * 40, -30 - Math.cos(ta) * 40], tp2 = [tp1[0] + Math.sin(ta - .3 + curl * .8) * 34, tp1[1] - Math.cos(ta - .3 + curl * .8) * 34];
  const strokeAll = (w, c) => { ctx.strokeStyle = c; fs.forEach((f, i) => { ctx.lineWidth = w + fing[i][3] - 25; ctx.beginPath(); ctx.moveTo(f[0][0], f[0][1]); ctx.lineTo(f[1][0], f[1][1]); ctx.lineTo(f[2][0], f[2][1]); ctx.stroke(); }); ctx.lineWidth = w + 2; ctx.beginPath(); ctx.moveTo(-40, -28); ctx.lineTo(tp1[0], tp1[1]); ctx.lineTo(tp2[0], tp2[1]); ctx.stroke(); };
  strokeAll(25 + olw * 2, ol); rrect(ctx, -50, -108, 100, 118, 30); ctx.fillStyle = ol; ctx.fill(); ctx.lineWidth = olw * 2; ctx.strokeStyle = ol; ctx.stroke();
  strokeAll(25, col); rrect(ctx, -47, -105, 94, 112, 28); ctx.fillStyle = col; ctx.fill();
  // sombra (lado direito/baixo) das falanges e da palma
  ctx.save(); rrect(ctx, -47, -105, 94, 112, 28); ctx.clip(); ctx.fillStyle = sh; ctx.fillRect(18, -110, 40, 130); ctx.fillStyle = rgba(sh, .6); ctx.fillRect(-50, -12, 100, 20); ctx.restore();
  ctx.fillStyle = mix(col, '#ffd8d0', .55); fs.forEach(f => { ctx.save(); ctx.translate(f[2][0], f[2][1]); ctx.beginPath(); ctx.ellipse(0, 0, 8, 6, 0, 0, TAU); ctx.fill(); ctx.restore(); });
  ctx.strokeStyle = rgba(ol, .5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, -52); ctx.quadraticCurveTo(0, -40, 36, -58); ctx.stroke();
  ctx.fillStyle = rgba(hi, .35); ctx.beginPath(); ctx.ellipse(-26, -78, 8, 16, .1, 0, TAU); ctx.fill();
  if (o.cuff) { ctx.fillStyle = o.cuff; ctx.strokeStyle = mix(o.cuff, '#1a0c24', .55); ctx.lineWidth = olw; ctx.fillRect(-56, 0, 112, 60); ctx.strokeRect(-56, 0, 112, 60); }
  ctx.restore();
}

/* ---------- geladeira ---------- */
function lemon(ctx, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4; ctx.fillStyle = '#ffe14a';
  ctx.beginPath(); ctx.moveTo(-r * 1.2, 0); ctx.quadraticCurveTo(-r * .9, -r * .95, 0, -r); ctx.quadraticCurveTo(r * .9, -r * .95, r * 1.2, 0); ctx.quadraticCurveTo(r * .9, r * .95, 0, r); ctx.quadraticCurveTo(-r * .9, r * .95, -r * 1.2, 0); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-r * .3, -r * .4, r * .3, r * .14, -.4, 0, TAU); ctx.fill(); ctx.restore();
}
function ketchup(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4;
  rrect(ctx, -20, -70, 40, 70, 12); ctx.fillStyle = '#e03a3a'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-20, -48, 40, 24); ctx.strokeRect(-20, -48, 40, 24);
  ctx.fillStyle = '#f4f1e8'; ctx.fillRect(-9, -86, 18, 16); ctx.strokeRect(-9, -86, 18, 16); ctx.restore();
}
function egg(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4; ctx.fillStyle = '#fff3dd'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 24, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
function batteryBadge(ctx, x, y, s, pct, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.08 + Math.sin(t * 7) * .02); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.3)'; rrect(ctx, -92 + 8, -48 + 10, 190, 96, 20); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 7; rrect(ctx, -92, -48, 190, 96, 20); ctx.fill(); ctx.stroke(); rrect(ctx, 98, -16, 18, 32, 6); ctx.fillStyle = '#14122a'; ctx.fill();
  ctx.fillStyle = pct > .4 ? '#6dff9c' : '#ff3b4e'; rrect(ctx, -80, -36, 166 * pct, 72, 12); ctx.fill();
  ctx.font = `50px ${FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = '#14122a'; ctx.strokeText(Math.round(pct * 100) + '%', -5, 3); ctx.fillStyle = '#fff'; ctx.fillText(Math.round(pct * 100) + '%', -5, 3);
  ctx.restore();
}
/* estrela de impacto/explosão de quadrinho */
function burst(ctx, x, y, r, n, rot, fill, stroke = '#14122a', lw = 6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? r * .62 : r * (1 + (i % 4 === 0 ? .12 : 0)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore();
}
function emoji(ctx, ch, x, y, size, rot = 0, a = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.font = `${size}px "Noto Color Emoji"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 0); ctx.restore(); }
function starRing(ctx, x, y, rx, ry, t, n = 5, size = 16) { for (let i = 0; i < n; i++) { const a = t * 5 + i / n * TAU; sparkle(ctx, x + Math.cos(a) * rx, y + Math.sin(a) * ry, size, a, '#ffd23f'); } }
