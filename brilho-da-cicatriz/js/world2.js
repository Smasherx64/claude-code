'use strict';
/* ============================================================
   world2.js — KIT de MATERIAIS, EFEITOS e INTERIORES (agente WORLD_FX)
   Roda depois de lib.js/world.js e antes de chars.js. Tudo determinístico (rng com semente).
   Todas as funções desenham em coordenadas lógicas 1280x720 (ctx já tem a escala SC; cam() pode estar ativa).
   Prefixos: fx* = efeitos/materiais · int* = interiores · _fx* = privado.

   ── MATERIAIS / CAPA ──────────────────────────────────────────────────────────
   fxConcrete(ctx,x,y,w,h,o)        parede de concreto (textura procedural cacheada). o:{tone:'night'|'day'|'warm', seed, light:0..1 (luz lateral),
                                    side:'left'|'right'|'top', lightCol:'r,g,b', vig:0..1, shade:0..1 (escurece o lado oposto), crop:{x,y,w,h}}
   fxCrack(ctx,spec,o)              rachadura/cicatriz. spec = seed (número) | array de pontos-âncora [[x,y],...] (o tronco passa por eles, com serrilhado).
                                    o:{p:0..1 progresso, w:largura base(px), glow:0..1 brilho dourado, t:tempo (pulso/poeira), seed, from:[x,y], to:[x,y],
                                       branches:0..1, chips:0..1 (lascas), dust:0..1, pulse:0..1, fall:0..1 (lascas caindo), edge:1/0 (relevo)}
                                    -> retorna {tip:[x,y], pts:[...tronco]}
   fxCrackPts(spec,o)               pontos do tronco (mesma geometria) p/ ancorar constelação/estrelas
   fxStar8(ctx,x,y,R,o)             estrela-bússola dourada de 8 pontas (a da capa). o:{rot,glow,a,t,pulse,rays:0/1,flare:0/1,facets:1}
   fxShards(ctx,x,y,t,o)            cacos de vidro dourados voando. t=progresso da explosão 0..1. o:{n,R,seed,time,g,fade,ang,spread,size}
   fxBurstWall(ctx,x,y,w,h,p,o)     parede de concreto estilhaçando (p 0..1). o:{bx,by (centro),tone,behind:fn(ctx),cols,rows,power,glow}
   fxCrackWall(ctx,cx,cy,t,o)       CENA-CAPA pronta: parede + rachadura vertical + estrela em (cx,cy) + cacos + constelação descendo.
                                    o:{p (crack 0..1),star (0..1),constel (0..1),shards (0..1),glow,tone,pulse,R}
   ── CARTOGRAFIA ─────────────────────────────────────────────────────────────
   fxConstellation(ctx,pts,prog,o)  linhas finas douradas ligando pontos + estrelinhas nos nós. pts [[x,y,size?],...] o:{edges,t,col,lw,labels,travel,twinkle}
   fxMapGrid(ctx,x,y,w,h,o)         grade de mapa + curvas de nível + rosa-dos-ventos. o:{a,col,contours:n,compass:bool,reveal:0..1,t,seed,cell}
   fxCompass(ctx,x,y,R,o)           bússola circular com agulha. o:{t,a,north}
   fxPin(ctx,x,y,label,t,o)         alfinete de mapa + etiqueta. o:{morph:0..1 (label→label2), label2:'PARTIDA', drop:0..1, col}
   fxHeartbeatLine(ctx,x,y,w,t,o)   eletrocardiograma; o.crack 0..1 transforma a linha em rachadura dourada. o:{amp,prog,crack,col,speed}
   ── REDE DE APOIO ───────────────────────────────────────────────────────────
   fxThread(ctx,x0,y0,x1,y1,o)      fio de luz com brilho e pulso viajante. o:{p,sag,w,col,t,pulse,sway}
   fxGoldNet(ctx,anchors,prog,t,o)  rede/teia dourada ligando âncoras (pessoas/lajes). o:{hub:[x,y] (centro da teia que pega), rings,sag,w,sway,glow,sparks}
   fxLantern(ctx,x,y,s,t,o)         lanterna de papel luminosa (flutuando). o:{col,glow,a}
   fxGlowKite(ctx,x,y,s,t,o)        pipa luminosa. o:{col,rot,hold:[x,y],glow,a}
   ── LUZ E COR ───────────────────────────────────────────────────────────────
   fxLightShafts(ctx,x,y,ang,len,o) feixes volumétricos saindo de (x,y). o:{n,spread,w,col,a,t,dust}
   fxGodRays(ctx,x,y,t,o)           raios radiais suaves girando. o:{n,len,col,a,sp}
   fxBokeh(ctx,t,seed,n,o)          bolhas de luz desfocadas. o:{cols:['r,g,b'],r0,r1,a,y0,y1,x0,x1,drift}
   fxGrade(ctx,preset,amount)       'nightTeal'|'dawnGold'|'dayFaded'|'kawaii'|'finale'
   fxDOF(ctx,drawFn,blur)           desenha drawFn(ctx2) num buffer e aplica desfoque (fundo fora de foco)
   fxVignette(ctx,s,col,o)          vinheta (cacheada) com cor e centro. o:{cx,cy}
   fxRain(ctx,t,o)                  chuva fina. o:{n,a,ang,len,speed,col,splash:y}
   fxDust(ctx,t,o)                  partículas de poeira/brilho flutuando. o:{x,y,w,h,n,col,a,seed,size}
   ── INTERIORES ──────────────────────────────────────────────────────────────
   intRoom(ctx,t,o)                 quarto de manhã, janela de vidro TRINCADO, feixe de sol, cama, despertador 5:00. o:{sun,ring,crack,time:'05:00',dust}
                                    -> {win:{x,y,w,h}, bed:{x,y,w,h}, clock:{x,y}, floorY}
   intKitchen(ctx,t,o)              cozinha: geladeira meio vazia, fogão, botijão, parede de boletos. o:{open:0..1,bills:0..1,light}
                                    -> {fridge:{x,y,w,h}, bills:{x,y,w,h}, stove:{x,y,w,h}, floorY}
   intChalkWall(ctx,t,o)            muro/quadro de giz da rua com desenhos animáveis. o:{p:0..1,tone,board:bool}
                                    -> {tip:[x,y], floorY, board:{x,y,w,h}}
   intFamilyTable(ctx,t,o)          mesa de jantar, cadeira vazia do pai, casaco no gancho. o:{light,steam}
                                    -> {chairPai:{x,y}, coat:{x,y}, table:{x,y,w,h}, floorY}
   intDoorway(ctx,t,o)              porta com luz quente da lâmpada acesa. o:{open:0..1,cx,floorY,glow,bulb}
                                    -> {door:{x,y,w,h}, floorY, spill:{x,y}}
   ============================================================ */

const FX_GOLD = '#ffc24d', FX_GOLD_RGB = '255,194,77';
function _fxCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const _fxCache = {};
function _fxFbm(x, y, s, oct = 4) { let a = .5, f = 1, v = 0, n = 0; for (let i = 0; i < oct; i++) { v += a * noise2(x * f, y * f, s + i * 17); n += a; f *= 2; a *= .5; } return v / n; }
const _fxLerpC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const _fxTone = {
  night: { base: [64, 76, 92], dark: [26, 34, 46], light: [112, 130, 150], brick: [74, 44, 46], lightCol: '110,170,230', stain: '10,18,28', tint: '#18304a' },
  day:   { base: [156, 154, 148], dark: [100, 98, 94], light: [212, 208, 198], brick: [150, 92, 76], lightCol: '255,236,200', stain: '60,56,50', tint: '#d8d0c0' },
  warm:  { base: [140, 116, 100], dark: [82, 62, 54], light: [210, 170, 134], brick: [140, 78, 58], lightCol: '255,190,110', stain: '50,30,22', tint: '#8a5a3a' },
};
function _fxSplit(poly0) { return poly0; }
/* ---------- textura de concreto 1280x720 (cacheada) ---------- */
function _fxConcTex(tone, seed, clean) {
  const key = 'conc' + tone + seed + (clean ? 'c' : ''); if (_fxCache[key]) return _fxCache[key];
  const T = _fxTone[tone] || _fxTone.night, r = rng(seed * 131 + 7), CW = 1280, CH = 720;
  const cv = _fxCanvas(CW, CH), g = cv.getContext('2d');
  // 1) manchas de baixa frequência + riscos verticais de umidade
  const lw = 320, lh = 180, lo = _fxCanvas(lw, lh), lc = lo.getContext('2d'), im = lc.createImageData(lw, lh);
  for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) {
    const v = _fxFbm(i / 46, j / 46, seed, 4), st = noise2(i / 5, j / 70, seed + 9), big = _fxFbm(i / 120 + 3, j / 90, seed + 5, 2);
    let k = clamp((v - .5) * 2.1 + .5 + (big - .5) * .5 - (st - .5) * .35);
    const c = k < .5 ? _fxLerpC(T.dark, T.base, k * 2) : _fxLerpC(T.base, T.light, (k - .5) * 2);
    const p = (j * lw + i) * 4; im.data[p] = c[0]; im.data[p + 1] = c[1]; im.data[p + 2] = c[2]; im.data[p + 3] = 255;
  }
  lc.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, CW, CH);
  // 2) juntas de fôrma (painéis) + furos de espaçador
  const pw = 426 + Math.floor(r() * 30), ph = 360, ox = Math.floor(r() * 160) - 80, oy = -Math.floor(r() * 90);
  for (let k = -1; k < 5; k++) { const x = ox + k * pw; g.fillStyle = `rgba(${T.stain},.34)`; g.fillRect(x, 0, 2.2, CH); g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(x + 2.2, 0, 1.4, CH); }
  for (let k = 0; k < 4; k++) { const y = oy + k * ph + 40; g.fillStyle = `rgba(${T.stain},.30)`; g.fillRect(0, y, CW, 2); g.fillStyle = 'rgba(255,255,255,.09)'; g.fillRect(0, y + 2, CW, 1.4); }
  for (let k = -1; k < 5; k++) for (let m = 0; m < 4; m++) for (const dx of [70, pw - 70]) {
    const x = ox + k * pw + dx, y = oy + m * ph + 40 + 66 + (m % 2) * 0;
    g.fillStyle = `rgba(${T.stain},.45)`; g.beginPath(); g.arc(x, y, 5.2, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(x + .8, y + 1.2, 5.2, .2, 2.4); g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,255,255,.2)'; g.stroke();
    g.fillStyle = `rgba(${T.stain},.22)`; g.beginPath(); g.ellipse(x, y + 18, 3, 24, 0, 0, TAU); g.fill();   // escorrido de ferrugem/umidade
  }
  // 3) escorridos longos de umidade
  for (let i = 0; i < 46; i++) {
    const x = r() * CW, y0 = r() * CH * .7, len = 80 + r() * 380, wd = 3 + r() * 26, a = .05 + r() * .09;
    g.fillStyle = lg(g, 0, y0, 0, y0 + len, [[0, `rgba(${T.stain},0)`], [.15, `rgba(${T.stain},${a})`], [.8, `rgba(${T.stain},${a * .8})`], [1, `rgba(${T.stain},0)`]]);
    g.beginPath(); g.moveTo(x - wd / 2, y0); g.quadraticCurveTo(x - wd * .2, y0 + len * .5, x - wd * .06, y0 + len); g.lineTo(x + wd * .06, y0 + len); g.quadraticCurveTo(x + wd * .2, y0 + len * .5, x + wd / 2, y0); g.fill();
  }
  // mofo/umidade embaixo
  g.fillStyle = lg(g, 0, CH * .66, 0, CH, [[0, `rgba(${T.stain},0)`], [1, `rgba(${T.stain},.42)`]]); g.fillRect(0, CH * .66, CW, CH * .34);
  g.fillStyle = lg(g, 0, 0, 0, 70, [[0, `rgba(${T.stain},.30)`], [1, `rgba(${T.stain},0)`]]); g.fillRect(0, 0, CW, 70);
  // 4) poros e granulado
  for (let i = 0; i < 9000; i++) {
    const x = r() * CW, y = r() * CH, s = .5 + r() * r() * 2.4;
    g.fillStyle = `rgba(${T.stain},${.16 + r() * .34})`; g.beginPath(); g.ellipse(x, y, s, s * (.7 + r() * .5), r() * 3, 0, TAU); g.fill();
    if (s > 1.2) { g.fillStyle = 'rgba(255,255,255,.17)'; g.beginPath(); g.arc(x + s * .5, y + s * .7, s * .55, 0, TAU); g.fill(); }
  }
  for (let i = 0; i < 7000; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.09)' : `rgba(${T.stain},.10)`; g.fillRect(r() * CW, r() * CH, 1 + r() * 2, 1 + r() * 2); }
  // 5) reboco soltando, mostrando tijolo
  const patches = [[.12 + r() * .1, .54 + r() * .16, 210 + r() * 90, 130 + r() * 60], [.66 + r() * .12, .1 + r() * .14, 150 + r() * 80, 100 + r() * 50], [.42 + r() * .1, .8, 120 + r() * 70, 70 + r() * 40]];
  for (const [px, py, pw2, ph2] of (clean ? [] : patches)) {
    const cx = px * CW, cy = py * CH, pts = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rr = .75 + r() * .45; pts.push([cx + Math.cos(a) * pw2 * rr * .5, cy + Math.sin(a) * ph2 * rr * .5]); }
    const path = () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 14; g.shadowOffsetX = 3; g.shadowOffsetY = 5; path(); g.fillStyle = '#000'; g.fill(); g.restore();
    g.save(); path(); g.clip();
    const bc = T.brick; g.fillStyle = `rgb(${bc[0]},${bc[1]},${bc[2]})`; g.fillRect(cx - pw2, cy - ph2, pw2 * 2, ph2 * 2);
    const bh = 15, bw = 34;
    for (let yy = cy - ph2, row = 0; yy < cy + ph2; yy += bh, row++) for (let xx = cx - pw2 - (row % 2) * bw / 2; xx < cx + pw2; xx += bw) {
      const v = r(), cc = _fxLerpC(bc, v < .5 ? T.dark : [bc[0] * 1.35, bc[1] * 1.2, bc[2] * 1.15], v * .5);
      g.fillStyle = `rgb(${cc[0] | 0},${cc[1] | 0},${cc[2] | 0})`; g.fillRect(xx + 1.5, yy + 1.5, bw - 3, bh - 3);
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(xx + 1.5, yy + 1.5, bw - 3, 2);
    }
    g.fillStyle = lg(g, 0, cy - ph2, 0, cy + ph2, [[0, 'rgba(0,0,0,.65)'], [.4, 'rgba(8,14,26,.3)'], [1, 'rgba(8,14,26,.4)']]); g.fillRect(cx - pw2, cy - ph2, pw2 * 2, ph2 * 2);
    g.restore();
    path(); g.lineWidth = 2.4; g.strokeStyle = `rgba(${T.light[0]},${T.light[1]},${T.light[2]},.55)`; g.save(); g.clip(); g.translate(-2, -2); path(); g.stroke(); g.restore();
    path(); g.lineWidth = 1.2; g.strokeStyle = `rgba(${T.stain},.6)`; g.stroke();
    for (let i = 0; i < 9; i++) { const p = pts[Math.floor(r() * pts.length)], a = r() * TAU; g.fillStyle = `rgba(${T.light[0]},${T.light[1]},${T.light[2]},.5)`; poly(g, [[p[0], p[1]], [p[0] + Math.cos(a) * 9, p[1] + Math.sin(a) * 9], [p[0] + Math.cos(a + 1.7) * 6, p[1] + Math.sin(a + 1.7) * 6]]); g.fill(); }
  }
  // 6) pichação suave (tag desbotada + coração + estrela)
  if (!clean) { g.save(); g.filter = 'blur(1.4px)'; g.globalAlpha = .13; g.lineCap = 'round'; g.lineJoin = 'round';
  const gc = tone === 'day' ? '40,60,110' : '170,200,235';
  g.strokeStyle = `rgb(${gc})`; g.lineWidth = 7;
  const gx = CW * (.55 + r() * .25), gy = CH * (.55 + r() * .15);
  g.beginPath(); g.moveTo(gx, gy); g.bezierCurveTo(gx + 40, gy - 70, gx + 90, gy + 40, gx + 130, gy - 40); g.bezierCurveTo(gx + 150, gy - 70, gx + 170, gy + 20, gx + 210, gy - 10); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(gx - 6, gy + 34); g.quadraticCurveTo(gx + 100, gy + 60, gx + 220, gy + 28); g.stroke();
  const hx = CW * .22, hy = CH * .3; g.beginPath(); g.moveTo(hx, hy + 22); g.bezierCurveTo(hx - 50, hy - 16, hx - 16, hy - 52, hx, hy - 20); g.bezierCurveTo(hx + 16, hy - 52, hx + 50, hy - 16, hx, hy + 22); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.arc(CW * .86, CH * .45, 26, 0, TAU * .85); g.stroke();
  g.restore(); }
  return (_fxCache[key] = cv);
}
/* ---------- fxConcrete ---------- */
function fxConcrete(ctx, x, y, w, h, o = {}) {
  const tone = o.tone || 'night', T = _fxTone[tone] || _fxTone.night, tex = _fxConcTex(tone, o.seed || 1, o.clean);
  const asp = w / h; let sx = 0, sy = 0, sw = 1280, sh = 720;
  if (o.crop) { sx = o.crop.x; sy = o.crop.y; sw = o.crop.w; sh = o.crop.h; }
  else if (asp > 1280 / 720) { sh = 1280 / asp; sy = (720 - sh) / 2; } else { sw = 720 * asp; sx = (1280 - sw) / 2; }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.drawImage(tex, sx, sy, sw, sh, x, y, w, h);
  const L = o.light == null ? .4 : o.light, side = o.side || 'left', lc = o.lightCol || T.lightCol, sd = o.shade == null ? .5 : o.shade;
  let gx0 = x, gy0 = y, gx1 = x + w, gy1 = y; if (side === 'right') { gx0 = x + w; gx1 = x; } if (side === 'top') { gx0 = x; gx1 = x; gy0 = y; gy1 = y + h; }
  if (L > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, gx0, gy0, gx1, gy1, [[0, `rgba(${lc},${.34 * L})`], [.55, `rgba(${lc},${.05 * L})`], [1, `rgba(${lc},0)`]]); ctx.fillRect(x, y, w, h);
    // rasante: realça relevo perto da fonte de luz
    ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = lg(ctx, gx0, gy0, gx1, gy1, [[0, `rgba(255,255,255,${.35 * L})`], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(x, y, w, h);
  }
  if (sd > 0) { ctx.globalCompositeOperation = 'multiply'; const m = 255 - 150 * sd; ctx.fillStyle = lg(ctx, gx0, gy0, gx1, gy1, [[0, 'rgb(255,255,255)'], [.45, 'rgb(255,255,255)'], [1, `rgb(${m*.7|0},${m*.82|0},${m|0})`]]); ctx.fillRect(x, y, w, h); }
  ctx.globalCompositeOperation = 'source-over';
  const vg = o.vig == null ? .5 : o.vig;
  if (vg > 0) { ctx.fillStyle = rg(ctx, x + w / 2, y + h / 2, Math.min(w, h) * .3, Math.max(w, h) * .78, [[0, 'rgba(4,8,16,0)'], [1, `rgba(4,8,16,${vg})`]]); ctx.fillRect(x, y, w, h); }
  ctx.restore();
}

/* ============================================================
   RACHADURA
   ============================================================ */
function _fxJag(a, b, r, amp, minSeg) { // linha serrilhada recursiva entre a e b
  const out = [a]; (function rec(p, q, am) {
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (d < minSeg) { out.push(q); return; }
    const nx = -(q[1] - p[1]) / d, ny = (q[0] - p[0]) / d, o = (r() - .5) * 2 * am * d, m = [(p[0] + q[0]) / 2 + nx * o, (p[1] + q[1]) / 2 + ny * o];
    rec(p, m, am * .78); rec(m, q, am * .78);
  })(a, b, amp); return out;
}
function _fxPlen(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return cum; }
function _fxCrackGeo(spec, o) {
  const seed = (typeof spec === 'number' ? spec : (o.seed || 3)), from = o.from || [W / 2, -30], to = o.to || [W / 2, H + 30];
  const key = 'crk' + seed + '|' + (typeof spec === 'number' ? from + '|' + to : spec.map(p => p.map(v => v | 0)).join(';')) + '|' + (o.density || 1);
  if (_fxCache[key]) return _fxCache[key];
  const r = rng(seed * 977 + 13), anchors = typeof spec === 'number' ? [from, to] : spec;
  let trunk = [anchors[0]];
  for (let i = 1; i < anchors.length; i++) { const s = _fxJag(anchors[i - 1], anchors[i], r, .17, 9); trunk = trunk.concat(s.slice(1)); }
  const tcum = _fxPlen(trunk), tl = tcum[tcum.length - 1], lines = [{ pts: trunk, cum: tcum, len: tl, t0: 0, t1: .86, order: 0 }];
  const dens = o.density || 1;
  function branch(pts0, ord, t0Base, maxLen) {
    const n = pts0.length;
    for (let i = 3; i < n - 2; i += 2 + Math.floor(r() * 3)) {
      if (r() > (ord === 0 ? .6 : .32) * dens) continue;
      const p = pts0[i], q = pts0[i + 1], ang0 = Math.atan2(q[1] - p[1], q[0] - p[0]), side = r() < .5 ? -1 : 1;
      const ang = ang0 + side * (.45 + r() * .9), len = maxLen * (.25 + r() * .6) * (ord === 0 ? 1 : .55);
      const e = [p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len], bp = _fxJag(p, e, r, .22, 7), cm = _fxPlen(bp);
      const t0 = ord === 0 ? (i / (n - 1)) * .86 : t0Base + (i / (n - 1)) * .06;
      const ln = { pts: bp, cum: cm, len: cm[cm.length - 1], t0, t1: Math.min(1, t0 + .1 + len / tl * 1.6), order: ord + 1 }; lines.push(ln);
      if (ord < 1) branch(bp, ord + 1, t0, len * .9);
    }
  }
  branch(trunk, 0, 0, tl * .2);
  // lascas ao longo do tronco
  const chips = [], nc = Math.floor(tl / 26);
  for (let i = 0; i < nc; i++) {
    const f = r(), k = Math.min(trunk.length - 2, Math.floor(f * (trunk.length - 1))), p = trunk[k], side = r() < .5 ? -1 : 1;
    chips.push({ x: p[0] + side * (3 + r() * 14), y: p[1] + (r() - .5) * 10, s: 3 + r() * r() * 11, rot: r() * TAU, f: f * .86, v: r(), side });
  }
  const dust = []; for (let i = 0; i < 40; i++) { const f = r(); dust.push({ f: f * .86, ph: r(), dx: (r() - .5) * 26, s: .6 + r() * 1.8, sw: r() * 6 }); }
  return (_fxCache[key] = { lines, trunk, tcum, tl, chips, dust, seed });
}
function _fxAt(ln, f) { // ponto na fração f do comprimento
  if (f <= 0) return ln.pts[0]; const L = ln.len * f; let i = 1; while (i < ln.cum.length - 1 && ln.cum[i] < L) i++;
  const a = ln.pts[i - 1], b = ln.pts[i], k = (L - ln.cum[i - 1]) / Math.max(.001, ln.cum[i] - ln.cum[i - 1]); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}
function fxCrackPts(spec, o = {}) { return _fxCrackGeo(spec, o).trunk; }
function fxCrack(ctx, spec, o = {}) {
  const G = _fxCrackGeo(spec, o), P = o.p == null ? 1 : o.p, w0 = o.w == null ? 4 : o.w, glow = (o.glow == null ? 0 : o.glow) * (1 + .22 * (o.pulse || 0)), t = o.t || 0;
  let tip = G.trunk[0];
  if (P <= 0) return { tip, pts: [] };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const bAmt = o.branches == null ? 1 : o.branches;
  const vis = G.lines.filter(l => P > l.t0 && (l.order === 0 || l.order <= 1 + (bAmt > .5 ? 1 : 0)) && (l.order === 0 || bAmt > 0));
  const pieces = vis.map(l => {
    const f = clamp((P - l.t0) / Math.max(.001, l.t1 - l.t0)), e = E.out2(f);
    const n = l.pts.length, cutL = l.len * e, pts = [l.pts[0]]; for (let i = 1; i < n; i++) { if (l.cum[i] <= cutL) pts.push(l.pts[i]); else { pts.push(_fxAt(l, e)); break; } }
    if (l.order === 0) tip = pts[pts.length - 1];
    return { l, pts, e, wf: [1, .55, .3][l.order] };
  });
  const stroke = (pc, wMul, style, comp, extra) => {
    ctx.globalCompositeOperation = comp || 'source-over';
    for (let i = 1; i < pc.pts.length; i++) {
      const fr = i / pc.pts.length, w = w0 * wMul * pc.wf * (1.15 - fr * .75) * (pc.l.order ? 1 : 1 + .2 * Math.sin(i * 1.7));
      ctx.lineWidth = Math.max(.4, w); ctx.strokeStyle = style; ctx.beginPath(); ctx.moveTo(pc.pts[i - 1][0] + (extra ? extra[0] : 0), pc.pts[i - 1][1] + (extra ? extra[1] : 0)); ctx.lineTo(pc.pts[i][0] + (extra ? extra[0] : 0), pc.pts[i][1] + (extra ? extra[1] : 0)); ctx.stroke();
    }
  };
  // sombra de profundidade + relevo (borda clara a montante)
  for (const pc of pieces) stroke(pc, 3.4, 'rgba(0,0,0,.20)');
  if (o.edge !== 0) for (const pc of pieces) { stroke(pc, 1.5, 'rgba(255,255,255,.16)', 'source-over', [-w0 * .55, -w0 * .4]); stroke(pc, 1.6, 'rgba(0,0,0,.4)', 'source-over', [w0 * .4, w0 * .4]); }
  for (const pc of pieces) stroke(pc, 1.25, '#04060a');
  if (glow > 0) {
    for (const pc of pieces) {
      stroke(pc, 7, `rgba(${FX_GOLD_RGB},${.022 * glow})`, 'lighter');
      stroke(pc, 3.4, `rgba(${FX_GOLD_RGB},${.07 * glow})`, 'lighter');
      stroke(pc, 1.6, `rgba(255,170,50,${.5 * glow})`, 'lighter');
      stroke(pc, .8, `rgba(255,205,110,${.8 * glow})`, 'lighter');
      stroke(pc, .3, `rgba(255,250,225,${.9 * glow})`, 'lighter');
    }
    // halo contínuo ao redor do tronco
    const tp = pieces[0].pts; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < tp.length; i += 3) { const a = tp[i]; ctx.fillStyle = rg(ctx, a[0], a[1], 0, w0 * 12, [[0, `rgba(${FX_GOLD_RGB},${.045 * glow})`], [1, `rgba(${FX_GOLD_RGB},0)`]]); ctx.fillRect(a[0] - w0 * 12, a[1] - w0 * 12, w0 * 24, w0 * 24); }
  }
  ctx.globalCompositeOperation = 'source-over';
  // lascas
  const chA = o.chips == null ? 1 : o.chips, fall = o.fall || 0;
  if (chA > 0) for (const c of G.chips) {
    if (c.f > P * .86 || c.v > chA) continue;
    const fy = fall * fall * (30 + c.v * 120) * (c.side > 0 ? 1 : .8), a = 1 - fall * .9;
    ctx.save(); ctx.translate(c.x + fall * c.side * 14, c.y + fy); ctx.rotate(c.rot + fall * c.side * 2); ctx.globalAlpha = Math.max(0, a);
    const s = c.s; ctx.fillStyle = 'rgba(14,20,30,.85)'; poly(ctx, [[-s, -s * .3], [s * .2, -s], [s, s * .5], [-s * .3, s * .8]]); ctx.fill();
    ctx.fillStyle = glow > 0 ? `rgba(255,205,110,${.5 * glow})` : 'rgba(255,255,255,.25)'; poly(ctx, [[-s, -s * .3], [s * .2, -s], [s * .1, -s * .5]]); ctx.fill(); ctx.restore();
  }
  // poeira caindo
  const dA = o.dust == null ? .6 : o.dust;
  if (dA > 0) for (const d of G.dust) {
    if (d.f > P * .86) continue; const ph = ((t * .22 + d.ph) % 1), pos = _fxAt({ pts: G.trunk, cum: G.tcum, len: G.tl }, d.f / .86);
    ctx.globalAlpha = dA * Math.sin(ph * Math.PI) * .7; ctx.fillStyle = glow > 0 ? `rgb(255,${200 + (d.s * 20 | 0)},120)` : 'rgb(160,172,188)';
    ctx.beginPath(); ctx.arc(pos[0] + d.dx * ph + Math.sin(ph * 6 + d.sw) * 3, pos[1] + ph * 70, d.s, 0, TAU); ctx.fill();
  }
  ctx.restore();
  return { tip, pts: pieces[0].pts };
}

/* ============================================================
   ESTRELA-BÚSSOLA DE 8 PONTAS
   ============================================================ */
function fxStar8(ctx, x, y, R, o = {}) {
  const rot = o.rot || 0, glow = o.glow == null ? 1 : o.glow, A = o.a == null ? 1 : o.a, t = o.t || 0, pul = o.pulse || 0;
  if (A <= 0 || R <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = A;
  if (glow > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rg(ctx, 0, 0, 0, R * 4.2, [[0, `rgba(255,214,130,${.4 * glow * (1 + .2 * pul)})`], [.25, `rgba(255,176,60,${.14 * glow})`], [1, 'rgba(255,150,40,0)']]); ctx.fillRect(-R * 4.2, -R * 4.2, R * 8.4, R * 8.4);
    if (o.rays !== 0) { // raios finos afilados
      const r = rng(8);
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU + rot + t * .05, len = R * (2.2 + r() * 3.4) * (1 + .1 * Math.sin(t * 3 + i)), wd = .012 + r() * .018;
        ctx.fillStyle = lg(ctx, 0, 0, Math.cos(a) * len, Math.sin(a) * len, [[0, `rgba(255,224,150,${.2 * glow})`], [1, 'rgba(255,200,100,0)']]);
        ctx.beginPath(); ctx.moveTo(Math.cos(a - wd) * R * .4, Math.sin(a - wd) * R * .4); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len); ctx.lineTo(Math.cos(a + wd) * R * .4, Math.sin(a + wd) * R * .4); ctx.fill();
      }
    }
    if (o.flare !== 0) { // flare anamórfico horizontal + vertical curto
      const L = R * 9 * (1 + .1 * pul);
      ctx.fillStyle = lg(ctx, -L, 0, L, 0, [[0, 'rgba(255,190,90,0)'], [.5, `rgba(255,240,205,${.9 * glow})`], [1, 'rgba(255,190,90,0)']]); ctx.fillRect(-L, -R * .02, L * 2, R * .04);
      ctx.fillStyle = lg(ctx, -L, 0, L, 0, [[0, 'rgba(255,170,70,0)'], [.5, `rgba(255,190,90,${.12 * glow})`], [1, 'rgba(255,170,70,0)']]); ctx.fillRect(-L, -R * .1, L * 2, R * .2);
      ctx.fillStyle = lg(ctx, 0, -R * 2.6, 0, R * 2.6, [[0, 'rgba(255,200,110,0)'], [.5, `rgba(255,236,190,${.5 * glow})`], [1, 'rgba(255,200,110,0)']]); ctx.fillRect(-R * .03, -R * 2.6, R * .06, R * 5.2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  // corpo facetado
  ctx.rotate(rot); const pts = []; const lightA = -2.2;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, Rr = i % 2 ? R * .6 : R; pts.push({ a, tx: Math.cos(a) * Rr, ty: Math.sin(a) * Rr }); }
  const rv = R * .17;
  ctx.lineJoin = 'round';
  for (let i = 0; i < 8; i++) {
    const p = pts[i], aL = p.a - Math.PI / 8, aR = p.a + Math.PI / 8, vL = [Math.cos(aL) * rv, Math.sin(aL) * rv], vR = [Math.cos(aR) * rv, Math.sin(aR) * rv];
    for (const [v, side] of [[vL, -1], [vR, 1]]) {
      const na = p.a + side * Math.PI / 2 * .5, shade = .5 + .5 * Math.cos(na - lightA - rot);
      const c = _fxLerpC([214, 130, 26], [255, 248, 196], Math.pow(shade, .8) * (i % 2 ? .88 : 1));
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(v[0], v[1]); ctx.lineTo(p.tx, p.ty); ctx.closePath(); ctx.fill();
    }
  }
  // brilho metálico correndo nos braços
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i += 2) { const p = pts[i], sh = .5 + .5 * Math.sin(t * 2.4 + i); ctx.fillStyle = lg(ctx, 0, 0, p.tx, p.ty, [[0, 'rgba(255,255,255,0)'], [.5 + .2 * sh, `rgba(255,250,220,${.28 * sh})`], [1, 'rgba(255,255,255,0)']]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(p.a - .2) * rv * 1.2, Math.sin(p.a - .2) * rv * 1.2); ctx.lineTo(p.tx, p.ty); ctx.lineTo(Math.cos(p.a + .2) * rv * 1.2, Math.sin(p.a + .2) * rv * 1.2); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(140,70,8,.7)'; ctx.lineWidth = Math.max(1, R * .018); ctx.beginPath(); pts.forEach((p, i) => { const a2 = p.a - Math.PI / 8, v = [Math.cos(a2) * rv, Math.sin(a2) * rv]; i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]); ctx.lineTo(p.tx, p.ty); }); ctx.closePath(); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, R * .3, [[0, `rgba(255,252,235,${.85})`], [.5, 'rgba(255,230,160,.3)'], [1, 'rgba(255,210,120,0)']]); ctx.fillRect(-R * .3, -R * .3, R * .6, R * .6);
  ctx.globalCompositeOperation = 'source-over'; ctx.rotate(-rot);
  ctx.fillStyle = '#fffbea'; ctx.beginPath(); ctx.arc(0, 0, R * .075, 0, TAU); ctx.fill();
  sparkle(ctx, 0, 0, R * .34 * (1 + .1 * pul), Math.PI / 4, 'rgba(255,255,255,.8)');
  ctx.restore();
}

/* ============================================================
   CACOS DE VIDRO / PAREDE ESTILHAÇANDO
   ============================================================ */
function fxShards(ctx, x, y, t, o = {}) {
  const n = o.n || 46, R = o.R || 460, seed = o.seed || 4, tm = o.time || 0, g = o.g == null ? .5 : o.g, ang0 = o.ang, spread = o.spread == null ? TAU : o.spread, sz = o.size || 1;
  if (t <= 0) return; const r = rng(seed * 53 + 1), e = E.out3(clamp(t));
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = (ang0 == null ? r() * TAU : ang0 + (r() - .5) * spread), sp = Math.pow(r(), .6), z = r(), size = (4 + z * z * z * 30) * sz, spin = (r() - .5) * 9, rot0 = r() * TAU, rr = r(), aspect = .35 + r() * .5;
    const d = R * sp * e + (t > 1 ? (t - 1) * 30 : 0), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + g * R * .5 * t * t * (.4 + z) + (o.drift ? Math.sin(tm * .8 + i) * 4 : 0);
    const fa = o.fade == null ? clamp((1.25 - t) * 2.2, 0, 1) : o.fade; if (fa <= 0) continue;
    const rot = rot0 + spin * e + tm * spin * .3;
    ctx.save(); ctx.globalAlpha = fa * (.5 + z * .4);
    if (e < .95 && sp > .25) { // rastro
      const d2 = R * sp * E.out3(clamp(t - .06)); ctx.strokeStyle = `rgba(255,214,130,${.25 * fa})`; ctx.lineWidth = Math.max(1, size * .18); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d2, y + Math.sin(a) * d2); ctx.lineTo(px, py); ctx.stroke();
    }
    ctx.translate(px, py); ctx.rotate(rot);
    const pts = rr < .5 ? [[-size, size * aspect * .6], [size * .2, -size * aspect], [size, size * aspect * .4]] : [[-size, -size * aspect * .3], [size * .1, -size * aspect], [size, size * aspect * .2], [-size * .2, size * aspect]];
    ctx.fillStyle = lg(ctx, -size, -size, size, size, [[0, '#fffbe6'], [.45, '#ffd36b'], [1, '#d9801a']]); poly(ctx, pts); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(.8, size * .06); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 0, size * 2.4, [[0, 'rgba(255,200,100,.22)'], [1, 'rgba(255,200,100,0)']]); ctx.fillRect(-size * 2.4, -size * 2.4, size * 4.8, size * 4.8);
    if (z > .7 && Math.sin(tm * 6 + i * 3) > .5) sparkle(ctx, pts[0][0], pts[0][1], size * .8, 0, '#fff');
    ctx.restore();
  }
  ctx.restore();
}
function fxBurstWall(ctx, x, y, w, h, p, o = {}) {
  const tone = o.tone || 'night', bx = o.bx == null ? x + w / 2 : o.bx, by = o.by == null ? y + h / 2 : o.by, cols = o.cols || 14, rows = o.rows || 8, power = o.power || 1;
  const glow = o.glow == null ? 1 : o.glow;
  if (p <= 0) { fxConcrete(ctx, x, y, w, h, o); return; }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // o que há atrás: ouro incandescente (ou cena do chamador)
  if (o.behind) o.behind(ctx); else {
    ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, '#3a2412'], [1, '#12090a']]); ctx.fillRect(x, y, w, h);
    ctx.fillStyle = rg(ctx, bx, by, 0, Math.max(w, h) * .75, [[0, '#fffbe8'], [.18, '#ffd36b'], [.5, 'rgba(255,150,40,.6)'], [1, 'rgba(255,120,30,0)']]); ctx.globalAlpha = clamp(p * 5); ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  }
  const tex = _fxConcTex(tone, o.seed || 1), asp = w / h; let sx = 0, sy = 0, sw = 1280, sh = 720;
  if (asp > 1280 / 720) { sh = 1280 / asp; sy = (720 - sh) / 2; } else { sw = 720 * asp; sx = (1280 - sw) / 2; }
  const r = rng(77 + (o.seed || 1)), cw = w / cols, ch = h / rows, grid = [];
  for (let j = 0; j <= rows; j++) { grid[j] = []; for (let i = 0; i <= cols; i++) grid[j][i] = [x + i * cw + ((i > 0 && i < cols) ? (r() - .5) * cw * .7 : 0), y + j * ch + ((j > 0 && j < rows) ? (r() - .5) * ch * .7 : 0)]; }
  const maxD = Math.hypot(Math.max(bx - x, x + w - bx), Math.max(by - y, y + h - by)), tris = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i], sw2 = r() < .5;
    tris.push(sw2 ? [a, b, d] : [a, b, c], sw2 ? [b, c, d] : [a, c, d]);
  }
  for (const tr of tris.sort((A, B) => Math.hypot((A[0][0] + A[1][0] + A[2][0]) / 3 - bx, (A[0][1] + A[1][1] + A[2][1]) / 3 - by) < Math.hypot((B[0][0] + B[1][0] + B[2][0]) / 3 - bx, (B[0][1] + B[1][1] + B[2][1]) / 3 - by) ? 1 : -1)) {
    const cx = (tr[0][0] + tr[1][0] + tr[2][0]) / 3, cy = (tr[0][1] + tr[1][1] + tr[2][1]) / 3, dx = cx - bx, dy = cy - by, dist = Math.hypot(dx, dy) || 1;
    const delay = (dist / maxD) * .32 + r() * .06, u = clamp((p - delay) / (1 - delay)), e = E.in2(u), rv = r();
    const dd = e * (260 + rv * 520) * power, rot = e * (rv - .5) * 3.2, sc = 1 + e * (.5 + rv * 1.2), al = 1 - clamp((u - .55) / .45);
    if (al <= 0) continue;
    ctx.save(); ctx.globalAlpha = al; ctx.translate(cx + dx / dist * dd, cy + dy / dist * dd + e * e * 160 * power); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    ctx.beginPath(); tr.forEach((v, k) => { const vx = v[0] + (v[0] - cx) * .02 + (v[0] > cx ? .6 : -.6), vy = v[1] + (v[1] - cy) * .02 + (v[1] > cy ? .6 : -.6); k ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy); }); ctx.closePath(); ctx.clip();
    ctx.drawImage(tex, sx, sy, sw, sh, x, y, w, h);
    ctx.fillStyle = rg(ctx, bx, by, 0, maxD * .9, [[0, `rgba(255,190,80,${.35 * glow * clamp(u * 6 + p * .5)})`], [1, 'rgba(255,190,80,0)']]); ctx.globalCompositeOperation = 'lighter'; ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = al * clamp(u * 8) * clamp(1 - u * 1.3) * glow * .6; ctx.translate(cx + dx / dist * dd, cy + dy / dist * dd + e * e * 160 * power); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,214,120,.8)'; ctx.lineWidth = 1.6; poly(ctx, tr); ctx.stroke(); ctx.restore();
  }
  // clarão central
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, bx, by, 0, 380 * (.4 + p), [[0, `rgba(255,248,220,${.9 * (1 - p * .6)})`], [1, 'rgba(255,200,100,0)']]); ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/* ---------- a CAPA ---------- */
function fxCrackWall(ctx, cx, cy, t, o = {}) {
  const P = o.p == null ? 1 : o.p, S = o.star == null ? 1 : o.star, C = o.constel == null ? 1 : o.constel, SH = o.shards == null ? 0 : o.shards, glow = o.glow == null ? 1 : o.glow;
  const pulse = o.pulse == null ? Math.max(0, Math.sin(t * Math.PI * 2 / .75)) ** 4 : o.pulse, R = o.R || 150, tone = o.tone || 'night';
  ctx.save();
  fxConcrete(ctx, 0, 0, W, H, { tone, seed: o.seed || 2, light: .35 + .25 * S, side: 'left', lightCol: tone === 'night' ? '120,170,230' : null, vig: .6 });
  // anchors do tronco: topo → estrela → base
  const anchors = [[cx + 110, -40], [cx + 28, cy * .5], [cx, cy], [cx - 30, cy + (H - cy) * .42], [cx - 12, cy + (H - cy) * .75], [cx - 60, H + 40]];
  // luz da estrela lavando a parede
  if (S > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, cx, cy, 0, 620, [[0, `rgba(255,190,90,${.3 * S * glow})`], [.4, `rgba(255,150,50,${.08 * S * glow})`], [1, 'rgba(255,150,50,0)']]); ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  // fenda alargando em volta da estrela (abertura irregular, serrilhada)
  if (S > 0 && P > .3) {
    const k = E.out3(clamp((P - .3) / .5)) * S, hh = R * 1.7 * k, ww = R * .16 * k, rj = rng(41), nL = _fxJag([cx + 4, cy - hh], [cx - 3, cy + hh], rj, .06, 14), pts = [];
    nL.forEach((p, i) => { const f = i / (nL.length - 1), wv = Math.sin(f * Math.PI) ** .8 * ww * (.55 + rj() * .9); pts.push([p[0] - wv, p[1]]); });
    for (let i = nL.length - 1; i >= 0; i--) { const f = i / (nL.length - 1), wv = Math.sin(f * Math.PI) ** .8 * ww * (.55 + rj() * .9); pts.push([nL[i][0] + wv, nL[i][1]]); }
    ctx.save(); poly(ctx, pts); ctx.fillStyle = '#0b0805'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = rg(ctx, cx, cy, 0, hh * 1.1, [[0, '#fffbe6'], [.25, '#ffd679'], [.7, '#c9701a'], [1, '#3a1a08']]); ctx.globalAlpha = .95 * glow; ctx.fillRect(cx - ww * 3, cy - hh, ww * 6, hh * 2); ctx.restore();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,214,130,${.45 * glow})`; ctx.lineWidth = 1.5; poly(ctx, pts); ctx.stroke(); ctx.restore();
  }
  const cr = fxCrack(ctx, anchors, { p: P, w: 7, glow: glow * (.4 + .35 * S), t, pulse, seed: o.seed || 6, density: .7, fall: o.fall || 0 });
  // constelação descendo pela rachadura (mapa)
  if (C > 0) {
    const trunk = fxCrackPts(anchors, { seed: o.seed || 6, density: .7 }), n = 13, pts = [], rr = rng(21);
    for (let i = 0; i < n; i++) {
      const f = .34 + i / (n - 1) * .62, tp = trunk[Math.min(trunk.length - 1, Math.floor(f * (trunk.length - 1)))], side = i % 2 ? 1 : -1;
      pts.push([tp[0] + side * (28 + rr() * 60) * (.6 + (i % 3) * .4), tp[1] + (rr() - .5) * 20, 1.2 + rr() * 2.2]);
    }
    const edges = []; for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]); edges.push([2, 4], [5, 7], [8, 10]);
    // trilha de mapa: pontilhado sobre a fenda
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.setLineDash([2, 9]); ctx.strokeStyle = `rgba(255,214,130,${.45 * C})`; ctx.lineWidth = 2; ctx.beginPath();
    trunk.forEach((p, i) => { if (p[1] > cy + R * .8) i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
    fxConstellation(ctx, pts, C, { edges, t, lw: 1.3, twinkle: 1 });
  }
  if (SH > 0) fxShards(ctx, cx, cy, SH, { n: 54, R: o.shardR || 520, seed: 9, time: t, g: .35, fade: o.shardFade });
  if (S > 0) fxStar8(ctx, cx, cy, R * S * (1 + .06 * pulse), { t, pulse, glow: glow });
  ctx.restore();
  return cr;
}

/* ============================================================
   CARTOGRAFIA
   ============================================================ */
function fxConstellation(ctx, pts, prog, o = {}) {
  const edges = o.edges || pts.slice(1).map((_, i) => [i, i + 1]), t = o.t || 0, lw = o.lw || 1.4, col = o.col || FX_GOLD_RGB, tw = o.twinkle == null ? 1 : o.twinkle;
  if (prog <= 0) return;
  const ne = edges.length, f = prog * ne;
  ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
  const shown = new Set();
  edges.forEach((e, k) => {
    const u = clamp(f - k); if (u <= 0) return; const a = pts[e[0]], b = pts[e[1]]; shown.add(e[0]); if (u > .98) shown.add(e[1]);
    const x1 = a[0] + (b[0] - a[0]) * E.out2(u), y1 = a[1] + (b[1] - a[1]) * E.out2(u);
    ctx.strokeStyle = `rgba(${col},.14)`; ctx.lineWidth = lw * 4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = `rgba(${col},.8)`; ctx.lineWidth = lw; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,248,225,.6)'; ctx.lineWidth = lw * .4; ctx.stroke();
    if (u < 1) { sparkle(ctx, x1, y1, 5 + lw * 2, t * 3, 'rgba(255,250,230,.9)'); }
  });
  pts.forEach((p, i) => {
    if (!shown.has(i)) return; const s = (p[2] || 2.2) * (1 + (tw ? .25 * Math.sin(t * 3 + i * 1.9) : 0)), born = clamp((f - i * ne / pts.length) * 4 + 1, 0, 1);
    ctx.fillStyle = rg(ctx, p[0], p[1], 0, s * 7, [[0, `rgba(${col},.55)`], [1, `rgba(${col},0)`]]); ctx.fillRect(p[0] - s * 7, p[1] - s * 7, s * 14, s * 14);
    sparkle(ctx, p[0], p[1], s * 4.2 * born, Math.PI / 4 * (i % 2), 'rgba(255,248,225,.95)');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], s * .8, 0, TAU); ctx.fill();
    if (o.labels && o.labels[i]) { ctx.globalCompositeOperation = 'source-over'; ctx.font = '600 13px "Lilita One", sans-serif'; ctx.fillStyle = `rgba(255,226,160,.85)`; ctx.fillText(o.labels[i], p[0] + 12, p[1] - 8); ctx.globalCompositeOperation = 'lighter'; }
  });
  if (o.travel != null && prog >= 1) { // pontinho de luz percorrendo a rota
    const u = (o.travel % 1) * ne, k = Math.min(ne - 1, Math.floor(u)), e = edges[k], a = pts[e[0]], b = pts[e[1]], q = u - k;
    ctx.fillStyle = rg(ctx, 0, 0, 0, 1, [[0, '#fff'], [1, '#fff']]); const px = a[0] + (b[0] - a[0]) * q, py = a[1] + (b[1] - a[1]) * q;
    ctx.fillStyle = rg(ctx, px, py, 0, 18, [[0, 'rgba(255,255,255,.95)'], [.3, `rgba(${col},.5)`], [1, `rgba(${col},0)`]]); ctx.fillRect(px - 18, py - 18, 36, 36);
  }
  ctx.restore();
}
function _fxContour(ctx, cx, cy, rx, ry, seed, k) { // curva de nível orgânica
  ctx.beginPath(); const n = 64;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = 1 + (noise2(Math.cos(a) * 1.3 + 4, Math.sin(a) * 1.3 + 4, seed + k) - .5) * .55; const px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath();
}
function fxCompass(ctx, x, y, R, o = {}) {
  const t = o.t || 0, A = o.a == null ? 1 : o.a, col = o.col || '255,214,140';
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = A; ctx.strokeStyle = `rgba(${col},.8)`; ctx.lineWidth = Math.max(1, R * .03);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.lineWidth = Math.max(.8, R * .015); ctx.beginPath(); ctx.arc(0, 0, R * .86, 0, TAU); ctx.stroke();
  for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, l = i % 18 === 0 ? .2 : i % 9 === 0 ? .13 : .06; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * (.86 - l * .5), Math.sin(a) * R * (.86 - l * .5)); ctx.lineTo(Math.cos(a) * R * .86, Math.sin(a) * R * .86); ctx.stroke(); }
  ctx.fillStyle = `rgba(${col},.9)`; ctx.font = `${Math.max(9, R * .22)}px "Lilita One", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [['N', 0], ['L', 1], ['S', 2], ['O', 3]].forEach(([c, k]) => ctx.fillText(c, Math.sin(k * Math.PI / 2) * R * 1.18, -Math.cos(k * Math.PI / 2) * R * 1.18));
  const nd = (o.north == null ? -.4 : o.north) + Math.sin(t * 1.7) * .08 + Math.sin(t * 5) * .02;
  ctx.rotate(nd); ctx.fillStyle = '#ff6b4a'; poly(ctx, [[0, -R * .78], [R * .09, 0], [-R * .09, 0]]); ctx.fill(); ctx.fillStyle = `rgba(${col},.95)`; poly(ctx, [[0, R * .78], [R * .09, 0], [-R * .09, 0]]); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, R * .06, 0, TAU); ctx.fill();
  ctx.restore();
}
function fxMapGrid(ctx, x, y, w, h, o = {}) {
  const A = o.a == null ? .35 : o.a, col = o.col || '255,214,140', t = o.t || 0, cell = o.cell || 64, seed = o.seed || 3, reveal = o.reveal == null ? 1 : o.reveal;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (reveal < 1) { ctx.beginPath(); ctx.rect(x, y, w * reveal, h); ctx.clip(); }
  ctx.globalAlpha = A; ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${col},.55)`; ctx.beginPath();
  for (let gx = x - (x % cell); gx <= x + w; gx += cell) { ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); } for (let gy = y - (y % cell); gy <= y + h; gy += cell) { ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); } ctx.stroke();
  ctx.lineWidth = .6; ctx.strokeStyle = `rgba(${col},.3)`; ctx.beginPath(); for (let gx = x - (x % cell) + cell / 2; gx <= x + w; gx += cell) { ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); } for (let gy = y - (y % cell) + cell / 2; gy <= y + h; gy += cell) { ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); } ctx.stroke();
  ctx.fillStyle = `rgba(${col},.8)`; for (let gx = x - (x % cell); gx <= x + w; gx += cell) for (let gy = y - (y % cell); gy <= y + h; gy += cell) ctx.fillRect(gx - 1.5, gy - 1.5, 3, 1);
  const nc = o.contours == null ? 3 : o.contours, r = rng(seed);
  for (let c = 0; c < nc; c++) { const cx = x + w * (.2 + r() * .6), cy = y + h * (.2 + r() * .6); for (let k = 0; k < 7; k++) { ctx.lineWidth = k % 3 === 0 ? 1.4 : .8; ctx.strokeStyle = `rgba(${col},${k % 3 === 0 ? .8 : .5})`; _fxContour(ctx, cx, cy, 30 + k * 34, 20 + k * 24, seed + c * 5, k * .15); ctx.stroke(); } }
  ctx.restore();
  if (o.compass !== false) fxCompass(ctx, x + w - 70, y + h - 70, 38, { t, a: A * 1.8, col });
}
function fxPin(ctx, x, y, label, t, o = {}) {
  const drop = o.drop == null ? 1 : o.drop, morph = o.morph || 0, col = o.col || '#ff5a4a', label2 = o.label2 || 'PARTIDA';
  ctx.save(); ctx.translate(x, y);
  // ondas no chão
  for (let i = 0; i < 3; i++) { const ph = ((t * .8 + i / 3) % 1); ctx.strokeStyle = `rgba(255,214,130,${(1 - ph) * .6 * drop})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 10 + ph * 70, 4 + ph * 22, 0, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 4, 0, 0, TAU); ctx.fill();
  const by = -Math.abs(Math.sin(drop * 2.2)) * (1 - drop) * 160 - (drop >= 1 ? 4 + Math.sin(t * 3) * 2 : 0);
  ctx.translate(0, by); const col2 = morph > .5 ? '#ffc24d' : col;
  ctx.fillStyle = col2; ctx.strokeStyle = 'rgba(70,10,0,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-26, -26, -22, -66, 0, -66); ctx.bezierCurveTo(22, -66, 26, -26, 0, 0); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-8, -48, 5, 10, .4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(0, -44, 8, 0, TAU); ctx.fill();
  if (morph > .5) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, -44, 0, 60, [[0, 'rgba(255,214,130,.6)'], [1, 'rgba(255,214,130,0)']]); ctx.fillRect(-60, -104, 120, 120); ctx.globalCompositeOperation = 'source-over'; }
  const txt = (s, a, dy) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = '22px "Lilita One", sans-serif'; const tw = ctx.measureText(s).width + 28; ctx.translate(0, -92 + dy);
    ctx.fillStyle = morph > .5 ? '#ffe9b0' : '#fffaf0'; ctx.strokeStyle = morph > .5 ? '#c9801a' : '#3a2a44'; ctx.lineWidth = 3; rrect(ctx, -tw / 2, -18, tw, 36, 10); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 18); ctx.lineTo(0, 28); ctx.lineTo(8, 18); ctx.fillStyle = ctx.fillStyle; ctx.fill();
    ctx.fillStyle = '#3a2a44'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 1); ctx.restore(); };
  txt(label, 1 - clamp(morph * 2), -morph * 8); txt(label2, clamp(morph * 2 - 1), (1 - morph) * 8);
  ctx.restore();
}
function fxHeartbeatLine(ctx, x, y, w, t, o = {}) {
  const amp = o.amp == null ? 60 : o.amp, prog = o.prog == null ? 1 : o.prog, crack = o.crack || 0, sp = o.speed == null ? 1 : o.speed, col = o.col || '120,255,200';
  const per = 230, N = 260, ph = (t * 160 * sp), pts = [], r = rng(5);
  const ecg = u => { // 0..1 dentro de um ciclo
    if (u < .1) return 0; if (u < .18) return Math.sin((u - .1) / .08 * Math.PI) * .12; if (u < .26) return 0;
    if (u < .3) return -(u - .26) / .04 * .18; if (u < .36) return -.18 + (u - .3) / .06 * 1.18; if (u < .42) return 1 - (u - .36) / .06 * 1.4; if (u < .47) return -.4 + (u - .42) / .05 * .4;
    if (u < .62) return 0; if (u < .76) return Math.sin((u - .62) / .14 * Math.PI) * .2; return 0;
  };
  const crX = crack * w; // a partir daqui vira rachadura
  for (let i = 0; i <= N; i++) {
    const px = i / N * w, u = (((px + ph) % per) + per) % per / per; let py = -ecg(u) * amp;
    if (px > w - crX) { const k = (px - (w - crX)) / Math.max(1, crX); const jg = (i % 6 < 3 ? 1 : -1) * (.3 + hash2(Math.floor(i / 6), 5) * .9); py = py * (1 - k * .7) + jg * amp * .8 * k; }
    pts.push([x + px, y + py]);
  }
  const n = Math.floor(pts.length * prog); if (n < 2) return;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
  const draw = (a, b, c, wd) => { ctx.beginPath(); for (let i = a; i < b; i++) i === a ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]); ctx.strokeStyle = c; ctx.lineWidth = wd; ctx.stroke(); };
  const split = Math.floor(N * (1 - crack)); // verde → ouro
  const gcol = (a) => `rgba(${col},${a})`, ocol = a => `rgba(${FX_GOLD_RGB},${a})`;
  draw(0, Math.min(n, split + 1), gcol(.15), 10); draw(0, Math.min(n, split + 1), gcol(.9), 2.4); draw(0, Math.min(n, split + 1), 'rgba(235,255,245,.8)', 1);
  if (n > split) { draw(split, n, ocol(.18), 12); draw(split, n, ocol(.95), 2.8); draw(split, n, 'rgba(255,250,225,.9)', 1.1); }
  const hd = pts[n - 1]; ctx.fillStyle = rg(ctx, hd[0], hd[1], 0, 22, [[0, 'rgba(255,255,255,.95)'], [.3, crack > 0 ? `rgba(${FX_GOLD_RGB},.5)` : gcol(.5)], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(hd[0] - 22, hd[1] - 22, 44, 44);
  ctx.restore();
}

/* ============================================================
   REDE DE APOIO
   ============================================================ */
function fxThread(ctx, x0, y0, x1, y1, o = {}) {
  const p = o.p == null ? 1 : o.p, sag = o.sag == null ? 24 : o.sag, wd = o.w || 1.4, col = o.col || FX_GOLD_RGB, t = o.t || 0, pulse = o.pulse == null ? 1 : o.pulse, sw = o.sway || 0;
  if (p <= 0) return;
  const mx = (x0 + x1) / 2 + Math.sin(t * 1.6 + x0 * .01) * sw, my = (y0 + y1) / 2 + sag + Math.cos(t * 1.3 + y0 * .01) * sw * .5;
  const pt = u => { const a = 1 - u; return [a * a * x0 + 2 * a * u * mx + u * u * x1, a * a * y0 + 2 * a * u * my + u * u * y1]; };
  const N = 18, e = E.out2(p);
  ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
  const path = () => { ctx.beginPath(); for (let i = 0; i <= N * e; i++) { const q = pt(Math.min(e, i / N)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } };
  path(); ctx.strokeStyle = `rgba(${col},.10)`; ctx.lineWidth = wd * 6; ctx.stroke();
  path(); ctx.strokeStyle = `rgba(${col},.55)`; ctx.lineWidth = wd * 1.8; ctx.stroke();
  path(); ctx.strokeStyle = 'rgba(255,248,225,.85)'; ctx.lineWidth = wd * .6; ctx.stroke();
  if (pulse > 0 && p >= .99) { const u = ((t * .5 + (x0 + y0) * .003) % 1), q = pt(u); ctx.fillStyle = rg(ctx, q[0], q[1], 0, 10 + wd * 3, [[0, 'rgba(255,255,255,.9)'], [.4, `rgba(${col},.4)`], [1, `rgba(${col},0)`]]); const rr = 10 + wd * 3; ctx.fillRect(q[0] - rr, q[1] - rr, rr * 2, rr * 2); }
  ctx.restore();
}
function fxGoldNet(ctx, anchors, prog, t, o = {}) {
  if (prog <= 0 || anchors.length < 2) return;
  const hub = o.hub, rings = o.rings == null ? 3 : o.rings, sag = o.sag == null ? 30 : o.sag, wd = o.w || 1.5, sway = o.sway == null ? 4 : o.sway, glow = o.glow == null ? 1 : o.glow;
  const n = anchors.length, cxy = hub || [anchors.reduce((s, a) => s + a[0], 0) / n, anchors.reduce((s, a) => s + a[1], 0) / n];
  const A = anchors.slice().sort((a, b) => Math.atan2(a[1] - cxy[1], a[0] - cxy[0]) - Math.atan2(b[1] - cxy[1], b[0] - cxy[0]));
  const stage = (a, b) => clamp((prog * 1.0 - a) / (b - a)); // fases: raios, anéis
  ctx.save();
  A.forEach((a, i) => { // fios do centro até cada pessoa/laje
    fxThread(ctx, a[0], a[1], cxy[0], cxy[1], { p: stage(i / n * .35, .35 + i / n * .35 + .05), sag: sag * .5, w: wd * 1.15, t: t + i, sway: sway * .6, pulse: 1 });
  });
  const hs = (k) => rings > 0 ? k / rings : 0;
  for (let k = 1; k <= rings; k++) { // anéis da teia
    const f = .3 + .7 * hs(k);
    for (let i = 0; i < n; i++) {
      const a = A[i], b = A[(i + 1) % n], pa = [cxy[0] + (a[0] - cxy[0]) * f, cxy[1] + (a[1] - cxy[1]) * f], pb = [cxy[0] + (b[0] - cxy[0]) * f, cxy[1] + (b[1] - cxy[1]) * f];
      fxThread(ctx, pa[0], pa[1], pb[0], pb[1], { p: stage(.45 + k * .1, .7 + k * .1), sag: sag * (.6 + f * .6), w: wd * .85, t: t + k * 2 + i, sway: sway, pulse: k === rings ? 1 : 0 });
    }
  }
  if (o.sparks !== 0) for (let k = 1; k <= rings; k++) A.forEach((a, i) => { // nós brilhantes
    const f = .3 + .7 * hs(k), px = cxy[0] + (a[0] - cxy[0]) * f, py = cxy[1] + (a[1] - cxy[1]) * f + sag * .3 * f + Math.sin(t * 1.6 + i) * sway * .3;
    if (prog < .5 + k * .08) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const tw = .6 + .4 * Math.sin(t * 4 + i * 2 + k); sparkle(ctx, px, py, 4 + 3 * tw * glow, Math.PI / 4, 'rgba(255,248,225,.9)'); ctx.restore();
  });
  ctx.restore();
}
function fxLantern(ctx, x, y, s, t, o = {}) {
  const col = o.col || '255,170,70', glow = o.glow == null ? 1 : o.glow, A = o.a == null ? 1 : o.a, fl = .85 + .15 * Math.sin(t * 9 + x);
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.5 + x * .01) * 4 * s); ctx.scale(s, s); ctx.globalAlpha = A;
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 10, 130, [[0, `rgba(${col},${.5 * glow * fl})`], [1, `rgba(${col},0)`]]); ctx.fillRect(-130, -130, 260, 260); ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath(); ctx.moveTo(-14, -26); ctx.bezierCurveTo(-34, -22, -36, 22, -22, 30); ctx.lineTo(22, 30); ctx.bezierCurveTo(36, 22, 34, -22, 14, -26); ctx.closePath();
  ctx.fillStyle = lg(ctx, -30, 0, 30, 0, [[0, `rgba(${col},.85)`], [.5, 'rgba(255,238,190,.98)'], [1, `rgba(${col},.85)`]]); ctx.fill(); ctx.strokeStyle = 'rgba(150,70,20,.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(150,70,20,.35)'; ctx.beginPath(); ctx.moveTo(-10, -26); ctx.quadraticCurveTo(-18, 0, -12, 30); ctx.moveTo(10, -26); ctx.quadraticCurveTo(18, 0, 12, 30); ctx.stroke();
  ctx.fillStyle = '#7a3a18'; ctx.fillRect(-16, -30, 32, 6); ctx.fillRect(-23, 30, 46, 5);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 6, 0, 26, [[0, `rgba(255,255,230,${.95 * fl})`], [1, 'rgba(255,210,120,0)']]); ctx.fillRect(-26, -20, 52, 52); ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = `rgba(${col},.7)`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 35); ctx.quadraticCurveTo(Math.sin(t * 2) * 5, 55, 0, 70); ctx.stroke();
  ctx.restore();
}
function fxGlowKite(ctx, x, y, s, t, o = {}) {
  const rot = o.rot == null ? Math.sin(t * 1.8 + x * .01) * .18 : o.rot, col = o.col || '255,214,130', glow = o.glow == null ? 1 : o.glow, A = o.a == null ? 1 : o.a;
  ctx.save(); ctx.globalAlpha = A;
  if (o.hold) { ctx.strokeStyle = `rgba(${col},.55)`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(o.hold[0], o.hold[1]); ctx.quadraticCurveTo((x + o.hold[0]) / 2 + Math.sin(t * 2) * 8, (y + o.hold[1]) / 2 + 30 * s, x, y + 38 * s); ctx.stroke(); }
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 10, 130, [[0, `rgba(${col},${.4 * glow})`], [1, `rgba(${col},0)`]]); ctx.fillRect(-130, -130, 260, 260); ctx.globalCompositeOperation = 'source-over';
  // cauda de laços
  ctx.strokeStyle = `rgba(${col},.8)`; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i <= 14; i++) { const yy = 38 + i * 8, xx = Math.sin(t * 3 + i * .7) * (5 + i * .6); i ? ctx.lineTo(xx, yy) : ctx.moveTo(0, 38); } ctx.stroke();
  for (let i = 1; i < 6; i++) { const yy = 38 + i * 19, xx = Math.sin(t * 3 + i * 1.5 * .7 * 1.4) * (5 + i * 1.2); sparkle(ctx, xx, yy, 5, t * 2 + i, i % 2 ? '#ffe9a8' : '#ff9ccf'); }
  const body = [[0, -48], [30, -6], [0, 38], [-30, -6]];
  ctx.fillStyle = lg(ctx, -30, -48, 30, 38, [[0, 'rgba(255,248,215,.95)'], [.5, `rgba(${col},.9)`], [1, 'rgba(255,150,50,.9)']]); poly(ctx, body); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.28)'; poly(ctx, [[0, -48], [30, -6], [0, -6]]); ctx.fill(); ctx.fillStyle = 'rgba(150,60,10,.22)'; poly(ctx, [[0, -6], [-30, -6], [0, 38]]); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; poly(ctx, body); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(0, 38); ctx.moveTo(-30, -6); ctx.lineTo(30, -6); ctx.stroke();
  ctx.restore();
}

/* ============================================================
   LUZ E COR
   ============================================================ */
function fxLightShafts(ctx, x, y, ang, len, o = {}) {
  const n = o.n || 7, spread = o.spread == null ? .5 : o.spread, wd = o.w || 70, col = o.col || '255,224,160', A = o.a == null ? .3 : o.a, t = o.t || 0, r = rng(o.seed || 17);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const off = (i / (n - 1 || 1) - .5) * spread * wd * n * .9, w1 = wd * (.35 + r() * .9), a = A * (.45 + .55 * (.5 + .5 * Math.sin(t * .9 + i * 2.1))), grow = 1 + r() * .8;
    ctx.fillStyle = lg(ctx, 0, 0, len, 0, [[0, `rgba(${col},${a})`], [.55, `rgba(${col},${a * .5})`], [1, `rgba(${col},0)`]]);
    ctx.beginPath(); ctx.moveTo(0, off - w1 * .15); ctx.lineTo(len, off * grow - w1 * .7 * grow); ctx.lineTo(len, off * grow + w1 * .7 * grow); ctx.lineTo(0, off + w1 * .15); ctx.closePath(); ctx.fill();
  }
  if (o.dust) { for (let i = 0; i < 26; i++) { const u = r(), v = (r() - .5) * spread * wd * n * .9 * (.3 + u), px = u * len + Math.sin(t * .6 + i) * 6, py = v + Math.cos(t * .5 + i * 1.3) * 8 + ((t * 8 * (.3 + r())) % 40); ctx.fillStyle = `rgba(255,250,230,${(.25 + .5 * Math.abs(Math.sin(t + i))) * A * 2})`; ctx.beginPath(); ctx.arc(px, py, .8 + r() * 1.4, 0, TAU); ctx.fill(); } }
  ctx.restore();
}
function fxGodRays(ctx, x, y, t, o = {}) {
  const n = o.n || 18, len = o.len || 1300, col = o.col || '255,224,160', A = o.a == null ? .3 : o.a, sp = o.sp == null ? .05 : o.sp, r = rng(o.seed || 3);
  ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU + t * sp + (r() - .5) * .2, wd = (.015 + r() * .05), k = A * (.35 + .65 * noise2(i * 3.1, t * .5, 5)), g = ctx.createLinearGradient(0, 0, Math.cos(a0) * len, Math.sin(a0) * len);
    g.addColorStop(0, `rgba(${col},${k})`); g.addColorStop(.6, `rgba(${col},${k * .35})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0 - wd) * len, Math.sin(a0 - wd) * len); ctx.lineTo(Math.cos(a0 + wd) * len, Math.sin(a0 + wd) * len); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function fxBokeh(ctx, t, seed, n, o = {}) {
  const cols = o.cols || [FX_GOLD_RGB, '255,230,170', '255,160,80'], r0 = o.r0 || 8, r1 = o.r1 || 38, A = o.a == null ? .35 : o.a, x0 = o.x0 || 0, x1 = o.x1 || W, y0 = o.y0 || 0, y1 = o.y1 || H, dr = o.drift == null ? 14 : o.drift, r = rng(seed * 17 + 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const bx = x0 + r() * (x1 - x0), by = y0 + r() * (y1 - y0), rad = r0 + r() * r() * (r1 - r0), c = cols[Math.floor(r() * cols.length)], ph = r() * TAU, sp = .2 + r() * .5;
    const px = bx + Math.sin(t * sp + ph) * dr, py = by + Math.cos(t * sp * .8 + ph) * dr, a = A * (.4 + .6 * (.5 + .5 * Math.sin(t * sp * 2 + ph)));
    ctx.fillStyle = rg(ctx, px, py, rad * .5, rad, [[0, `rgba(${c},${a * .35})`], [.85, `rgba(${c},${a * .5})`], [1, `rgba(${c},0)`]]); ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    ctx.strokeStyle = `rgba(${c},${a * .6})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, rad * .9, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function fxGrade(ctx, preset, amount = 1) {
  const a = clamp(amount); if (a <= 0) return;
  const P = {
    nightTeal: [['multiply', '#9ec6e0', .5], ['soft-light', '#0c4a6a', .55], ['screen', '#07202c', .18]],
    dawnGold:  [['soft-light', '#ffb25a', .6], ['screen', '#40240c', .22], ['overlay', '#ffd9a0', .18]],
    dayFaded:  [['screen', '#6e6a62', .18], ['soft-light', '#a9a49a', .5], ['multiply', '#e8e4dc', .35]],
    kawaii:    [['soft-light', '#ffb6e0', .55], ['screen', '#3b2a50', .25], ['overlay', '#ffe6f4', .22]],
    finale:    [['soft-light', '#ffcf8a', .5], ['screen', '#2a2048', .22], ['overlay', '#c8b6ff', .2]],
  }[preset] || [];
  ctx.save(); ctx.setTransform(ctx.canvas.width / W, 0, 0, ctx.canvas.height / H, 0, 0);
  for (const [op, col, al] of P) { ctx.globalCompositeOperation = op; ctx.globalAlpha = al * a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (preset === 'nightTeal') { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .6 * a; ctx.fillStyle = rg(ctx, W / 2, H / 2, H * .3, H * .95, [[0, '#fff'], [1, '#2a4660']]); ctx.fillRect(0, 0, W, H); }
  if (preset === 'finale' || preset === 'dawnGold') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12 * a; ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, preset === 'finale' ? '#7a5cd0' : '#ff9a40'], [1, '#00000000']]); ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
const _fxDofBuf = {};
function fxDOF(ctx, drawFn, blur = 6) {
  const cv = ctx.canvas, k = `${cv.width}x${cv.height}`; let b = _fxDofBuf[k]; if (!b) { b = _fxDofBuf[k] = _fxCanvas(cv.width, cv.height); }
  const bc = b.getContext('2d'); bc.setTransform(1, 0, 0, 1, 0, 0); bc.clearRect(0, 0, b.width, b.height); bc.setTransform(ctx.getTransform());
  bc.save(); drawFn(bc); bc.restore();
  ctx.save(); const sc = cv.width / W; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${blur * sc}px)`; ctx.drawImage(b, 0, 0); ctx.restore();
}
const _fxVigC = {};
function fxVignette(ctx, s = .5, col = '4,8,16', o = {}) {
  const cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy;
  ctx.save(); ctx.fillStyle = rg(ctx, cx, cy, H * .32, H * 1.05, [[0, `rgba(${col},0)`], [.6, `rgba(${col},${s * .35})`], [1, `rgba(${col},${s})`]]); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function fxRain(ctx, t, o = {}) {
  const n = o.n || 160, A = o.a == null ? .35 : o.a, ang = o.ang == null ? .22 : o.ang, len = o.len || 46, sp = o.speed || 1500, col = o.col || '200,225,255', r = rng(o.seed || 12);
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const z = .4 + r() * .8, x0 = r() * (W + 400) - 200, ph = r(), yy = (((ph + t * sp * z / (H + 200)) % 1) * (H + 200)) - 100, xx = x0 + yy * Math.tan(ang) * -1 + 100;
    ctx.strokeStyle = `rgba(${col},${A * z * .7})`; ctx.lineWidth = .7 + z; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + Math.sin(ang) * len * z, yy + Math.cos(ang) * len * z); ctx.stroke();
    if (o.splash && yy > o.splash - 6 && yy < o.splash + 14) { ctx.strokeStyle = `rgba(${col},${A * .6})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(xx, o.splash + 4, 5 * z, 1.8 * z, 0, 0, TAU); ctx.stroke(); }
  }
  ctx.restore();
}
function fxDust(ctx, t, o = {}) {
  const x = o.x || 0, y = o.y || 0, w = o.w || W, h = o.h || H, n = o.n || 50, col = o.col || '255,236,190', A = o.a == null ? .6 : o.a, r = rng(o.seed || 31), sz = o.size || 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const bx = r(), by = r(), ph = r() * TAU, sp = .1 + r() * .25, s = (.7 + r() * 1.8) * sz;
    const px = x + ((bx + Math.sin(t * sp + ph) * .03 + t * sp * .01) % 1) * w, py = y + (((by + t * sp * .03) % 1 + 1) % 1) * h, a = A * (.3 + .7 * Math.abs(Math.sin(t * .8 + ph)));
    ctx.fillStyle = `rgba(${col},${a})`; ctx.beginPath(); ctx.arc(px, py, s, 0, TAU); ctx.fill();
    if (s > 2) { ctx.fillStyle = rg(ctx, px, py, 0, s * 4, [[0, `rgba(${col},${a * .4})`], [1, `rgba(${col},0)`]]); ctx.fillRect(px - s * 4, py - s * 4, s * 8, s * 8); }
  }
  ctx.restore();
}

/* ============================================================
   INTERIORES
   ============================================================ */
const _fxInk = (c, k = .45) => mix(c, '#1a1426', k);          // contorno colorido = tom escuro do próprio fill
function _fxShape(ctx, fill, ink, lw = 2) { ctx.fillStyle = fill; ctx.fill(); if (ink) { ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); } }
function _fxPlanks(ctx, x, y, w, h, base, seed, vert) {
  const r = rng(seed); ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
  const ph = 26; for (let yy = y, k = 0; yy < y + h; yy += ph * (1 + (yy - y) / h * .6), k++) {
    const hh = ph * (1 + (yy - y) / h * .6); ctx.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,230,190'},${.04 + r() * .07})`; ctx.fillRect(x, yy, w, hh);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x, yy, w, 1.6); ctx.fillStyle = 'rgba(255,230,190,.12)'; ctx.fillRect(x, yy + 1.6, w, 1);
    for (let xx = x - r() * 200; xx < x + w; xx += 160 + r() * 140) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(xx, yy, 1.6, hh); }
    ctx.strokeStyle = 'rgba(0,0,0,.07)'; ctx.lineWidth = 1; ctx.beginPath(); for (let q = 0; q < 3; q++) { const gy = yy + hh * (.25 + q * .25); ctx.moveTo(x, gy); for (let xx = x; xx < x + w; xx += 40) ctx.lineTo(xx, gy + Math.sin(xx * .02 + k) * 1.5); } ctx.stroke();
  }
  ctx.restore();
}
function _fxPaintWall(ctx, x, y, w, h, tint, seed, o = {}) { // parede pintada (tinta lisa com textura de reboco leve)
  ctx.fillStyle = tint; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.a == null ? .5 : o.a;
  fxConcrete(ctx, x, y, w, h, { tone: 'day', seed: seed, light: 0, vig: 0, shade: 0, clean: true }); ctx.restore();
}
function _fxClockFace(ctx, x, y, R, h, m, col = '#fff7e6', ring = '#3a3a44') {
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.arc(x + R * .08, y + R * .12, R * 1.05, 0, TAU); ctx.fill();
  ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill(); ctx.fillStyle = lg(ctx, x - R, y - R, x + R, y + R, [[0, '#fffdf4'], [1, '#e9dcc0']]); ctx.beginPath(); ctx.arc(x, y, R * .86, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3a3a44'; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.lineWidth = i % 3 ? R * .03 : R * .06; ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * R * .68, y - Math.cos(a) * R * .68); ctx.lineTo(x + Math.sin(a) * R * .78, y - Math.cos(a) * R * .78); ctx.stroke(); }
  const ha = (h % 12 + m / 60) / 12 * TAU, ma = m / 60 * TAU; ctx.lineWidth = R * .075; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ha) * R * .46, y - Math.cos(ha) * R * .46); ctx.stroke();
  ctx.lineWidth = R * .05; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ma) * R * .68, y - Math.cos(ma) * R * .68); ctx.stroke();
  ctx.fillStyle = '#d6453a'; ctx.beginPath(); ctx.arc(x, y, R * .06, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(x - R * .3, y - R * .4, R * .3, R * .12, -.6, 0, TAU); ctx.fill();
}
function _fxWinCrack(ctx, x, y, w, h, ix, iy, glow, seed, t) { // vidro trincado: rachaduras radiais + arcos, com ouro vazando
  const r = rng(seed), rays = []; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const N = 11, base = r() * TAU;
  for (let i = 0; i < N; i++) {
    const a = base + i / N * TAU + (r() - .5) * .3, pts = [[ix, iy]]; let px = ix, py = iy, aa = a; const L = 100 + r() * 260;
    for (let d = 0; d < L; d += 12 + r() * 18) { aa += (r() - .5) * .22; px += Math.cos(aa) * 16; py += Math.sin(aa) * 16; pts.push([px, py]); } rays.push(pts);
  }
  const arcs = []; for (let k = 1; k <= 3; k++) { const pts = []; for (let i = 0; i < N; i++) { const rr = rays[i], idx = Math.min(rr.length - 1, k * 2 + 1); pts.push(rr[idx]); } arcs.push(pts); }
  const draw = (wd, st) => { ctx.strokeStyle = st; ctx.lineWidth = wd; ctx.beginPath(); rays.forEach(p => { p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); }); arcs.forEach((a, k) => { a.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); if (k < 2) ctx.closePath(); }); ctx.stroke(); };
  draw(3.2, 'rgba(255,255,255,.18)'); draw(1.6, 'rgba(40,30,30,.6)');
  if (glow > 0) { ctx.globalCompositeOperation = 'lighter'; draw(5, `rgba(${FX_GOLD_RGB},${.12 * glow})`); draw(1.5, `rgba(255,200,100,${.7 * glow})`); draw(.6, `rgba(255,250,225,${.9 * glow})`); }
  ctx.restore();
}
/* ---------- QUARTO ---------- */
function intRoom(ctx, t, o = {}) {
  const sun = o.sun == null ? 1 : o.sun, ring = o.ring || 0, crack = o.crack == null ? 1 : o.crack, floorY = 548, bt = o.time || '05:00';
  ctx.save();
  _fxPaintWall(ctx, 0, 0, W, floorY, '#a9cfd2', 11, { a: .55 });
  // sombra fria no teto/cantos
  ctx.fillStyle = lg(ctx, 0, 0, 0, floorY, [[0, 'rgba(10,22,40,.5)'], [.3, 'rgba(10,22,40,.08)'], [1, 'rgba(10,22,40,.22)']]); ctx.fillRect(0, 0, W, floorY);
  // barrado + rodapé
  ctx.fillStyle = '#6f98a0'; ctx.fillRect(0, floorY - 120, W, 120); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(0, floorY - 120, W, 3); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, floorY - 117, W, 3);
  ctx.fillStyle = '#e8dcc4'; ctx.fillRect(0, floorY - 14, W, 14); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(0, floorY - 3, W, 3);
  _fxPlanks(ctx, 0, floorY, W, H - floorY, '#5a3f34', 8);
  ctx.fillStyle = lg(ctx, 0, floorY, 0, H, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, floorY, W, 40);
  // pôsteres e coisinhas na parede
  const post = (px, py, pw, ph, c1, c2, rot) => { ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-pw / 2 + 4, -ph / 2 + 5, pw, ph); ctx.fillStyle = lg(ctx, 0, -ph / 2, 0, ph / 2, [[0, c1], [1, c2]]); ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.strokeStyle = _fxInk(c2); ctx.lineWidth = 1.5; ctx.strokeRect(-pw / 2, -ph / 2, pw, ph); ctx.fillStyle = 'rgba(255,240,200,.75)'; ctx.fillRect(-pw / 2 - 5, -ph / 2 - 3, 18, 8); ctx.fillRect(pw / 2 - 12, -ph / 2 - 3, 18, 8); ctx.restore(); };
  post(190, 150, 110, 150, '#2c3a6a', '#16203e', -.04); fxStar8(ctx, 190, 160, 34, { glow: .35, rays: 0, flare: 0, rot: .2 }); for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(255,240,200,.8)'; ctx.fillRect(150 + hash2(i, 3) * 80, 95 + hash2(i, 9) * 110, 2, 2); }
  post(330, 140, 90, 110, '#f0b6c8', '#c8789a', .05); sparkle(ctx, 330, 138, 22, 0, '#fff'); sparkle(ctx, 350, 170, 9, 0, '#ffe9a8');
  _fxClockFace(ctx, 470, 128, 38, 5, 0);
  // estante com livros e planta
  ctx.fillStyle = '#8a5a3c'; ctx.fillRect(560, 214, 150, 9); ctx.fillStyle = '#5a3a28'; ctx.fillRect(560, 223, 150, 4);
  const bk = ['#d94a4a', '#3a7ad9', '#e8b83a', '#3a9a6a', '#8a5ac8', '#e87a3a']; let bx = 568; bk.forEach((c, i) => { const bh = 36 + (i * 17 % 20), bw = 11 + (i % 3) * 3; ctx.fillStyle = c; ctx.fillRect(bx, 214 - bh, bw, bh); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(bx + 1, 214 - bh, 2, bh); ctx.strokeStyle = _fxInk(c); ctx.lineWidth = 1.2; ctx.strokeRect(bx, 214 - bh, bw, bh); bx += bw + 1.5; });
  ctx.fillStyle = '#c8703c'; poly(ctx, [[664, 214], [700, 214], [694, 186], [670, 186]]); ctx.fill(); ctx.strokeStyle = _fxInk('#c8703c'); ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#4aa860'; for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(682, 188); ctx.rotate(-1 + i * .4 + Math.sin(t * 1.2 + i) * .03); ctx.beginPath(); ctx.ellipse(0, -16, 6, 17, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // moletom amarelo no gancho (porta à direita)
  ctx.fillStyle = '#4a3a30'; ctx.fillRect(1160, 96, 6, 26); ctx.beginPath(); ctx.arc(1163, 124, 6, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(1163, 130); ctx.rotate(Math.sin(t * .8) * .01);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 30, -4); ctx.quadraticCurveTo(sd * 62, 20, sd * 70, 96); ctx.lineTo(sd * 52, 100); ctx.quadraticCurveTo(sd * 44, 40, sd * 26, 24); ctx.closePath(); _fxShape(ctx, '#d89a20', _fxInk('#e4a928', .5), 2); }
  ctx.beginPath(); ctx.ellipse(0, -6, 26, 14, 0, 0, TAU); _fxShape(ctx, '#c88a1a', _fxInk('#e4a928', .5), 2);
  ctx.fillStyle = '#e4a928'; ctx.beginPath(); ctx.moveTo(-34, -6); ctx.quadraticCurveTo(0, -18, 34, -6); ctx.lineTo(48, 112); ctx.quadraticCurveTo(0, 124, -48, 112); ctx.closePath(); _fxShape(ctx, '#e4a928', _fxInk('#e4a928', .5), 2);
  ctx.fillStyle = 'rgba(120,70,0,.22)'; ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(34, -6); ctx.lineTo(48, 112); ctx.lineTo(10, 118); ctx.fill(); ctx.strokeStyle = '#fff5d0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-8, 38); ctx.moveTo(8, 0); ctx.lineTo(10, 40); ctx.stroke(); ctx.restore();
  // ---- JANELA com vidro trincado ----
  const win = { x: 760, y: 76, w: 290, h: 300 }, ix = win.x + 175, iy = win.y + 120;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(win.x - 14, win.y - 8, win.w + 36, win.h + 36);
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(win.x - 16, win.y - 16, win.w + 32, win.h + 32); ctx.strokeStyle = _fxInk('#efe6d2', .3); ctx.lineWidth = 2; ctx.strokeRect(win.x - 16, win.y - 16, win.w + 32, win.h + 32);
  ctx.save(); ctx.beginPath(); ctx.rect(win.x, win.y, win.w, win.h); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, win.y, 0, win.y + win.h, [[0, '#8fb6dc'], [.5, '#f6d2a0'], [1, '#ffb878']]); ctx.fillRect(win.x, win.y, win.w, win.h);
  ctx.fillStyle = rg(ctx, win.x + win.w * .25, win.y + win.h * .86, 0, 220, [[0, 'rgba(255,248,210,.95)'], [.3, 'rgba(255,220,150,.6)'], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(win.x, win.y, win.w, win.h);
  for (let k = 0; k < 2; k++) { const rr = rng(40 + k); let xx = win.x - 10; while (xx < win.x + win.w) { const bw = 28 + rr() * 34, bh = (k ? 56 : 96) + rr() * 80; ctx.fillStyle = k ? '#7a728a' : '#9a92a6'; ctx.fillRect(xx, win.y + win.h - bh, bw, bh + 4); ctx.fillStyle = 'rgba(255,214,140,.55)'; for (let wy = win.y + win.h - bh + 8; wy < win.y + win.h - 6; wy += 17) if (rr() < .4) ctx.fillRect(xx + 5 + rr() * 8, wy, 5, 6); xx += bw + 1; } }
  ctx.fillStyle = lg(ctx, 0, win.y + win.h - 60, 0, win.y + win.h, [[0, 'rgba(255,200,130,0)'], [1, 'rgba(255,200,130,.5)']]); ctx.fillRect(win.x, win.y + win.h - 60, win.w, 60);
  // reflexo diagonal no vidro
  ctx.fillStyle = 'rgba(255,255,255,.09)'; poly(ctx, [[win.x + 20, win.y], [win.x + 90, win.y], [win.x + 10, win.y + win.h], [win.x - 40, win.y + win.h]]); ctx.fill(); poly(ctx, [[win.x + 110, win.y], [win.x + 128, win.y], [win.x + 48, win.y + win.h], [win.x + 30, win.y + win.h]]); ctx.fill();
  ctx.restore();
  if (crack > 0) { ctx.save(); ctx.beginPath(); ctx.rect(win.x, win.y, win.w * (crack >= 1 ? 1 : crack), win.h); ctx.clip(); _fxWinCrack(ctx, win.x, win.y, win.w, win.h, ix, iy, sun, 9, t); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(ix, iy, 3.5, 0, TAU); ctx.fill(); }
  // caixilho em cruz
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(win.x + win.w / 2 - 5, win.y, 10, win.h); ctx.fillRect(win.x, win.y + win.h * .58, win.w, 10); ctx.strokeStyle = _fxInk('#efe6d2', .3); ctx.lineWidth = 1.5; ctx.strokeRect(win.x + win.w / 2 - 5, win.y, 10, win.h); ctx.strokeRect(win.x, win.y + win.h * .58, win.w, 10);
  ctx.fillStyle = '#d8ccb4'; ctx.fillRect(win.x - 26, win.y + win.h + 16, win.w + 52, 12); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(win.x - 26, win.y + win.h + 16, win.w + 52, 3);
  // cortina leve balançando
  const sw = Math.sin(t * 1.1) * 6; ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = lg(ctx, win.x - 40, 0, win.x + 40, 0, [[0, '#f6e8e0'], [1, 'rgba(246,232,224,.2)']]); ctx.beginPath(); ctx.moveTo(win.x - 30, win.y - 24); ctx.lineTo(win.x + 60, win.y - 24); ctx.bezierCurveTo(win.x + 50 + sw, win.y + 120, win.x + 20 + sw, win.y + 240, win.x + 36 + sw * 1.4, win.y + win.h + 20); ctx.lineTo(win.x - 30, win.y + win.h + 20); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#6a5040'; ctx.fillRect(win.x - 40, win.y - 30, win.w + 80, 7);
  // ---- móveis ----
  const bed = { x: 60, y: 372, w: 540, h: 176 };
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(bed.x + bed.w / 2, floorY + 10, bed.w / 2 + 20, 14, 0, 0, TAU); ctx.fill();
  const wood = '#9a6a44'; ctx.fillStyle = wood; rrect(ctx, bed.x, 320, 38, 236, 8); _fxShape(ctx, wood, _fxInk(wood), 2.4); ctx.fillStyle = 'rgba(255,220,170,.22)'; ctx.fillRect(bed.x + 4, 326, 7, 224);
  rrect(ctx, bed.x + bed.w - 26, 430, 26, 126, 6); _fxShape(ctx, wood, _fxInk(wood), 2.4);
  ctx.fillStyle = '#7a4a2e'; ctx.fillRect(bed.x + 20, 506, bed.w - 30, 22); ctx.strokeStyle = _fxInk('#7a4a2e'); ctx.lineWidth = 2; ctx.strokeRect(bed.x + 20, 506, bed.w - 30, 22);
  ctx.fillStyle = '#f2ebe0'; rrect(ctx, bed.x + 30, 440, bed.w - 56, 72, 18); _fxShape(ctx, '#f2ebe0', _fxInk('#f2ebe0', .35), 2);
  // pijama/lençol de baixo + cobertor mostarda amassado
  ctx.beginPath(); ctx.moveTo(bed.x + 120, 452); ctx.bezierCurveTo(bed.x + 190, 424, bed.x + 300, 470, bed.x + 380, 436); ctx.bezierCurveTo(bed.x + 440, 420, bed.x + 490, 440, bed.x + 504, 452); ctx.lineTo(bed.x + 504, 514); ctx.lineTo(bed.x + 120, 514); ctx.closePath(); _fxShape(ctx, lg(ctx, 0, 424, 0, 514, [[0, '#f0b83c'], [1, '#d08f1e']]), _fxInk('#d9a02a', .5), 2.2);
  ctx.strokeStyle = 'rgba(140,80,0,.35)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 5; i++) { const xx = bed.x + 170 + i * 66; ctx.moveTo(xx, 456 + (i % 2) * 8); ctx.quadraticCurveTo(xx + 14, 482, xx - 6, 508); } ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,170,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bed.x + 130, 456); ctx.bezierCurveTo(bed.x + 200, 430, bed.x + 300, 474, bed.x + 380, 440); ctx.stroke();
  ctx.fillStyle = '#fff6ee'; ctx.beginPath(); ctx.moveTo(bed.x + 44, 428); ctx.bezierCurveTo(bed.x + 60, 396, bed.x + 140, 394, bed.x + 156, 424); ctx.bezierCurveTo(bed.x + 168, 448, bed.x + 150, 462, bed.x + 100, 462); ctx.bezierCurveTo(bed.x + 56, 462, bed.x + 40, 446, bed.x + 44, 428); ctx.closePath(); _fxShape(ctx, '#fff6ee', _fxInk('#e8dcd0', .3), 2);
  ctx.strokeStyle = 'rgba(160,130,110,.35)'; ctx.beginPath(); ctx.moveTo(bed.x + 70, 424); ctx.quadraticCurveTo(bed.x + 100, 440, bed.x + 130, 422); ctx.stroke();
  // ursinho de pelúcia
  ctx.fillStyle = '#c98a5a'; ctx.beginPath(); ctx.arc(bed.x + 400, 428, 17, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(bed.x + 388, 412, 6, 0, TAU); ctx.arc(bed.x + 412, 412, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a1a1a'; ctx.fillRect(bed.x + 393, 426, 3, 3); ctx.fillRect(bed.x + 405, 426, 3, 3);
  // criado-mudo + despertador
  const nsx = 622, nsy = 448; ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(nsx + 45, floorY + 8, 58, 9, 0, 0, TAU); ctx.fill();
  rrect(ctx, nsx, nsy, 90, 104, 5); _fxShape(ctx, '#b27a4e', _fxInk('#b27a4e'), 2.4); ctx.fillStyle = '#9a6640'; ctx.fillRect(nsx + 8, nsy + 12, 74, 38); ctx.strokeStyle = _fxInk('#9a6640'); ctx.lineWidth = 1.6; ctx.strokeRect(nsx + 8, nsy + 12, 74, 38); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(nsx + 45, nsy + 31, 4.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7a4a2e'; ctx.fillRect(nsx + 6, nsy + 104, 8, 6); ctx.fillRect(nsx + 76, nsy + 104, 8, 6);
  const cx = nsx + 45, cy = nsy - 30, shk = ring * Math.sin(t * 90) * 2.2;
  ctx.save(); ctx.translate(cx + shk, cy + (ring ? Math.cos(t * 70) * 1.2 : 0)); ctx.rotate(ring * Math.sin(t * 60) * .05);
  ctx.fillStyle = '#c64a3c'; ctx.beginPath(); ctx.arc(-24, -28, 13, Math.PI, 0); _fxShape(ctx, '#e0cf9a', '#6a5a30', 1.5); ctx.beginPath(); ctx.arc(24, -28, 13, Math.PI, 0); _fxShape(ctx, '#e0cf9a', '#6a5a30', 1.5);
  rrect(ctx, -36, -32, 72, 56, 14); _fxShape(ctx, lg(ctx, 0, -32, 0, 24, [[0, '#e85a4a'], [1, '#b8362c']]), '#6a1a14', 2.2);
  rrect(ctx, -29, -24, 58, 28, 6); _fxShape(ctx, '#1a0e12', '#4a2a2a', 1.4);
  ctx.font = '22px "Lilita One", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const on = ring ? (Math.floor(t * 4) % 2 === 0 ? 1 : .25) : 1; ctx.fillStyle = `rgba(255,70,50,${on})`; ctx.shadowColor = 'rgba(255,60,40,.9)'; ctx.shadowBlur = 8; ctx.fillText(bt, 0, -9); ctx.shadowBlur = 0;
  ctx.fillStyle = '#6a1a14'; ctx.fillRect(-24, 24, 7, 6); ctx.fillRect(17, 24, 7, 6); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-32, -29, 40, 3);
  ctx.restore();
  if (ring > 0) { ctx.save(); ctx.strokeStyle = `rgba(255,236,180,${.8 * ring})`; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 3; k++) { const ph = (t * 6 + k * .3) % 1; ctx.globalAlpha = (1 - ph) * ring; ctx.beginPath(); ctx.arc(cx + s * 56, cy - 28, 14 + k * 9 + ph * 5, s > 0 ? -.9 : Math.PI - .9 + .0, s > 0 ? .9 : Math.PI + .9); ctx.stroke(); } ctx.restore(); }
  // ---- feixe de sol atravessando o vidro trincado ----
  if (sun > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const d = [-.82, .58], L = 760; // direção do feixe
    const qa = [win.x, win.y + 20], qb = [win.x + win.w, win.y + 20], qc = [win.x + win.w, win.y + win.h], qd = [win.x, win.y + win.h];
    const P = (q, k) => [q[0] + d[0] * k, q[1] + d[1] * k];
    ctx.fillStyle = lg(ctx, win.x, win.y, win.x - 500, win.y + 360, [[0, `rgba(255,224,160,${.2 * sun})`], [.55, `rgba(255,214,140,${.1 * sun})`], [1, 'rgba(255,210,130,0)']]);
    ctx.beginPath(); [qa, P(qa, L), P(qd, L), qd].forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill();
    ctx.beginPath(); [qa, P(qa, L), P(qb, L), qb].forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill();
    // faixas de luz finas vindas das rachaduras (cada fenda deixa passar um fio de luz)
    const rr = rng(77); for (let i = 0; i < 9; i++) { const a = [ix + (rr() - .5) * 100, iy + (rr() - .5) * 100], w1 = 2 + rr() * 5; ctx.fillStyle = lg(ctx, a[0], a[1], a[0] + d[0] * 600, a[1] + d[1] * 600, [[0, `rgba(255,236,190,${.38 * sun})`], [1, 'rgba(255,220,150,0)']]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + d[0] * 650 - 8, a[1] + d[1] * 650 - w1 * 3); ctx.lineTo(a[0] + d[0] * 650 + 8, a[1] + d[1] * 650 + w1 * 3); ctx.lineTo(a[0] + 2, a[1] + w1); ctx.closePath(); ctx.fill(); }
    // mancha de sol no chão com a sombra da cruz e gretas douradas
    const fx0 = 360, fx1 = 760; ctx.fillStyle = lg(ctx, 0, floorY, 0, H, [[0, `rgba(255,214,140,${.5 * sun})`], [1, `rgba(255,190,100,${.15 * sun})`]]);
    poly(ctx, [[fx0 + 60, floorY + 6], [fx1 - 40, floorY + 6], [fx1 - 150, H], [fx0 - 80, H]]); ctx.fill();
    ctx.strokeStyle = `rgba(255,248,215,${.4 * sun})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx0 + 210, floorY + 6); ctx.lineTo(fx0 + 150, H); ctx.moveTo(fx0 + 30, floorY + 80); ctx.lineTo(fx1 - 90, floorY + 80); ctx.stroke();
    ctx.restore();
    // poeira na luz
    ctx.save(); ctx.beginPath(); ctx.moveTo(win.x, win.y + 20); ctx.lineTo(win.x - 600, win.y + 440); ctx.lineTo(win.x - 400, floorY + 40); ctx.lineTo(win.x, win.y + win.h); ctx.closePath(); ctx.clip(); fxDust(ctx, t, { x: 160, y: 80, w: 900, h: 480, n: o.dust == null ? 60 : o.dust, a: .9, seed: 5, size: 1.2 }); ctx.restore();
    // brilho de contra-luz no rosto da janela
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, win.x + 100, win.y + win.h * .9, 0, 360, [[0, `rgba(255,230,170,${.22 * sun})`], [1, 'rgba(255,230,170,0)']]); ctx.fillRect(win.x - 300, win.y - 100, 700, 700); ctx.restore();
  }
  fxVignette(ctx, .45, '8,14,28');
  ctx.restore();
  return { win, bed, clock: { x: cx, y: cy }, floorY, wallClock: { x: 470, y: 128 }, impact: [ix, iy] };
}
/* ---------- COZINHA ---------- */
function _fxBill(ctx, x, y, rot, s, label, amt, col, late, seed) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-40, -52, 88, 112); ctx.fillStyle = '#fbf7ec'; ctx.fillRect(-44, -56, 88, 112); ctx.strokeStyle = 'rgba(80,70,60,.55)'; ctx.lineWidth = 1.2; ctx.strokeRect(-44, -56, 88, 112);
  ctx.fillStyle = col; ctx.fillRect(-44, -56, 88, 22); ctx.fillStyle = '#fff'; ctx.font = '15px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, -45);
  ctx.fillStyle = '#d6d0c0'; for (let i = 0; i < 4; i++) ctx.fillRect(-34, -24 + i * 10, 68 - (i % 2) * 20 - (hash2(i, seed) * 14), 4);
  ctx.fillStyle = '#2a2430'; ctx.font = '13px "Lilita One", sans-serif'; ctx.fillText(amt, 0, 26); for (let i = 0; i < 20; i++) ctx.fillRect(-34 + i * 3.4, 38, (i % 3) + 1, 12);
  if (late) { ctx.rotate(-.3); ctx.strokeStyle = 'rgba(220,50,50,.9)'; ctx.fillStyle = 'rgba(220,50,50,.9)'; ctx.lineWidth = 2; ctx.strokeRect(-30, 0, 60, 16); ctx.font = '11px "Lilita One", sans-serif'; ctx.fillText('ATRASADO', 0, 9); }
  ctx.restore();
}
function intKitchen(ctx, t, o = {}) {
  const open = o.open == null ? 0 : o.open, bills = o.bills == null ? 1 : o.bills, floorY = 566, lightA = o.light == null ? 1 : o.light;
  ctx.save();
  _fxPaintWall(ctx, 0, 0, W, floorY, '#efe0a8', 23, { a: .5 });
  ctx.fillStyle = lg(ctx, 0, 0, 0, floorY, [[0, 'rgba(30,24,40,.45)'], [.3, 'rgba(30,24,40,.05)'], [1, 'rgba(30,24,40,.2)']]); ctx.fillRect(0, 0, W, floorY);
  // azulejo antigo até a meia parede
  const ty = 300, ts = 38; ctx.save(); ctx.beginPath(); ctx.rect(0, ty, W, floorY - ty); ctx.clip(); ctx.fillStyle = '#efe9d8'; ctx.fillRect(0, ty, W, floorY - ty);
  for (let yy = ty; yy < floorY; yy += ts) for (let xx = 0; xx < W; xx += ts) { const v = hash2(xx / ts | 0, yy / ts | 0, 4); ctx.fillStyle = `rgba(${v < .5 ? '200,180,120' : '255,255,255'},${.08 + v * .12})`; ctx.fillRect(xx + 1, yy + 1, ts - 2, ts - 2); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(xx + 1, yy + 1, ts - 2, 2); if (v > .93) { ctx.fillStyle = 'rgba(120,100,70,.3)'; ctx.fillRect(xx + 1, yy + 1, ts - 2, ts - 2); } }
  ctx.strokeStyle = 'rgba(150,130,90,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let yy = ty; yy <= floorY; yy += ts) { ctx.moveTo(0, yy); ctx.lineTo(W, yy); } for (let xx = 0; xx <= W; xx += ts) { ctx.moveTo(xx, ty); ctx.lineTo(xx, floorY); } ctx.stroke(); ctx.restore();
  ctx.fillStyle = '#b8a77a'; ctx.fillRect(0, ty - 8, W, 9); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, ty - 8, W, 2);
  // chão
  ctx.fillStyle = '#8a6a56'; ctx.fillRect(0, floorY, W, H - floorY); for (let yy = floorY, k = 0; yy < H; yy += 44, k++) for (let xx = -(k % 2) * 44; xx < W; xx += 88) { ctx.fillStyle = (xx / 88 + k) % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.1)'; ctx.fillRect(xx, yy, 44, 44); } ctx.fillStyle = lg(ctx, 0, floorY, 0, floorY + 50, [[0, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, floorY, W, 50);
  // janelinha com manhã
  const wx = 410, wy = 90, ww = 190, wh = 150; ctx.fillStyle = lg(ctx, 0, wy, 0, wy + wh, [[0, '#a8c8e8'], [1, '#ffd6a0']]); ctx.fillRect(wx, wy, ww, wh); ctx.fillStyle = 'rgba(80,60,60,.5)'; for (let i = 0; i < 4; i++) ctx.fillRect(wx + 10 + i * 46, wy + 90 - (i % 2) * 22, 34, 70);
  ctx.strokeStyle = '#5a4a44'; ctx.lineWidth = 6; ctx.strokeRect(wx, wy, ww, wh); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, wx, wy, wx - 100, wy + 400, [[0, `rgba(255,224,160,${.26 * lightA})`], [1, 'rgba(255,224,160,0)']]); poly(ctx, [[wx, wy], [wx + ww, wy], [wx + ww - 220, floorY], [wx - 260, floorY]]); ctx.fill(); ctx.restore();
  // ---- geladeira ----
  const fr = { x: 50, y: 120, w: 250, h: floorY - 120 };
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(fr.x + fr.w / 2 + 40, floorY + 8, fr.w / 2 + 70, 12, 0, 0, TAU); ctx.fill();
  const fc = '#e9ecee'; rrect(ctx, fr.x, fr.y, fr.w, fr.h, 18); _fxShape(ctx, lg(ctx, fr.x, 0, fr.x + fr.w, 0, [[0, '#f6f8f8'], [.7, '#dfe3e6'], [1, '#bcc3c8']]), _fxInk(fc, .5), 2.6);
  if (open > .02) {
    // interior com luz
    const ix = fr.x + 14, iy = fr.y + 150, iw = fr.w - 28, ih = fr.h - 164;
    ctx.fillStyle = lg(ctx, 0, iy, 0, iy + ih, [[0, '#f4fbff'], [1, '#c9dce6']]); ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(ix, iy, 10, ih); ctx.fillRect(ix + iw - 8, iy, 8, ih);
    for (let k = 0; k < 4; k++) { const sy = iy + 20 + k * (ih - 40) / 3.1; ctx.fillStyle = 'rgba(190,220,235,.8)'; ctx.fillRect(ix, sy, iw, 7); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(ix, sy, iw, 2); }
    const sy = k => iy + 20 + k * (ih - 40) / 3.1;
    // itens: pouca coisa
    ctx.fillStyle = '#ffe046'; ctx.beginPath(); ctx.ellipse(ix + 40, sy(0) - 9, 15, 10, .2, 0, TAU); _fxShape(ctx, '#ffe046', '#b09a10', 1.4);
    ctx.fillStyle = '#d8453a'; rrect(ctx, ix + 130, sy(0) - 36, 26, 36, 6); _fxShape(ctx, '#d8453a', '#7a1a14', 1.4); ctx.fillStyle = '#fff'; ctx.fillRect(ix + 135, sy(0) - 22, 16, 10);
    ctx.fillStyle = '#9fd0e8'; rrect(ctx, ix + 60, sy(1) - 50, 28, 50, 8); _fxShape(ctx, 'rgba(150,205,235,.8)', '#4a8aaa', 1.4);
    ctx.fillStyle = '#d6b88a'; rrect(ctx, ix + 130, sy(1) - 16, 60, 16, 4); _fxShape(ctx, '#d6b88a', '#8a6a3a', 1.4); ctx.fillStyle = '#fff6e8'; ctx.beginPath(); ctx.ellipse(ix + 148, sy(1) - 18, 8, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e8e0cc'; rrect(ctx, ix + 20, sy(2) - 30, 44, 30, 6); _fxShape(ctx, '#e8e0cc', '#8a7a5a', 1.4);
    ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(ix + 150, sy(2) - 12, 11, 0, TAU); _fxShape(ctx, '#e04a3a', '#7a1a14', 1.4); ctx.fillStyle = '#4aa84a'; ctx.fillRect(ix + 148, sy(2) - 26, 4, 6);
    ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(ix + 90 + i * 22, sy(3)); ctx.lineTo(ix + 90 + i * 22 + 10, sy(3) - 6); ctx.stroke(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, ix + iw / 2, iy + ih / 2, 0, 260, [[0, 'rgba(220,240,255,.35)'], [1, 'rgba(220,240,255,0)']]); ctx.fillRect(ix - 100, iy - 100, iw + 200, ih + 200);
    ctx.fillStyle = lg(ctx, ix + iw / 2, iy, ix + iw / 2 + 40, floorY + 120, [[0, 'rgba(210,235,255,.28)'], [1, 'rgba(210,235,255,0)']]); poly(ctx, [[ix, iy + ih - 6], [ix + iw, iy + ih - 6], [ix + iw + 160, floorY + 150], [ix - 160, floorY + 150]]); ctx.fill(); ctx.restore();
    // porta aberta (de lado, à esquerda)
    const dw = 78 * open; ctx.fillStyle = lg(ctx, fr.x - dw, 0, fr.x, 0, [[0, '#cfd5d9'], [1, '#e9ecee']]); poly(ctx, [[fr.x, fr.y + 150], [fr.x - dw, fr.y + 150 - 16 * open], [fr.x - dw, floorY - 12 + 8 * open], [fr.x, floorY - 14]]); _fxShape(ctx, ctx.fillStyle, _fxInk(fc, .5), 2.4);
    ctx.fillStyle = '#c0c8ce'; for (let k = 0; k < 3; k++) ctx.fillRect(fr.x - dw + 4, iy + 40 + k * 70, dw - 8, 6);
  } else {
    ctx.strokeStyle = _fxInk(fc, .45); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(fr.x, fr.y + 150); ctx.lineTo(fr.x + fr.w, fr.y + 150); ctx.stroke();
  }
  // porta do freezer + puxadores
  if (open <= .02) { ctx.fillStyle = 'rgba(255,255,255,.5)'; rrect(ctx, fr.x + 12, fr.y + 8, 14, fr.h - 20, 6); ctx.fill(); }
  ctx.fillStyle = '#9aa2a8'; rrect(ctx, fr.x + fr.w - 30, fr.y + 40, 9, 70, 4); _fxShape(ctx, '#aeb6bc', '#5a636a', 1.6); rrect(ctx, fr.x + fr.w - 30, fr.y + 180, 9, 90, 4); _fxShape(ctx, '#aeb6bc', '#5a636a', 1.6);
  ctx.fillStyle = '#c0c8ce'; rrect(ctx, fr.x + 14, fr.y + 150 - 6, fr.w - 28, 6, 3); ctx.fill();
  // ímãs e desenho de criança (só com a porta fechada)
  if (open <= .6) { const a = 1 - open / .6; ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#fffbea'; ctx.fillRect(fr.x + 52, fr.y + 214, 70, 54); ctx.strokeStyle = 'rgba(120,110,90,.6)'; ctx.lineWidth = 1; ctx.strokeRect(fr.x + 52, fr.y + 214, 70, 54); ctx.strokeStyle = '#e8a030'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(fr.x + 74, fr.y + 232, 8, 0, TAU); ctx.moveTo(fr.x + 74, fr.y + 240); ctx.lineTo(fr.x + 74, fr.y + 256); ctx.stroke(); ctx.strokeStyle = '#d8453a'; ctx.beginPath(); ctx.moveTo(fr.x + 88, fr.y + 252); ctx.lineTo(fr.x + 112, fr.y + 222); ctx.stroke(); sparkle(ctx, fr.x + 104, fr.y + 228, 7, 0, '#ffc24d');
    [['#ff6b8a', fr.x + 60, fr.y + 214], ['#4aa8e8', fr.x + 114, fr.y + 214]].forEach(([c, mx, my]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(mx, my, 6, 0, TAU); _fxShape(ctx, c, _fxInk(c), 1.3); });
    ctx.restore(); }
  // ---- fogão ----
  const st = { x: 380, y: 410, w: 230, h: floorY - 410 };
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(st.x + st.w / 2, floorY + 8, st.w / 2 + 14, 10, 0, 0, TAU); ctx.fill();
  rrect(ctx, st.x, st.y, st.w, st.h, 10); _fxShape(ctx, lg(ctx, st.x, 0, st.x + st.w, 0, [[0, '#d8d4cc'], [1, '#a8a49c']]), _fxInk('#c0bcb4', .5), 2.4);
  ctx.fillStyle = '#2a2a30'; rrect(ctx, st.x + 10, st.y + 40, st.w - 20, st.h - 54, 8); _fxShape(ctx, '#1e1e26', '#0a0a10', 2); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(st.x + 18, st.y + 46, st.w - 36, 6); ctx.fillStyle = 'rgba(255,255,255,.2)'; rrect(ctx, st.x + 24, st.y + 70, 30, 100, 6); ctx.fill();
  ctx.fillStyle = '#7a7a82'; rrect(ctx, st.x + 24, st.y + 100, st.w - 48, 8, 4); ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#3a3a42'; ctx.beginPath(); ctx.arc(st.x + 36 + i * 54, st.y + 22, 10, 0, TAU); _fxShape(ctx, '#3a3a42', '#101018', 1.5); ctx.fillStyle = '#fff'; ctx.fillRect(st.x + 35 + i * 54, st.y + 14, 2, 8); }
  ctx.fillStyle = '#2e2e34'; ctx.fillRect(st.x - 4, st.y - 4, st.w + 8, 8); for (let i = 0; i < 2; i++) { const bx = st.x + 62 + i * 108, by = st.y - 6; ctx.fillStyle = '#18181e'; ctx.beginPath(); ctx.ellipse(bx, by, 36, 8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5a5a64'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 40, by); ctx.lineTo(bx + 40, by); ctx.moveTo(bx, by - 8); ctx.lineTo(bx, by + 8); ctx.stroke(); }
  // panela e chaleira
  ctx.fillStyle = '#b8bcc4'; rrect(ctx, st.x + 24, st.y - 66, 76, 60, 8); _fxShape(ctx, lg(ctx, st.x + 24, 0, st.x + 100, 0, [[0, '#d8dce2'], [1, '#8a909a']]), '#4a505a', 2); ctx.fillStyle = '#3a3e46'; ctx.fillRect(st.x + 100, st.y - 52, 22, 7); ctx.fillStyle = '#9aa0aa'; ctx.fillRect(st.x + 20, st.y - 70, 84, 7); ctx.fillStyle = '#3a3e46'; ctx.fillRect(st.x + 54, st.y - 78, 16, 8);
  ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.moveTo(st.x + 134, st.y - 6); ctx.bezierCurveTo(st.x + 128, st.y - 50, st.x + 196, st.y - 50, st.x + 190, st.y - 6); ctx.closePath(); _fxShape(ctx, lg(ctx, st.x + 130, 0, st.x + 190, 0, [[0, '#f26a52'], [1, '#b8362c']]), '#6a1a14', 2); ctx.fillStyle = '#6a1a14'; ctx.fillRect(st.x + 156, st.y - 58, 8, 10); ctx.strokeStyle = '#6a1a14'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(st.x + 162, st.y - 30, 22, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  // vapor
  ctx.save(); for (let i = 0; i < 5; i++) { const ph = ((t * .35 + i * .2) % 1); ctx.fillStyle = `rgba(255,255,255,${.22 * Math.sin(ph * Math.PI)})`; ctx.beginPath(); ctx.arc(st.x + 62 + Math.sin(ph * 6 + i) * 10, st.y - 84 - ph * 80, 8 + ph * 16, 0, TAU); ctx.fill(); } ctx.restore();
  // botijão de gás
  const bg = { x: 636, y: 396, w: 76, h: floorY - 396 };
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(bg.x + 38, floorY + 6, 50, 8, 0, 0, TAU); ctx.fill();
  rrect(ctx, bg.x, bg.y + 20, bg.w, bg.h - 20, 28); _fxShape(ctx, lg(ctx, bg.x, 0, bg.x + bg.w, 0, [[0, '#f2764a'], [.45, '#e0502a'], [1, '#a8301a']]), '#6a1a0c', 2.4);
  ctx.fillStyle = 'rgba(255,255,255,.28)'; rrect(ctx, bg.x + 10, bg.y + 40, 9, bg.h - 70, 4); ctx.fill(); ctx.fillStyle = '#7a1a0c'; ctx.fillRect(bg.x + 22, bg.y + 8, 32, 18); ctx.fillStyle = '#3a3a42'; ctx.fillRect(bg.x + 30, bg.y - 6, 16, 16); ctx.fillStyle = '#c8cdd2'; ctx.fillRect(bg.x + 14, bg.y + 20, 48, 6);
  ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bg.x + 38, bg.y - 6); ctx.quadraticCurveTo(bg.x - 40, bg.y - 30, st.x + st.w, st.y + 60); ctx.stroke();
  ctx.fillStyle = '#ffe8c8'; ctx.font = '15px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GÁS', bg.x + 38, bg.y + 80); ctx.font = '11px "Lilita One"'; ctx.fillText('P13', bg.x + 38, bg.y + 98);
  // ---- PAREDE DE BOLETOS ----
  const bw = { x: 752, y: 56, w: 490, h: 400 };
  ctx.fillStyle = 'rgba(0,0,0,.08)'; rrect(ctx, bw.x - 12, bw.y - 12, bw.w + 24, bw.h + 24, 16); ctx.fill();
  const labels = [['LUZ', '#e8b020', 'R$ 187,40'], ['ÁGUA', '#3a9ae0', 'R$ 94,10'], ['ALUGUEL', '#d8453a', 'R$ 650,00'], ['GÁS', '#e8703a', 'R$ 110,00'], ['ESCOLA', '#4aa860', 'R$ 78,90'], ['INTERNET', '#8a5ac8', 'R$ 99,90'], ['MERCADO', '#e04a8a', 'R$ 312,75'], ['CARTÃO', '#2a2a30', 'R$ 540,00'], ['REMÉDIO', '#2aa8a0', 'R$ 64,30'], ['ÔNIBUS', '#e0a020', 'R$ 220,00'], ['IPTU', '#6a7a8a', 'R$ 143,00'], ['LUZ', '#e8b020', 'R$ 201,15']];
  const nb = 26, r2 = rng(88), shown = bills * nb;
  for (let i = 0; i < nb; i++) {
    const u = clamp(shown - i); if (u <= 0) continue; const col = i % 7, rw = Math.floor(i / 7), L = labels[i % labels.length];
    const px = bw.x + 50 + (i % 6) * 78 + (rw % 2) * 34 + (r2() - .5) * 20, py = bw.y + 64 + Math.floor(i / 6) * 90 + (r2() - .5) * 18, rot = (r2() - .5) * .34, drop = u < 1 ? (1 - E.out3(u)) : 0;
    _fxBill(ctx, px + drop * 60, py - drop * 120, rot + drop * .5, .78 + r2() * .1, L[0], L[2], L[1], r2() < .35, i);
    if (u >= 1) { const rrr = r2(); if (rrr < .5) { ctx.fillStyle = 'rgba(255,240,150,.6)'; ctx.save(); ctx.translate(px, py - 44); ctx.rotate(rot + (rrr - .25)); ctx.fillRect(-12, -5, 24, 10); ctx.restore(); } else { ctx.fillStyle = '#e04a4a'; ctx.beginPath(); ctx.arc(px, py - 42, 3.6, 0, TAU); _fxShape(ctx, '#e04a4a', '#7a1a14', 1); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(px - 1.5, py - 44, 2, 2); } }
  }
  // calendário com dias riscados
  ctx.fillStyle = '#fffdf2'; ctx.fillRect(1118, 400, 108, 108); ctx.strokeStyle = 'rgba(80,70,60,.6)'; ctx.lineWidth = 1.2; ctx.strokeRect(1118, 400, 108, 108); ctx.fillStyle = '#d8453a'; ctx.fillRect(1118, 400, 108, 22); ctx.fillStyle = '#fff'; ctx.font = '13px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('DIA 5', 1172, 411);
  ctx.strokeStyle = 'rgba(70,60,70,.5)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(1118, 422 + i * 14); ctx.lineTo(1226, 422 + i * 14); ctx.stroke(); } ctx.strokeStyle = '#d8453a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(1186, 466, 11, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1130, 440); ctx.lineTo(1158, 454); ctx.moveTo(1158, 440); ctx.lineTo(1130, 454); ctx.stroke();
  // lâmpada pendurada
  ctx.strokeStyle = '#3a3030'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(300, 52); ctx.stroke(); ctx.fillStyle = '#ffeab0'; ctx.beginPath(); ctx.arc(300, 66, 14, 0, TAU); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 300, 66, 0, 360, [[0, `rgba(255,224,160,${.4 * lightA})`], [1, 'rgba(255,224,160,0)']]); ctx.fillRect(-100, -300, 800, 800); ctx.restore();
  fxDust(ctx, t, { x: 380, y: 90, w: 500, h: 380, n: 30, a: .6, seed: 4 });
  fxVignette(ctx, .5, '10,10,20');
  ctx.restore();
  return { fridge: fr, bills: bw, stove: st, floorY, lamp: [300, 66], door: { x: fr.x - 78, y: fr.y + 150, w: 78, h: fr.h - 160 } };
}

/* ---------- MURO / QUADRO DE GIZ ---------- */
function _fxChalkPath(ctx, pts, f, o = {}) { // traço de giz revelado até a fração f; retorna a ponta
  if (f <= 0) return null; const cum = _fxPlen(pts), L = cum[cum.length - 1], w = o.w || 4, col = o.col || '#f6f2e4', a = o.a == null ? .92 : o.a, r = rng(o.seed || 1);
  const draw = (wd, st, dash, jit) => {
    ctx.strokeStyle = st; ctx.lineWidth = wd; ctx.setLineDash(dash); ctx.beginPath(); pts.forEach((p, i) => { const jx = jit ? (r() - .5) * jit : 0, jy = jit ? (r() - .5) * jit : 0; i ? ctx.lineTo(p[0] + jx, p[1] + jy) : ctx.moveTo(p[0] + jx, p[1] + jy); }); ctx.stroke();
  };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const shown = Math.max(.01, L * f);
  ctx.globalAlpha = a * .5; draw(w * 1.9, col, [shown, L + 50], 1.5); ctx.globalAlpha = a; draw(w, col, [shown, L + 50], 0); ctx.globalAlpha = a * .5; draw(w * 1.1, 'rgba(24,34,30,.7)', [1, 5], 0); // grão: "come" o traço
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.restore();
  const tl = L * f; let i = 1; while (i < cum.length - 1 && cum[i] < tl) i++; const k = (tl - cum[i - 1]) / Math.max(.001, cum[i] - cum[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
}
const _fxCirc = (cx, cy, r, n = 28, a0 = 0, a1 = TAU) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
function intChalkWall(ctx, t, o = {}) {
  const P = o.p == null ? 1 : o.p, tone = o.tone || 'day', floorY = 580, board = { x: 110, y: 70, w: 1060, h: 380 };
  ctx.save();
  fxConcrete(ctx, 0, 0, W, floorY, { tone, seed: 5, light: .55, side: 'right', vig: .35, shade: .3, clean: true });
  // chão de rua: concreto escuro com juntas
  fxConcrete(ctx, 0, floorY, W, H - floorY, { tone, seed: 9, light: 0, vig: 0, shade: 0, clean: true });
  ctx.fillStyle = 'rgba(40,36,44,.25)'; ctx.fillRect(0, floorY, W, H - floorY); ctx.fillStyle = '#b8b2a8'; ctx.fillRect(0, floorY - 10, W, 12); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(0, floorY - 10, W, 2); ctx.fillStyle = lg(ctx, 0, floorY, 0, floorY + 40, [[0, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, floorY, W, 40);
  // quadro negro pintado no muro (moldura de tinta + borda irregular)
  ctx.save(); ctx.translate(board.x, board.y); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(8, 10, board.w, board.h);
  ctx.fillStyle = '#d6c8a0'; ctx.fillRect(-12, -12, board.w + 24, board.h + 24); ctx.strokeStyle = _fxInk('#d6c8a0', .5); ctx.lineWidth = 2; ctx.strokeRect(-12, -12, board.w + 24, board.h + 24);
  ctx.fillStyle = lg(ctx, 0, 0, board.w, board.h, [[0, '#2a3a36'], [.5, '#22302e'], [1, '#1a2624']]); ctx.fillRect(0, 0, board.w, board.h);
  const rr = rng(66); for (let i = 0; i < 22; i++) { ctx.fillStyle = `rgba(210,220,210,${.03 + rr() * .05})`; ctx.save(); ctx.translate(rr() * board.w, rr() * board.h); ctx.rotate(rr() * 1.5); ctx.fillRect(0, 0, 80 + rr() * 220, 20 + rr() * 40); ctx.restore(); } // marcas de apagador
  ctx.fillStyle = lg(ctx, 0, 0, 0, board.h, [[0, 'rgba(255,255,255,.08)'], [.2, 'rgba(255,255,255,0)']]); ctx.fillRect(0, 0, board.w, board.h);
  // pedra de giz, apagador na bandeja
  ctx.fillStyle = '#9a7a52'; ctx.fillRect(-12, board.h + 12, board.w + 24, 10); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-12, board.h + 12, board.w + 24, 2);
  ctx.fillStyle = '#f6f2e4'; ctx.fillRect(100, board.h + 6, 28, 7); ctx.fillStyle = '#ffd36b'; ctx.fillRect(138, board.h + 7, 22, 6); ctx.fillStyle = '#ff9ccf'; ctx.fillRect(168, board.h + 8, 18, 5);
  ctx.fillStyle = '#3a3a44'; ctx.fillRect(900, board.h - 2, 70, 14); ctx.fillStyle = '#8a6a4a'; ctx.fillRect(900, board.h - 14, 70, 14);
  ctx.restore();
  // ---- desenhos (sequenciais) ----
  const B = (x, y) => [board.x + x, board.y + y], items = [];
  const ch = '#f6f2e4', yl = '#ffd36b', pk = '#ffb0d6', bl = '#a8d8ff';
  // 1 sol
  items.push({ pts: _fxCirc(...B(150, 100), 34), col: yl, w: 4 });
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; items.push({ pts: [B(150 + Math.cos(a) * 46, 100 + Math.sin(a) * 46), B(150 + Math.cos(a) * 66, 100 + Math.sin(a) * 66)], col: yl, w: 3.4, d: .2 }); }
  // 2 casa
  items.push({ pts: [B(260, 230), B(260, 160), B(320, 110), B(380, 160), B(380, 230), B(260, 230)], col: ch, w: 4 }); items.push({ pts: [B(305, 230), B(305, 185), B(335, 185), B(335, 230)], col: pk, w: 3.5 });
  // 3 conta
  items.push({ text: '2 + 2 = 4', x: B(450, 120)[0], y: B(450, 120)[1], size: 62, col: ch, w: 1 });
  items.push({ text: 'A RUA ENSINA', x: B(400, 200)[0], y: B(430, 200)[1], size: 42, col: bl, w: 1 });
  // 4 menina esticando a mão pra uma estrela
  const gx = 800, gy = 260; items.push({ pts: _fxCirc(...B(gx, gy - 70), 16), col: ch, w: 3.6 }); items.push({ pts: [B(gx, gy - 54), B(gx, gy), B(gx - 18, gy + 58)], col: ch, w: 3.6 }); items.push({ pts: [B(gx, gy), B(gx + 18, gy + 58)], col: ch, w: 3.6 }); items.push({ pts: [B(gx, gy - 38), B(gx + 50, gy - 78), B(gx + 100, gy - 120)], col: ch, w: 3.6 }); items.push({ pts: [B(gx, gy - 38), B(gx - 36, gy - 8)], col: ch, w: 3.6 });
  items.push({ pts: [B(gx - 20, gy - 88), B(gx - 30, gy - 108), B(gx - 8, gy - 98)], col: ch, w: 3.2, d: .3 });
  // 5 estrela de 8 pontas
  { const cx = 900, cy = 90, pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU - Math.PI / 2, rr2 = i % 2 ? 22 : 56; pts.push(B(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2)); } items.push({ pts, col: yl, w: 4 }); }
  // 6 cicatriz que vira estrelas
  { const pts = [B(850, 300), B(880, 280), B(905, 305), B(935, 282), B(960, 310), B(990, 290)]; items.push({ pts, col: yl, w: 4.5 }); [[880, 280], [935, 282], [990, 290]].forEach(([sx, sy]) => { for (let q = 0; q < 2; q++) items.push({ pts: [B(sx - 12 + q * 12, sy - 12 - q * 12 + (q ? 24 : 0)), B(sx + 12 - q * 12, sy + 12 + q * 12 - (q ? 24 : 0))], col: ch, w: 2.6, d: .12 }); }); }
  // 7 mapa/constelação
  { const cs = [[110, 350], [180, 310], [250, 345], [330, 300], [400, 340]]; items.push({ pts: cs.map(c => B(c[0], c[1])), col: bl, w: 2.8 }); cs.forEach(c => items.push({ pts: _fxCirc(...B(c[0], c[1]), 5, 10), col: ch, w: 3, d: .1 })); }
  // 8 coração
  { const pts = []; for (let i = 0; i <= 36; i++) { const a = i / 36 * TAU; pts.push(B(620 + 16 * Math.pow(Math.sin(a), 3) * 1.5, 335 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 1.5)); } items.push({ pts, col: pk, w: 4 }); }
  // peso total para temporizar cada item
  const wts = items.map(it => it.text ? 1.4 : it.d || (it.pts.length > 12 ? .9 : .6)), tot = wts.reduce((a, b) => a + b, 0); let acc = 0, tip = null;
  ctx.save(); ctx.beginPath(); ctx.rect(board.x, board.y, board.w, board.h); ctx.clip();
  items.forEach((it, k) => {
    const a0 = acc / tot, a1 = (acc + wts[k]) / tot; acc += wts[k]; const f = clamp((P - a0) / (a1 - a0)); if (f <= 0) return;
    if (it.text) { ctx.save(); ctx.font = `${it.size}px "Permanent Marker", "Lilita One", sans-serif`; ctx.textBaseline = 'alphabetic'; const tw = ctx.measureText(it.text).width; ctx.beginPath(); ctx.rect(it.x - 6, it.y - it.size, (tw + 12) * f, it.size * 1.4); ctx.clip();
      ctx.globalAlpha = .5; ctx.fillStyle = it.col; ctx.fillText(it.text, it.x + .8, it.y + .8); ctx.globalAlpha = .92; ctx.fillText(it.text, it.x, it.y); ctx.restore(); tip = [it.x + tw * f, it.y - it.size * .3]; }
    else tip = _fxChalkPath(ctx, it.pts, f, { col: it.col, w: it.w, seed: k + 3 }) || tip;
  });
  ctx.restore();
  // amarelinha no chão (perspectiva leve)
  const hp = clamp((P - .8) / .2);
  if (hp > 0) { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 8; i++) { if (i / 8 > hp) continue; const bx = 300 + i * 84 + (i > 4 ? 0 : 0), by = floorY + 64 + (i % 2) * 6, wd = 76 - i * 2, hh = 44 - i * 1.5;
    ctx.strokeStyle = 'rgba(246,242,228,.85)'; ctx.lineWidth = 3; ctx.strokeRect(bx - wd / 2, by - hh / 2, wd, hh); ctx.fillStyle = 'rgba(246,242,228,.9)'; ctx.font = '22px "Permanent Marker", "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, bx, by); } ctx.restore(); }
  // poeira de giz caindo da ponta
  if (tip && P < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const ph = ((t * 1.3 + i * .125) % 1); ctx.fillStyle = `rgba(255,255,245,${.5 * (1 - ph)})`; ctx.beginPath(); ctx.arc(tip[0] + Math.sin(i * 3 + t * 5) * 6, tip[1] + ph * 24, 1.2 + (i % 3) * .5, 0, TAU); ctx.fill(); } ctx.restore(); }
  fxVignette(ctx, .35, '14,16,24');
  ctx.restore();
  return { tip: tip || [board.x + 40, board.y + 40], floorY, board };
}

/* ---------- MESA DE FAMÍLIA (cadeira vazia do pai + casaco no gancho) ---------- */
function _fxChair(ctx, x, y, s, flip, col = '#a8744a', pushed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip * s, s); ctx.translate(pushed, 0); ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(10, 4, 58, 9, 0, 0, TAU); ctx.fill();
  const ink = _fxInk(col, .5); // pernas
  for (const lx of [-34, 40]) { ctx.fillStyle = col; ctx.fillRect(lx - 5, -92, 10, 92); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(lx - 5, -92, 10, 92); }
  rrect(ctx, -46, -104, 98, 16, 6); _fxShape(ctx, lg(ctx, 0, -104, 0, -88, [[0, '#c48a5a'], [1, col]]), ink, 2.2);        // assento
  for (const [yy, hh] of [[-206, 20], [-170, 18]]) { rrect(ctx, -48, yy, 14, hh, 4); _fxShape(ctx, col, ink, 2); }
  ctx.fillStyle = col; ctx.fillRect(-46, -214, 12, 112); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(-46, -214, 12, 112);
  rrect(ctx, -52, -222, 24, 20, 6); _fxShape(ctx, '#c48a5a', ink, 2);
  ctx.restore();
}
function intFamilyTable(ctx, t, o = {}) {
  const L = o.light == null ? 1 : o.light, steam = o.steam == null ? 1 : o.steam, floorY = 600;
  ctx.save();
  _fxPaintWall(ctx, 0, 0, W, floorY, '#b8905a', 31, { a: .62 });
  ctx.fillStyle = lg(ctx, 0, 0, 0, floorY, [[0, 'rgba(20,12,24,.72)'], [.5, 'rgba(20,12,24,.2)'], [1, 'rgba(20,12,24,.35)']]); ctx.fillRect(0, 0, W, floorY);
  ctx.fillStyle = '#6a4636'; ctx.fillRect(0, floorY - 120, W, 120); ctx.fillStyle = 'rgba(255,230,180,.15)'; ctx.fillRect(0, floorY - 120, W, 3);
  ctx.fillStyle = '#d6c4a0'; ctx.fillRect(0, floorY - 12, W, 12);
  ctx.fillStyle = '#4a3226'; ctx.fillRect(0, floorY, W, H - floorY); for (let yy = floorY, k = 0; yy < H; yy += 40, k++) for (let xx = -(k % 2) * 60; xx < W; xx += 120) { ctx.fillStyle = (xx / 120 + k) % 2 ? 'rgba(255,230,190,.05)' : 'rgba(0,0,0,.12)'; ctx.fillRect(xx, yy, 60, 40); }
  // janela escura à esquerda (noite)
  const wx = 110, wy = 110, ww = 240, wh = 230; ctx.fillStyle = lg(ctx, 0, wy, 0, wy + wh, [[0, '#0e1a32'], [1, '#243a5a']]); ctx.fillRect(wx, wy, ww, wh); for (let i = 0; i < 14; i++) { ctx.fillStyle = `rgba(255,240,210,${.4 + hash2(i, 2) * .5})`; ctx.fillRect(wx + hash2(i, 5) * ww, wy + hash2(i, 8) * wh * .6, 2, 2); }
  ctx.fillStyle = '#ffd98a'; ctx.fillRect(wx + 30, wy + 170, 6, 8); ctx.fillRect(wx + 150, wy + 190, 6, 8); ctx.fillRect(wx + 190, wy + 160, 6, 8);
  ctx.strokeStyle = '#d8c8a8'; ctx.lineWidth = 9; ctx.strokeRect(wx, wy, ww, wh); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.07)'; poly(ctx, [[wx + 20, wy], [wx + 80, wy], [wx, wy + wh], [wx - 40, wy + wh]]); ctx.fill();
  // lâmpada pendurada + luz
  const lx = 700, ly = 150; ctx.strokeStyle = '#2a2020'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, ly - 22); ctx.stroke(); ctx.fillStyle = '#4a3a30'; ctx.fillRect(lx - 9, ly - 24, 18, 14);
  ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.arc(lx, ly, 16, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, lx, ly, 0, 520, [[0, `rgba(255,214,140,${.5 * L})`], [.3, `rgba(255,170,80,${.18 * L})`], [1, 'rgba(255,150,60,0)']]); ctx.fillRect(lx - 520, ly - 520, 1040, 1040);
  ctx.fillStyle = lg(ctx, lx, ly, lx, floorY, [[0, `rgba(255,224,160,${.22 * L})`], [1, `rgba(255,200,120,${.03 * L})`]]); poly(ctx, [[lx - 10, ly + 8], [lx + 10, ly + 8], [lx + 360, floorY + 20], [lx - 360, floorY + 20]]); ctx.fill(); ctx.restore();
  // mesa com toalha xadrez
  const tb = { x: 400, y: 420, w: 560, h: 18 };
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(tb.x + tb.w / 2, floorY + 14, tb.w / 2 + 20, 14, 0, 0, TAU); ctx.fill();
  for (const lx2 of [tb.x + 36, tb.x + tb.w - 50]) { ctx.fillStyle = '#7a5236'; ctx.fillRect(lx2, tb.y + tb.h, 14, floorY - tb.y - tb.h); ctx.strokeStyle = _fxInk('#7a5236'); ctx.lineWidth = 2; ctx.strokeRect(lx2, tb.y + tb.h, 14, floorY - tb.y - tb.h); }
  // cadeiras (mãe à esquerda, irmão à direita-frente) + cadeira do PAI vazia, afastada, no canto direito
  _fxChair(ctx, 350, floorY + 8, 1.12, -1, '#a8744a');
  _fxChair(ctx, 1050, floorY + 8, 1.12, 1, '#a8744a', -12);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 1030, floorY - 150, 0, 220, [[0, `rgba(255,214,140,${.2 * L})`], [1, 'rgba(255,214,140,0)']]); ctx.fillRect(800, floorY - 380, 460, 460); ctx.restore();
  // tampo + toalha
  ctx.save(); ctx.fillStyle = '#e8d0a8'; rrect(ctx, tb.x - 10, tb.y, tb.w + 20, tb.h, 6); _fxShape(ctx, '#e8d0a8', _fxInk('#c8a878'), 2);
  ctx.beginPath(); ctx.moveTo(tb.x - 10, tb.y - 2); ctx.lineTo(tb.x + tb.w + 10, tb.y - 2); ctx.lineTo(tb.x + tb.w + 24, tb.y + 70); ctx.lineTo(tb.x - 24, tb.y + 70); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#f6e6dc'; ctx.fillRect(tb.x - 30, tb.y - 4, tb.w + 60, 80); for (let xx = tb.x - 30, i = 0; xx < tb.x + tb.w + 30; xx += 26, i++) { ctx.fillStyle = 'rgba(214,69,58,.5)'; ctx.fillRect(xx, tb.y - 4, 13, 80); } for (let yy = tb.y - 4, i = 0; yy < tb.y + 76; yy += 26, i++) { ctx.fillStyle = 'rgba(214,69,58,.45)'; ctx.fillRect(tb.x - 30, yy, tb.w + 60, 13); }
  ctx.restore(); ctx.strokeStyle = _fxInk('#d6453a', .3); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tb.x - 10, tb.y - 2); ctx.lineTo(tb.x + tb.w + 10, tb.y - 2); ctx.stroke();
  // pratos: 2 com comida, o do pai vazio e arrumado
  const plate = (px, py, food, empty) => { ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(px + 3, py + 4, 46, 11, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(px, py, 46, 11, 0, 0, TAU); _fxShape(ctx, '#fffaf0', '#b8aa90', 1.6); ctx.beginPath(); ctx.ellipse(px, py, 32, 7, 0, 0, TAU); ctx.strokeStyle = 'rgba(160,140,110,.45)'; ctx.lineWidth = 1; ctx.stroke(); if (food) { ctx.fillStyle = '#f4f0e0'; ctx.beginPath(); ctx.ellipse(px - 9, py - 2, 14, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6a3a22'; ctx.beginPath(); ctx.ellipse(px + 12, py - 1, 11, 5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#4aa84a'; ctx.beginPath(); ctx.ellipse(px, py - 4, 6, 3, 0, 0, TAU); ctx.fill(); } };
  plate(500, tb.y - 2, true); plate(660, tb.y - 2, true); plate(850, tb.y - 2, false);
  // copo e talheres do lugar vazio (guardanapo dobrado)
  ctx.fillStyle = '#ffffff'; poly(ctx, [[880, tb.y - 6], [908, tb.y - 6], [906, tb.y + 6], [878, tb.y + 6]]); ctx.fill(); ctx.strokeStyle = '#b8aa90'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(190,225,245,.55)'; poly(ctx, [[918, tb.y - 40], [938, tb.y - 40], [935, tb.y - 4], [921, tb.y - 4]]); ctx.fill(); ctx.strokeStyle = 'rgba(120,170,200,.8)'; ctx.stroke();
  // panela no centro com vapor
  ctx.fillStyle = '#9aa0aa'; rrect(ctx, 735, tb.y - 52, 88, 52, 8); _fxShape(ctx, lg(ctx, 735, 0, 823, 0, [[0, '#c8ccd4'], [1, '#6a707a']]), '#3a4048', 2); ctx.fillStyle = '#2a2e36'; ctx.fillRect(823, tb.y - 38, 20, 7); ctx.fillStyle = '#7a808a'; ctx.fillRect(730, tb.y - 56, 98, 7);
  if (steam > 0) { ctx.save(); for (let i = 0; i < 6; i++) { const ph = ((t * .3 + i * .17) % 1); ctx.fillStyle = `rgba(255,255,255,${.2 * Math.sin(ph * Math.PI) * steam})`; ctx.beginPath(); ctx.arc(780 + Math.sin(ph * 5 + i) * 12, tb.y - 70 - ph * 100, 10 + ph * 18, 0, TAU); ctx.fill(); } ctx.restore(); }
  // gancho com o casaco do pai (parede da direita)
  const hx = 1170, hy = 176; ctx.fillStyle = '#4a3a30'; ctx.fillRect(hx - 4, hy - 20, 8, 28); ctx.beginPath(); ctx.arc(hx, hy + 8, 8, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,214,140,.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.translate(hx, hy + 14); ctx.rotate(Math.sin(t * .7) * .012);
  const jc = '#34506e'; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.quadraticCurveTo(-52, 4, -66, 40); ctx.lineTo(-76, 190); ctx.lineTo(-52, 196); ctx.lineTo(-42, 70); ctx.lineTo(-44, 230); ctx.quadraticCurveTo(0, 246, 44, 230); ctx.lineTo(42, 70); ctx.lineTo(52, 196); ctx.lineTo(76, 190); ctx.lineTo(66, 40); ctx.quadraticCurveTo(52, 4, 8, -4); ctx.closePath(); _fxShape(ctx, lg(ctx, -76, 0, 76, 0, [[0, '#4a6a8e'], [.6, jc], [1, '#22364e']]), _fxInk(jc, .55), 2.4);
  ctx.strokeStyle = 'rgba(10,20,40,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, 236); ctx.moveTo(-30, 120); ctx.quadraticCurveTo(-20, 150, -32, 190); ctx.moveTo(26, 100); ctx.quadraticCurveTo(34, 150, 22, 200); ctx.stroke();
  ctx.fillStyle = '#e8c88a'; ctx.beginPath(); ctx.moveTo(-16, -4); ctx.lineTo(0, 30); ctx.lineTo(16, -4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2a4260'; poly(ctx, [[-16, -2], [-34, 20], [-12, 32], [0, 14]]); ctx.fill(); poly(ctx, [[16, -2], [34, 20], [12, 32], [0, 14]]); ctx.fill();
  ctx.fillStyle = '#d8b878'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 56 + i * 44, 4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#243a54'; rrect(ctx, -34, 150, 24, 30, 3); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, hx, hy + 120, 0, 200, [[0, `rgba(255,214,140,${.16 * L})`], [1, 'rgba(255,214,140,0)']]); ctx.fillRect(hx - 220, hy - 80, 440, 440); ctx.restore();
  // poeira dourada flutuando sobre a cadeira vazia
  fxDust(ctx, t, { x: 940, y: 300, w: 220, h: 300, n: 18, a: .75, seed: 8, size: 1.3 });
  fxVignette(ctx, .55, '10,6,14');
  ctx.restore();
  return { chairPai: { x: 1038, y: floorY }, coat: { x: hx, y: hy + 120 }, table: tb, floorY, lamp: [lx, ly], plates: [[500, tb.y], [660, tb.y], [850, tb.y]] };
}

/* ---------- PORTA com a luz quente da lâmpada acesa ---------- */
function intDoorway(ctx, t, o = {}) {
  const open = o.open == null ? .55 : o.open, cx = o.cx == null ? 640 : o.cx, floorY = o.floorY || 600, G = o.glow == null ? 1 : o.glow, bulb = o.bulb == null ? 1 : o.bulb;
  const D = { x: cx - 95, y: floorY - 380, w: 190, h: 380 };
  ctx.save();
  fxConcrete(ctx, 0, 0, W, floorY, { tone: 'night', seed: 7, light: .2, side: 'top', vig: .5, shade: .2, clean: true });
  ctx.fillStyle = lg(ctx, 0, floorY, 0, H, [[0, '#2a323c'], [1, '#161c26']]); ctx.fillRect(0, floorY, W, H - floorY); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(0, floorY, W, 3);
  // luz do poste/lâmpada na parede
  const bx = cx + 150, by = D.y - 34;
  // degrau
  ctx.fillStyle = '#5a6068'; ctx.fillRect(D.x - 24, floorY - 18, D.w + 48, 18); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(D.x - 24, floorY - 18, D.w + 48, 3);
  // batente turquesa descascando
  ctx.fillStyle = '#2a8a86'; ctx.fillRect(D.x - 14, D.y - 14, D.w + 28, D.h + 14 - 18); ctx.strokeStyle = _fxInk('#2a8a86', .5); ctx.lineWidth = 2.4; ctx.strokeRect(D.x - 14, D.y - 14, D.w + 28, D.h + 14 - 18);
  { const rr = rng(4); ctx.fillStyle = 'rgba(190,170,140,.8)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(D.x - 14 + rr() * (D.w + 28), D.y - 14 + rr() * 60, 4 + rr() * 6, 2 + rr() * 3, rr() * 3, 0, TAU); ctx.fill(); } }
  // interior quente
  const inY = D.y, inH = D.h - 18; ctx.save(); ctx.beginPath(); ctx.rect(D.x, inY, D.w, inH); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, inY, 0, inY + inH, [[0, '#ffdfa0'], [.6, '#f2a95a'], [1, '#a85a2c']]); ctx.fillRect(D.x, inY, D.w, inH);
  ctx.fillStyle = 'rgba(120,50,20,.35)'; ctx.fillRect(D.x, inY + inH - 130, D.w, 130); // móveis em silhueta
  ctx.fillStyle = 'rgba(110,50,20,.5)'; rrect(ctx, D.x + 20, inY + inH - 120, 90, 8, 3); ctx.fill(); ctx.fillRect(D.x + 30, inY + inH - 112, 6, 112); ctx.fillRect(D.x + 96, inY + inH - 112, 6, 112);
  ctx.fillStyle = 'rgba(255,255,230,.9)'; ctx.beginPath(); ctx.arc(D.x + D.w * .5, inY + 30, 12, 0, TAU); ctx.fill(); ctx.fillStyle = rg(ctx, D.x + D.w * .5, inY + 30, 0, 170, [[0, 'rgba(255,255,230,.8)'], [1, 'rgba(255,230,160,0)']]); ctx.fillRect(D.x, inY, D.w, 220);
  ctx.restore();
  // folha da porta aberta (para dentro, dobradiça à esquerda)
  const dw = D.w * (1 - open * .85) * .0 + D.w * .22 * (open), k = open;
  if (k > .02) { ctx.beginPath(); ctx.moveTo(D.x, D.y); ctx.lineTo(D.x + dw, D.y + 16 * k); ctx.lineTo(D.x + dw, D.y + inH - 16 * k); ctx.lineTo(D.x, D.y + inH); ctx.closePath(); _fxShape(ctx, lg(ctx, D.x, 0, D.x + dw, 0, [[0, '#35a09a'], [1, '#1e6a66']]), _fxInk('#2a8a86', .55), 2.2); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(D.x + dw - 5, D.y + inH * .52, 4, 0, TAU); ctx.fill(); }
  else { ctx.fillStyle = '#35a09a'; ctx.fillRect(D.x, D.y, D.w, inH); }
  // luz derramando para fora (chão + raios)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lg(ctx, cx, floorY, cx, H, [[0, `rgba(255,190,100,${.55 * G * k})`], [1, `rgba(255,170,80,0)`]]); poly(ctx, [[D.x + dw * .6, floorY - 2], [D.x + D.w, floorY - 2], [D.x + D.w + 230, H], [D.x - 170, H]]); ctx.fill();
  ctx.fillStyle = rg(ctx, cx, floorY - 130, 0, 360, [[0, `rgba(255,200,120,${.5 * G * k})`], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(cx - 360, floorY - 500, 720, 760);
  ctx.restore();
  fxLightShafts(ctx, cx, floorY - 160, .7, 640, { n: 5, spread: .6, w: 50, a: .22 * G * k, t, col: '255,200,120', dust: 1, seed: 6 });
  // lâmpada externa acesa
  ctx.strokeStyle = '#1c1c22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 40, by + 8); ctx.lineTo(bx, by + 8); ctx.lineTo(bx, by + 18); ctx.stroke(); ctx.fillStyle = '#2c2c34'; ctx.fillRect(bx - 10, by + 12, 20, 10);
  ctx.fillStyle = `rgb(255,${236 - (1 - bulb) * 80},${180 - (1 - bulb) * 100})`; ctx.beginPath(); ctx.arc(bx, by + 34, 13, 0, TAU); ctx.fill();
  const fl = .93 + .07 * Math.sin(t * 17); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, bx, by + 34, 0, 330 * fl, [[0, `rgba(255,214,140,${.6 * bulb * G})`], [.3, `rgba(255,170,80,${.2 * bulb * G})`], [1, 'rgba(255,150,60,0)']]); ctx.fillRect(bx - 330, by - 300, 660, 660);
  for (let i = 0; i < 5; i++) { const a = t * 2.2 + i * 1.3, rr = 22 + i * 6; ctx.fillStyle = 'rgba(255,248,220,.9)'; ctx.beginPath(); ctx.arc(bx + Math.cos(a) * rr, by + 34 + Math.sin(a * 1.3) * rr * .7, 1.6, 0, TAU); ctx.fill(); } ctx.restore();
  // capacho, sapatos, vaso
  ctx.fillStyle = '#6a4a3a'; rrect(ctx, D.x + 20, floorY + 4, D.w - 40, 20, 5); _fxShape(ctx, '#6a4a3a', _fxInk('#6a4a3a'), 2); ctx.strokeStyle = 'rgba(255,214,160,.3)'; ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(D.x + 30 + i * 14, floorY + 8); ctx.lineTo(D.x + 30 + i * 14, floorY + 20); ctx.stroke(); }
  ctx.fillStyle = '#c8453a'; ctx.beginPath(); ctx.ellipse(D.x - 50, floorY - 8, 22, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8a030'; ctx.beginPath(); ctx.ellipse(D.x - 78, floorY - 6, 20, 7, .1, 0, TAU); ctx.fill();
  ctx.fillStyle = '#b8603a'; poly(ctx, [[D.x + D.w + 40, floorY], [D.x + D.w + 80, floorY], [D.x + D.w + 74, floorY - 44], [D.x + D.w + 46, floorY - 44]]); _fxShape(ctx, '#b8603a', _fxInk('#b8603a'), 2);
  ctx.fillStyle = '#3aa860'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(D.x + D.w + 60, floorY - 44); ctx.rotate(-1 + i * .5); ctx.beginPath(); ctx.ellipse(0, -18, 6, 20, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  fxDust(ctx, t, { x: D.x - 60, y: D.y, w: D.w + 220, h: D.h, n: 30, a: .8, seed: 2 });
  fxVignette(ctx, .45, '6,10,22');
  ctx.restore();
  return { door: D, floorY, spill: [cx, floorY + 60], bulb: [bx, by + 34] };
}
