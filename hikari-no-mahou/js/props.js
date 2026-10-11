'use strict';
/* ============================================================
   props.js — adereços e "closes": olhos, boletos, geladeira, mão, bokeh…
   ============================================================ */

/* ---------- olhos em close (extreme close-up) ---------- */
function oneEye(ctx, ex, ey, S, side, o) {
  const open = o.open, a = .33 * S, hMax = .3 * S, inner = ex - side * a, outer = ex + side * a, oy = ey - .035 * S;
  const uy = ey + lerp(.12 * S, -hMax * 1.55, open), ly = ey + lerp(.12 * S, hMax * .8, open);
  const path = () => { ctx.beginPath(); ctx.moveTo(inner, ey); ctx.bezierCurveTo(inner + (outer - inner) * .18, uy, inner + (outer - inner) * .82, uy - .02 * S, outer, oy); ctx.bezierCurveTo(inner + (outer - inner) * .8, ly, inner + (outer - inner) * .2, ly, inner, ey); ctx.closePath(); };
  if (open > .04) {
    ctx.save(); path(); ctx.clip();
    ctx.fillStyle = lg(ctx, 0, ey - hMax, 0, ey + hMax, [[0, '#d9d4d0'], [.35, '#fffdfb'], [1, '#f1e6e0']]); ctx.fillRect(ex - a * 1.2, ey - hMax * 2, a * 2.4, hMax * 4);
    const lk = o.look || [0, 0], ix = ex + lk[0] * .075 * S - side * .015 * S, iy = ey + lk[1] * .06 * S + .02 * S, ir = (o.iris || .2) * S, pu = o.pupil == null ? .42 : o.pupil;
    ctx.fillStyle = rg(ctx, ix, iy + ir * .25, ir * .1, ir, [[0, o.irisIn || '#ffcf6b'], [.45, o.irisMid || '#c47a2c'], [1, o.irisOut || '#4a2410']]);
    ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,12,8,.8)'; ctx.lineWidth = ir * .13; ctx.stroke();
    ctx.fillStyle = '#12080a'; ctx.beginPath(); ctx.arc(ix, iy, ir * pu, 0, TAU); ctx.fill();
    if (o.starIris) { // estrelas refletidas na íris (final)
      ctx.globalCompositeOperation = 'lighter'; const r2 = rng(5);
      for (let i = 0; i < 14; i++) { const aa = r2() * TAU, dd = r2() * ir * .8; sparkle(ctx, ix + Math.cos(aa) * dd, iy + Math.sin(aa) * dd, ir * (.06 + r2() * .1) * (.6 + .4 * Math.sin(o.t * 6 + i)), 0, 'rgba(255,240,200,.95)'); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (o.glowIris) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, ix, iy, 0, ir, [[0, `rgba(255,210,110,${o.glowIris})`], [1, 'rgba(255,210,110,0)']]); ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.ellipse(ix - ir * .38, iy - ir * .4, ir * .26, ir * .2, -.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(ix + ir * .42, iy + ir * .38, ir * .1, 0, TAU); ctx.fill();
    if (o.refl) { ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 3; k++) ctx.fillRect(ix - ir * .62, iy - ir * .7 + k * ir * .17, ir * .55, ir * .07); }
    ctx.fillStyle = lg(ctx, 0, ey - hMax * 1.2, 0, ey, [[0, 'rgba(40,10,10,.5)'], [1, 'rgba(40,10,10,0)']]); ctx.fillRect(ex - a * 1.2, ey - hMax * 1.6, a * 2.4, hMax * 1.6);
    ctx.restore();
  }
  // pálpebra superior (traço grosso) + cílios
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2a1824';
  ctx.lineWidth = S * (open > .04 ? .034 : .026); ctx.beginPath(); ctx.moveTo(inner, ey); ctx.bezierCurveTo(inner + (outer - inner) * .18, uy, inner + (outer - inner) * .82, uy - .02 * S, outer, oy); ctx.stroke();
  ctx.lineWidth = S * .05; ctx.beginPath(); ctx.moveTo(outer - side * a * .1, oy); ctx.lineTo(outer + side * .12 * S, oy - .06 * S); ctx.stroke();
  ctx.lineWidth = S * .018; for (let k = 0; k < 3; k++) { const u = .35 + k * .22, bx = lerp(inner, outer, u), by = oy + (uy - oy) * .5 * (1 - Math.abs(u - .5) * 1.2) + ey * .0; ctx.beginPath(); ctx.moveTo(bx, by + (ey - by) * .0); ctx.lineTo(bx + side * .04 * S, by - .06 * S); ctx.stroke(); }
  if (open > .04) { ctx.strokeStyle = 'rgba(120,70,60,.55)'; ctx.lineWidth = S * .012; ctx.beginPath(); ctx.moveTo(inner, ey); ctx.bezierCurveTo(inner + (outer - inner) * .2, ly, inner + (outer - inner) * .8, ly, outer, oy); ctx.stroke(); }
  // dobra da pálpebra
  ctx.strokeStyle = 'rgba(150,80,60,.5)'; ctx.lineWidth = S * .014; ctx.beginPath(); ctx.moveTo(inner + (outer - inner) * .1, uy - hMax * .55 - (1 - open) * .02 * S); ctx.quadraticCurveTo(ex, uy - hMax * 1.1 - (1 - open) * .03 * S, outer, oy - hMax * .55); ctx.stroke();
}
function eyesCU(ctx, cx, cy, S, o = {}) {
  const brow = o.brow || 0, t = o.t || 0;
  ctx.fillStyle = lg(ctx, 0, cy - S * 1.2, 0, cy + S * 1.2, [[0, o.skinTop || '#f1bd94'], [.5, o.skin || '#f7d0ab'], [1, o.skinBot || '#eebb93']]); ctx.fillRect(-100, cy - S * 1.6, W + 200, S * 3.2);
  for (const sg of [-1, 1]) {
    const ex = cx + sg * .74 * S; ctx.fillStyle = rg(ctx, ex, cy, S * .1, S * .6, [[0, 'rgba(190,110,90,.28)'], [1, 'rgba(190,110,90,0)']]); ctx.fillRect(ex - S * .7, cy - S * .7, S * 1.4, S * 1.4);
  }
  ctx.fillStyle = lg(ctx, cx - S * .3, 0, cx + S * .3, 0, [[0, 'rgba(190,120,95,0)'], [.5, 'rgba(190,120,95,.22)'], [1, 'rgba(190,120,95,0)']]); ctx.fillRect(cx - S * .3, cy - S * .5, S * .6, S * 1.4);
  for (const sg of [-1, 1]) {
    const ex = cx + sg * .74 * S;
    oneEye(ctx, ex, cy, S, sg, { ...o, open: o.open == null ? 1 : o.open, look: o.look });
    // sobrancelha
    const by = cy - S * (.55 + (o.open == null ? 1 : o.open) * .06 + brow * .07), ib = ex - sg * .3 * S, ob = ex + sg * .42 * S;
    ctx.strokeStyle = o.hair || '#17142b'; ctx.lineCap = 'round'; ctx.lineWidth = S * .08;
    ctx.beginPath(); ctx.moveTo(ib, by + (brow < 0 ? -brow * -.09 * S : 0) + (brow < 0 ? .09 * S * -brow : 0) * 0); ctx.quadraticCurveTo(ex, by - .08 * S - (brow > 0 ? .03 * S : 0), ob, by + .04 * S + (brow < 0 ? -.07 * S * -brow * 0 : 0)); ctx.stroke();
    ctx.lineWidth = S * .045; ctx.beginPath(); ctx.moveTo(ib, by); ctx.lineTo(ob, by + .05 * S); ctx.stroke();
  }
  // nariz
  ctx.strokeStyle = 'rgba(170,100,80,.55)'; ctx.lineWidth = S * .02; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - S * .07, cy + S * .55); ctx.quadraticCurveTo(cx, cy + S * .62, cx + S * .07, cy + S * .55); ctx.stroke();
}
/* franja espetada (cabelo) por cima do close */
function fringe(ctx, cx, y0, S, t = 0, col = '#16142a') {
  ctx.fillStyle = col; ctx.strokeStyle = '#0d0b1c'; ctx.lineWidth = S * .02; ctx.lineJoin = 'round';
  const sp = [[-2.4, 0], [-1.9, .62], [-1.55, .1], [-1.1, .86], [-.65, .14], [-.2, .98], [.25, .1], [.7, .78], [1.1, .08], [1.55, .66], [1.9, .12], [2.4, .5], [2.4, -1], [-2.4, -1]];
  poly(ctx, sp.map(p => [cx + p[0] * S * .62, y0 + p[1] * S * .5 + Math.sin(t * 2 + p[0]) * 1.5])); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(100,120,200,.5)'; ctx.lineWidth = S * .03; ctx.beginPath(); ctx.moveTo(cx - S * .8, y0 - S * .1); ctx.quadraticCurveTo(cx, y0 - S * .2, cx + S * .6, y0 - S * .05); ctx.stroke();
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
/* mão grande (silhueta de quadrinho). Aponta para cima; origem no pulso. curl 0=aberta … 1=punho */
function bigHand(ctx, x, y, s, rot, curl, o = {}) {
  const col = o.col || '#f7d0ab', ol = o.ol || '#15122a', olw = o.olw || 6;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fing = [[-33, 62, -4], [-11, 74, 0], [11, 68, 3], [33, 54, 7]];
  const segf = (bx, by, L, base, c) => {
    const a1 = rad(base + c * 62), a2 = rad(base + c * 62 + c * 85), p1 = [bx + Math.sin(a1) * L * .55, by - Math.cos(a1) * L * .55], p2 = [p1[0] + Math.sin(a2) * L * .45, p1[1] - Math.cos(a2) * L * .45];
    ctx.strokeStyle = ol; ctx.lineWidth = 25 + olw; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
    return [[bx, by], p1, p2];
  };
  const fs = fing.map(f => segf(f[0], -92, f[1], f[2], curl));
  // polegar
  const ta = rad(-55 + curl * 38), tp1 = [-42 + Math.sin(ta) * 40, -30 - Math.cos(ta) * 40], tp2 = [tp1[0] + Math.sin(ta - .3 + curl * .8) * 34, tp1[1] - Math.cos(ta - .3 + curl * .8) * 34];
  ctx.strokeStyle = ol; ctx.lineWidth = 27 + olw; ctx.beginPath(); ctx.moveTo(-40, -28); ctx.lineTo(tp1[0], tp1[1]); ctx.lineTo(tp2[0], tp2[1]); ctx.stroke();
  rrect(ctx, -50, -108, 100, 118, 30); ctx.fillStyle = ol; ctx.fill(); ctx.lineWidth = olw * 2; ctx.stroke();
  fs.forEach(f => { ctx.strokeStyle = col; ctx.lineWidth = 25; ctx.beginPath(); ctx.moveTo(f[0][0], f[0][1]); ctx.lineTo(f[1][0], f[1][1]); ctx.lineTo(f[2][0], f[2][1]); ctx.stroke(); });
  ctx.strokeStyle = col; ctx.lineWidth = 27; ctx.beginPath(); ctx.moveTo(-40, -28); ctx.lineTo(tp1[0], tp1[1]); ctx.lineTo(tp2[0], tp2[1]); ctx.stroke();
  rrect(ctx, -47, -105, 94, 112, 28); ctx.fillStyle = col; ctx.fill();
  if (o.cuff) { ctx.fillStyle = o.cuff; ctx.strokeStyle = ol; ctx.lineWidth = olw; ctx.fillRect(-56, 0, 112, 60); ctx.strokeRect(-56, 0, 112, 60); }
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
