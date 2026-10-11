'use strict';
/* ============================================================
   assets.js — cenários pré-renderizados: nebulosa pintada, cidade, esfera kintsugi, estrelas, grua de origami
   ============================================================ */

/* ---------- Nebulosa pintada à mão (pinceladas seguindo um campo de fluxo) ---------- */
let NEB = null;
function makeNebula() {
  const w = 2048, h = 1152, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), r = rng(2024);
  g.fillStyle = lg(g, 0, 0, w, h, [[0, '#06143d'], [.5, '#0d3a8a'], [1, '#081a4a']]); g.fillRect(0, 0, w, h);
  const cols = ['#1d6fe0', '#35c3ee', '#e0529f', '#f7a8cf', '#a58cf5', '#fff1c9', '#0b2a6b', '#ff8fbd', '#2a49c9'];
  for (let i = 0; i < 80; i++) {
    const x = r() * w, y = r() * h, rr = 160 + r() * 380, col = cols[Math.floor(r() * cols.length)];
    g.globalCompositeOperation = i % 4 === 0 ? 'screen' : 'source-over';
    g.fillStyle = rg(g, x, y, 0, rr, [[0, rgba(col, .34)], [1, rgba(col, 0)]]); g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  g.globalCompositeOperation = 'source-over'; g.lineCap = 'round';
  for (let i = 0; i < 4200; i++) {
    const x = r() * w, y = r() * h, n = noise2(x / 420, y / 420, 5), ang = noise2(x / 300, y / 300, 9) * TAU * 1.6;
    const ci = Math.floor(((n * 1.35 + noise2(x / 900, y / 900, 3) * .9) % 1) * cols.length), col = cols[ci];
    const len = 26 + r() * 90, wid = 5 + r() * 20;
    g.strokeStyle = rgba(col, .05 + r() * .13); g.lineWidth = wid;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(ang) * len * .6 + r() * 10, y + Math.sin(ang) * len * .6, x + Math.cos(ang + .4) * len, y + Math.sin(ang + .4) * len); g.stroke();
  }
  // núcleo quente (centro-direita) como na capa
  g.globalCompositeOperation = 'screen';
  g.fillStyle = rg(g, w * .58, h * .46, 0, 520, [[0, 'rgba(255,240,205,.9)'], [.3, 'rgba(255,170,205,.45)'], [1, 'rgba(255,170,205,0)']]); g.fillRect(0, 0, w, h);
  g.fillStyle = rg(g, w * .2, h * .8, 0, 480, [[0, 'rgba(60,200,240,.55)'], [1, 'rgba(60,200,240,0)']]); g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  // textura de tinta: pinceladas claras finas
  for (let i = 0; i < 900; i++) {
    const x = r() * w, y = r() * h, ang = noise2(x / 200, y / 200, 4) * TAU * 2, len = 14 + r() * 40;
    g.strokeStyle = `rgba(255,255,255,${.02 + r() * .05})`; g.lineWidth = 1 + r() * 3;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
  }
  // estrelas
  for (let i = 0; i < 520; i++) {
    const x = r() * w, y = r() * h, s = r() * r() * 2.4 + .4;
    g.fillStyle = `rgba(255,255,255,${.4 + r() * .6})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
  for (let i = 0; i < 46; i++) sparkle(g, r() * w, r() * h, 5 + r() * 12, 0, `rgba(255,250,235,${.6 + r() * .4})`);
  // circuitos dourados (da capa)
  g.strokeStyle = 'rgba(255,220,150,.75)'; g.fillStyle = 'rgba(255,220,150,.9)'; g.lineWidth = 2;
  for (let k = 0; k < 26; k++) {
    let x = w * (.35 + r() * .6), y = r() * h; g.beginPath(); g.moveTo(x, y);
    const steps = 3 + Math.floor(r() * 4);
    for (let s = 0; s < steps; s++) { x += (r() < .5 ? -1 : 1) * (40 + r() * 120); g.lineTo(x, y); y += (r() < .5 ? -1 : 1) * (30 + r() * 100); g.lineTo(x, y); }
    g.stroke(); g.beginPath(); g.arc(x, y, 5, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill();
  }
  NEB = c;
}
/* desenha a nebulosa cobrindo (x,y,w,h) com deslocamento/zoom suave */
function drawNebula(ctx, x, y, w, h, o = {}) {
  const z = o.z || 1, ox = o.ox || 0, oy = o.oy || 0, hu = o.hue || 0;
  const sw = NEB.width / z, sh = sw * h / w;
  const sx = clamp((NEB.width - sw) / 2 + ox, 0, NEB.width - sw), sy = clamp((NEB.height - sh) / 2 + oy, 0, NEB.height - sh);
  ctx.save(); if (hu) ctx.filter = `hue-rotate(${hu}deg)`;
  ctx.drawImage(NEB, sx, sy, sw, sh, x, y, w, h); ctx.restore();
}
/* fundo "cósmico" simples (céu) com estrelas piscando */
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

/* ---------- MORRO / favela em camadas de paralaxe ----------
   Cada camada tem blocos (pilhas de casinhas de n andares, rowH px cada), postes com fios, becos com escada.
   bloco: {x,w,h,nf,cols,rowH,floors[],roof,feat[],door,seed,...}.  winRect(li,wx,col,row) -> janela do andar `row` (0 = térreo). */
const CITY = (() => {
  const r = rng(11), defs = [
    { par: .22, fMin: 5, fMax: 9, wMin: 80, wMax: 140, fog: .62, rowH: 40 },
    { par: .5, fMin: 5, fMax: 11, wMin: 100, wMax: 170, fog: .32, rowH: 46 },
    { par: 1, fMin: 4, fMax: 12, wMin: 120, wMax: 200, fog: 0, rowH: 52 },
  ];
  return defs.map((d, li) => {
    const blocks = []; let x = -3200, bi = 0;
    while (x < 3200) {
      const w = Math.round(d.wMin + r() * (d.wMax - d.wMin)), env = noise2(x / 700, li * 3.1, 5);
      let nf = Math.round(d.fMin + env * (d.fMax - d.fMin) + (r() - .5) * 2.2);
      // vale baixo no centro da câmera inicial p/ a esfera aparecer
      if (li === 2 && x + w > -150 && x < 520) nf = Math.min(nf, 8);
      nf = Math.max(3, nf);
      const hero = li === 2 && x <= -60 && x + w >= -60;
      if (hero) nf = 10;
      const cols = Math.max(2, Math.round(w / (li === 2 ? 60 : li === 1 ? 52 : 44)));
      const floors = [];
      for (let f = 0; f < nf; f++) {
        const q = r();
        floors.push({ kind: q < .34 ? 1 : q < .72 ? 0 : 2, k: Math.floor(r() * 6), inL: f && r() < .5 ? 4 + Math.floor(r() * 18) : 0, inR: f && r() < .5 ? 4 + Math.floor(r() * 18) : 0, stain: r() });
      }
      if (hero) floors.forEach(fl => { fl.inL = fl.inR = 0; });
      // topo: obra inacabada (vergalhão), telhado de barro/fibrocimento, ou laje lisa
      const q = r(), top = hero ? 0 : q < .42 ? 0 : q < .66 ? 1 : 2; // 0 laje+vergalhão, 1 obra (pilares), 2 telhado
      const feat = [], slots = [.14, .36, .6, .84].sort(() => r() - .5);
      const want = hero ? ['tank', 'ant'] : top === 2 ? (r() < .5 ? ['ant'] : ['dish']) : ['tank', 'ant', 'dish', 'line', 'rebar', 'rebar'].filter(() => r() < .45);
      want.forEach((k, i) => { if (slots[i] != null) feat.push({ k, u: slots[i] }); });
      blocks.push({ x, w, h: nf * d.rowH, nf, cols, rowH: d.rowH, floors, top, feat, door: Math.floor(r() * cols), door2: r() < .4 ? Math.floor(r() * cols) : -1, seed: Math.floor(r() * 9999), graf: r(), hero, roofRebar: r(), bi: bi++ });
      let gap = r() < .5 ? 0 : 3;
      if (li > 0 && r() < (li === 2 ? .3 : .22)) { blocks[blocks.length - 1].alley = Math.round(54 + r() * 30); gap = blocks[blocks.length - 1].alley; }
      x += w + gap;
    }
    // postes com fios (gambiarra): cada poste liga ao próximo e "puxa" ligações clandestinas pros telhados
    const poles = []; let pi = 2 + Math.floor(r() * 2);
    while (pi < blocks.length - 3) {
      const b = blocks[pi], px = b.x + b.w * (.2 + r() * .6), ph = (li === 2 ? 330 : li === 1 ? 250 : 190) + r() * 60, drops = [];
      for (let k = 0; k < 4; k++) { const tb = blocks[clamp(pi + Math.round((r() - .5) * 7), 0, blocks.length - 1)]; drops.push([tb.x + tb.w * (.1 + r() * .8), -tb.h - 6, 8 + r() * 26, (r() - .5) * 40]); }
      poles.push({ x: px, ph, drops, tf: r() < .45, seed: Math.floor(r() * 999), bi: pi });
      pi += 3 + Math.floor(r() * 2);
    }
    return { ...d, blocks, poles };
  });
})();

/* paleta que interpola entre o mundo cinza (c=0) e o mundo colorido (c=1) */
const WALL_G = ['#abaeb3', '#9b9ea4', '#bbbdc0', '#8b8f96', '#a3a5aa', '#949799'];
const WALL_C = ['#ff7fb3', '#2fd8c9', '#ffd84d', '#b99dff', '#ff9d5e', '#72d3ff'];
const BRK_G = ['#8a817f', '#7b7372', '#938b89'], BRK_C = ['#d9613f', '#c9523a', '#e6744b'];
function pal(c, night = 0) {
  const n = night, tint = '#1b1752', nt = n * .5, memo = {};
  const fogc = mix(mix('#c7cbd0', '#d8a6e6', c), '#4a5fc0', n * .6);
  const dk = col => mix(col, mix('#2a2c34', '#1a0f4a', c), .3);
  const P = {
    skyTop: mix(mix('#98a0aa', '#0a1f5e', c), '#04091f', n * .6),
    skyBot: mix(mix('#e4e6e8', '#f6a7cb', c), '#2a3b8a', n * .5),
    fog: fogc,
    wall(kind, k, fog) { const key = kind + '_' + k + '_' + fog; if (memo[key]) return memo[key]; let col = kind === 1 ? mix(BRK_G[k % 3], BRK_C[k % 3], c) : mix(WALL_G[k % 6], WALL_C[k % 6], c); if (kind === 2 && c < 1) col = mix(WALL_G[(k + 2) % 6], WALL_C[(k + 2) % 6], c); col = mix(col, tint, nt); col = mix(col, fogc, fog * .8); return (memo[key] = col); },
    dk,
    shadeTo: mix(mix('#2a2c34', '#240f5c', c), '#08062a', n * .6),
    slab: mix(mix(mix('#a6a9ae', '#d9cdee', c), tint, nt), fogc, 0),
    seam: mix(mix('#2c2f35', '#0a1030', c), '#050820', n),
    win: mix(mix('#2e3239', '#150f48', c), '#070b24', n * .6),
    winLit: mix(mix('#cfc9ad', '#ffd87a', c), '#ffe29a', n),
    winLit2: mix('#cfc9ad', '#ff8ad0', c),
    frame: mix(mix('#4f535a', '#2a1a6a', c), '#0b0830', n * .5),
    iron: mix(mix('#3b3e45', '#1a1250', c), '#0b0830', n * .5),
    rebar: mix(mix('#50433f', '#7a3a2a', c), '#2b1a30', n * .5),
    wire: mix(mix('#2a2c30', '#0d0a2e', c), '#06051a', n * .5),
    pole: mix(mix('#6a6d73', '#6d5a9a', c), '#1b1752', nt),
    tank: mix(mix('#8d97a3', '#2fa4ff', c), '#1b1752', nt * .8),
    tankLid: mix(mix('#b2bac3', '#8ad8ff', c), '#1b1752', nt * .8),
    metal: mix(mix('#6a6e75', '#3a2a7a', c), '#0b0830', n * .5),
    dish: mix(mix('#c9ccd1', '#f6f0ff', c), '#1b1752', nt * .8),
    telha: mix(mix('#7f7471', '#e2653c', c), '#1b1752', nt * .8),
    fibra: mix(mix('#9aa0a8', '#69d0c8', c), '#1b1752', nt * .8),
    graf: c < .5 ? 'rgba(255,255,255,.22)' : '#fff6c8',
    graf2: c < .5 ? 'rgba(40,40,50,.22)' : '#2a1a6a',
  };
  P.near = P.wall(0, 0, 0); P.mid = P.wall(0, 1, .3); P.far = P.wall(0, 2, .6);
  P.nearR = P.shadeTo; P.c = c; P.n = n;
  return P;
}
const CLOTH_G = ['#c7c9cc', '#8e9299', '#e4e5e6', '#a2a5aa'], CLOTH_C = ['#ff4f8b', '#25d0c0', '#ffd23f', '#9b6bff', '#ff8a3d', '#4aa8ff'];

/* ---- pequenos elementos ---- */
function wire(ctx, x0, y0, x1, y1, sag) { ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); }
function drawTank(ctx, x, y, s, P) {
  ctx.fillStyle = P.wall(1, 0, 0); ctx.fillRect(x - 21 * s, y - 9 * s, 42 * s, 9 * s);
  ctx.fillStyle = P.shadeTo; ctx.globalAlpha = .3; ctx.fillRect(x - 21 * s, y - 9 * s, 42 * s, 3 * s); ctx.globalAlpha = 1;
  const ty = y - 9 * s - 36 * s;
  ctx.fillStyle = P.tank; rrect(ctx, x - 20 * s, ty, 40 * s, 36 * s, 5 * s); ctx.fill();
  ctx.fillStyle = P.shadeTo; ctx.globalAlpha = .28; rrect(ctx, x + 8 * s, ty, 12 * s, 36 * s, 5 * s); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = P.shadeTo; ctx.globalAlpha = .35; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath(); ctx.moveTo(x - 20 * s, ty + 12 * s); ctx.lineTo(x + 20 * s, ty + 12 * s); ctx.moveTo(x - 20 * s, ty + 24 * s); ctx.lineTo(x + 20 * s, ty + 24 * s); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = P.tankLid; rrect(ctx, x - 17 * s, ty - 5 * s, 34 * s, 7 * s, 3 * s); ctx.fill();
  ctx.fillStyle = P.tankLid; ctx.fillRect(x - 3 * s, ty - 9 * s, 6 * s, 5 * s);
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x - 15 * s, ty + 4 * s, 4 * s, 24 * s);
  ctx.strokeStyle = P.metal; ctx.lineWidth = Math.max(1, 2 * s); ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 9 * s); ctx.lineTo(x - 12 * s, y - 14 * s); ctx.moveTo(x + 14 * s, y - 9 * s); ctx.lineTo(x + 14 * s, y - 14 * s); ctx.stroke();
}
function drawAntenna(ctx, x, y, s, P) {
  ctx.strokeStyle = P.metal; ctx.lineWidth = Math.max(1, 1.8 * s); ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y - 44 * s);
  for (const [dy, hw] of [[44, 13], [36, 17], [28, 13], [21, 9]]) { ctx.moveTo(x - hw * s, y - dy * s); ctx.lineTo(x + hw * s, y - dy * s); }
  ctx.moveTo(x - 7 * s, y - 44 * s); ctx.lineTo(x - 7 * s, y - 21 * s); ctx.stroke();
}
function drawDish(ctx, x, y, s, P) {
  ctx.strokeStyle = P.metal; ctx.lineWidth = Math.max(1, 2 * s); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 20 * s); ctx.stroke();
  ctx.save(); ctx.translate(x, y - 24 * s); ctx.rotate(-.55);
  ctx.fillStyle = P.dish; ctx.beginPath(); ctx.ellipse(0, 0, 16 * s, 11 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.shadeTo; ctx.globalAlpha = .3; ctx.beginPath(); ctx.ellipse(3 * s, 1 * s, 12 * s, 8 * s, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = P.metal; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12 * s, -9 * s); ctx.stroke(); ctx.fillStyle = P.metal; ctx.fillRect(10 * s, -12 * s, 5 * s, 4 * s);
  ctx.restore();
}
function drawRebar(ctx, x, y, s, P, seed) {
  ctx.strokeStyle = P.rebar; ctx.lineWidth = Math.max(1, 2 * s); ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 4; i++) { const hh = (16 + hash2(i, seed, 3) * 18) * s, bx = x + i * 5 * s, bend = (hash2(i, seed, 4) - .5) * 8 * s; ctx.moveTo(bx, y); ctx.lineTo(bx, y - hh); ctx.lineTo(bx + bend, y - hh - 4 * s); }
  ctx.stroke();
  ctx.fillStyle = P.slab; ctx.fillRect(x - 3 * s, y - 4 * s, 24 * s, 4 * s);
}
function drawClothes(ctx, x0, x1, y, s, P, t, seed) {
  const c = P.c, n = Math.max(3, Math.round((x1 - x0) / (14 * s)));
  ctx.strokeStyle = P.metal; ctx.lineWidth = Math.max(1, 1.8 * s);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0, y - 30 * s); ctx.moveTo(x1, y); ctx.lineTo(x1, y - 30 * s); ctx.stroke();
  const sag = 6 * s, ly = y - 30 * s;
  ctx.lineWidth = Math.max(.8, 1.1 * s); ctx.beginPath(); wire(ctx, x0, ly, x1, ly, sag); ctx.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + .7) / (n + .4), px = lerp(x0, x1, u), py = ly + sag * 2 * u * (1 - u) * 1 + 1, hs = hash2(i, seed, 8);
    const col = mix(CLOTH_G[(i + seed) % 4], CLOTH_C[(i + seed) % 6], c), sw = Math.sin(t * 2.2 + i * 1.7) * 1.4 * s, w = (6 + hs * 7) * s, h = (10 + hash2(i, seed, 9) * 16) * s;
    ctx.fillStyle = mix(col, P.shadeTo, P.n * .35); ctx.beginPath(); ctx.moveTo(px - w / 2, py); ctx.lineTo(px + w / 2, py); ctx.lineTo(px + w / 2 + sw, py + h); ctx.lineTo(px - w / 2 + sw, py + h); ctx.fill();
  }
}
function drawKite(ctx, x, y, sz, col1, col2, rot, t, P) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = P.wire; ctx.globalAlpha = .6; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, sz * 1.1); ctx.quadraticCurveTo(-sz * 1.5, sz * 6, -sz * 4, sz * 12); ctx.stroke(); ctx.globalAlpha = 1;
  // rabiola
  ctx.strokeStyle = col2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, sz * 1.1); for (let i = 1; i <= 9; i++) ctx.lineTo(Math.sin(t * 5 + i * 1.1) * sz * .35 * Math.min(1, i / 3), sz * (1.1 + i * .55)); ctx.stroke();
  ctx.fillStyle = col1; poly(ctx, [[0, -sz * 1.15], [sz * .72, 0], [0, sz * 1.1], [-sz * .72, 0]]); ctx.fill();
  ctx.fillStyle = col2; poly(ctx, [[0, -sz * 1.15], [sz * .72, 0], [0, 0]]); ctx.fill(); poly(ctx, [[0, sz * 1.1], [-sz * .72, 0], [0, 0]]); ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,60,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -sz * 1.15); ctx.lineTo(0, sz * 1.1); ctx.moveTo(-sz * .72, 0); ctx.lineTo(sz * .72, 0); ctx.stroke();
  ctx.restore();
}
function drawGraffiti(ctx, kind, x, y, s, P) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.2;
  ctx.strokeStyle = P.graf; ctx.fillStyle = P.graf;
  if (kind === 0) { ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-18, -4, -8, -18, 0, -7); ctx.bezierCurveTo(8, -18, 18, -4, 0, 8); ctx.fill(); }
  else if (kind === 1) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 15; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  else if (kind === 2) { ctx.beginPath(); ctx.moveTo(-16, 8); ctx.lineTo(-16, -8); ctx.lineTo(-8, 0); ctx.lineTo(0, -12); ctx.lineTo(8, 0); ctx.lineTo(16, -8); ctx.lineTo(16, 8); ctx.closePath(); ctx.stroke(); }
  else { ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = i * .55, rr = 1.2 + i * .55; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.stroke(); ctx.strokeStyle = P.graf2; ctx.beginPath(); ctx.moveTo(-18, 14); ctx.quadraticCurveTo(0, 22, 18, 12); ctx.stroke(); }
  ctx.restore();
}

/* um bloco (pilha de casinhas), com chão em y=0, crescendo para cima. li = camada (0..2) */
function drawBlock(ctx, b, li, P, o = {}) {
  const { x, w, rowH } = b, fogL = li === 0 ? .62 : li === 1 ? .32 : 0, near = li === 2, mid = li === 1;
  const lit = o.lit == null ? .05 : o.lit, c = o.c || 0, t = o.t || 0, cw = w / b.cols, s = near ? 1 : mid ? .82 : .62;
  const bright = c > .3;
  for (let f = 0; f < b.nf; f++) {
    const fl = b.floors[f], x0 = x + fl.inL, x1 = x + w - fl.inR, top = -(f + 1) * rowH, ww = x1 - x0;
    const wc = P.wall(fl.kind, fl.k, fogL), sh = mix(wc, P.shadeTo, .26 + P.n * .1);
    ctx.fillStyle = wc; ctx.fillRect(x0, top, ww, rowH + 1);
    if (!(li === 0)) { ctx.fillStyle = sh; ctx.fillRect(x1 - ww * .13, top, ww * .13, rowH + 1); } // sombra lateral simples
    if (fl.kind === 1 && near) { // tijolo à vista
      ctx.strokeStyle = mix(wc, P.shadeTo, .5); ctx.globalAlpha = .55; ctx.lineWidth = 1; ctx.beginPath();
      for (let yy = top + 8, rr = 0; yy < top + rowH; yy += 8, rr++) { ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); for (let xx = x0 + (rr % 2 ? 9 : 0); xx < x1; xx += 18) { ctx.moveTo(xx, yy); ctx.lineTo(xx, yy - 8); } }
      ctx.stroke(); ctx.globalAlpha = 1;
    } else if (fl.kind === 1 && mid) { ctx.fillStyle = sh; ctx.globalAlpha = .3; for (let yy = top + 7; yy < top + rowH; yy += 14) ctx.fillRect(x0, yy, ww, 3); ctx.globalAlpha = 1; }
    else if (fl.kind === 0 && near && fl.stain > .35) { // reboco inacabado: manchas e tijolo aparente
      ctx.fillStyle = mix(wc, P.shadeTo, .18); ctx.globalAlpha = .6; const sx = x0 + ww * (.1 + hash2(f, b.seed, 1) * .5), sw = 20 + hash2(f, b.seed, 2) * 50; ctx.fillRect(sx, top + 6, sw, 18 + fl.stain * 20); ctx.globalAlpha = 1;
      if (fl.stain > .7) { ctx.fillStyle = P.wall(1, f, 0); ctx.fillRect(x0 + ww * .55, top + rowH * .55, 34, rowH * .4); ctx.strokeStyle = mix(P.wall(1, f, 0), P.shadeTo, .5); ctx.lineWidth = 1; ctx.beginPath(); for (let yy = top + rowH * .55 + 7; yy < top + rowH * .95; yy += 7) { ctx.moveTo(x0 + ww * .55, yy); ctx.lineTo(x0 + ww * .55 + 34, yy); } ctx.stroke(); }
    }
    // janelas e portas
    if (li > 0 || true) {
      for (let cc = 0; cc < b.cols; cc++) {
        const hs = hash2(cc, f, b.seed), dw = cw * .42, cx0 = x + cc * cw;
        if (f === 0 && (cc === b.door || cc === b.door2) && li > 0) { // porta de ferro
          const dh = rowH * .8, dx = cx0 + (cw - dw) / 2, col = c > .3 ? ['#1fb3a6', '#7a4bd6', '#e0407a', '#2a6bd6'][(b.seed + cc) % 4] : '#43464d';
          const dc = mix(mix('#43464d', col, c), '#1b1752', P.n * .5), dcf = mix(dc, P.fog, fogL * .8);
          ctx.fillStyle = P.frame; ctx.fillRect(dx - 2, -dh - 2, dw + 4, dh + 2); ctx.fillStyle = dcf; ctx.fillRect(dx, -dh, dw, dh);
          if (near) { ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let xx = dx + 5; xx < dx + dw; xx += 6) { ctx.moveTo(xx, -dh); ctx.lineTo(xx, 0); } ctx.stroke(); ctx.fillStyle = P.slab; ctx.fillRect(dx + dw - 8, -dh * .5, 3, 5); ctx.fillRect(dx - 3, 0, dw + 6, 3); }
          continue;
        }
        const forced = b.hero && f === 7 && cc === 0;
        const wx = cx0 + cw * .27, wy = top + rowH * .3, wW = cw * .46, wH = rowH * .46;
        if (!forced && (hs > .66 || wx < x0 + 4 || wx + wW > x1 - 4)) continue;
        const isLit = forced ? false : hs < lit * .66;
        if (isLit && bright && near) { ctx.fillStyle = rgba(P.winLit, .2); ctx.fillRect(wx - 5, wy - 5, wW + 10, wH + 10); }
        ctx.fillStyle = P.frame; ctx.fillRect(wx - 2, wy - 2, wW + 4, wH + 4);
        ctx.fillStyle = isLit ? (hs < lit * .15 && bright ? P.winLit2 : P.winLit) : P.win; ctx.fillRect(wx, wy, wW, wH);
        if (near) {
          if (!isLit) { ctx.fillStyle = 'rgba(255,255,255,.1)'; poly(ctx, [[wx, wy], [wx + wW * .5, wy], [wx, wy + wH * .7]]); ctx.fill(); }
          if (hs < .3) { ctx.strokeStyle = P.iron; ctx.lineWidth = 1.5; ctx.beginPath(); for (let xx = wx + wW / 4; xx < wx + wW - 1; xx += wW / 4) { ctx.moveTo(xx, wy); ctx.lineTo(xx, wy + wH); } ctx.moveTo(wx, wy + wH / 2); ctx.lineTo(wx + wW, wy + wH / 2); ctx.stroke(); }
          else if (isLit && hs < lit * .4) { ctx.fillStyle = mix(P.winLit, P.shadeTo, .35); ctx.fillRect(wx, wy, wW * .3, wH); }
          ctx.fillStyle = P.slab; ctx.fillRect(wx - 3, wy + wH + 2, wW + 6, 3);
        } else if (isLit && mid) { /* simples */ }
      }
    }
    // laje (lábio de concreto) no topo do andar
    ctx.fillStyle = P.slab; ctx.fillRect(x0 - 3, top - 4, ww + 6, 6);
    ctx.fillStyle = P.shadeTo; ctx.globalAlpha = .35; ctx.fillRect(x0, top + 2, ww, near ? 7 : 4); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x0 - 3, top - 4, ww + 6, 1.4);
  }
  const roofY = -b.nf * rowH - 4;
  // topo
  if (b.top === 1) { // obra inacabada: pilares com ferragem e laje de cima
    const px = [x + 8, x + w * .38, x + w * .7, x + w - 18];
    ctx.fillStyle = P.wall(0, 3, fogL); for (const xx of px) ctx.fillRect(xx, roofY - rowH * .82, 9 * s, rowH * .82);
    ctx.fillStyle = P.slab; ctx.fillRect(x + 4, roofY - rowH * .82 - 6 * s, w - 8, 6 * s);
    ctx.fillStyle = P.wall(1, b.seed, fogL); ctx.fillRect(x + w * .38 + 9 * s, roofY - rowH * .5, w * .32 - 9 * s, rowH * .5);
    if (near) { ctx.strokeStyle = P.rebar; ctx.lineWidth = 2; ctx.beginPath(); for (const xx of px) { ctx.moveTo(xx + 4, roofY - rowH * .82 - 6); ctx.lineTo(xx + 4, roofY - rowH * .82 - 22 - hash2(xx | 0, b.seed) * 10); } ctx.stroke(); }
  } else if (b.top === 2) { // telhado inclinado (fibrocimento ou barro)
    const col = b.seed % 2 ? P.telha : P.fibra, hh = 26 * s + 6;
    ctx.fillStyle = mix(col, fogL ? P.fog : col, fogL * .8); poly(ctx, [[x - 4, roofY + 2], [x + w + 4, roofY + 2], [x + w + 4, roofY - hh * .35], [x - 4, roofY - hh]]); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; poly(ctx, [[x - 4, roofY + 2], [x + w + 4, roofY + 2], [x + w + 4, roofY - hh * .35], [x + w * .4, roofY - hh * .7]]); ctx.fill();
    if (near) { ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1; ctx.beginPath(); for (let xx = x + 8; xx < x + w; xx += 12) { ctx.moveTo(xx, roofY + 2); ctx.lineTo(xx, roofY - hh + (xx - x) / w * hh * .65); } ctx.stroke(); }
  }
  const featY = b.top === 1 ? roofY - rowH * .82 - 6 * s : roofY + 2;
  if (li > 0 || near) for (const ft of b.feat) {
    const fx = x + ft.u * w;
    if (b.top === 2 && ft.k !== 'ant' && ft.k !== 'dish') continue;
    const fy = b.top === 2 ? roofY - 22 * s : featY;
    if (ft.k === 'tank') drawTank(ctx, fx, fy, s, P);
    else if (ft.k === 'ant') drawAntenna(ctx, fx, fy, s, P);
    else if (ft.k === 'dish') drawDish(ctx, fx, fy, s, P);
    else if (ft.k === 'rebar' && b.top !== 1) drawRebar(ctx, fx - 10 * s, fy, s, P, b.seed + (ft.u * 10 | 0));
    else if (ft.k === 'line' && b.top === 0) drawClothes(ctx, x + w * .12, x + w * .88, fy, s, P, t, b.seed);
  }
  // grafite discreto no térreo/andar 1
  if (near && b.graf < .45) drawGraffiti(ctx, b.seed % 4, x + w * (.3 + b.graf * .8), -rowH * 1.55, .9, P);
  // luzes de natal / pisca-pisca ao longo da laje
  if (c > .25 && li > 0) {
    const y = roofY + 4, nb = Math.max(4, Math.round(w / (near ? 17 : 22))), a = clamp(c * 1.2);
    ctx.strokeStyle = P.wire; ctx.lineWidth = 1; ctx.beginPath(); wire(ctx, x + 3, y, x + w - 3, y, 7 * s); ctx.stroke();
    const cols = ['#ff4f8b', '#ffd23f', '#25e0cf', '#ff9a3d', '#b48cff'];
    for (let i = 0; i <= nb; i++) {
      const u = i / nb, bx = x + 3 + (w - 6) * u, by = y + 14 * s * u * (1 - u) * 1 + 3, on = .55 + .45 * Math.sin(t * 5 + i * 2.1 + b.seed), col = cols[(i + b.seed) % 5];
      ctx.fillStyle = rgba(col, .22 * on * a); ctx.beginPath(); ctx.arc(bx, by, 6 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(mix(col, '#ffffff', .35), (.55 + .45 * on) * a); ctx.beginPath(); ctx.arc(bx, by, 2.1 * s, 0, TAU); ctx.fill();
    }
  }
  // sombra no pé do bloco e aresta
  ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x, -b.h, 2, b.h);
}
/* beco com escada entre duas casas (desenhado onde a lacuna `alley` aparece) */
function drawAlley(ctx, b, li, P, o = {}) {
  const gx = b.x + b.w, gw = b.alley, shaftH = Math.min(b.h, 300) * (li === 2 ? .85 : .8), near = li === 2, c = o.c || 0;
  ctx.fillStyle = mix(P.shadeTo, P.fog, li === 0 ? .5 : li === 1 ? .25 : 0); ctx.fillRect(gx, -shaftH, gw, shaftH);
  const sc = mix(P.slab, P.shadeTo, .12);
  let sx = gx, sy = 0; const flights = 3, rise = shaftH * .24, run = gw * .92; ctx.lineJoin = 'round';
  for (let fi = 0; fi < flights; fi++) {
    const dir = fi % 2 ? -1 : 1, x0 = dir > 0 ? gx + 2 : gx + gw - 2, x1 = dir > 0 ? gx + gw - 2 : gx + 2, y1 = -(fi + 1) * rise, y0 = -fi * rise, n = near ? 6 : 4;
    ctx.fillStyle = sc; poly(ctx, [[x0, y0], [x1, y1], [x1, y1 + 6], [x0, y0 + 6]]); ctx.fill();
    if (near) { ctx.strokeStyle = P.shadeTo; ctx.globalAlpha = .45; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 1; k < n; k++) { const u = k / n; ctx.moveTo(lerp(x0, x1, u), lerp(y0, y1, u)); ctx.lineTo(lerp(x0, x1, u), lerp(y0, y1, u) + 6); } ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = P.metal; ctx.lineWidth = near ? 2 : 1.4; ctx.beginPath(); ctx.moveTo(x0, y0 - 22); ctx.lineTo(x1, y1 - 22); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 - 22); ctx.stroke();
  }
  if (near && c > .25) { // lâmpada pendurada na viela
    const a = clamp(c * 1.2); ctx.strokeStyle = P.wire; ctx.beginPath(); ctx.moveTo(gx + gw / 2, -shaftH); ctx.lineTo(gx + gw / 2, -shaftH + 26); ctx.stroke();
    ctx.fillStyle = rgba('#ffd87a', .25 * a); ctx.beginPath(); ctx.arc(gx + gw / 2, -shaftH + 30, 22, 0, TAU); ctx.fill(); ctx.fillStyle = rgba('#fff2b0', a); ctx.beginPath(); ctx.arc(gx + gw / 2, -shaftH + 30, 4, 0, TAU); ctx.fill();
  }
}
function drawPole(ctx, p, li, P) {
  const s = li === 2 ? 1 : li === 1 ? .78 : .55, x = p.x, h = p.ph, ty = -h;
  ctx.fillStyle = P.pole; ctx.fillRect(x - 4 * s, ty, 8 * s, h);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x + 1.5 * s, ty, 2.5 * s, h);
  ctx.fillStyle = P.metal; ctx.fillRect(x - 28 * s, ty + 8 * s, 56 * s, 5 * s); ctx.fillRect(x - 20 * s, ty + 28 * s, 40 * s, 4 * s);
  if (p.tf) { ctx.fillStyle = P.dk(P.pole); rrect(ctx, x + 4 * s, ty + 46 * s, 22 * s, 32 * s, 5 * s); ctx.fill(); ctx.fillStyle = P.metal; ctx.fillRect(x + 4 * s, ty + 46 * s, 22 * s, 4 * s); }
}
function drawWires(ctx, L, li, P, camX, o) {
  const s = li === 2 ? 1 : li === 1 ? .78 : .55;
  ctx.strokeStyle = P.wire; ctx.lineWidth = Math.max(.9, 1.5 * s); ctx.lineCap = 'round';
  const vis = L.poles; ctx.beginPath();
  for (let i = 0; i < vis.length; i++) {
    const p = vis[i], sx = p.x - camX * L.par + W / 2; if (sx < -900 || sx > W + 900) continue;
    const n = vis[i + 1], ty = -p.ph;
    if (n) for (let k = 0; k < 6; k++) { const ox = (k - 2.5) * 10 * s, oy = (k < 3 ? 10 : 30) * s + (k % 3) * 2 * s; wire(ctx, p.x + ox, ty + oy, n.x + ox + (k % 2 ? 2 : -2), -n.ph + oy + (k % 3 - 1) * 4, (n.x - p.x) * (.05 + k * .006)); }
    for (const d of p.drops) wire(ctx, p.x + (d[3] > 0 ? 8 : -8) * s, ty + 12 * s, d[0], d[1], d[2] * s + Math.abs(d[0] - p.x) * .04);
  }
  ctx.stroke();
  // nós / emaranhado de fios nos postes + tênis pendurados
  ctx.lineWidth = Math.max(.8, 1.3 * s);
  for (const p of vis) {
    const sx = p.x - camX * L.par + W / 2; if (sx < -300 || sx > W + 300) continue;
    const ty = -p.ph; ctx.beginPath();
    for (let k = 0; k < 4; k++) { const a = hash2(k, p.seed, 2), bx = p.x + (a - .5) * 52 * s, by = ty + (14 + a * 24) * s; ctx.moveTo(bx + 7 * s, by); ctx.ellipse(bx, by, 7 * s, 4 * s + k * s, 0, 0, TAU * (.7 + a * .3)); }
    ctx.stroke();
    if (li === 2 && p.seed % 3 === 0) { const nx = vis[vis.indexOf(p) + 1]; if (nx) { const mx = (p.x + nx.x) / 2, my = -(p.ph + nx.ph) / 2 + (nx.x - p.x) * .05 + 12; ctx.strokeStyle = P.wire; ctx.beginPath(); ctx.moveTo(mx - 4, my); ctx.lineTo(mx - 4, my + 14); ctx.moveTo(mx + 6, my); ctx.lineTo(mx + 6, my + 17); ctx.stroke(); ctx.fillStyle = P.wire; rrect(ctx, mx - 11, my + 13, 13, 7, 3); ctx.fill(); rrect(ctx, mx + 0, my + 16, 13, 7, 3); ctx.fill(); } }
  }
}
function drawKites(ctx, camX, y0, c, P, t) {
  const KS = [[-260, 520, 17, 0], [420, 590, 21, 1], [980, 470, 15, 2], [1560, 560, 19, 3], [-760, 600, 18, 4]], cols = [['#ff4f8b', '#ffd23f'], ['#25d0c0', '#ffffff'], ['#ffd23f', '#9b6bff'], ['#ff8a3d', '#25d0c0'], ['#9b6bff', '#ff4f8b']];
  for (let i = 0; i < KS.length; i++) {
    const k = KS[i], x = W / 2 + k[0] - camX * .12 + Math.sin(t * .8 + i) * 8, y = y0 - k[1] + Math.sin(t * 1.1 + i * 2) * 6; if (x < -60 || x > W + 60) continue;
    drawKite(ctx, x, y, k[2], mix('#8d9097', cols[i][0], c), mix('#c9cbce', cols[i][1], c), Math.sin(t * .9 + i) * .22, t, P);
  }
}
/* camadas completas. camX = ponto-alvo da câmera, y0 = linha do chão na tela */
function drawCity(ctx, camX, y0, c, o = {}) {
  const P = pal(c, o.night || 0), t = o.t || 0, lit = o.lit == null ? (c > .5 ? .26 : .05) : o.lit;
  if (!(o.noLayer && o.noLayer.includes(3)) && !o.noKites) drawKites(ctx, camX, y0, c, P, t);
  for (let li = 0; li < 3; li++) {
    const L = CITY[li];
    if (o.noLayer && o.noLayer.includes(li)) continue;
    ctx.save(); ctx.translate(W / 2 - camX * L.par, y0 + (o.layerY ? o.layerY[li] : 0));
    const lo = camX * L.par - W / 2 - 80, hi = camX * L.par + W / 2 + 80;
    // massa do morro atrás (evita frestas de céu)
    ctx.fillStyle = li === 0 ? P.wall(0, 1, .62) : li === 1 ? P.wall(0, 3, .32) : P.wall(0, 3, 0);
    ctx.fillRect(lo, -L.rowH * 3.5, hi - lo, L.rowH * 3.5 + 200);
    for (const b of L.blocks) {
      if (b.x + b.w + (b.alley || 0) < lo || b.x > hi) continue;
      if (b.alley) drawAlley(ctx, b, li, P, { c });
      drawBlock(ctx, b, li, P, { lit, c, t });
    }
    if (li > 0 || true) { for (const p of L.poles) if (p.x > lo - 60 && p.x < hi + 60) drawPole(ctx, p, li, P); drawWires(ctx, L, li, P, camX, o); }
    ctx.restore();
    if (L.fog && o.fog !== 0) { // névoa entre camadas
      ctx.fillStyle = lg(ctx, 0, y0 - 520, 0, y0 + 40, [[0, rgba('#ffffff', 0)], [1, P.fog.replace('rgb', 'rgba').replace(')', `,${L.fog * .55})`)]]); ctx.fillRect(0, y0 - 520, W, 560);
    }
  }
}
function drawSky(ctx, c, night = 0, y0 = 0, y1 = H) {
  const P = pal(c, night); ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, P.skyTop], [1, P.skyBot]]); ctx.fillRect(0, y0, W, y1 - y0);
}


/* ---------- Esfera de porcelana com kintsugi (a "cápsula do coração" da capa) ---------- */
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
/* o = {crack:0..1 (rachaduras se espalhando), glow:0..1, shatter:0..1, spin} */
function drawSphere(ctx, x, y, R, o = {}) {
  const crack = o.crack == null ? 1 : o.crack, glow = o.glow == null ? 1 : o.glow, t = o.t || 0, shat = o.shatter || 0;
  ctx.save(); ctx.translate(x, y);
  if (shat > 0) { // explode em cacos
    const r = rng(77);
    for (let i = 0; i < 22; i++) {
      const a = r() * TAU, d = shat * R * (2 + r() * 6), sz = R * (.12 + r() * .24), rot = r() * TAU + shat * (r() - .5) * 8;
      ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(rot); ctx.globalAlpha = 1 - shat * .6;
      ctx.fillStyle = lg(ctx, -sz, -sz, sz, sz, [[0, '#fff7e6'], [1, '#b9a98a']]); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.5;
      poly(ctx, [[-sz, -sz * .4], [sz * .2, -sz], [sz, sz * .3], [-sz * .1, sz]]); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.restore(); return;
  }
  // brilho externo
  if (glow > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, R * .6, R * (2.2 + .3 * Math.sin(t * 3)), [[0, `rgba(255,200,110,${.55 * glow})`], [1, 'rgba(255,200,110,0)']]); ctx.fillRect(-R * 3, -R * 3, R * 6, R * 6); ctx.globalCompositeOperation = 'source-over'; }
  // corpo de porcelana
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
  ctx.fillStyle = rg(ctx, -R * .35, -R * .4, R * .1, R * 1.25, [[0, '#fffdf6'], [.55, '#e9e1d0'], [1, '#8f8a82']]); ctx.fillRect(-R, -R, R * 2, R * 2);
  // pintura floral/pássaros vermelhos e azuis
  const pr = rng(12); ctx.globalAlpha = .85;
  for (let i = 0; i < 9; i++) {
    const a = pr() * TAU, d = pr() * R * .85, px = Math.cos(a) * d, py = Math.sin(a) * d, s = R * (.06 + pr() * .06);
    ctx.fillStyle = i % 3 ? '#d6403c' : '#2e5fb8'; ctx.beginPath(); ctx.ellipse(px, py, s * 1.6, s, pr() * 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2e5fb8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + s * 2, py - s, px + s * 4, py + s); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // luz interna saindo pelas fendas
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, R, [[0, `rgba(255,236,180,${.95 * glow})`], [.5, `rgba(255,190,90,${.35 * glow})`], [1, 'rgba(255,190,90,0)']]); ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  // rachaduras (kintsugi dourado) se espalhando
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
  // brilho especular
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-R * .42, -R * .5, R * .16, R * .09, -.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,20,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.restore();
}

/* ---------- Grua de origami (tsuru) ---------- */
function drawCrane(ctx, x, y, s, flap = 0, o = {}) {
  const body = o.body || '#fff8ea', shade = o.shade || '#d8c9a8', edge = o.edge || '#3a3550', gold = o.gold;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.lineJoin = 'round'; ctx.lineWidth = 2.2 / Math.max(s, .3);
  const f = Math.sin(flap) * 28;
  const P = (pts, col) => { poly(ctx, pts); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = edge; ctx.stroke(); };
  P([[-4, 4], [-52, -16 - f * .35], [-30, 8]], shade); // asa de trás
  P([[-52, 6], [-34, -4], [-6, 4], [34, 4], [50, -14], [58, -22], [40, 8], [-6, 20]], body); // corpo
  P([[-6, 4], [-60, -34 - f], [-18, 18]], o.wing || '#f5ecd8'); // asa da frente
  P([[34, 4], [50, -14], [58, -22], [55, -14], [42, 6]], shade); // pescoço
  P([[-52, 6], [-70, 14], [-34, 6]], shade); // cauda
  P([[58, -22], [72, -17], [56, -17]], gold ? '#ffd36b' : '#e24a3b'); // bico
  if (gold) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, 90, [[0, 'rgba(255,220,140,.45)'], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(-100, -100, 200, 200); }
  ctx.restore();
}
