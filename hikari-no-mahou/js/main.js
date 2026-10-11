'use strict';
/* ============================================================
   main.js — linha do tempo: cenas, cortes, flashes de impacto e player
   ============================================================ */
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const SC = parseFloat(new URLSearchParams(location.search).get('s') || '1.5');
cv.width = W * SC; cv.height = H * SC;
window.ready = (async () => {
  const fams = ['Bangers', 'Lilita One', 'Dela Gothic One', 'Zen Antique', 'Permanent Marker'];
  const jp = '光の中で踊ろう魔法はまだ消えていない星が導く信じてあなたの夢は本物だよ炎';
  await Promise.all(fams.map(f => document.fonts.load(`40px "${f}"`, 'ÁÉÍÓÚÃÕÇáéíóúãõç ' + jp)));
  await document.fonts.load('40px "Noto Color Emoji"', '✂️🦗🔒💸😴✨💃'); await document.fonts.ready; makeNebula();
})();

const SCENES = [
  { t0: 0, t1: 2.92, fn: () => sceneIntro },
  { t0: 2.92, t1: 4.80, fn: () => sceneWake },
  { t0: 4.80, t1: 5.92, fn: () => sceneWeight },
  { t0: 5.92, t1: 7.17, fn: () => sceneBills },
  { t0: 7.17, t1: 8.92, fn: () => sceneFridge },
  { t0: 8.92, t1: 10.90, fn: () => (typeof sceneStreet !== 'undefined' ? sceneStreet : null) },
  { t0: 10.90, t1: 11.92, fn: () => (typeof sceneShard !== 'undefined' ? sceneShard : null) },
  { t0: 11.92, t1: 14.92, fn: () => (typeof sceneFaith !== 'undefined' ? sceneFaith : null) },
  { t0: 14.92, t1: 17.35, fn: () => (typeof sceneHikari !== 'undefined' ? sceneHikari : null) },
  { t0: 17.35, t1: 21.10, fn: () => (typeof sceneDrop !== 'undefined' ? sceneDrop : null) },
  { t0: 21.10, t1: 23.80, fn: () => (typeof sceneMagic !== 'undefined' ? sceneMagic : null) },
  { t0: 23.80, t1: 26.90, fn: () => (typeof sceneStars !== 'undefined' ? sceneStars : null) },
  { t0: 26.90, t1: 30.60, fn: () => (typeof sceneFinale !== 'undefined' ? sceneFinale : null) },
];
/* impactos globais (quadro invertido / flash / tremor) sincronizados com a música */
const IMPACTS = [
  { t: 5.19, d: .07, type: 'invert' },
  { t: 14.36, d: .09, type: 'invert' },
];
function renderFrame(t) {
  ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const s = SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1], fn = s.fn();
  ctx.save();
  if (fn) fn(ctx, t, t - s.t0, s.t1 - s.t0); else { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
  overlay(ctx, t);
  for (const im of IMPACTS) if (t >= im.t && t < im.t + im.d) { if (im.type === 'invert') invert(ctx); }
  grain(ctx, t, .07);
}
window.renderFrame = renderFrame;

/* ---- player em tempo real (abra index.html no navegador) ---- */
if (!new URLSearchParams(location.search).get('render')) {
  const aud = document.getElementById('aud'), play = document.getElementById('play'), seek = document.getElementById('seek'), tt = document.getElementById('tt');
  let playing = false, t0 = 0, base = 0;
  const draw = t => { renderFrame(t); seek.value = t; tt.textContent = t.toFixed(2); };
  const loop = () => { if (playing) { const t = Math.min(30.6, aud.currentTime); draw(t); if (t >= 30.6) { playing = false; play.textContent = '▶ Play'; } requestAnimationFrame(loop); } };
  play.onclick = () => { if (playing) { aud.pause(); playing = false; play.textContent = '▶ Play'; } else { if (aud.currentTime >= 30.5) aud.currentTime = 0; aud.play(); playing = true; play.textContent = '⏸ Pause'; loop(); } };
  seek.oninput = () => { aud.currentTime = +seek.value; draw(+seek.value); };
  window.ready.then(() => draw(0));
}
