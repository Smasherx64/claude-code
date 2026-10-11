'use strict';
/* ============================================================
   main.js — junta as seções de cena (scenes_a..g), impactos globais e o player em tempo real
   Cada arquivo scenes_X.js define  SCENES_X = [{t0,t1,name,fn(ctx,t,L,D)}]  e (opcional)  IMPACTS_X = [{t,d,type:'invert'|'flash'|'white'}]
   ============================================================ */
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const SC = parseFloat(new URLSearchParams(location.search).get('s') || '1.5');
cv.width = W * SC; cv.height = H * SC;
window.ready = (async () => {
  const fams = ['Bangers', 'Lilita One', 'Dela Gothic One', 'Zen Antique', 'Permanent Marker', 'Anton'];
  const jp = '光がここにあるの中で踊ろう魔法はまだ消えていない星が導く信じてあなたの夢は本物だよ';
  await Promise.all(fams.map(f => document.fonts.load(`40px "${f}"`, 'ÁÉÍÓÚÃÕÇáéíóúãõç ' + jp)));
  await document.fonts.load('800 40px "Barlow Condensed"', 'ÁÉÍÓÚÃÕÇ'); await document.fonts.load('700 40px "Space Mono"', 'LUZ'); await document.fonts.load('40px "Noto Color Emoji"', '✂️🦗🔒💸😴✨💃⭐'); await document.fonts.ready;
  if (typeof initWorld === 'function') initWorld(); if (typeof fxWarm === 'function') fxWarm();
})();
const _g = n => { try { return (0, eval)(`typeof ${n} !== 'undefined' ? ${n} : []`); } catch (e) { return []; } }; // aceita const/let/var globais
const SCENES = [].concat(_g('SCENES_A'), _g('SCENES_B'), _g('SCENES_C'), _g('SCENES_D')).sort((a, b) => a.t0 - b.t0);
const IMPACTS = [].concat(_g('IMPACTS_A'), _g('IMPACTS_B'), _g('IMPACTS_C'), _g('IMPACTS_D'));
/* cobertura contínua? (aviso no console) */
(() => { let e = 0; for (const s of SCENES) { if (Math.abs(s.t0 - e) > .001 && e > 0) console.warn(`SCENES: buraco/sobreposição em ${e.toFixed(2)} -> ${s.t0.toFixed(2)} (${s.name || ''})`); e = s.t1; } if (SCENES.length && e < 79.9) console.warn('SCENES terminam em', e); })();
function renderFrame(t) {
  ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const s = SCENES.find(s => t >= s.t0 && t < s.t1);
  ctx.save();
  // punch-zoom na batida durante refrões e rap forte (linguagem de opening)
  const chorus = (t >= 49 && t < 66.7);
  if (chorus) { const z = 1 + .016 * beatInfo(t).pulse; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
  if (s) s.fn(ctx, t, t - s.t0, s.t1 - s.t0); else { ctx.fillStyle = '#16161c'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#555'; ctx.font = '28px sans-serif'; ctx.fillText('sem cena em t=' + t.toFixed(2), 40, 60); }
  ctx.restore();
  // corte de opening: flash + riscos de velocidade diagonais logo após cada troca de quadro
  if (s && s.t0 > .1) { const ct = t - s.t0; if (ct < .13) { const k = 1 - ct / .13; flash(ctx, .38 * k, chorus ? '255,246,232' : '255,255,255'); parallelLines(ctx, -.5, t, { n: 26, col: '#fff', a: .55 * k, seed: Math.floor(s.t0 * 10) }); } }
  overlay(ctx, t);
  for (const im of IMPACTS) if (t >= im.t && t < im.t + im.d) { if (im.type === 'invert') invert(ctx); else flash(ctx, 1 - (t - im.t) / im.d, im.type === 'white' ? '255,255,255' : '255,240,200'); }
  grain(ctx, t, .06);
}
window.renderFrame = renderFrame;
if (!new URLSearchParams(location.search).get('render')) {
  const aud = document.getElementById('aud'), play = document.getElementById('play'), seek = document.getElementById('seek'), tt = document.getElementById('tt');
  let playing = false;
  const draw = t => { renderFrame(t); seek.value = t; tt.textContent = t.toFixed(2); };
  const loop = () => { if (playing) { const t = Math.min(80, aud.currentTime); draw(t); if (t >= 80) { playing = false; play.textContent = '▶ Play'; } requestAnimationFrame(loop); } };
  play.onclick = () => { if (playing) { aud.pause(); playing = false; play.textContent = '▶ Play'; } else { if (aud.currentTime >= 79.9) aud.currentTime = 0; aud.play(); playing = true; play.textContent = '⏸ Pause'; loop(); } };
  seek.oninput = () => { aud.currentTime = +seek.value; draw(+seek.value); };
  window.ready.then(() => draw(0));
}
