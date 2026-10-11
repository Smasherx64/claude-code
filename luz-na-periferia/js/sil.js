'use strict';
/* ============================================================
   sil.js — KIT DE PERSONAGENS do remake "Luz na Periferia" (silhuetas stick, figura mágica, mãos, olhos, animação)

   CONVENÇÕES
   · Unidade de esqueleto "u" = `s` px.  Herói de pé ≈ 6·s de altura (cabeça r=.62u, tronco 1.85u, pernas 2.65u) + boné.
     Ex.: s=30 → 180 px (multidão/plano geral) · s=75 → 450 px · s=150 → 900 px (close).
   · (x,y) = ponto do CHÃO sob os pés (centro).  O boneco olha para a DIREITA (+x); `o.flip:true` espelha.
   · Ângulos de pose em GRAUS, medidos a partir de "para baixo", + = direita da tela (como no chars.js antigo).
     lean = inclinação do tronco (+ = para a frente/direita) · head = ângulo da cabeça relativo ao tronco (− = olha para cima)
     aR/aL = [braço, antebraço] ABSOLUTOS · lR/lL = [coxa, canela] ABSOLUTOS · spread/hs = largura dos ombros/quadris
     (0.1 = visto de lado, .8 = visto de frente).  Campos extras: air/lift (u acima do chão), dx (u), sq (squash +/stretch −),
     sx (−1..1 giro em torno do eixo vertical, pirueta), tip (0..1 ponta dos pés), aRs/aLs (escala do braço, p/ apontar à câmera),
     hR/hL ('fist'|'point'|'flat'|'cam'|''), flare (saia/capa da mágica), ph (fase, usado em movimento secundário), rise (dica: altura ganha em degraus).
   · Poses são OBJETOS PUROS: use lerpPose(a,b,u). Funções de ciclo recebem fase em RADIANOS (2π = ciclo completo).
   · Opções comuns: o.t (s, movimento secundário), o.flip, o.alpha, o.squash(+achata)/o.stretch(+estica), o.rot (rad, horário, em torno do quadril),
     o.lift (u), o.shadow:false, o.rim:{col,dx,dy,a,w} (ou array), o.amb (cor ambiente que tinge a silhueta), o.glow, o.scar, o.sweat …
   · Tudo determinístico (sem Math.random/Date). Helpers prefixados com `sl`.
   ============================================================ */
var SL_K = { T: 1.85, NK: .78, HR: .62, L1: 1.35, L2: 1.3, A1: 1.15, A2: 1.1 };
var SL_BLACK = '#07070d';
function slK(g) { const m = g.getTransform(); return Math.hypot(m.a, m.b) || 1; }

/* ---------------- poses ---------------- */
var SL_DEF = { lean: 0, head: 0, spread: .8, hs: .55, aR: [7, 5], aL: [-7, -5], lR: [3, 0], lL: [-3, 0], air: 0, lift: 0, dx: 0, sx: 1, sq: 0, tip: 0, aRs: 1, aLs: 1, hR: '', hL: '', flare: 0, ph: 0 };
function slFill(p) { const o = {}; for (const k in SL_DEF) o[k] = SL_DEF[k]; if (p) for (const k in p) if (p[k] !== undefined) o[k] = p[k]; return o; }

var POSE = {
  stand: { lean: 0, head: 0, spread: .8, hs: .55, aR: [7, 5], aL: [-7, -5], lR: [3, 0], lL: [-3, 0] },
  lookUp: { lean: -5, head: -30, spread: .8, hs: .55, aR: [8, 4], aL: [-8, -4], lR: [3, 0], lL: [-3, 0] },
  hunch: { lean: 24, head: 30, spread: .7, hs: .5, aR: [16, 10], aL: [-6, -2], lR: [10, -8], lL: [-6, 4] },
  slump: { lean: 18, head: 26, spread: .8, hs: .5, aR: [10, 4], aL: [-10, -4], lR: [6, 0], lL: [-6, 0] },
  crouch: { lean: 34, head: -8, spread: .8, hs: .7, aR: [58, 30], aL: [-60, -34], lR: [64, -68], lL: [-60, -70] },
  kneel: { lean: 8, head: 10, spread: .8, hs: .6, aR: [20, 50], aL: [-20, -40], lR: [84, 6], lL: [-8, -86] },
  sit: { lean: 6, head: 6, spread: .8, hs: .5, aR: [18, 60], aL: [-26, -70], lR: [88, 86], lL: [80, 72] },
  sitKnees: { lean: 14, head: 12, spread: .6, hs: .5, aR: [30, 160], aL: [-30, -160], lR: [60, -120], lL: [50, -126] },
  reach: { lean: -12, head: -16, spread: .9, hs: .6, aR: [130, 150], aL: [-14, -8], lR: [14, 0], lL: [-10, 6] },
  point: { lean: -4, head: -6, spread: .85, hs: .6, aR: [100, 98], aL: [-14, -8], lR: [20, 0], lL: [-8, 4], hR: 'point' },
  pointCam: { lean: -2, head: -2, spread: .85, hs: .55, aR: [105, 125], aL: [-8, -6], lR: [8, 0], lL: [-6, 0], hR: 'cam', aRs: .55 },
  cheer: { lean: -8, head: -12, spread: .85, hs: .8, aR: [160, 170], aL: [-160, -170], lR: [26, 0], lL: [-26, 0], hR: 'fist', hL: 'fist' },
  Vup: { lean: -3, head: -10, spread: .85, hs: .75, aR: [148, 166], aL: [-148, -166], lR: [20, 2], lL: [-20, -2] },
  hug: { lean: 8, head: 10, spread: .8, hs: .5, aR: [92, 108], aL: [60, 100], lR: [10, 0], lL: [-8, 0] },
  sleep: { lean: 90, head: 0, spread: .8, hs: .5, aR: [92, 96], aL: [84, 80], lR: [-90, -92], lL: [-86, -90] },
  fallFlat: { lean: 84, head: 24, spread: .9, hs: .6, aR: [118, 140], aL: [-150, -170], lR: [-80, -86], lL: [-62, -34] },
  hands2knees: { lean: 66, head: -26, spread: .9, hs: .6, aR: [10, 4], aL: [-6, 0], lR: [64, -4], lL: [58, -10] },
  rise: { lean: 30, head: 10, spread: .8, hs: .7, aR: [70, 20], aL: [-20, 0], lR: [64, -64], lL: [-34, 20] },
  wave: { lean: -2, head: 6, spread: .8, hs: .5, aR: [150, 175], aL: [-8, -6], lR: [4, 0], lL: [-4, 0] },
  shrug: { lean: 0, head: 10, spread: .9, hs: .5, aR: [60, 130], aL: [-60, -130], lR: [4, 0], lL: [-4, 0] },
  fist: { lean: -4, head: -4, spread: .8, hs: .55, aR: [25, 200], aL: [-25, -200], lR: [10, 0], lL: [-10, 0], hR: 'fist', hL: 'fist' },
  hip: { lean: 6, head: 8, spread: .8, hs: .6, aR: [60, -20], aL: [-60, 20], lR: [14, 0], lL: [-20, 8] },
  wide: { lean: 0, head: 0, spread: .85, hs: .8, aR: [100, 98], aL: [-100, -98], lR: [24, 4], lL: [-24, -4] },
  kick: { lean: -10, head: -6, spread: .85, hs: .5, aR: [150, 130], aL: [-70, -20], lR: [75, 20], lL: [-6, 4] },
  cower: { lean: 20, head: 22, spread: .7, hs: .5, aR: [30, 160], aL: [-30, -160], lR: [24, -30], lL: [-24, 30] },
  heart: { lean: 0, head: 8, spread: .85, hs: .6, aR: [160, -150], aL: [-160, 150], lR: [14, 0], lL: [-14, 0] },
  twirl: { lean: 0, head: 6, spread: .8, hs: .3, aR: [100, 90], aL: [-100, -90], lR: [8, 0], lL: [-30, 50], lift: .5 },
  carry: { lean: 34, head: -14, spread: .45, hs: .3, aR: [-150, -166], aL: [-140, -160], lR: [24, -10], lL: [-10, 10], hR: 'fist', hL: 'fist' },
  run: { lean: 16, head: -8, spread: .12, hs: .12, aR: [-40, 20], aL: [50, 130], lR: [60, -30], lL: [-34, -50], hR: 'fist', hL: 'fist' },
  balance: { lean: 0, head: 0, spread: .85, hs: .1, aR: [88, 90], aL: [-88, -90], lR: [4, 0], lL: [-3, 0], hR: 'flat', hL: 'flat' },
  fall: { lean: 38, head: 26, spread: .9, hs: .6, aR: [140, 160], aL: [-130, -150], lR: [-30, -50], lL: [30, 20], lift: .6 },
  /* pose genérica de pessoa à pé (para o elenco) */
  idle: { lean: 2, head: 4, spread: .5, hs: .3, aR: [8, 10], aL: [-6, -4], lR: [2, 0], lL: [-2, 0] }
};

function lerpPose(a, b, u) {
  a = slFill(a); b = slFill(b); const o = {};
  for (const k in SL_DEF) {
    const A = a[k], B = b[k];
    if (Array.isArray(A)) o[k] = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
    else if (typeof A === 'string') o[k] = u < .5 ? A : B;
    else o[k] = A + (B - A) * u;
  }
  return o;
}
/* sequência de poses-chave [[u, pose, easing?], ...] -> pose em u (easing por segmento: função E.* opcional, default io2) */
function slKeys(keys, u) {
  if (u <= keys[0][0]) return slFill(keys[0][1]);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (u <= b[0]) { const f = (u - a[0]) / (b[0] - a[0] || 1), e = (b[2] || E.io2)(f); return lerpPose(a[1], b[1], e); }
  }
  return slFill(keys[keys.length - 1][1]);
}
function slP(o) { return Object.assign({}, POSE.stand, o); }

/* ---------------- esqueleto ---------------- */
/* skeleton(pose, o) -> { neck, head, ha, shc, shR, shL, aR[3], aL[3], lR[3], lL[3], toeR, toeL, hip:[0,0], chest, waist, ground, lift, hand:{R,L}, la }
   Coordenadas em u com origem no QUADRIL (y p/ baixo). `ground` = y do chão (ponto mais baixo do corpo). */
function skeleton(pose, o) {
  const p = slFill(pose), br = (o && o.br) || 0, K = SL_K;
  const la = rad(p.lean), ux = Math.sin(la), uy = -Math.cos(la);
  const neck = [ux * K.T, uy * K.T - br * .03], ha = rad(p.lean + p.head);
  const head = [neck[0] + Math.sin(ha) * K.NK, neck[1] - Math.cos(ha) * K.NK];
  const sp = p.spread * .5, hs = p.hs * .6;
  const shc = [ux * (K.T - .24), uy * (K.T - .24) - br * .03];
  const px = Math.cos(la), py = Math.sin(la);
  const shR = [shc[0] + px * sp, shc[1] + py * sp], shL = [shc[0] - px * sp, shc[1] - py * sp];
  const lim = (o0, a, b, L1, L2) => { const j = [o0[0] + Math.sin(rad(a)) * L1, o0[1] + Math.cos(rad(a)) * L1]; return [o0, j, [j[0] + Math.sin(rad(b)) * L2, j[1] + Math.cos(rad(b)) * L2]]; };
  const k = { neck, head, ha, shc, shR, shL, la, hip: [0, 0] };
  k.aR = lim(shR, p.aR[0], p.aR[1], K.A1 * p.aRs, K.A2 * p.aRs); k.aL = lim(shL, p.aL[0], p.aL[1], K.A1 * p.aLs, K.A2 * p.aLs);
  k.lR = lim([hs, 0], p.lR[0], p.lR[1], K.L1, K.L2); k.lL = lim([-hs, 0], p.lL[0], p.lL[1], K.L1, K.L2);
  // pés
  const yR = k.lR[2][1], yL = k.lL[2][1], ym = Math.max(yR, yL);
  const toe = (l, y) => { const sh = l[2]; let fa = clamp(-.45 * (Math.atan2(l[2][0] - l[1][0], l[2][1] - l[1][1]) * 180 / Math.PI), -25, 55); if (y >= ym - .12) fa *= .25; fa += 62 * p.tip; return [sh[0] + Math.cos(rad(fa)) * .55, sh[1] + Math.sin(rad(fa)) * .55]; };
  k.toeR = toe(k.lR, yR); k.toeL = toe(k.lL, yL);
  k.hR = slHandEnd(k.aR), k.hL = slHandEnd(k.aL);
  k.chest = [ux * K.T * .66, uy * K.T * .66]; k.waist = [ux * .3, uy * .3];
  // giro em torno do eixo vertical
  if (p.sx !== 1) {
    const f = p.sx, sc = a => { a[0] *= f; };
    [k.neck, k.head, k.shc, k.shR, k.shL, k.chest, k.waist, k.toeR, k.toeL, k.hR, k.hL].forEach(sc); k.aR.forEach(sc); k.aL.forEach(sc); k.lR.forEach(sc); k.lL.forEach(sc);
  }
  let g = Math.max(k.toeR[1] + .13, k.toeL[1] + .13, k.lR[2][1] + .15, k.lL[2][1] + .15, k.lR[1][1] + .23, k.lL[1][1] + .23, k.hR[1] + .16, k.hL[1] + .16, k.aR[1][1] + .18, k.aL[1][1] + .18, k.head[1] + K.HR, k.neck[1] + .2, .36);
  k.ground = g; k.lift = p.air + p.lift + p.tip * .34; k.p = p;
  return k;
}
function slHandEnd(a) { const dx = a[2][0] - a[1][0], dy = a[2][1] - a[1][1], L = Math.hypot(dx, dy) || 1; return [a[2][0] + dx / L * .14, a[2][1] + dy / L * .14]; }

/* aplica na ctx a cadeia de transformação do personagem: depois dela, desenha-se em u com origem no quadril */
function slXform(g, x, y, s, k, o, f) {
  const p = k.p, sq = (o.squash || 0) - (o.stretch || 0) + p.sq, lift = k.lift + (o.lift || 0);
  g.translate(x, y); g.scale(1 + .55 * sq, 1 - sq);
  g.translate((p.dx + (o.dx || 0)) * s * f, -lift * s); g.translate(0, -k.ground * s);
  if (o.rot) g.rotate(o.rot);
  g.scale(f * s, s);
}
var SL_PT = { handR: 'hR', handL: 'hL', wristR: ['aR', 2], wristL: ['aL', 2], elbowR: ['aR', 1], elbowL: ['aL', 1], kneeR: ['lR', 1], kneeL: ['lL', 1], footR: ['lR', 2], footL: ['lL', 2], toeR: 'toeR', toeL: 'toeL', shoulderR: 'shR', shoulderL: 'shL' };
/* charPt(x,y,s,pose,'handR'|'handL'|'head'|'chest'|'footL'|'footR'|'neck'|'hip'|'top'|'kneeR'..., o) -> [px,py] na tela */
function charPt(x, y, s, pose, name, o) {
  o = o || {}; const k = skeleton(pose, o), f = o.flip ? -1 : 1, p = k.p;
  let q = SL_PT[name] || name; if (Array.isArray(q)) q = k[q[0]][q[1]]; else if (typeof q === 'string') q = k[q];
  if (name === 'top') q = [k.head[0] + Math.sin(k.ha) * SL_K.HR, k.head[1] - Math.cos(k.ha) * SL_K.HR];
  if (name === 'ground') q = [0, k.ground];
  if (!q) q = k.hip;
  let vx = q[0] * f * s, vy = q[1] * s;
  if (o.rot) { const c = Math.cos(o.rot), sn = Math.sin(o.rot), a = vx * c - vy * sn, b = vx * sn + vy * c; vx = a; vy = b; }
  const sq = (o.squash || 0) - (o.stretch || 0) + p.sq, lift = k.lift + (o.lift || 0);
  vx += (p.dx + (o.dx || 0)) * s * f; vy += -lift * s - k.ground * s;
  return [x + vx * (1 + .55 * sq), y + vy * (1 - sq)];
}

/* ---------------- ciclos de animação ---------------- */
/* runPose(ph, lean=16, amp=1): ph em rad. Contato (φ≈π/2) → apoio → passagem (φ≈0/π) → voo (duas vezes por ciclo). Braços opostos, antebraço dobrado, cabeça com atraso. */
function runPose(ph, lean, amp) {
  lean = lean == null ? 16 : lean; amp = amp == null ? 1 : amp;
  const leg = f => { const s = Math.sin(f), c = Math.cos(f), th = 12 + 54 * amp * s, bend = 20 + 100 * amp * Math.pow(Math.max(0, c), .85); return [th, th - bend]; };
  const arm = f => { const s = Math.sin(f - .35), ua = 6 + 54 * amp * s; return [ua, ua + 70 + 24 * s]; };
  const sA = Math.sin(ph);
  const flight = Math.pow(Math.max(0, Math.sin(2 * ph + .35)), .9);
  return { lean: lean + 2.5 * Math.sin(2 * ph + .6), head: -lean * .55 + 4 * Math.sin(2 * ph - .5), spread: .12, hs: .1, aR: arm(ph + Math.PI), aL: arm(ph), lR: leg(ph), lL: leg(ph + Math.PI), air: (.34 * flight) * amp, hR: 'fist', hL: 'fist', ph, sq: -.04 * flight + .03 * (1 - flight) * Math.abs(Math.cos(ph)) };
}
function sprintPose(ph) { const p = runPose(ph, 28, 1.28); p.air *= 1.2; p.head += 6; return p; }
/* walkPose(ph): caminhada de lado, com balanço de braços e quicar de quadril */
function walkPose(ph, lean) {
  lean = lean == null ? 3 : lean;
  const leg = f => { const s = Math.sin(f), c = Math.cos(f), th = 26 * s, bend = 6 + 46 * Math.pow(Math.max(0, c), 1.4); return [th, th - bend]; };
  const arm = f => { const s = Math.sin(f), ua = 20 * s; return [ua, ua + 10 + 12 * Math.max(0, s)]; };
  return { lean: lean + 1.2 * Math.sin(2 * ph), head: 1 + 2 * Math.sin(2 * ph - .6), spread: .15, hs: .12, aR: arm(ph + Math.PI - .25), aL: arm(ph - .25), lR: leg(ph), lL: leg(ph + Math.PI), ph };
}
/* jumpPose(u 0..1, H=3): antecipação(0-.2) → impulso(.2-.28, stretch) → subida/apogeu/queda(.26-.78, air parabólico) → contato/amortecimento(.78-.92, squash) → recupera. */
function jumpPose(u, H) {
  H = H == null ? 3 : H; u = clamp(u);
  const K = [
    [0, POSE.stand],
    [.18, { lean: 36, head: -22, spread: .8, hs: .7, aR: [-34, -50], aL: [-40, -60], lR: [70, -64], lL: [60, -70], sq: .2 }, E.out2],
    [.27, { lean: 4, head: -8, spread: .8, hs: .6, aR: [150, 162], aL: [-140, -156], lR: [-4, -6], lL: [-8, -10], sq: -.16, tip: .9 }, E.in2],
    [.4, { lean: 0, head: -10, spread: .8, hs: .7, aR: [138, 150], aL: [-132, -148], lR: [34, -36], lL: [10, -52], sq: -.05, tip: .2 }, E.out2],
    [.52, { lean: 8, head: -4, spread: .8, hs: .75, aR: [112, 120], aL: [-110, -122], lR: [74, -46], lL: [58, -62], sq: 0 }],
    [.66, { lean: 4, head: -6, spread: .85, hs: .7, aR: [124, 140], aL: [-120, -138], lR: [22, 10], lL: [-14, 4], sq: -.04 }, E.in2],
    [.78, { lean: 4, head: 0, spread: .85, hs: .65, aR: [100, 112], aL: [-96, -108], lR: [12, 6], lL: [-12, -4], sq: 0, tip: .3 }, E.lin],
    [.855, { lean: 32, head: 2, spread: .8, hs: .75, aR: [58, 40], aL: [-60, -42], lR: [62, -62], lL: [-58, -66], sq: .22 }, E.out2],
    [1, POSE.stand, E.io2]];
  const p = slKeys(K, u), ta = clamp((u - .26) / .52); p.air = H * 4 * ta * (1 - ta); p.ph = u; return p;
}
/* leapPose(u, H=2.4): salto longo horizontal: corrida → impulso → pernas abertas em tesoura no apogeu (como orig_04/05) → alcance de queda → rolagem leve. */
function leapPose(u, H) {
  H = H == null ? 2.4 : H; u = clamp(u);
  const K = [
    [0, { lean: 26, head: -14, spread: .15, hs: .1, aR: [-50, 20], aL: [60, 120], lR: [-44, -50], lL: [50, -40], hR: 'fist', hL: 'fist' }],
    [.2, { lean: 18, head: -14, spread: .15, hs: .1, aR: [-70, -20], aL: [95, 150], lR: [-58, -66], lL: [86, 30], sq: -.1, hR: 'fist', hL: 'fist' }, E.out2],
    [.45, { lean: 4, head: -18, spread: .5, hs: .5, aR: [150, 168], aL: [-124, -150], lR: [82, 78], lL: [-76, -92], sq: -.06 }, E.out2],
    [.62, { lean: 2, head: -14, spread: .5, hs: .5, aR: [132, 150], aL: [-110, -140], lR: [84, 70], lL: [-70, -88] }],
    [.84, { lean: 14, head: -6, spread: .6, hs: .5, aR: [100, 96], aL: [-80, -100], lR: [52, 14], lL: [-30, -52], sq: 0 }, E.in2],
    [.92, { lean: 36, head: 4, spread: .6, hs: .7, aR: [70, 40], aL: [-60, -40], lR: [70, -50], lL: [-40, -80], sq: .22 }, E.out2],
    [1, POSE.crouch, E.io2]];
  const p = slKeys(K, u), ta = clamp((u - .1) / .76); p.air = H * 4 * ta * (1 - ta); return p;
}
/* climbPose(ph, stepH=.9): subir degraus de lado, joelho alto, braço alcançando. `rise` = altura (u) acumulada p/ o chamador somar ao y. */
function climbPose(ph, stepH) {
  stepH = stepH == null ? .9 : stepH;
  const leg = f => { const s = Math.sin(f), c = Math.cos(f), th = 26 + 52 * s, bend = 12 + 80 * Math.pow(Math.max(0, c), 1.1); return [th, th - bend]; };
  const arm = f => { const s = Math.sin(f - .3), ua = 12 + 30 * s; return [ua, ua + 46 + 14 * s]; };
  return { lean: 16 + 2 * Math.sin(2 * ph), head: -8, spread: .14, hs: .1, aR: arm(ph + Math.PI), aL: arm(ph), lR: leg(ph), lL: leg(ph + Math.PI), rise: stepH * (ph / Math.PI), ph, hR: 'fist', hL: 'fist' };
}
/* carryPose(ph, eff=1): carregando peso enorme nas costas: tronco curvado, braços para cima/atrás, passos curtos, tremor e compressão. */
function carryPose(ph, eff) {
  eff = eff == null ? 1 : eff;
  const leg = f => { const s = Math.sin(f), c = Math.cos(f), th = 22 + 15 * s, bend = 30 + 34 * Math.pow(Math.max(0, c), 1.2); return [th, th - bend]; };
  const tr = (Math.sin(ph * 9.3) + .6 * Math.sin(ph * 14.1 + 1)) * 1.1 * eff, st = Math.sin(2 * ph);
  return { lean: 34 + 3 * st + tr, head: -16 + tr, spread: .45, hs: .22, aR: [-150 + tr * 2 - 4 * st, -166 + tr * 2], aL: [-140 + tr, -160 - tr], lR: leg(ph), lL: leg(ph + Math.PI), sq: .05 + .05 * (1 - st) * eff, ph, hR: 'fist', hL: 'fist' };
}
/* fallPose(u): desequilibra → braços girando → tombo → impacto (squash) → deitado */
function fallPose(u) {
  u = clamp(u);
  const K = [
    [0, POSE.stand],
    [.18, { lean: -10, head: -14, spread: .85, hs: .6, aR: [150, 170], aL: [-140, -160], lR: [12, 0], lL: [-16, -4], tip: .5 }, E.out2],
    [.4, { lean: 26, head: 16, spread: .9, hs: .6, aR: [160, 120], aL: [-110, -150], lR: [-26, -40], lL: [28, 14], lift: .3 }, E.io2],
    [.62, { lean: 62, head: 10, spread: .9, hs: .6, aR: [110, 130], aL: [-90, -120], lR: [-54, -80], lL: [-30, -66], lift: .4 }, E.in2],
    [.76, { lean: 84, head: 20, spread: .9, hs: .6, aR: [120, 140], aL: [-150, -170], lR: [-76, -86], lL: [-60, -40], lift: .1, sq: .16 }, E.in2],
    [.84, { lean: 84, head: 24, spread: .9, hs: .6, aR: [118, 140], aL: [-150, -170], lR: [-80, -86], lL: [-62, -34], sq: -.05 }, E.out2],
    [1, POSE.fallFlat, E.io2]];
  const p = slKeys(K, u); return p;
}
/* risePose(u): deitado → apoio nas mãos e joelhos → ajoelha → levanta com esforço → em pé */
function risePose(u) {
  u = clamp(u);
  return slKeys([[0, POSE.fallFlat], [.28, POSE.hands2knees, E.out2], [.5, POSE.kneel, E.io2], [.7, { lean: 34, head: 4, spread: .8, hs: .7, aR: [70, 30], aL: [-30, 0], lR: [60, -60], lL: [-30, 10], sq: .06 }, E.io2], [.88, { lean: 10, head: -4, spread: .8, hs: .6, aR: [30, 12], aL: [-24, -10], lR: [14, 0], lL: [-10, 6], sq: -.04 }, E.out2], [1, POSE.stand, E.io2]], u);
}
/* crawlPose(ph): engatinhando/arrastando-se, cabeça levantada */
function crawlPose(ph) {
  const s = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
  return { lean: 70 + 2 * Math.sin(2 * ph), head: -34 + 4 * Math.sin(2 * ph - 1), spread: .5, hs: .3, aR: [24 + 22 * s, 6 + 28 * s], aL: [24 + 22 * s2, 6 + 28 * s2], lR: [62 + 14 * s2, -8 + 28 * Math.max(0, s2) - 28 * Math.max(0, s)], lL: [62 + 14 * s, -8 + 28 * Math.max(0, s) - 28 * Math.max(0, s2)], ph };
}
/* balancePose(t, nerv=.5): corda bamba — braços abertos oscilando, tronco compensando, pés na linha */
function balancePose(t, nerv) {
  nerv = nerv == null ? .5 : nerv;
  const w = Math.sin(t * 3.1) * (8 + 16 * nerv) + Math.sin(t * 7.3) * 3 * nerv, w2 = Math.sin(t * 3.1 + .7) * (6 + 12 * nerv);
  const kick = Math.max(0, Math.sin(t * 1.3 + .5) - .7) * 3 * nerv;
  return { lean: w * .4, head: -w * .25, spread: .85, hs: .1, aR: [86 + w, 92 + w2], aL: [-86 + w, -92 + w2], lR: [6 + kick * 6, 0], lL: [-4 - kick * 8, kick * 14], hR: 'flat', hL: 'flat', lift: kick * .12, ph: t };
}
/* reachUp(u): mão sobe até alcançar o céu, tronco alonga, ponta dos pés */
function reachUp(u) {
  u = clamp(u); const e = E.io2(u), t2 = E.io2(seg(u, .5, 1));
  return { lean: -9 * e, head: -34 * e, spread: .8, hs: .5, aR: [lerp(14, 170, e), lerp(10, 176, e)], aL: [lerp(-8, -22, e), lerp(-5, -12, e)], lR: [lerp(3, 4, e), 0], lL: [-3, 0], tip: t2, hR: u > .6 ? 'flat' : '', sq: -.05 * t2 };
}
/* flyPose(t): flutuando/voando levemente */
function flyPose(t) {
  const b = Math.sin(t * 1.7), b2 = Math.sin(t * 1.7 - .8);
  return { lean: 14 + 4 * b, head: -6, spread: .7, hs: .3, aR: [96 + 14 * b, 118 + 18 * b2], aL: [-70 - 12 * b2, -96 - 16 * b], lR: [-22 + 8 * b2, -44 + 12 * b], lL: [-30 + 8 * b, -56 + 12 * b2], lift: 1.5 + .35 * b, flare: .3, ph: t };
}

/* danceHero(t, style 0..3): poses-chave presas na semi-batida (BEAT/2) com easing, quique e deslocamento; style muda o repertório. */
var SL_DSEQ = [
  ['Vup', 'point', 'hip', 'wide', 'kick', 'Vup', 'crouch', 'cheer'],
  ['heart', 'wide', 'twirl', 'Vup', 'hip', 'point', 'cheer', 'hip'],
  ['wave', 'hip', 'heart', 'kick', 'wide', 'twirl', 'Vup', 'shrug'],
  ['cheer', 'point', 'Vup', 'hip', 'twirl', 'heart', 'wide', 'crouch']
];
function danceHero(t, style) {
  const seq = SL_DSEQ[(((style | 0) % 4) + 4) % 4], hb = (typeof BEAT === 'number' ? BEAT : .75) / 2, p = t / hb, i = Math.floor(p), f = p - i, n = seq.length;
  const a = POSE[seq[((i % n) + n) % n]], b = POSE[seq[(((i + 1) % n) + n) % n]];
  const ps = lerpPose(a, b, E.io2(clamp(f * 1.35)));
  const bounce = Math.exp(-f * 5);
  ps.sq = (ps.sq || 0) + .08 * bounce; ps.air = (ps.air || 0) + Math.max(0, Math.sin(f * Math.PI)) * .28; ps.dx = Math.sin(p * Math.PI * .5) * .18; ps.lean += Math.sin(p * Math.PI) * 4; ps.ph = t * 4;
  return ps;
}
/* danceMagic(t, style 0..3): 0 sway gracioso (port de bras) · 1 pirueta (sx gira, passé, saia abre) · 2 arabesque em equilíbrio · 3 jeté/planar. Retorna pose com flare. */
function danceMagic(t, style) {
  style = ((style | 0) % 4 + 4) % 4;
  const w = t * 2.4, s1 = Math.sin(w), s2 = Math.sin(w - .9), s3 = Math.sin(w * .5);
  if (style === 0) return { lean: 5 * s1, head: 8 * s2, spread: .75, hs: .4, aR: [118 + 36 * s1, 150 + 30 * s2], aL: [-96 - 40 * s2, -140 - 30 * s1], lR: [8 + 6 * s1, -4], lL: [-14 + 6 * s2, 8 * s3], lift: .12 + .08 * (s1 * .5 + .5), flare: .25 + .1 * s1, ph: t };
  if (style === 1) {
    const cyc = (t * .5) % 1, e = E.io3(clamp(cyc * 1.3)), ang = e * TAU * 2, spinF = Math.sin(ang);
    const lift = Math.sin(clamp(cyc * 1.3) * Math.PI), up = lift;
    return { lean: 0, head: 0, spread: .6, hs: .3, sx: Math.cos(ang), aR: [lerp(100, 168, up), lerp(110, 176, up)], aL: [lerp(-100, -168, up), lerp(-110, -176, up)], lR: [3, 0], lL: [lerp(-4, -78, up), lerp(0, 24, up)], lift: .3 * up, tip: up, flare: .25 + 1.1 * up * Math.abs(Math.sin(ang * .5 + .5) * .3 + .7), ph: t };
  }
  if (style === 2) { // arabesque
    const k = .5 + .5 * Math.sin(w * .5), sw = Math.sin(w * .5);
    return { lean: lerp(8, 30, k), head: lerp(0, -22, k), spread: .6, hs: .3, aR: [lerp(100, 150, k), lerp(100, 160, k)], aL: [lerp(-100, -80, k), lerp(-110, -76, k)], lR: [3, 0], lL: [lerp(-10, -104, k), lerp(-10, -110, k)], tip: .7 * k, flare: .4 + .5 * k, ph: t };
  }
  const u = (t * .45) % 1, a = Math.sin(clamp(u * 1.4) * Math.PI); // jeté
  return { lean: lerp(4, -4, a) + 6 * s1, head: -8 * a, spread: .6, hs: .5, aR: [lerp(100, 150, a), lerp(110, 160, a)], aL: [lerp(-100, -120, a), lerp(-110, -140, a)], lR: [lerp(6, 86, a), lerp(2, 80, a)], lL: [lerp(-6, -84, a), lerp(-2, -92, a)], lift: 1.1 * a, flare: .35 + .6 * a, ph: t };
}

/* ============================================================
   núcleo de desenho: cápsulas afiladas em um único caminho (união sem fendas), offscreen p/ rim light
   ============================================================ */
function slCap(g, a, ra, b, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  if (L < Math.abs(ra - rb) + 1e-4) { const c = ra >= rb ? a : b, r = Math.max(ra, rb); g.moveTo(c[0] + r, c[1]); g.arc(c[0], c[1], r, 0, TAU); return; }
  const d = Math.atan2(dy, dx), ph = Math.acos((ra - rb) / L);
  g.moveTo(a[0] + Math.cos(d + ph) * ra, a[1] + Math.sin(d + ph) * ra);
  g.arc(a[0], a[1], ra, d + ph, d + TAU - ph); g.arc(b[0], b[1], rb, d - ph, d + ph); g.closePath();
}
function slDot(g, c, r) { g.moveTo(c[0] + r, c[1]); g.arc(c[0], c[1], r, 0, TAU); }
var SL_PR = { tor: [.35, .41, .31], neck: .17, head: .65, sh: .25, arm: [.24, .19, .125], hand: .17, hip: .3, leg: [.31, .235, .15], foot: [.15, .11] };
var SL_PRM = { tor: [.25, .21, .24], neck: .11, head: .54, sh: .15, arm: [.15, .12, .075], hand: .09, hip: .22, leg: [.2, .145, .085], foot: [.09, .05] };
function slPrMul(pr, m) { const o = {}; for (const k in pr) o[k] = Array.isArray(pr[k]) ? pr[k].map(v => v * m) : pr[k] * m; return o; }
function slHandAdd(g, k, which, pr, kind) {
  const a = k[which === 'R' ? 'aR' : 'aL'], w = a[2], e = k[which === 'R' ? 'hR' : 'hL'], dx = e[0] - w[0], dy = e[1] - w[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const r = pr.hand * (kind === 'cam' ? 1.5 : kind === 'fist' ? 1.15 : 1);
  slDot(g, [w[0] + ux * .1, w[1] + uy * .1], r);
  if (kind === 'point') slCap(g, [w[0] + ux * .12, w[1] + uy * .12], r * .55, [w[0] + ux * .62, w[1] + uy * .62], r * .35);
  else if (kind === 'flat') slCap(g, [w[0] + ux * .1, w[1] + uy * .1], r * .85, [w[0] + ux * .52, w[1] + uy * .52], r * .55);
}
/* adiciona ao caminho as partes pedidas (parts: objeto-conjunto ou null = todas) */
function slPartsAdd(g, k, pr, parts, hk) {
  const has = n => !parts || parts[n];
  if (has('torso')) {
    const mid = [k.shc[0] * .5, k.shc[1] * .5];
    slCap(g, k.hip, pr.tor[0], mid, pr.tor[1]); slCap(g, mid, pr.tor[1], k.shc, pr.tor[2]);
    slCap(g, k.shc, pr.tor[2] * .95, k.shR, pr.sh); slCap(g, k.shc, pr.tor[2] * .95, k.shL, pr.sh);
    slCap(g, k.hip, pr.tor[0] * .95, k.lR[0], pr.hip); slCap(g, k.hip, pr.tor[0] * .95, k.lL[0], pr.hip);
  }
  if (has('head')) { slCap(g, k.shc, pr.neck * 1.15, k.head, pr.neck); slDot(g, k.head, pr.head); }
  if (has('aR')) { slCap(g, k.aR[0], pr.arm[0], k.aR[1], pr.arm[1]); slCap(g, k.aR[1], pr.arm[1], k.aR[2], pr.arm[2]); slHandAdd(g, k, 'R', pr, hk ? hk.R : ''); }
  if (has('aL')) { slCap(g, k.aL[0], pr.arm[0], k.aL[1], pr.arm[1]); slCap(g, k.aL[1], pr.arm[1], k.aL[2], pr.arm[2]); slHandAdd(g, k, 'L', pr, hk ? hk.L : ''); }
  if (has('lR')) { slCap(g, k.lR[0], pr.leg[0], k.lR[1], pr.leg[1]); slCap(g, k.lR[1], pr.leg[1], k.lR[2], pr.leg[2]); slCap(g, k.lR[2], pr.foot[0], k.toeR, pr.foot[1]); }
  if (has('lL')) { slCap(g, k.lL[0], pr.leg[0], k.lL[1], pr.leg[1]); slCap(g, k.lL[1], pr.leg[1], k.lL[2], pr.leg[2]); slCap(g, k.lL[2], pr.foot[0], k.toeL, pr.foot[1]); }
}

/* ---------- render com offscreen (rim light por silhueta deslocada) ---------- */
var SL_A = null, SL_B = null;
function slCanvas(w) {
  if (!SL_A) { SL_A = document.createElement('canvas'); SL_B = document.createElement('canvas'); }
  if (SL_A.width < w || SL_A.height < w) { w = Math.max(w, SL_A.width, SL_A.height); SL_A.width = SL_A.height = SL_B.width = SL_B.height = w; }
  return w;
}
function slRims(o, s) {
  let r = o.rim; if (!r) return null; if (!Array.isArray(r)) r = [r];
  return r.map(q => { const w = Math.max(1.4, s * .085) * (q.w || 1); return { col: q.col || '#ffd9a0', dx: (q.dx == null ? -1 : q.dx) * w, dy: (q.dy == null ? -.4 : q.dy) * w, a: q.a == null ? 1 : q.a }; });
}
/* draw(g): desenha no sistema lógico (g já com transform-base). cx,cy,R: caixa lógica do offscreen. */
function slRender(ctx, cx, cy, R, rims, alpha, draw) {
  if (!rims && alpha >= .999 && ctx.globalAlpha >= .999) { draw(ctx); return; }
  if (!rims) { ctx.save(); ctx.globalAlpha *= alpha; slLayerAlpha(ctx, cx, cy, R, draw); ctx.restore(); return; }
  const m = ctx.getTransform(); let k = Math.hypot(m.a, m.b) || 1; const lim = 2200; if (2 * R * k > lim) k = lim / (2 * R);
  const size = Math.ceil(2 * R * k); slCanvas(size);
  const A = SL_A, B = SL_B, ga = A.getContext('2d'), gb = B.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalCompositeOperation = 'source-over'; ga.globalAlpha = 1; ga.clearRect(0, 0, A.width, A.height);
  ga.setTransform(k, 0, 0, k, -(cx - R) * k, -(cy - R) * k); draw(ga); ga.setTransform(1, 0, 0, 1, 0, 0);
  for (const r of rims) {
    gb.setTransform(1, 0, 0, 1, 0, 0); gb.globalCompositeOperation = 'source-over'; gb.globalAlpha = 1; gb.clearRect(0, 0, B.width, B.height);
    gb.drawImage(A, 0, 0, size, size, 0, 0, size, size);
    gb.globalCompositeOperation = 'destination-out'; gb.drawImage(A, 0, 0, size, size, -r.dx * k, -r.dy * k, size, size);
    gb.globalCompositeOperation = 'source-in'; gb.fillStyle = r.col; gb.fillRect(0, 0, size, size); gb.globalCompositeOperation = 'source-over';
    ga.globalAlpha = r.a; ga.drawImage(B, 0, 0, size, size, 0, 0, size, size); ga.globalAlpha = 1;
  }
  ctx.save(); ctx.globalAlpha *= alpha; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(A, 0, 0, size, size, cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
}
function slLayerAlpha(ctx, cx, cy, R, draw) {
  const m = ctx.getTransform(); let k = Math.hypot(m.a, m.b) || 1; const lim = 2200; if (2 * R * k > lim) k = lim / (2 * R);
  const size = Math.ceil(2 * R * k); slCanvas(size); const A = SL_A, ga = A.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalCompositeOperation = 'source-over'; ga.globalAlpha = 1; ga.clearRect(0, 0, A.width, A.height);
  ga.setTransform(k, 0, 0, k, -(cx - R) * k, -(cy - R) * k); draw(ga); ga.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(A, 0, 0, size, size, cx - R, cy - R, 2 * R, 2 * R);
}
/* sombra de contato suave */
function slShadow(ctx, x, y, s, k, o, f, w) {
  if (o.shadow === false || o.float) return;
  const lift = k.lift + (o.lift || 0), a = (o.shadowA == null ? .42 : o.shadowA) * Math.max(0, 1 - lift * .22) * (o.alpha == null ? 1 : o.alpha);
  if (a < .01) return;
  let xs = [], pts = [k.lR[2], k.lL[2], k.toeR, k.toeL, k.hR, k.hL, k.head, k.hip, k.lR[1], k.lL[1]];
  for (const p of pts) if (p[1] > k.ground - .75) xs.push(p[0]);
  const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), cxs = (x0 + x1) / 2, half = Math.max(1.0, (x1 - x0) / 2 + .6) * (w || 1) * (1 + lift * .08);
  ctx.save(); ctx.translate(x + (cxs + (k.p.dx || 0)) * s * f, y + .04 * s); ctx.scale(half * s, .26 * s * (1 + lift * .05));
  ctx.globalAlpha *= a; ctx.fillStyle = rg(ctx, 0, 0, 0, 1, [[0, 'rgba(0,0,0,.95)'], [.55, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]);
  ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
}
function slBodyFill(g, k, o, top) {
  const base = o.col || SL_BLACK, amb = o.amb, aa = o.ambA == null ? .3 : o.ambA;
  const c0 = amb ? mix(base, amb, aa) : mix(base, '#1a1a30', .08);
  const c1 = amb ? mix(base, amb, aa * .25) : base;
  let c = (o.fog && o.fog.col) ? o.fog : null;
  const f0 = c ? mix(c0, c.col, c.a) : c0, f1 = c ? mix(c1, c.col, c.a) : c1;
  return lg(g, 0, top, 0, k.ground, [[0, f0], [.55, mix(f0, f1, .6)], [1, f1]]);
}

/* ---------- boné vermelho (no referencial da cabeça: origem no centro, frente = +x, cima = -y) ---------- */
function slCapDraw(g, col, t, flip, tilt) {
  const c1 = mix(col, '#ff8a8a', .28), c2 = col, c3 = mix(col, '#2a0610', .45), c4 = mix(col, '#1a0208', .6);
  const fl = Math.sin(t * 5.3) * .05 + Math.sin(t * 2.1 + 1) * .03, br = Math.sin(t * 2.4 + .4) * .035 + (tilt || 0);
  g.save(); g.translate(0, .04); g.scale(.9, .9);
  // tirinha atrás (flutua)
  g.fillStyle = c3; g.beginPath(); g.moveTo(-.62, .0); g.quadraticCurveTo(-.86 - fl, .1, -.9 - fl * 1.6, .34 + fl); g.lineTo(-.74 - fl, .38 + fl); g.quadraticCurveTo(-.7, .2, -.5, .12); g.closePath(); g.fill();
  // domo
  g.beginPath(); g.moveTo(-.68, .12); g.bezierCurveTo(-.74, -.55, -.42, -.9, 0, -.9); g.bezierCurveTo(.44, -.9, .78, -.55, .72, .1); g.quadraticCurveTo(.02, .3, -.68, .12); g.closePath();
  g.fillStyle = lg(g, -.5, -.9, .55, .3, [[0, c1], [.42, c2], [1, c3]]); g.fill();
  // sombra da banda
  g.save(); g.clip(); g.fillStyle = 'rgba(30,0,10,.35)'; g.beginPath(); g.ellipse(.02, .3, .86, .22, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(40,0,12,.4)'; g.lineWidth = .028; g.beginPath(); g.moveTo(0, -.9); g.quadraticCurveTo(-.22, -.5, -.18, .14); g.moveTo(0, -.9); g.quadraticCurveTo(.3, -.5, .36, .12); g.stroke();
  g.fillStyle = 'rgba(255,210,210,.3)'; g.beginPath(); g.ellipse(-.22, -.56, .17, .08, -.6, 0, TAU); g.fill(); g.restore();
  // botão
  g.fillStyle = c4; g.beginPath(); g.arc(0, -.9, .065, 0, TAU); g.fill();
  // aba
  g.save(); g.translate(.5, .0); g.rotate(br);
  g.beginPath(); g.moveTo(-.02, -.1); g.quadraticCurveTo(.5, -.12, .86, .06); g.quadraticCurveTo(.96, .12, .84, .17); g.quadraticCurveTo(.4, .2, -.02, .22); g.closePath();
  g.fillStyle = lg(g, 0, -.1, 0, .22, [[0, mix(col, '#ff9a9a', .1)], [1, c4]]); g.fill();
  g.strokeStyle = 'rgba(255,200,200,.35)'; g.lineWidth = .025; g.beginPath(); g.moveTo(.06, -.07); g.quadraticCurveTo(.5, -.1, .84, .07); g.stroke(); g.restore();
  g.restore();
}

/* ============================================================
   drawHero — silhueta stick preta com boné vermelho
   o: t, flip, alpha, squash, stretch, rot, lift, shadow, amb, ambA, col, cap(false|cor), pack, rim, glow, scar, sweat, th, bpm, hair
   ============================================================ */
function slVeins(g, k, scar, t, bpm, seed) {
  const r = rng(seed || 7), beat = 60 / (bpm || 72), f = ((t || 0) % beat) / beat, pulse = Math.exp(-f * 6) + .35 * Math.exp(-Math.pow((f - .22) * 9, 2));
  const la = k.la, ax = [Math.sin(la), -Math.cos(la)], px = [Math.cos(la), Math.sin(la)], T = SL_K.T;
  const C = [ax[0] * T * .64, ax[1] * T * .64];
  const P = (u, v) => [k.hip[0] + ax[0] * u + px[0] * v, k.hip[1] + ax[1] * u + px[1] * v];
  const segs = [];
  const branch = (u, v, ang, len, w, depth) => {
    let pu = u, pv = v, a = ang, pts = [[pu, pv]];
    const n = 5 + (depth ? 0 : 2);
    for (let i = 0; i < n; i++) { a += (r() - .5) * 1.1; pu += Math.cos(a) * len / n; pv += Math.sin(a) * len / n; pv = clamp(pv, -.36, .36); pu = clamp(pu, .1, T - .35); pts.push([pu, pv]); if (depth < 2 && r() < .38) branch(pu, pv, a + (r() < .5 ? -1 : 1) * (.6 + r() * .6), len * .55, w * .6, depth + 1); }
    segs.push({ pts, w });
  };
  const uC = T * .64, nB = 4 + Math.round(scar * 3);
  for (let i = 0; i < nB; i++) { const a = -Math.PI / 2 + (i - (nB - 1) / 2) * (TAU / nB * .9) + (r() - .5) * .5; branch(uC, 0, a + (i % 2 ? .3 : -.3), 1.05 + r() * .6, .05, 0); }
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = 'lighter';
  const a = clamp(scar) * (.62 + .38 * pulse);
  for (const pass of [0, 1, 2]) {
    g.strokeStyle = pass === 0 ? `rgba(255,150,40,${a * .28})` : pass === 1 ? `rgba(255,200,70,${a * .8})` : `rgba(255,248,210,${a * .95})`;
    for (const s of segs) {
      g.lineWidth = s.w * (pass === 0 ? 3.4 : pass === 1 ? 1.6 : .7) * (.8 + .5 * pulse);
      g.beginPath(); s.pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke();
    }
  }
  // brilho central pulsando
  const c = P(C[0] ? uC : uC, 0); g.fillStyle = rg(g, c[0], c[1], 0, .9, [[0, `rgba(255,236,170,${a})`], [1, 'rgba(255,170,40,0)']]); g.fillRect(c[0] - 1, c[1] - 1, 2, 2);
  g.restore();
}
function slGlowPoint(ctx, cx, cy, r, glow, t, col) {
  const pl = 1 + .08 * Math.sin((t || 0) * 5.5), a = clamp(glow);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, cx, cy, 0, r * 3.2 * pl, [[0, `rgba(255,214,110,${.55 * a})`], [.35, `rgba(255,170,50,${.2 * a})`], [1, 'rgba(255,150,40,0)']]); ctx.fillRect(cx - r * 3.3, cy - r * 3.3, r * 6.6, r * 6.6);
  ctx.fillStyle = rg(ctx, cx, cy, 0, r * .55 * pl, [[0, `rgba(255,255,240,${a})`], [.5, `rgba(255,226,130,${.9 * a})`], [1, 'rgba(255,190,60,0)']]); ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}
function drawHero(ctx, x, y, s, pose, o) {
  o = o || {}; const f = o.flip ? -1 : 1, t = o.t || 0, pp = slFill(pose), br = Math.sin(t * 2.3) * .5 + .5;
  const k = skeleton(pp, { br: o.br != null ? o.br : br }); const pr = o.th ? slPrMul(SL_PR, o.th) : SL_PR;
  const alpha = o.alpha == null ? 1 : o.alpha;
  const hk = { R: pp.hR, L: pp.hL };
  slShadow(ctx, x, y, s, k, o, f);
  const rims = slRims(o, s);
  const hipX = x + (pp.dx + (o.dx || 0)) * s * f, hipY = y - (k.lift + (o.lift || 0)) * s - k.ground * s, R = 6.6 * s * (1 + Math.abs(pp.sq + (o.squash || 0) - (o.stretch || 0)) * .7);
  const capCol = o.cap === false ? null : (typeof o.cap === 'string' ? o.cap : '#c8283a');
  const tsec = o.t != null ? o.t : (pp.ph || 0) / 2.2;
  ctx.save();
  slRender(ctx, hipX, hipY, R, rims, alpha, g => {
    g.save(); slXform(g, x, y, s, k, o, f);
    if (o.pack) { // mochila
      const ax = [Math.sin(k.la), -Math.cos(k.la)], px = [Math.cos(k.la), Math.sin(k.la)], c = [ax[0] * 1.0 - px[0] * .52, ax[1] * 1.0 - px[1] * .52];
      g.save(); g.translate(c[0], c[1]); g.rotate(k.la); g.beginPath(); rrect(g, -.36, -.78, .72, 1.5, .26); g.fillStyle = mix(o.col || SL_BLACK, '#3a3a5c', .2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.05)'; rrect(g, -.2, -.5, .4, .62, .14); g.fill(); g.restore();
    }
    g.beginPath(); slPartsAdd(g, k, pr, null, hk); g.fillStyle = slBodyFill(g, k, o, k.head[1] - 1); g.fill();
    if (o.scar > 0.001) { g.save(); g.beginPath(); slCap(g, k.hip, pr.tor[0] * .98, [k.shc[0] * .5, k.shc[1] * .5], pr.tor[1] * .98); slCap(g, [k.shc[0] * .5, k.shc[1] * .5], pr.tor[1] * .98, k.shc, pr.tor[2] * .98); g.clip(); slVeins(g, k, o.scar, t, o.bpm, o.seed); g.restore(); }
    if (capCol) { g.save(); g.translate(k.head[0], k.head[1]); g.rotate(k.ha); slCapDraw(g, capCol, tsec, f, o.capTilt); g.restore(); }
    g.restore();
  });
  // brilho do peito (fora do offscreen, aditivo)
  if (o.glow > 0.001 || o.scar > 0.001) {
    const c = charPt(x, y, s, pp, 'chest', o); slGlowPoint(ctx, c[0], c[1], s * (.34 + .1 * (o.glow || 0)), Math.max(o.glow || 0, (o.scar || 0) * .7), t, '#ffd');
  }
  if (o.sweat > 0.001) slSweat(ctx, charPt(x, y, s, pp, 'head', o), s, t, o.sweat, f);
  ctx.restore();
}
function slSweat(ctx, h, s, t, a, f) {
  ctx.save(); ctx.fillStyle = 'rgba(190,225,255,.9)';
  for (let i = 0; i < 3; i++) {
    const p = ((t * 1.3 + i * .37) % 1), ang = -2.4 + i * .5 * f, px = h[0] + Math.cos(ang) * s * (.7 + p * .9) * f * (i % 2 ? -1 : 1) * -1, py = h[1] - s * .3 + p * p * s * 1.6 - s * .2 * (1 - p), r = s * (.07 - .03 * p) * (.6 + a * .5);
    ctx.globalAlpha = a * (1 - p * p) * .9; ctx.beginPath(); ctx.moveTo(px, py - r * 2); ctx.quadraticCurveTo(px + r * 1.3, py, px, py + r); ctx.quadraticCurveTo(px - r * 1.3, py, px, py - r * 2); ctx.fill();
  }
  ctx.restore();
}

/* ============================================================
   drawMagic — figura mágica branco→rosa luminosa: orelhinhas de gato, laço, saia em babados de triângulos, fitas, aura, brilhos
   o: t, flip, alpha, squash/stretch, rot, lift, float(sem sombra), glowCol('#ff9ed6'), glow(0..1 intensidade da aura), flare(+), wind:[wx,wy],
      ribbons(n=2..4), sparkles(n), rim, shadow, bow:false, ears:false, skirt:false
   ============================================================ */
function slRibbon(g, A, ang0, len, w0, t, ph, curl, cols, wave) {
  const n = 22, st = len / n, pts = [A.slice()]; let a = ang0, p = A.slice();
  for (let i = 0; i < n; i++) {
    const q = i / n; a = ang0 + Math.sin(t * 2.6 - i * .42 + ph) * (wave == null ? .5 : wave) * Math.pow(q, .8) + curl * q + Math.sin(t * 1.3 + ph * 2 - i * .2) * .18 * q;
    p = [p[0] + Math.cos(a) * st, p[1] + Math.sin(a) * st]; pts.push(p);
  }
  const L = [], Rr = [];
  for (let i = 0; i <= n; i++) {
    const a1 = pts[Math.max(0, i - 1)], b1 = pts[Math.min(n, i + 1)], dx = b1[0] - a1[0], dy = b1[1] - a1[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, q = i / n;
    const w = w0 * (1 - q * .85) * (1 + .35 * Math.sin(q * 9 + t * 3 + ph)) * (i < 2 ? .6 + i * .2 : 1);
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); Rr.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  const e = pts[n];
  g.beginPath(); L.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); for (let i = n; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]); g.closePath();
  g.fillStyle = lg(g, A[0], A[1], e[0], e[1], [[0, cols[0]], [.55, cols[1]], [1, cols[2]]]); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = w0 * .12; g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
}
function slSkirt(g, k, p, t, o, op) {
  const W0 = [k.hip[0] + k.waist[0] * .6, k.hip[1] + k.waist[1] * .6 - .12], la = k.la;
  const fl = (p.flare || 0) + (o.flare || 0), sxm = Math.abs(p.sx), lift = k.lift;
  const dvx = -Math.sin(la) * .35 + Math.sin(t * 1.9) * .05, th = Math.atan2(-dvx, 1);
  const layers = [{ h: 1.6, w: 1.25, n: 7, c0: '#ffbfe0', c1: '#ff8ec8', off: 0 }, { h: 1.32, w: 1.05, n: 6, c0: '#ffdcee', c1: '#ffadd6', off: .5 }, { h: 1.04, w: .84, n: 5, c0: '#fff6fb', c1: '#ffcde8', off: 0 }];
  g.save(); g.translate(W0[0], W0[1]); g.rotate(th);
  layers.forEach((L, li) => {
    const w = L.w * (.5 + .5 * sxm + fl * .45) * (1 + .04 * Math.sin(t * 2 + li)), h = L.h * (1 - clamp(lift * .08) * .5 - .1 * Math.min(1, fl)), aw = .3 + li * .03, N = L.n, tips = [], nots = [];
    for (let j = 0; j < N; j++) {
      const xl = -w + 2 * w * j / N, xr = -w + 2 * w * (j + 1) / N, cx = (xl + xr) / 2, ph = t * 2.6 - j * .7 + li * .8;
      const edge = Math.abs(cx) / w, lift2 = fl * .45 * edge * h; // saia abre: pontas laterais sobem
      tips.push([cx + Math.sin(ph) * .035 * w, h * (1 - .1 * edge * edge) + Math.sin(ph + 1) * .045 * h - lift2]);
      nots.push([xr, h * (.7 - .05 * edge) + Math.sin(ph + .5) * .03 * h - lift2 * .8]);
    }
    g.beginPath(); g.moveTo(-aw, 0); g.lineTo(-w, h * .68 - fl * .3);
    for (let j = 0; j < N; j++) { g.lineTo(tips[j][0], tips[j][1]); g.lineTo(j === N - 1 ? w : nots[j][0], j === N - 1 ? h * .68 - fl * .3 : nots[j][1]); }
    g.lineTo(aw, 0); g.closePath();
    g.fillStyle = lg(g, 0, 0, 0, h, [[0, L.c0], [1, L.c1]]); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .03; g.lineJoin = 'round'; g.stroke();
    g.save(); g.clip(); g.strokeStyle = 'rgba(255,120,190,.22)'; g.lineWidth = .025; g.beginPath(); for (let j = 0; j < N; j++) { g.moveTo(0, 0); g.lineTo(tips[j][0], tips[j][1]); } g.stroke(); g.restore();
  });
  g.restore();
}
function slEars(g, t, tw) {
  const tw1 = Math.max(0, Math.sin(t * .9 + 2) - .93) * 9 * (tw || 1);
  [[-1, 0], [1, tw1 * .12]].forEach(([sd, ex]) => {
    g.save(); g.scale(sd, 1); g.rotate(ex);
    g.beginPath(); g.moveTo(.08, -.5); g.lineTo(.6, -.36); g.quadraticCurveTo(.76, -1.02, .5, -1.34); g.quadraticCurveTo(.26, -1.05, .06, -.9); g.closePath();
    g.fillStyle = lg(g, 0, -.5, .6, -1.3, [[0, '#fff6fb'], [1, '#ffcfe8']]); g.fill();
    g.beginPath(); g.moveTo(.2, -.62); g.lineTo(.52, -.5); g.quadraticCurveTo(.6, -.86, .5, -1.08); g.quadraticCurveTo(.34, -.92, .22, -.84); g.closePath(); g.fillStyle = '#ff8cc6'; g.globalAlpha *= .85; g.fill(); g.restore();
  });
}
function slBow(g, t, sc) {
  const pl = 1 + .035 * Math.sin(t * 3.2); g.save(); g.scale(sc * pl, sc * pl);
  const tri = sd => { g.save(); g.scale(sd, 1); g.beginPath(); g.moveTo(.04, 0); g.lineTo(.66, -.4); g.quadraticCurveTo(.74, 0, .66, .4); g.closePath(); g.fillStyle = lg(g, 0, 0, .7, 0, [[0, '#ff5fa8'], [1, '#ff9ccd']]); g.fill(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .04; g.stroke(); g.restore(); };
  g.save(); g.rotate(.06); g.beginPath(); g.moveTo(-.05, .06); g.lineTo(-.26, .62 + .05 * Math.sin(t * 3)); g.lineTo(-.06, .5); g.closePath(); g.fillStyle = '#ff7ab8'; g.fill();
  g.beginPath(); g.moveTo(.05, .06); g.lineTo(.24, .66 - .05 * Math.sin(t * 3 + 1)); g.lineTo(.08, .52); g.closePath(); g.fill(); g.restore();
  tri(1); tri(-1);
  g.fillStyle = lg(g, -.1, -.1, .1, .12, [[0, '#ffc2e0'], [1, '#ff4f9e']]); g.beginPath(); g.arc(0, 0, .13, 0, TAU); g.fill();
  g.restore();
}
var SL_SPK = ['#fff', '#ffd6ee', '#ffe9a8', '#cfe6ff', '#ffb8e0'];
function slAura(g, cx, cy, r, col, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = rg(g, cx, cy, 0, r, [[0, rgba(col, .55 * a)], [.35, rgba(col, .22 * a)], [1, rgba(col, 0)]]); g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.restore();
}
function drawMagic(ctx, x, y, s, pose, o) {
  o = o || {}; const f = o.flip ? -1 : 1, t = o.t || 0, pp = slFill(pose), alpha = o.alpha == null ? 1 : o.alpha;
  const k = skeleton(pp, { br: Math.sin(t * 2.1) }), pr = SL_PRM, gcol = o.glowCol || '#ff9ed6', ga = o.glow == null ? 1 : o.glow;
  slShadow(ctx, x, y, s, k, Object.assign({}, o, { shadowA: (o.shadowA == null ? .16 : o.shadowA) }), f);
  const hk = { R: pp.hR, L: pp.hL }, rims = slRims(o, s);
  const hipX = x + (pp.dx + (o.dx || 0)) * s * f, hipY = y - (k.lift + (o.lift || 0)) * s - k.ground * s, R = 9 * s;
  const kk = o.k != null ? o.k : 1;
  ctx.save(); ctx.globalAlpha *= alpha;
  // aura atrás
  { const c = charPt(x, y, s, pp, 'chest', o); const pul = 1 + .06 * Math.sin(t * 3.1); slAura(ctx, c[0], c[1], s * 4.2 * pul * ga, gcol, .5 * ga); }
  // fitas atrás
  const wind = o.wind || [-.55, .3], nR = o.ribbons == null ? 2 : o.ribbons;
  const draw = g => {
    g.save(); slXform(g, x, y, s, k, o, f);
    const base2 = Math.atan2(wind[1], wind[0] * f), tt = t;
    // fitas
    const waistB = [k.hip[0] - .08, k.hip[1] - .35];
    const cols = ['rgba(255,255,255,.95)', 'rgba(255,214,238,.85)', 'rgba(255,150,208,0)'];
    if (nR >= 1) slRibbon(g, waistB, base2 + .35, 4.6 * (o.ribbonLen || 1), .2, tt, 0, .5, cols);
    if (nR >= 2) slRibbon(g, [waistB[0] + .1, waistB[1] + .1], base2 - .2, 3.9 * (o.ribbonLen || 1), .16, tt, 1.7, .9, cols);
    if (nR >= 3) slRibbon(g, k.hR, base2 - .1, 3.2 * (o.ribbonLen || 1), .12, tt, 3.1, -.6, cols);
    if (nR >= 4) slRibbon(g, k.hL, base2 + .1, 3.2 * (o.ribbonLen || 1), .12, tt, 4.4, .6, cols);
        g.shadowColor = rgba(gcol, .6 * ga); g.shadowBlur = .4 * slK(g);
    const farG = lg(g, 0, k.head[1], 0, k.ground, [[0, '#ffdff0'], [1, '#ff9fcf']]);
    // membros de trás (rosa mais forte)
    g.save(); g.beginPath(); slPartsAdd(g, k, pr, { aL: 1, lL: 1 }, hk);
    g.strokeStyle = 'rgba(255,120,190,.5)'; g.lineWidth = .12; g.lineJoin = 'round'; g.stroke(); g.fillStyle = farG; g.fill(); g.restore();
    g.shadowBlur = 0;
    if (o.skirt !== false) slSkirt(g, k, pp, tt, o, 1);
    // corpo da frente
    const c = k.chest, bodyG = rg(g, c[0], c[1], 0, 3.8, [[0, '#ffffff'], [.5, '#ffe9f5'], [1, '#ffb5da']]);
    g.beginPath(); slPartsAdd(g, k, pr, { torso: 1, head: 1, aR: 1, lR: 1 }, hk);
    g.shadowColor = rgba(gcol, .7 * ga); g.shadowBlur = .32 * slK(g);
    g.strokeStyle = 'rgba(255,150,205,.55)'; g.lineWidth = .1; g.lineJoin = 'round'; g.stroke(); g.fillStyle = bodyG; g.fill(); g.shadowBlur = 0;
    // brilho interno
    g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); slCap(g, k.shc, .09, k.chest, .07); slCap(g, k.aR[0], .07, k.aR[1], .05); slCap(g, k.lR[0], .08, k.lR[1], .06); g.fill(); g.restore();
    // orelhas
    if (o.ears !== false) { g.save(); g.translate(k.head[0], k.head[1]); g.rotate(k.ha); slEars(g, t, 1); g.restore(); }
    // laço no peito
    if (o.bow !== false) { g.save(); g.translate(k.chest[0] + Math.sin(k.la) * .05, k.chest[1] + .02); g.rotate(k.la * .9); slBow(g, t, .88); g.restore(); }
    g.restore();
  };
  // sombra de brilho: usamos shadowBlur em unidades de dispositivo; ajustado dentro de draw via slK(g)
  slRender(ctx, hipX, hipY, R, rims, 1, draw);
  // brilhos
  const nS = o.sparkles == null ? 9 : o.sparkles;
  if (nS > 0) {
    const c = charPt(x, y, s, pp, 'chest', o), rr = rng(11 + (o.seed || 0)); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nS; i++) {
      const a0 = rr() * TAU, r0 = (1.2 + rr() * 3.2) * s, ph = rr() * 9, sp = .25 + rr() * .5, tw = Math.pow(Math.max(0, Math.sin(t * (2 + rr() * 2) + ph)), 2);
      const px = c[0] + Math.cos(a0 + t * sp * .4 * (i % 2 ? 1 : -1)) * r0, py = c[1] + Math.sin(a0 + t * sp * .4 * (i % 2 ? 1 : -1)) * r0 * 1.1 - ((t * sp * 10 + i * 7) % (s * .6)) * .3;
      sparkle(ctx, px, py, s * (.06 + .16 * rr()) * (.3 + tw), t * .6 + ph, SL_SPK[i % 5]);
    }
    ctx.restore();
  }
  ctx.restore();
}

/* ============================================================
   drawSil — silhuetas genéricas (elenco).  o.who: 'mae'|'pai'|'kid'|'adult'|'old'|'crowd'
   o: seed, accent (cor de detalhe), col (cor do corpo), amb, fog:{col,a}, rim, flip, alpha, t, walk (rad/s: anda sozinho), variant (crowd), shadow
   Altura relativa (s·6 = adulto): kid .62 · mae .96 · pai 1.06 · old .93 · crowd .9–1.1
   ============================================================ */
function slHF(g, k, fn) { g.save(); g.translate(k.head[0], k.head[1]); g.rotate(k.ha); fn(); g.restore(); }
function slCfg(who, o) {
  const sd = o.seed || 0, r = rng(sd * 97 + 13), c = { sc: 1, th: 1, head: .62, hair: 'short', hat: null, pack: 0, bag: 0, dress: 0, jacket: 0, cane: 0, umb: 0, ponytail: 0, lean: 0, hunch: 0, accent: o.accent };
  switch (who) {
    case 'mae': c.sc = .96; c.th = .92; c.hair = 'bun'; c.dress = 1; c.bag = 1; break;
    case 'pai': c.sc = 1.06; c.th = 1.14; c.hat = 'fedora'; c.jacket = 1; c.hair = 'none'; break;
    case 'kid': c.sc = .62; c.th = .95; c.head = .74; c.hair = r() < .5 ? 'short' : 'tuft'; if (r() < .6) c.hat = 'cap'; c.pack = 1; break;
    case 'old': c.sc = .93; c.th = .94; c.hair = 'none'; c.cane = 1; c.hunch = 1; c.head = .6; break;
    case 'crowd': {
      c.sc = .92 + r() * .18; c.th = .9 + r() * .26; const v = o.variant != null ? o.variant : Math.floor(r() * 9);
      c.hair = ['short', 'afro', 'pony', 'short', 'bun', 'short', 'short', 'tuft', 'short'][v % 9]; if (v % 9 === 0 || v % 9 === 5) c.hat = 'cap'; if (v % 9 === 3) c.hat = 'beanie'; if (v % 9 === 6) c.hat = 'wide';
      c.pack = (v % 3 === 1) ? 1 : 0; c.bag = (v % 9 === 4 || v % 9 === 8) ? 1 : 0; c.umb = v % 9 === 7 ? 1 : 0; c.dress = (v % 9 === 4) ? 1 : 0; c.hunch = r() < .25 ? 1 : 0; c.jacket = (v % 9 === 2 || v % 9 === 6) ? 1 : 0; c.ponytail = v % 9 === 2 ? 1 : 0; break;
    }
    default: c.sc = 1; c.hair = ['short', 'none'][sd % 2]; break; // adult
  }
  return c;
}
function slSilExtras(g, k, c, pr, t, fs, who) {
  const acc = c.accent, hr = c.head;
  g.fillStyle = fs;
  // cabelo / chapéu (referencial da cabeça)
  slHF(g, k, () => {
    g.fillStyle = fs;
    if (c.hair === 'bun') { g.beginPath(); g.arc(-.44, -.7, .3, 0, TAU); g.fill(); g.beginPath(); g.arc(-.08, -.04, hr * 1.04, 0, TAU); g.fill(); }
    else if (c.hair === 'afro') { g.beginPath(); g.arc(-.08, -.24, hr * 1.5, 0, TAU); g.fill(); }
    else if (c.hair === 'tuft') { g.beginPath(); g.moveTo(-.1, -hr * .8); g.quadraticCurveTo(-.05 + Math.sin(t * 3) * .05, -hr * 1.7, .3, -hr * 1.3); g.quadraticCurveTo(.12, -hr * 1.05, .22, -hr * .6); g.closePath(); g.fill(); }
    else if (c.hair === 'short') { g.beginPath(); g.ellipse(-.04, -.12, hr * 1.06, hr * 1.02, 0, 0, TAU); g.fill(); }
    if (c.ponytail || c.hair === 'pony') { const sw = Math.sin(t * 3.1) * .12; g.beginPath(); slCap(g, [-.5, -.15], .17, [-.95, .35 + sw * 2], .07); g.fill(); g.beginPath(); slCap(g, [-.95, .35 + sw * 2], .09, [-1.05 - sw, .95], .05); g.fill(); }
    if (c.hat === 'cap' || c.hat === 'beanie') {
      g.beginPath(); g.moveTo(-hr * 1.1, .12); g.bezierCurveTo(-hr * 1.15, -hr * 1.1, -hr * .5, -hr * 1.4, 0, -hr * 1.4); g.bezierCurveTo(hr * .6, -hr * 1.4, hr * 1.15, -hr * 1.0, hr * 1.1, .1); g.closePath(); g.fill();
      if (c.hat === 'cap') { g.beginPath(); g.moveTo(.2, -.06); g.quadraticCurveTo(.9, -.1, 1.28, .1); g.quadraticCurveTo(1.1, .24, .1, .2); g.closePath(); g.fill(); }
      if (acc) { g.strokeStyle = acc; g.lineWidth = .06; g.beginPath(); g.moveTo(-hr * 1.08, .06); g.quadraticCurveTo(0, .3, hr * 1.1, .08); g.stroke(); }
      if (c.hat === 'beanie') { g.beginPath(); g.arc(0, -hr * 1.44, .16, 0, TAU); g.fill(); }
    } else if (c.hat === 'fedora') {
      g.beginPath(); g.ellipse(0, -.46, 1.08, .16, -.04, 0, TAU); g.fill();
      g.beginPath(); rrect(g, -.5, -1.12, 1.0, .72, .3); g.fill();
      if (acc) { g.strokeStyle = acc; g.lineWidth = .07; g.beginPath(); g.moveTo(-.5, -.5); g.lineTo(.5, -.5); g.stroke(); }
    } else if (c.hat === 'wide') {
      g.beginPath(); g.ellipse(0, -.42, 1.25, .2, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, -.72, .5, .4, 0, 0, TAU); g.fill();
    }
  });
  // vestido / jaqueta
  if (c.dress) {
    const hem = 1.95, sw = Math.sin(t * 2) * .03; g.beginPath();
    g.moveTo(k.shR[0] * .9, k.shR[1] * .9 + .05); g.lineTo(.42 + k.shc[0] * .3, -.15); g.lineTo(.98 + sw, hem); g.quadraticCurveTo(0, hem + .2, -.98 - sw, hem); g.lineTo(-.42 + k.shc[0] * .3, -.15); g.lineTo(k.shL[0] * .9, k.shL[1] * .9 + .05); g.closePath(); g.fill();
  }
  if (c.jacket) { g.beginPath(); g.moveTo(.5, -.3); g.lineTo(.68, .95); g.quadraticCurveTo(0, 1.1, -.68, .95); g.lineTo(-.5, -.3); g.closePath(); g.fill(); }
  // bolsa
  if (c.bag) {
    const h = k.hR, sw = Math.sin(t * 2.6) * .05;
    g.save(); g.translate(h[0] + .02, h[1] + .02); g.rotate(sw); g.beginPath(); rrect(g, -.34, .3, .68, .6, .12); g.fill();
    g.beginPath(); g.lineWidth = .07; g.strokeStyle = fs; g.moveTo(-.2, .32); g.quadraticCurveTo(0, -.2, .2, .32); g.stroke();
    if (acc) { g.strokeStyle = acc; g.lineWidth = .045; g.beginPath(); g.moveTo(-.3, .45); g.lineTo(.3, .45); g.stroke(); }
    g.restore();
  }
  // mochila
  if (c.pack) {
    const ax = [Math.sin(k.la), -Math.cos(k.la)], px = [Math.cos(k.la), Math.sin(k.la)], cc = [ax[0] * 1.0 - px[0] * .55, ax[1] * 1.0 - px[1] * .55];
    g.save(); g.translate(cc[0], cc[1]); g.rotate(k.la); g.beginPath(); rrect(g, -.36, -.8, .72, 1.5, .26); g.fill();
    if (acc) { g.strokeStyle = acc; g.lineWidth = .05; g.beginPath(); g.moveTo(-.28, -.1); g.lineTo(.28, -.1); g.stroke(); }
    g.restore();
  }
  // guarda-chuva
  if (c.umb) {
    const h = k.hR, tx = h[0] + .35, ty = h[1] - 1.9;
    g.beginPath(); slCap(g, [h[0], h[1]], .05, [tx, ty], .05); g.fill();
    g.beginPath(); g.moveTo(tx - 1.7, ty + .1); g.quadraticCurveTo(tx - 1.5, ty - .95, tx, ty - .95); g.quadraticCurveTo(tx + 1.5, ty - .95, tx + 1.7, ty + .1);
    g.quadraticCurveTo(tx + 1.1, ty - .1, tx + .85, ty + .1); g.quadraticCurveTo(tx + .4, ty - .08, tx, ty + .1); g.quadraticCurveTo(tx - .4, ty - .08, tx - .85, ty + .1); g.quadraticCurveTo(tx - 1.1, ty - .1, tx - 1.7, ty + .1); g.closePath(); g.fill();
    if (acc) { g.strokeStyle = acc; g.lineWidth = .05; g.beginPath(); g.moveTo(tx - 1.5, ty + .02); g.quadraticCurveTo(tx, ty - .3, tx + 1.5, ty + .02); g.stroke(); }
  }
  // bengala
  if (c.cane) { const h = k.hR; g.beginPath(); slCap(g, [h[0] + .06, h[1] - .05], .055, [h[0] + .12, k.ground], .05); g.fill(); g.beginPath(); g.arc(h[0] + .0, h[1] - .02, .12, Math.PI, TAU); g.lineWidth = .08; g.strokeStyle = fs; g.stroke(); }
}
function slPoseOf(p, o, c) {
  if (typeof p === 'string') { if (p === 'walk') return walkPose(((o.t || 0) * (o.walk || 5)) + (o.seed || 0) * 1.7); p = POSE[p] || POSE.idle; }
  if (!p) { if (o.walk) return walkPose((o.t || 0) * o.walk + (o.seed || 0) * 1.7, 4); return POSE.idle; }
  return p;
}
function drawSil(ctx, x, y, s, pose, o) {
  o = o || {}; const who = o.who || 'adult', c = slCfg(who, o), f = o.flip ? -1 : 1, t = o.t || 0, S = s * c.sc;
  let pp = slFill(slPoseOf(pose, o, c));
  if (c.hunch) { pp.lean += who === 'old' ? 15 : 8; pp.head += who === 'old' ? 12 : 4; if (who === 'old') { pp.lR = [pp.lR[0] + 8, pp.lR[1] - 14]; pp.lL = [pp.lL[0] + 6, pp.lL[1] - 14]; } }
  if (c.cane) { pp.aR = [26, 8]; }
  if (c.umb) { pp.aR = [58, 30]; }
  if (c.bag && who === 'mae') { pp.aR = [10, 14]; }
  const k = skeleton(pp, { br: Math.sin(t * 2 + (o.seed || 0)) }), pr = slPrMul(SL_PR, c.th);
  pr.head = c.head; if (who === 'mae') { pr.tor = [.3, .34, .27]; pr.leg = [.27, .2, .13]; }
  const hk = { R: pp.hR, L: pp.hL }, rims = slRims(o, S), alpha = o.alpha == null ? 1 : o.alpha;
  slShadow(ctx, x, y, S, k, o, f);
  const hipX = x + (pp.dx + (o.dx || 0)) * S * f, hipY = y - (k.lift + (o.lift || 0)) * S - k.ground * S, R = 7.2 * S;
  ctx.save();
  slRender(ctx, hipX, hipY, R, rims, alpha, g => {
    g.save(); slXform(g, x, y, S, k, o, f);
    const fs = slBodyFill(g, k, o, k.head[1] - 1.4);
    g.beginPath(); slPartsAdd(g, k, pr, null, hk); g.fillStyle = fs; g.fill();
    slSilExtras(g, k, c, pr, t + (o.seed || 0) * .9, fs, who);
    g.restore();
  });
  ctx.restore();
}

/* ============================================================
   drawGiantHand(ctx,x,y,s,rot,curl,o) — mão preta enorme de dedos longos (ou luminosa com o.lum)
   (x,y) = centro do punho; s = largura da palma/1.9 em px (comprimento total ≈ 4.4·s + antebraço o.arm·s); rot (rad) 0 = dedos para cima;
   curl 0 aberta .. 1 punho/garra; o: t (dedos ondulam), flip, arm (u de antebraço, def 4), rim, alpha, lum (0..1 versão mágica branco-rosa), glowCol, seed, amb
   ============================================================ */
function slHandBuild(g, curl, t, seed, arm) {
  const r = rng((seed || 1) * 31 + 5), W = [], fing = [{ x: -.66, y: -1.15, a: -15, L: [.78, .56, .44], r: .33 }, { x: -.22, y: -1.4, a: -5, L: [.86, .62, .48], r: .34 }, { x: .23, y: -1.38, a: 5, L: [.82, .58, .46], r: .335 }, { x: .64, y: -1.12, a: 15, L: [.64, .44, .36], r: .3 }];
  const wob = (i, j) => Math.sin(t * 1.7 + i * 1.3 + j * .8 + seed) * 2.6;
  const cs = [34, 56, 44];
  // palma + punho + antebraço
  slCap(g, [0, .4 + (arm || 0)], .72, [0, .4], .62); slCap(g, [0, .4], .62, [0, -.5], .96); slCap(g, [0, -.5], .96, [-.52, -1.2], .38); slCap(g, [0, -.5], .96, [.52, -1.2], .38); slCap(g, [-.5, -1.1], .4, [.5, -1.1], .4);
  fing.forEach((fg, i) => {
    let px = fg.x, py = fg.y, a = fg.a, rr = fg.r; const vv = 1 + (r() - .5) * .1;
    for (let j = 0; j < 3; j++) {
      a += -curl * cs[j] * (1 - i * .04) + wob(i, j) * (1 - curl * .6); const L = fg.L[j] * vv * 2.0 * (1 - curl * .08), nx = px + Math.sin(rad(a)) * L, ny = py - Math.cos(rad(a)) * L, r2 = rr * (j === 2 ? .8 : .9);
      slCap(g, [px, py], rr, [nx, ny], r2); px = nx; py = ny; rr = r2;
    }
  });
  // polegar
  let px = -.82, py = -.45, a = -64 + curl * 18, rr = .36;
  for (let j = 0; j < 2; j++) { a += -curl * [30, 40][j] + wob(5, j); const L = [1.0, .85][j], nx = px + Math.sin(rad(a)) * L, ny = py - Math.cos(rad(a)) * L, r2 = rr * (j ? .7 : .86); slCap(g, [px, py], rr, [nx, ny], r2); px = nx; py = ny; rr = r2; }
}
function drawGiantHand(ctx, x, y, s, rot, curl, o) {
  o = o || {}; curl = curl || 0; const f = o.flip ? -1 : 1, t = o.t || 0, arm = o.arm == null ? 4 : o.arm, alpha = o.alpha == null ? 1 : o.alpha, lum = o.lum || 0;
  const rims = slRims(o, s), R = (5.2 + arm) * s;
  ctx.save();
  slRender(ctx, x, y, R, rims, alpha, g => {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(f * s, s);
    g.beginPath(); slHandBuild(g, curl, t, o.seed || 1, arm);
    if (lum > .001) {
      const gc = o.glowCol || '#ff9ed6'; g.shadowColor = rgba(gc, .9 * lum); g.shadowBlur = .55 * slK(g);
      g.fillStyle = lg(g, 0, .4 + arm, 0, -3.6, [[0, mix('#ffc6e4', '#ffffff', .0)], [.35, '#ffe6f3'], [1, '#fff8fc']]); g.fill(); g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); slCap(g, [0, .2], .12, [0, -1.2], .1); g.fill();
    } else { g.fillStyle = o.amb ? lg(g, 0, .4 + arm, 0, -3.6, [[0, SL_BLACK], [1, mix(SL_BLACK, o.amb, .25)]]) : mix(SL_BLACK, '#14142a', .15); g.fill(); }
    g.restore();
  });
  ctx.restore();
}

/* ============================================================
   drawEyes — par de olhos brancos brilhantes que piscam e olham.  s = largura de um olho (px)
   o: look:[-1..1,-1..1], angry (−.5..1 inclinação), col, blink (0..1 força manual), seed, a (alfa), glow (0..1), pupil (0..1), gap (def 1.25 s centro a centro), open (0..1)
   ============================================================ */
var SL_EG = null;
function slEyeGlow() { if (SL_EG) return SL_EG; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = rg(g, 64, 64, 0, 64, [[0, 'rgba(255,255,255,.7)'], [.3, 'rgba(210,225,255,.28)'], [1, 'rgba(180,200,255,0)']]); g.fillRect(0, 0, 128, 128); return (SL_EG = c); }
function slBlink(t, seed) { const per = 2.7 + (seed % 7) * .33, ph = (seed * 1.37) % per, q = ((t + ph) % per); return q < .16 ? Math.sin(q / .16 * Math.PI) : 0; }
function slEye(ctx, x, y, w, op, ang, col, look, pupil) {
  const h = w * .52 * op;
  ctx.save(); ctx.translate(x + look[0] * w * .06, y + look[1] * w * .04); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.bezierCurveTo(-w * .28, -h * 1.1, w * .28, -h * 1.1, w / 2, -h * .05); ctx.bezierCurveTo(w * .26, h * .95, -w * .28, h * .95, -w / 2, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  if (pupil > .01 && op > .3) { ctx.save(); ctx.clip(); ctx.fillStyle = `rgba(20,24,50,${.62 * pupil})`; ctx.beginPath(); ctx.ellipse(look[0] * w * .2, look[1] * h * .3, w * .07, h * .55, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function drawEyes(ctx, x, y, s, t, o) {
  o = o || {}; const sd = o.seed || 0, a = o.a == null ? 1 : o.a, look = o.look || [0, 0], col = o.col || '#f6fbff', gp = o.gap == null ? 1.25 : o.gap;
  let bl = o.blink != null ? o.blink : slBlink(t || 0, sd); const op = Math.max(.04, (o.open == null ? 1 : o.open) * (1 - bl));
  ctx.save(); ctx.globalAlpha *= a; const gl = o.glow == null ? 1 : o.glow, ang = (o.angry == null ? .12 : o.angry) * .6, tl = o.tilt || 0;
  ctx.translate(x, y); ctx.rotate(tl); ctx.globalCompositeOperation = 'lighter'; const G = slEyeGlow();
  for (const sd2 of [-1, 1]) { ctx.globalAlpha = a * .8 * gl; ctx.drawImage(G, sd2 * s * gp / 2 - s * 1.2, -s * 1.2, s * 2.4, s * 2.4); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  slEye(ctx, -s * gp / 2, 0, s, op, ang, col, look, o.pupil == null ? .7 : o.pupil); slEye(ctx, s * gp / 2, 0, s, op, -ang, col, look, o.pupil == null ? .7 : o.pupil);
  ctx.restore();
}
/* campo de pares de olhos flutuando: n pares dentro de box {x,y,w,h}; o: target:[x,y] (todos olham p/ lá), sMin,sMax, col, a, speed */
function drawEyeField(ctx, t, seed, n, box, o) {
  o = o || {}; const sMin = o.sMin || 9, sMax = o.sMax || 34, list = [];
  for (let i = 0; i < n; i++) {
    const r = rng(seed * 1009 + i * 77 + 3), per = 5 + r() * 6, ph = r() * per, cyc = Math.floor((t + ph) / per), r2 = rng(seed * 733 + i * 31 + cyc * 17 + 1), q = ((t + ph) % per) / per;
    const fade = Math.min(1, q / .14) * Math.min(1, (1 - q) / .14), sz = sMin + Math.pow(r2(), 1.6) * (sMax - sMin);
    const px = box.x + r2() * box.w + Math.sin(t * .4 + i) * 6, py = box.y + r2() * box.h + Math.sin(t * .33 + i * 1.7) * 5 - q * 18;
    list.push({ px, py, sz, fade, i, ang: (r2() - .5) * .5, ang2: r2() * .5 });
  }
  list.sort((a, b) => a.sz - b.sz);
  for (const e of list) {
    let look = [0, 0]; if (o.target) { const dx = o.target[0] - e.px, dy = o.target[1] - e.py, d = Math.hypot(dx, dy) || 1; look = [dx / d, dy / d]; } else look = [Math.sin(t * .7 + e.i), Math.cos(t * .5 + e.i * 2) * .5];
    drawEyes(ctx, e.px, e.py, e.sz, t, { seed: e.i * 13 + seed, a: e.fade * (o.a == null ? 1 : o.a) * (.5 + .5 * (e.sz - sMin) / (sMax - sMin + 1e-6)), look, col: o.col, tilt: e.ang * .6, angry: e.ang2 + (o.angry || 0), glow: o.glow });
  }
}

/* ============================================================
   drawTrail(ctx, drawFn, t, n, dt, o) — afterimages: n fantasmas em t−k·dt com alfa decrescente
   drawFn(c, tt, info) DEVE desenhar no contexto `c` passado (info:{k,a,ghost}). Chame você mesmo o desenho principal depois (ou o.main:true).
   o: a (alfa do 1º fantasma, .5), pow, col (tinge os fantasmas, ex '#ff7ab8'), comp ('lighter'...), box:[x,y,w,h] (região de recorte p/ tingir mais rápido)
   ============================================================ */
var SL_TC = null;
function drawTrail(ctx, drawFn, t, n, dt, o) {
  o = o || {}; const a0 = o.a == null ? .5 : o.a, pw = o.pow || 1.5;
  for (let k = n; k >= 1; k--) {
    const a = a0 * Math.pow(1 - (k - 1) / n, pw) * (1 - k / (n + 2)), info = { k, a, ghost: true };
    if (a < .01) continue;
    if (o.col) {
      const cv = ctx.canvas; if (!SL_TC) SL_TC = document.createElement('canvas'); if (SL_TC.width !== cv.width || SL_TC.height !== cv.height) { SL_TC.width = cv.width; SL_TC.height = cv.height; }
      const tg = SL_TC.getContext('2d'), m = ctx.getTransform();
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.globalAlpha = 1; tg.clearRect(0, 0, SL_TC.width, SL_TC.height);
      tg.setTransform(m); drawFn(tg, t - k * dt, info);
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = o.col; tg.fillRect(0, 0, SL_TC.width, SL_TC.height); tg.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= a; if (o.comp) ctx.globalCompositeOperation = o.comp; ctx.drawImage(SL_TC, 0, 0); ctx.restore();
    } else { ctx.save(); ctx.globalAlpha *= a; if (o.comp) ctx.globalCompositeOperation = o.comp; drawFn(ctx, t - k * dt, info); ctx.restore(); }
  }
  if (o.main) drawFn(ctx, t, { k: 0, a: 1, ghost: false });
}

/* ============================================================
   dustPuff(ctx,x,y,t0,t,o) — poeira de aterrissagem/passos (x,y no chão).  o: size (px, def 26), n (def 9), dir (−1|0|1), col ('r,g,b' ou '#hex'), dur (s, def .9), ring, seed, a, up
   ============================================================ */
function dustPuff(ctx, x, y, t0, t, o) {
  o = o || {}; const age = t - t0, dur = o.dur || .9; if (age < 0 || age > dur) return;
  const q = age / dur, sz = o.size || 26, n = o.n || 9, dir = o.dir || 0, r = rng((o.seed || 1) * 53 + 7), a0 = o.a == null ? .55 : o.a;
  let col = o.col || '214,196,184'; if (col[0] === '#') { const h = hex(col); col = h.join(','); }
  const e = E.out3(q); ctx.save();
  for (let i = 0; i < n; i++) {
    const sd = dir !== 0 ? dir * (.35 + .65 * r()) : (r() < .5 ? -1 : 1) * (.2 + .8 * r()), sp = (1.1 + r() * 1.5) * sz * 2.2, rr = sz * (.45 + r() * .7) * (.4 + e * 1.15), up = (o.up == null ? 1 : o.up) * (r() * .8 + .2) * sz * 1.3 * e;
    const px = x + sd * sp * e, py = y - rr * .35 - up - Math.sin(q * 2.2) * sz * .15, al = a0 * (1 - q) * (1 - q * .4) * (.6 + r() * .4);
    ctx.fillStyle = rg(ctx, px - rr * .2, py - rr * .25, 0, rr, [[0, `rgba(${col},${al})`], [.7, `rgba(${col},${al * .75})`], [1, `rgba(${col},0)`]]);
    ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.fill();
  }
  // pedrinhas
  for (let i = 0; i < Math.round(n * .7); i++) {
    const sd = (r() - .5) * 2 + (dir * .6), vy = 160 + r() * 260, vx = sd * (120 + r() * 220), px = x + vx * age * .5, py = y - vy * age + 520 * age * age, sr = Math.max(.6, sz * .06 * (1 - q) * (.5 + r()));
    if (py > y + 2) continue; ctx.fillStyle = `rgba(${col},${(1 - q) * .85})`; ctx.beginPath(); ctx.arc(px, py, sr, 0, TAU); ctx.fill();
  }
  if (o.ring) { ctx.strokeStyle = `rgba(${col},${(1 - q) * .5})`; ctx.lineWidth = Math.max(1, sz * .12 * (1 - q)); ctx.beginPath(); ctx.ellipse(x, y, sz * (.6 + 4 * e), sz * (.15 + .7 * e) * .5, 0, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
