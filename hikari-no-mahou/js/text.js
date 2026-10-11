'use strict';
/* ============================================================
   text.js — tipografia cinética, etiquetas engraçadas, karaokê
   ============================================================ */
const FONTS = {
  comic: '"Bangers","Lilita One","Noto Color Emoji",sans-serif',
  fat: '"Lilita One","Bangers","Noto Color Emoji",sans-serif',
  jp: '"Dela Gothic One","Zen Antique","IPAGothic",sans-serif',
  brush: '"Zen Antique","Dela Gothic One","IPAGothic",serif',
  hand: '"Permanent Marker","Noto Color Emoji",cursive',
};
const C = { yellow: '#ffd23f', pink: '#ff4f9a', cyan: '#35d6ff', red: '#ff3b4e', gold: '#ffc94a', white: '#ffffff', ink: '#14122a', green: '#6dff9c', violet: '#a98cff' };

/* texto com contorno grosso, extrusão (sombra dura) e brilho */
function txt(ctx, str, x, y, o = {}) {
  const size = o.size || 80, sc = o.sc == null ? 1 : o.sc;
  if (sc <= 0.001 || (o.a != null && o.a <= 0)) return;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.scale(sc * (o.sx || 1), sc * (o.sy || 1)); if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
  ctx.font = `${size}px ${o.font || FONTS.comic}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.globalAlpha = o.a == null ? 1 : o.a;
  if (o.letterSpacing) ctx.letterSpacing = o.letterSpacing + 'px';
  const sw = o.sw == null ? size * .13 : o.sw;
  if (o.ext) { // extrusão
    ctx.fillStyle = o.extCol || '#14122a'; ctx.strokeStyle = o.extCol || '#14122a'; ctx.lineWidth = sw;
    for (let i = o.ext; i > 0; i -= 1.5) { ctx.strokeText(str, i * .8, i); ctx.fillText(str, i * .8, i); }
  }
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowB || size * .4; }
  if (sw > 0) { ctx.lineWidth = sw; ctx.strokeStyle = o.stroke || '#14122a'; ctx.strokeText(str, 0, 0); }
  ctx.shadowBlur = 0;
  let fill = o.fill || '#fff';
  if (Array.isArray(fill)) fill = lg(ctx, 0, -size * .5, 0, size * .5, fill.map((c, i) => [i / (fill.length - 1), c]));
  ctx.fillStyle = fill; ctx.fillText(str, 0, 0);
  ctx.restore();
}
function textW(ctx, str, size, font) { ctx.save(); ctx.font = `${size}px ${font || FONTS.comic}`; const w = ctx.measureText(str).width; ctx.restore(); return w; }

/* palavra que "pula" na tela em t0 e sai em t1 */
function word(ctx, t, t0, t1, str, x, y, o = {}) {
  if (t < t0 || t > t1) return;
  const tl = t - t0, d = o.d || .22;
  let sc = (o.sc == null ? 1 : o.sc) * E.back(seg(tl, 0, d)), a = 1, rot = o.rot || 0;
  if (o.wiggle) rot += Math.sin(t * 14) * o.wiggle;
  if (o.wobY) y += Math.sin(t * 9 + (o.ph || 0)) * o.wobY;
  const out = seg(t, t1 - .12, t1); sc *= 1 - out * .3; a = 1 - out;
  if (o.slam) { sc *= 1 + (1 - E.out3(seg(tl, 0, .18))) * o.slam; }
  let dx = 0, dy = 0; if (o.shake && tl < .4) { const s = shakeV(t, o.shake * (1 - tl / .4), 40, 3); dx = s[0]; dy = s[1]; }
  txt(ctx, str, x + dx, y + dy, { ...o, sc, a, rot });
}
/* etiqueta "post-it" com fita adesiva — legendas de humor */
function tag(ctx, t, t0, t1, str, x, y, o = {}) {
  if (t < t0 || t > t1) return;
  const tl = t - t0, size = o.size || 34, font = o.font || FONTS.hand, rot = (o.rot == null ? -.05 : o.rot) + Math.sin(t * 5 + x) * .012;
  const w = textW(ctx, str, size, font) + size * 1.1, h = size * 1.7, sc = E.back(seg(tl, 0, .28)) * (1 - seg(t, t1 - .15, t1) * .4), a = 1 - seg(t, t1 - .15, t1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = o.paper || '#fff8d6'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = rgba(o.tape || '#ff9ac1', .8); ctx.save(); ctx.translate(0, -h / 2); ctx.rotate(.04); ctx.fillRect(-34, -11, 68, 24); ctx.restore();
  ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.ink || '#2a2540'; ctx.fillText(str, 0, 3);
  ctx.restore();
}
/* balão de fala de quadrinho */
function bubble(ctx, t, t0, t1, str, x, y, o = {}) {
  if (t < t0 || t > t1) return;
  const tl = t - t0, size = o.size || 38, font = o.font || FONTS.comic, w = textW(ctx, str, size, font) + size * 1.2, h = size * 1.6;
  const sc = E.back(seg(tl, 0, .22)) * (1 - seg(t, t1 - .1, t1)); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(o.rot || 0);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#14122a'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
  const tx = o.tail || [0, 1]; ctx.beginPath(); ctx.moveTo(-14 + tx[0] * 10, h / 2 - 3); ctx.lineTo(tx[0] * 40, h / 2 + 30); ctx.lineTo(16 + tx[0] * 10, h / 2 - 3); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.fillRect(-14 + tx[0] * 10, h / 2 - 6, 30, 5);
  ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.ink || '#14122a'; ctx.fillText(str, 0, 2);
  ctx.restore();
}
/* faixa de título "estilo OP" (barra inclinada com texto) */
function ribbon(ctx, t, t0, t1, str, x, y, o = {}) {
  if (t < t0 || t > t1) return;
  const tl = t - t0, size = o.size || 46, w = textW(ctx, str, size, o.font || FONTS.fat) + size * 1.6, h = size * 1.5;
  const p = E.out5(seg(tl, 0, .3)), a = 1 - seg(t, t1 - .15, t1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -.04); ctx.globalAlpha = a; ctx.beginPath(); ctx.rect(-w / 2, -h, w, h * 2); ctx.clip();
  ctx.translate((1 - p) * -w, 0);
  ctx.transform(1, 0, -.25, 1, 0, 0); ctx.fillStyle = o.bg || '#14122a'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = o.bar || C.yellow; ctx.fillRect(-w / 2, -h / 2, 12, h); ctx.fillRect(w / 2 - 6, -h / 2, 6, h);
  ctx.transform(1, 0, .25, 1, 0, 0); ctx.font = `${size}px ${o.font || FONTS.fat}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.col || '#fff'; ctx.fillText(str, 0, 3);
  ctx.restore();
}

/* ---------- karaokê: japonês + romaji + tradução ---------- */
function karaoke(ctx, t, line, y, o = {}) {
  const size = o.size || 74, gap = o.gap || 0, chars = line.chars, tIn = line.t0 - .12, tOut = line.t1 + .25;
  if (t < tIn || t > tOut) return;
  ctx.save(); ctx.font = `${size}px ${FONTS.jp}`;
  const ws = chars.map(c => ctx.measureText(c.c).width + gap), total = ws.reduce((a, b) => a + b, 0);
  const appear = E.out3(seg(t, tIn, tIn + .3)), fade = 1 - seg(t, line.t1 + .05, tOut);
  let x = W / 2 - total / 2; ctx.globalAlpha = fade;
  ctx.translate(0, (1 - appear) * 40);
  chars.forEach((c, i) => {
    const t1 = c.t1 || (chars[i + 1] ? chars[i + 1].t0 : line.t1), on = t >= c.t0, cur = t >= c.t0 && t < Math.max(t1, c.t0 + .22);
    const k = on ? E.back(seg(t, c.t0, c.t0 + .18)) : 0, pulse = cur ? 1.18 - .18 * seg(t, c.t0, c.t0 + .25) : 1;
    ctx.save(); ctx.translate(x + ws[i] / 2, y - (on ? Math.sin(Math.min(1, (t - c.t0) / .25) * Math.PI) * 14 : 0)); ctx.scale(pulse, pulse);
    ctx.font = `${size}px ${FONTS.jp}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = size * .16; ctx.strokeStyle = '#14122a'; ctx.strokeText(c.c, 0, 0);
    if (on) { ctx.shadowColor = o.glow || '#ffb347'; ctx.shadowBlur = cur ? 30 : 12; }
    ctx.fillStyle = on ? lg(ctx, 0, -size * .5, 0, size * .5, [[0, '#fff6c8'], [1, o.col || '#ffc94a']]) : 'rgba(255,255,255,.88)'; ctx.fillText(c.c, 0, 0);
    ctx.restore(); x += ws[i];
  });
  ctx.restore();
  // romaji
  ctx.save(); ctx.globalAlpha = fade * appear; ctx.font = `${size * .36}px ${FONTS.fat}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '3px';
  ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeStyle = '#14122a'; ctx.strokeText(line.romaji, W / 2, y + size * .72); ctx.fillStyle = '#fff'; ctx.fillText(line.romaji, W / 2, y + size * .72);
  // tradução
  if (line.pt) {
    const sc = E.back(seg(t, line.t0, line.t0 + .3)); ctx.translate(W / 2, y + size * 1.28); ctx.scale(sc, sc); ctx.rotate(Math.sin(t * 4) * .012 - .01);
    ctx.font = `${size * .46}px ${FONTS.comic}`; ctx.letterSpacing = '1.5px'; ctx.lineWidth = size * .12; ctx.strokeStyle = '#14122a'; ctx.strokeText(line.pt, 0, 0); ctx.fillStyle = o.ptCol || C.cyan; ctx.fillText(line.pt, 0, 0);
  }
  ctx.restore();
}
const LYRICS_JP = [
  { t0: 17.35, t1: 20.9, romaji: 'HIKARI NO NAKA DE ODOROU', pt: 'VAMOS DANÇAR DENTRO DA LUZ!', chars: [{ c: '光', t0: 17.35 }, { c: 'の', t0: 18.34 }, { c: '中', t0: 18.76 }, { c: 'で', t0: 19.26 }, { c: '踊', t0: 19.84 }, { c: 'ろ', t0: 20.30 }, { c: 'う', t0: 20.55 }] },
  { t0: 21.1, t1: 23.7, romaji: 'MAHOU WA MADA KIETE INAI', pt: 'A MÁGICA AINDA NÃO SE APAGOU!', chars: [{ c: '魔', t0: 21.10 }, { c: '法', t0: 21.34 }, { c: 'は', t0: 21.58 }, { c: 'ま', t0: 21.74 }, { c: 'だ', t0: 21.98 }, { c: '消', t0: 22.22 }, { c: 'え', t0: 22.64 }, { c: 'て', t0: 22.86 }, { c: 'い', t0: 23.08 }, { c: 'な', t0: 23.34 }, { c: 'い', t0: 23.56 }] },
  { t0: 23.8, t1: 26.75, romaji: 'HOSHI GA MICHIBIKU — SHINJITE', pt: 'AS ESTRELAS GUIAM... ACREDITE!', chars: [{ c: '星', t0: 23.80 }, { c: 'が', t0: 24.36 }, { c: '導', t0: 24.74 }, { c: 'く', t0: 25.16 }, { c: '信', t0: 25.84 }, { c: 'じ', t0: 26.20 }, { c: 'て', t0: 26.46 }] },
  { t0: 26.94, t1: 29.9, romaji: 'ANATA NO YUME WA HONMONO DA YO', pt: 'O SEU SONHO É DE VERDADE!', chars: [{ c: 'あ', t0: 26.94 }, { c: 'な', t0: 27.24 }, { c: 'た', t0: 27.40 }, { c: 'の', t0: 27.54 }, { c: '夢', t0: 27.78 }, { c: 'は', t0: 28.00 }, { c: '本', t0: 28.32 }, { c: '物', t0: 28.82 }, { c: 'だ', t0: 29.18 }, { c: 'よ', t0: 29.46 }] },
];
