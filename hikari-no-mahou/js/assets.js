'use strict';
/* ============================================================
   assets.js — cenários pré-renderizados: nebulosa pintada, cidade, esfera kintsugi, estrelas, grua de origami
   ============================================================ */

/* ---------- Nebulosa pintada à mão (pinceladas seguindo um campo de fluxo) ---------- */
let NEB = null;
function makeNebula() {
  const w = 2048, h = 1152, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), r = rng(2024);
  g.fillStyle = lg(g, 0, 0, w, h, [[0, '#06143d'], [.5, '#0d3a8a'], [1, '#081a4a']]); g.fillRect(0, 0, w, h);
  const cols = ['#1d6fe0', '#35c3ee', '#e0529f', '#f7a8cf', '#a58cf5', '#fff1c9', '#0b2a6b', '#ff8fbd', '#2a49c9'];
  for (let i = 0; i < 80; i++) {
    const x = r() * w, y = r() * h, rr = 160 + r() * 380, col = cols[Math.floor(r() * cols.length)];
    g.globalCompositeOperation = i % 4 === 0 ? 'screen' : 'source-over';
    g.fillStyle = rg(g, x, y, 0, rr, [[0, rgba(col, .34)], [1, rgba(col, 0)]]); g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  g.globalCompositeOperation = 'source-over'; g.lineCap = 'round';
  for (let i = 0; i < 4200; i++) {
    const x = r() * w, y = r() * h, n = noise2(x / 420, y / 420, 5), ang = noise2(x / 300, y / 300, 9) * TAU * 1.6;
    const ci = Math.floor(((n * 1.35 + noise2(x / 900, y / 900, 3) * .9) % 1) * cols.length), col = cols[ci];
    const len = 26 + r() * 90, wid = 5 + r() * 20;
    g.strokeStyle = rgba(col, .05 + r() * .13); g.lineWidth = wid;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(ang) * len * .6 + r() * 10, y + Math.sin(ang) * len * .6, x + Math.cos(ang + .4) * len, y + Math.sin(ang + .4) * len); g.stroke();
  }
  // núcleo quente (centro-direita) como na capa
  g.globalCompositeOperation = 'screen';
  g.fillStyle = rg(g, w * .58, h * .46, 0, 520, [[0, 'rgba(255,240,205,.9)'], [.3, 'rgba(255,170,205,.45)'], [1, 'rgba(255,170,205,0)']]); g.fillRect(0, 0, w, h);
  g.fillStyle = rg(g, w * .2, h * .8, 0, 480, [[0, 'rgba(60,200,240,.55)'], [1, 'rgba(60,200,240,0)']]); g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  // textura de tinta: pinceladas claras finas
  for (let i = 0; i < 900; i++) {
    const x = r() * w, y = r() * h, ang = noise2(x / 200, y / 200, 4) * TAU * 2, len = 14 + r() * 40;
    g.strokeStyle = `rgba(255,255,255,${.02 + r() * .05})`; g.lineWidth = 1 + r() * 3;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
  }
  // estrelas
  for (let i = 0; i < 520; i++) {
    const x = r() * w, y = r() * h, s = r() * r() * 2.4 + .4;
    g.fillStyle = `rgba(255,255,255,${.4 + r() * .6})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  for (let i = 0; i < 46; i++) sparkle(g, r() * w, r() * h, 5 + r() * 12, 0, `rgba(255,250,235,${.6 + r() * .4})`);
  // circuitos dourados (da capa)
  g.strokeStyle = 'rgba(255,220,150,.75)'; g.fillStyle = 'rgba(255,220,150,.9)'; g.lineWidth = 2;
  for (let k = 0; k < 26; k++) {
    let x = w * (.35 + r() * .6), y = r() * h; g.beginPath(); g.moveTo(x, y);
    const steps = 3 + Math.floor(r() * 4);
    for (let s = 0; s < steps; s++) { x += (r() < .5 ? -1 : 1) * (40 + r() * 120); g.lineTo(x, y); y += (r() < .5 ? -1 : 1) * (30 + r() * 100); g.lineTo(x, y); }
    g.stroke(); g.beginPath(); g.arc(x, y, 5, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill();
  }
  NEB = c;
}
/* desenha a nebulosa cobrindo (x,y,w,h) com deslocamento/zoom suave */
function drawNebula(ctx, x, y, w, h, o = {}) {
  const z = o.z || 1, ox = o.ox || 0, oy = o.oy || 0, hu = o.hue || 0;
  const sw = NEB.width / z, sh = sw * h / w;
  const sx = clamp((NEB.width - sw) / 2 + ox, 0, NEB.width - sw), sy = clamp((NEB.height - sh) / 2 + oy, 0, NEB.height - sh);
  ctx.save(); if (hu) ctx.filter = `hue-rotate(${hu}deg)`;
  ctx.drawImage(NEB, sx, sy, sw, sh, x, y, w, h); ctx.restore();
}
/* fundo "cósmico" simples (céu) com estrelas piscando */
function drawStars(ctx, t, seed, n, x0, y0, w, h, a = 1) {
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w, y = y0 + r() * h, s = .6 + r() * r() * 2.6, ph = r() * TAU, sp = 1 + r() * 3;
    const tw = .5 + .5 * Math.sin(t * sp + ph);
    ctx.fillStyle = `rgba(255,248,230,${(.25 + .75 * tw) * a})`; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    if (s > 2.2) sparkle(ctx, x, y, s * 4 * tw, 0, `rgba(255,250,235,${.8 * a})`);
  }
  ctx.restore();
}

/* ---------- Cidade de "panelkas" (blocos soviéticos) em camadas ---------- */
const CITY = (() => {
  const r = rng(7), defs = [
    { par: .22, hMin: 250, hMax: 400, wMin: 130, wMax: 220, gap: 30, fog: .62 },
    { par: .5, hMin: 330, hMax: 540, wMin: 200, wMax: 320, gap: 40, fog: .32 },
    { par: 1, hMin: 520, hMax: 880, wMin: 280, wMax: 430, gap: 60, fog: 0 },
  ];
  return defs.map((d, li) => {
    const blocks = []; let x = -3200;
    while (x < 3200) {
      const w = d.wMin + r() * (d.wMax - d.wMin), h = d.hMin + r() * (d.hMax - d.hMin);
      blocks.push({ x, w, h, cols: Math.max(3, Math.round(w / (li === 2 ? 46 : 38))), rowH: li === 2 ? 52 : 44, roof: Math.floor(r() * 3), seed: Math.floor(r() * 9999) });
      x += w + d.gap * (.4 + r());
    }
    return { ...d, blocks };
  });
})();

/* paleta que interpola entre o mundo cinza (c=0) e o mundo colorido (c=1) */
function pal(c, night = 0) {
  const n = night;
  return {
    skyTop: mix(mix('#98a0aa', '#0a1f5e', c), '#04091f', n * .6),
    skyBot: mix(mix('#e4e6e8', '#f6a7cb', c), '#2a3b8a', n * .5),
    far: mix(mix('#9a9fa7', '#3b4fb0', c), '#1a2760', n * .6),
    mid: mix(mix('#6b7079', '#26378a', c), '#111b4a', n * .6),
    near: mix(mix('#464a52', '#16205c', c), '#0b1236', n * .6),
    nearR: mix(mix('#34383f', '#10194a', c), '#080d29', n * .6),
    seam: mix(mix('#2c2f35', '#0a1030', c), '#050820', n),
    win: mix(mix('#262a30', '#0c1440', c), '#070b24', n),
    winLit: mix(mix('#cfc9ad', '#ffd87a', c), '#ffe29a', n),
    fog: mix(mix('#c7cbd0', '#d8a6e6', c), '#4a5fc0', n * .6),
  };
}

/* um bloco, com chão em y=0, crescendo para cima. lay = camada (0..2) */
function drawBlock(ctx, b, li, P, o = {}) {
  const { x, w, h } = b, base = li === 0 ? P.far : li === 1 ? P.mid : P.near;
  const lit = o.lit == null ? .05 : o.lit, c = o.c || 0, t = o.t || 0;
  ctx.fillStyle = lg(ctx, x, 0, x + w, 0, [[0, base], [1, li === 2 ? P.nearR : base]]); ctx.fillRect(x, -h, w, h);
  // juntas de painel
  ctx.strokeStyle = P.seam; ctx.globalAlpha = li === 0 ? .25 : .5; ctx.lineWidth = li === 2 ? 1.6 : 1;
  for (let yy = 0; yy > -h; yy -= b.rowH * 4) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  for (let xx = x; xx <= x + w + 1; xx += w / Math.max(2, Math.floor(b.cols / 3))) { ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, -h); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // janelas
  const cw = w / b.cols, rows = Math.floor(h / b.rowH);
  for (let rr = 1; rr < rows; rr++) {
    for (let cc = 0; cc < b.cols; cc++) {
      const hs = hash2(cc, rr, b.seed), wx = x + cc * cw + cw * .22, wy = -rr * b.rowH - b.rowH * .1, ww = cw * .56, wh = b.rowH * .56;
      const isLit = hs < lit * (li === 2 ? 1 : 1.3);
      ctx.fillStyle = isLit ? P.winLit : P.win; ctx.fillRect(wx, wy, ww, wh);
      if (isLit && li === 2 && c > .3) { ctx.fillStyle = rgba('#ffd87a', .22); ctx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6); }
      if (li === 2 && !isLit) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(wx, wy, ww, wh * .35); }
      if (li === 2 && hs > .86 && hs < .93) { ctx.fillStyle = P.seam; ctx.fillRect(wx - 2, wy + wh, ww + 4, 3); ctx.fillStyle = rgba('#000', .25); ctx.fillRect(wx - 2, wy + wh + 3, ww + 4, 6); } // sacada
    }
  }
  // telhado
  ctx.fillStyle = li === 2 ? P.seam : base;
  if (b.roof === 1) { ctx.fillRect(x + w * .1, -h - 22, w * .22, 22); }
  if (b.roof === 2) { ctx.fillRect(x + w * .6, -h - 16, w * .3, 16); ctx.fillRect(x + w * .7, -h - 52, 3, 36); }
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x, -h, w, 3);
}
/* camadas completas. camX = ponto-alvo da câmera, y0 = linha do chão na tela */
function drawCity(ctx, camX, y0, c, o = {}) {
  const P = pal(c, o.night || 0);
  for (let li = 0; li < 3; li++) {
    const L = CITY[li], offs = o.noLayer && o.noLayer.includes(li);
    if (offs) continue;
    ctx.save(); ctx.translate(W / 2 - camX * L.par, y0 + (o.layerY ? o.layerY[li] : 0));
    for (const b of L.blocks) {
      const sx = b.x - camX * L.par + W / 2; if (sx > W + 50 || sx + b.w < -50) continue;
      drawBlock(ctx, b, li, P, { lit: o.lit == null ? (c > .5 ? .22 : .05) : o.lit, c, t: o.t });
    }
    ctx.restore();
    if (L.fog && o.fog !== 0) { // névoa entre camadas
      ctx.fillStyle = lg(ctx, 0, y0 - 420, 0, y0 + 40, [[0, rgba('#ffffff', 0)], [1, P.fog.replace('rgb', 'rgba').replace(')', `,${L.fog * .55})`)]]); ctx.fillRect(0, y0 - 420, W, 460);
    }
  }
}
function drawSky(ctx, c, night = 0, y0 = 0, y1 = H) {
  const P = pal(c, night); ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, P.skyTop], [1, P.skyBot]]); ctx.fillRect(0, y0, W, y1 - y0);
}

/* ---------- Esfera de porcelana com kintsugi (a "cápsula do coração" da capa) ---------- */
const CRACKS = (() => {
  const r = rng(31), list = [];
  function branch(x, y, ang, len, depth, delay) {
    const pts = [[x, y]]; let px = x, py = y, a = ang;
    const steps = 5 + Math.floor(r() * 4);
    for (let i = 0; i < steps; i++) { a += (r() - .5) * .85; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; pts.push([px, py]); }
    list.push({ pts, depth, delay });
    if (depth < 3) for (let k = 0; k < 2; k++) if (r() < .85) { const i = 1 + Math.floor(r() * (pts.length - 2)); branch(pts[i][0], pts[i][1], a + (r() < .5 ? -1 : 1) * (.5 + r() * .9), len * .6, depth + 1, delay + i / steps * .35); }
  }
  for (let k = 0; k < 5; k++) branch(0, 0, k / 5 * TAU + r() * .7, .9, 0, 0);
  return list;
})();
/* o = {crack:0..1 (rachaduras se espalhando), glow:0..1, shatter:0..1, spin} */
function drawSphere(ctx, x, y, R, o = {}) {
  const crack = o.crack == null ? 1 : o.crack, glow = o.glow == null ? 1 : o.glow, t = o.t || 0, shat = o.shatter || 0;
  ctx.save(); ctx.translate(x, y);
  if (shat > 0) { // explode em cacos
    const r = rng(77);
    for (let i = 0; i < 22; i++) {
      const a = r() * TAU, d = shat * R * (2 + r() * 6), sz = R * (.12 + r() * .24), rot = r() * TAU + shat * (r() - .5) * 8;
      ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(rot); ctx.globalAlpha = 1 - shat * .6;
      ctx.fillStyle = lg(ctx, -sz, -sz, sz, sz, [[0, '#fff7e6'], [1, '#b9a98a']]); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.5;
      poly(ctx, [[-sz, -sz * .4], [sz * .2, -sz], [sz, sz * .3], [-sz * .1, sz]]); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.restore(); return;
  }
  // brilho externo
  if (glow > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, R * .6, R * (2.2 + .3 * Math.sin(t * 3)), [[0, `rgba(255,200,110,${.55 * glow})`], [1, 'rgba(255,200,110,0)']]); ctx.fillRect(-R * 3, -R * 3, R * 6, R * 6); ctx.globalCompositeOperation = 'source-over'; }
  // corpo de porcelana
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
  ctx.fillStyle = rg(ctx, -R * .35, -R * .4, R * .1, R * 1.25, [[0, '#fffdf6'], [.55, '#e9e1d0'], [1, '#8f8a82']]); ctx.fillRect(-R, -R, R * 2, R * 2);
  // pintura floral/pássaros vermelhos e azuis
  const pr = rng(12); ctx.globalAlpha = .85;
  for (let i = 0; i < 9; i++) {
    const a = pr() * TAU, d = pr() * R * .85, px = Math.cos(a) * d, py = Math.sin(a) * d, s = R * (.06 + pr() * .06);
    ctx.fillStyle = i % 3 ? '#d6403c' : '#2e5fb8'; ctx.beginPath(); ctx.ellipse(px, py, s * 1.6, s, pr() * 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2e5fb8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + s * 2, py - s, px + s * 4, py + s); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // luz interna saindo pelas fendas
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, R, [[0, `rgba(255,236,180,${.95 * glow})`], [.5, `rgba(255,190,90,${.35 * glow})`], [1, 'rgba(255,190,90,0)']]); ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  // rachaduras (kintsugi dourado) se espalhando
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const k of CRACKS) {
    const pr2 = clamp((crack - k.delay) / (1 - k.delay * .9)); if (pr2 <= 0) continue;
    const n = k.pts.length - 1, upto = pr2 * n;
    ctx.beginPath(); ctx.moveTo(k.pts[0][0] * R, k.pts[0][1] * R);
    for (let i = 1; i <= Math.ceil(upto); i++) { const f = Math.min(1, upto - (i - 1)), p0 = k.pts[i - 1], p1 = k.pts[i]; ctx.lineTo((p0[0] + (p1[0] - p0[0]) * f) * R, (p0[1] + (p1[1] - p0[1]) * f) * R); }
    const wdt = (2.1 - k.depth * .45) * (R / 150 * .8 + .2);
    ctx.strokeStyle = `rgba(255,200,90,${.55 * glow})`; ctx.lineWidth = wdt * 3; ctx.stroke();
    ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = wdt; ctx.stroke();
    ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = wdt * .35; ctx.stroke();
  }
  // brilho especular
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-R * .42, -R * .5, R * .16, R * .09, -.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,20,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.restore();
}

/* ---------- Grua de origami (tsuru) ---------- */
function drawCrane(ctx, x, y, s, flap = 0, o = {}) {
  const body = o.body || '#fff8ea', shade = o.shade || '#d8c9a8', edge = o.edge || '#3a3550', gold = o.gold;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.lineJoin = 'round'; ctx.lineWidth = 2.2 / Math.max(s, .3);
  const f = Math.sin(flap) * 28;
  const P = (pts, col) => { poly(ctx, pts); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = edge; ctx.stroke(); };
  P([[-4, 4], [-52, -16 - f * .35], [-30, 8]], shade); // asa de trás
  P([[-52, 6], [-34, -4], [-6, 4], [34, 4], [50, -14], [58, -22], [40, 8], [-6, 20]], body); // corpo
  P([[-6, 4], [-60, -34 - f], [-18, 18]], o.wing || '#f5ecd8'); // asa da frente
  P([[34, 4], [50, -14], [58, -22], [55, -14], [42, 6]], shade); // pescoço
  P([[-52, 6], [-70, 14], [-34, 6]], shade); // cauda
  P([[58, -22], [72, -17], [56, -17]], gold ? '#ffd36b' : '#e24a3b'); // bico
  if (gold) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, 90, [[0, 'rgba(255,220,140,.45)'], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(-100, -100, 200, 200); }
  ctx.restore();
}
