'use strict';
/* ============================================================
   overlay.js — título "LUZ NA PERIFERIA", legendas em caixa de grafite rasgada (PT, palavra a palavra),
   karaokê japonês com romaji e pílula de tradução, golpes de kanji e marca de rodapé. (vertical 720×1280)
   ============================================================ */
const GR = { gold: ['#fff6c8', '#ffc94a', '#ff9a2e'], pink: ['#fff0fa', '#ff8fd0', '#c45bff'], ice: ['#ffffff', '#a8ecff', '#35b8ff'], yel: ['#fffbd0', '#ffe14a', '#ffb300'], vio: ['#f6f0ff', '#c0a8ff', '#7b52ff'] };
const KEY = { /* palavra-chave → cor */ pesado: '#ff4b5c', conta: '#ffd23f', pagar: '#ffd23f', geladeira: '#38d9ff', metade: '#ffd23f', rua: '#ffd23f', escola: '#38d9ff', 'obrigação': '#ffd23f', 'mãe': '#ff7ad0', pai: '#c0a8ff', vento: '#38d9ff', peso: '#ffd23f',
  louco: '#ff4b5c', acreditar: '#ffd23f', 'fé': '#ffd23f', roubar: '#ff4b5c', periferia: '#38d9ff', fim: '#ff4b5c', partida: '#ffd23f', cicatriz: '#ff4b5c', peito: '#ff7ad0', vida: '#ffd23f', escuro: '#38d9ff', 'saída': '#ffd23f',
  'caí': '#38d9ff', reerguer: '#ffd23f', sozinho: '#38d9ff', rede: '#ffd23f', apoio: '#ffd23f', destino: '#ffd23f', 'céu': '#38d9ff', sinal: '#38d9ff', nunca: '#ff4b5c', tracei: '#ffd23f', caminho: '#ffd23f', meio: '#ffd23f' };
const STRIKE = { fim: true };
const F_SUB = s => `800 ${s}px "Barlow Condensed","Bangers","Arial Narrow",sans-serif`;
const F_MONO = s => `700 ${s}px "Space Mono",monospace`;
const F_BIG = s => `${s}px "Anton","Barlow Condensed",sans-serif`;
const F_JP = s => `${s}px "Dela Gothic One","Zen Antique",sans-serif`;

function ovMeasure(ctx, font, str, ls = 0) { ctx.save(); ctx.font = font; if (ls) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(str).width; ctx.restore(); return w; }

/* caixa de grafite: paralelogramo escuro com borda vermelha rasgada */
function graffBox(ctx, x0, y0, x1, y1, prog, seed) {
  const r = rng(seed), w = (x1 - x0) * prog, sk = 14;
  if (w < 4) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, y0 - 20, w + 40, y1 - y0 + 60); ctx.clip();
  const tear = (xx, yy, dx, dy, n, amp) => { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([xx + dx * u + (r() - .5) * amp * (i % 2 ? 1 : .3), yy + dy * u + (r() - .5) * amp * (i % 2 ? .3 : 1)]); } return pts; };
  // sombra/vermelho atrás
  ctx.fillStyle = '#ff3b4e'; ctx.beginPath(); ctx.moveTo(x0 + sk + 5, y0 + 5); ctx.lineTo(x1 + 6, y0 + 5); tear(x1 + 6, y0 + 5, -sk, y1 - y0, 14, 9).forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(x0 + 5, y1 + 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(8,8,18,.9)'; ctx.beginPath(); ctx.moveTo(x0 + sk, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1 - sk, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fill();
  // bordas rasgadas (esq/dir) e pinceladas
  ctx.strokeStyle = 'rgba(255,59,78,.9)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); tear(x1 - 2, y0, -sk, y1 - y0, 16, 7).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  ctx.beginPath(); tear(x0 + sk + 2, y0, -sk, y1 - y0, 12, 5).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  ctx.fillStyle = '#ff3b4e'; for (let i = 0; i < 3; i++) { const dx = x0 + 40 + r() * (x1 - x0 - 80); ctx.beginPath(); ctx.ellipse(dx, y1 + 2 + r() * 4, 2.2, 6 + r() * 9, 0, 0, TAU); ctx.fill(); } // pingos de tinta
  ctx.restore();
}
/* uma linha da letra em PT */
function ptLine(ctx, t, line, idx) {
  const tin = line.words[0][1] - .10, tout = line.t1 + .12; if (t < tin || t > tout) return;
  const size = 58, maxW = 600, items = line.words.map(([w, t0]) => { const key = w.toLowerCase().replace(/[.,!?…—;:()]/g, ''), str = w.toUpperCase(); return { str, t0, key, col: KEY[key] || null, w: ovMeasure(ctx, F_SUB(size), str, 1) + 15 }; });
  const rows = [[]]; let cur = 0; items.forEach(it => { if (cur + it.w > maxW && rows[rows.length - 1].length) { rows.push([]); cur = 0; } rows[rows.length - 1].push(it); cur += it.w; });
  const rowH = 66, bw = Math.min(660, Math.max(...rows.map(r => r.reduce((a, b) => a + b.w, 0))) + 84), vis = 1 + rows.slice(1).reduce((a, r) => a + E.out3(seg(t, r[0].t0 - .1, r[0].t0 + .18)), 0), bh = vis * rowH + 40, y1 = 1168, y0 = y1 - bh, cx = W / 2;
  const fade = 1 - seg(t, line.t1 - .04, tout), pin = E.out5(seg(t, tin, tin + .18)), yo = (1 - pin) * 30;
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(0, yo);
  graffBox(ctx, cx - bw / 2, y0, cx + bw / 2, y1, pin, 100 + idx * 13);
  rows.forEach((row, ri) => {
    const rw = row.reduce((a, b) => a + b.w, 0); let x = cx - rw / 2 + 4;
    row.forEach(it => {
      const tl = t - it.t0;
      if (tl >= -.02) {
        const sc = E.back(seg(tl, 0, .2)), y = y1 - 20 - (rows.length - ri) * rowH + rowH / 2 + 3 + (rows.length - vis) * rowH, hot = tl >= 0 && tl < .28 ? 1 - tl / .28 : 0;
        ctx.save(); ctx.translate(x + it.w / 2 - 7, y); ctx.scale(sc * (1 + hot * .12), sc * (1 + hot * .12)); ctx.rotate(it.col ? Math.sin(it.t0 * 9) * .018 : 0);
        ctx.font = F_SUB(it.col ? size * 1.08 : size); ctx.letterSpacing = '1px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (it.col) { ctx.shadowColor = it.col; ctx.shadowBlur = 16 + hot * 14; }
        ctx.fillStyle = it.col || '#fff'; ctx.fillText(it.str, 0, 0); ctx.shadowBlur = 0;
        if (hot > 0) { ctx.globalAlpha *= hot * .6; ctx.fillStyle = '#fff'; ctx.fillText(it.str, 0, 0); }
        ctx.restore();
        if (STRIKE[it.key]) { const k = seg(tl, .1, .35); ctx.save(); ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 2, y + 8); ctx.lineTo(x - 2 + (it.w - 8) * k, y - 8 - 6 * k); ctx.stroke(); ctx.restore(); }
      }
      x += it.w;
    });
  });
  // sublinhado de tinta vermelha que se estende conforme as palavras entram
  const last = items[items.length - 1], prog = clamp((t - items[0].t0) / Math.max(.4, last.t0 - items[0].t0 + .3)); ctx.strokeStyle = '#ff3b4e'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - bw / 2 + 36, y1 - 9); ctx.quadraticCurveTo(cx, y1 - 5, cx - bw / 2 + 36 + (bw - 90) * prog, y1 - 11); ctx.stroke();
  ctx.restore();
}
/* karaokê japonês: caracteres acendem; romaji; pílula de tradução */
function jpLine(ctx, t, line, i, o = {}) {
  const tin = line.t0 - .15, tout = line.t1 + .35; if (t < tin || t > tout) return;
  const size = line.chars.length > 9 ? 56 : 66, y = 1010, fade = 1 - seg(t, line.t1 + .05, tout), ap = E.out5(seg(t, tin, tin + .3));
  ctx.save(); ctx.font = F_JP(size); const ws = line.chars.map(c => ctx.measureText(c.c).width), tot = ws.reduce((a, b) => a + b, 0); ctx.restore();
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(0, (1 - ap) * 40);
  let x = W / 2 - tot / 2;
  line.chars.forEach((c, k) => {
    const t1 = line.chars[k + 1] ? line.chars[k + 1].t0 : line.t1, on = t >= c.t0, cur = on && t < Math.max(t1, c.t0 + .25), pulse = cur ? 1.16 - .16 * seg(t, c.t0, c.t0 + .25) : 1;
    ctx.save(); ctx.translate(x + ws[k] / 2, y - (on ? Math.sin(Math.min(1, (t - c.t0) / .25) * Math.PI) * 12 : 0)); ctx.scale(pulse, pulse);
    ctx.font = F_JP(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * .2; ctx.strokeStyle = '#1b0f3a'; ctx.strokeText(c.c, 0, 0);
    ctx.shadowColor = on ? (o.glow || '#ff8fd0') : 'transparent'; ctx.shadowBlur = cur ? 30 : on ? 14 : 0;
    ctx.fillStyle = on ? lg(ctx, 0, -size * .5, 0, size * .5, [[0, '#fff'], [.45, o.c1 || '#ffc2ee'], [1, o.c2 || '#c45bff']]) : 'rgba(255,255,255,.5)'; ctx.fillText(c.c, 0, 0); ctx.restore();
    x += ws[k];
  });
  ctx.font = F_MONO(15); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '4px'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(10,6,30,.9)'; ctx.strokeText(line.romaji, W / 2, y + size * .78); ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillText(line.romaji, W / 2, y + size * .78);
  if (!o.noPill) { // pílula de tradução
    ctx.letterSpacing = '2px'; const pf = F_SUB(24), pw = ovMeasure(ctx, pf, line.pt, 2) + 52, ph = 40, py = y + size * 1.28, sc = E.back(seg(t, line.t0, line.t0 + .3));
    ctx.save(); ctx.translate(W / 2, py); ctx.scale(sc, sc); rrect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = lg(ctx, -pw / 2, 0, pw / 2, 0, [[0, '#6a3df0'], [1, '#b44dff']]); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.font = pf; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(line.pt, 0, 2); ctx.restore();
  }
  ctx.restore();
}
function kanji(ctx, t, t0, str, x, y, grad, size = 190, dur = .95) {
  if (t < t0 || t > t0 + dur) return; const tl = t - t0, sc = E.back(seg(tl, 0, .25)), a = 1 - seg(tl, dur - .28, dur);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(-.04); ctx.font = F_JP(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * .12; ctx.strokeStyle = '#1b0f3a'; ctx.strokeText(str, 0, 0); ctx.shadowColor = grad[1]; ctx.shadowBlur = 50; ctx.fillStyle = lg(ctx, 0, -size * .5, 0, size * .5, grad.map((c, i) => [i / (grad.length - 1), c])); ctx.fillText(str, 0, 0); ctx.restore();
  if (tl < .6) for (let i = 0; i < 9; i++) { const an = i / 9 * TAU + .4, d = 230 * E.out3(tl / .6); sparkle(ctx, x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 15 * (1 - tl / .6), an, '#fff'); }
}
/* título */
function titleCard(ctx, t) {
  const t0 = .5, t1 = 11.6; if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .5) * (1 - seg(t, t1 - 1.1, t1)); ctx.save(); ctx.globalAlpha = a;
  const flick = 1 + (t > 2.2 && t < 2.5 ? Math.sin(t * 90) * .06 : 0), sweep = (t - t0 - .6) / 1.4;
  const draw = (str, font, x, y, fill, o = {}) => { ctx.save(); ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; if (o.ls) ctx.letterSpacing = o.ls + 'px'; ctx.lineJoin = 'round';
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.gb || 40; } if (o.stroke) { ctx.lineWidth = o.sw || 8; ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); } ctx.shadowBlur = o.glow ? (o.gb || 40) * .5 : 0; ctx.fillStyle = fill; ctx.fillText(str, x, y); ctx.restore(); };
  const xL = 64, e1 = E.out5(seg(t, t0, t0 + .7)), e2 = E.out5(seg(t, t0 + .35, t0 + 1.05)), e3 = E.out5(seg(t, t0 + .6, t0 + 1.3));
  ctx.save(); ctx.translate((1 - e1) * -260, 0); draw('LUZ', F_BIG(250), xL, 330, lg(ctx, 0, 130, 0, 330, [[0, '#fff0a0'], [.5, '#ffc528'], [1, '#ff8a1e']]), { glow: '#ffb300', gb: 50 * flick }); ctx.restore();
  ctx.save(); ctx.translate((1 - e2) * -260, 0); draw('NA', F_BIG(66), xL + 6, 408, '#fff', { glow: '#fff', gb: 14, ls: 6 }); ctx.restore();
  ctx.save(); ctx.translate((1 - e3) * -330, 0); draw('PERIFERIA', F_BIG(112), xL, 506, '#fff', { glow: '#ffc247', gb: 22, ls: 2 }); ctx.restore();
  const e4 = seg(t, t0 + 1.4, t0 + 2); if (e4 > 0) { ctx.globalAlpha = a * e4; draw('SMASHER64', F_MONO(20), xL + 4, 560, 'rgba(255,255,255,.55)', { ls: 9 }); }
  // brilho que varre o título
  if (sweep > 0 && sweep < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = lerp(0, 560, sweep); ctx.fillStyle = lg(ctx, sx - 60, 0, sx + 60, 0, [[0, 'rgba(255,230,160,0)'], [.5, 'rgba(255,240,200,.55)'], [1, 'rgba(255,230,160,0)']]); ctx.fillRect(xL, 120, 600, 460); ctx.restore(); }
  ctx.restore();
}
function overlay(ctx, t) {
  ctx.save();
  titleCard(ctx, t);
  LY_PT.forEach((ln, i) => ptLine(ctx, t, ln, i));
  LY_JP.forEach((ln, i) => jpLine(ctx, t, ln, i, ln.t0 > 61 ? { noPill: t > 64.3 } : {}));
  // "SEU SONHO É REAL" em destaque (como no original) durante 'honmono da yo'
  if (t > 64.4 && t < 67.0) { const tl = t - 64.4, sc = E.back(seg(tl, 0, .3)), a = 1 - seg(t, 66.7, 67.0);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 1122); ctx.scale(sc, sc); ctx.rotate(-.025); ctx.font = F_BIG(70); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#1b0f3a'; ctx.strokeText('SEU SONHO É REAL', 0, 0);
    ctx.shadowColor = '#ffc528'; ctx.shadowBlur = 30; ctx.fillStyle = lg(ctx, 0, -35, 0, 35, [[0, '#fff6a8'], [1, '#ffb300']]); ctx.fillText('SEU SONHO É REAL', 0, 0); ctx.restore(); }
  kanji(ctx, t, 44.3, '光', W / 2, 330, GR.gold, 210, .9); kanji(ctx, t, 49.9, '魔法', W / 2, 330, GR.pink, 200, 1.0); kanji(ctx, t, 55.98, '星', W / 2, 330, GR.vio, 210, .95); kanji(ctx, t, 65.6, '夢', W / 2, 330, GR.gold, 220, 1.0);
  // marca de rodapé
  if (t > .3 && t < 79.6) { ctx.globalAlpha = .5 * seg(t, .3, 1.2) * (1 - seg(t, 78.8, 79.6)); ctx.font = F_MONO(12); ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('LUZ NA PERIFERIA  ·  SMASHER64', W / 2, 1252); }
  ctx.restore();
}
