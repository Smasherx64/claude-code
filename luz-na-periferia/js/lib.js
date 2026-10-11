'use strict';
/* ============================================================
   lib.js — utilidades, easing, ruído, câmera e efeitos de "anime"
   Tudo é determinístico: render(t) sempre produz o mesmo quadro.
   ============================================================ */
const W = 720, H = 1280, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (a, b, t) => { const x = seg(t, a, b); return x * x * (3 - 2 * x); };
const rad = d => d * Math.PI / 180;

const E = {
  lin: t => t,
  in2: t => t * t,
  out2: t => 1 - (1 - t) * (1 - t),
  io2: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  in3: t => t * t * t,
  out3: t => 1 - Math.pow(1 - t, 3),
  io3: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out5: t => 1 - Math.pow(1 - t, 5),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1),
  bounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  },
};

/* ---------- aleatório com semente e ruído ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hash2(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise2(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
const noise1 = (x, s = 0) => noise2(x, 7.3, s);
const wob = (t, f = 1, s = 0) => noise1(t * f, s) * 2 - 1; // -1..1

/* ---------- cor ---------- */
const _cc = {};
function hex(c) {
  if (_cc[c]) return _cc[c];
  if (c[0] === 'r') { const m = c.match(/[\d.]+/g).map(Number); return (_cc[c] = [m[0], m[1], m[2]]); }
  const n = parseInt(c.slice(1), 16);
  return (_cc[c] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}
function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}
function rgba(c, a) { const A = hex(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }

/* ---------- batida: 80 BPM (0,75 s). Verso ancorado em 2,92 s; refrão em 17,35 s ---------- */
const BEAT = 0.75;
/* deslocamento da grade de batidas medido em cada seção da música (80 BPM) */
const BEAT_SECTIONS = [[0, .29], [13, .51], [38, .46], [49, .54], [66.7, .71]];
function beatInfo(t) {
  let o = .5; for (const s of BEAT_SECTIONS) if (t >= s[0]) o = s[1];
  const p = (t - o) / BEAT, f = p - Math.floor(p);
  return { n: Math.floor(p), f, pulse: Math.exp(-f * 5.5), p };
}

/* ---------- câmera ---------- */
function cam(ctx, c) {
  ctx.translate(W / 2, H / 2);
  if (c.r) ctx.rotate(c.r);
  const z = c.z || 1; ctx.scale(z, z);
  ctx.translate(-(c.x), -(c.y));
}

/* ---------- utilitários de desenho ---------- */
function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function lg(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
function rg(ctx, x, y, r0, r1, stops) { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
function sparkle(ctx, x, y, r, rot = 0, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * .12, -r * .12, r, 0); ctx.quadraticCurveTo(r * .12, r * .12, 0, r);
  ctx.quadraticCurveTo(-r * .12, r * .12, -r, 0); ctx.quadraticCurveTo(-r * .12, -r * .12, 0, -r); ctx.fill(); ctx.restore();
}

/* ---------- efeitos ---------- */
let _grain;
function grain(ctx, t, a = .07) {
  if (!_grain) {
    _grain = document.createElement('canvas'); _grain.width = _grain.height = 256;
    const g = _grain.getContext('2d'), im = g.createImageData(256, 256), r = rng(99);
    for (let i = 0; i < im.data.length; i += 4) { const v = 90 + r() * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  }
  const f = Math.floor(t * 24), r = rng(f * 7 + 3);
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
  const ox = -r() * 256, oy = -r() * 256;
  for (let x = ox; x < W; x += 256) for (let y = oy; y < H; y += 256) ctx.drawImage(_grain, x, y);
  ctx.restore();
}
let _vig;
function vignette(ctx, s = .55, col = '0,0,0') {
  const key = s + col;
  if (!_vig || _vig.key !== key) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = rg(g, W / 2, H / 2, H * .35, H * 1.05, [[0, `rgba(${col},0)`], [1, `rgba(${col},${s})`]]); g.fillRect(0, 0, W, H);
    _vig = c; _vig.key = key;
  }
  ctx.drawImage(_vig, 0, 0);
}
function speedLines(ctx, cx, cy, t, o = {}) {
  const n = o.n || 70, r0 = o.r0 || 160, r1 = o.r1 || 1000, col = o.col || '#fff', a = o.a == null ? .8 : o.a, thick = o.thick || 7;
  const f = Math.floor(t * 15), r = rng((o.seed || 5) + f * 13);
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU, len0 = r0 + r() * r0 * .8, len1 = r1 * (.7 + r() * .5), w = (.004 + r() * thick / 400);
    const x0 = cx + Math.cos(ang) * len0, y0 = cy + Math.sin(ang) * len0, x1 = cx + Math.cos(ang) * len1, y1 = cy + Math.sin(ang) * len1;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.lineTo(x1 + Math.cos(ang + 1.5708) * len1 * w, y1 + Math.sin(ang + 1.5708) * len1 * w);
    ctx.lineTo(x1 - Math.cos(ang + 1.5708) * len1 * w, y1 - Math.sin(ang + 1.5708) * len1 * w); ctx.fill();
  }
  ctx.restore();
}
function parallelLines(ctx, ang, t, o = {}) { // linhas de velocidade paralelas (movimento lateral)
  const n = o.n || 40, col = o.col || '#fff', a = o.a == null ? .5 : o.a, f = Math.floor(t * 20), r = rng((o.seed || 2) + f * 9);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ang); ctx.fillStyle = col; ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) {
    const y = (r() - .5) * 1500, x = (r() - .5) * 1800, l = 150 + r() * 700, h = 1.5 + r() * 4;
    ctx.fillRect(x - l / 2, y, l, h);
  }
  ctx.restore();
}
function rays(ctx, x, y, t, o = {}) { // raios de luz giratórios
  const n = o.n || 14, col = o.col || '255,230,160', a = o.a == null ? .35 : o.a, len = o.len || 1400, sp = o.sp || .15;
  ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = i / n * TAU + t * sp, w = TAU / n * .22;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, len);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, len, ang - w / 2, ang + w / 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function flare(ctx, x, y, size = 1, col = '255,210,140', a = 1, streak = 1) { // flare anamórfico (a linha horizontal da capa)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, 220 * size, [[0, `rgba(255,255,255,${a})`], [.2, `rgba(${col},${a * .7})`], [1, `rgba(${col},0)`]]);
  ctx.fillRect(x - 260 * size, y - 260 * size, 520 * size, 520 * size);
  if (streak > 0) {
    ctx.fillStyle = lg(ctx, x - W * streak, 0, x + W * streak, 0, [[0, `rgba(${col},0)`], [.5, `rgba(255,236,200,${a * .95})`], [1, `rgba(${col},0)`]]);
    ctx.fillRect(x - W * streak, y - 3 * size, W * 2 * streak, 6 * size);
    ctx.fillStyle = lg(ctx, x - W * streak, 0, x + W * streak, 0, [[0, `rgba(${col},0)`], [.5, `rgba(${col},${a * .35})`], [1, `rgba(${col},0)`]]);
    ctx.fillRect(x - W * streak, y - 14 * size, W * 2 * streak, 28 * size);
  }
  ctx.restore();
}
function halftone(ctx, x, y, w, h, dot, col, t = 0, dir = 1, a = .4) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = col; ctx.globalAlpha = a;
  const step = dot * 2.2;
  for (let j = 0, yy = y; yy < y + h + step; yy += step * .866, j++) {
    for (let xx = x + (j % 2) * step / 2; xx < x + w + step; xx += step) {
      const k = clamp(((dir > 0 ? (xx - x) / w : 1 - (xx - x) / w) * .8 + (yy - y) / h * .2));
      const r = dot * k * (.9 + .1 * Math.sin(t * 2 + xx * .02));
      if (r > .4) { ctx.beginPath(); ctx.arc(xx, yy, r, 0, TAU); ctx.fill(); }
    }
  }
  ctx.restore();
}
function shakeV(t, amp, f = 28, s = 0) { return [wob(t, f, s) * amp, wob(t, f, s + 11) * amp]; }
function flash(ctx, a, col = '255,255,255') { if (a > .003) { ctx.save(); ctx.fillStyle = `rgba(${col},${clamp(a)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
function invert(ctx) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }

/* ---------- bloom (brilho nas áreas claras) ---------- */
let _bl;
function bloom(ctx, a = .35, blur = 10) {
  if (!_bl) { _bl = document.createElement('canvas'); _bl.width = 180; _bl.height = 320; }
  const b = _bl.getContext('2d'), cv = ctx.canvas;
  b.save(); b.clearRect(0, 0, 180, 320); b.filter = 'contrast(2.4) brightness(.62) saturate(1.3)';
  b.drawImage(cv, 0, 0, cv.width, cv.height, 0, 0, 180, 320); b.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  ctx.filter = `blur(${blur * cv.width / 720}px)`; ctx.drawImage(_bl, 0, 0, 180, 320, 0, 0, cv.width, cv.height); ctx.restore();
}
/* aberração cromática barata: reaplica o quadro deslocado em R e B */
let _ca;
function chroma(ctx, px) {
  if (px < .3) return;
  const cv = ctx.canvas;
  if (!_ca) _ca = document.createElement('canvas');
  _ca.width = cv.width; _ca.height = cv.height; const c = _ca.getContext('2d'); c.drawImage(cv, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const k = cv.width / 720;
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55;
  // R deslocado
  const tmp = document.createElement('canvas'); tmp.width = cv.width; tmp.height = cv.height; const tc = tmp.getContext('2d');
  tc.drawImage(_ca, 0, 0); tc.globalCompositeOperation = 'multiply'; tc.fillStyle = '#f00'; tc.fillRect(0, 0, tmp.width, tmp.height);
  ctx.drawImage(tmp, px * k, 0);
  tc.globalCompositeOperation = 'source-over'; tc.drawImage(_ca, 0, 0); tc.globalCompositeOperation = 'multiply'; tc.fillStyle = '#00f'; tc.fillRect(0, 0, tmp.width, tmp.height);
  ctx.drawImage(tmp, -px * k, 0);
  ctx.restore();
}
