'use strict';
/* ============================================================
   scenes_d.js — VERSO 2 (48.3–72.8 s): quedas · corda bamba sem rede · "sem sinal" · o traço dourado · sorte vs. mover ·
   chegar em casa · abraço · ∞ · escuro · a mão de luz.  (agente CENAS D)  Prefixo d_/D_.
   ============================================================ */
const D_ON = t => Math.floor(t * 12) / 12;                       // personagem "on twos"
const D_GOLD = '#ffc24d', D_GOLD_RGB = '255,194,77';
/* calor do mundo (0 azul-cinza desbotado .. 1 dourado): esquenta a partir do traço (57 s), apaga no escuro (69 s) */
function d_warm(t) { return clamp(.72 * sstep(57.4, 62.5, t) + .18 * sstep(62.5, 66, t)) * (1 - sstep(69.1, 70.3, t)); }
function d_post(ctx, t, o = {}) {
  const w = o.warm == null ? d_warm(t) : o.warm;
  if (o.night) { fxGrade(ctx, 'nightTeal', .45 * (1 - w)); if (w > .02) fxGrade(ctx, 'dawnGold', w * .5); }
  else { fxGrade(ctx, 'dayFaded', (1 - w * .85) * (o.g == null ? 1 : o.g)); if (w > .02) fxGrade(ctx, 'dawnGold', w * .75); }
  fxVignette(ctx, o.vig == null ? .5 : o.vig, o.vcol || '10,14,26');
}
function d_hero(ctx, x, y, s, pose, t, o = {}) { return drawChar(ctx, x, y, s, pose, Object.assign({ who: 'hero', t: D_ON(t), pendant: 1, rimA: .5 }, o)); }
function d_keys(keys, u) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) if (u < keys[i + 1][0]) return lerpPose(keys[i][1], keys[i + 1][1], E.io2(seg(u, keys[i][0], keys[i + 1][0])));
  return keys[keys.length - 1][1];
}
/* cam do fundo: acompanha menos que o primeiro plano (paralaxe/profundidade) */
function d_camBG(ctx, c, k = .4) { cam(ctx, { x: 640, y: 360 + (c.y - 360) * k, z: 1 + ((c.z || 1) - 1) * k * 1.2, r: c.r }); }
function d_ik(sh, tg, L) { // 2 ossos: ângulos (graus a partir de baixo, + = direita) p/ a mão alcançar tg; cotovelo para baixo
  const dx = tg[0] - sh[0], dy = tg[1] - sh[1], R = Math.hypot(dx, dy), a = Math.atan2(dx, dy) * 180 / Math.PI, dl = Math.acos(Math.min(1, R / (2 * L))) * 180 / Math.PI;
  return [a - dl, a + dl];
}
function d_puff(ctx, x, y, u, s = 1, col = '230,234,238') {
  if (u <= 0 || u >= 1) return; ctx.save();
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (i / 6), r = 8 + u * 38 * s; ctx.fillStyle = `rgba(${col},${.5 * (1 - u)})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * .5 - u * 8, (7 + 6 * u) * s, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/* placa de giz com contador "caí n/3" */
function d_counter(ctx, x, y, n, pop, t, o = {}) {
  if (pop <= 0) return;
  const sc = .55 + .45 * E.back(clamp(pop)), gy = o.gy;
  ctx.save(); ctx.translate(x, y);
  if (gy) { ctx.fillStyle = '#7a5a40'; ctx.fillRect(-5, 40, 10, gy - y - 40); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-5, 40, 3, gy - y - 40); }
  ctx.rotate((o.rot == null ? -.05 : o.rot) + Math.sin(t * 2) * .01); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rrect(ctx, -92, -38, 200, 98, 8); ctx.fill();
  rrect(ctx, -100, -46, 200, 98, 8); ctx.fillStyle = '#b08a5a'; ctx.fill(); ctx.strokeStyle = '#5a3f28'; ctx.lineWidth = 2.5; ctx.stroke();
  rrect(ctx, -91, -37, 182, 80, 4); ctx.fillStyle = lg(ctx, 0, -37, 0, 43, [[0, '#2c3b38'], [1, '#1f2b29']]); ctx.fill();
  ctx.font = '38px "Permanent Marker","Lilita One",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = .55; ctx.fillStyle = '#f6f2e4'; ctx.fillText('caí ' + n + '/3', 1, -9); ctx.globalAlpha = .95; ctx.fillText('caí ' + n + '/3', 0, -10);
  ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const tx = -34 + i * 24; ctx.beginPath(); ctx.moveTo(tx, 12); ctx.lineTo(tx + 3, 34); ctx.stroke(); }
  if (n >= 3) { ctx.beginPath(); ctx.moveTo(-42, 30); ctx.lineTo(36, 14); ctx.stroke(); }
  ctx.fillStyle = '#c9ced8'; ctx.beginPath(); ctx.arc(-88, -34, 3, 0, TAU); ctx.arc(88, -34, 3, 0, TAU); ctx.fill();
  ctx.restore();
}
function d_bike(ctx, x, y, s, rot = 0) { // bicicleta infantil encostada
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const wheel = wx => { ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(wx, -34, 34, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#9aa4b0'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(wx, -34, 30, 0, TAU); ctx.stroke(); ctx.lineWidth = 1; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.beginPath(); ctx.moveTo(wx, -34); ctx.lineTo(wx + Math.cos(a) * 30, -34 + Math.sin(a) * 30); ctx.stroke(); } };
  wheel(-48); wheel(48);
  ctx.strokeStyle = '#d6453d'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-48, -34); ctx.lineTo(-8, -64); ctx.lineTo(34, -64); ctx.lineTo(48, -34); ctx.moveTo(-8, -64); ctx.lineTo(4, -34); ctx.lineTo(-48, -34); ctx.moveTo(4, -34); ctx.lineTo(34, -64); ctx.stroke();
  ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-14, -64); ctx.lineTo(-20, -78); ctx.moveTo(-28, -78); ctx.lineTo(-8, -78); ctx.moveTo(36, -64); ctx.lineTo(32, -86); ctx.moveTo(26, -88); ctx.lineTo(44, -88); ctx.stroke();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(4, -34, 6, 0, TAU); ctx.fill();
  ctx.restore();
}
/* celular (tela p/ o espectador) com "sem sinal" */
function d_phone(ctx, x, y, s, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rrect(ctx, -52, -92, 112, 208, 18); ctx.fill();
  rrect(ctx, -56, -100, 112, 208, 18); ctx.fillStyle = '#23262e'; ctx.fill(); ctx.strokeStyle = '#0e1016'; ctx.lineWidth = 3; ctx.stroke();
  rrect(ctx, -48, -88, 96, 184, 10); ctx.fillStyle = lg(ctx, 0, -88, 0, 96, [[0, '#cfd8e0'], [1, '#aeb9c4']]); ctx.fill();
  ctx.fillStyle = '#23262e'; rrect(ctx, -14, -88, 28, 8, 4); ctx.fill();
  // barras de sinal (todas vazias)
  ctx.strokeStyle = '#3c4654'; ctx.lineWidth = 2.2; for (let i = 0; i < 4; i++) { rrect(ctx, -40 + i * 8, -66 - i * 4 + 12 - 12 + (3 - i) * 0, 5, 8 + i * 4, 1.5); ctx.stroke(); }
  const blink = .5 + .5 * Math.sin(t * 7);
  ctx.strokeStyle = `rgba(214,60,60,${.6 + .4 * blink})`; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-6, -70); ctx.lineTo(8, -56); ctx.moveTo(8, -70); ctx.lineTo(-6, -56); ctx.stroke();
  ctx.fillStyle = '#3c4654'; ctx.font = '11px "Lilita One",sans-serif'; ctx.textAlign = 'right'; ctx.fillText('sem serviço', 44, -58);
  // ícone de antena riscada no meio
  ctx.strokeStyle = '#46505e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.globalAlpha = .35 + .65 * (((t * 1.6 - i * .33) % 1 + 1) % 1 < .5 ? 1 : .2); ctx.beginPath(); ctx.arc(0, 28, 16 + i * 14, -Math.PI * .8, -Math.PI * .2); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#46505e'; ctx.beginPath(); ctx.arc(0, 28, 4, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(214,60,60,.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 62); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(-48, -88); ctx.lineTo(10, -88); ctx.lineTo(-30, 96); ctx.lineTo(-48, 96); ctx.fill();
  ctx.restore();
}
/* sacola de pão */
function d_bread(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineJoin = 'round';
  for (const [dx, a, c] of [[-14, -.22, '#e0a460'], [2, -.04, '#d8934c'], [16, .16, '#e8b472']]) { ctx.save(); ctx.translate(dx, -34); ctx.rotate(a); rrect(ctx, -7, -52, 14, 62, 7); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(120,70,20,.5)'; ctx.lineWidth = 1.6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-4, -44 + i * 12); ctx.lineTo(4, -38 + i * 12); ctx.stroke(); } ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-34, -30); ctx.lineTo(34, -30); ctx.lineTo(28, 36); ctx.lineTo(-28, 36); ctx.closePath(); ctx.fillStyle = '#c99a62'; ctx.fill(); ctx.strokeStyle = '#7a5530'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.fillStyle = 'rgba(80,50,20,.22)'; ctx.beginPath(); ctx.moveTo(10, -30); ctx.lineTo(34, -30); ctx.lineTo(28, 36); ctx.lineTo(14, 36); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, -24); ctx.lineTo(-22, 26); ctx.stroke();
  ctx.restore();
}
/* rede de circo rasgada, pendurada nos ganchos da laje (ausência da rede de apoio) */
function d_tornNet(ctx, x, y, t, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  const hooks = [[0, 0], [70, 6], [140, 0]];
  hooks.forEach(h => { ctx.fillStyle = '#6a6f78'; ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a3f48'; ctx.lineWidth = 2; ctx.stroke(); });
  const sw = Math.sin(t * 1.5) * 5, r = rng(21);
  ctx.strokeStyle = 'rgba(40,46,56,.85)'; ctx.lineWidth = 2;
  for (let c = 0; c < 6; c++) { const x0 = c * 28; // fios verticais pendurados (rasgados em alturas diferentes)
    const hgt = 40 + r() * 120; ctx.beginPath(); ctx.moveTo(x0, 4); ctx.quadraticCurveTo(x0 + sw * .5, hgt * .5, x0 + sw * (hgt / 120) + (r() - .5) * 8, hgt); ctx.stroke();
    for (let q = 1; q < hgt / 30; q++) { const yy = q * 30, xx = x0 + sw * (yy / 120) * .8; if (r() < .6) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 28 + (r() - .5) * 6, yy + (r() - .5) * 10); ctx.stroke(); } } }
  // um fio longo, sozinho
  ctx.strokeStyle = 'rgba(217,207,174,.9)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(70, 6); ctx.bezierCurveTo(70 + sw * 2, 140, 60 - sw, 280, 66 + sw * 3, 420); ctx.stroke();
  ctx.restore();
}
function d_clover(ctx, x, y, s, rot, flat = 1, col = '#4fb06a') { // trevo de 4 folhas (amassado se flat<1)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s * flat); ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2 + Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-16, -8, -18, -34, 0, -26); ctx.bezierCurveTo(18, -34, 16, -8, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = mix(col, '#0a2014', .55); ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -20); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle = mix(col, '#0a2014', .4); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 4); ctx.quadraticCurveTo(10, 24, 4, 40); ctx.stroke();
  ctx.restore();
}
function d_die(ctx, x, y, s, rot, flat = 1) { // dado esmagado
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s * flat); ctx.lineJoin = 'round';
  rrect(ctx, -28, -28, 56, 56, 9); ctx.fillStyle = '#f4efe6'; ctx.fill(); ctx.strokeStyle = '#8a8478'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#2b2733'; for (const [a, b] of [[-14, -14], [14, -14], [0, 0], [-14, 14], [14, 14]]) { ctx.beginPath(); ctx.arc(a, b, 5.2, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(60,50,40,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-26, 4); ctx.lineTo(-8, -2); ctx.lineTo(-2, 14); ctx.lineTo(18, 8); ctx.stroke();
  ctx.restore();
}
function d_cloudsOnly(ctx, t, y1) { drawDaySky(ctx, t, { y1, sun: false }); }

/* ============ 1–3  AS TRÊS QUEDAS (48.30–50.84) ============ */
function d_stairY(x) { return x < 150 ? 560 : x >= 598 ? 350 : 560 - 30 * (Math.floor((x - 150) / 64) + 1); }
function d_s1(ctx, t, L, D) { // queda 1: escada
  const u = L / D, cx = lerp(330, 440, E.io2(u)), cy = lerp(440, 410, u), z = lerp(1.05, 1.22, E.io2(u));
  ctx.save(); d_camBG(ctx, { x: cx, y: cy, z }); drawQuebrada(ctx, cx, 540, 2, { t, fog: 1.4 }); ctx.restore();
  ctx.save(); cam(ctx, { x: cx, y: cy, z, r: -.025 });
  drawBecoGround(ctx, 560, 2, 0, {});
  drawEscadaria(ctx, 150, 560, 7, 2, { w: 64, h: 30, dir: 1, rail: true, t });
  const hx = lerp(262, 372, E.out2(seg(u, 0, .3))) + 4 * seg(u, .3, .9), hy = d_stairY(hx - 8);
  const ph = t * 12, keys = [[0, walkPose(ph, 10)], [.18, walkPose(ph + 1, 14)], [.3, Object.assign({}, POSE.fall)], [.44, POSE.fallFlat], [.6, POSE.hands2knees], [.8, POSE.rise], [1, POSE.rise2]];
  d_hero(ctx, hx, hy, 46, d_keys(keys, u), t, { face: u < .3 ? 'neutral' : u < .75 ? 'shock' : 'determined', squash: Math.exp(-Math.abs(u - .42) * 14) * .06 });
  d_puff(ctx, hx + 20, hy, seg(u, .38, .8), 1);
  d_counter(ctx, 700, 250, 1, seg(u, .42, .62), t, { gy: 350 });
  ctx.restore();
  fxRain(ctx, t, { n: 50, a: .22, len: 36 });
  d_post(ctx, t);
}
function d_s2(ctx, t, L, D) { // queda 2: rua molhada
  const u = L / D, y0 = 520, cx = lerp(520, 700, E.io2(u)), z = lerp(1.0, 1.18, u);
  ctx.save(); d_camBG(ctx, { x: cx, y: 400, z }); drawQuebrada(ctx, cx, 500, 2, { t, fog: 1.4 }); ctx.restore();
  ctx.save(); cam(ctx, { x: cx, y: 410, z, r: .03 });
  drawBecoGround(ctx, y0, 2, 0, {});
  // poça: espelho do céu
  const px = 700, pw = 190; ctx.save(); ctx.translate(px, y0 + 70); ctx.scale(1, .2); ctx.fillStyle = rg(ctx, 0, 0, 0, pw, [[0, 'rgba(220,230,240,.85)'], [.7, 'rgba(160,178,196,.7)'], [1, 'rgba(120,138,156,0)']]); ctx.beginPath(); ctx.arc(0, 0, pw, 0, TAU); ctx.fill(); ctx.restore();
  for (let i = 0; i < 3; i++) { const ru = ((t * 1.4 + i / 3) % 1); ctx.strokeStyle = `rgba(255,255,255,${.45 * (1 - ru)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(px + (i - 1) * 60, y0 + 70, 14 + ru * 40, (14 + ru * 40) * .22, 0, 0, TAU); ctx.stroke(); }
  const hx = lerp(380, 680, E.out2(seg(u, 0, .42))) + 30 * seg(u, .42, .7), hy = y0 + 70;
  const ph = t * 16, keys = [[0, runPose(ph, 18)], [.3, runPose(ph + 1, 24)], [.42, Object.assign({}, POSE.fall, { lean: 60 })], [.55, POSE.fallFlat], [.7, POSE.hands2knees], [.88, POSE.rise], [1, POSE.rise2]];
  d_hero(ctx, hx, hy, 50, d_keys(keys, u), t, { face: u < .38 ? 'determined' : u < .75 ? 'shock' : 'pout', shadow: false });
  // respingo
  const su = seg(u, .4, .8); if (su > 0 && su < 1) { ctx.fillStyle = 'rgba(210,225,240,.8)'; const r = rng(3); for (let i = 0; i < 16; i++) { const a = -Math.PI * (.1 + r() * .8), v = 30 + r() * 90; ctx.beginPath(); ctx.arc(hx + 24 + Math.cos(a) * v * su, hy + Math.sin(a) * v * su + 140 * su * su - 20, 2.4 * (1 - su) + .6, 0, TAU); ctx.fill(); } }
  d_counter(ctx, 960, 270, 2, seg(u, .5, .7), t, { gy: y0 + 40 });
  ctx.restore();
  fxRain(ctx, t, { n: 110, a: .32, len: 44, splash: 560 });
  d_post(ctx, t);
}
function d_s3(ctx, t, L, D) { // queda 3: degrau + bicicleta; curativo e cicatriz
  const u = L / D, gy = 530;
  const kz = 1 + .75 * E.io2(seg(u, .1, .55)) - .55 * E.io2(seg(u, .72, 1));
  const cc = { x: 640 + 30 * u, y: lerp(400, 470, E.io2(seg(u, .1, .5))) - 20 * seg(u, .72, 1), z: kz };
  ctx.save(); cam(ctx, cc);
  fxConcrete(ctx, -300, 0, W + 600, gy, { tone: 'day', seed: 5, light: .45, side: 'right', vig: .1, shade: .3, clean: true });
  ctx.fillStyle = lg(ctx, 0, gy, 0, H + 200, [[0, '#8f979f'], [1, '#6c747e']]); ctx.fillRect(-300, gy, W + 600, 500);
  ctx.fillStyle = '#c3c8cc'; ctx.fillRect(-300, gy - 8, W + 600, 10); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-300, gy - 8, W + 600, 2);
  // degrau
  ctx.fillStyle = '#b4bac0'; ctx.fillRect(820, gy - 38, 400, 40); ctx.fillStyle = '#8c949c'; ctx.fillRect(820, gy - 6, 400, 8); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(820, gy - 38, 400, 3);
  d_bike(ctx, 250, gy + 6, 1.5, -.1);
  d_counter(ctx, 520, 250, 3, seg(u, .35, .5), t, { gy: gy, rot: -.04 });
  const hx = lerp(640, 600, u), pose = d_keys([[0, POSE.run], [.12, Object.assign({}, POSE.fall, { lean: 55 })], [.28, POSE.fallFlat], [.4, POSE.hands2knees], [.7, POSE.hands2knees], [.86, POSE.rise], [1, POSE.rise2]], u);
  const s = 64, o = { face: u < .12 ? 'determined' : u < .8 ? 'cry' : 'determined', flip: false };
  d_hero(ctx, hx, gy + 40, s, pose, t, o);
  // brilho dourado discreto no joelho: a cicatriz nova
  const kn = skeleton(pose).lL[1], kp = charPt(hx, gy + 40, s, pose, kn, o), gk = sstep(.4, .6, u) * (1 - sstep(.86, 1, u));
  if (gk > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, kp[0], kp[1], 0, 46, [[0, `rgba(${D_GOLD_RGB},${.55 * gk})`], [1, `rgba(${D_GOLD_RGB},0)`]]); ctx.fillRect(kp[0] - 50, kp[1] - 50, 100, 100); sparkle(ctx, kp[0] + 12, kp[1] - 10, 12 * gk, t * 2, 'rgba(255,240,200,.95)'); ctx.restore(); }
  ctx.restore();
  d_post(ctx, t);
}

/* ============ 4–5  CORDA BAMBA SEM REDE (50.84–54.26) ============ */
function d_voidBG(ctx, t, camY, dep = 1) {
  drawDaySky(ctx, t, { y1: 720, sun: false });
  ctx.save(); drawQuebrada(ctx, 90 + t * 8, 880 - camY * .0 + dep * 30, 2, { t, sky: false, fog: 2, kites: false, poles: false }); ctx.restore();
  const g = lg(ctx, 0, 380, 0, 720, [[0, 'rgba(205,213,220,0)'], [.55, 'rgba(205,213,220,.55)'], [1, 'rgba(120,134,150,.95)']]); ctx.fillStyle = g; ctx.fillRect(0, 380, W, 340);
}
function d_s4(ctx, t, L, D) { // plano geral
  const u = L / D, ry = 350, x0 = 336, x1 = 936, sag = 26;
  const cc = { x: lerp(560, 640, E.io2(u)), y: lerp(330, 430, E.io2(u)), z: lerp(1.0, 1.2, E.io2(u)), r: lerp(-.03, .02, u) };
  ctx.save(); d_camBG(ctx, cc, .45); d_voidBG(ctx, t, cc.y); ctx.restore();
  ctx.save(); cam(ctx, cc);
  drawLaje(ctx, -260, ry + 10, 600, 2, { h: 26, drop: 500, mureta: 0, tank: .78, rebar: 'R', seed: 4, t });
  drawLaje(ctx, 930, ry + 10, 560, 2, { h: 26, drop: 500, mureta: 0, rebar: 'L', varal: [.3, .85], ant: .15, seed: 7, t });
  for (const [px, d] of [[x0, 1], [x1, -1]]) { ctx.strokeStyle = '#5a6672'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, ry + 10); ctx.lineTo(px, ry - 12); ctx.stroke(); }
  d_tornNet(ctx, 70, ry + 52, t, 1);
  d_tornNet(ctx, 1010, ry + 60, t + 1, .8);
  drawTightrope(ctx, x0, ry - 12, x1, ry - 12, sag, t, { wob: 1 });
  const hu = lerp(.18, .5, E.io2(u)), hp = tightropePt(x0, ry - 12, x1, ry - 12, sag, hu, t, 1);
  d_hero(ctx, hp[0], hp[1], 40, balancePose(t, .55), t, { face: 'determined', shadow: false });
  ctx.restore();
  fxDust(ctx, t, { x: 100, y: 200, w: 1000, h: 400, n: 14, a: .5, seed: 4 });
  d_post(ctx, t, { vig: .6 });
}
function d_s5(ctx, t, L, D) { // closes dos pés + o vazio embaixo
  const u = L / D, ry = 350, x0 = 336, x1 = 936, sag = 26, hu = lerp(.5, .56, u);
  const hp = tightropePt(x0, ry - 12, x1, ry - 12, sag, hu, t, 1);
  const cc = { x: hp[0] + lerp(-40, 10, u), y: hp[1] + lerp(-70, 120, E.io2(u)), z: lerp(2.7, 2.2, E.io2(u)), r: Math.sin(t * 2.2) * .018 };
  ctx.save(); d_camBG(ctx, cc, .22); d_voidBG(ctx, t, cc.y, 2); ctx.restore();
  ctx.save(); cam(ctx, cc);
  drawLaje(ctx, 930, ry + 10, 560, 2, { h: 26, drop: 500, mureta: 0, rebar: 'L', seed: 7, t });
  drawTightrope(ctx, x0, ry - 12, x1, ry - 12, sag, t, { wob: 1 });
  ctx.strokeStyle = 'rgba(217,207,174,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hp[0] + 160, hp[1] + 4); ctx.bezierCurveTo(hp[0] + 150, hp[1] + 140, hp[0] + 175, hp[1] + 260, hp[0] + 160, hp[1] + 420); ctx.stroke();
  d_hero(ctx, hp[0], hp[1], 40, balancePose(t, .95), t, { face: 'determined', shadow: false });
  ctx.restore();
  d_post(ctx, t, { vig: .65 });
}

/* ============ 6–7  OLHEI PRO CÉU / "SEM SINAL" (54.26–57.14) ============ */
function d_s6(ctx, t, L, D) { // contra-plongée
  const u = L / D;
  ctx.save(); cam(ctx, { x: 640, y: lerp(430, 330, E.io2(u)), z: lerp(1.0, 1.1, u), r: lerp(.07, .04, u) });
  drawDaySky(ctx, t, { y1: 900, sun: false });
  ctx.fillStyle = lg(ctx, 0, -300, 0, 300, [[0, 'rgba(110,126,146,.7)'], [1, 'rgba(110,126,146,0)']]); ctx.fillRect(-400, -300, W + 800, 600);
  // beirais/lajes convergindo (visto de baixo)
  const wall = (side) => { ctx.save(); const sx = side < 0 ? -200 : W + 200; ctx.fillStyle = lg(ctx, sx, 0, 640, 0, [[0, '#6c7884'], [1, '#8b97a3']]); poly(ctx, [[sx, 300], [sx + side * -330, 120], [sx + side * -420, 120], [sx + side * -520, 700], [sx, 900]]); ctx.fill(); ctx.restore(); };
  ctx.fillStyle = '#7d8995'; poly(ctx, [[-200, 900], [-200, 80], [150, 210], [250, 900]]); ctx.fill(); ctx.fillStyle = '#69747f'; poly(ctx, [[-200, 80], [150, 210], [165, 230], [-200, 110]]); ctx.fill();
  ctx.fillStyle = '#7d8995'; poly(ctx, [[W + 200, 900], [W + 200, 60], [W - 170, 200], [W - 270, 900]]); ctx.fill(); ctx.fillStyle = '#69747f'; poly(ctx, [[W + 200, 60], [W - 170, 200], [W - 186, 222], [W + 200, 94]]); ctx.fill();
  ctx.fillStyle = 'rgba(40,50,60,.18)'; ctx.fillRect(-100, 600, W + 200, 400);
  ctx.strokeStyle = '#3b4652'; ctx.lineWidth = 2.2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(150, 210 + i * 8); ctx.quadraticCurveTo(640, 150 + i * 22 + Math.sin(t * 1.4 + i) * 3, W - 170, 200 + i * 8); ctx.stroke(); }
  // a menina de baixo: queixo, braço erguido com o celular
  const pose = Object.assign({}, POSE.stand, { lean: -4, head: -42, aR: [172, 176], lR: [4, 0], hR: 'fist', aL: [-8, -4] }), hx = 640 + Math.sin(t * .9) * 4, hy = 790;
  d_hero(ctx, hx, hy, 110, pose, t, { face: 'sad', shadow: false, light: 1 });
  const hand = charPt(hx, hy, 110, pose, 'aR');
  d_phone(ctx, hand[0] + 4, hand[1] - 66, .5, .14 + Math.sin(t * 1.3) * .03, t);
  ctx.restore();
  d_post(ctx, t, { vig: .7 });
}
function d_s7(ctx, t, L, D) { // close do olhar + inserto do celular
  const u = L / D, S = lerp(215, 240, u);
  ctx.save(); ctx.translate(Math.sin(t * 1.7) * 3, 0);
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#8794a2'], [1, '#6a7684']]); ctx.fillRect(0, 0, W, H);
  eyesCU(ctx, 640, 330, S, { t, look: [.05, -.55], style: 'open', brow: -.4, refl: true, autoBlink: u > .2 });
  // reflexo do céu cinza na íris
  fringe(ctx, 640, 330 - S * 1.02, S, t);
  ctx.restore();
  // inserto manga em diagonal
  const p = E.out3(seg(u, .38, .72));
  if (p > 0) {
    ctx.save(); const sk = 150, x0 = lerp(W + sk, 640, p);
    ctx.beginPath(); ctx.moveTo(x0 + sk, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(x0 - sk, H); ctx.closePath(); ctx.clip();
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#b8c2cc'], [1, '#98a4b0']]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 9; i++) ctx.fillRect(0, i * 90 + (t * 20 % 90), W, 2);
    d_phone(ctx, lerp(940, 900, p), 380, 2.2, -.1 + Math.sin(t * 1.5) * .015, t);
    ctx.restore();
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0 + sk, 0); ctx.lineTo(x0 - sk, H); ctx.stroke(); ctx.restore();
  }
  d_post(ctx, t, { vig: .6 });
}

/* ============ 8–9  O TRAÇO DOURADO (57.14–60.30) ============ */
const D_LINE = [[170, 470], [320, 425], [430, 470], [560, 372], [700, 418], [850, 296], [1010, 345], [1190, 215]];
function d_s8(ctx, t, L, D) {
  const u = L / D, p = E.io2(seg(u, .06, .86)), gold = sstep(.62, .98, u);
  const pts = D_LINE, cum = _fxPlen(pts), tl = cum[cum.length - 1] * p;
  let tip = pts[0]; for (let i = 1; i < pts.length; i++) if (cum[i] >= tl) { const k = (tl - cum[i - 1]) / (cum[i] - cum[i - 1]); tip = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; break; } else tip = pts[i];
  const cc = { x: lerp(480, 880, E.io2(u)) * .0 + lerp(500, tip[0] + 60, E.out2(seg(u, 0, 1))), y: lerp(410, tip[1] + 60, .5), z: 1.15, r: -.012 };
  ctx.save(); cam(ctx, cc);
  const wall = fxConcrete(ctx, -300, -100, 1880, 690, { tone: 'day', seed: 5, light: .5 - .2 * gold, side: 'right', vig: .1, shade: .3, clean: true });
  ctx.fillStyle = lg(ctx, 0, 590, 0, 900, [[0, '#8c949c'], [1, '#6c747e']]); ctx.fillRect(-300, 590, 1880, 400); ctx.fillStyle = '#b8bec4'; ctx.fillRect(-300, 580, 1880, 12);
  // traço de giz que acende
  _fxChalkPath(ctx, pts, p, { col: mix('#f6f2e4', '#ffe29a', gold), w: 5 + gold * 2, seed: 4 });
  if (gold > 0) {
    const gp = Math.min(p, 1); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${D_GOLD_RGB},${.5 * gold})`; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    let first = true; for (let i = 0; i < pts.length; i++) { if (cum[i] > tl && i > 0) { const k = (tl - cum[i - 1]) / (cum[i] - cum[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); break; } first ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]); first = false; }
    ctx.stroke(); ctx.restore();
    fxConstellation(ctx, pts.map((q, i) => [q[0], q[1], 2 + (i % 3) * .5]), p * gold, { t, lw: 1.4 });
  }
  // a menina desenhando
  const hs = 52, hxx = clamp(tip[0] - 98, 120, 1200), hyy = 590, hero = { who: 'hero' };
  const pose0 = Object.assign({}, POSE.reach, { lean: -6, head: -6, lR: [12, 0], lL: [-12, 0] }), sk0 = skeleton(pose0), sh = charPt(hxx, hyy, hs, pose0, sk0.shR);
  const ang = d_ik(sh, tip, hs * 1.05), pose = Object.assign({}, pose0, { aR: ang, hR: 'fist' });
  d_hero(ctx, hxx, hyy, hs, pose, t, { face: 'determined', shadow: true });
  // poeira de giz na ponta
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const ph = ((t * 1.3 + i * .125) % 1); ctx.fillStyle = `rgba(255,250,235,${.55 * (1 - ph)})`; ctx.beginPath(); ctx.arc(tip[0] + Math.sin(i * 3 + t * 5) * 6, tip[1] + ph * 26, 1.3 + (i % 3) * .5, 0, TAU); ctx.fill(); } ctx.restore();
  ctx.restore();
  d_post(ctx, t);
}
function d_s9(ctx, t, L, D) { // a linha vira estrada / constelação sobre a quebrada
  const u = L / D, mood = lerp(2, 1.25, E.io2(u)), cam1 = lerp(0, 120, u);
  ctx.save(); cam(ctx, { x: 640, y: lerp(380, 340, u), z: lerp(1.0, 1.18, E.io2(u)), r: lerp(.02, -.02, u) });
  drawQuebrada(ctx, 300 + cam1, 420, mood, { t, fog: 1.2 });
  drawBecoGround(ctx, 420, mood, cam1, {});
  const N = 22, C = [], R = [];
  const P = v => { const e = Math.pow(v, .85); return [640 + 280 * Math.sin(v * 4.2 + .5) * (1 - v * .72) - 40, 760 - 400 * e, lerp(230, 7, Math.pow(v, .62))]; };
  const ap = E.out2(seg(u, 0, .55));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const lp = [], rp = []; for (let i = 0; i <= N; i++) { const v = i / N * ap, q = P(v); lp.push([q[0] - q[2], q[1]]); rp.push([q[0] + q[2], q[1]]); }
  ctx.beginPath(); lp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); for (let i = rp.length - 1; i >= 0; i--) ctx.lineTo(rp[i][0], rp[i][1]); ctx.closePath();
  ctx.fillStyle = lg(ctx, 0, 760, 0, 330, [[0, `rgba(${D_GOLD_RGB},.7)`], [1, `rgba(255,236,190,.25)`]]); ctx.fill();
  ctx.strokeStyle = 'rgba(255,244,214,.8)'; ctx.lineWidth = 2.4; ctx.beginPath(); lp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.beginPath(); rp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
  for (let i = 0; i < 12; i++) { const v = ((i / 12 + t * .22) % 1) * ap, a = P(v), b = P(Math.min(1, v + .03)); ctx.strokeStyle = `rgba(255,250,235,${.8 * (1 - v)})`; ctx.lineWidth = 5 * (1 - v) + 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  ctx.restore();
  // constelação ao longo da estrada, subindo ao céu
  const cs = []; for (let i = 0; i < 9; i++) { const v = (i + 1) / 9, q = P(v * .97); cs.push([q[0] + Math.sin(i * 2.1) * 26, q[1] - 12 - (i % 3) * 26, 2.4 + (i % 3) * .6]); }
  cs.push([980, 120, 3]); cs.push([1120, 70, 2.4]);
  fxConstellation(ctx, cs, seg(u, .15, .95), { t, lw: 1.5, travel: t * .3 });
  fxLightShafts(ctx, 560, 330, -Math.PI / 2 + .1, 700, { n: 5, spread: .8, w: 60, a: .2 * u, t, col: D_GOLD_RGB, seed: 2 });
  // a menina caminhando pela estrada que ela mesma traçou (de costas, pequena)
  const hv = lerp(.12, .5, E.io2(u)), q = P(hv);
  d_hero(ctx, q[0], q[1], lerp(34, 20, hv * 1.6), walkPose(t * 7, 8), t, { face: 'happy', flip: false, spin: Math.PI, shadow: true });
  ctx.restore();
  fxBokeh(ctx, t, 3, 9, { a: .35 * u, y0: 120, y1: 500 });
  d_post(ctx, t, { vig: .45 });
}

/* ============ 10–11  NÃO É SOBRE SORTE, É SOBRE MOVER (60.30–63.12) ============ */
function d_s10(ctx, t, L, D) { // corrida lateral
  const u = L / D, camX = (t - 60.3) * 900, y0 = 560, mood = lerp(1.55, 1.3, u);
  drawQuebrada(ctx, camX, y0 - 20, mood, { t, fog: 1.2 });
  drawBecoGround(ctx, y0, mood, camX, {});
  // sorte, esmagada no chão, passando
  const sx = 1500 - camX; d_die(ctx, sx, y0 + 66, 1.0, .5, .5); d_clover(ctx, sx + 230, y0 + 78, 1.0, .4, .42);
  const sx2 = 2150 - camX; d_clover(ctx, sx2, y0 + 70, .8, 1.2, .4);
  const ph = D_ON(t) * 13, bob = Math.abs(Math.sin(ph)) * 3;
  d_hero(ctx, 520 + Math.sin(t * 3) * 6, y0 + 56, 58, runPose(ph, 18), t, { face: 'determined' });
  parallelLines(ctx, 0, t, { n: 26, col: '#ffffff', a: .2, seed: 4 });
  // postes passando na frente (borrão)
  ctx.save(); ctx.globalAlpha = .9; for (let k = 0; k < 2; k++) { const px = ((k * 1400 - camX * 1.9) % 2800 + 2800) % 2800 - 700; if (px > -80 && px < W + 80) { ctx.fillStyle = 'rgba(46,54,66,.85)'; ctx.fillRect(px - 8, 0, 16, H); } } ctx.restore();
  d_post(ctx, t, { vig: .5 });
}
function d_s11(ctx, t, L, D) { // pés correndo sobre o dado e o trevo amassados
  const u = L / D, camX = (t - 61.82) * 1300 + 1900, y0 = 600;
  ctx.save(); ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#9aa5b0'], [1, '#78828e']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  drawBecoGround(ctx, 330, 1.45, camX * 1.2, {});
  ctx.fillStyle = 'rgba(30,36,50,.15)'; ctx.fillRect(0, 330, W, 390);
  const ox = u * 0;
  d_die(ctx, 2480 - camX, 640, 2.2, .3, .5); d_clover(ctx, 2900 - camX, 650, 2.4, .8, .45); d_clover(ctx, 2180 - camX, 660, 1.5, 2.1, .4);
  const ph = D_ON(t) * 13;
  d_hero(ctx, 620, 650, 120, runPose(ph, 12), t, { face: 'determined' });
  // gotas de lama
  ctx.fillStyle = 'rgba(190,200,210,.7)'; const r = rng(Math.floor(t * 14)); for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(520 - r() * 160, 640 - r() * 70, 1.6 + r() * 3, 0, TAU); ctx.fill(); }
  parallelLines(ctx, 0, t, { n: 30, col: '#ffffff', a: .25, seed: 9 });
  d_post(ctx, t, { vig: .6 });
}

/* ============ 12–13  CHEGAR EM CASA (63.12–65.88) ============ */
function d_s12(ctx, t, L, D) {
  const u = L / D, camX = (t - 63.12) * 120, y0 = 560;
  drawQuebrada(ctx, camX, y0 - 20, 0, { t, fog: 1.2 });
  drawBecoGround(ctx, y0, 0, camX, { lamps: [800, 1500] });
  drawPoste(ctx, 880 - camX, y0 + 6, 360, 0, { t, span: 520, on: 1 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 880 - camX + 40, y0 - 340, 0, 260, [[0, 'rgba(255,210,140,.45)'], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(500 - camX, y0 - 620, 800, 800); ctx.restore();
  const hx = lerp(260, 620, E.io2(u)), ph = t * 8.5, pose = Object.assign(walkPose(ph, 5), { aR: [-8, -4], aL: [-14 + Math.sin(ph) * 20, 6 + Math.sin(ph) * 20] });
  d_hero(ctx, hx, y0 + 52, 60, pose, t, { face: 'happy', rim: '#ffcc80' });
  const hp = charPt(hx, y0 + 52, 60, pose, 'aR'); d_bread(ctx, hp[0] + 6, hp[1] + 4, .9, .06 + Math.sin(ph) * .05);
  fxRain(ctx, t, { n: 40, a: .2, len: 34, col: '190,210,240' });
  d_post(ctx, t, { night: true, vig: .6 });
}
function d_s13(ctx, t, L, D) { // a porta se abre
  const u = L / D, open = E.out3(seg(u, .12, .55)), zz = lerp(1.0, 1.1, u);
  ctx.save(); cam(ctx, { x: 640, y: 380, z: zz });
  const info = intDoorway(ctx, t, { open, cx: 760, floorY: 600 });
  const D0 = info.door;
  // mãe aparece na porta
  const mu = E.out2(seg(u, .3, .62));
  if (mu > 0) { ctx.save(); ctx.globalAlpha = mu; d_maeAt(ctx, 770 - (1 - mu) * 30, 590, 43, t, u > .75 ? 'wide' : 'stand', 'happy'); ctx.restore(); }
  const hpose = Object.assign({}, POSE.stand, { aR: [24, 30 - 30 * seg(u, .5, .8)], hR: 'fist' });
  d_hero(ctx, 470, 642, 56, hpose, t, { face: 'happy', rim: '#ffcc80', light: 1 });
  const hp = charPt(470, 642, 56, hpose, 'aR'); d_bread(ctx, hp[0] + 6, hp[1] + 2, .86, .02);
  ctx.restore();
  d_post(ctx, t, { night: true, vig: .5 });
}
function d_maeAt(ctx, x, y, s, t, pose, face, o = {}) { return drawChar(ctx, x, y, s, POSE[pose] || pose, Object.assign({ who: 'mae', t: D_ON(t), face, rimA: .6, rim: '#ffd9a0' }, o)); }

/* ============ 14–15  O ABRAÇO (65.88–67.52) ============ */
function d_s14(ctx, t, L, D) {
  const u = L / D, zz = lerp(1.05, 1.28, E.io2(u));
  ctx.save(); cam(ctx, { x: lerp(690, 650, u), y: 400, z: zz, r: lerp(-.02, .02, u) });
  intDoorway(ctx, t, { open: 1, cx: 770, floorY: 600 });
  const bounce = Math.sin(t * 9) * .02;
  d_maeAt(ctx, 700, 612, 54, t, 'hug', 'closed', { flip: true });
  d_hero(ctx, 600, 618, 58, POSE.hugged, t, { face: 'happy', rim: '#ffcc80', light: 1 });
  drawChar(ctx, 540, 624, 80, Object.assign({}, POSE.hug, { lean: 6 }), { who: 'irmao', t: D_ON(t), face: 'happy', rim: '#ffd9a0' });
  fxBokeh(ctx, t, 5, 8, { a: .5, y0: 100, y1: 500, r0: 12, r1: 40 });
  ctx.restore();
  d_post(ctx, t, { night: true, vig: .45 });
}
function d_s15(ctx, t, L, D) { // rostos
  const u = L / D;
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#e9a85a'], [1, '#a85a2c']]); ctx.fillRect(0, 0, W, H);
  fxBokeh(ctx, t, 7, 14, { a: .6, r0: 20, r1: 80 }); fxGodRays(ctx, 640, 320, t, { a: .14, n: 14 });
  const zz = lerp(1.0, 1.1, E.io2(u));
  ctx.save(); ctx.translate(640, 360); ctx.scale(zz, zz); ctx.translate(-640, -360);
  const face = (who, x, y, R, rot, f, ex = {}) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(R, R); const cfg = C2W[who]; drawHead(ctx, who, Object.assign({ who, face: f, t: D_ON(t), rim: '#ffe0b0', rimA: .8 }, ex), undefined, D_ON(t)); ctx.restore(); };
  face('mae', 900, 380, 150, .12, 'closed'); face('irmao', 380, 420, 118, -.14, 'happy'); face('hero', 640, 360, 180, .02, 'cry');
  ctx.restore();
  // lágrima/brilho
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const a = (t * .5 + i / 12) % 1; sparkle(ctx, 200 + i * 80 + Math.sin(i) * 20, 700 - a * 600, 5 + (i % 3) * 3, t * 2, `rgba(255,236,190,${.8 * Math.sin(a * Math.PI)})`); } ctx.restore();
  d_post(ctx, t, { night: true, vig: .35 });
}

/* ============ 16  A LUTA NÃO TEM PAUSA — NEM FIM: ∞ (67.52–69.10) ============ */
function d_s16(ctx, t, L, D) {
  const u = L / D, y0 = 560;
  ctx.save(); cam(ctx, { x: 640, y: 380, z: lerp(1.0, 1.14, E.io2(u)), r: Math.sin(t * 1.1) * .012 });
  drawRoof(ctx, t, { mood: lerp(1.2, .8, u), y0: 440, city: true, tank: .9, varal: [.02, .4], seed: 6 });
  const bp = beatInfo(t), cx = 640, cy = 360, A = lerp(108, 108, u), th = t * 5.2;
  const lem = (a, A2, k = 1) => [cx + A2 * Math.cos(a) / (1 + Math.sin(a) ** 2), cy + A2 * .78 * Math.sin(a) * Math.cos(a) / (1 + Math.sin(a) ** 2) * k];
  // hero: braços em IK seguem a lemniscata
  const hs = 66, hy = 600, bob = Math.sin(th * 2) * .05, pose0 = Object.assign({}, POSE.fist, { lean: 4, spread: .8, hs: .7, lR: [20, -8], lL: [-20, 8], air: .06 + .06 * Math.abs(Math.sin(th)) });
  const shR = charPt(640, hy, hs, pose0, skeleton(pose0).shR), shL = charPt(640, hy, hs, pose0, skeleton(pose0).shL);
  const gR = lem(th, A), gL = lem(th + Math.PI, A);
  const pose = Object.assign({}, pose0, { aR: d_ik(shR, gR, hs * 1.05), aL: d_ik(shL, gL, hs * 1.05).map(v => v), hR: 'fist', hL: 'fist' });
  // rastro de luz do ∞ (cresce até cobrir a tela)
  const grow = E.io2(seg(u, .35, .95)), AA = A * (1 + grow * 2.4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const trail = (th0, A2, wid, a, len) => { for (let k = 0; k < 2; k++) { const N = 60; ctx.beginPath(); for (let i = 0; i <= N; i++) { const q = lem(th0 - len * (i / N) + k * Math.PI, A2); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = `rgba(${D_GOLD_RGB},${a})`; ctx.lineWidth = wid; ctx.stroke(); } };
  // ∞ completo e tênue
  ctx.beginPath(); for (let i = 0; i <= 80; i++) { const q = lem(i / 80 * TAU, AA); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.strokeStyle = `rgba(${D_GOLD_RGB},${.12 + .35 * grow})`; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = `rgba(255,244,214,${.2 + .6 * grow})`; ctx.lineWidth = 3.6; ctx.stroke();
  trail(th, A, 9, .35, 2.4); trail(th, A, 3, .85, 1.6);
  ctx.restore();
  d_hero(ctx, 640, hy, hs, pose, t, { face: 'determined', shadow: true });
  // luvas
  for (const [g, c] of [[gR, '#e04a4a'], [gL, '#d03a48']]) { ctx.save(); ctx.translate(g[0], g[1]); ctx.fillStyle = c; ctx.strokeStyle = '#6a1a24'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-7, -8, 6, 4, -.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#f2ead8'; ctx.fillRect(-14, 17, 28, 9); ctx.strokeRect(-14, 17, 28, 9); ctx.restore(); }
  ctx.restore();
  fxBokeh(ctx, t, 11, 8, { a: .3 * grow, y0: 100, y1: 600 });
  if (bp.pulse > .5) flash(ctx, (bp.pulse - .5) * .12, '255,226,160');
  d_post(ctx, t, { vig: .5 });
}

/* ============ 17–18  ESCURO DEMAIS PRA VER (69.10–71.90) ============ */
function d_s17(ctx, t, L, D) {
  const u = L / D, dark = sstep(0, .9, u);
  ctx.save(); cam(ctx, { x: 640, y: 360, z: lerp(1.0, 1.12, E.io2(u)) });
  drawRoof(ctx, t, { mood: 0, y0: 470, city: true, tank: .88, varal: [.02, .35], seed: 6, q: { lit: 1 - dark * .98, lights: 0, kites: false } });
  d_hero(ctx, 640, 560, 62, POSE.slump, t, { face: 'sad', rim: '#6fa8d8', pendantGlow: .25 + .3 * dark });
  ctx.restore();
  // escurece, vinheta fecha em volta dela
  const R = lerp(900, 190, E.io2(u));
  ctx.fillStyle = rg(ctx, 640, 380, R * .15, R, [[0, 'rgba(2,4,10,0)'], [.55, `rgba(2,4,10,${.55 * dark})`], [1, `rgba(2,4,10,${.97})`]]); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = `rgba(2,4,10,${.5 * dark})`; ctx.fillRect(0, 0, W, H);
  d_post(ctx, t, { night: true, vig: .6 });
}
function d_s18(ctx, t, L, D) { // só a cicatriz brilha, fraca
  const u = L / D;
  ctx.fillStyle = '#04070d'; ctx.fillRect(0, 0, W, H);
  const pose = Object.assign({}, POSE.stand, { lean: 0, head: 10 }), s = lerp(250, 285, E.io2(u)), k = skeleton(pose);
  const cxs = 640 + Math.sin(t * .8) * 3, cys = 380, hx = cxs - k.chest[0] * s, hy = cys + (k.foot - k.chest[1]) * s;
  const gl = (.16 + .2 * (.5 + .5 * Math.sin(t * 2.4))) * (1 - sstep(.8, 1, u) * .4);
  d_hero(ctx, hx, hy, s, pose, t, { scar: gl * 1.6, open: 1, pendant: 0, pendantGlow: 0, face: 'closed', rim: '#2a3f5c', rimA: .35, shadow: false, scarGlow: gl });
  // véu escuro sobre tudo, deixa só um halo fraco na cicatriz
  ctx.fillStyle = 'rgba(3,6,12,.72)'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cxs, cys + 6, 0, 170, [[0, `rgba(${D_GOLD_RGB},${gl * 1.1})`], [1, `rgba(${D_GOLD_RGB},0)`]]); ctx.fillRect(cxs - 180, cys - 170, 360, 360); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawScar(ctx, cxs, cys + 4, 70, gl * 2.2, t); ctx.restore();
  fxVignette(ctx, .9, '0,0,4');
}

/* ============ 19  A MÃO DE LUZ (71.90–72.80) ============ */
function d_s19(ctx, t, L, D) {
  const u = L / D, p = E.io2(seg(u, .1, .93)), flashA = sstep(.86, 1, u);
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#070b16'], [1, '#12182a']]); ctx.fillRect(0, 0, W, H);
  fxBokeh(ctx, t, 4, 8, { a: .28 * (.4 + p), cols: ['255,170,200', D_GOLD_RGB], y0: 100, y1: 600 });
  const cy = 392, sc = 1.18, xl = lerp(-170, 438, p), xr = lerp(1450, 842, p);
  // luz que nasce da mão estendida
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, xr - 230, cy - 160 * sc, 0, 420, [[0, `rgba(255,170,205,${.35 * p + .12})`], [.5, `rgba(${D_GOLD_RGB},${.14 * p})`], [1, 'rgba(255,170,205,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
  // mão dela (pele marrom, cuff do moletom)
  bigHand(ctx, xl, cy, sc, Math.PI / 2, lerp(.55, .12, p), { col: '#b8754d', cuff: '#ecaa2a' });
  // mão luminosa: silhueta rosa-dourada translúcida
  ctx.save(); ctx.globalAlpha = .88; bigHand(ctx, xr, cy - 8, sc, -Math.PI / 2, lerp(.5, .1, p), { col: '#ffc9e0', ol: '#ff9fcf', sh: '#ffe3b0', olw: 4, cuff: '#fff0c8' }); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55; bigHand(ctx, xr, cy - 8, sc * 1.03, -Math.PI / 2, lerp(.5, .1, p), { col: '#ffb0d4', ol: '#ffd9a0', sh: '#ffd9a0', olw: 10 }); ctx.restore();
  for (let i = 0; i < 18; i++) { const a = ((t * .9 + i * .137) % 1), px = xr - 200 + Math.sin(i * 7 + t * 2) * 80 - a * 120, py = cy - 110 + Math.cos(i * 3.1) * 90 + a * -30; sparkle(ctx, px, py, 3 + (i % 4) * 2.2, t * 2 + i, `rgba(255,${200 + i * 3},${210 - i * 4},${.8 * Math.sin(a * Math.PI)})`); }
  // o toque
  if (p > .95) { const k = seg(u, .88, 1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 640, cy - 90, 0, 120 + k * 900, [[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,230,190,.7)'], [1, 'rgba(255,200,160,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore(); sparkle(ctx, 640, cy - 90, 30 + k * 300, t, 'rgba(255,255,255,.95)'); }
  fxVignette(ctx, .55, '3,5,12');
  if (flashA > 0) { ctx.fillStyle = `rgba(255,255,255,${flashA})`; ctx.fillRect(0, 0, W, H); }
}

const SCENES_D = [
  { t0: 48.30, t1: 49.07, name: 'd_queda1_escada', fn: d_s1 },
  { t0: 49.07, t1: 49.82, name: 'd_queda2_rua_molhada', fn: d_s2 },
  { t0: 49.82, t1: 50.84, name: 'd_queda3_degrau_joelho', fn: d_s3 },
  { t0: 50.84, t1: 52.57, name: 'd_corda_geral', fn: d_s4 },
  { t0: 52.57, t1: 54.26, name: 'd_corda_pes_vazio', fn: d_s5 },
  { t0: 54.26, t1: 55.82, name: 'd_ceu_contra_plongee', fn: d_s6 },
  { t0: 55.82, t1: 57.14, name: 'd_olhar_sem_sinal', fn: d_s7 },
  { t0: 57.14, t1: 58.82, name: 'd_traco_giz', fn: d_s8 },
  { t0: 58.82, t1: 60.30, name: 'd_estrada_dourada', fn: d_s9 },
  { t0: 60.30, t1: 61.82, name: 'd_corrida_lateral', fn: d_s10 },
  { t0: 61.82, t1: 63.12, name: 'd_pes_sorte_amassada', fn: d_s11 },
  { t0: 63.12, t1: 64.57, name: 'd_chegando_com_pao', fn: d_s12 },
  { t0: 64.57, t1: 65.88, name: 'd_porta_mae', fn: d_s13 },
  { t0: 65.88, t1: 66.70, name: 'd_abraco', fn: d_s14 },
  { t0: 66.70, t1: 67.52, name: 'd_rostos', fn: d_s15 },
  { t0: 67.52, t1: 69.10, name: 'd_infinito_luvas', fn: d_s16 },
  { t0: 69.10, t1: 70.50, name: 'd_escurece_laje', fn: d_s17 },
  { t0: 70.50, t1: 71.90, name: 'd_so_a_cicatriz', fn: d_s18 },
  { t0: 71.90, t1: 72.80, name: 'd_mao_de_luz', fn: d_s19 },
];
const IMPACTS_D = [
  { t: 48.62, d: .07, type: 'flash' }, { t: 49.37, d: .07, type: 'flash' }, { t: 50.12, d: .07, type: 'flash' },
  { t: 72.74, d: .07, type: 'white' },
];
globalThis.SCENES_D = SCENES_D; globalThis.IMPACTS_D = IMPACTS_D;   // main.js lê via globalThis (const de script não vira propriedade)
