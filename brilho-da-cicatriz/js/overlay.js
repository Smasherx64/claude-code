'use strict';
/* ============================================================
   overlay.js — título, letra PT (cinética), karaokê JP, etiquetas de humor, cartão final
   (dados vêm de lyrics.js; ferramentas de texto vêm de text.js)
   ============================================================ */
const G_GOLD = ['#fff6c8', '#ffc94a', '#ff9a2e'], G_PINK = ['#fff0fa', '#ff8fd0', '#ff4fa0'], G_ICE = ['#ffffff', '#a8ecff', '#35b8ff'], G_RED = ['#fff2f0', '#ff6a5c', '#e01e3c'], G_MINT = ['#f4fff6', '#8dffb6', '#1fc46e'], G_VIO = ['#f6f0ff', '#c0a8ff', '#7b52ff'];
/* palavras-chave que ganham destaque (minúsculas, sem pontuação) → [gradiente, escala] */
const EMPH = {
  pesado: [G_RED, 1.7], metade: [G_ICE, 1.6], conta: [G_GOLD, 1.3], rua: [G_GOLD, 1.4], escola: [G_ICE, 1.5], 'obrigação': [G_RED, 1.5], 'sobreviver': [G_GOLD, 1.3],
  'mãe': [G_PINK, 1.5], dobrado: [G_GOLD, 1.5], pai: [G_VIO, 1.4], vento: [G_ICE, 1.6], peso: [G_RED, 1.5], movimento: [G_GOLD, 1.2], louco: [G_PINK, 1.7], acreditar: [G_GOLD, 1.5],
  'fé': [G_GOLD, 2.0], roubar: [G_RED, 1.9], 'periferia': [G_GOLD, 1.5], partida: [G_GOLD, 1.7], cicatriz: [G_GOLD, 1.8], peito: [G_PINK, 1.3], vida: [G_GOLD, 1.7], escuro: [G_VIO, 1.6], 'saída': [G_GOLD, 1.8],
  'caí': [G_RED, 1.6], reerguer: [G_GOLD, 1.5], sozinho: [G_VIO, 1.6], rede: [G_GOLD, 1.5], apoio: [G_GOLD, 1.5], destino: [G_VIO, 1.5], 'céu': [G_ICE, 1.6], sinal: [G_ICE, 1.6], nunca: [G_RED, 1.4],
  caminho: [G_GOLD, 1.7], tracei: [G_GOLD, 1.4], sorte: [G_MINT, 1.5], mover: [G_GOLD, 1.6], casa: [G_PINK, 1.5], oferecer: [G_GOLD, 1.4], 'depende': [G_PINK, 1.3], acredita: [G_GOLD, 1.3],
  luta: [G_RED, 1.6], pausa: [G_ICE, 1.3], fim: [G_GOLD, 1.6], quebrada: [G_GOLD, 1.7], cerca: [G_ICE, 1.6], sonho: [G_PINK, 1.7], queda: [G_RED, 1.4], 'lição': [G_GOLD, 1.4], dor: [G_RED, 1.4], real: [G_GOLD, 2.0],
};
/* etiquetas de humor/poesia (por índice de linha em LY_PT) */
const TAGS = [
  ['5h00 da matina… quem inventou a manhã? ⏰', 'wake'], ['boletos: 12 · saldo: 0 💸', 'bills'], ['escola da rua: matrícula grátis 📚', 'rua'], ['troféu de “sobreviver”: ainda no correio 🏆', 'trofeu'],
  ['mãe: 2 turnos, 0 folgas 💛', 'mae'], ['(ele foi com o vento 🪁)', 'pai'], ['mochila invisível: 100 kg 🎒', 'peso'], ['(ela, acreditando mesmo assim 😌)', 'louco'],
  ['fé: inroubável 🔒✨', 'fe'], ['📍 você está aqui → ponto de partida', 'mapa'], ['cada cicatriz = 1 estrela ⭐', 'cic'], ['apagão… mas a luz tá aqui dentro 💡', 'apagao'],
  ['queda nº 1… 2… 3… e levantei 🙌', 'queda'], ['rede de apoio: erro 404 🕸️', 'rede'], ['📶 sem sinal (do celular e do céu)', 'sinal'], ['GPS próprio: ligado 🧭', 'gps'],
  ['sorte? não: constância 🍀➡️💪', 'sorte'], ['chegou com pão e dignidade 🥖', 'pao'], ['plateia: mãe e irmãozinho 💛', 'plateia'], ['round da vida: ∞ 🥊', 'luta'],
  ['(lanterninha da esperança: ligada 🔦)', 'lanterna'], ['cerca? não conheço 🚧➡️🌌', 'cerca'], ['formatura: diploma = cicatrizes 🎓', 'formatura'],
];
const _zone = i => (i % 2 === 0 ? 'bottom' : 'top');

/* ---------- uma linha da letra em português: palavras pulando uma a uma, com quebra automática ---------- */
function ptLine(ctx, t, line, idx) {
  const tin = line.words[0][1] - .05, tout = line.t1 + .45;
  if (t < tin || t > tout) return;
  const baseSize = idx % 5 === 3 ? 64 : 58, maxW = 1140, zone = _zone(idx);
  // medir e quebrar
  const items = line.words.map(([w, t0]) => {
    const key = w.toLowerCase().replace(/[.,!?…—;:()]/g, ''), em = EMPH[key], size = baseSize * (em ? em[1] : 1), str = w.toUpperCase();
    return { str, t0, size, grad: em ? em[0] : null, w: textW(ctx, str, size) + baseSize * .32 };
  });
  const rows = [[]]; let cur = 0;
  items.forEach(it => { if (cur + it.w > maxW && rows[rows.length - 1].length) { rows.push([]); cur = 0; } rows[rows.length - 1].push(it); cur += it.w; });
  const rowH = baseSize * 1.18, total = rows.length * rowH, y0 = zone === 'bottom' ? 700 - total : 28;
  const fade = 1 - seg(t, line.t1 + .05, tout);
  // véu escuro para legibilidade
  ctx.save(); ctx.globalAlpha = fade * seg(t, tin, tin + .2);
  const sy = zone === 'bottom' ? 700 - total - 50 : 0, sh = total + 80;
  ctx.fillStyle = lg(ctx, 0, zone === 'bottom' ? sy : sh, 0, zone === 'bottom' ? sy + sh : 0, [[0, 'rgba(8,8,22,0)'], [1, 'rgba(8,8,22,.62)']]); ctx.fillRect(0, sy, W, sh);
  ctx.restore();
  rows.forEach((row, ri) => {
    const rw = row.reduce((a, b) => a + b.w, 0); let x = W / 2 - rw / 2;
    row.forEach(it => {
      const tl = t - it.t0; if (tl >= 0) {
        const sc = E.back(seg(tl, 0, it.grad ? .26 : .2)), cy = y0 + ri * rowH + rowH / 2 + (it.grad ? Math.sin(t * 6 + x) * 2 : 0);
        const slam = it.grad && tl < .2 ? (1 - tl / .2) * .35 : 0, sh2 = it.grad && tl < .3 ? shakeV(t, 7 * (1 - tl / .3), 40, Math.floor(x)) : [0, 0];
        txt(ctx, it.str, x + it.w / 2 + sh2[0], cy + sh2[1], { size: it.size, fill: it.grad || '#fff', sw: it.size * .16, ext: it.grad ? it.size * .09 : it.size * .06, extCol: '#1a1030', glow: it.grad ? it.grad[1] : null, glowB: it.size * .5, sc: sc * (1 + slam), a: fade, rot: (idx % 2 ? -1 : 1) * .012 * (x % 3 - 1) });
      }
      x += it.w;
    });
  });
}
function funTag(ctx, t, line, idx) {
  const tg = TAGS[idx]; if (!tg) return;
  const t0 = line.words[Math.min(2, line.words.length - 1)][1] + .1, t1 = line.t1 + .2; if (t < t0 || t > t1) return;
  const zone = _zone(idx) === 'bottom' ? 'top' : 'bottom', side = (idx * 37) % 3, x = [330, 640, 950][side], y = zone === 'top' ? 168 : 520;
  tag(ctx, t, t0, t1, tg[0], x, y, { size: 29, rot: ((idx % 3) - 1) * .05, paper: ['#fff8d6', '#ffe3f4', '#e6f6ff', '#e9ffe6'][idx % 4], tape: ['#ff9ac1', '#9aa1ff', '#8ddcff', '#ffd36b'][idx % 4] });
}
function kanjiSlam(ctx, t, t0, str, x, y, grad, size = 220, dur = .95) {
  if (t < t0 || t > t0 + dur) return; const tl = t - t0, sc = E.back(seg(tl, 0, .25)), a = 1 - seg(tl, dur - .25, dur);
  txt(ctx, str, x, y, { size, font: FONTS.brush, fill: grad, glow: '#ffffff', glowB: 70, sw: size * .06, sc, a, ext: size * .035, extCol: '#4a1a5a', rot: -.03 });
  if (tl < .6) for (let i = 0; i < 10; i++) { const an = i / 10 * TAU + .3, d = 330 * E.out3(tl / .6); sparkle(ctx, x + Math.cos(an) * d, y + Math.sin(an) * d * .6, 18 * (1 - tl / .6), an, '#fff'); }
}
function hype(ctx, t, t0, t1, str, x, y, grad, size, o = {}) { word(ctx, t, t0, t1, str, x, y, { size, fill: grad, sw: size * .13, ext: size * .07, extCol: '#2a1030', glow: grad[1], glowB: size * .4, slam: .8, shake: 10, rot: o.rot || -.04 }); }

/* ---------- título "O BRILHO DA CICATRIZ" (intro) ---------- */
function titleCard(ctx, t) {
  const t0 = 4.6, t1 = 10.9; if (t < t0 || t > t1) return;
  const a = seg(t, t0, t0 + .6) * (1 - seg(t, t1 - .7, t1)); ctx.save(); ctx.globalAlpha = a;
  const lines = [['O BRILHO', 168, 118], ['DA CICATRIZ', 292, 118]], reveal = seg(t, t0 + .2, t0 + 2.3);
  lines.forEach(([s, y, size], li) => {
    ctx.save(); ctx.font = `${size}px ${FONTS.fat}`; const chars = [...s], ws = chars.map(c => ctx.measureText(c).width + 3), tot = ws.reduce((p, q) => p + q, 0); ctx.restore();
    let x = 240 - 0 + 0; x = 160;
    chars.forEach((c, i) => {
      const u = clamp(reveal * (s.length + 4) / s.length - i / s.length * .85 - li * .22), sc = E.back(clamp(u * 1.4));
      if (u > 0 && c !== ' ') txt(ctx, c, x + ws[i] / 2, y + (1 - E.out3(clamp(u * 1.6))) * 36, { size, font: FONTS.fat, fill: ['#ffffff', '#f2ead8'], sw: 0, sc, a: clamp(u * 3), glow: '#ffb347', glowB: 24, align: 'center' });
      x += ws[i];
    });
  });
  // rachadura dourada que atravessa o título
  const cr = seg(t, t0 + 1.4, t0 + 3.2); if (cr > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const r = rng(77), n = 11, pts = [];
    for (let i = 0; i <= n; i++) pts.push([150 + i / n * 660 + (r() - .5) * 20, 408 + (i % 2 ? -6 : 8) + (r() - .5) * 8]);
    for (const [w, c] of [[14, 'rgba(255,190,80,.35)'], [5, '#ffd36b'], [2, '#fff6d8']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => { if (i / n > cr) return; i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); }
    ctx.restore();
  }
  const sub = seg(t, t0 + 2.6, t0 + 3.2); if (sub > 0) { ctx.globalAlpha = a * sub; txt(ctx, 'CARTOGRAFIA DO IMPOSSÍVEL', 163, 440, { size: 30, font: FONTS.fat, align: 'left', sw: 6, letterSpacing: 7, fill: '#ffd98a' }); }
  ctx.restore();
}

function overlay(ctx, t) {
  ctx.save();
  // intro
  if (t > 1.2 && t < 4.4) tag(ctx, t, 1.4, 4.2, '♪ álbum: Cartografia do Impossível', 1010, 650, { size: 28, rot: .04, paper: '#e8e8f2', tape: '#9aa1ff' });
  titleCard(ctx, t);
  // verso PT
  LY_PT.forEach((ln, i) => { ptLine(ctx, t, ln, i); funTag(ctx, t, ln, i); });
  // karaokê JP (japonês + romaji + tradução)
  LY_JP.forEach((ln, i) => { const pre = ln.t0 < 36.05 && ln.t0 > 33 || ln.t0 === 72.0; karaoke(ctx, t, ln, 592, { size: 70, col: pre ? '#ffc94a' : '#ff8fd0', glow: pre ? '#ffb347' : '#ffffff', ptCol: i % 2 ? '#fff2a8' : '#8ff0ff' }); });
  // refrões: golpes de kanji e palavras de impacto
  [[38.78, '魔法'], [75.92, '魔法'], [105.2, '魔法']].forEach(([t0, s]) => kanjiSlam(ctx, t, t0, s, 640, 200, G_PINK));
  [[41.82, '星'], [109.32, '星']].forEach(([t0, s]) => kanjiSlam(ctx, t, t0, s, 640, 200, G_VIO, 210, .9));
  [[45.0, '夢'], [112.48, '夢'], [94.3, '夢']].forEach(([t0, s]) => kanjiSlam(ctx, t, t0, s, 640, 200, G_GOLD, 230, 1.0));
  kanjiSlam(ctx, t, 36.1, '光', 640, 200, G_GOLD, 230, .9); kanjiSlam(ctx, t, 73.4, '光', 640, 200, G_GOLD, 230, .9); kanjiSlam(ctx, t, 102.4, '光', 640, 200, G_GOLD, 240, .9);
  tag(ctx, t, 36.3, 38.6, 'TRANSFORMAÇÃO!! ✨💖', 1030, 150, { size: 32, rot: .05, paper: '#ffe3f4', tape: '#ff9ac1' });
  hype(ctx, t, 44.45, 47.9, 'VOCÊ!', 250, 240, G_YEL(), 170);
  hype(ctx, t, 45.6, 47.9, 'SEU SONHO É REAL!', 800, 120, G_PINK, 96, { rot: .03 });
  tag(ctx, t, 79.6, 81.9, 'mesmo doendo: um passo de cada vez 👣', 330, 168, { size: 28, rot: -.04, paper: '#e6f6ff', tape: '#8ddcff' });
  hype(ctx, t, 82.4, 85.2, 'VOCÊ NÃO ESTÁ SÓ!', 640, 118, G_GOLD, 100, { rot: -.02 });
  tag(ctx, t, 83.4, 85.4, 'rede de apoio: encontrada 🕸️✨', 1010, 200, { size: 28, rot: .05, paper: '#fff8d6', tape: '#ffd36b' });
  tag(ctx, t, 87.4, 90.6, '(respira. a luz continua aqui dentro 🌙)', 640, 160, { size: 30, rot: -.02, paper: '#e8e8f2', tape: '#9aa1ff' });
  hype(ctx, t, 101.2, 102.3, 'BRILHA MAIS!', 640, 150, G_GOLD, 120);
  hype(ctx, t, 111.9, 117.0, 'VOCÊ!', 250, 230, G_YEL(), 170);
  // última frase + cartão final
  const lastPT = LY_PT[LY_PT.length - 1];
  if (t >= 117.1 && t < 123.1) {
    const tl = t - 117.1, sc = E.back(seg(tl, 0, .4)), a = 1 - seg(t, 122.4, 123.0);
    txt(ctx, 'O SEU SONHO É REAL.', 640, 112, { size: 96, fill: G_GOLD, sw: 14, ext: 7, extCol: '#3a1a00', glow: '#ffc94a', glowB: 60, sc, a: a * seg(t, 117.1, 117.4) });
    const ec = seg(t, 119.4, 120.4); if (ec > 0) {
      ctx.save(); ctx.globalAlpha = ec * a; txt(ctx, 'O BRILHO DA CICATRIZ', 640, 598, { size: 66, font: FONTS.fat, fill: ['#ffffff', '#f2ead8'], sw: 0, glow: '#ffb347', glowB: 30, letterSpacing: 4 });
      txt(ctx, 'CARTOGRAFIA DO IMPOSSÍVEL', 640, 650, { size: 28, font: FONTS.fat, sw: 5, letterSpacing: 8, fill: '#ffd98a' });
      txt(ctx, 'animação feita em código · Claude Code', 640, 690, { size: 18, font: FONTS.fat, sw: 3, fill: '#c8c0d8', letterSpacing: 2 }); ctx.restore();
    }
  }
  ctx.restore();
}
function G_YEL() { return ['#fffbd0', '#ffe14a', '#ffb300']; }
