'use strict';
/* ============================================================================
   fx.js — EFEITOS (Luz na Periferia). Dono: agente WORLD. Tudo determinístico, prefixo fx*.
   Funções de tela cheia (fxBloom, fxGrade, fxVignette, fxCRT, fxGlitch) trabalham em espaço de pixel
   (ignoram a transformação atual) — chame-as depois de ctx.restore() da câmera.

   fxWarm()                                   pré-aquece caches (main chama se existir)
   fxBloom(ctx,a=.35,blur=10)                 bloom em 2 escalas (brilho nas áreas claras)
   fxGrade(ctx,preset,amount=1)               'night','dusk','sunset','neon','gray','warm'
   fxFlare(ctx,x,y,s,o)                       lens flare anamórfico + fantasmas. o={a,col:'r,g,b',ghosts,streak}
   fxParticles(ctx,t,kind,box,o)              kind: 'fireflies','embers','dust','starrain','petals','confettiStars'. box={x,y,w,h}. o={n,seed,a,speed,col}
   fxSpeed(ctx,t,o)                           linhas de velocidade. o={kind:'radial'|'dir',cx,cy,ang,n,col,a,r0,r1,seed,thick}
   fxShock(ctx,x,y,t0,t,o)                    anel de choque. o={dur,R,w,col}
   fxFog(ctx,y0,y1,col,a,t)                   faixa de neblina com bancos à deriva
   fxLightCone(ctx,x,y,ang,len,w,col,a)       cone de luz (col 'r,g,b')
   fxVignette(ctx,s=.5,col='0,0,0')           vinheta
   fxHeartbeat(ctx,t,o)                       pulso lub-dub, retorna k 0..1. o={bpm,x,y,col,a,R}
   fxImpact(ctx,t0,t,o)                       quadro de impacto estilo mangá (inverte + linhas radiais). o={dur,x,y}
   fxCRT(ctx,t,a), fxGlitch(ctx,t,a,seed)     opcionais
   fxRainStars(ctx,t,o)                       chuva de linhas neon + estrelas cadentes (orig_59). o={a,n,seed}
   fxRGB(c) -> 'r,g,b'
   ============================================================================ */
const fxRGB = c => (c.indexOf(',') > 0 && c[0] !== 'r') ? c : (a => a[0] + ',' + a[1] + ',' + a[2])(hex(c));
const fxFrac = x => x - Math.floor(x);
const _fxSpr = {}, _fxS = {};
function fxSprite(col) { // brilho redondo suave na cor 'r,g,b'
  if (_fxSpr[col]) return _fxSpr[col];
  const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d');
  g.fillStyle = rg(g, 24, 24, 0, 24, [[0, `rgba(255,255,255,1)`], [.18, `rgba(${col},.85)`], [.5, `rgba(${col},.22)`], [1, `rgba(${col},0)`]]); g.fillRect(0, 0, 48, 48);
  return (_fxSpr[col] = c);
}
function fxWarm() {
  if (typeof initWorld === 'function') initWorld();
  fxSprite('255,194,71'); _fxSc(1, 1);
}
function _fxSc(w, h) { const k = w + 'x' + h; if (!_fxS[k]) { const c = document.createElement('canvas'); c.width = w; c.height = h; _fxS[k] = c; } return _fxS[k]; }

/* ---------- bloom ---------- */
function fxBloom(ctx, a = .35, blur = 10) {
  const cv = ctx.canvas, A = _fxSc(180, 320), B = _fxSc(60, 107), ga = A.getContext('2d'), gb = B.getContext('2d');
  ga.save(); ga.clearRect(0, 0, 180, 320); ga.filter = 'contrast(2.6) brightness(.58) saturate(1.35)'; ga.drawImage(cv, 0, 0, cv.width, cv.height, 0, 0, 180, 320); ga.restore();
  gb.clearRect(0, 0, 60, 107); gb.drawImage(A, 0, 0, 180, 320, 0, 0, 60, 107);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; const k = cv.width / 720;
  ctx.globalAlpha = a; ctx.filter = `blur(${blur * k}px)`; ctx.drawImage(A, 0, 0, 180, 320, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = a * .8; ctx.filter = `blur(${blur * 3.2 * k}px)`; ctx.drawImage(B, 0, 0, 60, 107, 0, 0, cv.width, cv.height);
  ctx.restore();
}

/* ---------- color grade ---------- */
const FX_GRADES = {
  night: [['multiply', ['#8f9be0', '#5a64b0'], .7], ['screen', ['#10103a', '#1a1a50'], .22], ['soft-light', ['#3a4aff', '#101060'], .4]],
  dusk: [['multiply', ['#cdb0ff', '#ffc8a8'], .55], ['soft-light', ['#7a4aff', '#ff8a50'], .5], ['screen', ['#1a0a30', '#301030'], .12]],
  sunset: [['multiply', ['#ffd8b8', '#ffb590'], .5], ['soft-light', ['#ff9a50', '#ff5a8a'], .6], ['screen', ['#401030', '#601838'], .16]],
  neon: [['soft-light', ['#ff4fd8', '#35d6ff'], .6], ['screen', ['#2a0a5a', '#4a0a6a'], .14], ['multiply', ['#ffe6ff', '#e6f2ff'], .18]],
  gray: [['saturation', ['#808080', '#808080'], .72], ['multiply', ['#dfe3ea', '#c8ccd4'], .45]],
  warm: [['multiply', ['#fff2dc', '#ffdcb4'], .5], ['soft-light', ['#ffb050', '#ff7a40'], .35]],
};
function fxGrade(ctx, preset, amount = 1) {
  const P = FX_GRADES[preset]; if (!P || amount <= 0) return;
  const cv = ctx.canvas, w = cv.width, h = cv.height; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const [op, cols, a] of P) { ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a * amount); ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, cols[0]], [1, cols[1]]]); ctx.fillRect(0, 0, w, h); }
  ctx.restore();
}

/* ---------- lens flare ---------- */
function fxFlare(ctx, x, y, s = 1, o = {}) {
  const a = o.a == null ? 1 : o.a, col = o.col ? fxRGB(o.col) : '255,214,150', st = o.streak == null ? 1 : o.streak;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, 240 * s, [[0, `rgba(255,255,255,${a})`], [.12, `rgba(255,250,235,${.7 * a})`], [.35, `rgba(${col},${.28 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - 240 * s, y - 240 * s, 480 * s, 480 * s);
  if (st > 0) {
    const L = W * 1.3 * st;
    ctx.fillStyle = lg(ctx, x - L, 0, x + L, 0, [[0, 'rgba(120,170,255,0)'], [.5, `rgba(210,230,255,${.95 * a})`], [1, 'rgba(120,170,255,0)']]); ctx.fillRect(x - L, y - 2.2 * s, L * 2, 4.4 * s);
    ctx.fillStyle = lg(ctx, x - L, 0, x + L, 0, [[0, `rgba(${col},0)`], [.5, `rgba(${col},${.3 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - L, y - 16 * s, L * 2, 32 * s);
    ctx.fillStyle = lg(ctx, 0, y - 150 * s, 0, y + 150 * s, [[0, 'rgba(255,255,255,0)'], [.5, `rgba(255,240,220,${.4 * a})`], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(x - 1.6 * s, y - 150 * s, 3.2 * s, 300 * s);
  }
  if (o.ghosts !== false) {
    const cx = W / 2, cy = H / 2, dx = cx - x, dy = cy - y, G = [[.45, 38, '255,120,200', .14], [.8, 22, '120,220,255', .16], [1.25, 60, '255,214,120', .1], [1.6, 28, '170,120,255', .14], [2.0, 90, '120,255,200', .07]];
    for (const [k, r, c, al] of G) { const gx = x + dx * k, gy = y + dy * k, rr = r * s; ctx.fillStyle = rg(ctx, gx, gy, rr * .6, rr, [[0, `rgba(${c},0)`], [.8, `rgba(${c},${al * a})`], [1, `rgba(${c},0)`]]); ctx.fillRect(gx - rr, gy - rr, rr * 2, rr * 2); ctx.strokeStyle = `rgba(${c},${al * 1.4 * a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(gx, gy, rr * .85, 0, TAU); ctx.stroke(); }
  }
  ctx.restore();
}

/* ---------- partículas ---------- */
function fxParticles(ctx, t, kind, box, o = {}) {
  const n = o.n || 60, R = rng((o.seed || 1) * 977 + kind.length * 31), a = o.a == null ? 1 : o.a, sp = o.speed == null ? 1 : o.speed, bx = box.x, by = box.y, bw = box.w, bh = box.h;
  ctx.save(); ctx.beginPath(); if (o.clip !== false) { ctx.rect(bx, by, bw, bh); ctx.clip(); }
  if (kind === 'fireflies') {
    ctx.globalCompositeOperation = 'lighter'; const sp1 = fxSprite(o.col ? fxRGB(o.col) : '210,255,120');
    for (let i = 0; i < n; i++) {
      const x0 = R(), y0 = R(), ph = R() * 6.28, f = .15 + R() * .25, bl = 1 + R() * 2, r = 5 + R() * 7;
      const x = bx + fxFrac(x0 + Math.sin(t * f * sp + ph) * .06 + t * .004 * sp) * bw, y = by + fxFrac(y0 + Math.cos(t * f * 1.3 * sp + ph) * .05) * bh, k = Math.pow(Math.max(0, Math.sin(t * bl + ph)), 2);
      ctx.globalAlpha = a * (.15 + .85 * k); ctx.drawImage(sp1, x - r * 2, y - r * 2, r * 4, r * 4);
    }
  } else if (kind === 'embers') {
    ctx.globalCompositeOperation = 'lighter'; const s1 = fxSprite('255,140,50'), s2 = fxSprite('255,214,120');
    for (let i = 0; i < n; i++) {
      const x0 = R(), v = (.04 + R() * .08) * sp, ph = R(), u = fxFrac(ph + t * v), x = bx + fxFrac(x0 + Math.sin(t * 1.4 + ph * 20) * .02 + u * .08) * bw, y = by + bh * (1 - u), r = 2 + R() * 3.5, fl = .6 + .4 * Math.sin(t * 15 + i * 3);
      ctx.globalAlpha = a * Math.sin(u * Math.PI) * fl; ctx.drawImage(u < .5 ? s2 : s1, x - r * 2, y - r * 2, r * 4, r * 4);
    }
  } else if (kind === 'dust') {
    ctx.globalCompositeOperation = 'lighter'; const s1 = fxSprite(o.col ? fxRGB(o.col) : '255,240,210');
    for (let i = 0; i < n; i++) {
      const x0 = R(), y0 = R(), v = (.008 + R() * .02) * sp, ph = R() * 6.28, r = 1.2 + R() * 3.2, x = bx + fxFrac(x0 + t * v + Math.sin(t * .4 + ph) * .01) * bw, y = by + fxFrac(y0 - t * v * .5 + Math.cos(t * .5 + ph) * .01) * bh;
      ctx.globalAlpha = a * (.12 + .4 * (.5 + .5 * Math.sin(t * 1.3 + ph))) * (r / 4 + .3); ctx.drawImage(s1, x - r * 2, y - r * 2, r * 4, r * 4);
    }
  } else if (kind === 'starrain') {
    const cols = ['255,150,215', '120,220,255', '255,230,140', '255,255,255', '190,150,255'];
    for (let i = 0; i < n; i++) {
      const x = bx + R() * bw, v = (320 + R() * 700) * sp, L = 30 + R() * 110, ph = R(), c = cols[(R() * 5) | 0], lw = 1 + R() * 1.6, y = by + fxFrac(ph + t * v / (bh + 200)) * (bh + 200) - 100;
      ctx.strokeStyle = `rgba(${c},${.5 * a})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x, y - L); ctx.lineTo(x, y); ctx.stroke(); ctx.strokeStyle = `rgba(255,255,255,${.5 * a})`; ctx.lineWidth = lw * .5; ctx.beginPath(); ctx.moveTo(x, y - L * .3); ctx.lineTo(x, y); ctx.stroke();
    }
  } else if (kind === 'petals') {
    const cols = ['#ffd0e4', '#ff9ec8', '#fff0f6', '#ffb8d8'];
    for (let i = 0; i < n; i++) {
      const x0 = R(), v = (.04 + R() * .06) * sp, ph = R(), u = fxFrac(ph + t * v), x = bx + fxFrac(x0 + Math.sin(t * .8 + ph * 20) * .06 + u * .1) * bw, y = by - 30 + u * (bh + 60), r = 5 + R() * 6, rot = t * (1 + R() * 2) + ph * 9;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, .5 + .5 * Math.cos(t * 2 + ph * 11)); ctx.globalAlpha = a * .9; ctx.fillStyle = cols[(R() * 4) | 0]; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .55, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  } else if (kind === 'confettiStars') {
    const cols = ['#ff6ab8', '#35d6ff', '#ffd23f', '#ffffff', '#a98cff', '#6dff9c'];
    for (let i = 0; i < n; i++) {
      const x0 = R(), v = (.07 + R() * .12) * sp, ph = R(), u = fxFrac(ph + t * v), x = bx + fxFrac(x0 + Math.sin(t * 1.2 + ph * 20) * .03) * bw, y = by - 20 + u * (bh + 40), r = 3 + R() * 6, ty = R() < .35, c = cols[(R() * 6) | 0];
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * (2 + R() * 3) + ph * 9); ctx.globalAlpha = a; ctx.fillStyle = c;
      if (ty) wrSpark(ctx, 0, 0, r * 1.5, 1); else { ctx.scale(1, Math.cos(t * 4 + ph * 13)); ctx.fillRect(-r, -r * .5, r * 2, r); } ctx.restore();
    }
  }
  ctx.restore();
}

/* ---------- linhas de velocidade ---------- */
function fxSpeed(ctx, t, o = {}) {
  const n = o.n || 60, col = o.col || '#fff', a = o.a == null ? .7 : o.a, f = Math.floor(t * (o.fps || 18)), R = rng((o.seed || 5) * 131 + f * 17);
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = a;
  if ((o.kind || 'radial') === 'radial') {
    const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy, r0 = o.r0 || 200, r1 = o.r1 || 1000, th = o.thick || 7;
    for (let i = 0; i < n; i++) {
      const ang = R() * TAU, ca = Math.cos(ang), sa = Math.sin(ang), d0 = r0 * (1 + R() * .9), d1 = r1 * (.65 + R() * .6), w = .5 + R() * th * .5;
      ctx.beginPath(); ctx.moveTo(cx + ca * d0, cy + sa * d0); ctx.lineTo(cx + ca * d1 - sa * w, cy + sa * d1 + ca * w); ctx.lineTo(cx + ca * d1 + sa * w, cy + sa * d1 - ca * w); ctx.fill();
    }
  } else {
    const ang = o.ang || 0, ca = Math.cos(ang), sa = Math.sin(ang);
    ctx.translate(W / 2, H / 2); ctx.rotate(ang);
    for (let i = 0; i < n; i++) { const y = (R() - .5) * 1700, x = (R() - .5) * 2000, L = 160 + R() * 700, h = 1 + R() * (o.thick || 4); ctx.beginPath(); ctx.moveTo(x - L / 2, y); ctx.lineTo(x + L / 2, y - h * .4); ctx.lineTo(x + L / 2, y + h * .4); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
}
function fxShock(ctx, x, y, t0, t, o = {}) {
  const dur = o.dur || .7, u = (t - t0) / dur; if (u < 0 || u > 1) return;
  const col = o.col ? fxRGB(o.col) : '255,236,190', r = lerp(16, o.R || 520, E.out3(u)), th = (1 - u) * (o.w || 44) + 2, k = 1 - u;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, r * .2, r, [[0, `rgba(${col},0)`], [.85, `rgba(${col},${.1 * k})`], [1, `rgba(${col},${.3 * k})`]]); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = `rgba(${col},${.18 * k})`; ctx.lineWidth = th * 2.4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = `rgba(${col},${.8 * k})`; ctx.lineWidth = th; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = `rgba(255,255,255,${.95 * k})`; ctx.lineWidth = Math.max(1.5, th * .25); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  const R = rng(Math.floor(t0 * 100) + 3); ctx.fillStyle = `rgba(255,255,255,${.8 * k})`;
  for (let i = 0; i < 14; i++) { const ang = R() * TAU, rr = r * (.6 + R() * .5), L = 20 + R() * 40 * k; ctx.save(); ctx.translate(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); ctx.rotate(ang); ctx.fillRect(0, -1, L, 2); ctx.restore(); }
  ctx.restore();
}
function fxFog(ctx, y0, y1, col, a, t) {
  const c = fxRGB(col), h = y1 - y0, sp1 = fxSprite(c);
  ctx.save(); ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, `rgba(${c},0)`], [.5, `rgba(${c},${a * .7})`], [1, `rgba(${c},0)`]]); ctx.fillRect(0, y0, W, h);
  ctx.globalAlpha = a * .5; const R = rng(Math.floor(y0) * 7 + 3);
  for (let i = 0; i < 7; i++) { const w = 460 + R() * 300, x = ((R() * (W + w) + t * (8 + R() * 14) * (i % 2 ? 1 : -1)) % (W + w) + (W + w)) % (W + w) - w / 2, y = y0 + h * (.25 + R() * .5); ctx.drawImage(sp1, x - w / 2, y - h * .6, w, h * 1.2); }
  ctx.restore();
}
function fxLightCone(ctx, x, y, ang, len, w, col, a = .4) {
  const c = fxRGB(col), ca = Math.cos(ang), sa = Math.sin(ang), ex = x + ca * len, ey = y + sa * len, nx = -sa, ny = ca;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lg(ctx, x, y, ex, ey, [[0, `rgba(${c},${a})`], [.5, `rgba(${c},${a * .4})`], [1, `rgba(${c},0)`]]);
  ctx.beginPath(); ctx.moveTo(x + nx * w * .06, y + ny * w * .06); ctx.lineTo(ex + nx * w / 2, ey + ny * w / 2); ctx.lineTo(ex - nx * w / 2, ey - ny * w / 2); ctx.lineTo(x - nx * w * .06, y - ny * w * .06); ctx.closePath(); ctx.fill();
  ctx.restore();
}
let _fxVig;
function fxVignette(ctx, s = .5, col = '0,0,0') {
  const key = s + col, cv = ctx.canvas;
  if (!_fxVig || _fxVig.key !== key) { const c = document.createElement('canvas'); c.width = 360; c.height = 640; const g = c.getContext('2d'); g.fillStyle = rg(g, 180, 320, 120, 420, [[0, `rgba(${col},0)`], [.6, `rgba(${col},${s * .35})`], [1, `rgba(${col},${s})`]]); g.fillRect(0, 0, 360, 640); c.key = key; _fxVig = c; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(_fxVig, 0, 0, cv.width, cv.height); ctx.restore();
}
function fxHeartbeat(ctx, t, o = {}) {
  const bpm = o.bpm || 72, p = fxFrac(t * bpm / 60), k = Math.max(Math.exp(-Math.pow((p - .04) / .05, 2)), .7 * Math.exp(-Math.pow((p - .22) / .05, 2))), a = o.a == null ? 1 : o.a;
  if (o.draw === false) return k;
  const x = o.x == null ? W / 2 : o.x, y = o.y == null ? H / 2 : o.y, R = o.R || 380, col = o.col ? fxRGB(o.col) : '255,194,71';
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, R * (.6 + k * .5), [[0, `rgba(${col},${.4 * k * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - R * 1.2, y - R * 1.2, R * 2.4, R * 2.4);
  ctx.strokeStyle = `rgba(${col},${.5 * k * a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R * (.15 + (1 - k) * .25), 0, TAU); ctx.stroke();
  ctx.restore(); return k;
}
function fxImpact(ctx, t0, t, o = {}) {
  const dur = o.dur || .14, u = (t - t0) / dur; if (u < 0 || u > 1) return;
  const ph = Math.floor(u * 3), inv = ph % 2 === 0, x = o.x == null ? W / 2 : o.x, y = o.y == null ? H / 2 : o.y, R = rng(ph * 31 + 5);
  ctx.save(); ctx.fillStyle = inv ? '#fff' : '#000'; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.fillStyle = inv ? '#000' : '#fff';
  for (let i = 0; i < 110; i++) { const ang = R() * TAU, d0 = 80 + R() * 260, d1 = 1500, w = .004 + R() * .016, ca = Math.cos(ang), sa = Math.sin(ang); ctx.beginPath(); ctx.moveTo(x + ca * d0, y + sa * d0); ctx.lineTo(x + Math.cos(ang - w) * d1, y + Math.sin(ang - w) * d1); ctx.lineTo(x + Math.cos(ang + w) * d1, y + Math.sin(ang + w) * d1); ctx.fill(); }
  ctx.fillStyle = rg(ctx, x, y, 0, 280, [[0, inv ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'], [1, inv ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)']]); ctx.fillRect(x - 280, y - 280, 560, 560);
  ctx.restore();
}
let _fxScan;
function fxCRT(ctx, t, a = .5) {
  const cv = ctx.canvas; if (!_fxScan) { _fxScan = document.createElement('canvas'); _fxScan.width = 4; _fxScan.height = 4; const g = _fxScan.getContext('2d'); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, 4, 1.4); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.fillStyle = ctx.createPattern(_fxScan, 'repeat'); ctx.fillRect(0, 0, cv.width, cv.height);
  const by = ((t * .25) % 1.3 - .15) * cv.height; ctx.globalAlpha = a * .25; ctx.fillStyle = lg(ctx, 0, by - 80, 0, by + 80, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.4)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, by - 80, cv.width, 160);
  ctx.restore();
}
function fxGlitch(ctx, t, a = 1, seed = 1) {
  if (a <= 0) return; const cv = ctx.canvas, S = _fxSc(cv.width, cv.height), g = S.getContext('2d'); g.clearRect(0, 0, S.width, S.height); g.drawImage(cv, 0, 0);
  const R = rng(Math.floor(t * 20) * 13 + seed), k = cv.width / 720; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 6; i++) { const sy = R() * cv.height, sh = (8 + R() * 60) * k, dx = (R() - .5) * 80 * k * a; ctx.drawImage(S, 0, sy, cv.width, sh, dx, sy, cv.width, sh); }
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35 * a; for (let i = 0; i < 2; i++) { const sy = R() * cv.height, sh = (4 + R() * 14) * k; ctx.fillStyle = i ? '#00ffff' : '#ff00aa'; ctx.fillRect(0, sy, cv.width, sh); }
  ctx.restore();
}
function fxRainStars(ctx, t, o = {}) {
  const a = o.a == null ? .7 : o.a; fxParticles(ctx, t, 'starrain', { x: 0, y: 0, w: W, h: H }, { n: o.n || 70, seed: o.seed || 4, a, speed: o.speed || 1 });
  if (typeof shootingStar === 'function') { shootingStar(ctx, t, 1, { period: 3.1, dur: .3, a: a, col: '255,255,255', len: 300 }); shootingStar(ctx, t, 6, { period: 4.3, dur: .3, a: a, col: '255,200,255', len: 260 }); }
}
