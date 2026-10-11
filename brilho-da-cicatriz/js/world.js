'use strict';
/* ============================================================
   world.js — KIT DO MUNDO EXTERIOR (WORLD2 / agente WORLD_EXT)
   Quebrada pintada em camadas de paralaxe, céus, chão, postes, fios, lajes, pipas, helpers de cena.
   Tudo determinístico (função de t + semente). Nada de Math.random/Date.

   MOOD (contínuo, aceita fracionário):  0 = noite fria azul-petróleo (janelas âmbar, muito contraste)
                                         1 = amanhecer dourado-rosado
                                         2 = dia cinza-azulado desbotado (verso 2)
                                         3 = noite pastel kawaii do refrão (casinhas rosa/menta/lilás/amarelo + pisca-pisca)

   ---- INICIALIZAÇÃO ----
   initWorld()                                   gera caches (nebulosa, estrelas, nuvens). Chamada por main.js. (Idempotente; tudo é lazy também.)
   makeNebula()  drawNebula(ctx,x,y,w,h,{z,ox,oy,hue})   nebulosa pintada (usada por magic.js)
   drawStars(ctx,t,seed,n,x0,y0,w,h,a)           estrelas piscando
   drawCrane(ctx,x,y,s,flap,{body,shade,edge,gold,wing,rot})   grua de origami
   drawSphere(ctx,x,y,R,{crack,glow,t,shatter})  esfera de porcelana com kintsugi

   ---- QUEBRADA (morro de favela, 4 camadas 0=distante .. 3=próxima) ----
   drawQuebrada(ctx,camX,y0,mood,o)  y0 = linha do chão da camada próxima na tela. Desenha céu (a menos de o.sky===false),
        pipas, 4 camadas (cache offscreen, DOF baked), postes+fios+gambiarra, pisca-pisca (mood>2).
        o = {t, lit(0..1: luzes das janelas; 1=padrão do mood, 0=apagão), night(0..1 escurece extra), fog(0..2 névoa de horizonte),
             noLayer:[idx], layerY:[dy0,dy1,dy2,dy3], lights(0..1 pisca-pisca; padrão por mood), sky:false, kites:false, poles:false,
             skyOpts:{...} repassado ao céu}
        retorna {base:[y de cada camada]}.
   quebradaBlock(li,wx)                          bloco (casa) da camada li na coordenada de mundo wx -> {x,w,h,nf,rh,cols,...}
   quebradaToScreen(li,wx,wy,camX,y0,o)          coord. de mundo da camada (wy = altura acima do chão, + = sobe) -> [sx,sy]
   quebradaWindow(li,wx,floor,col)               retângulo local {x,y,w,h} da janela (y negativo = acima do chão) do bloco em wx
   wqNight(mood)                                 0..1 quão "noite" é o mood (para acender luzes etc.)

   ---- CHÃO E PRIMEIRO PLANO ----
   drawBecoGround(ctx,y0,mood,camX,o)            rua/beco de concreto (calçada, juntas, poças, ralos). o={lamps:[x...],puddles:true}
   drawEscadaria(ctx,x,y,n,mood,o)               degraus subindo a partir de (x,y)=pé; o={w:46,h:26,dir:1|-1,rail:true,wall:true,t}; retorna {x,y} do topo
   drawPoste(ctx,x,y0,h,mood,o)                  poste de concreto com cruzeta, transformador, lâmpada, fios, tênis pendurado. o={wires:true|false,span,on(0..1),t,s,sneakers}
   drawWires(ctx,pts,sag,o)                      fios em catenária por uma polilinha [[x,y],...]; o={n,gap,col,lw,sway,t,sheen}
   drawLaje(ctx,x,y,w,mood,o)                    laje (y = topo do piso): mureta, vergalhão, caixa d'água, varal, antena, plantas. o={h,drop,mureta,rebar:'L'|'R'|'LR'|false,tank:u,varal,ant:u,dish:u,plants,chair,seed,t}
   drawTightrope(ctx,x0,y0,x1,y1,sag,t,o)       corda bamba/fio entre lajes. o={col,lw,wob,anchors}
   tightropePt(x0,y0,x1,y1,sag,u,t,wob)          ponto [x,y] da corda em u (0..1) — p/ pôr personagem em cima
   drawPipa(ctx,x,y,s,rot,t,o)                   pipa (papagaio) com linha e rabiola. o={c1,c2,c3,anchor:[ax,ay],cut:0..1|bool,tail,glow,slack}
   ---- CÉUS ---- (todos respeitam ctx.globalAlpha; cobrem x -400..W+400, y -400..y1)
   drawNightSky(ctx,t,o)    o={y1,moon,moonX,moonY,clouds,stars,neb,top,mid,bot}
   drawDawnSky(ctx,t,o)     o={y1,p(0..1 sol subindo),sunX,sunY,clouds}
   drawDaySky(ctx,t,o)      o={y1,clouds,sun}
   drawKawaiiSky(ctx,t,o)   o={y1,neb,rainbow,clouds,stars}
   drawSkyMood(ctx,mood,t,o)   céu certo para o mood (interpola)
   ---- HELPERS DE CENA (self-contained; o.scene=true desenha também céu+quebrada+chão) ----
   drawRoof(ctx,t,o)                 vista da laje à noite com a cidade ao fundo. o={mood,camX,y0(topo da laje),city:true,tank,varal,seed}
   drawBusStop(ctx,x,y0,s,mood,t,o)  ponto de ônibus de madrugada: abrigo, banco, placa, poste de luz. o={scene,camX,lamp,seed}
   drawSchoolGate(ctx,x,y0,s,mood,t,o) portão de escola com cadeado e muro com pichação suave. o={scene,camX,lock(1 trancado..0),open(0..1),w}
   ============================================================ */

/* ---------------------------------------------------------------
   0. nebulosa, estrelas, esfera, grua (portado + melhorado)
   --------------------------------------------------------------- */
let NEB = null;
function makeNebula() {
  const w = 2048, h = 1152, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), r = rng(2024);
  g.fillStyle = lg(g, 0, 0, w, h, [[0, '#06143d'], [.5, '#0d3a8a'], [1, '#081a4a']]); g.fillRect(0, 0, w, h);
  const cols = ['#1d6fe0', '#35c3ee', '#e0529f', '#f7a8cf', '#a58cf5', '#fff1c9', '#0b2a6b', '#ff8fbd', '#2a49c9'];
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h, rr = 160 + r() * 380, col = cols[Math.floor(r() * cols.length)];
    g.globalCompositeOperation = i % 4 === 0 ? 'screen' : 'source-over';
    g.fillStyle = rg(g, x, y, 0, rr, [[0, rgba(col, .34)], [1, rgba(col, 0)]]); g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  g.globalCompositeOperation = 'source-over'; g.lineCap = 'round';
  for (let i = 0; i < 5200; i++) {
    const x = r() * w, y = r() * h, n = noise2(x / 420, y / 420, 5), ang = noise2(x / 300, y / 300, 9) * TAU * 1.6;
    const ci = Math.floor(((n * 1.35 + noise2(x / 900, y / 900, 3) * .9) % 1) * cols.length), col = cols[ci];
    const len = 26 + r() * 90, wid = 5 + r() * 20;
    g.strokeStyle = rgba(col, .05 + r() * .13); g.lineWidth = wid;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(ang) * len * .6 + r() * 10, y + Math.sin(ang) * len * .6, x + Math.cos(ang + .4) * len, y + Math.sin(ang + .4) * len); g.stroke();
  }
  g.globalCompositeOperation = 'screen';
  g.fillStyle = rg(g, w * .58, h * .46, 0, 520, [[0, 'rgba(255,240,205,.9)'], [.3, 'rgba(255,170,205,.45)'], [1, 'rgba(255,170,205,0)']]); g.fillRect(0, 0, w, h);
  g.fillStyle = rg(g, w * .2, h * .8, 0, 480, [[0, 'rgba(60,200,240,.55)'], [1, 'rgba(60,200,240,0)']]); g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 1100; i++) {
    const x = r() * w, y = r() * h, ang = noise2(x / 200, y / 200, 4) * TAU * 2, len = 14 + r() * 40;
    g.strokeStyle = `rgba(255,255,255,${.02 + r() * .05})`; g.lineWidth = 1 + r() * 3;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
  }
  for (let i = 0; i < 560; i++) {
    const x = r() * w, y = r() * h, s = r() * r() * 2.4 + .4;
    g.fillStyle = `rgba(255,255,255,${.4 + r() * .6})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  for (let i = 0; i < 50; i++) sparkle(g, r() * w, r() * h, 5 + r() * 12, 0, `rgba(255,250,235,${.6 + r() * .4})`);
  g.strokeStyle = 'rgba(255,220,150,.75)'; g.fillStyle = 'rgba(255,220,150,.9)'; g.lineWidth = 2;
  for (let k = 0; k < 26; k++) {
    let x = w * (.35 + r() * .6), y = r() * h; g.beginPath(); g.moveTo(x, y);
    const steps = 3 + Math.floor(r() * 4);
    for (let s = 0; s < steps; s++) { x += (r() < .5 ? -1 : 1) * (40 + r() * 120); g.lineTo(x, y); y += (r() < .5 ? -1 : 1) * (30 + r() * 100); g.lineTo(x, y); }
    g.stroke(); g.beginPath(); g.arc(x, y, 5, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill();
  }
  NEB = c;
}
function drawNebula(ctx, x, y, w, h, o = {}) {
  if (!NEB) makeNebula();
  const z = o.z || 1, ox = o.ox || 0, oy = o.oy || 0, hu = o.hue || 0;
  const sw = NEB.width / z, sh = sw * h / w;
  const sx = clamp((NEB.width - sw) / 2 + ox, 0, NEB.width - sw), sy = clamp((NEB.height - sh) / 2 + oy, 0, Math.max(0, NEB.height - sh));
  ctx.save(); if (hu) ctx.filter = `hue-rotate(${hu}deg)`;
  ctx.drawImage(NEB, sx, sy, sw, sh, x, y, w, h); ctx.restore();
}
function drawStars(ctx, t, seed, n, x0, y0, w, h, a = 1) {
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w, y = y0 + r() * h, s = .6 + r() * r() * 2.6, ph = r() * TAU, sp = 1 + r() * 3;
    const tw = .5 + .5 * Math.sin(t * sp + ph);
    ctx.fillStyle = `rgba(255,248,230,${(.25 + .75 * tw) * a})`; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    if (s > 2.2) sparkle(ctx, x, y, s * 4 * tw, 0, `rgba(255,250,235,${.8 * a})`);
  }
  ctx.restore();
}
const CRACKS = (() => {
  const r = rng(31), list = [];
  function branch(x, y, ang, len, depth, delay) {
    const pts = [[x, y]]; let px = x, py = y, a = ang;
    const steps = 5 + Math.floor(r() * 4);
    for (let i = 0; i < steps; i++) { a += (r() - .5) * .85; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; pts.push([px, py]); }
    list.push({ pts, depth, delay });
    if (depth < 3) for (let k = 0; k < 2; k++) if (r() < .85) { const i = 1 + Math.floor(r() * (pts.length - 2)); branch(pts[i][0], pts[i][1], a + (r() < .5 ? -1 : 1) * (.5 + r() * .9), len * .6, depth + 1, delay + i / steps * .35); }
  }
  for (let k = 0; k < 5; k++) branch(0, 0, k / 5 * TAU + r() * .7, .9, 0, 0);
  return list;
})();
function drawSphere(ctx, x, y, R, o = {}) {
  const crack = o.crack == null ? 1 : o.crack, glow = o.glow == null ? 1 : o.glow, t = o.t || 0, shat = o.shatter || 0;
  ctx.save(); ctx.translate(x, y);
  if (shat > 0) {
    const r = rng(77);
    for (let i = 0; i < 22; i++) {
      const a = r() * TAU, d = shat * R * (2 + r() * 6), sz = R * (.12 + r() * .24), rot = r() * TAU + shat * (r() - .5) * 8;
      ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(rot); ctx.globalAlpha *= 1 - shat * .6;
      ctx.fillStyle = lg(ctx, -sz, -sz, sz, sz, [[0, '#fff7e6'], [1, '#b9a98a']]); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.5;
      poly(ctx, [[-sz, -sz * .4], [sz * .2, -sz], [sz, sz * .3], [-sz * .1, sz]]); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.restore(); return;
  }
  if (glow > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, R * .6, R * (2.2 + .3 * Math.sin(t * 3)), [[0, `rgba(255,200,110,${.55 * glow})`], [1, 'rgba(255,200,110,0)']]); ctx.fillRect(-R * 3, -R * 3, R * 6, R * 6); ctx.globalCompositeOperation = 'source-over'; }
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
  ctx.fillStyle = rg(ctx, -R * .35, -R * .4, R * .1, R * 1.25, [[0, '#fffdf6'], [.55, '#e9e1d0'], [1, '#8f8a82']]); ctx.fillRect(-R, -R, R * 2, R * 2);
  const pr = rng(12); ctx.globalAlpha *= .85;
  for (let i = 0; i < 9; i++) {
    const a = pr() * TAU, d = pr() * R * .85, px = Math.cos(a) * d, py = Math.sin(a) * d, s = R * (.06 + pr() * .06);
    ctx.fillStyle = i % 3 ? '#d6403c' : '#2e5fb8'; ctx.beginPath(); ctx.ellipse(px, py, s * 1.6, s, pr() * 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2e5fb8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + s * 2, py - s, px + s * 4, py + s); ctx.stroke();
  }
  ctx.restore(); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, R, [[0, `rgba(255,236,180,${.95 * glow})`], [.5, `rgba(255,190,90,${.35 * glow})`], [1, 'rgba(255,190,90,0)']]); ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.restore();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const k of CRACKS) {
    const pr2 = clamp((crack - k.delay) / (1 - k.delay * .9)); if (pr2 <= 0) continue;
    const n = k.pts.length - 1, upto = pr2 * n;
    ctx.beginPath(); ctx.moveTo(k.pts[0][0] * R, k.pts[0][1] * R);
    for (let i = 1; i <= Math.ceil(upto); i++) { const f = Math.min(1, upto - (i - 1)), p0 = k.pts[i - 1], p1 = k.pts[i]; ctx.lineTo((p0[0] + (p1[0] - p0[0]) * f) * R, (p0[1] + (p1[1] - p0[1]) * f) * R); }
    const wdt = (2.1 - k.depth * .45) * (R / 150 * .8 + .2);
    ctx.strokeStyle = `rgba(255,200,90,${.55 * glow})`; ctx.lineWidth = wdt * 3; ctx.stroke();
    ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = wdt; ctx.stroke();
    ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = wdt * .35; ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-R * .42, -R * .5, R * .16, R * .09, -.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,20,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.restore();
}
function drawCrane(ctx, x, y, s, flap = 0, o = {}) {
  const body = o.body || '#fff8ea', shade = o.shade || '#d8c9a8', edge = o.edge || '#3a3550', gold = o.gold;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.lineJoin = 'round'; ctx.lineWidth = 2.2 / Math.max(s, .3);
  const f = Math.sin(flap) * 28;
  const P = (pts, col) => { poly(ctx, pts); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = edge; ctx.stroke(); };
  P([[-4, 4], [-52, -16 - f * .35], [-30, 8]], shade);
  P([[-52, 6], [-34, -4], [-6, 4], [34, 4], [50, -14], [58, -22], [40, 8], [-6, 20]], body);
  P([[-6, 4], [-60, -34 - f], [-18, 18]], o.wing || '#f5ecd8');
  P([[34, 4], [50, -14], [58, -22], [55, -14], [42, 6]], shade);
  P([[-52, 6], [-70, 14], [-34, 6]], shade);
  P([[58, -22], [72, -17], [56, -17]], gold ? '#ffd36b' : '#e24a3b');
  if (gold) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, 90, [[0, 'rgba(255,220,140,.45)'], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(-100, -100, 200, 200); }
  ctx.restore();
}

/* ---------------------------------------------------------------
   1. paletas por mood
   --------------------------------------------------------------- */
const WQ = [
  { // 0 noite fria
    walls: ['#244253', '#2d5063', '#1c3646', '#335669', '#274759', '#2e4254'], brick: ['#5a3a3c', '#664240', '#4c3234'], brickKeep: 1,
    doors: ['#2c4150', '#3a4a40', '#53403a', '#2a3550'], slab: '#7fa0b4', shade: '#02060e', rim: '#8fc4e4', win: '#08141f', winLit: '#ffb23e', winLit2: '#ff8f26', frame: '#06101a',
    tank: '#5f88a8', tankLid: '#92b8cf', metal: '#1d2e3d', telha: '#68403f', fibra: '#4f7a82', wire: '#03070d', lit: .34, glow: '255,168,58', glowA: .34, fog: '#17405a', cloth: ['#8ea6b6', '#5d7488', '#b9c8d0', '#7a8f9c'],
    grdTop: '#1c3342', grdBot: '#0b1824', ground: '#36566a', curb: '#6f93a8', lampC: '255,200,110', night: 1, plant: '#2f6a58'
  },
  { // 1 amanhecer dourado-rosado
    walls: ['#e0a99c', '#ecbf9c', '#cf93a0', '#f3cba2', '#c6929a', '#e2b38a'], brick: ['#b86248', '#aa5a44', '#c4704f'], brickKeep: 1,
    doors: ['#7a5a6a', '#6a7a82', '#a8634e', '#5d6a8a'], slab: '#f7dcb8', shade: '#43244a', rim: '#ffdc8c', win: '#6b4a5e', winLit: '#ffe6a0', winLit2: '#ffc874', frame: '#4b2f48',
    tank: '#8fb2cc', tankLid: '#dcecf4', metal: '#684a5e', telha: '#c05a42', fibra: '#8ebcbc', wire: '#35223f', lit: .12, glow: '255,214,128', glowA: .24, fog: '#f6b99e', cloth: ['#f5e1d0', '#e6a0a0', '#ffd890', '#b8c4e0'],
    grdTop: '#b08c92', grdBot: '#6c5470', ground: '#d6a99a', curb: '#f2cfb4', lampC: '255,222,160', night: .2, plant: '#5f8a5a'
  },
  { // 2 dia cinza-azulado desbotado
    walls: ['#9ca6af', '#abb3ba', '#8e99a3', '#b8bec2', '#98a3a9', '#a5abb5'], brick: ['#92807c', '#867472', '#9c8b86'], brickKeep: 1,
    doors: ['#5f6b78', '#6e7c80', '#7d6f68', '#59647a'], slab: '#cfd4d8', shade: '#27303c', rim: '#f0f4f8', win: '#58656f', winLit: '#d8d6bc', winLit2: '#cfcfae', frame: '#3d4854',
    tank: '#8896a5', tankLid: '#b9c3cd', metal: '#5a6672', telha: '#8e7d78', fibra: '#8fa0a6', wire: '#2a313a', lit: .03, glow: '225,225,200', glowA: .0, fog: '#cdd5dc', cloth: ['#d0d4d8', '#9aa4ad', '#e6e8ea', '#aeb6bd'],
    grdTop: '#929aa2', grdBot: '#707882', ground: '#a1a9b1', curb: '#c8cdd2', lampC: '235,235,215', night: 0, plant: '#6c8470'
  },
  { // 3 noite pastel kawaii
    walls: ['#ff9ccf', '#a2f5da', '#c9a6ff', '#ffe08a', '#8fd6ff', '#ffc2a8'], brick: ['#ff9a8e', '#ffb592', '#f48fae'], brickKeep: .3,
    doors: ['#7a5fd0', '#34c9b0', '#ff6fae', '#4fa8ff'], slab: '#fff2fa', shade: '#4a2c86', rim: '#fff3b0', win: '#6c52b0', winLit: '#fff3bc', winLit2: '#ffc4e4', frame: '#ffffff',
    tank: '#8fd6ff', tankLid: '#ffffff', metal: '#8566c8', telha: '#ff9aa0', fibra: '#a2f5da', wire: '#38246a', lit: .46, glow: '255,232,190', glowA: .3, fog: '#ecb6ff', cloth: ['#ff9ccf', '#a2f5da', '#fff4a8', '#c9a6ff'],
    grdTop: '#bda0e8', grdBot: '#7f60c0', ground: '#d6bff2', curb: '#fff2fa', lampC: '255,232,210', night: 1, plant: '#5fcf9a'
  },
];
const _wqLo = m => Math.min(3, Math.max(0, Math.floor(m + 1e-6))), _wqF = m => { const lo = _wqLo(m); return lo >= 3 ? 0 : m - lo; };
function wqC(key, m) { m = clamp(m, 0, 3); const lo = _wqLo(m), f = _wqF(m); let a = WQ[lo][key], b = WQ[Math.min(3, lo + 1)][key]; if (Array.isArray(a)) { a = a[1]; b = b[1]; } return f < .002 ? a : mix(a, b, f); }
function wqRGB(key, m) { m = clamp(m, 0, 3); const lo = _wqLo(m), f = _wqF(m), a = WQ[lo][key].split(',').map(Number), b = WQ[Math.min(3, lo + 1)][key].split(',').map(Number); return a.map((v, i) => Math.round(lerp(v, b[i], f))).join(','); }
function wqN(key, m) { m = clamp(m, 0, 3); const lo = _wqLo(m), f = _wqF(m); return f < .002 ? WQ[lo][key] : lerp(WQ[lo][key], WQ[lo + 1][key], f); }
function wqNight(m) { return wqN('night', m); }
const _wqCv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const _wqMod = (a, n) => ((a % n) + n) % n;

/* ---------------------------------------------------------------
   2. sprites: nuvens e estrelas (cache)
   --------------------------------------------------------------- */
const _wqCloudC = {}; let _wqStars = null, _wqDone = false;
function wqCloud(tint, tint2) {
  const key = tint + '|' + tint2; if (_wqCloudC[key]) return _wqCloudC[key];
  const c = _wqCv(720, 220), g = c.getContext('2d'), r = rng(tint.length * 31 + 7);
  for (let i = 0; i < 26; i++) { // base
    const u = r(), x = 110 + u * 500, y = 120 - Math.sin(u * Math.PI) * 38 + (r() - .5) * 34, rr = 38 + Math.sin(u * Math.PI) * 44 * (.5 + r() * .6);
    g.fillStyle = rg(g, x, y, 0, rr, [[0, `rgba(${tint},.62)`], [.6, `rgba(${tint},.3)`], [1, `rgba(${tint},0)`]]); g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  g.globalCompositeOperation = 'source-atop'; // sombra por baixo, luz por cima
  g.fillStyle = lg(g, 0, 40, 0, 190, [[0, `rgba(${tint2},.0)`], [1, `rgba(${tint2},.55)`]]); g.fillRect(0, 0, 720, 220);
  g.globalCompositeOperation = 'source-over'; g.lineCap = 'round';
  for (let i = 0; i < 90; i++) { // pinceladas
    const x = 80 + r() * 560, y = 70 + r() * 90, l = 24 + r() * 60; g.strokeStyle = `rgba(${i % 3 ? tint : tint2},${.03 + r() * .06})`; g.lineWidth = 3 + r() * 9;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - .5) * 6); g.stroke();
  }
  return (_wqCloudC[key] = c);
}
function wqDrawCloud(ctx, x, y, s, a, tint, tint2, sy = 1) {
  const c = wqCloud(tint, tint2); ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(c, x - 360 * s, y - 110 * s * sy, 720 * s, 220 * s * sy); ctx.restore();
}
function wqMakeStars() {
  const c = _wqCv(W, H), g = c.getContext('2d'), r = rng(808);
  for (let i = 0; i < 360; i++) {
    const x = r() * W, y = Math.pow(r(), 1.5) * H * .85, s = r() * r() * 1.7 + .35, a = (.3 + r() * .7) * (1 - y / H * .6);
    if (s > 1.2) { g.fillStyle = rg(g, x, y, 0, s * 4, [[0, `rgba(255,248,230,${a * .5})`], [1, 'rgba(255,248,230,0)']]); g.fillRect(x - s * 4, y - s * 4, s * 8, s * 8); }
    g.fillStyle = `rgba(${r() < .2 ? '190,220,255' : r() < .3 ? '255,226,190' : '255,250,240'},${a})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  for (let i = 0; i < 14; i++) sparkle(g, r() * W, r() * H * .6, 4 + r() * 7, 0, `rgba(255,250,235,${.5 + r() * .4})`);
  _wqStars = c;
}
function initWorld() {
  if (_wqDone) return; _wqDone = true;
  makeNebula(); wqMakeStars();
  wqCloud('30,62,90', '4,14,28'); wqCloud('255,170,150', '120,70,120'); wqCloud('226,232,238', '140,152,166'); wqCloud('255,222,244', '190,150,230');
  for (let i = 0; i < 4; i++) wqGroundTile(i);
}

/* ---------------------------------------------------------------
   3. céus
   --------------------------------------------------------------- */
function wqMoon(ctx, x, y, R, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y, R * .8, R * 6, [[0, 'rgba(160,210,255,.34)'], [.3, 'rgba(110,170,230,.1)'], [1, 'rgba(110,170,230,0)']]); ctx.fillRect(x - R * 6, y - R * 6, R * 12, R * 12);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rg(ctx, x - R * .3, y - R * .3, R * .1, R * 1.2, [[0, '#fffdf0'], [.7, '#e6eefa'], [1, '#b9c8e0']]); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip();
  const r = rng(5); ctx.fillStyle = 'rgba(120,140,180,.22)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(x + (r() - .5) * R * 1.4, y + (r() - .5) * R * 1.4, R * (.07 + r() * .16), R * (.05 + r() * .12), r() * 3, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(20,40,80,.16)'; ctx.beginPath(); ctx.arc(x + R * .5, y + R * .15, R * 1.05, 0, TAU); ctx.fill();
  ctx.restore(); ctx.restore();
}
function drawNightSky(ctx, t, o = {}) {
  const y1 = o.y1 == null ? H : o.y1;
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, 0, 0, y1, [[0, o.top || '#030918'], [.5, o.mid || '#0a2236'], [1, o.bot || '#216074']]); ctx.fillRect(-400, -400, W + 800, y1 + 400);
  if (o.neb !== 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha *= o.neb == null ? .13 : o.neb; drawNebula(ctx, -100, -100, W + 200, y1 + 100, { z: 1.5, ox: 200 + Math.sin(t * .1) * 20 }); ctx.restore(); }
  if (o.stars !== 0) {
    if (!_wqStars) wqMakeStars();
    ctx.save(); ctx.globalAlpha *= o.stars == null ? 1 : o.stars; ctx.drawImage(_wqStars, 0, 0, W, Math.max(1, y1)); ctx.restore();
    drawStars(ctx, t, 41, 24, 0, 0, W, y1 * .6, .85 * (o.stars == null ? 1 : o.stars));
  }
  // brilho da cidade no horizonte (muito âmbar-frio)
  ctx.fillStyle = lg(ctx, 0, y1 * .45, 0, y1, [[0, 'rgba(60,150,170,0)'], [1, 'rgba(70,170,180,.42)']]); ctx.fillRect(-400, y1 * .45, W + 800, y1 * .55);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, W * .35, y1, 0, 560, [[0, 'rgba(255,170,80,.16)'], [1, 'rgba(255,170,80,0)']]); ctx.fillRect(-400, y1 - 600, W + 800, 640); ctx.restore();
  if (o.moon) wqMoon(ctx, o.moonX == null ? 1000 : o.moonX, o.moonY == null ? 120 : o.moonY, o.moonR || 44);
  if (o.clouds !== false) for (let i = 0; i < 4; i++) { const x = _wqMod(i * 520 + t * (4 + i * 2) + 100, W + 900) - 450; wqDrawCloud(ctx, x, y1 * (.18 + i * .1), 1.3 - i * .12, .5 - i * .06, '30,62,90', '4,14,28', .7); }
  ctx.restore();
}
function drawDawnSky(ctx, t, o = {}) {
  const y1 = o.y1 == null ? H : o.y1, p = o.p == null ? .5 : o.p, sx = o.sunX == null ? W * .64 : o.sunX, sy = o.sunY == null ? y1 - 30 - p * 90 : o.sunY;
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, 0, 0, y1, [[0, '#25316a'], [.32, '#5f5a9a'], [.58, '#d9809a'], [.8, '#ffb989'], [1, '#ffe2a2']]); ctx.fillRect(-400, -400, W + 800, y1 + 400);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha *= .35; drawNebula(ctx, -100, -100, W + 200, y1 + 100, { z: 1.6, ox: 300, hue: 40 }); ctx.restore();
  if (_wqStars) { ctx.save(); ctx.globalAlpha *= clamp(.7 - p * .7); ctx.drawImage(_wqStars, 0, 0, W, y1 * .6, 0, 0, W, y1 * .6); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, sx, sy, 0, 760, [[0, 'rgba(255,214,140,.7)'], [.25, 'rgba(255,170,120,.3)'], [1, 'rgba(255,150,120,0)']]); ctx.fillRect(-400, sy - 780, W + 800, 860);
  ctx.restore();
  rays(ctx, sx, sy, t, { n: 12, a: .1, len: 1300, sp: .03, col: '255,226,160' });
  ctx.fillStyle = rg(ctx, sx, sy, 0, 60, [[0, '#fffbe8'], [.55, '#ffe9a8'], [1, 'rgba(255,220,140,0)']]); ctx.beginPath(); ctx.arc(sx, sy, 60, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff8dc'; ctx.beginPath(); ctx.arc(sx, sy, 30, 0, TAU); ctx.fill();
  if (o.clouds !== false) {
    for (let i = 0; i < 5; i++) { const x = _wqMod(i * 430 + t * (3 + i) + 60, W + 900) - 450; wqDrawCloud(ctx, x, y1 * (.28 + (i % 3) * .1), 1.5 - i * .1, .85, '255,166,150', '126,70,128', .45); }
    for (let i = 0; i < 3; i++) { const x = _wqMod(i * 700 + t * 6 + 300, W + 900) - 450; wqDrawCloud(ctx, x, y1 * (.12 + i * .08), 1.8, .5, '255,226,176', '255,150,140', .35); }
  }
  ctx.restore();
}
function drawDaySky(ctx, t, o = {}) {
  const y1 = o.y1 == null ? H : o.y1;
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, 0, 0, y1, [[0, '#6f8398'], [.5, '#a2b2c0'], [1, '#dfe4e8']]); ctx.fillRect(-400, -400, W + 800, y1 + 400);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha *= .22; drawNebula(ctx, -100, -100, W + 200, y1 + 100, { z: 1.6, ox: 100, hue: 150 }); ctx.restore();
  if (o.sun !== false) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, W * .78, y1 * .18, 0, 280, [[0, 'rgba(255,255,244,.5)'], [1, 'rgba(255,255,244,0)']]); ctx.fillRect(W * .78 - 300, y1 * .18 - 300, 600, 600); ctx.restore(); }
  if (o.clouds !== false) for (let i = 0; i < 6; i++) { const x = _wqMod(i * 380 + t * (2 + i * .8) + 40, W + 900) - 450; wqDrawCloud(ctx, x, y1 * (.14 + (i % 4) * .13), 1.7 - i * .08, .62, '226,232,238', '128,140,156', .55); }
  ctx.fillStyle = lg(ctx, 0, y1 * .7, 0, y1, [[0, 'rgba(236,240,244,0)'], [1, 'rgba(236,240,244,.65)']]); ctx.fillRect(-400, y1 * .7, W + 800, y1 * .3);
  ctx.restore();
}
function drawKawaiiSky(ctx, t, o = {}) {
  const y1 = o.y1 == null ? H : o.y1;
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, 0, 0, y1, [[0, '#5f46bd'], [.34, '#a97ce0'], [.7, '#ff9bd0'], [1, '#ffd9c8']]); ctx.fillRect(-400, -400, W + 800, y1 + 400);
  if (o.neb !== 0) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha *= o.neb == null ? .6 : o.neb; drawNebula(ctx, -100, -100, W + 200, y1 + 100, { z: 1.3, ox: Math.sin(t * .3) * 60 }); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rg(ctx, W * .55, y1 * .3, 0, 520, [[0, 'rgba(255,255,255,.38)'], [.4, 'rgba(255,225,245,.14)'], [1, 'rgba(255,225,245,0)']]); ctx.fillRect(-400, -400, W + 800, y1 + 400); ctx.restore();
  if (o.stars !== 0) {
    const r = rng(77); ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 46; i++) { const x = r() * W, y = r() * y1 * .75, s = 2 + r() * 6, tw = .5 + .5 * Math.sin(t * (1.5 + r() * 2) + r() * 6); sparkle(ctx, x, y, s * (.5 + tw * .7), t * .3 * (r() - .5), `rgba(255,${240 + r() * 15 | 0},${230 + r() * 25 | 0},${.45 + .5 * tw})`); }
    ctx.restore();
  }
  if (o.rainbow !== false && typeof rainbow === 'function') rainbow(ctx, W * .5, y1 * 1.05, 700, 130, .13);
  if (o.clouds !== false) for (let i = 0; i < 5; i++) { const x = _wqMod(i * 420 + t * (4 + i) + 100, W + 900) - 450; wqDrawCloud(ctx, x, y1 * (.45 + (i % 3) * .12), 1.1 + (i % 2) * .3, .78, '255,222,244', '190,150,230', .5); }
  ctx.restore();
}
function drawSkyMood(ctx, mood, t, o = {}) {
  const m = clamp(mood, 0, 3), lo = _wqLo(m), f = _wqF(m), fns = [drawNightSky, drawDawnSky, drawDaySky, drawKawaiiSky];
  fns[lo](ctx, t, lo === 0 ? Object.assign({ moon: true }, o) : o);
  if (f > .004) { ctx.save(); ctx.globalAlpha *= f; fns[lo + 1](ctx, t, o); ctx.restore(); }
}

/* ---------------------------------------------------------------
   4. QUEBRADA — geração procedural por chunks + cache offscreen
   --------------------------------------------------------------- */
const WQ_CH = 1024, WQ_PAD = 20;
const WQL = [
  { par: .1, dy: -190, fMin: 4, fMax: 10, wMin: 46, wMax: 84, rh: 24, colW: 34, sc: .7, blur: 2.6, fog: .82, hmax: 0 },
  { par: .24, dy: -120, fMin: 3, fMax: 10, wMin: 66, wMax: 116, rh: 32, colW: 40, sc: .9, blur: 1.4, fog: .6, hmax: 0 },
  { par: .5, dy: -55, fMin: 3, fMax: 9, wMin: 88, wMax: 150, rh: 42, colW: 48, sc: 1.1, blur: .6, fog: .32, hmax: 0 },
  { par: 1, dy: 0, fMin: 3, fMax: 8, wMin: 120, wMax: 190, rh: 54, colW: 58, sc: 1.35, blur: 0, fog: 0, hmax: 0 },
];
WQL.forEach(L => { L.hmax = L.fMax * L.rh + 120; L.ext = 220; });
const _wqBlkMemo = new Map(), _wqPoleMemo = new Map();
function wqBlocks(li, ci) {
  const key = li * 1000003 + ci; let out = _wqBlkMemo.get(key); if (out) return out;
  const L = WQL[li], r = rng(li * 7919 + (ci + 4000) * 104729 + 17), end = (ci + 1) * WQ_CH; let x = ci * WQ_CH, bi = 0; out = [];
  while (x < end - 6) {
    let w = Math.round(L.wMin + r() * (L.wMax - L.wMin)); if (end - (x + w) < L.wMin * .6) w = end - x;
    const env = noise2((x + w / 2) / 650, li * 3.1, 5);
    const nf = clamp(Math.round(L.fMin + Math.pow(env, 1.4) * 1.25 * (L.fMax - L.fMin) + (r() - .5) * 2.4), L.fMin, L.fMax);
    const cols = Math.max(2, Math.round(w / L.colW)), floors = [];
    for (let f = 0; f < nf; f++) {
      const q = r(); floors.push({ kind: q < .34 ? 1 : q < .7 ? 0 : 2, k: Math.floor(r() * 6), inL: f && r() < .4 ? 4 + Math.floor(r() * 14) : 0, inR: f && r() < .4 ? 4 + Math.floor(r() * 14) : 0, stain: r() });
    }
    const q = r(), top = q < .4 ? 0 : q < .62 ? 1 : q < .82 ? 2 : 3;
    const feat = [], slots = [.14, .36, .6, .84].sort(() => r() - .5);
    const want = top === 2 ? (r() < .5 ? ['ant'] : ['dish']) : ['tank', 'ant', 'dish', 'line', 'rebar', 'plant', 'tank'].filter(() => r() < .42);
    want.forEach((k, i) => { if (slots[i] != null) feat.push({ k, u: slots[i] }); });
    let gap = r() < .55 ? 0 : 3, alley = 0;
    if (li >= 1 && r() < .26 && x + w + 56 < end - L.wMin) { alley = Math.round(46 + r() * 30); gap = alley; }
    out.push({ x, w, h: nf * L.rh, nf, cols, rh: L.rh, floors, top, feat, door: Math.floor(r() * cols), door2: r() < .4 ? Math.floor(r() * cols) : -1, seed: Math.floor(r() * 9999), graf: r(), deco: Math.floor(r() * 6), lights: r() < .7, alley, ci, li, bi: bi++, moodDeco: r() });
    x += w + gap;
  }
  _wqBlkMemo.set(key, out); return out;
}
function wqPoles(li, ci) {
  const key = li * 1000003 + ci; let out = _wqPoleMemo.get(key); if (out) return out;
  const L = WQL[li], r = rng(li * 331 + (ci + 4000) * 977 + 5), bl = wqBlocks(li, ci); out = [];
  const n = 1 + (r() < .55 ? 1 : 0);
  for (let k = 0; k < n; k++) {
    const px = ci * WQ_CH + WQ_CH * (n === 1 ? .2 + r() * .6 : (k + .25 + r() * .5) / n), drops = [];
    for (let d = 0; d < 4; d++) { const tb = bl[Math.floor(r() * bl.length)]; drops.push([tb.x + tb.w * (.1 + r() * .8), -tb.h - 6, 8 + r() * 24, (r() - .5) * 40]); }
    out.push({ x: px, ph: (L.rh * (li === 3 ? 7.4 : li === 2 ? 6.4 : 5.6)) * (.9 + r() * .25), drops, tf: r() < .5, seed: Math.floor(r() * 999) });
  }
  _wqPoleMemo.set(key, out); return out;
}
function quebradaBlock(li, wx) { const ci = Math.floor(wx / WQ_CH); for (const b of wqBlocks(li, ci)) if (wx >= b.x && wx < b.x + b.w + (b.alley || 0)) return b; return wqBlocks(li, ci)[0]; }
function quebradaWindow(li, wx, floor, col) {
  const b = quebradaBlock(li, wx), cw = b.w / b.cols;
  return { x: b.x + col * cw + cw * .27, y: -(floor + 1) * b.rh + b.rh * .3, w: cw * .46, h: b.rh * .46, b };
}
function quebradaToScreen(li, wx, wy, camX, y0, o = {}) { const L = WQL[li]; return [W / 2 - camX * L.par + wx, y0 + L.dy + (o.layerY ? o.layerY[li] || 0 : 0) - wy]; }

/* ---- pequenos elementos de telhado (cache) ---- */
function wqTank(g, x, y, s, P, det) {
  g.fillStyle = P.slab; g.fillRect(x - 21 * s, y - 8 * s, 42 * s, 8 * s);
  g.fillStyle = P.shade; g.globalAlpha = .3; g.fillRect(x - 21 * s, y - 8 * s, 42 * s, 3 * s); g.globalAlpha = 1;
  const ty = y - 8 * s - 36 * s;
  g.fillStyle = lg(g, x - 20 * s, 0, x + 20 * s, 0, [[0, mix(P.tank, '#ffffff', .18)], [.5, P.tank], [1, mix(P.tank, P.shade, .5)]]); rrect(g, x - 20 * s, ty, 40 * s, 36 * s, 5 * s); g.fill();
  if (det) { g.strokeStyle = mix(P.tank, P.shade, .45); g.lineWidth = Math.max(.8, 1.4 * s); g.beginPath(); g.moveTo(x - 20 * s, ty + 12 * s); g.lineTo(x + 20 * s, ty + 12 * s); g.moveTo(x - 20 * s, ty + 24 * s); g.lineTo(x + 20 * s, ty + 24 * s); g.stroke(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x - 15 * s, ty + 4 * s, 3.5 * s, 24 * s); }
  g.fillStyle = P.tankLid; rrect(g, x - 17 * s, ty - 5 * s, 34 * s, 7 * s, 3 * s); g.fill();
  g.fillStyle = mix(P.tankLid, P.shade, .15); g.fillRect(x - 3 * s, ty - 9 * s, 6 * s, 5 * s);
  g.strokeStyle = P.metal; g.lineWidth = Math.max(1, 2 * s); g.beginPath(); g.moveTo(x - 12 * s, y - 8 * s); g.lineTo(x - 12 * s, y - 13 * s); g.moveTo(x + 14 * s, y - 8 * s); g.lineTo(x + 14 * s, y - 13 * s); g.stroke();
}
function wqAntenna(g, x, y, s, P) {
  g.strokeStyle = P.metal; g.lineWidth = Math.max(.8, 1.7 * s); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 44 * s);
  for (const [dy, hw] of [[44, 13], [36, 17], [28, 13], [21, 9]]) { g.moveTo(x - hw * s, y - dy * s); g.lineTo(x + hw * s, y - dy * s); }
  g.moveTo(x - 7 * s, y - 44 * s); g.lineTo(x - 7 * s, y - 21 * s); g.stroke();
}
function wqDish(g, x, y, s, P) {
  g.strokeStyle = P.metal; g.lineWidth = Math.max(1, 2 * s); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 20 * s); g.stroke();
  g.save(); g.translate(x, y - 24 * s); g.rotate(-.55);
  g.fillStyle = lg(g, -16 * s, -10 * s, 16 * s, 10 * s, [[0, '#ffffff'], [1, mix('#c9d0d8', P.shade, .3)]]); g.beginPath(); g.ellipse(0, 0, 16 * s, 11 * s, 0, 0, TAU); g.fill();
  g.fillStyle = P.shade; g.globalAlpha = .25; g.beginPath(); g.ellipse(3 * s, 1 * s, 12 * s, 8 * s, 0, 0, TAU); g.fill(); g.globalAlpha = 1;
  g.strokeStyle = P.metal; g.beginPath(); g.moveTo(0, 0); g.lineTo(12 * s, -9 * s); g.stroke(); g.fillStyle = P.metal; g.fillRect(10 * s, -12 * s, 5 * s, 4 * s);
  g.restore();
}
function wqRebar(g, x, y, s, P, seed) {
  g.strokeStyle = '#7a4a34'; g.lineWidth = Math.max(.8, 1.9 * s); g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i < 4; i++) { const hh = (14 + hash2(i, seed, 3) * 18) * s, bx = x + i * 4.5 * s, bend = (hash2(i, seed, 4) - .5) * 9 * s; g.moveTo(bx, y); g.lineTo(bx, y - hh); g.lineTo(bx + bend, y - hh - 4 * s); }
  g.stroke(); g.fillStyle = P.slab; g.fillRect(x - 3 * s, y - 4 * s, 22 * s, 4 * s);
}
function wqPlant(g, x, y, s, P, seed) {
  g.fillStyle = hash2(seed, 1) < .5 ? '#c9633a' : P.tank; g.beginPath(); g.moveTo(x - 5 * s, y - 8 * s); g.lineTo(x + 5 * s, y - 8 * s); g.lineTo(x + 3.5 * s, y); g.lineTo(x - 3.5 * s, y); g.fill();
  g.fillStyle = P.plant || '#4a8a5a'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .5; g.beginPath(); g.ellipse(x + Math.cos(a) * 6 * s, y - 8 * s + Math.sin(a) * 9 * s, 2.4 * s, 6 * s, a + Math.PI / 2, 0, TAU); g.fill(); }
}
function wqClothes(g, x0, x1, y, s, P, seed, line = true) {
  g.strokeStyle = P.metal; g.lineWidth = Math.max(.8, 1.6 * s); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0, y - 28 * s); g.moveTo(x1, y); g.lineTo(x1, y - 28 * s); g.stroke();
  const ly = y - 28 * s, sag = 6 * s, n = Math.max(3, Math.round((x1 - x0) / (13 * s)));
  g.lineWidth = Math.max(.6, 1 * s); g.beginPath(); g.moveTo(x0, ly); g.quadraticCurveTo((x0 + x1) / 2, ly + sag * 2, x1, ly); g.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + .6) / (n + .2), px = lerp(x0, x1, u), py = ly + sag * 2 * u * (1 - u) + 1, w = (5 + hash2(i, seed, 8) * 7) * s, h = (9 + hash2(i, seed, 9) * 15) * s;
    const col = P.cloth[(i + seed) % 4]; g.fillStyle = col; g.beginPath(); g.moveTo(px - w / 2, py); g.lineTo(px + w / 2, py); g.lineTo(px + w / 2 + 1.5 * s, py + h); g.lineTo(px - w / 2 + 1.5 * s, py + h); g.fill();
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(px + w * .1, py, w * .4, h);
  }
}
function wqHeart(g, x, y, s, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.7, y - s * .2, x - s * .7, y - s * 1.3, x, y - s * .4); g.bezierCurveTo(x + s * .7, y - s * 1.3, x + s * 1.7, y - s * .2, x, y + s * .9); g.fill(); }
function wqStar5(g, x, y, R, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .45 : R; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); }

/* ---- um bloco (pilha de casinhas), origem no chão do bloco (x absoluto do mundo, y negativo = acima) ---- */
function wqBlock(g, b, li, P, mi, lit) {
  const { x, w, rh } = b, det = li >= 3 ? 3 : li === 2 ? 2 : li === 1 ? 1 : 0, s = [.5, .62, .8, 1][li], cw = w / b.cols, k3 = mi === 3;
  for (let f = 0; f < b.nf; f++) {
    const fl = b.floors[f], x0 = x + fl.inL, x1 = x + w - fl.inR, ww = x1 - x0, top = -(f + 1) * rh;
    let kind = fl.kind; const isBrick = kind === 1 && (P.brickKeep >= 1 || hash2(f, b.seed, 5) < P.brickKeep);
    const wc = isBrick ? P.brick[fl.k % 3] : P.walls[(fl.k + (kind === 2 ? 2 : 0)) % 6];
    g.fillStyle = lg(g, x0, 0, x1, 0, [[0, mix(wc, P.rim, .07)], [.5, wc], [1, mix(wc, P.shade, .4)]]); g.fillRect(x0, top, ww, rh + 1);
    // base mais escuro (rua) e topo mais claro (luz do céu)
    g.fillStyle = lg(g, 0, top, 0, top + rh, [[0, rgba(P.rim, .06)], [.18, rgba(P.shade, 0)], [1, rgba(P.shade, .14 + .18 * (1 - f / b.nf))]]); g.fillRect(x0, top, ww, rh + 1);
    if (det >= 1) {
      if (isBrick) {
        g.strokeStyle = mix(wc, P.shade, .5); g.globalAlpha = det >= 3 ? .55 : .4; g.lineWidth = det >= 3 ? 1 : .8; g.beginPath();
        const bh = det >= 3 ? 7 : 8;
        for (let yy = top + bh, rr = 0; yy < top + rh; yy += bh, rr++) { g.moveTo(x0, yy); g.lineTo(x1, yy); for (let xx = x0 + (rr % 2 ? 8 : 0); xx < x1; xx += 16) { g.moveTo(xx, yy); g.lineTo(xx, yy - bh); } }
        g.stroke(); g.globalAlpha = 1;
        if (det >= 3) { g.fillStyle = mix(wc, P.rim, .3); g.globalAlpha = .18; for (let i = 0; i < 8; i++) g.fillRect(x0 + hash2(i, f, b.seed) * ww, top + hash2(i, f, b.seed + 1) * rh, 14, 6); g.globalAlpha = 1; }
      } else if (kind === 2 && det >= 2) { // concreto cru de fôrma
        g.strokeStyle = mix(wc, P.shade, .35); g.globalAlpha = .35; g.lineWidth = 1; g.beginPath(); for (let yy = top + 9; yy < top + rh; yy += 11) { g.moveTo(x0, yy); g.lineTo(x1, yy); } g.stroke(); g.fillStyle = P.shade; for (let xx = x0 + 10; xx < x1; xx += 28) g.fillRect(xx, top + 5, 2, 2); g.globalAlpha = 1;
      } else if (det >= 2) { // reboco: manchas, pinceladas
        g.fillStyle = mix(wc, P.shade, .2); g.globalAlpha = .4;
        for (let i = 0; i < 3; i++) { const sx = x0 + ww * hash2(i, f, b.seed + 3), sw = 10 + hash2(i, f, b.seed + 4) * 36; g.fillRect(sx, top + 4 + hash2(i, f, b.seed + 5) * rh * .5, sw, 8 + hash2(i, f, b.seed + 6) * 20); }
        g.fillStyle = mix(wc, P.rim, .25); g.globalAlpha = .22; for (let i = 0; i < 2; i++) g.fillRect(x0 + ww * hash2(i, f, b.seed + 9), top + 3, 18 + hash2(i, f, b.seed + 8) * 30, 5);
        g.globalAlpha = 1;
        if (det >= 3 && fl.stain > .7 && !k3) { const px = x0 + ww * .55, py = top + rh * .5; g.fillStyle = P.brick[0]; g.beginPath(); g.moveTo(px, py + 4); g.lineTo(px + 14, py); g.lineTo(px + 34, py + 6); g.lineTo(px + 30, py + rh * .42); g.lineTo(px + 4, py + rh * .4); g.fill(); g.strokeStyle = mix(P.brick[0], P.shade, .5); g.lineWidth = .8; g.beginPath(); for (let yy = py + 10; yy < py + rh * .4; yy += 6) { g.moveTo(px + 4, yy); g.lineTo(px + 32, yy); } g.stroke(); }
      }
      if (det >= 2) { // escorrido de chuva sob a laje
        g.fillStyle = lg(g, 0, top, 0, top + rh, [[0, rgba(P.shade, .3)], [1, rgba(P.shade, 0)]]);
        for (let i = 0; i < 3; i++) g.fillRect(x0 + ww * (.1 + hash2(i, f, b.seed + 12) * .8), top, 2 + hash2(i, f, b.seed + 13) * 5, rh * (.5 + hash2(i, f, b.seed + 14) * .5));
      }
    }
    // pintura decorativa (kawaii)
    if (k3 && det >= 1 && !isBrick && f === 0 || (k3 && det >= 2 && !isBrick && hash2(f, b.seed, 21) < .22)) {
      const dc = b.deco, cx = x0 + ww * (.25 + hash2(f, b.seed, 22) * .5), cy = top + rh * .5;
      if (dc === 0) wqHeart(g, cx, cy, rh * .16 + 2, '#ff5fae'); else if (dc === 1) wqStar5(g, cx, cy, rh * .2 + 2, '#ffe08a');
      else if (dc === 2) { g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x0 + 6 + (i % 3) * 13 + (i > 2 ? 6 : 0), top + 8 + (i > 2 ? 9 : 0), 2.2, 0, TAU); g.fill(); } }
      else if (dc === 3) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x0, top + rh - 11, ww, 5); }
      else if (dc === 4) { g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.arc(cx, cy, rh * .12 + 2, 0, TAU); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(cx, cy, 2.4, 0, TAU); g.fill(); }
    }
    if (det >= 1 && !k3 && f === 0) { g.fillStyle = rgba(P.shade, .3); g.fillRect(x0, top + rh - 7, ww, 7); } // barrado sujo
    // janelas e portas
    for (let cc = 0; cc < b.cols; cc++) {
      const hs = hash2(cc, f, b.seed), cx0 = x + cc * cw, dw = cw * .42;
      if (f === 0 && (cc === b.door || cc === b.door2) && li >= 1) {
        const dh = rh * .8, dx = cx0 + (cw - dw) / 2, col = P.doors[(b.seed + cc) % 4];
        g.fillStyle = P.frame; g.fillRect(dx - 2, -dh - 2, dw + 4, dh + 2); g.fillStyle = col; g.fillRect(dx, -dh, dw, dh);
        if (det >= 2) { g.fillStyle = rgba(P.shade, .3); g.fillRect(dx + dw * .6, -dh, dw * .4, dh); g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1.2; g.beginPath(); for (let xx = dx + 4; xx < dx + dw; xx += 5) { g.moveTo(xx, -dh); g.lineTo(xx, 0); } g.stroke(); g.fillStyle = P.slab; g.fillRect(dx + dw - 7, -dh * .5, 3, 5); g.fillRect(dx - 3, 0, dw + 6, 3); }
        if (lit && hs < P.lit * 1.4 && det >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = lg(g, 0, -4, 0, 18, [[0, rgba(P.winLit, .28 * P.glowA * 3)], [1, rgba(P.winLit, 0)]]); g.fillRect(dx - 6, -4, dw + 12, 22); g.restore(); }
        continue;
      }
      const wx = cx0 + cw * .27, wy = top + rh * .3, wW = cw * .46, wH = rh * .46;
      if (hs > .68 || wx < x0 + 4 || wx + wW > x1 - 4) continue;
      const isLit = lit && hs < P.lit * .68 && P.lit > .05;
      if (det === 0) { if (isLit) { g.fillStyle = P.winLit; g.fillRect(wx, wy, Math.max(2, wW * .8), Math.max(2, wH * .8)); } continue; }
      if (isLit && det >= 1 && P.glowA > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = Math.max(wW, wH) * (det >= 3 ? 1.5 : 1.3); g.fillStyle = rg(g, wx + wW / 2, wy + wH / 2, 0, gr, [[0, `rgba(${P.glow},${P.glowA * (det >= 3 ? 1 : .8)})`], [1, `rgba(${P.glow},0)`]]); g.fillRect(wx - gr, wy - gr, wW + gr * 2, wH + gr * 2); g.restore(); }
      g.fillStyle = P.frame; g.fillRect(wx - (det >= 2 ? 2 : 1), wy - (det >= 2 ? 2 : 1), wW + (det >= 2 ? 4 : 2), wH + (det >= 2 ? 4 : 2));
      if (isLit) {
        g.fillStyle = lg(g, 0, wy, 0, wy + wH, [[0, P.winLit], [1, hs < P.lit * .2 && k3 ? P.winLit2 : mix(P.winLit, P.winLit2, .8)]]); g.fillRect(wx, wy, wW, wH);
        if (det >= 2 && hs < P.lit * .4) { g.fillStyle = rgba(hs < P.lit * .2 ? P.doors[(cc + f) % 4] : P.shade, .5); g.fillRect(wx, wy, wW * .32, wH); g.fillRect(wx + wW * .7, wy, wW * .3, wH); } // cortina
        if (det >= 3 && hs < P.lit * .12) { g.fillStyle = rgba(P.shade, .7); g.beginPath(); g.ellipse(wx + wW * .55, wy + wH * .75, wW * .16, wH * .22, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(wx + wW * .55, wy + wH * .42, wW * .1, 0, TAU); g.fill(); }
      } else {
        g.fillStyle = lg(g, wx, wy, wx + wW, wy + wH, [[0, mix(P.win, P.rim, .28)], [.5, P.win], [1, mix(P.win, P.shade, .5)]]); g.fillRect(wx, wy, wW, wH);
        if (det >= 3) { g.fillStyle = 'rgba(255,255,255,.12)'; poly(g, [[wx, wy], [wx + wW * .5, wy], [wx, wy + wH * .7]]); g.fill(); }
      }
      if (det >= 2) {
        if (hs < .3) { g.strokeStyle = P.metal; g.lineWidth = det >= 3 ? 1.5 : 1; g.beginPath(); for (let xx = wx + wW / 4; xx < wx + wW - 1; xx += wW / 4) { g.moveTo(xx, wy); g.lineTo(xx, wy + wH); } g.moveTo(wx, wy + wH / 2); g.lineTo(wx + wW, wy + wH / 2); g.stroke(); }
        else { g.strokeStyle = P.frame; g.lineWidth = 1; g.beginPath(); g.moveTo(wx + wW / 2, wy); g.lineTo(wx + wW / 2, wy + wH); g.stroke(); }
        g.fillStyle = P.slab; g.fillRect(wx - 3, wy + wH + 2, wW + 6, 3);
        if (det >= 3 && hs > .6 && f > 0) { g.fillStyle = mix(P.metal, P.walls[2], .4); g.fillRect(wx + wW * .1, wy + wH + 6, wW * .8, 7); g.fillStyle = P.shade; for (let i = 0; i < 4; i++) g.fillRect(wx + wW * .16 + i * wW * .2, wy + wH + 8, 1.4, 4); } // ar-condicionado
      }
    }
    // laje (lábio de concreto) no topo do andar
    g.fillStyle = P.slab; g.fillRect(x0 - 3, top - 4, ww + 6, 6);
    g.fillStyle = rgba(P.shade, .38); g.fillRect(x0, top + 2, ww, det >= 3 ? 8 : 4);
    g.fillStyle = rgba(P.rim, .55); g.fillRect(x0 - 3, top - 4, ww + 6, det >= 3 ? 1.5 : 1);
  }
  // topo
  const roofY = -b.nf * rh - 4, S = s;
  let featY = roofY + 2;
  if (b.top === 0) { // laje com mureta e vergalhão
    g.fillStyle = mix(P.walls[(b.seed) % 6], P.shade, .15); g.fillRect(x + 2, roofY - 10 * S, w - 4, 10 * S);
    g.fillStyle = P.slab; g.fillRect(x, roofY - 12 * S, w, 3 * S); g.fillStyle = rgba(P.rim, .55); g.fillRect(x, roofY - 12 * S, w, 1);
    featY = roofY - 12 * S;
    if (det >= 2) { g.fillStyle = P.slab; for (const px of [x + 4, x + w - 12]) g.fillRect(px, roofY - 26 * S, 8, 16 * S); }
  } else if (b.top === 1) { // obra inacabada: pilares, viga, tijolo parcial
    const px = [x + 6, x + w * .38, x + w * .7, x + w - 16], ph = rh * .82;
    for (const xx of px) { g.fillStyle = mix(P.slab, P.shade, .25); g.fillRect(xx, roofY - ph, 9 * S, ph); }
    g.fillStyle = P.slab; g.fillRect(x + 2, roofY - ph - 6 * S, w - 4, 6 * S); g.fillStyle = rgba(P.rim, .5); g.fillRect(x + 2, roofY - ph - 6 * S, w - 4, 1);
    g.fillStyle = P.brick[b.seed % 3]; g.fillRect(x + w * .38 + 9 * S, roofY - ph * .6, w * .32 - 9 * S, ph * .6);
    if (det >= 2) { g.strokeStyle = mix(P.brick[0], P.shade, .5); g.lineWidth = .8; g.beginPath(); for (let yy = roofY - ph * .6 + 6; yy < roofY; yy += 6) { g.moveTo(x + w * .38 + 9, yy); g.lineTo(x + w * .7, yy); } g.stroke(); }
    if (det >= 2) { g.strokeStyle = '#7a4a34'; g.lineWidth = 1.8; g.beginPath(); for (const xx of px) { g.moveTo(xx + 4, roofY - ph - 6 * S); g.lineTo(xx + 4, roofY - ph - 22 * S - hash2(xx | 0, b.seed) * 10); } g.stroke(); }
    featY = roofY - ph - 6 * S;
  } else if (b.top === 2) { // telhado
    const col = b.seed % 2 ? P.telha : P.fibra, hh = 26 * S + 6;
    g.fillStyle = col; poly(g, [[x - 4, roofY + 2], [x + w + 4, roofY + 2], [x + w + 4, roofY - hh * .35], [x - 4, roofY - hh]]); g.fill();
    g.fillStyle = rgba(P.shade, .3); poly(g, [[x - 4, roofY + 2], [x + w + 4, roofY + 2], [x + w + 4, roofY - hh * .35], [x + w * .4, roofY - hh * .7]]); g.fill();
    g.strokeStyle = rgba(P.rim, .5); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 4, roofY - hh); g.lineTo(x + w + 4, roofY - hh * .35); g.stroke();
    if (det >= 2) { g.strokeStyle = rgba(P.shade, .3); g.lineWidth = 1; g.beginPath(); for (let xx = x + 8; xx < x + w; xx += 11) { g.moveTo(xx, roofY + 2); g.lineTo(xx, roofY - hh + (xx - x) / w * hh * .65); } g.stroke(); }
    featY = roofY - 20 * S;
  } else { // casinha de cima (puxadinho da laje)
    const bw = w * .52, bx = x + w * (.1 + (b.seed % 3) * .12), bh = rh * .85, wc = P.walls[(b.seed + 3) % 6];
    g.fillStyle = lg(g, bx, 0, bx + bw, 0, [[0, mix(wc, P.rim, .06)], [1, mix(wc, P.shade, .4)]]); g.fillRect(bx, roofY - bh, bw, bh);
    g.fillStyle = P.slab; g.fillRect(bx - 3, roofY - bh - 5, bw + 6, 5); g.fillStyle = rgba(P.rim, .5); g.fillRect(bx - 3, roofY - bh - 5, bw + 6, 1);
    g.fillStyle = P.doors[b.seed % 4]; g.fillRect(bx + bw * .15, roofY - bh * .78, bw * .26, bh * .78);
    if (b.lights) { g.fillStyle = P.winLit; g.fillRect(bx + bw * .58, roofY - bh * .7, bw * .24, bh * .3); }
    g.fillStyle = mix(wc, P.shade, .15); g.fillRect(x + 3, roofY - 8 * S, w - 6, 8 * S); g.fillStyle = P.slab; g.fillRect(x, roofY - 10 * S, w, 3 * S);
    featY = roofY - bh - 5; // antena em cima da casinha
  }
  if (li >= 1) for (const ft of b.feat) {
    const fx = x + ft.u * w, fy = b.top === 3 ? (ft.u > .45 ? roofY - 10 * S : featY) : featY;
    if (b.top === 2 && ft.k !== 'ant' && ft.k !== 'dish') continue;
    if (ft.k === 'tank') wqTank(g, fx, fy, S, P, det >= 2); else if (ft.k === 'ant') wqAntenna(g, fx, fy, S, P); else if (ft.k === 'dish') wqDish(g, fx, fy, S, P);
    else if (ft.k === 'rebar' && b.top !== 1 && det >= 2) wqRebar(g, fx - 10 * S, fy, S, P, b.seed + (ft.u * 10 | 0));
    else if (ft.k === 'plant' && det >= 3 && b.top !== 2) wqPlant(g, fx, fy, S, P, b.seed);
    else if (ft.k === 'line' && b.top === 0 && det >= 2) wqClothes(g, x + w * .12, x + w * .88, fy, S, P, b.seed);
  }
  if (det >= 3 && b.graf < .4 && !k3) { // grafite discreto
    g.save(); g.translate(x + w * (.3 + b.graf), -rh * 1.55); g.globalAlpha = .28; g.strokeStyle = P.rim; g.fillStyle = P.rim; g.lineWidth = 3; g.lineCap = 'round';
    if (b.seed % 3 === 0) wqHeart(g, 0, 0, 9, P.rim); else if (b.seed % 3 === 1) wqStar5(g, 0, 0, 12, P.rim); else { g.beginPath(); g.moveTo(-14, 6); g.quadraticCurveTo(-8, -14, 0, 0); g.quadraticCurveTo(8, 14, 14, -6); g.stroke(); }
    g.restore();
  }
  g.fillStyle = rgba(P.shade, .25); g.fillRect(x, -b.h, 1.5, b.h); // aresta
}
/* beco com escada entre duas casas */
function wqAlley(g, b, li, P, mi, lit) {
  const gx = b.x + b.w, gw = b.alley, sh = Math.min(b.h, WQL[li].rh * 6), det = li >= 3 ? 3 : li === 2 ? 2 : 1;
  g.fillStyle = lg(g, 0, -sh, 0, 0, [[0, mix(P.shade, P.walls[1], .2)], [1, mix(P.shade, P.walls[2], .35)]]); g.fillRect(gx, -sh, gw, sh);
  // parede do fundo com portinhas acesas
  if (det >= 2) { for (let k = 0; k < 3; k++) { const wy = -sh * (.2 + k * .26), on = lit && hash2(k, b.seed, 31) < .6; g.fillStyle = on ? P.winLit : P.win; g.globalAlpha = on ? .9 : .6; g.fillRect(gx + gw * (.2 + hash2(k, b.seed, 32) * .5), wy, gw * .18, sh * .1); g.globalAlpha = 1; } }
  const flights = 3, rise = sh * .23, sc = mix(P.slab, P.shade, .2); g.lineJoin = 'round';
  for (let fi = 0; fi < flights; fi++) {
    const dir = fi % 2 ? -1 : 1, x0 = dir > 0 ? gx + 2 : gx + gw - 2, x1 = dir > 0 ? gx + gw - 2 : gx + 2, y1 = -(fi + 1) * rise, y0 = -fi * rise, n = det >= 3 ? 6 : 4;
    g.fillStyle = sc; poly(g, [[x0, y0], [x1, y1], [x1, y1 + 7], [x0, y0 + 7]]); g.fill();
    g.strokeStyle = rgba(P.shade, .5); g.lineWidth = 1; g.beginPath(); for (let k = 1; k < n; k++) { const u = k / n; g.moveTo(lerp(x0, x1, u), lerp(y0, y1, u)); g.lineTo(lerp(x0, x1, u), lerp(y0, y1, u) + 7); } g.stroke();
    g.strokeStyle = P.metal; g.lineWidth = det >= 3 ? 2 : 1.4; g.beginPath(); g.moveTo(x0, y0 - 22); g.lineTo(x1, y1 - 22); g.moveTo(x1, y1); g.lineTo(x1, y1 - 22); g.stroke();
  }
  if (P.night > .5 && det >= 2 && lit) { const lx = gx + gw / 2, ly = -sh * .72; g.strokeStyle = P.wire; g.lineWidth = 1; g.beginPath(); g.moveTo(lx, -sh); g.lineTo(lx, ly); g.stroke(); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, lx, ly, 0, 54, [[0, `rgba(${P.glow},.55)`], [1, `rgba(${P.glow},0)`]]); g.fillRect(lx - 54, ly - 54, 108, 108); g.restore(); g.fillStyle = '#fff2c0'; g.beginPath(); g.arc(lx, ly, 3.2, 0, TAU); g.fill(); }
}
/* chunk completo -> canvas offscreen (cache LRU) */
const _wqCache = new Map();
function wqChunk(li, ci, mi, lv) {
  const key = li + '_' + ci + '_' + mi + '_' + lv, hit = _wqCache.get(key); if (hit) { _wqCache.delete(key); _wqCache.set(key, hit); return hit; }
  const L = WQL[li], P = WQ[mi], sc = L.sc, cw = WQ_CH + WQ_PAD * 2, chh = L.hmax + L.ext, cv = _wqCv(cw * sc, chh * sc), g = cv.getContext('2d');
  g.setTransform(sc, 0, 0, sc, (WQ_PAD - ci * WQ_CH) * sc, L.hmax * sc);
  const xa = ci * WQ_CH - WQ_PAD, xb = (ci + 1) * WQ_CH + WQ_PAD, lit = lv > 0;
  // massa do morro (abaixo da linha e atrás)
  g.fillStyle = lg(g, 0, -L.hmax * .5, 0, L.ext, [[0, mix(P.walls[1], P.shade, .3)], [.45, mix(P.walls[1], P.shade, .5)], [1, P.shade]]); g.fillRect(xa, -L.fMin * L.rh * .8, xb - xa, L.fMin * L.rh * .8 + L.ext);
  const list = [].concat(wqBlocks(li, ci - 1), wqBlocks(li, ci), wqBlocks(li, ci + 1));
  for (const b of list) { const ex = b.x + b.w + (b.alley || 0); if (ex < xa - 6 || b.x > xb + 6) continue; if (b.alley) wqAlley(g, b, li, P, mi, lit); wqBlock(g, b, li, P, mi, lit); }
  // névoa/atmosfera baked só onde há pixels
  if (L.fog > 0) {
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = lg(g, 0, -L.hmax, 0, L.ext * .3, [[0, rgba(P.fog, L.fog * .35)], [.7, rgba(P.fog, L.fog * .75)], [1, rgba(P.fog, L.fog)]]); g.fillRect(xa, -L.hmax, xb - xa, L.hmax + L.ext);
    g.globalCompositeOperation = 'source-over';
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (L.blur > 0) { const tmp = _wqCv(cv.width, cv.height), tg = tmp.getContext('2d'); tg.drawImage(cv, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.filter = `blur(${L.blur * sc}px)`; g.drawImage(tmp, 0, 0); g.filter = 'none'; }
  const e = { cv }; _wqCache.set(key, e); if (_wqCache.size > 56) _wqCache.delete(_wqCache.keys().next().value);
  return e;
}
/* ---- pipas decorativas no céu ---- */
const WQ_KITES = [[-700, 440, 15, 0], [-120, 520, 19, 1], [330, 400, 14, 2], [760, 480, 17, 3], [1180, 380, 13, 4], [1550, 520, 18, 5]];
const WQ_KITE_COL = [['#ff5f8f', '#ffd23f', '#2fc9c0'], ['#2fc9c0', '#ffffff', '#ff8a3d'], ['#ffd23f', '#9b6bff', '#ff4f8b'], ['#ff8a3d', '#2fc9c0', '#ffd23f'], ['#9b6bff', '#ff5f8f', '#ffffff'], ['#4aa8ff', '#ffd23f', '#ff4f8b']];
function wqKites(ctx, camX, y0, m, t, night) {
  const a = clamp(1 - night * .6 + (m > 2.5 ? .5 : 0), .35, 1);
  for (const k of WQ_KITES) {
    const x = W / 2 + k[0] - camX * .06 + Math.sin(t * .7 + k[3]) * 10, y = y0 - k[1] + Math.sin(t * 1 + k[3] * 2) * 7; if (x < -80 || x > W + 80) continue;
    const c = WQ_KITE_COL[k[3]], fogc = wqC('fog', m);
    ctx.save(); ctx.globalAlpha *= a * .85;
    drawPipa(ctx, x, y, k[2], Math.sin(t * .9 + k[3]) * .22, t, { c1: mix(c[0], fogc, .25 + night * .25), c2: mix(c[1], fogc, .25 + night * .25), c3: mix(c[2], fogc, .25 + night * .25), anchor: [x - 80 + k[3] * 12, y + 330], tail: 7 });
    ctx.restore();
  }
}
/* ---- QUEBRADA ---- */
function drawQuebrada(ctx, camX, y0, mood, o = {}) {
  const m = clamp(mood, 0, 3), lo = _wqLo(m), f = _wqF(m), t = o.t || 0, lit = o.lit == null ? 1 : clamp(o.lit), night = o.night || 0, base = [];
  if (o.sky !== false) drawSkyMood(ctx, m, t, o.skyOpts || {});
  if (o.kites !== false && !(o.noLayer && o.noLayer.includes(-1))) wqKites(ctx, camX, y0, m, t, wqNight(m) * .5 + night);
  const lights = o.lights == null ? clamp((m - 1.9) * 1.1) : o.lights;
  for (let li = 0; li < 4; li++) {
    if (o.noLayer && o.noLayer.includes(li)) continue;
    const L = WQL[li], ly = y0 + L.dy + (o.layerY ? o.layerY[li] || 0 : 0); base.push(ly);
    const tx = W / 2 - camX * L.par, ca = Math.floor((camX * L.par - W / 2 - WQ_PAD) / WQ_CH), cb = Math.floor((camX * L.par + W / 2 + WQ_PAD) / WQ_CH);
    for (let ci = ca; ci <= cb; ci++) {
      const sx = tx + ci * WQ_CH - WQ_PAD, sy = ly - L.hmax, dw = (WQ_CH + WQ_PAD * 2), dh = L.hmax + L.ext;
      const groups = [[lo, 1]]; if (f > .004) groups.push([Math.min(3, lo + 1), f]);
      for (const [mi, ma] of groups) {
        if (lit < .99) { ctx.save(); ctx.globalAlpha *= ma; ctx.drawImage(wqChunk(li, ci, mi, 0).cv, sx, sy, dw, dh); ctx.restore(); }
        if (lit > .01) { ctx.save(); ctx.globalAlpha *= ma * (lit < .99 ? lit : 1); ctx.drawImage(wqChunk(li, ci, mi, 1).cv, sx, sy, dw, dh); ctx.restore(); }
      }
    }
    // postes + fios (vivos) nas camadas 1..3
    if (o.poles !== false && li >= 2) {
      ctx.save(); ctx.translate(tx, ly); wqPolesDraw(ctx, li, ca, cb, m, t); if (lights > .02 && li >= 2) wqStringLights(ctx, li, ca, cb, m, t, lights); ctx.restore();
    }
    if (li === 1 && o.fog !== 0) { const fa = (o.fog == null ? 1 : o.fog) * .5, fc = wqC('fog', m); ctx.fillStyle = lg(ctx, 0, ly - 140, 0, ly + 40, [[0, rgba(fc, 0)], [1, rgba(fc, clamp(fa * .5))]]); ctx.fillRect(0, ly - 140, W, 190); }
  }
  if (night > .01) { ctx.fillStyle = rgba(wqC('shade', m), clamp(night) * .6); ctx.fillRect(0, 0, W, H); }
  return { base };
}
function wqPolesDraw(ctx, li, ca, cb, m, t) {
  const s = [.4, .55, .78, 1][li], wc = wqC('wire', m), pc = mix(wqC('slab', m), wqC('shade', m), .45), metal = wqC('metal', m), poles = [];
  for (let ci = ca - 1; ci <= cb + 1; ci++) for (const p of wqPoles(li, ci)) poles.push(p);
  poles.sort((a, b) => a.x - b.x);
  const fogc = wqC('fog', m), fa = [0, .5, .22, 0][li], wcc = mix(wc, fogc, fa);
  ctx.strokeStyle = wcc; ctx.lineWidth = Math.max(.8, 1.5 * s); ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i], n = poles[i + 1], ty = -p.ph;
    if (n) for (let k = 0; k < (li === 3 ? 6 : 4); k++) { const ox = (k - 2.5) * 9 * s, oy = (k < 3 ? 10 : 28) * s + (k % 3) * 2 * s, dx = n.x - p.x; ctx.moveTo(p.x + ox, ty + oy); ctx.quadraticCurveTo((p.x + n.x) / 2 + ox, (ty + oy + -n.ph + oy) / 2 + dx * (.06 + k * .007) * 2 + Math.sin(t * 1.2 + k + i) * 1.2 * s, n.x + ox + (k % 2 ? 2 : -2), -n.ph + oy + (k % 3 - 1) * 4); }
    for (const d of p.drops) { ctx.moveTo(p.x + (d[3] > 0 ? 8 : -8) * s, ty + 12 * s); ctx.quadraticCurveTo((p.x + d[0]) / 2, (ty + d[1]) / 2 + d[2] * s + Math.abs(d[0] - p.x) * .05, d[0], d[1]); }
  }
  ctx.stroke();
  for (const p of poles) {
    const ty = -p.ph, x = p.x;
    ctx.fillStyle = mix(pc, fogc, fa); ctx.fillRect(x - 4 * s, ty, 8 * s, p.ph);
    ctx.fillStyle = rgba(wqC('shade', m), .3); ctx.fillRect(x + 1.2 * s, ty, 2.8 * s, p.ph);
    ctx.fillStyle = mix(metal, fogc, fa); ctx.fillRect(x - 26 * s, ty + 8 * s, 52 * s, 4.5 * s); ctx.fillRect(x - 18 * s, ty + 26 * s, 36 * s, 4 * s);
    if (p.tf && li >= 2) { ctx.fillStyle = mix(metal, fogc, fa); rrect(ctx, x + 4 * s, ty + 42 * s, 20 * s, 30 * s, 4 * s); ctx.fill(); }
    ctx.lineWidth = Math.max(.7, 1.2 * s); ctx.strokeStyle = wcc; ctx.beginPath();
    for (let k = 0; k < 3; k++) { const a = hash2(k, p.seed, 2), bx = x + (a - .5) * 46 * s, by = ty + (14 + a * 22) * s; ctx.moveTo(bx + 6 * s, by); ctx.ellipse(bx, by, 6 * s, 3.5 * s + k * s, 0, 0, TAU * (.7 + a * .3)); }
    ctx.stroke();
    if (li === 3 && p.seed % 3 === 0) { const nx = poles[poles.indexOf(p) + 1]; if (nx) { const mx = (p.x + nx.x) / 2, my = -(p.ph + nx.ph) / 2 + (nx.x - p.x) * .06 + 10; ctx.strokeStyle = wc; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx - 4, my); ctx.lineTo(mx - 4, my + 14); ctx.moveTo(mx + 6, my); ctx.lineTo(mx + 6, my + 17); ctx.stroke(); ctx.fillStyle = wc; rrect(ctx, mx - 11, my + 13, 13, 7, 3); ctx.fill(); rrect(ctx, mx, my + 16, 13, 7, 3); ctx.fill(); } }
  }
}
function wqStringLights(ctx, li, ca, cb, m, t, amt) {
  const s = [.5, .62, .8, 1][li], cols = ['#ff5fae', '#ffe08a', '#6ff0d0', '#ffa86a', '#b48cff', '#8fd6ff'], wc = wqC('wire', m);
  ctx.save(); ctx.lineWidth = 1;
  for (let ci = ca; ci <= cb; ci++) for (const b of wqBlocks(li, ci)) {
    if (!b.lights) continue; const y = -b.h - 14 * s, nb = Math.max(4, Math.round(b.w / (li === 3 ? 15 : 20))), x0 = b.x + 3, x1 = b.x + b.w - 3;
    ctx.strokeStyle = wc; ctx.globalAlpha = amt; ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + 16 * s, x1, y); ctx.stroke();
    for (let i = 0; i <= nb; i++) {
      const u = i / nb, bx = lerp(x0, x1, u), by = y + 8 * s * 2 * u * (1 - u) + 2, on = .55 + .45 * Math.sin(t * 5 + i * 2.1 + b.seed), col = cols[(i + b.seed) % 6];
      ctx.globalAlpha = amt * .26 * on; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, 10 * s, 0, TAU); ctx.fill();
      ctx.globalAlpha = amt * (.7 + .3 * on); ctx.fillStyle = mix(col, '#ffffff', .45); ctx.beginPath(); ctx.arc(bx, by, 3 * s, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------------------------------------------------------------
   5. CHÃO
   --------------------------------------------------------------- */
const _wqGround = [];
function wqGroundTile(mi) {
  if (_wqGround[mi]) return _wqGround[mi];
  const TW = 512, TH = 420, P = WQ[mi], c = _wqCv(TW, TH), g = c.getContext('2d'), r = rng(900 + mi), night = P.night;
  const wrap = fn => { fn(0); fn(-TW); fn(TW); };
  // mosqueado de concreto
  for (let i = 0; i < 60; i++) { const x = r() * TW, y = r() * TH, w = 40 + r() * 140, h = 8 + r() * 40, d = r() < .5; g.fillStyle = d ? rgba(P.shade, .1 + r() * .1) : rgba(P.curb, .06 + r() * .08); wrap(dx => { g.beginPath(); g.ellipse(x + dx, y, w, h, 0, 0, TAU); g.fill(); }); }
  // juntas de laje (inclinadas) + horizontais
  g.strokeStyle = rgba(P.shade, .55); g.lineWidth = 2; g.lineCap = 'round';
  wrap(dx => { g.beginPath(); for (let k = 0; k < 4; k++) { const x = k * 128 + 36 + dx; g.moveTo(x, 6); g.lineTo(x - 70, 120); g.lineTo(x - 190, 420); } g.moveTo(dx, 74); g.lineTo(dx + TW, 74); g.moveTo(dx, 190); g.lineTo(dx + TW, 190); g.moveTo(dx, 330); g.lineTo(dx + TW, 330); g.stroke(); });
  g.strokeStyle = rgba(P.curb, .22); g.lineWidth = 1.2; wrap(dx => { g.beginPath(); for (let k = 0; k < 4; k++) { const x = k * 128 + 39 + dx; g.moveTo(x, 6); g.lineTo(x - 70, 120); g.lineTo(x - 190, 420); } g.moveTo(dx, 77); g.lineTo(dx + TW, 77); g.moveTo(dx, 193); g.lineTo(dx + TW, 193); g.stroke(); });
  // rachaduras e remendos
  g.strokeStyle = rgba(P.shade, .5); g.lineWidth = 1.4; g.beginPath(); let x = 40 + r() * 100, y = 90; g.moveTo(x, y); for (let i = 0; i < 9; i++) { x += 18 + r() * 24; y += (r() - .3) * 30; g.lineTo(x, y); } g.stroke();
  g.fillStyle = rgba(P.shade, .18); wrap(dx => { rrect(g, 300 + dx, 230, 90, 40, 3); g.fill(); });
  // poças refletindo
  if (night > .15) {
    const pc = mi === 3 ? ['255,170,220', '170,140,255'] : ['255,180,90', '90,160,200'];
    for (let i = 0; i < 3; i++) {
      const px = 70 + i * 170 + r() * 40, py = 120 + i * 90 + r() * 30, pw = 50 + r() * 50, ph = 8 + r() * 8;
      wrap(dx => { g.save(); g.beginPath(); g.ellipse(px + dx, py, pw, ph, 0, 0, TAU); g.clip(); g.fillStyle = lg(g, 0, py - ph, 0, py + ph, [[0, `rgba(${pc[1]},.5)`], [1, `rgba(${pc[0]},.4)`]]); g.fillRect(px + dx - pw, py - ph, pw * 2, ph * 2); g.fillStyle = `rgba(255,250,235,.42)`; g.fillRect(px + dx - 6, py - ph, 12, ph * 2); g.restore(); g.strokeStyle = rgba(P.curb, .35); g.lineWidth = 1; g.beginPath(); g.ellipse(px + dx, py, pw, ph, 0, 0, TAU); g.stroke(); });
    }
  }
  // ralo e bueiro
  g.fillStyle = rgba(P.shade, .7); wrap(dx => { rrect(g, 140 + dx, 250, 64, 14, 2); g.fill(); }); g.strokeStyle = rgba(P.curb, .3); g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 8; k++) { g.moveTo(148 + k * 7.5, 251); g.lineTo(148 + k * 7.5, 262); } g.stroke();
  // folhas/papéis/pontos
  for (let i = 0; i < 16; i++) { const px = r() * TW, py = 20 + r() * 380; g.fillStyle = rgba(r() < .5 ? P.curb : P.shade, .25); g.beginPath(); g.ellipse(px, py, 2 + r() * 5, 1 + r() * 2.5, r() * 3, 0, TAU); g.fill(); }
  g.fillStyle = rgba(P.shade, .13); for (let i = 0; i < 400; i++) g.fillRect(r() * TW, r() * TH, 1.5, 1.5);
  return (_wqGround[mi] = c);
}
function drawBecoGround(ctx, y0, mood, camX = 0, o = {}) {
  const m = clamp(mood, 0, 3), lo = _wqLo(m), f = _wqF(m), gh = Math.max(H - y0, 120);
  ctx.save();
  // base
  ctx.fillStyle = lg(ctx, 0, y0, 0, y0 + 300, [[0, wqC('grdTop', m)], [1, wqC('grdBot', m)]]); ctx.fillRect(-400, y0, W + 800, Math.max(gh, 300) + 600);
  // textura (tile, 2 moods)
  const drawTile = (mi, a) => { const tile = wqGroundTile(mi); ctx.save(); ctx.globalAlpha *= a; const off = _wqMod(camX * 1.0, 512); for (let x = -off - 512; x < W + 520; x += 512) ctx.drawImage(tile, Math.round(x), y0 + 12); ctx.restore(); };
  drawTile(lo, 1 - f); if (f > .004) drawTile(lo + 1, f);
  // calçada / meio-fio
  ctx.fillStyle = wqC('curb', m); ctx.fillRect(-400, y0, W + 800, 12);
  ctx.fillStyle = rgba('#ffffff', .22); ctx.fillRect(-400, y0, W + 800, 3);
  ctx.fillStyle = rgba(wqC('shade', m), .38); ctx.fillRect(-400, y0 + 12, W + 800, 5);
  // sombra do pé das casas sobre a calçada
  ctx.fillStyle = lg(ctx, 0, y0 - 40, 0, y0 + 60, [[0, rgba(wqC('shade', m), .0)], [.35, rgba(wqC('shade', m), .5)], [1, rgba(wqC('shade', m), 0)]]); ctx.fillRect(-400, y0 - 40, W + 800, 100);
  // poças de luz dos postes
  if (o.lamps) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const lx of o.lamps) { const sx = lx - camX; ctx.fillStyle = rg(ctx, sx, y0 + 50, 0, 190, [[0, `rgba(${wqRGB('lampC', m)},${.3 * wqN('night', m)})`], [1, 'rgba(255,200,110,0)']]); ctx.save(); ctx.translate(sx, y0 + 50); ctx.scale(1, .3); ctx.translate(-sx, -y0 - 50); ctx.fillRect(sx - 200, y0 - 150, 400, 400); ctx.restore(); } ctx.restore(); }
  ctx.restore();
}
function drawEscadaria(ctx, x, y, n, mood, o = {}) {
  const m = clamp(mood, 0, 3), sw = o.w || 46, sh = o.h || 26, dir = o.dir || 1, slab = wqC('slab', m), shade = wqC('shade', m), metal = wqC('metal', m), rim = wqC('rim', m), wall = wqC('walls', m) || slab;
  const top = (i) => y - (i + 1) * sh, px = i => x + dir * i * sw;
  ctx.save(); ctx.lineJoin = 'round';
  // corpo sólido sob os degraus
  ctx.fillStyle = lg(ctx, 0, y - n * sh, 0, y, [[0, mix(slab, shade, .45)], [1, mix(slab, shade, .7)]]);
  ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < n; i++) { ctx.lineTo(px(i), top(i)); ctx.lineTo(px(i + 1), top(i)); } ctx.lineTo(px(n), y + (o.depth || 40)); ctx.lineTo(x, y + (o.depth || 40)); ctx.closePath(); ctx.fill();
  for (let i = 0; i < n; i++) {
    const xa = Math.min(px(i), px(i + 1)), xb = Math.max(px(i), px(i + 1)), ty = top(i);
    ctx.fillStyle = lg(ctx, 0, ty, 0, ty + 7, [[0, mix(slab, rim, .25)], [1, slab]]); ctx.fillRect(xa, ty, xb - xa, 8); // piso
    ctx.fillStyle = rgba(rim, .6); ctx.fillRect(xa, ty, xb - xa, 1.6);
    ctx.fillStyle = mix(slab, shade, .45); ctx.fillRect(xa, ty + 8, xb - xa, sh - 8); // espelho
    ctx.fillStyle = rgba(shade, .35); ctx.fillRect(xa, ty + sh - 5, xb - xa, 5);
    ctx.fillStyle = rgba(shade, .2); ctx.fillRect(dir > 0 ? xa : xb - 3, ty + 8, 3, sh - 8);
  }
  if (o.rail !== false) { // corrimão de cano
    const rise = 56; ctx.strokeStyle = metal; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - rise); ctx.lineTo(px(n), top(n - 1) - rise); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - rise * .55); ctx.lineTo(px(n), top(n - 1) - rise * .55); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= n; i += 2) { const bx = px(i), by = i === 0 ? y : top(i - 1); ctx.moveTo(bx, by); ctx.lineTo(bx, by - rise); } ctx.stroke();
    ctx.strokeStyle = rgba(rim, .55); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - rise - 1.6); ctx.lineTo(px(n), top(n - 1) - rise - 1.6); ctx.stroke();
  }
  ctx.restore();
  return { x: px(n), y: top(n - 1) };
}
function drawWires(ctx, pts, sag, o = {}) {
  const n = o.n || 1, gap = o.gap == null ? 6 : o.gap, t = o.t || 0;
  ctx.save(); ctx.strokeStyle = o.col || '#080c14'; ctx.lineWidth = o.lw || 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    const oy = (k - (n - 1) / 2) * gap; ctx.beginPath();
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), s = (sag == null ? len * .06 : sag) * (1 + k * .07) + Math.sin(t * 1.4 + i + k) * (o.sway || 0);
      if (i === 0) ctx.moveTo(a[0], a[1] + oy);
      ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + s * 2 + oy, b[0], b[1] + oy);
    }
    ctx.stroke();
  }
  if (o.sheen) { ctx.strokeStyle = o.sheen; ctx.lineWidth = .8; ctx.translate(0, -1.4); for (let k = 0; k < n; k++) { const oy = (k - (n - 1) / 2) * gap; ctx.beginPath(); for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), s = (sag == null ? len * .06 : sag) * (1 + k * .07); if (i === 0) ctx.moveTo(a[0], a[1] + oy); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + s * 2 + oy, b[0], b[1] + oy); } ctx.stroke(); } }
  ctx.restore();
}
function drawPoste(ctx, x, y0, h, mood, o = {}) {
  const m = clamp(mood, 0, 3), s = o.s || 1, tw = 11 * s, t = o.t || 0, slab = wqC('slab', m), shade = wqC('shade', m), rim = wqC('rim', m), metal = wqC('metal', m), wc = wqC('wire', m);
  const on = o.on == null ? wqNight(m) : o.on, top = y0 - h, span = o.span || 520;
  ctx.save(); ctx.lineCap = 'round';
  // fios
  if (o.wires !== false) {
    for (const sgn of [-1, 1]) { const pts = [[x, top + 13 * s], [x + sgn * span, top + 13 * s + (sgn < 0 ? 18 : -10)]]; drawWires(ctx, pts, span * .06, { n: 3, gap: 8 * s, col: wc, lw: 1.7 * s, sway: .6, t, sheen: rgba(rim, .3) }); drawWires(ctx, [[x, top + 44 * s], [x + sgn * span, top + 52 * s]], span * .075, { n: 3, gap: 8 * s, col: wc, lw: 1.6 * s, t }); }
  }
  // corpo (levemente cônico, com luz de recorte)
  ctx.fillStyle = lg(ctx, x - tw, 0, x + tw, 0, [[0, mix(slab, rim, .3)], [.4, mix(slab, shade, .2)], [1, mix(slab, shade, .7)]]);
  poly(ctx, [[x - tw * .72, y0], [x + tw * .72, y0], [x + tw * .45, top], [x - tw * .45, top]]); ctx.fill();
  ctx.strokeStyle = rgba(shade, .4); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 8; k++) { const yy = y0 - h * k / 8; ctx.moveTo(x - tw * .6, yy); ctx.lineTo(x + tw * .6, yy + 2); } ctx.stroke();
  ctx.fillStyle = rgba(shade, .5); ctx.fillRect(x - tw, y0 - 6, tw * 2, 6);
  // cruzetas e isoladores
  ctx.fillStyle = metal; ctx.fillRect(x - 38 * s, top + 10 * s, 76 * s, 6 * s); ctx.fillRect(x - 28 * s, top + 41 * s, 56 * s, 5 * s);
  ctx.fillStyle = mix(slab, '#ffffff', .3); for (const [dx, dy] of [[-34, 8], [-14, 8], [14, 8], [34, 8], [-24, 39], [24, 39]]) { ctx.beginPath(); ctx.ellipse(x + dx * s, top + (dy + 1) * s, 2.8 * s, 4 * s, 0, 0, TAU); ctx.fill(); }
  // transformador
  ctx.fillStyle = lg(ctx, x + 6 * s, 0, x + 30 * s, 0, [[0, mix(metal, rim, .25)], [1, mix(metal, shade, .5)]]); rrect(ctx, x + 6 * s, top + 60 * s, 24 * s, 38 * s, 6 * s); ctx.fill(); ctx.fillStyle = rgba(rim, .35); ctx.fillRect(x + 8 * s, top + 64 * s, 3 * s, 30 * s);
  // emaranhado e tênis pendurado
  ctx.strokeStyle = wc; ctx.lineWidth = 1.4 * s; ctx.beginPath(); for (let k = 0; k < 4; k++) { const a = hash2(k, (x | 0) + 7, 2), bx = x + (a - .5) * 64 * s, by = top + (16 + a * 28) * s; ctx.moveTo(bx + 8 * s, by); ctx.ellipse(bx, by, 8 * s, 4.5 * s + k * s, 0, 0, TAU * (.72 + a * .25)); } ctx.stroke();
  if (o.sneakers !== false) { const sx = x - 22 * s, sy = top + 16 * s, sw2 = Math.sin(t * 1.6) * 2 * s; ctx.strokeStyle = wc; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(sx - 3 * s, sy); ctx.lineTo(sx - 3 * s + sw2, sy + 24 * s); ctx.moveTo(sx + 5 * s, sy); ctx.lineTo(sx + 5 * s + sw2, sy + 27 * s); ctx.stroke(); ctx.fillStyle = mix('#e8e4da', shade, .3); for (const [dx, dy] of [[-8, 22], [0, 25]]) { rrect(ctx, sx + dx * s + sw2 - 3 * s, sy + dy * s, 14 * s, 7 * s, 3 * s); ctx.fill(); } ctx.fillStyle = '#e04a5a'; ctx.fillRect(sx - 11 * s + sw2, sy + 28 * s, 14 * s, 2 * s); }
  // braço da lâmpada
  const lx = x + 58 * s, ly = top + 4 * s; ctx.strokeStyle = metal; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x, top + 16 * s); ctx.quadraticCurveTo(x + 22 * s, top - 4 * s, lx - 6 * s, ly); ctx.stroke();
  ctx.fillStyle = lg(ctx, 0, ly, 0, ly + 11 * s, [[0, mix(metal, rim, .3)], [1, metal]]); ctx.beginPath(); ctx.moveTo(lx - 20 * s, ly + 10 * s); ctx.quadraticCurveTo(lx - 20 * s, ly - 2 * s, lx, ly - 3 * s); ctx.quadraticCurveTo(lx + 20 * s, ly - 2 * s, lx + 20 * s, ly + 10 * s); ctx.closePath(); ctx.fill();
  const flick = on * (.94 + .06 * Math.sin(t * 31) * (o.flicker ? 1 : 0));
  ctx.fillStyle = on > .05 ? mix('#cfd6dc', '#fff6d0', on) : '#cfd6dc'; ctx.beginPath(); ctx.ellipse(lx, ly + 10 * s, 15 * s, 3.4 * s, 0, 0, TAU); ctx.fill();
  if (on > .02) {
    const lc = o.lc || wqRGB('lampC', m); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const cone = ctx.createLinearGradient(0, ly + 10 * s, 0, y0); cone.addColorStop(0, `rgba(${lc},${.3 * flick})`); cone.addColorStop(1, `rgba(${lc},${.05 * flick})`);
    ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(lx - 12 * s, ly + 12 * s); ctx.lineTo(lx + 12 * s, ly + 12 * s); ctx.lineTo(lx + 165 * s, y0 + 6); ctx.lineTo(lx - 165 * s, y0 + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rg(ctx, lx, ly + 10 * s, 0, 120 * s, [[0, `rgba(255,248,220,${.6 * flick})`], [.12, `rgba(${lc},${.3 * flick})`], [1, `rgba(${lc},0)`]]); ctx.fillRect(lx - 130 * s, ly - 120 * s, 260 * s, 260 * s);
    ctx.save(); ctx.translate(lx, y0 + 4); ctx.scale(1, .22); ctx.fillStyle = rg(ctx, 0, 0, 0, 190 * s, [[0, `rgba(${lc},${.4 * flick})`], [1, `rgba(${lc},0)`]]); ctx.fillRect(-200 * s, -200 * s, 400 * s, 400 * s); ctx.restore();
    const r = rng((x | 0) + 3); for (let i = 0; i < 9; i++) { const px = lx + (r() - .5) * 150 * s + Math.sin(t * .8 + i * 2) * 8, py = ly + 20 * s + ((r() * 300 * s + t * (6 + r() * 8)) % (y0 - ly - 20 * s)), a = .5 * Math.sin((py - ly) / (y0 - ly) * Math.PI); ctx.fillStyle = `rgba(255,240,200,${a * flick})`; ctx.beginPath(); ctx.arc(px, py, 1.1 * s, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
}
/* ---- laje ---- */
function drawLaje(ctx, x, y, w, mood, o = {}) {
  const m = clamp(mood, 0, 3), slab = wqC('slab', m), shade = wqC('shade', m), rim = wqC('rim', m), metal = wqC('metal', m), t = o.t || 0, seed = o.seed || 3;
  const wallc = o.wall || mix(wqC('walls', m) || slab, shade, .25), h = o.h || 24, mur = o.mureta == null ? 16 : o.mureta, drop = o.drop == null ? 70 : o.drop;
  const wl = mix(slab, shade, .45), P = { slab, shade, metal, tank: wqC('tank', m), tankLid: wqC('tankLid', m), cloth: WQ[_wqLo(m)].cloth, plant: wqC('plant', m), rim, walls: WQ[_wqLo(m)].walls, brick: WQ[_wqLo(m)].brick };
  ctx.save();
  // fachada abaixo da laje (some em sombra)
  if (drop > 0) { ctx.fillStyle = lg(ctx, 0, y + h, 0, y + h + drop, [[0, mix(wl, shade, .2)], [1, mix(wl, shade, .75)]]); ctx.fillRect(x + 2, y + h, w - 4, drop); }
  // corpo da laje
  ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, mix(slab, rim, .25)], [.2, slab], [1, mix(slab, shade, .55)]]); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = rgba(rim, .7); ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = rgba(shade, .3); ctx.fillRect(x, y + h - 4, w, 4);
  ctx.strokeStyle = rgba(shade, .25); ctx.lineWidth = 1; ctx.beginPath(); for (let xx = x + 40; xx < x + w; xx += 90) { ctx.moveTo(xx, y + 3); ctx.lineTo(xx + 8, y + h - 3); } ctx.stroke();
  // mureta (parapeito) e tampa
  if (mur > 0) {
    const sides = o.murSides || 'LRB';
    ctx.fillStyle = lg(ctx, 0, y - mur, 0, y, [[0, mix(wallc, rim, .2)], [1, mix(wallc, shade, .35)]]); ctx.fillRect(x + 2, y - mur, w - 4, mur);
    ctx.fillStyle = slab; ctx.fillRect(x - 3, y - mur - 4, w + 6, 4); ctx.fillStyle = rgba(rim, .8); ctx.fillRect(x - 3, y - mur - 4, w + 6, 1.4);
    ctx.strokeStyle = rgba(shade, .35); ctx.lineWidth = 1; ctx.beginPath(); for (let xx = x + 30; xx < x + w - 10; xx += 50) { ctx.moveTo(xx, y - mur); ctx.lineTo(xx, y); } ctx.stroke();
  }
  const top = y - (mur > 0 ? mur + 4 : 0);
  // vergalhão nas pontas
  const rb = o.rebar == null ? 'LR' : o.rebar;
  if (rb) for (const sd of ['L', 'R']) if (rb.includes(sd)) {
    const bx = sd === 'L' ? x + 6 : x + w - 24, dir = sd === 'L' ? -1 : 1;
    ctx.fillStyle = mix(slab, shade, .2); ctx.fillRect(bx - 1, top - 34, 14, 34); ctx.fillStyle = slab; ctx.fillRect(bx - 4, top - 38, 20, 5);
    ctx.strokeStyle = '#8a523a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 4; i++) { const hh = 14 + hash2(i, seed, sd === 'L' ? 1 : 2) * 16, rx = bx + 1 + i * 3.6; ctx.moveTo(rx, top - 38); ctx.lineTo(rx, top - 38 - hh); ctx.lineTo(rx + dir * (2 + hash2(i, seed, 3) * 6), top - 42 - hh); } ctx.stroke();
    ctx.strokeStyle = rgba('#ffd9a8', .5); ctx.lineWidth = .8; ctx.beginPath(); for (let i = 0; i < 4; i++) { const rx = bx + 1 + i * 3.6 - .6; ctx.moveTo(rx, top - 38); ctx.lineTo(rx, top - 52); } ctx.stroke();
  }
  // objetos
  const U = u => x + w * u;
  if (o.tank != null && o.tank !== false) { const tx = U(o.tank === true ? .5 : o.tank); wqTank(ctx, tx, top, 1.9, P, true); }
  if (o.ant != null && o.ant !== false) wqAntenna(ctx, U(o.ant), top, 1.7, P);
  if (o.dish != null && o.dish !== false) wqDish(ctx, U(o.dish), top, 1.8, P);
  if (o.varal) { const vx0 = U(o.varal[0] == null ? .15 : o.varal[0]), vx1 = U(o.varal[1] == null ? .7 : o.varal[1]); wqClothesLive(ctx, vx0, vx1, top, 1.9, P, seed, t); }
  if (o.plants) for (let i = 0; i < o.plants; i++) wqPlant(ctx, U(.08 + hash2(i, seed, 9) * .84), top, 1.8, P, seed + i);
  if (o.chair != null && o.chair !== false) { const cx = U(o.chair === true ? .4 : o.chair); ctx.fillStyle = mix('#ffffff', shade, .35); rrect(ctx, cx - 14, top - 22, 28, 5, 2); ctx.fill(); ctx.fillRect(cx - 14, top - 52, 4, 32); ctx.fillStyle = mix('#ffffff', shade, .45); rrect(ctx, cx - 14, top - 54, 28, 5, 2); ctx.fill(); ctx.fillStyle = mix('#ffffff', shade, .5); ctx.fillRect(cx - 12, top - 17, 3, 17); ctx.fillRect(cx + 9, top - 17, 3, 17); }
  ctx.restore();
  return { top, left: x, right: x + w, y: top };
}
function wqClothesLive(ctx, x0, x1, y, s, P, seed, t) {
  ctx.strokeStyle = P.metal; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0, y - 52 * s); ctx.moveTo(x1, y); ctx.lineTo(x1, y - 52 * s); ctx.stroke();
  const ly = y - 52 * s, sag = 9 * s, n = Math.max(3, Math.round((x1 - x0) / (22 * s)));
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, ly); ctx.quadraticCurveTo((x0 + x1) / 2, ly + sag * 2, x1, ly); ctx.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + .6) / (n + .2), px = lerp(x0, x1, u), py = ly + sag * 2 * u * (1 - u) + 1, w = (9 + hash2(i, seed, 8) * 10) * s, h = (16 + hash2(i, seed, 9) * 24) * s, sw = Math.sin(t * 2.2 + i * 1.7) * 2.2 * s;
    ctx.fillStyle = P.cloth[(i + seed) % 4]; ctx.beginPath(); ctx.moveTo(px - w / 2, py); ctx.lineTo(px + w / 2, py); ctx.quadraticCurveTo(px + w / 2 + sw * 1.4, py + h * .5, px + w / 2 + sw, py + h); ctx.lineTo(px - w / 2 + sw, py + h); ctx.quadraticCurveTo(px - w / 2 + sw * 1.4, py + h * .5, px - w / 2, py); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.moveTo(px + w * .1, py); ctx.lineTo(px + w / 2, py); ctx.lineTo(px + w / 2 + sw, py + h); ctx.lineTo(px + w * .1 + sw, py + h); ctx.fill();
    ctx.fillStyle = P.metal; ctx.fillRect(px - 3, py - 2, 2.4, 4); ctx.fillRect(px + 2, py - 2, 2.4, 4);
  }
}
/* ---- corda bamba ---- */
function tightropePt(x0, y0, x1, y1, sag, u, t = 0, wob = 0) {
  const s = sag * (1 + wob * .07 * Math.sin(t * 5.5 + u * 3)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + s * 2, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
  return [a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1];
}
function drawTightrope(ctx, x0, y0, x1, y1, sag, t = 0, o = {}) {
  const wob = o.wob == null ? 1 : o.wob, col = o.col || '#d9cfae', lw = o.lw || 3.2, N = 40;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = []; for (let i = 0; i <= N; i++) pts.push(tightropePt(x0, y0, x1, y1, sag, i / N, t, wob));
  const path = dy => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] + dy) : ctx.moveTo(p[0], p[1] + dy))); };
  if (o.shadow !== false) { path(5); ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = lw + 1; ctx.stroke(); }
  path(0); ctx.strokeStyle = mix(col, '#000000', .55); ctx.lineWidth = lw + 1.6; ctx.stroke();
  path(0); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
  ctx.setLineDash([2, 5]); path(0); ctx.strokeStyle = rgba('#000000', .28); ctx.lineWidth = lw * .7; ctx.stroke(); ctx.setLineDash([]); // trançado
  path(-.8); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.stroke();
  if (o.anchors !== false) for (const [x, y, d] of [[x0, y0, 1], [x1, y1, -1]]) { ctx.fillStyle = '#4a3a30'; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#9a8f78'; ctx.beginPath(); ctx.arc(x - .8, y - .8, 2.2, 0, TAU); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + d * 5, y + 3, 4, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
/* ---- pipa ---- */
function drawPipa(ctx, x, y, s, rot, t, o = {}) {
  const c1 = o.c1 || '#ff5f8f', c2 = o.c2 || '#ffd23f', c3 = o.c3 || '#2fc9c0', cut = o.cut === true ? 1 : (o.cut || 0), tl = o.tail || 9;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // linha
  const bx = 0, by = s * 1.15;
  if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, s * 4.5, [[0, `rgba(255,224,150,${.5 * o.glow})`], [1, 'rgba(255,224,150,0)']]); ctx.fillRect(-s * 5, -s * 5, s * 10, s * 10); ctx.restore(); }
  if (o.anchor) {
    ctx.save(); ctx.rotate(-(rot || 0)); const ax = o.anchor[0] - x, ay = o.anchor[1] - y, kx = bx, ky = by; ctx.translate(0, 0);
    const lc = o.lineCol || 'rgba(235,235,225,.75)', sl = o.slack == null ? .12 : o.slack, len = Math.hypot(ax - kx, ay - ky);
    if (cut > 0) { // linha cortada: pontas soltas chicoteando
      const w = Math.sin(t * 9) * s * .6;
      ctx.strokeStyle = lc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.bezierCurveTo(kx + w * 2, ky + s * 3, kx - w * 3, ky + s * 6, kx + w * 4, ky + s * (7 + cut * 4)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.bezierCurveTo(ax + 6, ay - len * .1, ax - 10, ay - len * .22, ax + 4 + w, ay - len * (.28 - cut * .05)); ctx.stroke();
    } else { ctx.strokeStyle = lc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.quadraticCurveTo((kx + ax) / 2 + Math.sin(t * 1.3) * 4, (ky + ay) / 2 + len * sl, ax, ay); ctx.stroke(); }
    ctx.restore();
  }
  // rabiola
  ctx.strokeStyle = rgba(c2, .95); ctx.lineWidth = Math.max(1.2, s * .09); ctx.beginPath(); ctx.moveTo(0, s * 1.1);
  const tp = []; for (let i = 1; i <= tl; i++) { const px = Math.sin(t * 4.5 + i * 1.05) * s * .42 * Math.min(1, i / 3), py = s * (1.1 + i * .62); tp.push([px, py]); ctx.lineTo(px, py); } ctx.stroke();
  tp.forEach((p, i) => { if (i % 2 === 1) { ctx.fillStyle = i % 4 === 1 ? c1 : c3; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.sin(t * 5 + i) * .5); poly(ctx, [[-s * .2, -s * .12], [s * .2, s * .12], [s * .2, -s * .12], [-s * .2, s * .12]]); ctx.fill(); ctx.restore(); } });
  // corpo: losango com 4 painéis
  const P = [[0, -s * 1.2], [s * .74, 0], [0, s * 1.1], [-s * .74, 0]];
  ctx.fillStyle = c1; poly(ctx, P); ctx.fill();
  ctx.fillStyle = c2; poly(ctx, [[0, -s * 1.2], [s * .74, 0], [0, 0]]); ctx.fill();
  ctx.fillStyle = c3; poly(ctx, [[0, s * 1.1], [-s * .74, 0], [0, 0]]); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.28)'; poly(ctx, [[0, -s * 1.2], [-s * .74, 0], [0, 0]]); ctx.fill(); // brilho do papel de seda
  ctx.fillStyle = 'rgba(0,0,0,.12)'; poly(ctx, [[0, 0], [s * .74, 0], [0, s * 1.1]]); ctx.fill();
  ctx.strokeStyle = 'rgba(40,24,50,.5)'; ctx.lineWidth = Math.max(1, s * .07); poly(ctx, P); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,200,.75)'; ctx.lineWidth = Math.max(.8, s * .05); ctx.beginPath(); ctx.moveTo(0, -s * 1.2); ctx.lineTo(0, s * 1.1); ctx.moveTo(-s * .74, 0); ctx.lineTo(s * .74, 0); ctx.stroke(); // varetas de bambu
  ctx.restore();
}

/* ---------------------------------------------------------------
   6. HELPERS DE CENA
   --------------------------------------------------------------- */
function wqScene(ctx, mood, camX, y0, t, o) {
  drawQuebrada(ctx, camX, y0 - 20, mood, Object.assign({ t }, o.q || {}));
  drawBecoGround(ctx, y0, mood, camX, { lamps: o.lamps });
}
function drawRoof(ctx, t, o = {}) {
  const m = o.mood == null ? 0 : o.mood, y0 = o.y0 == null ? 520 : o.y0, camX = o.camX || 0, night = wqNight(m);
  const slab = wqC('slab', m), shade = wqC('shade', m), rim = wqC('rim', m), metal = wqC('metal', m), seed = o.seed || 5;
  const P = { slab, shade, metal, tank: wqC('tank', m), tankLid: wqC('tankLid', m), cloth: WQ[_wqLo(m)].cloth, plant: wqC('plant', m), rim };
  if (o.city !== false) drawQuebrada(ctx, camX, y0 + 36, m, Object.assign({ t, sky: o.sky }, o.q || {}));
  else drawSkyMood(ctx, m, t);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gc = wqRGB('glow', m); ctx.fillStyle = lg(ctx, 0, y0 - 220, 0, y0 + 10, [[0, `rgba(${gc},0)`], [1, `rgba(${gc},${.1 + .08 * night})`]]); ctx.fillRect(-400, y0 - 220, W + 800, 240); ctx.restore();
  // mureta do fundo (parapeito) + tampa
  const wl = mix(wqC('walls', m), shade, .2);
  ctx.fillStyle = lg(ctx, 0, y0 - 30, 0, y0 + 6, [[0, mix(wl, rim, .2)], [1, mix(wl, shade, .4)]]); ctx.fillRect(-400, y0 - 30, W + 800, 38);
  ctx.fillStyle = slab; ctx.fillRect(-400, y0 - 36, W + 800, 8); ctx.fillStyle = rgba(rim, .85); ctx.fillRect(-400, y0 - 36, W + 800, 1.6);
  ctx.strokeStyle = rgba(shade, .3); ctx.lineWidth = 1; ctx.beginPath(); for (let x = -((camX * 1.0) % 120); x < W + 120; x += 120) { ctx.moveTo(x, y0 - 28); ctx.lineTo(x, y0 + 6); } ctx.stroke();
  // piso da laje (visto de cima)
  drawBecoGround(ctx, y0 + 8, m, camX * 1.2, {});
  ctx.fillStyle = lg(ctx, 0, y0 + 8, 0, y0 + 60, [[0, rgba(shade, .5)], [1, rgba(shade, 0)]]); ctx.fillRect(-400, y0 + 8, W + 800, 52);
  // objetos de primeiro plano (maiores quanto mais perto)
  if (o.tank !== false) { wqTank(ctx, W * (o.tank == null ? .86 : o.tank), y0 + 120, 2.9, P, true); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(W * (o.tank == null ? .86 : o.tank) + 30, y0 + 122, 90, 10, 0, 0, TAU); ctx.fill(); }
  if (o.varal !== false) { const v = o.varal || [.04, .5]; wqClothesLive(ctx, W * v[0], W * v[1], y0 + 150, 2.5, P, seed, t); }
  if (o.plants !== false) for (let i = 0; i < (o.plants == null ? 3 : o.plants); i++) wqPlant(ctx, W * (.58 + i * .06 + hash2(i, seed, 4) * .03), y0 + 96 + (i % 2) * 14, 2.4, P, seed + i);
  if (o.chair) { const cx = W * (o.chair === true ? .7 : o.chair), cy = y0 + 190; ctx.fillStyle = mix('#ffffff', shade, .35); rrect(ctx, cx - 30, cy - 50, 60, 9, 3); ctx.fill(); ctx.fillRect(cx - 30, cy - 120, 8, 74); ctx.fillStyle = mix('#ffffff', shade, .5); ctx.fillRect(cx - 26, cy - 42, 6, 42); ctx.fillRect(cx + 20, cy - 42, 6, 42); }
  return { floorY: y0 + 8 };
}
function drawBusStop(ctx, x, y0, s, mood, t, o = {}) {
  const m = clamp(mood, 0, 3), slab = wqC('slab', m), shade = wqC('shade', m), metal = wqC('metal', m), rim = wqC('rim', m), nt = wqNight(m);
  if (o.scene) wqScene(ctx, m, o.camX || 0, y0, t, { lamps: [x + 170 * s] });
  ctx.save(); ctx.translate(x, y0); ctx.scale(s, s);
  // sombra de contato
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(40, 6, 150, 9, 0, 0, TAU); ctx.fill();
  // abrigo: teto, colunas, vidro e fundo iluminado
  ctx.fillStyle = lg(ctx, -50, 0, 130, 0, [[0, 'rgba(255,220,150,0)'], [1, 'rgba(255,220,150,0)']]);
  ctx.fillStyle = rgba(shade, .82); ctx.fillRect(-60, -170, 220, 170); ctx.fillStyle = lg(ctx, 0, -170, 0, 0, [[0, rgba(wqC('rim', m), .16)], [1, rgba(wqC('rim', m), 0)]]); ctx.fillRect(-60, -170, 220, 170);
  ctx.fillStyle = lg(ctx, 0, -170, 0, 0, [[0, rgba('#ffffff', .05 + .06 * nt)], [1, rgba('#ffffff', .0)]]); poly(ctx, [[-60, -170], [20, -170], [-20, 0], [-60, 0]]); ctx.fill();
  // propaganda iluminada (backlight)
  const adc = nt > .3 ? ['#ffe9b8', '#ffc0d8'] : ['#e8eaee', '#d8dce2']; ctx.fillStyle = lg(ctx, 0, -150, 0, -50, [[0, adc[0]], [1, adc[1]]]); ctx.fillRect(90, -150, 56, 100); ctx.fillStyle = rgba(shade, .25); ctx.fillRect(100, -140, 36, 8); ctx.fillRect(100, -125, 36, 56);
  if (nt > .2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 118, -100, 0, 140, [[0, 'rgba(255,230,190,.35)'], [1, 'rgba(255,230,190,0)']]); ctx.fillRect(-60, -240, 360, 300); ctx.restore(); }
  ctx.fillStyle = mix(metal, rim, .25); ctx.fillRect(-68, -184, 240, 14); ctx.fillStyle = rgba(rim, .9); ctx.fillRect(-68, -184, 240, 2);
  ctx.fillStyle = mix(metal, rim, .3); ctx.fillRect(-64, -170, 7, 170); ctx.fillRect(159, -170, 7, 170); ctx.fillRect(84, -170, 6, 170);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-40, -150); ctx.lineTo(-10, -60); ctx.moveTo(-20, -150); ctx.lineTo(20, -40); ctx.stroke();
  // banco de ripas
  ctx.fillStyle = mix(metal, rim, .1); for (let k = 0; k < 3; k++) ctx.fillRect(-48, -62 + k * 9, 120, 6); ctx.fillRect(-48, -30, 120, 5); ctx.fillStyle = metal; ctx.fillRect(-44, -28, 5, 28); ctx.fillRect(62, -28, 5, 28);
  // placa de parada em poste
  const px = 210; ctx.fillStyle = lg(ctx, px - 5, 0, px + 5, 0, [[0, mix(metal, rim, .4)], [1, mix(metal, shade, .5)]]); ctx.fillRect(px - 4, -250, 8, 250);
  ctx.fillStyle = '#ffd23f'; rrect(ctx, px - 36, -310, 72, 66, 8); ctx.fill(); ctx.strokeStyle = mix('#ffd23f', '#000000', .6); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#1b2236'; rrect(ctx, px - 22, -296, 44, 22, 5); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(px - 17, -292, 34, 7); ctx.fillStyle = '#1b2236'; ctx.beginPath(); ctx.arc(px - 12, -272, 4, 0, TAU); ctx.arc(px + 12, -272, 4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1b2236'; ctx.font = `bold 15px ${(typeof FONTS !== 'undefined' && FONTS.comic) || 'sans-serif'}`; ctx.textAlign = 'center'; ctx.fillText('ÔNIBUS', px, -251); ctx.textAlign = 'start';
  ctx.fillStyle = rgba('#ffffff', .5); ctx.fillRect(px - 32, -306, 22, 3);
  // horário afixado
  ctx.fillStyle = '#f2efe4'; ctx.fillRect(px - 15, -236, 30, 22); ctx.fillStyle = '#9a4a3a'; ctx.fillRect(px - 15, -236, 30, 4); ctx.fillStyle = 'rgba(30,30,50,.6)'; for (let k = 0; k < 3; k++) ctx.fillRect(px - 12, -229 + k * 5, 24, 1.5);
  ctx.restore();
  // poste de luz ao lado
  drawPoste(ctx, x + 290 * s, y0, 330 * s, m, { s: s, on: o.lamp == null ? nt : o.lamp, t, wires: o.wires !== false, span: 380 * s });
}
function drawSchoolGate(ctx, x, y0, s, mood, t, o = {}) {
  const m = clamp(mood, 0, 3), slab = wqC('slab', m), shade = wqC('shade', m), metal = wqC('metal', m), rim = wqC('rim', m), nt = wqNight(m), wallc = mix(wqC('walls', m) || slab, '#ffffff', .1), gw = o.w || 420, lock = o.lock == null ? 1 : o.lock, open = o.open || 0;
  if (o.scene) wqScene(ctx, m, o.camX || 0, y0, t, { lamps: [x] });
  ctx.save(); ctx.translate(x, y0); ctx.scale(s, s);
  const WL = 700; // meia largura do muro
  // muro dos dois lados
  const wall = (x0, x1) => {
    ctx.fillStyle = lg(ctx, 0, -190, 0, 0, [[0, mix(wallc, rim, .15)], [1, mix(wallc, shade, .35)]]); ctx.fillRect(x0, -190, x1 - x0, 190);
    ctx.fillStyle = slab; ctx.fillRect(x0, -198, x1 - x0, 10); ctx.fillStyle = rgba(rim, .8); ctx.fillRect(x0, -198, x1 - x0, 1.6);
    ctx.fillStyle = rgba(shade, .35); ctx.fillRect(x0, -6, x1 - x0, 6);
    ctx.strokeStyle = rgba(shade, .2); ctx.lineWidth = 1; ctx.beginPath(); for (let yy = -150; yy < 0; yy += 40) { ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); } ctx.stroke();
    // cacos de vidro / arame no topo
    ctx.fillStyle = '#7fd0b8'; for (let xx = x0 + 6; xx < x1 - 6; xx += 14) { const hh = 6 + hash2(xx | 0, 5) * 7; ctx.beginPath(); ctx.moveTo(xx, -198); ctx.lineTo(xx + 3, -198 - hh); ctx.lineTo(xx + 7, -198); ctx.fill(); }
  };
  wall(-gw / 2 - WL, -gw / 2 - 30); wall(gw / 2 + 30, gw / 2 + WL);
  // pichação suave (traços arredondados, cores sobre o reboco)
  const tag = (px, py, sc, col, sd) => {
    ctx.save(); ctx.translate(px, py); ctx.scale(sc, sc); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha *= .6;
    const r = rng(sd); ctx.beginPath(); ctx.moveTo(-60, 10); for (let i = 0; i < 6; i++) { const lx = -60 + i * 24; ctx.quadraticCurveTo(lx + 6, -28 - r() * 20, lx + 12, 6 + r() * 12); ctx.quadraticCurveTo(lx + 20, 22, lx + 24, -6); } ctx.stroke();
    ctx.lineWidth = 2.2; ctx.strokeStyle = rgba('#ffffff', .6); ctx.stroke(); ctx.restore();
  };
  tag(-gw / 2 - 300, -90, 1.2, '#8f5fd6', 3); tag(-gw / 2 - 560, -70, .9, '#2fb8a8', 8); tag(gw / 2 + 280, -100, 1.1, '#e0508a', 5); tag(gw / 2 + 520, -60, .8, '#d9a021', 11);
  wqHeart(ctx, gw / 2 + 400, -120, 11, 'rgba(255,100,160,.7)'); wqStar5(ctx, -gw / 2 - 150, -130, 13, 'rgba(255,214,90,.7)');
  // pilares
  for (const sd of [-1, 1]) { const px = sd * (gw / 2 + 12); ctx.fillStyle = lg(ctx, px - 22, 0, px + 22, 0, [[0, mix(slab, rim, .15)], [1, mix(slab, shade, .5)]]); ctx.fillRect(px - 20, -230, 40, 230); ctx.fillStyle = mix(slab, rim, .3); ctx.fillRect(px - 26, -240, 52, 12); ctx.fillStyle = rgba(rim, .8); ctx.fillRect(px - 26, -240, 52, 1.6); ctx.fillStyle = rgba(shade, .4); ctx.fillRect(px - 20, -6, 40, 6); }
  // luminária no pilar
  const lx = gw / 2 + 12, ly = -262; ctx.fillStyle = metal; ctx.fillRect(lx - 3, -262, 6, 22); ctx.fillStyle = mix('#cfd6dc', '#fff3c0', nt); ctx.beginPath(); ctx.arc(lx, ly, 10, 0, TAU); ctx.fill();
  if (nt > .1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, lx, ly, 0, 200, [[0, `rgba(255,214,140,${.5 * nt})`], [1, 'rgba(255,214,140,0)']]); ctx.fillRect(lx - 200, ly - 200, 400, 400); ctx.restore(); }
  // letreiro/placa
  const sw = gw + 80; ctx.fillStyle = '#2b4a8a'; rrect(ctx, -sw / 2, -310, sw, 48, 8); ctx.fill(); ctx.strokeStyle = '#e8e4d4'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#f5f0dc'; ctx.font = `bold 26px ${(typeof FONTS !== 'undefined' && FONTS.comic) || 'sans-serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ESCOLA MUNICIPAL', 0, -286); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  // portão de ferro: duas folhas (abre em perspectiva)
  const leaf = (sd) => {
    const lw = (gw / 2 - 4), a = open * 0.85, cw = lw * Math.cos(a), hx = sd * (gw / 2 - 4), ex = hx - sd * cw, sk = Math.sin(a) * 18;
    ctx.fillStyle = rgba(wqC('win', m), .55); poly(ctx, [[hx, -6], [ex, -6 + sk * .3], [ex, -196 - sk], [hx, -196]]); ctx.fill();
    ctx.strokeStyle = mix(metal, rim, .1); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); const nb = 15; for (let i = 0; i <= nb; i++) { const u = i / nb, bx = lerp(hx, ex, u), sy = lerp(0, sk * .3, u), ty = lerp(0, -sk, u); ctx.moveTo(bx, -6 + sy); ctx.lineTo(bx, -196 + ty); } ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); for (const yy of [-190, -100, -14]) { ctx.moveTo(hx, yy); ctx.lineTo(ex, yy + (yy < -100 ? -sk : sk * .3) * (yy < -100 ? 1 : 1)); } ctx.stroke();
    ctx.strokeStyle = rgba(rim, .45); ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i <= nb; i++) { const u = i / nb, bx = lerp(hx, ex, u) - 1.5; ctx.moveTo(bx, -190); ctx.lineTo(bx, -12); } ctx.stroke();
    ctx.fillStyle = metal; for (let i = 0; i <= nb; i += 1) { const u = i / nb, bx = lerp(hx, ex, u), ty = lerp(0, -sk, u); poly(ctx, [[bx - 3, -196 + ty], [bx, -204 + ty], [bx + 3, -196 + ty]]); ctx.fill(); }
    return { ex, hx };
  };
  const L1 = leaf(-1), R1 = leaf(1);
  // corrente + cadeado
  if (lock > 0.02) {
    const cx = 0, cy = -104, sw2 = Math.sin(t * 1.5) * 1.5 * (1 - open);
    ctx.save(); ctx.globalAlpha *= clamp(lock * 1.5); ctx.strokeStyle = '#a7adb6'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    for (let k = 0; k < 2; k++) { const yy = -128 + k * 46; for (let i = -9; i < 9; i++) { const lx2 = i * 11 + sw2, ly2 = yy + Math.sin(i * .5) * 2 + Math.abs(i) * .4; ctx.strokeStyle = '#6d737d'; ctx.lineWidth = 4.2; ctx.beginPath(); if (i % 2) ctx.ellipse(lx2, ly2, 6.5, 3.6, 0, 0, TAU); else ctx.ellipse(lx2, ly2, 3.8, 6, 0, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#d6dae0'; ctx.lineWidth = 2.2; ctx.stroke(); } }
    ctx.translate(cx + sw2, cy); ctx.rotate(Math.sin(t * 1.7) * .03 * (1 - open));
    ctx.strokeStyle = '#d7dbe1'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -4, 13, Math.PI, 0); ctx.lineTo(13, 8); ctx.moveTo(-13, -4); ctx.lineTo(-13, 8); ctx.stroke(); ctx.strokeStyle = '#7a808a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = lg(ctx, 0, 6, 0, 46, [[0, '#ffe28a'], [1, '#d99a20']]); rrect(ctx, -20, 6, 40, 36, 7); ctx.fill(); ctx.strokeStyle = '#6a4a14'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.fillStyle = '#4a3410'; ctx.beginPath(); ctx.arc(0, 22, 4.4, 0, TAU); ctx.fill(); ctx.fillRect(-1.6, 24, 3.2, 10); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-15, 10, 5, 26);
    ctx.restore();
  }
  // piso da entrada
  ctx.fillStyle = rgba(shade, .3); ctx.fillRect(-gw / 2, 0, gw, 8);
  ctx.restore();
}
