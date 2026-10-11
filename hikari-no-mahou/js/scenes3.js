'use strict';
/* ============================================================
   scenes3.js — o refrão: drop, dança, magia, estrelas, final
   ============================================================ */
function colorWorld(ctx, t, camX, y0, o = {}) {
  drawNebula(ctx, -120, -120, W + 240, H + 240, { z: o.z || 1.15, ox: Math.sin(t * .3) * 80 + (o.ox || 0), oy: o.oy || 0 });
  ctx.fillStyle = `rgba(6,10,44,${o.dark == null ? .3 : o.dark})`; ctx.fillRect(-300, -300, W + 600, H + 600);
  drawCity(ctx, camX, y0, 1, { night: .55, lit: .3, t, fog: o.fog });
  streetGround(ctx, y0, 1);
}
function grayWorld(ctx, camX, y0) {
  drawSky(ctx, 0, 0, -300, y0); ctx.fillStyle = lg(ctx, 0, -300, 0, y0, [[0, '#8e96a1'], [1, '#e1e3e5']]); ctx.fillRect(-300, -300, W + 600, y0 + 300);
  drawCity(ctx, camX, y0, 0, { lit: .05 }); streetGround(ctx, y0, 0);
}
function magicCircle(ctx, x, y, R, t, a = 1, o = {}) {
  const col = o.col || '255,205,110'; ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const ring = (r, w, al) => { ctx.strokeStyle = `rgba(${col},${al * a})`; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); };
  ctx.fillStyle = rg(ctx, 0, 0, 0, R, [[0, `rgba(${col},${.35 * a})`], [1, `rgba(${col},0)`]]); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ring(R, 5, .95); ring(R * .93, 2, .8); ring(R * .64, 3, .9); ring(R * .4, 2, .8);
  ctx.save(); ctx.rotate(t * .5); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${col},${.9 * a})`; for (let i = 0; i < 72; i++) { const an = i / 72 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(an) * R * .955, Math.sin(an) * R * .955); ctx.lineTo(Math.cos(an) * R * (i % 6 ? .985 : 1.0), Math.sin(an) * R * (i % 6 ? .985 : 1.0)); ctx.stroke(); } ctx.restore();
  ctx.save(); ctx.rotate(-t * .35); const chars = '光魔法星夢信希望', n = chars.length; ctx.font = `${R * .13}px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = `rgba(${col},${.95 * a})`;
  for (let i = 0; i < n; i++) { ctx.save(); ctx.rotate(i / n * TAU); ctx.translate(0, -R * .79); ctx.fillText(chars[i], 0, 0); ctx.restore(); } ctx.restore();
  for (const [k, sg] of [[.62, 1], [.62, -1]]) { ctx.save(); ctx.rotate(t * .4 * sg); ctx.strokeStyle = `rgba(${col},${.85 * a})`; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 3; i++) { const an = i / 3 * TAU + (sg > 0 ? -Math.PI / 2 : Math.PI / 2); i ? ctx.lineTo(Math.cos(an) * R * k, Math.sin(an) * R * k) : ctx.moveTo(Math.cos(an) * R * k, Math.sin(an) * R * k); } ctx.closePath(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function cranesAround(ctx, t, cx, cy, n, rx, ry, seed = 3, sc = .38) {
  for (let i = 0; i < n; i++) { const a = t * .9 + i / n * TAU, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry * (.5 + .5 * Math.sin(i)); drawCrane(ctx, x, y, sc * (.7 + .3 * Math.sin(a)), t * 8 + i, { gold: i % 2 === 0, rot: Math.sin(a + 1.5) * .3, body: i % 2 ? '#fff6e6' : '#fff8ea' }); }
}

/* ---------- 9. DROP (17,35 – 21,10): "光の中で踊ろう" ---------- */
function sceneDrop(ctx, t, L, D) {
  const b = beatInfo(t), y0 = 640;
  const sub = L < 1.05 ? 0 : L < 2.3 ? 1 : L < 2.85 ? 2 : 3;
  if (sub === 0) {
    const z = 1 + b.pulse * .035 + (1 - E.out3(seg(L, 0, .5))) * .25;
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z, r: Math.sin(t * 2) * .01 });
    grayWorld(ctx, 0, y0);
    const bx = lerp(W + 260, -320, E.io2(seg(L, .08, .95)));
    ctx.save(); poly(ctx, [[bx, -100], [W + 400, -100], [W + 400, H + 100], [bx - 240, H + 100]]); ctx.clip(); colorWorld(ctx, t, 0, y0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; for (const [w, c] of [[26, 'rgba(255,190,80,.35)'], [8, '#ffd36b'], [3, '#fff6d8']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); const r = rng(Math.floor(t * 20)); for (let i = 0; i <= 14; i++) { const u = i / 14, x = lerp(bx, bx - 240, u) + (i % 2 ? 22 : -22) * (i > 0 && i < 14 ? 1 : 0) + (r() - .5) * 10, y = -100 + u * (H + 200); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } ctx.restore();
    drawSphere(ctx, W / 2, 300, 120, { shatter: E.out3(seg(L, 0, .9)), t });
    const pose = lerpPose(POSE.stand, POSE.Vup, E.out3(seg(L, .05, .4)));
    drawChar(ctx, W / 2, y0 + 62, 62, pose, { t: Math.floor(t * 12) / 12, wind: 1.8, face: { eye: 'happy', mouth: 'grin' } });
    flare(ctx, W / 2, 300, 1.4 * (1 - seg(L, .3, 1)) + .3, '255,200,120', 1 - seg(L, .4, 1), .9);
    ctx.restore();
    flash(ctx, 1 - E.out3(seg(L, 0, .3)), '255,246,222');
  } else if (sub === 1) {
    const camX = Math.sin(t * 1.3) * 140, z = 1.02 + b.pulse * .04;
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z, r: Math.sin(t * 1.6) * .03 });
    colorWorld(ctx, t, camX, y0);
    rays(ctx, W / 2, 330, t, { n: 12, a: .22, len: 1100, sp: .25 });
    magicCircle(ctx, W / 2, 330, 210, t, .25 + .2 * b.pulse);
    cranesAround(ctx, t, W / 2, 300, 8, 480, 220);
    const pose = dancePose(t); pose.scarfDir = -1;
    drawChar(ctx, W / 2, y0 + 78 - pose.bounce * 20, 70, pose, { t: Math.floor(t * 12) / 12, wind: 2, scarfLen: 4, face: { eye: 'happy', mouth: 'grin' }, hair: 0 });
    bokeh(ctx, t, 31, 14, ['#ffd36b', '#ff8fbd', '#7fd8ff'], { a: .5, rMin: 14, rMax: 50, sp: 20, dy: 1 });
    flare(ctx, W / 2, 360, .8 + b.pulse * .3, '255,200,140', .4, .6);
    ctx.restore();
    flash(ctx, seg(L, 1.05, 1.07) * (1 - seg(L, 1.07, 1.25)) * .8, '255,255,255');
  } else if (sub === 2) {
    const st = seg(L, 2.3, 2.85), pose = lerpPose(POSE.kick, POSE.wide, E.io2(st));
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .05, r: lerp(-.1, .06, st) });
    drawNebula(ctx, -120, -120, W + 240, H + 240, { z: 1.5, ox: 200 }); ctx.fillStyle = 'rgba(6,10,44,.35)'; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.fillStyle = lg(ctx, 0, 560, 0, 760, [[0, '#2a2f78'], [1, '#0c1030']]); ctx.fillRect(-200, 590, W + 400, 300);
    speedLines(ctx, W / 2, 380, t, { n: 50, r0: 200, r1: 1100, col: '#ffe9b0', a: .5, seed: 8 });
    drawChar(ctx, W / 2 + 10, 640, 190, pose, { t: Math.floor(t * 12) / 12, face: { eye: 'happy', mouth: 'grin' }, shadow: false });
    ctx.restore(); ctx.save(); ctx.strokeStyle = 'rgba(255,230,160,.8)'; ctx.lineWidth = 5; const ring = seg(L, 2.5, 2.8); ctx.beginPath(); ctx.ellipse(W / 2, 640, 120 + ring * 520, 22 + ring * 80, 0, 0, TAU); ctx.globalAlpha = 1 - ring; ctx.stroke(); ctx.restore();
  } else {
    const st = seg(L, 2.85, D);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .05 + st * .1, r: lerp(-.3, .25, E.io2(st)) });
    drawNebula(ctx, -300, -300, W + 600, H + 600, { z: 1.2, ox: -200, hue: 10 });
    rays(ctx, W / 2, H / 2, t, { n: 16, a: .25, len: 1300, sp: .6 });
    ctx.save(); ctx.translate(W / 2, H / 2 + 20); ctx.scale(230, 230); ctx.rotate(Math.sin(t * 5) * .08); drawHead(ctx, PAL.hero, { face: { eye: 'happy', mouth: 'grin' } }, 0, t); ctx.restore();
    for (let i = 0; i < 14; i++) { const a = t * 1.5 + i / 14 * TAU, d = 340 + Math.sin(t * 4 + i) * 30; sparkle(ctx, W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d * .7, 18 + 10 * Math.sin(t * 6 + i), a, '#fff3c0'); }
    ctx.restore();
  }
  bloom(ctx, .3, 12);
}

/* ---------- 10. MAGIA (21,10 – 23,80): "魔法はまだ消えていない" ---------- */
function sceneMagic(ctx, t, L, D) {
  const b = beatInfo(t), y0 = 640;
  if (L < .95) {
    const p = E.back(seg(L, 0, .3));
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .04, r: 0 });
    colorWorld(ctx, t, 60, y0, { dark: .45 });
    magicCircle(ctx, W / 2, 290, 250 * p, t * 1.5 + (1 - p) * 4, 1);
    const pose = { lean: -4, head: -16, spread: .85, hs: .55, aR: [172, 176], aL: [-14, -6], lR: [8, 0], lL: [-8, 0] };
    drawChar(ctx, W / 2, y0 + 70, 62, pose, { t: Math.floor(t * 12) / 12, wind: 1.6, face: { eye: 'determined', mouth: 'open', look: [0, -1] } });
    motes(ctx, t, 17, 70, 0, 0, W, H, '255,216,130', { a: 1, sp: 30 });
    ctx.restore(); flash(ctx, 1 - seg(L, 0, .25), '255,240,200');
  } else if (L < 1.75) {
    const u = seg(L, .95, 1.75);
    ctx.save(); ctx.fillStyle = '#0a0f2e'; ctx.fillRect(0, 0, W, H); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1, 1.12, u), r: .0 });
    drawNebula(ctx, -100, -100, W + 200, H + 200, { z: 1.8, ox: 100 }); ctx.fillStyle = 'rgba(8,10,40,.5)'; ctx.fillRect(-100, -100, W + 200, H + 200);
    eyesCU(ctx, W / 2, H / 2 + 10, 285, { open: 1, brow: .4, look: [Math.sin(t * 2) * .5, -.4], pupil: .46, starIris: true, glowIris: .5, t });
    fringe(ctx, W / 2, 60, 290, t);
    magicCircle(ctx, W / 2, H / 2, 420, t * 1.2, .22);
    ctx.restore(); letterbox(ctx, 112);
  } else {
    const u = seg(L, 1.75, D), hx = W / 2, cy = 330;
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1.15, 1, E.out2(u)), r: 0 });
    colorWorld(ctx, t, 0, y0, { dark: .5 });
    // janelas formando um coração (a luz "não apagou", só pisca)
    const R = 210; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let gx = -280; gx <= 280; gx += 26) for (let gy = -250; gy <= 260; gy += 26) {
      const x = gx / R * 1.25, y = -gy / R * 1.25, f = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y; if (f > 0) continue;
      const dly = Math.hypot(gx, gy) / 420 * .55, on = seg(u, dly, dly + .1), fl = .7 + .3 * Math.sin(t * 12 + gx * .1 + gy * .07);
      ctx.fillStyle = `rgba(255,${190 + Math.floor(40 * Math.sin(gx))},110,${on * fl * .95})`; ctx.fillRect(hx + gx - 8, cy + gy - 8 - 20, 16, 16);
      ctx.fillStyle = `rgba(255,190,110,${on * .15})`; ctx.fillRect(hx + gx - 20, cy + gy - 20 - 20, 40, 40);
    }
    ctx.restore();
    magicCircle(ctx, W / 2, 190, 150, t, .55);
    const pose = lerpPose(POSE.stand, POSE.Vup, .6 + .4 * Math.sin(t * 6));
    drawChar(ctx, W / 2, y0 + 74, 56, pose, { t: Math.floor(t * 12) / 12, wind: 1.6, face: { eye: 'happy', mouth: 'smile' } });
    motes(ctx, t, 19, 60, 0, 0, W, H, '255,216,130', { a: 1, sp: 30 });
    ctx.restore();
  }
  bloom(ctx, .3, 12);
}

/* ---------- 11. ESTRELAS (23,80 – 26,90): "星が導く 信じて" ---------- */
const CONST_PTS = [[160, 560], [300, 470], [420, 500], [560, 380], [700, 330], [800, 230], [940, 250], [1060, 140], [1180, 90]];
function sceneStars(ctx, t, L, D) {
  const b = beatInfo(t);
  if (L < 2.2) {
    const u = E.io3(seg(L, 0, 2.1)), gy = lerp(560, 1250, u);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .02, r: 0 });
    drawNebula(ctx, -120, -120, W + 240, H + 240, { z: 1.25, ox: lerp(-200, 200, u), oy: lerp(180, -180, u) });
    drawStars(ctx, t, 7, 70, 0, 0, W, H, 1);
    // constelação (linha dourada) + estrelas brilhantes
    const prog = seg(L, .5, 2.1) * (CONST_PTS.length - 1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < CONST_PTS.length - 1; i++) { const p = clamp(prog - i); if (p <= 0) continue; const a = CONST_PTS[i], c = CONST_PTS[i + 1]; for (const [w, col] of [[8, 'rgba(255,200,100,.25)'], [2.5, 'rgba(255,240,200,.95)']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], c[0], p), lerp(a[1], c[1], p)); ctx.stroke(); } }
    CONST_PTS.forEach((p, i) => { if (prog >= i - .1) sparkle(ctx, p[0], p[1], 20 + 8 * Math.sin(t * 5 + i), t * .5, '#fff6d8'); });
    ctx.restore();
    // revoada de gruas seguindo o caminho
    for (let i = 0; i < 7; i++) { const f = clamp(seg(L, .7 + i * .12, 2.2)), k = f * (CONST_PTS.length - 1), a = Math.min(Math.floor(k), CONST_PTS.length - 2), c = k - a; if (f <= 0) continue; const x = lerp(CONST_PTS[a][0], CONST_PTS[a + 1][0], c) + (i % 3 - 1) * 40, y = lerp(CONST_PTS[a][1], CONST_PTS[a + 1][1], c) + (i % 3 - 1) * 26 + Math.sin(t * 3 + i) * 14; drawCrane(ctx, x, y, .36 + (i % 3) * .05, t * 9 + i, { gold: true, rot: -.4 }); }
    // chão: bairro com vizinhos dançando
    ctx.save(); ctx.translate(0, gy - 640);
    drawCity(ctx, 0, 640, 1, { night: .6, lit: .3, fog: 0 }); streetGround(ctx, 640, 1);
    for (let i = 0; i < 6; i++) { const x = 150 + i * 195 + (i > 2 ? 30 : 0), hero = i === 3, pose = dancePose(t, i * .19); drawChar(ctx, x, 700, hero ? 62 : 52, pose, { pal: hero ? PAL.hero : neighPal(i, 1), hair: i % 4, t: Math.floor(t * 12) / 12, wind: 1.4, face: { eye: 'happy', mouth: 'grin' } }); }
    ctx.restore(); ctx.restore();
  } else {
    const u = seg(L, 2.2, D);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: lerp(1, 1.12, u), r: lerp(.05, -.02, u) });
    drawNebula(ctx, -120, -120, W + 240, H + 240, { z: 1.4, ox: 300, oy: -150 }); ctx.fillStyle = 'rgba(6,10,44,.25)'; ctx.fillRect(-100, -100, W + 200, H + 200);
    drawStars(ctx, t, 9, 60, 0, 0, W, H, 1);
    rays(ctx, W / 2, 360, t, { n: 12, a: .22, len: 1100 });
    const pose = { lean: 0, head: -14, spread: .85, hs: .55, aR: [34, -128], aL: [-34, 128], lR: [6, 0], lL: [-6, 0], frontR: true, frontL: true };
    charAtHip(ctx, W / 2, 620, 130, pose, { t: Math.floor(t * 12) / 12, wind: 1.4, scarfLen: 4, shadow: false, face: { eye: 'closed', mouth: 'smile', look: [0, -1] } });
    const hp = charPt(W / 2, 620 + skeleton(pose).foot * 130, 130, pose, [0, -1.1]);
    drawSphere(ctx, hp[0], hp[1], 38 + b.pulse * 3, { crack: 1, glow: 1, t });
    motes(ctx, t, 23, 50, 0, 0, W, H, '255,226,150', { a: 1, sp: 30 });
    ctx.restore();
  }
  bloom(ctx, .28, 12);
}

/* ---------- 12. FINAL (26,90 – 30,60): "あなたの夢は本物だよ" → capa recriada ---------- */
function sceneFinale(ctx, t, L, D) {
  const b = beatInfo(t);
  if (L < 1.5) {
    const u = seg(L, 0, 1.5);
    ctx.save(); cam(ctx, { x: W / 2, y: H / 2, z: 1 + b.pulse * .03 + u * .08, r: lerp(-.04, .03, u) });
    drawNebula(ctx, -120, -120, W + 240, H + 240, { z: 1.2, ox: 100 }); ctx.fillStyle = 'rgba(6,10,44,.2)'; ctx.fillRect(-100, -100, W + 200, H + 200);
    speedLines(ctx, W / 2, 330, t, { n: 70, r0: 240, r1: 1200, col: '#fff3d0', a: .55, seed: 12 });
    const kf = seg(t, 27.7, 28.0) * (1 - seg(t, 28.15, 28.4)); if (kf > 0) { ctx.save(); ctx.globalAlpha = kf; ctx.font = `760px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff3c0'; ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 60; ctx.fillText('夢', W / 2, 340); ctx.restore(); }
    const pose = { lean: -2, head: 2, spread: .85, hs: .55, aR: [118, 100], aL: [-14, -6], lR: [6, 0], lL: [-6, 0], frontR: true };
    charAtHip(ctx, W / 2 - 80, 700, 130, pose, { t: Math.floor(t * 12) / 12, wind: 1.8, scarfLen: 4, shadow: false, face: { eye: 'open', mouth: 'smile', look: [0, 0] } });
    const hs = lerp(1.3, 2.6, E.in2(seg(L, .1, 1.5)));
    bigHand(ctx, 900, 820, hs, -.5, .05, { cuff: '#2a4278' });
    ctx.restore();
  } else {
    const u = seg(L, 1.5, D), z = lerp(1.7, 1, E.out3(seg(L, 1.5, 2.9)));
    ctx.save(); cam(ctx, { x: W / 2, y: 330, z: z, r: 0 }); ctx.translate(0, (1 - z) * -40 * 0);
    drawNebula(ctx, -100, -100, W + 200, H + 200, { z: 1.0 });
    // metade esquerda: prédios cinza (como a capa)
    ctx.save(); poly(ctx, [[-300, -300], [560, -300], [470, 1000], [-300, 1000]]); ctx.clip(); grayWorld(ctx, -220, 700); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,200,100,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(560, -300); ctx.lineTo(470, 1000); ctx.stroke(); ctx.restore();
    rays(ctx, W / 2, 330, t, { n: 12, a: .16, len: 1100 });
    drawSphere(ctx, W / 2, 330, 120 * (1 + b.pulse * .03), { crack: 1, glow: 1, t });
    cranesAround(ctx, t, W / 2, 330, 6, 440, 190);
    drawCrane(ctx, 1080, 560, .8, t * 6, { rot: -.3 }); drawCrane(ctx, 1190, 120, .5, t * 7 + 2, { rot: .3 });
    flare(ctx, W / 2, 330, 1.1, '255,200,140', .85, 1.1);
    const pose = lerpPose(POSE.stand, POSE.Vup, E.out3(seg(L, 1.6, 2.0)));
    drawChar(ctx, 300, 700, 44, pose, { t: Math.floor(t * 12) / 12, wind: 1.6, face: { eye: 'happy', mouth: 'smile' } });
    ctx.restore();
  }
  bloom(ctx, .3, 12);
  flash(ctx, seg(t, 29.9, 30.6), '0,0,0');
}
