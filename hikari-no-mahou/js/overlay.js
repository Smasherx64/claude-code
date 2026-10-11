'use strict';
/* ============================================================
   overlay.js — TODAS as legendas: letra (PT cinética + JP karaokê), humor, créditos e título
   ============================================================ */
const GRAD_GOLD = ['#fff6c8', '#ffc94a', '#ff9a2e'], GRAD_PINK = ['#fff0fa', '#ff8fd0', '#ff4fa0'], GRAD_ICE = ['#ffffff', '#9fe8ff', '#35b8ff'], GRAD_RED = ['#fff2f0', '#ff6a5c', '#e01e3c'], GRAD_YEL = ['#fffbd0', '#ffe14a', '#ffb300'];
const LYRIC_HIKARI = { t0: 14.94, t1: 17.3, romaji: 'HIKARI GA KOKO NI ARU', pt: 'A LUZ ESTÁ AQUI!', chars: [{ c: '光', t0: 14.94 }, { c: 'が', t0: 15.58 }, { c: 'こ', t0: 16.16 }, { c: 'こ', t0: 16.32 }, { c: 'に', t0: 16.48 }, { c: 'あ', t0: 16.72 }, { c: 'る', t0: 16.95 }] };

/* palavra que despenca e quica no chão */
function dropWord(ctx, t, t0, t1, str, x, yEnd, o = {}) {
  if (t < t0 || t > t1) return; const tl = t - t0, f = E.bounce(clamp(tl / .55));
  const y = lerp(-160, yEnd, f), sq = tl > .3 && tl < .55 ? 1 + .12 * Math.sin((tl - .3) / .25 * Math.PI) : 1;
  const a = 1 - seg(t, t1 - .12, t1); txt(ctx, str, x, y, { ...o, a, sy: sq, sx: 1 / Math.sqrt(sq) });
}
/* palavra cortada ao meio que se afasta (metade) */
function splitWord(ctx, t, t0, t1, str, x, y, o = {}) {
  if (t < t0 || t > t1) return; const tl = t - t0, size = o.size || 120, sc = E.back(seg(tl, 0, .22)), d = E.out3(seg(tl, .35, .8)) * 46, a = 1 - seg(t, t1 - .12, t1);
  const w = textW(ctx, str, size) + 60;
  const yL = xx => y + (xx - x) * -.12;
  for (const half of [0, 1]) {
    ctx.save(); ctx.beginPath();
    if (!half) { ctx.moveTo(x - w, y - 400); ctx.lineTo(x + w, y - 400); ctx.lineTo(x + w, yL(x + w)); ctx.lineTo(x - w, yL(x - w)); }
    else { ctx.moveTo(x - w, yL(x - w)); ctx.lineTo(x + w, yL(x + w)); ctx.lineTo(x + w, y + 400); ctx.lineTo(x - w, y + 400); }
    ctx.closePath(); ctx.clip();
    txt(ctx, str, x + (half ? d : -d), y + (half ? d * .3 : -d * .3), { ...o, sc, a }); ctx.restore();
  }
}
/* palavra que balança (louco) */
function wobbleWord(ctx, t, t0, t1, str, x, y, o = {}) {
  if (t < t0 || t > t1) return; const tl = t - t0, n = str.length, size = o.size || 150; ctx.save(); ctx.font = `${size}px ${FONTS.comic}`; const ws = [...str].map(c => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0); ctx.restore();
  let cx = x - tot / 2; const a = 1 - seg(t, t1 - .12, t1);
  [...str].forEach((c, i) => { const sc = E.back(seg(tl, i * .04, i * .04 + .2)); txt(ctx, c, cx + ws[i] / 2, y + Math.sin(t * 12 + i * 1.3) * 12, { ...o, sc, a, rot: Math.sin(t * 9 + i) * .18 }); cx += ws[i]; });
}
function sparkleBurst(ctx, x, y, t, t0, n = 8, R = 120, col = '#fff3c0') { const u = t - t0; if (u < 0 || u > .6) return; for (let i = 0; i < n; i++) { const a = i / n * TAU + .3, d = R * E.out3(u / .6); sparkle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 16 * (1 - u / .6), a, col); } }

function overlay(ctx, t) {
  const O = (...a) => word(ctx, t, ...a), T = (...a) => tag(ctx, t, ...a);
  ctx.save();
  /* ---------- INTRO: créditos de abertura ---------- */
  if (t < 2.9) {
    const a = seg(t, .4, .9) * (1 - seg(t, 2.5, 2.85));
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a; txt(ctx, '光の魔法', 150, 560, { size: 84, font: FONTS.brush, align: 'left', fill: GRAD_GOLD, glow: '#ffb347', sw: 6, ext: 0 });
      txt(ctx, 'HIKARI NO MAHOU  ·  A MAGIA DA LUZ', 154, 612, { size: 26, font: FONTS.fat, align: 'left', sw: 5, letterSpacing: 3 }); ctx.restore();
    }
    T(1.2, 2.8, '♪ Shonen Heartbreak', 1060, 120, { size: 30, rot: .04, paper: '#e8e8f2', tape: '#9aa1ff' });
  }
  /* ---------- VERSO (rap PT) ---------- */
  // 1. acordar
  O(2.92, 4.80, 'ACORDO', 330, 60, { size: 84, fill: GRAD_YEL, sw: 10, ext: 6, extCol: '#c43a00', rot: -.03, shake: 6 });
  O(3.48, 4.80, 'CEDO', 640, 60, { size: 84, fill: GRAD_YEL, sw: 10, ext: 6, extCol: '#c43a00', rot: .02, shake: 6 });
  O(3.88, 4.80, 'SOL', 360, 664, { size: 112, fill: GRAD_YEL, sw: 12, ext: 7, extCol: '#e05a00', glow: '#ffd23f', glowB: 50, slam: .6, shake: 10 });
  O(4.04, 4.80, 'NA', 560, 668, { size: 70, fill: '#fff', sw: 9, ext: 5, rot: -.05 });
  O(4.28, 4.80, 'CARA!', 790, 660, { size: 128, fill: GRAD_RED, sw: 12, ext: 8, extCol: '#7a0e22', glow: '#ff6a3c', glowB: 40, slam: .8, shake: 14, rot: -.04 });
  T(3.2, 4.7, '05h47... o corre já começou ⏰', 1010, 570, { size: 29, rot: .05 });
  // 2. peso
  O(4.82, 5.92, 'MAIS', 190, 100, { size: 76, fill: '#fff', sw: 10, ext: 5, rot: -.06 });
  O(4.88, 5.92, 'UM', 330, 112, { size: 76, fill: '#fff', sw: 10, ext: 5, rot: .02 });
  O(5.06, 5.92, 'DIA', 470, 100, { size: 92, fill: GRAD_ICE, sw: 11, ext: 6, rot: -.03 });
  dropWord(ctx, t, 5.16, 5.92, 'PESADO', 640, 628, { size: 190, fill: ['#d9dbe3', '#7b8090', '#3e4252'], sw: 14, ext: 12, extCol: '#12101f', rot: -.04 });
  T(5.45, 5.9, 'peso da vida: +1000 kg', 1020, 150, { size: 28, rot: .05 });
  // 3. contas
  O(6.00, 7.17, 'CONTA', 300, 120, { size: 128, fill: GRAD_YEL, sw: 13, ext: 8, extCol: '#8a4a00', slam: .7, shake: 10, rot: -.05 });
  O(6.52, 7.17, 'PRA', 560, 112, { size: 80, fill: '#fff', sw: 10, ext: 6, rot: .03 });
  O(6.68, 7.17, 'PAGAR!', 860, 126, { size: 150, fill: GRAD_RED, sw: 14, ext: 9, extCol: '#5a0a1a', slam: .8, shake: 12, rot: .04 });
  T(6.4, 7.1, 'tudo vence hoje 💸', 1050, 300, { size: 28, rot: -.04 });
  // 4. geladeira
  O(7.02, 7.17, 'A', 120, 120, { size: 70, fill: '#fff', sw: 9 });
  O(7.18, 8.92, 'GELADEIRA', 340, 118, { size: 118, fill: GRAD_ICE, sw: 12, ext: 8, extCol: '#0b3a6a', slam: .5, shake: 8, rot: -.04 });
  O(7.82, 8.92, 'PELA', 270, 232, { size: 84, fill: '#fff', sw: 10, ext: 6, rot: .03 });
  splitWord(ctx, t, 8.12, 8.92, 'METADE', 360, 340, { size: 128, fill: GRAD_PINK, sw: 13, ext: 8, extCol: '#6a0a44', rot: -.05 });
  T(8.5, 8.9, 'o resto? só no sonho 😮‍💨', 1010, 540, { size: 27, rot: .05 });
  // 5. rua
  O(8.96, 10.9, 'ME', 110, 70, { size: 76, fill: '#fff', sw: 10, ext: 5, rot: -.05 });
  O(9.36, 10.9, 'CHAMAM', 300, 78, { size: 92, fill: '#fff', sw: 11, ext: 6, rot: .02 });
  O(9.66, 10.9, 'DE', 530, 70, { size: 70, fill: '#fff', sw: 9, ext: 5 });
  wobbleWord(ctx, t, 9.96, 10.9, 'LOUCO!', 760, 150, { size: 170, fill: GRAD_PINK, sw: 14, ext: 9, extCol: '#5a0a44' });
  if (t > 9.96 && t < 10.9) emoji(ctx, '🤪', 1010, 80 + Math.sin(t * 9) * 10, 70, Math.sin(t * 7) * .3, seg(t, 9.96, 10.1));
  O(10.22, 10.98, 'POR', 200, 650, { size: 68, fill: '#fff', sw: 9, ext: 5 });
  O(10.58, 10.98, 'AINDA', 380, 646, { size: 80, fill: '#fff', sw: 10, ext: 5, rot: -.03 });
  T(10.3, 10.9, '(ele: acreditando 😌)', 330, 250, { size: 26, rot: -.05 });
  // 6. esfera na palma — ACREDITAR
  O(10.98, 11.92, 'ACREDITAR', 640, 118, { size: 150, fill: GRAD_GOLD, sw: 13, ext: 8, extCol: '#7a3a00', glow: '#ffc94a', glowB: 70, slam: .8, shake: 8 });
  T(11.4, 11.9, 'fé.exe carregando... 🙏', 640, 640, { size: 28, rot: -.03 });
  // 7. fé que ninguém rouba
  O(11.84, 14.92, 'MAS', 120, 80, { size: 80, fill: '#fff', sw: 10, ext: 5, rot: -.06 });
  O(12.36, 14.92, 'A', 215, 100, { size: 70, fill: '#fff', sw: 9, ext: 5 });
  O(12.60, 14.92, 'FÉ', 355, 118, { size: 190, fill: GRAD_GOLD, sw: 14, ext: 10, extCol: '#7a3a00', glow: '#ffc94a', glowB: 60, slam: .9, shake: 12, rot: -.05 });
  O(12.70, 14.92, 'É', 150, 620, { size: 66, fill: '#fff', sw: 9, ext: 5 });
  O(12.98, 14.92, 'A ÚNICA', 340, 626, { size: 80, fill: '#fff', sw: 10, ext: 6, rot: -.02 });
  O(13.22, 14.92, 'COISA', 580, 630, { size: 92, fill: GRAD_ICE, sw: 11, ext: 6, rot: .02 });
  O(13.52, 14.92, 'QUE', 960, 90, { size: 66, fill: '#fff', sw: 9, ext: 5 });
  O(13.84, 14.92, 'NÃO', 1110, 118, { size: 92, fill: GRAD_RED, sw: 11, ext: 6, rot: .04 });
  O(14.00, 14.92, 'DÁ', 1040, 205, { size: 80, fill: '#fff', sw: 10, ext: 5 });
  O(14.22, 14.92, 'PRA', 1150, 215, { size: 78, fill: '#fff', sw: 10, ext: 5 });
  O(14.36, 14.92, 'ROUBAR!', 640, 330, { size: 250, fill: GRAD_RED, sw: 18, ext: 14, extCol: '#2a0610', glow: '#ff3b4e', glowB: 70, slam: 1.2, shake: 26, rot: -.07 });
  T(14.62, 14.92, 'tentou, não rolou 💅', 640, 560, { size: 30, rot: -.04 });
  /* ---------- PRÉ-REFRÃO ---------- */
  karaoke(ctx, t, LYRIC_HIKARI, 92, { size: 70, col: '#ffc94a', ptCol: C.cyan });
  /* ---------- REFRÃO (JP + kawaii) ---------- */
  const JP = [LYRICS_JP[0], LYRICS_JP[1], LYRICS_JP[2], LYRICS_JP[3]], ys = [596, 596, 596, 590];
  JP.forEach((l, i) => karaoke(ctx, t, l, ys[i], { size: 72, col: '#ff8fd0', glow: '#ffffff', ptCol: i % 2 ? '#fff2a8' : '#8ff0ff' }));
  T(17.7, 19.5, 'TRANSFORMAÇÃO!! ✨💖', 1030, 150, { size: 32, rot: .05, paper: '#ffe3f4', tape: '#ff9ac1' });
  if (t > 17.35 && t < 18.3) sparkleBurst(ctx, W / 2, 300, t, 17.35, 14, 420, '#fff');
  // 魔法 slam
  if (t >= 21.1 && t < 22.1) { const tl = t - 21.1, sc = E.back(seg(tl, 0, .25)), a = 1 - seg(t, 21.85, 22.1); txt(ctx, '魔法', 640, 190, { size: 230, font: FONTS.brush, fill: GRAD_PINK, glow: '#ffffff', glowB: 70, sw: 14, sc, a, rot: -.04, ext: 8, extCol: '#6a1a5a' }); sparkleBurst(ctx, 640, 190, t, 21.1, 12, 360, '#fff'); }
  T(22.0, 23.6, 'mágica: ainda ligada 🔮 (spoiler)', 990, 170, { size: 28, rot: .05, paper: '#f2e6ff', tape: '#b49aff' });
  T(24.4, 26.4, 'até os vizinhos entraram na dança 💃', 330, 170, { size: 28, rot: -.05, paper: '#ffe3f4', tape: '#ff9ac1' });
  O(25.84, 26.9, 'ACREDITA!', 990, 120, { size: 118, fill: GRAD_GOLD, sw: 13, ext: 7, extCol: '#7a3a00', glow: '#ffc94a', glowB: 50, slam: .7, shake: 8, rot: .04 });
  // あなたの夢 → SEU SONHO É REAL
  O(27.20, 28.95, 'VOCÊ!', 300, 250, { size: 200, fill: GRAD_YEL, sw: 16, ext: 10, extCol: '#8a2a00', slam: 1, shake: 14, rot: -.07 });
  T(27.55, 28.6, '(sim, você aí 👈)', 330, 390, { size: 30, rot: -.05 });
  O(27.78, 28.95, 'SEU SONHO', 470, 90, { size: 96, fill: '#fff', sw: 11, ext: 6, rot: .02 });
  O(28.32, 28.95, 'É REAL!', 930, 100, { size: 140, fill: GRAD_PINK, sw: 14, ext: 9, extCol: '#6a0a44', glow: '#ff8fd0', glowB: 50, slam: .8, shake: 10, rot: -.03 });
  // título final
  if (t > 28.95) {
    const tl = t - 28.95, sc = E.back(seg(tl, 0, .35)), a = 1 - seg(t, 30.3, 30.6);
    txt(ctx, '光の魔法', 640, 112, { size: 130, font: FONTS.brush, fill: GRAD_GOLD, glow: '#ffb347', glowB: 60, sw: 10, ext: 7, extCol: '#5a2a00', sc, a, rot: -.02 });
    txt(ctx, 'HIKARI NO MAHOU', 640, 190, { size: 34, font: FONTS.fat, sw: 7, letterSpacing: 6, sc, a });
    ribbon(ctx, t, 29.2, 30.4, 'SHONEN HEARTBREAK', 640, 245, { size: 30, rot: -.02, bar: '#ff8fd0' });
  }
  ctx.restore();
}
