'use strict';
/* ============================================================
   magic.js — utilitários MAHOU SHOUJO KAWAII (pastel holográfico)
   corações, estrelas, luas, sakura, fitas de cetim, asas, círculos mágicos, brilhos…
   Tudo determinístico (função de t + semente).
   ============================================================ */
const PST = { pink: '#ff9ccf', hot: '#ff5fae', lilac: '#c9a6ff', mint: '#a2f5da', baby: '#8fd6ff', gold: '#ffe08a', pearl: '#fff8fc', lemon: '#fff4a8', peach: '#ffc8b4' };
const PST_LIST = [PST.pink, PST.lilac, PST.mint, PST.baby, PST.gold, PST.pearl];
const PST_RGB = ['255,156,207', '201,166,255', '162,245,218', '143,214,255', '255,224,138', '255,248,252'];

/* ---------- formas ---------- */
const _HEART = (() => { const p = []; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; p.push([16 * Math.pow(Math.sin(a), 3) / 17, (-(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) + 2) / 17]); } return p; })();
function heartPath(ctx, x, y, s, rot = 0) { // coração de largura ~2s (path em espaço de tela)
  const c = Math.cos(rot), n = Math.sin(rot);
  ctx.beginPath(); _HEART.forEach((p, i) => { const px = p[0] * s, py = p[1] * s, X = x + px * c - py * n, Y = y + px * n + py * c; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath();
}
function heartShape(ctx, x, y, s, rot = 0, fill = PST.pink, stroke = null, lw = 3, shine = true) {
  heartPath(ctx, x, y, s, rot);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  if (shine && fill) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(x - s * .46, y - s * .42, s * .17, s * .1, -.7 + rot, 0, TAU); ctx.fill(); }
}
function starPath(ctx, x, y, R, rot = 0, inner = .5, n = 5) {
  ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot - Math.PI / 2 + i / (n * 2) * TAU, r = i % 2 ? R * inner : R; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath();
}
function starShape5(ctx, x, y, R, rot = 0, fill = PST.gold, stroke = null, lw = 3, inner = .5) {
  starPath(ctx, x, y, R, rot, inner); ctx.lineJoin = 'round';
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function crescent(ctx, x, y, R, rot = 0, fill = PST.gold, stroke = null, lw = 3) {
  const d = R * .42, r2 = R * .8, xi = (d * d + R * R - r2 * r2) / (2 * d), yi = Math.sqrt(Math.max(0, R * R - xi * xi));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  ctx.moveTo(xi, -yi); ctx.arc(0, 0, R, Math.atan2(-yi, xi), Math.atan2(yi, xi), true); ctx.arc(d, 0, r2, Math.atan2(yi, xi - d), Math.atan2(-yi, xi - d), false); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.restore();
}
/* brilho de 4 pontas com halo suave */
function glint(ctx, x, y, r, rot = 0, col = '#fff', halo = '255,230,250') {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, r * 1.1, [[0, `rgba(${halo},.55)`], [1, `rgba(${halo},0)`]]); ctx.fillRect(x - r * 1.1, y - r * 1.1, r * 2.2, r * 2.2);
  sparkle(ctx, x, y, r, rot, col); sparkle(ctx, x, y, r * .55, rot + Math.PI / 4, col); ctx.restore();
}

/* ---------- gradientes holográficos ---------- */
const _HOLO = ['255,156,207', '255,224,150', '162,245,218', '143,214,255', '201,166,255', '255,156,207'];
function holoGrad(ctx, x, y, rot = 0, a = 1) { const g = ctx.createConicGradient(rot, x, y); _HOLO.forEach((c, i) => g.addColorStop(i / (_HOLO.length - 1), `rgba(${c},${a})`)); return g; }
function holoLin(ctx, x0, y0, x1, y1, a = 1, sh = 0) { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (let i = 0; i < _HOLO.length; i++) { g.addColorStop(i / (_HOLO.length - 1), `rgba(${_HOLO[(i + sh) % (_HOLO.length - 1)]},${a})`); } return g; }

/* ---------- céu kawaii, nuvens, arco-íris ---------- */
function cloud(ctx, x, y, s, a = 1, tint = '255,210,236') {
  const C = [[-1.25, .15, .62], [-.55, -.25, .85], [.3, -.42, .98], [1.05, -.1, .76], [1.6, .2, .5], [0, .1, .9], [.8, .22, .7], [-.9, .25, .6]];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  for (const c of C) { ctx.fillStyle = rg(ctx, c[0] - c[2] * .2, c[1] - c[2] * .35, c[2] * .1, c[2] * 1.05, [[0, 'rgba(255,255,255,1)'], [.6, 'rgba(255,248,252,.98)'], [1, `rgba(${tint},.96)`]]); ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, TAU); ctx.fill(); }
  ctx.restore();
}
function rainbow(ctx, cx, cy, R, w, a = .5) {
  const cols = ['255,140,190', '255,196,140', '255,244,160', '170,245,200', '150,215,255', '190,160,255'];
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = w / cols.length + 1;
  cols.forEach((c, i) => { ctx.strokeStyle = `rgba(${c},${a})`; ctx.beginPath(); ctx.arc(cx, cy, R - i * (w / cols.length), Math.PI, TAU); ctx.stroke(); });
  ctx.restore();
}
/* céu pastel holográfico (rosa→lilás→azul-bebê) com textura da nebulosa */
function kawaiiSky(ctx, t, o = {}) {
  ctx.fillStyle = lg(ctx, 0, -300, 0, H + 300, [[0, o.top || '#b9a2ff'], [.5, o.mid || '#ffb7e2'], [1, o.bot || '#bfe9ff']]); ctx.fillRect(-400, -400, W + 800, H + 800);
  if (o.neb !== 0) { ctx.save(); ctx.globalAlpha = o.neb == null ? .55 : o.neb; ctx.globalCompositeOperation = 'soft-light'; drawNebula(ctx, -140, -140, W + 280, H + 280, { z: o.z || 1.2, ox: (o.ox || 0) + Math.sin(t * .3) * 60, oy: o.oy || 0 }); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rg(ctx, o.gx || W * .55, o.gy || 250, 0, 520, [[0, 'rgba(255,255,255,.65)'], [.4, 'rgba(255,225,245,.28)'], [1, 'rgba(255,225,245,0)']]); ctx.fillRect(-400, -400, W + 800, H + 800); ctx.restore();
}
/* lavagem pastel por cima do mundo (deixa o escuro lilás-rosado e brilhante) */
function pastelWash(ctx, a = 1, t = 0, soft = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = lg(ctx, 0, -300, 0, H + 300, [[0, `rgba(190,160,255,${.42 * a})`], [.55, `rgba(255,170,220,${.42 * a})`], [1, `rgba(255,215,190,${.34 * a})`]]); ctx.fillRect(-400, -400, W + 800, H + 800);
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55 * a * soft; ctx.fillStyle = holoLin(ctx, 0, 0, W, H, 1, Math.floor(t * 1.5) % 5); ctx.fillRect(-400, -400, W + 800, H + 800);
  ctx.restore();
}

/* ---------- partículas ---------- */
let _petal = null;
function petalPath(ctx, s) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-s * .9, -s * .5, -s * .85, -s * 1.4, -s * .16, -s * 1.5); ctx.lineTo(0, -s * 1.22); ctx.lineTo(s * .16, -s * 1.5); ctx.bezierCurveTo(s * .85, -s * 1.4, s * .9, -s * .5, 0, 0); }
/* pétalas de cerejeira em queda/vento */
function sakura(ctx, t, seed, n, o = {}) {
  const r = rng(seed), x0 = o.x0 || 0, y0 = o.y0 || 0, w = o.w || W, h = o.h || H, sz = o.size || 12, wind = o.wind == null ? 90 : o.wind, fall = o.fall == null ? 70 : o.fall;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const sp = .5 + r() * .9, ph = r() * TAU, s = sz * (.6 + r() * .7), rt = r() * TAU, tum = 1.5 + r() * 3;
    const x = x0 + (((r() * w + t * wind * sp + Math.sin(t * 1.3 + ph) * 30) % w) + w) % w, y = y0 + (((r() * h + t * fall * sp) % h) + h) % h;
    const flip = Math.cos(t * tum + ph); ctx.save(); ctx.translate(x, y); ctx.rotate(rt + t * (.6 + sp) * (i % 2 ? 1 : -1)); ctx.scale(.45 + .55 * Math.abs(flip), 1);
    ctx.globalAlpha = (o.a == null ? 1 : o.a) * (.7 + .3 * sp * .8);
    petalPath(ctx, s); ctx.fillStyle = lg(ctx, 0, 0, 0, -s * 1.5, [[0, '#ff8fc0'], [1, i % 3 ? '#ffd3e6' : '#fff0f6']]); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
/* glitter: brilhos de 4 pontas cintilando (cores pastel) */
function glitter(ctx, t, seed, n, x0, y0, w, h, o = {}) {
  const r = rng(seed), sz = o.size || 14, a = o.a == null ? 1 : o.a; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w + (o.dx ? Math.sin(t + i) * o.dx : 0), y = x0 * 0 + y0 + r() * h + (o.drift ? (((t * o.drift * (.5 + r())) % h) + h) % h * 0 : 0), ph = r() * TAU, sp = 2 + r() * 4, s = sz * (.3 + r() * r() * 1.1), col = PST_LIST[Math.floor(r() * PST_LIST.length)], tw = Math.pow(Math.max(0, Math.sin(t * sp + ph)), 2);
    if (tw < .04) continue; const k = r();
    if (k < .72) sparkle(ctx, x, y, s * (.4 + tw), t * .5 + ph, col); else if (k < .86) { ctx.fillStyle = col; ctx.globalAlpha = a * tw; ctx.beginPath(); ctx.arc(x, y, s * .22, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; } else { ctx.globalAlpha = a * tw; starShape5(ctx, x, y, s * .6, t + ph, col); ctx.globalAlpha = 1; }
  }
  ctx.restore();
}
/* bolhas de sabão com reflexos */
function bubbles(ctx, t, seed, n, o = {}) {
  const r = rng(seed), w = o.w || W, h = o.h || H; ctx.save();
  for (let i = 0; i < n; i++) {
    const R = (o.rMin || 10) + r() * (o.rMax || 40), sp = 14 + r() * 30, x = (((r() * w + Math.sin(t * .8 + i) * 26) % w) + w) % w, y = (((r() * h - t * sp) % h) + h) % h, ph = r() * TAU;
    ctx.fillStyle = rg(ctx, x - R * .3, y - R * .3, R * .1, R, [[0, 'rgba(255,255,255,.28)'], [.75, `rgba(${PST_RGB[i % 5]},.12)`], [1, `rgba(${PST_RGB[(i + 2) % 5]},.5)`]]);
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(x - R * .38, y - R * .42, R * .2, R * .1, -.7, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
/* corações flutuando para cima */
function floatHearts(ctx, t, seed, n, o = {}) {
  const r = rng(seed), w = o.w || W, h = o.h || H, x0 = o.x0 || 0, y0 = o.y0 || 0; ctx.save();
  for (let i = 0; i < n; i++) {
    const sp = 30 + r() * 50, s = (o.size || 16) * (.5 + r()), x = x0 + (((r() * w + Math.sin(t * 1.4 + i * 2) * 20) % w) + w) % w, yy = (((r() * h - t * sp) % h) + h) % h, y = y0 + yy;
    ctx.globalAlpha = (o.a == null ? 1 : o.a) * Math.sin(Math.PI * (yy / h)); heartShape(ctx, x, y, s, Math.sin(t * 2 + i) * .3, PST_LIST[i % 4], 'rgba(255,255,255,.8)', 1.5);
  }
  ctx.restore();
}
/* estrela cadente/cometa com rastro afunilado */
function comet(ctx, x, y, ang, len, w, a = 1, col = '255,240,250') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, -len, 0); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.35, `rgba(255,170,220,${a * .45})`); g.addColorStop(1, 'rgba(170,150,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -w); ctx.lineTo(-len, 0); ctx.lineTo(0, w); ctx.closePath(); ctx.fill();
  ctx.restore(); glint(ctx, x, y, w * 3.2, ang, '#fff');
}

/* ---------- fitas de cetim ---------- */
function ribbonTrail(ctx, pts, w, c0 = '255,156,207', c1 = '201,166,255', a = 1, o = {}) {
  const n = pts.length; if (n < 2) return; const Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, u = i / (n - 1);
    let ww = w * (o.both ? Math.pow(Math.sin(Math.PI * u), .6) : Math.pow(1 - u, .75)); if (o.twist) ww *= .3 + .7 * Math.abs(Math.cos(u * o.twist + (o.ph || 0)));
    Lp.push([pts[i][0] + nx * ww, pts[i][1] + ny * ww]); Rp.push([pts[i][0] - nx * ww, pts[i][1] - ny * ww]);
  }
  ctx.save(); ctx.lineJoin = 'round';
  const g = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[n - 1][0], pts[n - 1][1]); g.addColorStop(0, `rgba(${c0},${a})`); g.addColorStop(1, `rgba(${c1},${a * .85})`);
  ctx.beginPath(); Lp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); for (let i = n - 1; i >= 0; i--) ctx.lineTo(Rp[i][0], Rp[i][1]); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${.7 * a})`; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = `rgba(255,255,255,${.45 * a})`; ctx.lineWidth = Math.max(1.5, w * .22); ctx.stroke();
  ctx.restore();
}
/* fita ondulando a partir de um ponto, na direção ang */
function ribbonWave(ctx, x, y, ang, len, t, amp, w, c0, c1, a = 1, o = {}) {
  const pts = [], ca = Math.cos(ang), sa = Math.sin(ang), n = 22;
  for (let i = 0; i <= n; i++) { const u = i / n, off = Math.sin(u * (o.freq || 5) - t * (o.sp || 6) + (o.ph || 0)) * amp * (.15 + u); pts.push([x + ca * u * len - sa * off, y + sa * u * len + ca * off]); }
  ribbonTrail(ctx, pts, w, c0, c1, a, o);
}
/* fita seguindo o histórico de uma função posição fn(tt) -> [x,y] */
function ribbonFollow(ctx, fn, t, dur, n, w, c0, c1, a = 1, o = {}) {
  const pts = []; for (let i = 0; i <= n; i++) pts.push(fn(t - i / n * dur)); ribbonTrail(ctx, pts, w, c0, c1, a, o);
  if (o.sparks) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 1; i < n; i += 2) { const p = pts[i], u = i / n; sparkle(ctx, p[0] + Math.sin(i * 7) * 8, p[1] + Math.cos(i * 5) * 8, (1 - u) * (o.sparks) * (.6 + .4 * Math.sin(t * 20 + i)), t * 3 + i, PST_LIST[i % 6]); } ctx.restore(); }
}
/* fita em hélice em torno de um eixo vertical. part: 'back' | 'front' */
function ribbonHelix(ctx, cx, yb, yt, R, turns, ph, w, c0, c1, part, a = 1, grow = 1) {
  const n = 40; let seg = []; const flush = () => { if (seg.length > 1) ribbonTrail(ctx, seg, w * .9, c0, c1, a, { both: true }); seg = []; };
  for (let i = 0; i <= n * grow; i++) { const u = i / n, ph2 = ph + u * turns * TAU, z = Math.sin(ph2), front = z > 0; if ((part === 'front') !== front) { flush(); continue; } seg.push([cx + Math.cos(ph2) * R * (.75 + .25 * Math.sin(u * 3)), lerp(yb, yt, u)]); }
  flush();
}

/* ---------- prisma, flare arco-íris ---------- */
function prismFlare(ctx, x, y, size = 1, a = 1, t = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, 240 * size, [[0, `rgba(255,255,255,${a})`], [.18, `rgba(255,214,240,${a * .7})`], [1, 'rgba(255,170,230,0)']]); ctx.fillRect(x - 260 * size, y - 260 * size, 520 * size, 520 * size);
  ctx.fillStyle = holoLin(ctx, x - W, 0, x + W, 0, a * .85, Math.floor(t * 2) % 5); ctx.fillRect(x - W, y - 3 * size, W * 2, 6 * size);
  ctx.fillStyle = holoLin(ctx, x - W, 0, x + W, 0, a * .22); ctx.fillRect(x - W, y - 16 * size, W * 2, 32 * size);
  ctx.lineWidth = 3 * size; ctx.strokeStyle = holoGrad(ctx, x, y, t, a * .6); ctx.beginPath(); ctx.arc(x, y, 150 * size, 0, TAU); ctx.stroke();
  ctx.lineWidth = 2 * size; ctx.beginPath(); ctx.arc(x, y, 190 * size, 0, TAU); ctx.stroke();
  for (let k = -2; k <= 2; k++) { if (!k) continue; const gx = x - k * 120 * size, gr = (24 + Math.abs(k) * 8) * size; ctx.fillStyle = rg(ctx, gx, y, 0, gr, [[0, `rgba(${PST_RGB[(k + 5) % 5]},${a * .5})`], [1, `rgba(${PST_RGB[(k + 5) % 5]},0)`]]); ctx.fillRect(gx - gr, y - gr, gr * 2, gr * 2); }
  ctx.restore(); glint(ctx, x, y, 70 * size * a, t * .3, '#fff');
}

/* ---------- asas ---------- */
function _feather(ctx, len, wd, c0, c1) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(len * .25, -wd, len * .75, -wd * .9, len, 0); ctx.bezierCurveTo(len * .75, wd * .8, len * .25, wd * .9, 0, 0); ctx.closePath(); ctx.fillStyle = lg(ctx, 0, 0, len, 0, [[0, c0], [1, c1]]); ctx.fill(); ctx.strokeStyle = 'rgba(210,190,255,.7)'; ctx.lineWidth = 1.2; ctx.stroke(); }
/* asas de anjo: (x,y)= base entre as omoplatas; s = escala (≈ comprimento da asa); flap 0..1 */
function wingsAngel(ctx, x, y, s, flap = 0, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, -s * .3, 0, s * 1.5, [[0, 'rgba(255,220,245,.35)'], [1, 'rgba(255,220,245,0)']]); ctx.fillRect(-s * 1.6, -s * 1.5, s * 3.2, s * 3); ctx.globalCompositeOperation = 'source-over';
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.scale(sd, 1); ctx.rotate(-flap * .35);
    const rows = [[8, 1.0, 1.5, .1, -1.4, .20], [7, 0.78, 1.15, .1, -1.2, .17], [6, 0.52, .8, 0, -1.0, .14]];
    rows.forEach((rw, ri) => {
      for (let i = 0; i < rw[0]; i++) {
        const u = i / (rw[0] - 1), an = lerp(rw[4], .55, u) + flap * .15 * u, len = s * lerp(rw[1], rw[2], Math.sin(u * Math.PI * .8 + .3) ), wd = s * rw[5];
        ctx.save(); ctx.rotate(an); _feather(ctx, len * (ri === 0 ? 1 : 1) * (1.0 - ri * .0), wd, ri === 2 ? '#ffffff' : '#fffafd', ri === 0 ? '#e8d8ff' : ri === 1 ? '#ffd9ee' : '#d8f1ff'); ctx.restore();
      }
    });
    ctx.restore();
  }
  ctx.restore();
}
/* asas de borboleta (fada) */
function wingsButterfly(ctx, x, y, s, flap = 0, a = 1, rot = 0) {
  const fx = .55 + .45 * Math.cos(flap);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.scale(sd * fx, 1); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(.4, -1.7, 1.9, -2.5, 2.5, -1.6); ctx.bezierCurveTo(3, -.7, 1.6, .2, 0, 0); ctx.fillStyle = lg(ctx, 0, 0, 2.6, -1.8, [[0, '#ffb7e2'], [.55, '#d6b8ff'], [1, '#9fdcff']]); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = .06; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, .05); ctx.bezierCurveTo(1.5, .1, 2.2, .9, 1.6, 1.7); ctx.bezierCurveTo(1.0, 2.1, .2, 1.3, 0, .05); ctx.fillStyle = lg(ctx, 0, 0, 1.6, 1.8, [[0, '#ffd2ea'], [1, '#b8f0e0']]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(1.7, -1.35, .22, 0, TAU); ctx.arc(1.05, -.75, .13, 0, TAU); ctx.arc(1.1, 1.15, .14, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/* ---------- círculos mágicos ---------- */
/* círculo mágico kawaii: anéis holográficos, coração + pentagrama, runas, luas/estrelas/corações orbitando.
   o.kind: 'heart' | 'star' */
function heartCircle(ctx, x, y, R, t, a = 1, o = {}) {
  if (a <= .01) return; const kind = o.kind || 'heart', runes = o.runes || '魔法星夢光愛希望信';
  ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = rg(ctx, 0, 0, 0, R * 1.05, [[0, `rgba(255,214,240,${.42 * a})`], [.7, `rgba(205,175,255,${.2 * a})`], [1, 'rgba(205,175,255,0)']]); ctx.beginPath(); ctx.arc(0, 0, R * 1.05, 0, TAU); ctx.fill();
  const hg = holoGrad(ctx, 0, 0, t * .7, .95 * a);
  ctx.strokeStyle = hg; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, R * .92, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, R * .58, 0, TAU); ctx.stroke();
  ctx.fillStyle = `rgba(255,248,252,${.9 * a})`; for (let i = 0; i < 48; i++) { const an = i / 48 * TAU + t * .25; ctx.beginPath(); ctx.arc(Math.cos(an) * R * .96, Math.sin(an) * R * .96, i % 4 ? 1.6 : 3, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.rotate(-t * .35); ctx.font = `${R * .12}px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = `rgba(255,250,255,${.95 * a})`;
  for (let i = 0; i < 16; i++) { ctx.save(); ctx.rotate(i / 16 * TAU); ctx.translate(0, -R * .76); ctx.fillText(runes[i % runes.length], 0, 0); ctx.restore(); } ctx.restore();
  ctx.strokeStyle = hg; ctx.lineWidth = 3.5;
  ctx.save(); ctx.rotate(Math.sin(t * .8) * .08);
  if (kind === 'heart') { heartPath(ctx, 0, R * .02, R * .56, 0); ctx.stroke(); ctx.lineWidth = 1.8; heartPath(ctx, 0, R * .02, R * .46, 0); ctx.stroke(); } else { starPath(ctx, 0, 0, R * .56, 0, .42); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.rotate(t * .45); ctx.lineWidth = 2.6; ctx.beginPath(); for (let i = 0; i < 5; i++) { const an = (i * 2) / 5 * TAU - Math.PI / 2, px = Math.cos(an) * R * .56, py = Math.sin(an) * R * .56; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(-t * .5); ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i / 8 * TAU); ctx.translate(0, -R * 1.0); ctx.globalAlpha = a; const k = i % 4; if (k === 0) heartShape(ctx, 0, 0, R * .055, 0, PST.pink, '#fff', 2, false); else if (k === 1) starShape5(ctx, 0, 0, R * .07, 0, PST.gold, '#fff', 2); else if (k === 2) crescent(ctx, 0, 0, R * .065, 0.5, PST.lilac, '#fff', 2); else starShape5(ctx, 0, 0, R * .06, 0, PST.baby, '#fff', 2); ctx.restore(); }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const an = i / 5 * TAU - Math.PI / 2 + t * .45; sparkle(ctx, Math.cos(an) * R * .56, Math.sin(an) * R * .56, R * .07 * (.7 + .3 * Math.sin(t * 6 + i)), t, '#fff'); }
  ctx.restore();
}

/* ---------- silhueta brilhante (henshin): desenha o personagem em tela off-screen, tinge e gira ---------- */
let _sil = null;
function charSilhouette(ctx, x, y, s, pose, o, amt, spin = 0) {
  const K = 1.5, w = 760, h = 860, ox = 380, oy = 760;
  if (!_sil) { _sil = document.createElement('canvas'); _sil.width = w * K; _sil.height = h * K; }
  const g = _sil.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, _sil.width, _sil.height); g.setTransform(K, 0, 0, K, 0, 0);
  drawChar(g, ox, oy, s, pose, { ...o, shadow: false });
  if (amt > 0) { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = amt; g.fillStyle = lg(g, 0, oy - s * 9, 0, oy, [[0, '#ffffff'], [.5, '#ffe6f6'], [1, '#d6efff']]); g.fillRect(0, 0, w, h); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  const sx = Math.max(.1, Math.abs(Math.cos(spin)));
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); ctx.drawImage(_sil, 0, 0, w * K, h * K, -ox, -oy, w, h); ctx.restore();
}

/* anel de choque pastel */
function shockRing(ctx, x, y, r, w, a = 1, flat = 1) {
  if (a <= .01) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = w; ctx.strokeStyle = holoGrad(ctx, x, y, 0, a); ctx.beginPath(); ctx.ellipse(x, y, r, r * flat, 0, 0, TAU); ctx.stroke(); ctx.restore();
}
/* explosão de estrelas/corações saindo do centro */
function starBurst(ctx, x, y, u, n, seed, R = 400, size = 22) {
  if (u <= 0 || u >= 1) return; const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) { const an = r() * TAU, d = E.out3(u) * R * (.4 + r() * .7), s = size * (.5 + r()) * (1 - u * .6), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d + u * u * 60; ctx.globalAlpha = 1 - u * u; const k = i % 3; if (k === 0) starShape5(ctx, px, py, s, u * 6 + i, PST_LIST[i % 6], '#fff', 2); else if (k === 1) heartShape(ctx, px, py, s * .8, Math.sin(u * 8 + i) * .4, PST_LIST[i % 4], '#fff', 2); else { ctx.globalCompositeOperation = 'lighter'; sparkle(ctx, px, py, s * 1.3, u * 5, '#fff'); ctx.globalCompositeOperation = 'source-over'; } }
  ctx.restore();
}
/* kanji decorativo com brilho */
function glowKanji(ctx, ch, x, y, size, a = 1, rot = 0, col = '#fff7fc', glow = '#ff7ac0') {
  if (a <= .01) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.font = `${size}px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = glow; ctx.shadowBlur = size * .22; ctx.lineWidth = size * .06; ctx.strokeStyle = glow; ctx.lineJoin = 'round'; ctx.strokeText(ch, 0, 0); ctx.shadowBlur = 0;
  ctx.fillStyle = lg(ctx, 0, -size * .5, 0, size * .5, [[0, '#ffffff'], [.5, col], [1, '#ffc6e6']]); ctx.fillText(ch, 0, 0); ctx.restore();
}
