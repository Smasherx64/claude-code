'use strict';
/* ============================================================================
   world.js — KIT DO MUNDO (Luz na Periferia, vertical 720x1280 lógico)
   Dono: agente WORLD. Tudo determinístico (rng com semente), prefixo wr*.
   Todas as funções recebem ctx já com a transformação de escala (SC) aplicada.
   `mood` contínuo: 0 noite profunda · 1 hora azul · 2 pôr do sol · 3 amanhecer ·
                    4 cósmico neon · 5 cinza-chumbo diurno.

   initWorld()                         caches offscreen (estrelas, nuvens, via láctea). main chama após as fontes.
   wrMood(m)                           paleta interpolada {top,mid,hor,glow,tint,fog,rim,win[6],lit,star,cloud,cloudHi,...}

   CIDADE
   drawSkyline(ctx,camX,baseY,mood,o)  6 camadas de paralaxe. o={t,lit,fog,haze,hillH,seed,noLayer:[i],layerY:n|[n..],camY,beat,glow}
        -> {tops:[y médio do topo de cada camada], base, hillH, yAt(i,sx)->y do topo (blocos) na camada i em x de tela, par:[..]}
        camX é o deslocamento da câmera (px); camada i anda camX*par[i] (0.04..0.8). Tile de 1080px, repetição infinita.
   CÉUS
   drawSky(ctx,mood,t,o)               gradiente + estrelas + via láctea + nuvens + faixas cósmicas. o={hy,sx,stars,clouds,seed,rain,glow,cam}
   drawCloudBand(ctx,y,t,o)            o={col,hi,a,speed,scale,n,h,seed,sq}
   drawMoon(ctx,x,y,R,o)               o={glow,col,phase,seed}
   drawSun(ctx,x,y,R,o)                o={t,col:'r,g,b',glow,rays,rayA,nRays}
   godRays(ctx,x,y,t,o)                o={n,len,a,col:'r,g,b',sp,w,a0,a1,seed}
   shootingStar(ctx,t,seed,o)          o={period,dur,len,col,a,p (0..1 progresso manual),x0,y0,ang}
   PRIMEIRO PLANO / CENÁRIOS
   drawRoofline(ctx,y,camX,o)          laje + mureta + caixas + varal + antena. o={t,mood,seed,col,items}
   drawPoles(ctx,camX,y,o)             postes + fios catenária + bandeirinhas. o={t,gap,h,par,sag,wires,flags,s,mood,col}
   drawStairs(ctx,x,y,n,o)             escada diagonal (perfil) ->[{x,y}] topo de cada degrau. o={sw,sh,mood,rail,col}
   drawStreetVP(ctx,t,o)               rua em ponto de fuga. o={mood,speed,vy,cam,glow,birds} ->{vx,vy,proj(side,d,h)}
   drawGrafWall(ctx,x,y,w,h,o)         muro com grafite. o={seed,words,light,mood}
   drawSchoolGate(ctx,x,y,w,h,o)       portão fechado + cadeado. o={open,mood,name}
   drawDoorLight(ctx,x,y,w,h,t,o)      retângulo de luz + cone volumétrico. o={col,floorY,coneLen,a,open}
   drawPolaroid(ctx,x,y,s,rot,o)       foto quente mãe+filho. o={fade 0..1 (desfaz o pai), t, seed}
   drawFridge(ctx,x,y,s,open,o)        geladeira (open 0..1), luz fria. o={t,full}
   drawBill(ctx,x,y,rot,s,o)           boleto. o={stamp,col,a}
   billRain(ctx,t,seed,o)              chuva de boletos. o={n,box:{x,y,w,h},speed,a}
   drawKite(ctx,x,y,s,rot,t,o)         pipa + LINHA até o.anchor{x,y}. o={anchor,tail,cut,lineLen,sag,pal,glow}
   drawTightrope(ctx,x0,y0,x1,y1,t,o) ->{yAt(x),pts}  o={sag,sway,col,posts}
   wrZigzag(x0,y0,x1,y1,n,amp,seed)   -> pts de zigue-zague
   drawNeonPath(ctx,pts,prog,t,o)      linha neon dourada que se escreve. o={col,w,glow}
   drawPortalRing(ctx,x,y,R,rot,t,o)   anéis de luz elípticos. o={squash,col,a,n}
   drawConstellation(ctx,pts,prog,t,o) o={a,lines,sz,col}
   drawEmblem(ctx,x,y,R,t,o)           estrela-bússola de vidro + raio dourado. o={rot,rays,flare,bolt,glow,a,spin}
   drawPhone(ctx,x,y,s,rot,o)          celular 'sem sinal'. o={t,msg}
   drawClock(ctx,x,y,R,t,o)            relógio. o={h,m,sec,glow,col}
   ============================================================================ */

const WR_TW = 1080, WR_CS = 1.5, WR_N = 6;
const WR_MOODS = [
  { top: '#04050e', mid: '#10113a', hor: '#2b2468', glow: '#6a4cae', tint: '#1d1b4a', hk: .35, amb: .55, lit: .22, fog: '#2a2468', star: 1, cloud: '#161643', cloudHi: '#4a3f8c', rim: '#8f86ff', ground: '#07070f',
    win: ['#ffb43c', '#ffc861', '#ff9d2e', '#ffd98a', '#ff9a4a', '#ffc247'] },
  { top: '#0b0f3c', mid: '#2d3484', hor: '#8a7fd0', glow: '#e99ac0', tint: '#2e2f78', hk: .45, amb: .7, lit: .45, fog: '#5a5aa8', star: .55, cloud: '#33387f', cloudHi: '#c58ac0', rim: '#b9a8ff', ground: '#0a0a1c',
    win: ['#ffc247', '#ffd98a', '#ffae42', '#fff0c0', '#ffb35a', '#ffe3a0'] },
  { top: '#2a1858', mid: '#9a3f80', hor: '#ff9a50', glow: '#ffbf6a', tint: '#7a3a50', hk: .7, amb: .85, lit: .6, fog: '#d8806e', star: .1, cloud: '#8a3f78', cloudHi: '#ffb070', rim: '#ffc890', ground: '#14091c',
    win: ['#ffd25a', '#ffe08a', '#ffb347', '#fff0c0', '#ffc247', '#ffe3a0'] },
  { top: '#2e3a7a', mid: '#c97fa0', hor: '#ffd8a0', glow: '#ffe6b0', tint: '#6a5a86', hk: .6, amb: .85, lit: .35, fog: '#e8b8b0', star: .15, cloud: '#a8709a', cloudHi: '#fff0d0', rim: '#ffe0b0', ground: '#171024',
    win: ['#ffc247', '#ffd98a', '#ffae42', '#fff0c0', '#ffb35a', '#ffe3a0'] },
  { top: '#3a1688', mid: '#a838c0', hor: '#ff6ab8', glow: '#ff9ad0', tint: '#6a4a96', hk: .5, amb: 1.0, lit: 1, fog: '#d070d0', star: 1, cloud: '#a050d0', cloudHi: '#ffb0e8', rim: '#ffd0f0', ground: '#2a1450',
    win: ['#35d6ff', '#ff6ab8', '#ffd23f', '#ffffff', '#a98cff', '#6dff9c'] },
  { top: '#5c636c', mid: '#868b92', hor: '#bdbab2', glow: '#e8e0cc', tint: '#8c8e94', hk: .25, amb: .95, lit: .12, fog: '#a8a8aa', star: 0, cloud: '#8e9298', cloudHi: '#d8d6d0', rim: '#f0ece0', ground: '#4a4c52',
    win: ['#ffe9b0', '#fff0c8', '#ffe0a0', '#ffffff', '#ffe9b0', '#fff0c8'] },
];
const WR_NUMK = ['hk', 'amb', 'lit', 'star'], WR_COLK = ['top', 'mid', 'hor', 'glow', 'tint', 'fog', 'cloud', 'cloudHi', 'rim', 'ground'];
const _wrMc = {};
function wrMood(m) {
  m = clamp(m, 0, 5); const key = Math.round(m * 40); if (_wrMc[key]) return _wrMc[key];
  m = key / 40; const i = Math.min(4, Math.floor(m)), f = m - i, a = WR_MOODS[i], b = WR_MOODS[i + 1], r = { m };
  for (const k of WR_COLK) r[k] = mix(a[k], b[k], f);
  for (const k of WR_NUMK) r[k] = lerp(a[k], b[k], f);
  r.win = a.win.map((c, j) => mix(c, b.win[j], f));
  r.k4 = clamp(1 - Math.abs(m - 4) / 1.2); r.dark = clamp(1 - m / 2.2) * (m < 3 ? 1 : 0);
  return (_wrMc[key] = r);
}
const wrRGB = c => { const A = hex(c); return A[0] + ',' + A[1] + ',' + A[2]; };
const wrCol = (c, a) => (c.indexOf(',') > 0 && c[0] !== 'r' ? `rgba(${c},${a})` : rgba(c, a));

let _wrInit = false, _wrStars, _wrMW, _wrCloud = [], _wrScr, _wrGlow;
function initWorld() {
  if (_wrInit) return; _wrInit = true;
  // estrelas
  const R = rng(4242); _wrStars = [];
  for (let i = 0; i < 360; i++) _wrStars.push({ x: R() * W, y: Math.pow(R(), 1.25) * 1100, s: R() < .08 ? 2 + R() * 2.2 : .6 + R() * 1.1, ph: R() * 6.28, sp: .6 + R() * 2.4, b: R(), c: R() });
  // via láctea (baixa resolução, escala ×2)
  _wrMW = document.createElement('canvas'); _wrMW.width = 360; _wrMW.height = 640; const g = _wrMW.getContext('2d'), r2 = rng(77);
  g.translate(180, 320); g.rotate(-.5);
  for (let i = 0; i < 70; i++) { const x = (r2() - .5) * 760, y = (r2() - .5) * 90 * (1 - Math.abs(x) / 480 * .4), rr = 30 + r2() * 60; g.fillStyle = rg(g, x, y, 0, rr, [[0, `rgba(190,190,255,${.05 + r2() * .06})`], [1, 'rgba(120,120,255,0)']]); g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  for (let i = 0; i < 700; i++) { const x = (r2() - .5) * 760, y = (r2() + r2() - 1) * 50; g.fillStyle = `rgba(255,255,255,${.1 + r2() * .35})`; g.fillRect(x, y, 1, 1); }
  // sprites de nuvem (máscara branca)
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = 320; c.height = 120; const q = c.getContext('2d'), rr = rng(900 + k * 17);
    const n = 9 + (k % 2) * 3;
    for (let i = 0; i < n; i++) {
      const x = 50 + (i / (n - 1)) * 220 + (rr() - .5) * 30, y = 70 - Math.sin(i / (n - 1) * Math.PI) * 18 + (rr() - .5) * 18, r = 26 + rr() * 30;
      q.fillStyle = rg(q, x, y, 0, r, [[0, 'rgba(255,255,255,.85)'], [.55, 'rgba(255,255,255,.4)'], [1, 'rgba(255,255,255,0)']]); q.fillRect(x - r, y - r, r * 2, r * 2);
    }
    _wrCloud.push(c);
  }
  _wrScr = document.createElement('canvas'); _wrScr.width = 320; _wrScr.height = 120;
  _wrGlow = document.createElement('canvas'); _wrGlow.width = _wrGlow.height = 64; const gg = _wrGlow.getContext('2d');
  gg.fillStyle = rg(gg, 32, 32, 0, 32, [[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]); gg.fillRect(0, 0, 64, 64);
}
function _wrEnsure() { if (!_wrInit) initWorld(); }

/* =====================  CIDADE-MORRO EM CAMADAS  ===================== */
const WR_L = [
  { par: .04, s: .75, top: 1.0, fog: .86, depth: 200, amp: 70 },
  { par: .09, s: .95, top: .84, fog: .7, depth: 215, amp: 80 },
  { par: .17, s: 1.2, top: .68, fog: .52, depth: 230, amp: 92 },
  { par: .30, s: 1.5, top: .52, fog: .34, depth: 250, amp: 100 },
  { par: .50, s: 1.9, top: .37, fog: .17, depth: 270, amp: 108 },
  { par: .80, s: 2.4, top: .20, fog: .05, depth: 300, amp: 112 },
];
const WR_ALB = ['#e8a05a', '#d0583c', '#e8c85a', '#5aa8a8', '#6a8ad0', '#e07a9a', '#a8c870', '#e8dcc8', '#c86a4a', '#8a6ab0', '#f0b070', '#4f9a8a'];
const _wrGeo = {}, _wrBake = {};
function wrGeo(i, seed) {
  const key = i + ':' + seed; if (_wrGeo[key]) return _wrGeo[key];
  const P = WR_L[i], s = P.s, R = rng(seed * 131 + i * 977 + 7), amp = P.amp, TW = WR_TW;
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28, R() * 6.28];
  const pf = x => amp * (.5 * Math.sin(TAU * x / TW + ph[0]) + .3 * Math.sin(TAU * 2 * x / TW + ph[1]) + .22 * Math.sin(TAU * 5 * x / TW + ph[2]) + .12 * Math.sin(TAU * 9 * x / TW + ph[3]));
  const q = 9 * s, st = [], wins = [], feats = [], tops = new Int16Array(Math.ceil(TW / 4) + 2);
  let x = 0;
  while (x < TW) {
    let bw = (20 + R() * 28) * s; if (TW - x - bw < 18 * s) bw = TW - x;
    let top = Math.round(pf(x + bw / 2) / q) * q + Math.round((R() - .5) * 1.4) * q * .6;
    for (let xx = Math.floor(x / 4); xx <= Math.floor((x + bw) / 4); xx++) tops[xx] = top;
    let y = top, first = true, n = 0;
    while (y < P.depth) {
      const sh = (18 + R() * 13) * s, off = R() < .35 ? (R() * 3 * s) : 0, w2 = bw - off - (R() < .3 ? R() * 4 * s : 0);
      const c = (R() * WR_ALB.length) | 0, j = (R() - .5) * .16;
      st.push({ x: x + off, y, w: w2, h: sh, c, j, first, slab: R() < .6 });
      // janelas
      const nw = w2 > 34 * s ? 2 : 1;
      for (let k = 0; k < nw; k++) {
        const ww = Math.max(1.6, w2 * (nw === 2 ? .2 : .3)), hh = Math.max(1.8, sh * .34);
        const wx = x + off + w2 * (nw === 2 ? (k ? .6 : .18) : .34 + (R() - .5) * .2), wy = y + sh * (.3 + R() * .12);
        wins.push({ x: wx, y: wy, w: ww, h: hh, u: R(), ci: (R() * 6) | 0, ph: R(), kd: R() < .1 ? 1 : R() < .3 ? 2 : 0 });
      }
      if (first && R() < .62) {
        const r = R(); let f = { x: x + bw * (.2 + R() * .5), y: y, s, ty: r < .26 ? 'tank' : r < .5 ? 'ant' : r < .62 ? 'dish' : r < .8 ? 'rebar' : r < .9 ? 'flag' : 'box' };
        feats.push(f);
      }
      first = false; y += sh; n++;
    }
    x += bw;
  }
  wins.sort((a, b) => a.x - b.x);
  const g = { st, wins, wx: wins.map(w => w.x), feats, tops, amp, P };
  // fios entre antenas (camadas próximas)
  g.wires = [];
  if (i >= 3) { const an = feats.filter(f => f.ty === 'ant' || f.ty === 'flag'); for (let k = 0; k + 1 < an.length; k += 2) if (an[k + 1].x - an[k].x < 260 * s) g.wires.push([an[k], an[k + 1]]); }
  return (_wrGeo[key] = g);
}
function wrShade(c, st, i, j) {
  const M = WR_MOODS[st], P = WR_L[i];
  let col = mix(c, M.tint, 1 - M.hk); col = mix(col, '#000000', 1 - M.amb);
  if (j) col = mix(col, j > 0 ? '#ffffff' : '#000000', Math.abs(j));
  return mix(col, M.fog, P.fog);
}
function wrBake(i, st, seed) {
  const key = i + ':' + st + ':' + seed; if (_wrBake[key]) return _wrBake[key];
  const g = wrGeo(i, seed), P = WR_L[i], M = WR_MOODS[st], oy = P.amp + 78, hc = Math.ceil(oy + P.depth + 2);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(WR_TW * WR_CS); cv.height = Math.ceil(hc * WR_CS);
  const c = cv.getContext('2d'); c.scale(WR_CS, WR_CS); c.translate(0, oy);
  const rimK = (st >= 2 && st <= 4) ? .5 : st === 1 ? .25 : .1, s = P.s;
  for (const b of g.st) {
    const col = wrShade(WR_ALB[b.c], st, i, b.j);
    c.fillStyle = col; c.fillRect(b.x, b.y, b.w, b.h + .6);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(b.x, b.y + b.h * .8, b.w, b.h * .2 + .6);
    if (b.slab && i >= 1) { c.fillStyle = mix(col, '#000000', .28); c.fillRect(b.x, b.y, b.w, Math.max(1, 2.4 * s)); }
    if (i >= 2) { c.fillStyle = wrCol(M.glow, .35 * rimK); c.fillRect(b.x, b.y, Math.max(.8, 1.2 * s), b.h); }
  }
  // buracos de janela (escuros)
  const hole = mix(mix(M.tint, '#000000', .6), M.fog, P.fog * .6);
  c.fillStyle = hole;
  for (const w of g.wins) c.fillRect(w.x, w.y, w.w, w.h);
  // elementos de topo
  const dk = mix(mix(M.tint, '#000000', .45), M.fog, P.fog), md = mix(mix(M.tint, '#000000', .2), M.fog, P.fog);
  c.lineCap = 'butt';
  for (const f of g.feats) {
    const x = f.x, y = f.y;
    if (f.ty === 'tank') { const w = 14 * s, h = 16 * s; c.fillStyle = mix('#5a8ab8', M.fog, P.fog * .8); c.fillStyle = mix(mix('#4a78a8', M.tint, .4), '#000000', 1 - M.amb); c.fillStyle = mix(c.fillStyle, M.fog, P.fog); c.fillRect(x, y - h, w, h); c.fillStyle = mix(c.fillStyle, '#ffffff', .15); c.fillRect(x - 1 * s, y - h - 2.4 * s, w + 2 * s, 2.6 * s); }
    else if (f.ty === 'ant') { const h = 34 * s; c.strokeStyle = dk; c.lineWidth = Math.max(.8, 1.1 * s); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.moveTo(x - 7 * s, y - h * .8); c.lineTo(x + 7 * s, y - h * .8); c.moveTo(x - 5 * s, y - h * .55); c.lineTo(x + 5 * s, y - h * .55); c.moveTo(x - 3 * s, y - h); c.lineTo(x + 3 * s, y - h); c.stroke(); }
    else if (f.ty === 'dish') { c.fillStyle = md; c.beginPath(); c.arc(x, y - 6 * s, 6 * s, 0, Math.PI); c.fill(); c.strokeStyle = dk; c.lineWidth = Math.max(.8, s); c.beginPath(); c.moveTo(x, y - 6 * s); c.lineTo(x, y); c.stroke(); }
    else if (f.ty === 'rebar') { c.strokeStyle = dk; c.lineWidth = Math.max(.8, 1.1 * s); c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(x + k * 4 * s, y); c.lineTo(x + k * 4 * s + (k % 2 - .5) * 2 * s, y - (14 + k * 3) * s); } c.stroke(); }
    else if (f.ty === 'flag') { c.strokeStyle = dk; c.lineWidth = Math.max(.8, s); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 28 * s); c.stroke(); c.fillStyle = mix(mix('#d04040', M.tint, .3), M.fog, P.fog); c.fillRect(x, y - 28 * s, 10 * s, 6 * s); }
    else { c.fillStyle = md; c.fillRect(x, y - 9 * s, 12 * s, 9 * s); c.fillStyle = dk; c.fillRect(x + 1.5 * s, y - 6 * s, 3 * s, 6 * s); }
  }
  for (const [a, b] of g.wires) { const x0 = a.x, y0 = a.y - 28 * s, x1 = b.x, y1 = b.y - 28 * s; c.strokeStyle = dk; c.lineWidth = Math.max(.6, .8 * s); c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 12 * s, x1, y1); c.stroke(); }
  // bandeirinhas nas camadas próximas
  if (i >= 4) {
    const R = rng(seed * 5 + i), fcol = ['#e8c24a', '#d8504a', '#4a9ad8', '#e8e0d0', '#4ab88a'];
    for (let k = 0; k < 3; k++) {
      const x0 = R() * (WR_TW - 340), x1 = x0 + 140 + R() * 190, y0 = -P.amp * .2 + R() * 30 - 20, sag = 14 * s;
      c.strokeStyle = dk; c.lineWidth = .8; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, y0 + sag * 2, x1, y0); c.stroke();
      for (let u = .04; u < .98; u += .045) { const px = lerp(x0, x1, u), py = y0 + 4 * sag * u * (1 - u); c.fillStyle = mix(mix(fcol[(R() * 5) | 0], M.tint, .35), M.fog, P.fog); c.beginPath(); c.moveTo(px - 3 * s, py); c.lineTo(px + 3 * s, py); c.lineTo(px, py + 7 * s); c.fill(); }
    }
  }
  const out = { cv, oy, hc, fill: mix(mix(M.tint, '#000000', 1 - M.amb), M.fog, P.fog) };
  return (_wrBake[key] = out);
}

function drawSkyline(ctx, camX, baseY, mood, o = {}) {
  _wrEnsure();
  const t = o.t || 0, hillH = o.hillH || 560, seed = o.seed || 1, m = clamp(mood, 0, 5), Mo = wrMood(m);
  const lit = o.lit == null ? Mo.lit : o.lit, hazeK = o.haze == null ? 1 : o.haze, fogK = o.fog == null ? 1 : o.fog;
  const st0 = Math.min(5, Math.floor(m)), st1 = Math.min(5, st0 + 1), f = m - st0, camY = o.camY || 0;
  const skip = o.noLayer == null ? [] : Array.isArray(o.noLayer) ? o.noLayer : [o.noLayer];
  const tops = [], par = [], info = { tops, base: baseY, hillH, par, yAt: null }, k4 = Mo.k4;
  const geos = [], offs = [];
  for (let i = 0; i < WR_N; i++) {
    const P = WR_L[i], ly = Array.isArray(o.layerY) ? (o.layerY[i] || 0) : (o.layerY || 0);
    tops[i] = baseY - hillH * P.top + ly - camY * P.par; par[i] = P.par;
    offs[i] = ((-camX * P.par) % WR_TW + WR_TW) % WR_TW; geos[i] = wrGeo(i, seed);
  }
  info.yAt = (i, sx) => { const g = geos[i]; let wx = (((sx - offs[i]) % WR_TW) + WR_TW) % WR_TW; return tops[i] + g.tops[Math.floor(wx / 4)]; };
  const winc = Mo.win; ctx.save();
  for (let i = 0; i < WR_N; i++) {
    if (skip.indexOf(i) >= 0) continue;
    const P = WR_L[i], g = geos[i], top = tops[i];
    // névoa atmosférica atrás desta camada
    if (i > 0 && fogK > 0) {
      const fy = top - 70, a = clamp((.34 - i * .03) * fogK * hazeK, 0, .9);
      ctx.fillStyle = lg(ctx, 0, fy, 0, fy + 230, [[0, wrCol(Mo.fog, 0)], [.5, wrCol(Mo.fog, a)], [1, wrCol(Mo.fog, a * .9)]]); ctx.fillRect(0, fy, W, Math.min(H - fy + 40, 360));
    }
    // brilho urbano sobre o topo
    if (i >= 1 && i <= 4 && lit > .05 && o.glow !== false) {
      const ga = (.09 + k4 * .08) * lit * (1 - i * .12); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = lg(ctx, 0, top - 170, 0, top + 30, [[0, wrCol(Mo.glow, 0)], [1, wrCol(Mo.glow, ga)]]); ctx.fillRect(0, top - 170, W, 200); ctx.globalCompositeOperation = 'source-over';
    }
    const b0 = wrBake(i, st0, seed), b1 = f > .01 ? wrBake(i, st1, seed) : null, dy = top - b0.oy;
    // preenchimento abaixo da profundidade
    const fy2 = top + P.depth - 2;
    if (fy2 < H) { ctx.fillStyle = b1 ? mix(b0.fill, b1.fill, f) : b0.fill; ctx.fillRect(0, fy2, W, H - fy2 + 2); }
    const x0 = offs[i] - WR_TW;
    for (let x = x0; x < W; x += WR_TW) {
      if (x + WR_TW < 0) continue;
      ctx.drawImage(b0.cv, x, dy, WR_TW, b0.hc);
      if (b1) { ctx.globalAlpha = f; ctx.drawImage(b1.cv, x, dy, WR_TW, b0.hc); ctx.globalAlpha = 1; }
    }
    // janelas dinâmicas
    if (lit > .003) {
      const wins = g.wins, wxs = g.wx, near = i >= 3, beat = o.beat == null ? 0 : o.beat, cyc = o.cycle == null ? k4 > .5 : o.cycle, sc = 1 + k4 * .22;
      ctx.globalCompositeOperation = 'source-over';
      for (let x = x0; x < W; x += WR_TW) {
        if (x + WR_TW < -10) continue;
        let lo = 0, hi = wxs.length; const lim = -12 - x; while (lo < hi) { const mid = (lo + hi) >> 1; if (wxs[mid] < lim) lo = mid + 1; else hi = mid; }
        for (let k = lo; k < wins.length; k++) {
          const w = wins[k], sx = x + w.x; if (sx > W + 12) break;
          let a = clamp((lit - w.u) * 16); if (a <= 0) continue;
          if (w.kd === 1) { a *= Math.sin(t * (.4 + w.ph * 1.6) + w.ph * 50) > -.35 ? 1 : .08; }
          else if (w.kd === 2) a *= .62 + .38 * Math.sin(t * (1 + w.ph * 2) + w.ph * 6.28);
          if (beat) a *= 1 - .45 * (1 - beat) * (w.ph > .5 ? 1 : .5);
          let ci = w.ci; if (cyc) ci = (ci + Math.floor(t * 1.33 + w.ph * 6)) % 6;
          const sy = top + w.y, ww = w.w * sc, hh = w.h * sc, ox = (ww - w.w) / 2, oyy = (hh - w.h) / 2;
          ctx.globalAlpha = a * (1 - P.fog * .4); ctx.fillStyle = winc[ci]; ctx.fillRect(sx - ox, sy - oyy, ww, hh);
          if (near && a > .3) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (.1 - k4 * .04); ctx.fillRect(sx - ww * .8, sy - hh * .8, ww * 2.6, hh * 2.6); ctx.globalCompositeOperation = 'source-over'; }
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.restore();
  return info;
}

/* =====================  CÉUS  ===================== */
function wrSpark(ctx, x, y, r, a = 1) { // estrelinha de 4 pontas (fillStyle atual)
  ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x + r * .1, y - r * .1, x + r, y); ctx.quadraticCurveTo(x + r * .1, y + r * .1, x, y + r);
  ctx.quadraticCurveTo(x - r * .1, y + r * .1, x - r, y); ctx.quadraticCurveTo(x - r * .1, y - r * .1, x, y - r); ctx.fill();
}
function drawCloudBand(ctx, y, t, o = {}) {
  _wrEnsure();
  const n = o.n || 6, sc = o.scale || 1, sp = o.speed == null ? 6 : o.speed, h = o.h == null ? 30 : o.h, R = rng((o.seed || 3) * 71 + 5), a = o.a == null ? .5 : o.a, sq = o.sq || .55;
  const col = o.col || '#8a3f78', hi = o.hi || '#ffb070', span = W + 340 * sc, sx = _wrScr.getContext('2d');
  for (let i = 0; i < n; i++) {
    const k = (R() * 4) | 0, s = sc * (.7 + R() * .7), yy = y + (R() - .5) * h * 2, ph = R() * span, aa = a * (.55 + R() * .45);
    let x = ((ph + t * sp * (.7 + R() * .6)) % span) - 200 * sc; const w = 320 * s, hh = 120 * s * sq;
    sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, 320, 120); sx.drawImage(_wrCloud[k], 0, 0);
    sx.globalCompositeOperation = 'source-atop'; sx.fillStyle = lg(sx, 0, 20, 0, 100, [[0, hi], [.55, col], [1, col]]); sx.fillRect(0, 0, 320, 120);
    ctx.globalAlpha = aa; ctx.drawImage(_wrScr, x, yy - hh / 2, w, hh);
  }
  ctx.globalAlpha = 1;
}
function drawSky(ctx, mood, t, o = {}) {
  _wrEnsure();
  const M = wrMood(mood), hy = o.hy || 900, sv = M.star * (o.stars == null ? 1 : o.stars), cam = o.cam || 0, k4 = M.k4;
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, M.top], [clamp(hy * .5 / H, .1, .8), M.mid], [clamp(hy / H, .2, .98), M.hor], [1, mix(M.hor, M.fog, .5)]]); ctx.fillRect(0, 0, W, H);
  // via láctea
  if (sv > .05 && M.m < 2.2 + k4 * 3) { ctx.globalAlpha = clamp(sv * .75 * (1 - clamp((M.m - 1) / 1.2))) + k4 * .4; ctx.drawImage(_wrMW, -(cam * .03) % 40, 0, 720, 1280); ctx.globalAlpha = 1; }
  // brilho do horizonte
  const sx = o.sx == null ? W / 2 : o.sx, ga = (o.glow == null ? 1 : o.glow) * (.5 + .2 * k4);
  ctx.save(); ctx.translate(sx, hy); ctx.scale(1, .5); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, 0, 0, 0, 780, [[0, wrCol(M.glow, .55 * ga)], [.45, wrCol(M.glow, .18 * ga)], [1, wrCol(M.glow, 0)]]); ctx.fillRect(-780, -780, 1560, 1560); ctx.restore();
  // estrelas
  if (sv > .02) {
    const fr = o.seed ? o.seed : 0;
    for (const s of _wrStars) {
      const yy = s.y; if (yy > hy * .98) continue;
      let a = sv * (.3 + .7 * (.5 + .5 * Math.sin(t * s.sp + s.ph))) * (1 - yy / hy * .75) * (.4 + .6 * s.b); if (a < .03) continue;
      const px = ((s.x - cam * .02 * (s.b + .3)) % W + W) % W;
      if (k4 > .3 && s.s > 1.6) { ctx.fillStyle = ['#ffffff', '#ff9ad8', '#8fe8ff', '#ffe28a'][(s.c * 4) | 0]; wrSpark(ctx, px, yy, s.s * 3.2 * (.7 + .3 * Math.sin(t * s.sp + s.ph)), a); }
      else if (s.s > 1.9) { ctx.fillStyle = '#fff'; wrSpark(ctx, px, yy, s.s * 2.6, a * .9); ctx.fillStyle = `rgba(255,240,220,${a * .25})`; ctx.fillRect(px - s.s * 1.4, yy - s.s * 1.4, s.s * 2.8, s.s * 2.8); }
      else { ctx.globalAlpha = a; ctx.fillStyle = s.c < .3 ? '#ffe8d0' : s.c > .75 ? '#d0e0ff' : '#fff'; ctx.fillRect(px, yy, s.s, s.s); }
    }
    ctx.globalAlpha = 1;
  }
  // faixas cósmicas
  if (k4 > .02) {
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const y0 = 160 + k * 230, ph = t * .25 + k * 1.7, cols = ['255,106,184', '120,200,255', '180,120,255', '255,200,120'];
      ctx.beginPath(); ctx.moveTo(-40, y0 + Math.sin(ph) * 60);
      for (let x = 0; x <= W + 40; x += 60) ctx.lineTo(x, y0 + Math.sin(ph + x * .006) * 60 - x * .22);
      for (let x = W + 40; x >= -40; x -= 60) ctx.lineTo(x, y0 + 120 + Math.sin(ph + x * .006 + 1) * 50 - x * .22);
      ctx.closePath(); ctx.fillStyle = lg(ctx, 0, y0 - 100, 0, y0 + 160, [[0, `rgba(${cols[k]},0)`], [.5, `rgba(${cols[k]},${.14 * k4})`], [1, `rgba(${cols[k]},0)`]]); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  // nuvens
  const cl = o.clouds == null ? 1 : o.clouds;
  if (cl > 0) {
    const dark = M.dark;
    drawCloudBand(ctx, hy * .30, t, { col: M.cloud, hi: M.cloudHi, a: .34 * cl, speed: 3, scale: 1.7, n: 4, h: 60, seed: 11, sq: .5 });
    drawCloudBand(ctx, hy * .55, t, { col: M.cloud, hi: M.cloudHi, a: .5 * cl, speed: 6, scale: 1.3, n: 5, h: 50, seed: 5, sq: .45 });
    drawCloudBand(ctx, hy * .8, t, { col: M.cloud, hi: M.cloudHi, a: .5 * cl, speed: 9, scale: 1.0, n: 6, h: 30, seed: 8, sq: .4 });
  }
  if (o.rain && typeof fxRainStars === 'function') fxRainStars(ctx, t, { a: o.rain === true ? .6 : o.rain });
  ctx.restore();
}
function drawMoon(ctx, x, y, R, o = {}) {
  const col = o.col || '255,244,214', g = o.glow == null ? 1 : o.glow, rr = rng((o.seed || 5) * 31 + 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, R * .8, R * 3.6, [[0, `rgba(${col},${.34 * g})`], [.25, `rgba(${col},${.13 * g})`], [.6, `rgba(${col},${.04 * g})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - R * 3.6, y - R * 3.6, R * 7.2, R * 7.2);
  ctx.strokeStyle = `rgba(${col},${.035 * g})`; ctx.lineWidth = R * .04; ctx.beginPath(); ctx.arc(x, y, R * 1.5, 0, TAU); ctx.stroke();
  ctx.restore(); ctx.save();
  ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip();
  ctx.fillStyle = lg(ctx, x - R, y - R, x + R, y + R, [[0, '#fffdf0'], [.6, '#f6ecd0'], [1, '#e2d4ae']]); ctx.fillRect(x - R, y - R, R * 2, R * 2);
  // maria (manchas suaves)
  for (let i = 0; i < 4; i++) { const a = rr() * TAU, d = R * (.15 + rr() * .5), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, r = R * (.25 + rr() * .25); ctx.fillStyle = rg(ctx, px, py, 0, r, [[0, 'rgba(176,160,120,.26)'], [1, 'rgba(176,160,120,0)']]); ctx.fillRect(px - r, py - r, r * 2, r * 2); }
  for (let i = 0; i < 9; i++) {
    const a = rr() * TAU, d = Math.sqrt(rr()) * R * .78, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, r = R * (.05 + rr() * .13);
    ctx.fillStyle = 'rgba(140,122,92,.42)'; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,250,.5)'; ctx.beginPath(); ctx.arc(px - r * .16, py - r * .2, r * .86, 0, TAU); ctx.arc(px, py, r * .86, 0, TAU, true); ctx.fill('evenodd');
    ctx.fillStyle = 'rgba(120,104,78,.22)'; ctx.beginPath(); ctx.arc(px + r * .1, py + r * .12, r * .78, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = rg(ctx, x - R * .2, y - R * .25, R * .55, R * 1.05, [[0, 'rgba(255,255,255,0)'], [.7, 'rgba(210,190,150,.12)'], [1, 'rgba(160,140,100,.42)']]); ctx.fillRect(x - R, y - R, R * 2, R * 2);
  if (o.phase) { ctx.fillStyle = 'rgba(10,8,34,.92)'; ctx.beginPath(); ctx.arc(x + o.phase * R * 1.2, y, R * 1.02, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function godRays(ctx, x, y, t, o = {}) {
  const n = o.n || 14, len = o.len || 1900, a = o.a == null ? .16 : o.a, col = o.col || '255,214,160', sp = o.sp == null ? .03 : o.sp, w = o.w == null ? .5 : o.w;
  const a0 = o.a0 == null ? 0 : o.a0, a1 = o.a1 == null ? TAU : o.a1, span = a1 - a0, R = rng((o.seed || 1) * 13 + 9);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gr = rg(ctx, x, y, 0, len, [[0, `rgba(${col},${a})`], [.3, `rgba(${col},${a * .6})`], [.7, `rgba(${col},${a * .2})`], [1, `rgba(${col},0)`]]);
  const gr2 = rg(ctx, x, y, 0, len, [[0, `rgba(${col},${a * .35})`], [.5, `rgba(${col},${a * .1})`], [1, `rgba(${col},0)`]]);
  for (let i = 0; i < n; i++) {
    const jit = R(), ang = a0 + (i + .5 + (jit - .5) * .35) / n * span + t * sp, hw = span / n * w * .5 * (.65 + R() * .7), mod = .6 + .4 * Math.sin(t * .7 + i * 1.9 + jit * 6);
    for (let p = 0; p < 2; p++) {
      const h2 = hw * (p ? 2.4 : 1), c = Math.cos(ang - h2), s = Math.sin(ang - h2), c2 = Math.cos(ang + h2), s2 = Math.sin(ang + h2);
      ctx.globalAlpha = mod; ctx.fillStyle = p ? gr2 : gr; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + c * len, y + s * len); ctx.lineTo(x + c2 * len, y + s2 * len); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}
function drawSun(ctx, x, y, R, o = {}) {
  const col = o.col || '255,214,150', g = o.glow == null ? 1 : o.glow, t = o.t || 0;
  if (o.rays !== false) godRays(ctx, x, y, t, { n: o.nRays || 18, len: 2000, a: (o.rayA == null ? .2 : o.rayA) * g, col, sp: .035, w: .55, seed: 3 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, R * .7, R * 3.8, [[0, `rgba(${col},${.5 * g})`], [.2, `rgba(${col},${.22 * g})`], [.55, `rgba(${col},${.06 * g})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - R * 3.8, y - R * 3.8, R * 7.6, R * 7.6);
  ctx.restore();
  ctx.fillStyle = rg(ctx, x, y, R * .2, R, [[0, '#ffffff'], [.7, '#fff6dc'], [1, '#ffe8b8']]); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${col},${.45 * g})`; ctx.lineWidth = R * .08; ctx.beginPath(); ctx.arc(x, y, R * 1.04, 0, TAU); ctx.stroke(); ctx.restore();
}
function shootingStar(ctx, t, seed, o = {}) {
  const P = o.period || 4.2, dur = o.dur || .24, tt = t + seed * 1.7, cyc = Math.floor(tt / P);
  let u = o.p != null ? o.p : (tt % P) / P / dur; if (u < 0 || u > 1.25) return;
  const R = rng(cyc * 977 + seed * 131), dir = R() < .5 ? 1 : -1, ang = o.ang != null ? o.ang : .5 + R() * .35, len = o.len || 260 + R() * 160, dist = o.dist || 520 + R() * 260;
  const x0 = o.x0 != null ? o.x0 : (dir > 0 ? W * (.05 + R() * .35) : W * (.6 + R() * .35)), y0 = o.y0 != null ? o.y0 : 40 + R() * 340;
  const k = E.out2(clamp(u)), hx = x0 + dir * Math.cos(ang) * dist * k, hy = y0 + Math.sin(ang) * dist * k, fade = u > 1 ? clamp(1 - (u - 1) * 4) : 1;
  const tl = Math.min(len, dist * k + 40), tx = hx - dir * Math.cos(ang) * tl, ty = hy - Math.sin(ang) * tl, col = o.col || '255,210,120', a = (o.a == null ? 1 : o.a) * fade;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const gr = lg(ctx, tx, ty, hx, hy, [[0, `rgba(${col},0)`], [1, `rgba(${col},${.9 * a})`]]);
  ctx.strokeStyle = gr; ctx.lineWidth = 7; ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = rg(ctx, hx, hy, 0, 40, [[0, `rgba(255,255,255,${a})`], [.3, `rgba(${col},${.5 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(hx - 40, hy - 40, 80, 80);
  ctx.fillStyle = '#fff'; wrSpark(ctx, hx, hy, 15 * a + 3, a); ctx.restore();
}

/* =====================  PRIMEIRO PLANO / CENÁRIOS  ===================== */
const wrSilCol = (M, k = .1) => mix('#07070d', M.tint, k);
function wrRimDraw(ctx, M, fn, col, dx = -1.5, dy = -1.2) { // contorno de luz + silhueta
  ctx.save(); ctx.translate(dx, dy); fn(wrCol(M.rim, .55)); ctx.restore(); fn(col);
}
const _wrRoof = {};
function drawRoofline(ctx, y, camX, o = {}) {
  const t = o.t || 0, M = wrMood(o.mood == null ? 0 : o.mood), seed = o.seed || 1, PER = 1500, col = o.col || wrSilCol(M, .12), s = o.s || 1;
  let items = _wrRoof[seed]; if (!items) {
    const R = rng(seed * 313 + 11); items = []; let x = 60; const ty = ['tank', 'ant', 'varal', 'crates', 'ant', 'varal', 'rebar', 'crates'];
    while (x < PER - 220) { const k = (R() * ty.length) | 0; items.push({ x, ty: ty[k], r: R() }); x += 190 + R() * 220 + (ty[k] === 'varal' ? 260 : 0); }
    _wrRoof[seed] = items;
  }
  // mureta de fundo
  ctx.save();
  ctx.fillStyle = mix(col, M.tint, .3); ctx.fillRect(0, y - 30 * s, W, 31 * s);
  ctx.fillStyle = wrCol(M.rim, .22); ctx.fillRect(0, y - 31 * s, W, 2.5 * s);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let x = (-camX % 120) - 120; x < W; x += 120) ctx.fillRect(x, y - 30 * s, 2, 30 * s);
  const draw = (it, x) => {
    const r = it.r;
    if (it.ty === 'tank') wrRimDraw(ctx, M, c => { ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(x - 38 * s, y); ctx.lineTo(x - 34 * s, y - 62 * s); ctx.moveTo(x + 38 * s, y); ctx.lineTo(x + 34 * s, y - 62 * s); ctx.moveTo(x - 36 * s, y - 30 * s); ctx.lineTo(x + 36 * s, y - 30 * s); ctx.stroke(); rrect(ctx, x - 48 * s, y - 126 * s, 96 * s, 66 * s, 14 * s); ctx.fill(); ctx.fillRect(x - 52 * s, y - 132 * s, 104 * s, 10 * s); }, col);
    else if (it.ty === 'ant') wrRimDraw(ctx, M, c => { ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 200 * s); ctx.stroke(); ctx.lineWidth = 3 * s; ctx.beginPath(); for (let k = 0; k < 4; k++) { const yy = y - (200 - k * 26) * s, hw = (46 - k * 6) * s; ctx.moveTo(x - hw, yy); ctx.lineTo(x + hw, yy); } ctx.moveTo(x - 46 * s, y - 200 * s); ctx.lineTo(x - 46 * s, y - 214 * s); ctx.moveTo(x + 46 * s, y - 200 * s); ctx.lineTo(x + 46 * s, y - 214 * s); ctx.stroke(); ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(x, y - 190 * s); ctx.lineTo(x - 90 * s, y); ctx.moveTo(x, y - 190 * s); ctx.lineTo(x + 90 * s, y); ctx.stroke(); }, col);
    else if (it.ty === 'crates') wrRimDraw(ctx, M, c => { ctx.fillStyle = c; ctx.fillRect(x - 40 * s, y - 50 * s, 80 * s, 50 * s); ctx.fillRect(x - 24 * s + r * 14, y - 98 * s, 58 * s, 48 * s); ctx.strokeStyle = mix(c, M.tint, .25); ctx.lineWidth = 2; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 40 * s, y - k * 12.5 * s); ctx.lineTo(x + 40 * s, y - k * 12.5 * s); ctx.stroke(); } }, col);
    else if (it.ty === 'rebar') wrRimDraw(ctx, M, c => { ctx.strokeStyle = c; ctx.lineWidth = 3.5 * s; ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(x + k * 14 * s, y); ctx.lineTo(x + k * 14 * s + (k % 2 - .5) * 6 * s, y - (70 + k * 9 * (k % 2 ? 1 : -1)) * s); } ctx.stroke(); ctx.fillRect(x - 6 * s, y - 14 * s, 82 * s, 14 * s); }, col);
    else if (it.ty === 'varal') {
      const L = 250 * s, hh = 150 * s, sw = Math.sin(t * 1.2 + x * .01) * 2.2 * s, ys = y - hh;
      wrRimDraw(ctx, M, c => { ctx.strokeStyle = c; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, ys); ctx.moveTo(x + L, y); ctx.lineTo(x + L, ys); ctx.stroke(); ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(x, ys + 2); ctx.quadraticCurveTo(x + L / 2, ys + 26 * s + sw, x + L, ys + 2); ctx.stroke(); }, col);
      const cl = ['#c8283a', '#e8c24a', '#4a7ad0', '#e8e0d0', '#d86a9a', '#3aa88a', '#e8e0d0'];
      for (let k = 0; k < 7; k++) {
        const u = (k + .7) / 7.4, px = x + L * u, py = ys + 2 + 26 * s * 2 * u * (1 - u) + sw * 2 * u * (1 - u), sg = Math.sin(t * 1.6 + k * 1.3 + x * .01) * 2.6 * s, w = (20 + (k % 3) * 7) * s, h = (36 + (k * 7) % 14) * s;
        ctx.fillStyle = mix(mix(cl[k], M.tint, .55), '#000000', .25); ctx.beginPath(); ctx.moveTo(px - w / 2, py); ctx.lineTo(px + w / 2, py); ctx.lineTo(px + w / 2 + sg, py + h); ctx.lineTo(px - w / 2 + sg, py + h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = wrCol(M.rim, .13); ctx.fillRect(px - w / 2, py, 2, h);
      }
    }
  };
  const base = ((-camX) % PER + PER) % PER;
  for (let tile = base - PER; tile < W + 400; tile += PER) for (const it of items) { const x = tile + it.x; if (x > -260 && x < W + 260) draw(it, x); }
  // laje
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 260, [[0, col], [1, mix(col, '#000000', .45)]]); ctx.fillRect(0, y, W, H - y + 300);
  ctx.fillStyle = wrCol(M.rim, .38); ctx.fillRect(0, y, W, 1.8);
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 26, [[0, wrCol(M.rim, .13)], [1, wrCol(M.rim, 0)]]); ctx.fillRect(0, y, W, 26);
  ctx.restore();
}
function drawPoles(ctx, camX, y, o = {}) {
  const t = o.t || 0, gap = o.gap || 430, h = o.h || 560, par = o.par == null ? 1 : o.par, s = o.s || 1, sag = (o.sag == null ? 38 : o.sag) * s, M = wrMood(o.mood == null ? 0 : o.mood), col = o.col || wrSilCol(M, .1);
  const off = ((-camX * par) % gap + gap) % gap, xs = []; for (let x = off - gap; x < W + gap; x += gap) xs.push(x);
  const arm = [[-26, 14], [0, 14], [26, 14], [-20, 64], [20, 64]];
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i + 1 < xs.length; i++) {
    const xa = xs[i], xb = xs[i + 1], sw = Math.sin(t * .9 + i * 1.7) * 2 * s;
    for (let w = 0; w < (o.wires || 3); w++) {
      const [dx, dy] = arm[w], x0 = xa + dx * s, x1 = xb + dx * s, y0 = y - h + dy * s, y1 = y0 + (o.dy || 0), cy = (y0 + y1) / 2 + sag * (1 - w * .08) + sw;
      ctx.strokeStyle = col; ctx.lineWidth = 1.7 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, cy + (cy - (y0 + y1) / 2), x1, y1); ctx.stroke();
      if (o.flags && w === 0) { const fc = ['#e8c24a', '#d8504a', '#4a9ad8', '#e8e0d0', '#4ab88a']; for (let u = .03; u < .98; u += .034) { const px = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * (x0 + x1) / 2 + u * u * x1, py = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * (cy + (cy - (y0 + y1) / 2)) + u * u * y1; ctx.fillStyle = mix(mix(fc[Math.floor(u * 137 + i * 3) % 5], M.tint, .5), '#000000', .15); ctx.beginPath(); ctx.moveTo(px - 6 * s, py); ctx.lineTo(px + 6 * s, py); ctx.lineTo(px, py + 15 * s); ctx.fill(); } }
    }
  }
  xs.forEach((x, i) => {
    wrRimDraw(ctx, M, c => {
      ctx.fillStyle = c; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(x - 6 * s, y); ctx.lineTo(x - 4 * s, y - h); ctx.lineTo(x + 4 * s, y - h); ctx.lineTo(x + 6 * s, y); ctx.fill();
      ctx.fillRect(x - 40 * s, y - h + 12 * s, 80 * s, 5 * s); ctx.fillRect(x - 28 * s, y - h + 62 * s, 56 * s, 4 * s);
      for (const [dx, dy] of arm) ctx.fillRect(x + dx * s - 2 * s, y - h + dy * s - 5 * s, 4 * s, 7 * s);
      if (i % 2 === 0) { rrect(ctx, x + 8 * s, y - h + 100 * s, 30 * s, 46 * s, 5 * s); ctx.fill(); }
    }, col, -1.4 * s, -1);
  });
  ctx.restore();
}
function drawStairs(ctx, x, y, n, o = {}) {
  const sw = o.sw || 92, sh = o.sh || 64, M = wrMood(o.mood == null ? 2 : o.mood), col = o.col || mix(mix(M.tint, '#2c2a3c', .55), M.fog, .12), steps = [];
  const ex = x + n * sw, ey = y - n * sh;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, y + 4); for (let k = 0; k < n; k++) { ctx.lineTo(x + k * sw, y - (k + 1) * sh); ctx.lineTo(x + (k + 1) * sw, y - (k + 1) * sh); } ctx.lineTo(ex, H + 80); ctx.lineTo(x, H + 80); ctx.closePath();
  ctx.fillStyle = lg(ctx, x, ey, ex, H, [[0, mix(col, '#ffffff', .06)], [1, mix(col, '#000000', .35)]]); ctx.fill();
  ctx.save(); ctx.clip();
  for (let k = 0; k < n; k++) {
    const sx = x + k * sw, sy = y - (k + 1) * sh;
    ctx.fillStyle = wrCol(M.rim, .5); ctx.fillRect(sx, sy, sw + 1, 3.5);                // quina iluminada
    ctx.fillStyle = lg(ctx, sx, sy, sx, sy + sh, [[0, 'rgba(0,0,0,.28)'], [.25, 'rgba(0,0,0,.08)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(sx, sy + 3.5, sw, sh);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(sx, sy + 3.5, 3, sh);
    steps.push({ x: sx + sw * .5, y: sy, k });
  }
  ctx.restore();
  if (o.rail !== false) {
    const rc = wrSilCol(M, .15), r0 = [x + sw * .3, y - sh - 92], r1 = [ex - sw * .3, ey - 92 + sh * 0];
    ctx.strokeStyle = rc; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < n; k++) { const px = x + k * sw + sw * .3, py = y - (k + 1) * sh; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 92); ctx.stroke(); }
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1] + sh); ctx.stroke();
    ctx.strokeStyle = wrCol(M.rim, .45); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(r0[0], r0[1] - 2); ctx.lineTo(r1[0], r1[1] + sh - 2); ctx.stroke();
    ctx.strokeStyle = rc; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(r0[0], r0[1] + 44); ctx.lineTo(r1[0], r1[1] + sh + 44); ctx.stroke();
  }
  ctx.restore(); return steps;
}
function drawStreetVP(ctx, t, o = {}) {
  _wrEnsure();
  const M = wrMood(o.mood == null ? 5 : o.mood), vx = o.vx == null ? W / 2 : o.vx, vy = o.vy || 570, camH = o.camH || 380, XW = 330, XR = 190, sp = o.speed == null ? 1.1 : o.speed, g = o.glow == null ? 1 : o.glow;
  const proj = (side, z, h, X = XW) => [vx + side * X / z, vy + (camH - h) / z], fogA = z => clamp(z / 16, 0, .92);
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, 0, 0, vy + 40, [[0, M.top], [.55, M.mid], [1, M.hor]]); ctx.fillRect(0, 0, W, vy + 40);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, vx, vy, 0, 460, [[0, wrCol(M.glow, .45 * g)], [.4, wrCol(M.glow, .14 * g)], [1, wrCol(M.glow, 0)]]); ctx.fillRect(vx - 460, vy - 460, 920, 920); ctx.globalCompositeOperation = 'source-over';
  // cidade distante
  const Rr = rng(o.seed || 9);
  for (let k = 0; k < 22; k++) { const bx = vx - 120 + k * 11 + Rr() * 6, bh = 8 + Rr() * 34 * (1 - Math.abs(k - 11) / 14), bw = 8 + Rr() * 10; ctx.fillStyle = mix(mix(M.tint, M.fog, .6), M.hor, .25 + Rr() * .2); ctx.fillRect(bx, vy - bh, bw, bh + 4); }
  // chão
  const gx = (H - vy) / camH;
  ctx.fillStyle = lg(ctx, 0, vy, 0, H, [[0, mix(M.fog, M.ground, .3)], [1, mix(M.ground, '#000000', .1)]]);
  ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx - XW * gx, H); ctx.lineTo(vx + XW * gx, H); ctx.closePath(); ctx.fill();
  // calçadas
  for (const sd of [-1, 1]) { ctx.fillStyle = mix(mix(M.fog, M.ground, .15), '#ffffff', .1); ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + sd * XR * gx, H); ctx.lineTo(vx + sd * XW * gx, H); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + sd * XR * gx, H); ctx.stroke(); }
  // pista: reflexo
  ctx.fillStyle = lg(ctx, 0, vy, 0, H, [[0, wrCol(M.glow, .35 * g)], [.4, wrCol(M.glow, .06 * g)], [1, wrCol(M.glow, 0)]]); ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx - XR * gx * .9, H); ctx.lineTo(vx + XR * gx * .9, H); ctx.closePath(); ctx.fill();
  const L = 1.8, zmax = 44, ph = (t * sp) % L, base = Math.floor(t * sp / L), pal = ['#e8c8b8', '#9ad0c0', '#e8d090', '#e89aa0', '#d8c8a8', '#a8b8e0', '#f0b8a0'];
  // tracejado central
  ctx.fillStyle = mix('#f0e8a8', M.fog, .3); const dl = 1.4, dp = (t * sp) % dl;
  for (let z = zmax; z > .6; z -= dl) { const a = z - dp, b = a + dl * .45; if (b < .5 || a < .5) continue; const p0 = proj(-1, a, 0, 5), p1 = proj(1, a, 0, 5), p2 = proj(1, b, 0, 5), p3 = proj(-1, b, 0, 5); ctx.globalAlpha = 1 - fogA(a); poly(ctx, [p0, p1, p2, p3]); ctx.fill(); }
  ctx.globalAlpha = 1;
  for (let k = Math.ceil(zmax / L); k >= 0; k--) {
    const za = k * L - ph, zb = za + L; if (zb < .45) continue;
    const idx = k + base;
    for (const sd of [-1, 1]) {
      const R2 = rng(idx * 91 + (sd + 2) * 17 + 3), z0 = Math.max(.45, za), z1 = zb - .3, Hh = 650 + R2() * 520;
      if (z1 <= z0) continue;
      const fa = fogA(z0), c0 = mix(mix(pal[(R2() * 7) | 0], M.tint, (1 - M.hk) * .5), M.fog, fa);
      ctx.fillStyle = c0; poly(ctx, [proj(sd, z0, 0), proj(sd, z0, Hh), proj(sd, z1, Hh), proj(sd, z1, 0)]); ctx.fill();
      // sombra no pé e luz no topo
      ctx.fillStyle = lg(ctx, 0, vy - 800 / z0, 0, vy + camH / z0, [[0, 'rgba(255,255,255,.10)'], [.6, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.14)']]); poly(ctx, [proj(sd, z0, 0), proj(sd, z0, Hh), proj(sd, z1, Hh), proj(sd, z1, 0)]); ctx.fill();
      const wc = mix(c0, M.ground, .5);
      ctx.fillStyle = wc;
      for (const [h0, h1] of [[210, 360], [520, 680], [820, 980]]) { if (h1 > Hh - 40) continue; for (let wz = z0 + (z1 - z0) * .12; wz < z1 - .2; wz += (z1 - z0) * .5) { const a = wz, b = wz + (z1 - z0) * .26; poly(ctx, [proj(sd, a, h0), proj(sd, a, h1), proj(sd, b, h1), proj(sd, b, h0)]); ctx.fill(); } }
      ctx.fillStyle = mix(c0, '#000000', .2); poly(ctx, [proj(sd, z0 + .2, 0), proj(sd, z0 + .2, 270), proj(sd, z0 + .55, 270), proj(sd, z0 + .55, 0)]); ctx.fill();
      ctx.fillStyle = mix(c0, '#000000', .18); poly(ctx, [proj(sd, z0, Hh), proj(sd, z0, Hh + 26), proj(sd, z1, Hh + 26), proj(sd, z1, Hh)]); ctx.fill();
    }
    // poste + fios
    if (za > .45) for (const sd of [-1, 1]) {
      const pc = mix(mix(M.tint, '#000000', .45), M.fog, fogA(za)), a = proj(sd, za, 0, 288), b = proj(sd, za, 780, 288); ctx.strokeStyle = pc; ctx.lineWidth = Math.max(1, 11 / za); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.lineWidth = Math.max(.7, 2 / Math.sqrt(za)); ctx.beginPath(); const nz = za + L; for (let j = 0; j <= 8; j++) { const z = lerp(za, nz, j / 8), hh = 760 - Math.sin(j / 8 * Math.PI) * 55, p = proj(sd, z, hh, 288); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
    }
  }
  // névoa atmosférica
  const fg = o.fog == null ? 1 : o.fog;
  ctx.fillStyle = rg(ctx, vx, vy, 0, 520, [[0, wrCol(M.fog, .55 * fg)], [.45, wrCol(M.fog, .22 * fg)], [1, wrCol(M.fog, 0)]]); ctx.fillRect(0, vy - 520, W, 1040);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, vx, vy, 0, 200, [[0, wrCol(M.glow, .3 * g)], [1, wrCol(M.glow, 0)]]); ctx.fillRect(vx - 200, vy - 200, 400, 400); ctx.globalCompositeOperation = 'source-over';
  if (o.rays !== false) godRays(ctx, vx, vy - 8, t, { n: 10, len: 1100, a: .07 * g, col: wrRGB(M.glow), a0: -Math.PI - .35, a1: .35, sp: 0, w: .5, seed: 2 });
  if (o.birds !== false) { ctx.strokeStyle = wrCol(M.tint, .55); ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const bx = ((i * 233 + t * 14 * (1 + i * .1)) % (W + 80)) - 40, by = 120 + (i * 97) % 260 + Math.sin(t * 2 + i) * 6, f = Math.sin(t * 7 + i * 2) * 5; ctx.beginPath(); ctx.moveTo(bx - 9, by - f); ctx.quadraticCurveTo(bx - 4, by - 4 - f * .3, bx, by); ctx.quadraticCurveTo(bx + 4, by - 4 - f * .3, bx + 9, by - f); ctx.stroke(); } }
  ctx.restore();
  return { vx, vy, proj, groundY: z => vy + camH / z };
}
function drawGrafWall(ctx, x, y, w, h, o = {}) {
  const M = wrMood(o.mood == null ? 5 : o.mood), R = rng((o.seed || 3) * 53 + 7), light = o.light == null ? 1 : o.light, base = o.base || mix('#8f8f96', M.tint, .35);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, mix(base, '#ffffff', .08 * light)], [.7, base], [1, mix(base, '#000000', .3)]]); ctx.fillRect(x, y, w, h);
  for (let px = x + 150; px < x + w; px += 150 + R() * 40) { ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(px, y, 2.5, h); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(px + 2.5, y, 1.5, h); }
  for (let i = 0; i < 16; i++) { const sx = x + R() * w, sy = y + R() * h, r = 20 + R() * 70; ctx.fillStyle = rg(ctx, sx, sy, 0, r, [[0, `rgba(0,0,0,${.06 + R() * .07})`], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(sx - r, sy - r, r * 2, r * 2); }
  const pal = ['#ff5a8a', '#ffc247', '#35d6ff', '#ff7a3c', '#a98cff', '#6dff9c', '#ffffff'], words = o.words || ['SONHO', 'FÉ', 'LUZ'];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const cnt = Math.max(3, Math.round(w / 170));
  for (let i = 0; i < cnt; i++) {
    const gx = x + (i + .5) / cnt * w + (R() - .5) * 50, gy = y + h * (.22 + R() * .5), c = pal[(R() * 7) | 0], c2 = pal[(R() * 7) | 0], ty = (R() * 4) | 0, sz = 40 + R() * 50;
    ctx.strokeStyle = mix(c, base, .2 * (1 - light)); ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 9 + R() * 4;
    if (ty === 0) { ctx.beginPath(); const n = 4 + ((R() * 3) | 0); for (let k = 0; k <= n; k++) { const px = gx - sz + k * (sz * 2 / n), py = gy + (k % 2 ? -sz * .7 : sz * .7); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    else if (ty === 1) { ctx.font = `${sz * 1.5}px "Permanent Marker", sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(10,10,20,.85)'; const wd = words[(R() * words.length) | 0]; ctx.save(); ctx.translate(gx, gy); ctx.rotate((R() - .5) * .25); ctx.strokeText(wd, 0, 0); ctx.fillStyle = c; ctx.fillText(wd, 0, 0); for (let k = 0; k < 3; k++) { const dx = (R() - .5) * sz * 2; ctx.fillRect(dx, 10, 3, 14 + R() * 38); } ctx.restore(); }
    else if (ty === 2) { ctx.beginPath(); ctx.arc(gx, gy, sz * .6, 0, TAU); ctx.stroke(); ctx.strokeStyle = c2; ctx.beginPath(); ctx.moveTo(gx - sz * .9, gy + sz * .9); ctx.lineTo(gx, gy - sz * 1.1); ctx.lineTo(gx + sz * .9, gy + sz * .9); ctx.stroke(); }
    else { ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? sz * .32 : sz * .8; k ? ctx.lineTo(gx + Math.cos(a) * r, gy + Math.sin(a) * r) : ctx.moveTo(gx + Math.cos(a) * r, gy + Math.sin(a) * r); } ctx.closePath(); ctx.stroke(); }
  }
  ctx.fillStyle = mix(base, '#000000', .35); ctx.fillRect(x, y, w, 16); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y + 16, w, 2);
  ctx.fillStyle = lg(ctx, 0, y + h - 90, 0, y + h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.35)']]); ctx.fillRect(x, y + h - 90, w, 90);
  ctx.restore();
}
function drawSchoolGate(ctx, x, y, w, h, o = {}) {
  const M = wrMood(o.mood == null ? 5 : o.mood), open = clamp(o.open || 0), pw = 46, col = mix('#2b3a3a', M.tint, .3), concrete = mix('#a8a6a0', M.tint, .3), t = o.t || 0;
  ctx.save();
  ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, mix(M.fog, '#fff2c8', .3)], [1, mix(M.fog, '#7a6a50', .4)]]); ctx.fillRect(x + pw, y + 30, w - pw * 2, h - 30);
  const lw = (w - pw * 2) / 2, bars = Math.round(lw / 20);
  for (const sd of [0, 1]) {
    const lx = sd ? x + w - pw - lw : x + pw, wid = lw * (1 - open * .88), ox = sd ? lx + lw - wid : lx;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6;
    ctx.strokeRect(ox + 3, y + 64, wid - 6, h - 70); ctx.beginPath(); ctx.moveTo(ox + 3, y + h * .55); ctx.lineTo(ox + wid - 3, y + h * .55); ctx.stroke();
    ctx.lineWidth = 4; for (let k = 0; k <= bars; k++) { const bx = ox + 3 + (wid - 6) * k / bars; ctx.beginPath(); ctx.moveTo(bx, y + 66); ctx.lineTo(bx, y + h - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(bx - 4, y + 66); ctx.lineTo(bx, y + 50); ctx.lineTo(bx + 4, y + 66); ctx.fill(); }
    ctx.fillStyle = wrCol(M.rim, .22); ctx.fillRect(ox + 3, y + 64, 2, h - 70);
  }
  for (const px of [x, x + w - pw]) { ctx.fillStyle = lg(ctx, px, 0, px + pw, 0, [[0, mix(concrete, '#ffffff', .08)], [1, mix(concrete, '#000000', .25)]]); ctx.fillRect(px, y + 20, pw, h - 20); ctx.fillStyle = mix(concrete, '#000000', .2); ctx.fillRect(px - 6, y + 14, pw + 12, 12); }
  ctx.fillStyle = mix(concrete, '#000000', .1); ctx.fillRect(x, y + 4, w, 30); ctx.fillStyle = wrCol(M.rim, .3); ctx.fillRect(x, y + 4, w, 2.5);
  ctx.fillStyle = mix('#2a4a7a', M.tint, .3); rrect(ctx, x + w / 2 - 120, y - 28, 240, 54, 6); ctx.fill(); ctx.fillStyle = '#f0ece0'; ctx.font = '34px "Bangers", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.name || 'ESCOLA', x + w / 2, y);
  if (open < .3) {
    const cx = x + w / 2, cy = y + h * .55; ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 4; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.ellipse(cx + k * 16, cy + Math.abs(k) * 2 + 4 * Math.sin(t * 2 + k) * 0, 9, 5, k * .2, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#c9a23a'; rrect(ctx, cx - 18, cy + 8, 36, 40, 6); ctx.fill(); ctx.fillStyle = '#7a5a14'; ctx.beginPath(); ctx.arc(cx, cy + 26, 5, 0, TAU); ctx.fill(); ctx.fillRect(cx - 2, cy + 26, 4, 12);
    ctx.strokeStyle = '#b8b8c0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy + 8, 13, Math.PI, 0); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(cx - 14, cy + 12, 5, 26);
  }
  ctx.restore();
}
function drawDoorLight(ctx, x, y, w, h, t, o = {}) {
  const col = o.col || '255,238,200', a = o.a == null ? 1 : o.a, cl = o.coneLen || 760, sp = o.spread || 2.7, fy = y + h + cl;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x + w / 2, y + h / 2, w * .3, w * 3.2, [[0, `rgba(${col},${.5 * a})`], [.35, `rgba(${col},${.16 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x + w / 2 - w * 3.2, y + h / 2 - w * 3.2, w * 6.4, w * 6.4);
  const cx = x + w / 2, bw = w * sp;
  ctx.fillStyle = lg(ctx, 0, y + h, 0, fy, [[0, `rgba(${col},${.5 * a})`], [.5, `rgba(${col},${.2 * a})`], [1, `rgba(${col},${.04 * a})`]]);
  ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(cx + w / 2 + bw, fy); ctx.lineTo(cx - w / 2 - bw, fy); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 4; k++) { const u = (k + .5) / 4, sx = lerp(x + 6, x + w - 6, u), ex = lerp(cx - w / 2 - bw * .9, cx + w / 2 + bw * .9, u), wd = 14 + 8 * Math.sin(t * .7 + k * 2); ctx.fillStyle = lg(ctx, 0, y + h, 0, fy, [[0, `rgba(${col},${.16 * a})`], [1, `rgba(${col},0)`]]); ctx.beginPath(); ctx.moveTo(sx - 4, y + h); ctx.lineTo(sx + 4, y + h); ctx.lineTo(ex + wd, fy); ctx.lineTo(ex - wd, fy); ctx.closePath(); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = lg(ctx, x, y, x, y + h, [[0, '#fffdf2'], [1, '#fff0c8']]); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = rg(ctx, x + w / 2, y + h * .55, 0, w * .9, [[0, 'rgba(255,255,255,.9)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,214,140,.7)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.globalCompositeOperation = 'lighter'; const R = rng(21);
  for (let i = 0; i < 26; i++) { const u = R(), v = ((R() + t * (.02 + R() * .03)) % 1), px = cx + (u - .5) * (w + bw * 2 * v), py = y + h + v * cl; ctx.fillStyle = `rgba(${col},${.5 * a * (1 - v) * (.4 + .6 * Math.sin(t * 2 + i))})`; ctx.fillRect(px, py, 2, 2); }
  ctx.restore();
}
const _wrPol = {};
function drawPolaroid(ctx, x, y, s, rot, o = {}) {
  _wrEnsure(); const fade = clamp(o.fade || 0), t = o.t || 0, PW = 300, PH = 350, ph = 264;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.filter = 'blur(10px)'; ctx.fillRect(-PW / 2 + 8, -PH / 2 + 16, PW, PH); ctx.filter = 'none';
  ctx.fillStyle = lg(ctx, 0, -PH / 2, 0, PH / 2, [[0, '#fbf5e4'], [1, '#e9dec3']]); ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
  const px = -ph / 2, py = -PH / 2 + 18;
  ctx.save(); ctx.beginPath(); ctx.rect(px, py, ph, ph); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, py, 0, py + ph, [[0, '#ffa860'], [.45, '#ffd896'], [.7, '#ffe8b8'], [1, '#c26a3c']]); ctx.fillRect(px, py, ph, ph);
  ctx.fillStyle = rg(ctx, px + ph * .72, py + ph * .55, 0, 70, [[0, 'rgba(255,250,220,1)'], [.3, 'rgba(255,240,190,.7)'], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(px, py, ph, ph);
  ctx.fillStyle = '#c26a3c'; ctx.fillRect(px, py + ph * .72, ph, ph * .3);
  // casinhas ao fundo
  ctx.fillStyle = '#d98a58'; for (let k = 0; k < 6; k++) { const bw = 30 + (k * 17) % 22, bh = 28 + (k * 23) % 34; ctx.fillRect(px + k * 46, py + ph * .72 - bh, bw, bh); }
  const sil = c => {
    c.fillStyle = '#2a1818'; c.strokeStyle = '#2a1818'; c.lineCap = 'round';
    // mãe
    const mx = 18, gy = ph * .93;
    c.beginPath(); c.arc(mx, gy - 160, 15, 0, TAU); c.fill(); c.beginPath(); c.arc(mx - 6, gy - 177, 9, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(mx - 10, gy - 144); c.lineTo(mx + 10, gy - 144); c.lineTo(mx + 34, gy - 22); c.lineTo(mx - 34, gy - 22); c.closePath(); c.fill(); c.lineWidth = 8; c.beginPath(); c.moveTo(mx - 8, gy - 22); c.lineTo(mx - 10, gy); c.moveTo(mx + 8, gy - 22); c.lineTo(mx + 10, gy); c.stroke();
    c.lineWidth = 7; c.beginPath(); c.moveTo(mx + 10, gy - 128); c.lineTo(mx + 42, gy - 84); c.stroke();
    // filho
    const kx = 66; c.beginPath(); c.arc(kx, gy - 92, 11, 0, TAU); c.fill(); c.fillStyle = '#b02834'; c.beginPath(); c.arc(kx, gy - 96, 11, Math.PI, 0); c.fill(); c.fillRect(kx, gy - 99, 14, 4); c.fillStyle = '#2a1818';
    c.lineWidth = 8; c.beginPath(); c.moveTo(kx, gy - 80); c.lineTo(kx, gy - 38); c.moveTo(kx, gy - 38); c.lineTo(kx - 8, gy); c.moveTo(kx, gy - 38); c.lineTo(kx + 8, gy); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(kx, gy - 70); c.lineTo(kx - 24, gy - 78); c.stroke();
  };
  ctx.save(); ctx.translate(px + ph * .38, py); sil(ctx); ctx.restore();
  // pai
  const fa = _wrPol.f || (_wrPol.f = document.createElement('canvas')); fa.width = ph; fa.height = ph; const fc = fa.getContext('2d'); fc.clearRect(0, 0, ph, ph);
  fc.fillStyle = '#2a1818'; fc.strokeStyle = '#2a1818'; fc.lineCap = 'round'; fc.lineWidth = 10; const fx0 = 44, gy = ph * .93;
  fc.beginPath(); fc.arc(fx0, gy - 190, 16, 0, TAU); fc.fill(); fc.lineWidth = 22; fc.beginPath(); fc.moveTo(fx0, gy - 168); fc.lineTo(fx0, gy - 92); fc.stroke(); fc.lineWidth = 12; fc.beginPath(); fc.moveTo(fx0, gy - 98); fc.lineTo(fx0 - 12, gy); fc.moveTo(fx0, gy - 98); fc.lineTo(fx0 + 12, gy); fc.stroke();
  fc.lineWidth = 9; fc.beginPath(); fc.moveTo(fx0 + 4, gy - 160); fc.lineTo(fx0 + 56, gy - 108); fc.moveTo(fx0 - 4, gy - 158); fc.lineTo(fx0 - 28, gy - 110); fc.stroke();
  fc.fillStyle = '#7a4a2a'; fc.fillRect(fx0 - 14, gy - 210, 30, 7);
  if (fade <= 0) ctx.drawImage(fa, px, py);
  ctx.fillStyle = rg(ctx, 0, py + ph / 2, ph * .35, ph * .85, [[0, 'rgba(255,200,120,0)'], [1, 'rgba(60,20,10,.5)']]); ctx.fillRect(px, py, ph, ph);
  ctx.fillStyle = lg(ctx, px, py, px + ph, py + ph * .4, [[0, 'rgba(255,220,160,.35)'], [.4, 'rgba(255,220,160,0)']]); ctx.fillRect(px, py, ph, ph);
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(px, py, ph, 2);
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(px, py + ph, ph, 1.5);
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(-PW / 2, -PH / 2 + 130); ctx.lineTo(-PW / 2 + 90, -PH / 2); ctx.lineTo(-PW / 2 + 110, -PH / 2); ctx.lineTo(-PW / 2, -PH / 2 + 160); ctx.fill();
  ctx.fillStyle = 'rgba(210,190,120,.7)'; ctx.save(); ctx.translate(0, -PH / 2 - 2); ctx.rotate(.04); ctx.fillRect(-34, -10, 68, 22); ctx.restore();
  // pai se desfazendo em poeira
  if (fade > 0) {
    const cs = 5, n = Math.ceil(ph / cs);
    for (let cy2 = 0; cy2 < n; cy2++) for (let cx2 = 0; cx2 < n; cx2++) {
      const sx = cx2 * cs, sy = cy2 * cs; if (sx > 130) continue;
      const hh = hash2(cx2, cy2, 5), thr = .6 * hh + .4 * (sx / 130), p = clamp((fade - thr) / .4);
      if (p >= 1) continue;
      const dx = -p * (40 + hh * 120) - p * p * 30, dy = -p * (20 + hh * 60) + Math.sin(t * 3 + hh * 9) * p * 6, sz = cs * (1 - p * .5);
      ctx.globalAlpha = 1 - p * p; ctx.drawImage(fa, sx, sy, cs, cs, px + sx + dx, py + sy + dy, sz, sz);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function drawFridge(ctx, x, y, s, open, o = {}) {
  const w = 260, h = 560, t = o.t || 0; open = clamp(open || 0); const ang = open * 1.5, cw = w * Math.cos(ang), hx = -w / 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (open > .02) { // luz fria vazando
    ctx.globalCompositeOperation = 'lighter'; const a = clamp(open * 1.4);
    ctx.fillStyle = rg(ctx, 0, 0, 40, 520, [[0, `rgba(170,220,255,${.34 * a})`], [1, 'rgba(170,220,255,0)']]); ctx.fillRect(-520, -520, 1040, 1040);
    ctx.fillStyle = lg(ctx, 0, h / 2, 0, h / 2 + 560, [[0, `rgba(190,230,255,${.34 * a})`], [1, 'rgba(190,230,255,0)']]); ctx.beginPath(); ctx.moveTo(-w / 2 + 14, h / 2 - 6); ctx.lineTo(w / 2 - 14, h / 2 - 6); ctx.lineTo(w / 2 + 200, h / 2 + 560); ctx.lineTo(-w / 2 - 200, h / 2 + 560); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.fillStyle = '#9aa3ad'; rrect(ctx, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 16); ctx.fill();
  ctx.fillStyle = lg(ctx, 0, -h / 2, 0, h / 2, [[0, '#f2fbff'], [.5, '#cfeaf6'], [1, '#a9cfe2']]); rrect(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 10); ctx.fill();
  if (open > .02) {
    const sh = [-h / 2 + 150, -h / 2 + 270, -h / 2 + 390]; ctx.strokeStyle = 'rgba(120,170,200,.8)'; ctx.lineWidth = 5; for (const yy of sh) { ctx.beginPath(); ctx.moveTo(-w / 2 + 10, yy); ctx.lineTo(w / 2 - 10, yy); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-w / 2 + 10, yy + 2, w - 20, 8); }
    ctx.fillStyle = 'rgba(150,200,225,.6)'; rrect(ctx, -w / 2 + 16, h / 2 - 118, w - 32, 96, 8); ctx.fill();
    // garrafa (meio cheia)
    const bx = -66, by = sh[1];
    ctx.fillStyle = 'rgba(210,235,245,.85)'; rrect(ctx, bx - 20, by - 96, 40, 92, 8); ctx.fill(); ctx.fillRect(bx - 9, by - 118, 18, 26); ctx.fillStyle = '#c8283a'; ctx.fillRect(bx - 11, by - 124, 22, 9);
    ctx.fillStyle = '#f4f8fa'; rrect(ctx, bx - 18, by - 44, 36, 40, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(bx - 14, by - 90, 4, 80);
    // tomate
    const tx = 56, ty = sh[2] - 22; ctx.fillStyle = '#d83a2e'; ctx.beginPath(); ctx.arc(tx, ty, 24, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(tx - 8, ty - 9, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#4a9a3a'; wrSpark(ctx, tx, ty - 22, 11, 1);
    // ovo
    ctx.fillStyle = '#f3e4c8'; ctx.beginPath(); ctx.ellipse(-8, sh[2] - 14, 14, 18, .2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-13, sh[2] - 26, 4, 8);
    // meio limão
    const lx = 54, ly = sh[1] - 16; ctx.fillStyle = '#f2d23a'; ctx.beginPath(); ctx.arc(lx, ly, 20, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 2; for (let k = 0; k < 5; k++) { const a = Math.PI + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a) * 17, ly + Math.sin(a) * 17); ctx.stroke(); }
    // pote
    ctx.fillStyle = '#e8eef2'; rrect(ctx, -w / 2 + 28, sh[0] - 44, 56, 42, 5); ctx.fill(); ctx.fillStyle = '#4a8ad0'; ctx.fillRect(-w / 2 + 28, sh[0] - 50, 56, 9);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(w / 2 - 18, -h / 2 + 10, 6, h - 20);
  }
  // porta
  const k = 1 + .1 * Math.sin(ang), dh = h * k, shade = 1 - open * .45;
  ctx.beginPath(); ctx.moveTo(hx, -h / 2); ctx.lineTo(hx + cw, -dh / 2); ctx.lineTo(hx + cw, dh / 2); ctx.lineTo(hx, h / 2); ctx.closePath();
  ctx.fillStyle = lg(ctx, hx, 0, hx + w, 0, [[0, mix('#f4f6f8', '#7a8090', 1 - shade)], [1, mix('#cfd6dc', '#5a6070', 1 - shade)]]); ctx.fill();
  if (cw > 14) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(hx, -h / 2); ctx.lineTo(hx + cw, -dh / 2); ctx.lineTo(hx + cw, dh / 2); ctx.lineTo(hx, h / 2); ctx.closePath(); ctx.clip();
    ctx.translate(hx, 0); ctx.scale(cw / w, 1);
    ctx.fillStyle = 'rgba(90,100,115,.5)'; ctx.fillRect(0, -h / 2 + 190, w, 4); ctx.fillStyle = '#7a8290'; rrect(ctx, w - 30, -h / 2 + 60, 9, 100, 4); ctx.fill(); rrect(ctx, w - 30, -h / 2 + 220, 9, 130, 4); ctx.fill();
    ctx.fillStyle = '#e8c24a'; ctx.fillRect(40, -h / 2 + 260, 24, 24); ctx.fillStyle = '#d83a2e'; ctx.fillRect(86, -h / 2 + 300, 20, 20);
    ctx.save(); ctx.translate(120, -h / 2 + 130); ctx.rotate(-.06); ctx.fillStyle = '#fffdf4'; ctx.fillRect(-34, -22, 68, 44); ctx.fillStyle = '#c8283a'; ctx.fillRect(-34, -22, 68, 8); ctx.fillStyle = '#555'; for (let q = 0; q < 3; q++) ctx.fillRect(-28, -6 + q * 8, 40 + q * 6, 2.5); ctx.restore();
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}
function drawBill(ctx, x, y, rot, s, o = {}) {
  const bw = 130, bh = 70, a = o.a == null ? 1 : o.a, flip = o.flip == null ? 1 : o.flip;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s * flip);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-bw / 2 + 4, -bh / 2 + 6, bw, bh);
  ctx.fillStyle = flip < 0 ? '#e6e1d2' : '#f6f2e6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = o.col || '#c8283a'; ctx.fillRect(-bw / 2, -bh / 2, bw, 13); ctx.fillStyle = '#fff'; ctx.fillRect(-bw / 2 + 6, -bh / 2 + 4, 26, 5);
  ctx.fillStyle = '#9a968a'; for (let k = 0; k < 3; k++) ctx.fillRect(-bw / 2 + 8, -bh / 2 + 22 + k * 8, 56 - k * 8, 3);
  ctx.fillStyle = '#2a2a30'; ctx.fillRect(bw / 2 - 52, -bh / 2 + 22, 44, 8);
  ctx.fillStyle = '#222'; for (let k = 0; k < 30; k++) ctx.fillRect(-bw / 2 + 8 + k * 3.8, bh / 2 - 20, (k * 7 % 3) + 1, 14);
  if (o.stamp) { ctx.save(); ctx.rotate(-.25); ctx.strokeStyle = 'rgba(200,40,58,.85)'; ctx.lineWidth = 3; ctx.strokeRect(-32, -10, 64, 20); ctx.fillStyle = 'rgba(200,40,58,.85)'; ctx.font = '15px "Bangers",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VENCIDO', 0, 1); ctx.restore(); }
  ctx.restore();
}
function billRain(ctx, t, seed, o = {}) {
  const n = o.n || 26, b = o.box || { x: -60, y: -140, w: W + 120, h: H + 280 }, R = rng(seed * 17 + 3), sp = o.speed == null ? 1 : o.speed, items = [];
  for (let i = 0; i < n; i++) items.push({ x0: b.x + R() * b.w, ph: R(), v: .5 + R() * .9, d: .35 + R() * .85, rv: (R() - .5) * 1.4, fp: R() * 6.28, fs: 2 + R() * 3 });
  items.sort((a, c) => a.d - c.d);
  for (const it of items) {
    const y = b.y + ((it.ph * b.h + t * 170 * it.v * sp * it.d) % b.h), x = it.x0 + Math.sin(t * 1.3 * it.v + it.ph * 9) * 50 * it.d, rot = Math.sin(t * 1.1 * it.v + it.fp) * .9 + t * it.rv * .4, fl = Math.cos(t * it.fs + it.fp);
    drawBill(ctx, x, y, rot, it.d * .9, { stamp: it.fp > 4, a: (o.a == null ? 1 : o.a) * (.55 + .45 * it.d), flip: Math.abs(fl) < .12 ? .12 * Math.sign(fl || 1) : fl });
  }
}
function drawKite(ctx, x, y, s, rot, t, o = {}) {
  const pal = o.pal || ['#d8402f', '#f2b632', '#c23a2a', '#f08a2e'], c = Math.cos(rot || 0), sn = Math.sin(rot || 0), loc = (lx, ly) => [x + (lx * c - ly * sn) * s, y + (lx * sn + ly * c) * s];
  ctx.save(); ctx.lineCap = 'round';
  const b = loc(0, 8);
  if (o.cut) {
    const L = o.lineLen || 280, n = 26; ctx.strokeStyle = 'rgba(235,235,245,.85)'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const u = i / n, ph = t * 3 - u * 7, px = b[0] + Math.sin(ph) * 16 * u + u * L * -.25, py = b[1] + u * L * .95 + Math.cos(ph * .7) * 6 * u; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.globalAlpha = .9; ctx.stroke();
  } else if (o.anchor) {
    const ax = o.anchor.x, ay = o.anchor.y, d = Math.hypot(ax - b[0], ay - b[1]), sg = (o.sag == null ? .07 : o.sag) * d + Math.sin(t * 1.4) * 3;
    ctx.strokeStyle = 'rgba(240,240,250,.85)'; ctx.lineWidth = o.lw || 1.5; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.quadraticCurveTo((b[0] + ax) / 2, (b[1] + ay) / 2 + sg, ax, ay); ctx.stroke();
  }
  // rabiola
  const tl = (o.tail == null ? 200 : o.tail), nT = 12, base = loc(0, 54), tp = [];
  for (let i = 0; i <= nT; i++) { const u = i / nT; tp.push([base[0] + (Math.sin(t * 3.4 - u * 6) * 18 * (.3 + u) - sn * 0) * s * .8 + sn * -u * tl * s * .5 * 0 + Math.sin(rot || 0) * -u * tl * .3, base[1] + u * tl * s * .8 * c + Math.cos(t * 2.1 - u * 4) * 4]); }
  ctx.strokeStyle = 'rgba(40,20,20,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); tp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  for (let i = 1; i <= nT; i += 1) { const p = tp[i], q = tp[i - 1], ang = Math.atan2(p[1] - q[1], p[0] - q[0]); ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang + Math.PI / 2); ctx.fillStyle = pal[i % 4]; const bs = 7 * s * (.7 + .3 * (1 - i / nT)); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-bs, -bs * .9); ctx.lineTo(-bs, bs * .9); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bs, -bs * .9); ctx.lineTo(bs, bs * .9); ctx.closePath(); ctx.fill(); ctx.restore(); }
  if (o.glow) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y, 0, 110 * s, [[0, 'rgba(255,200,120,.35)'], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(x - 110 * s, y - 110 * s, 220 * s, 220 * s); ctx.globalCompositeOperation = 'source-over'; }
  const T = loc(0, -62), R = loc(44, -8), B = loc(0, 54), L = loc(-44, -8), C = loc(0, -8);
  const tri = (p, q, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(C[0], C[1]); ctx.lineTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.closePath(); ctx.fill(); };
  tri(T, R, pal[0]); tri(R, B, pal[1]); tri(B, L, pal[2]); tri(L, T, pal[3]);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.lineTo(R[0], R[1]); ctx.lineTo(C[0], C[1]); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(70,35,20,.85)'; ctx.lineWidth = Math.max(1, 1.6 * s); ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.lineTo(B[0], B[1]); ctx.moveTo(L[0], L[1]); ctx.lineTo(R[0], R[1]); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,190,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.lineTo(R[0], R[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(L[0], L[1]); ctx.closePath(); ctx.stroke();
  ctx.restore();
}
function drawTightrope(ctx, x0, y0, x1, y1, t, o = {}) {
  const sag = (o.sag == null ? 26 : o.sag), sway = o.sway == null ? 1 : o.sway, M = wrMood(o.mood == null ? 2 : o.mood), col = o.col || wrSilCol(M, .08), vib = o.vib || 0;
  const cy = (y0 + y1) / 2 + sag * 2 + Math.sin(t * 1.6) * 5 * sway;
  const yAt = x => { const u = clamp((x - x0) / (x1 - x0)); return (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1 + Math.sin(u * TAU * 2.5 - t * 9) * vib * Math.sin(u * Math.PI); };
  const pts = []; for (let i = 0; i <= 40; i++) { const x = lerp(x0, x1, i / 40); pts.push([x, yAt(x)]); }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = wrCol(M.rim, .4); ctx.lineWidth = 5.5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - 1.2) : ctx.moveTo(p[0], p[1] - 1.2)); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 4.5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  if (o.posts !== false) for (const [px, py] of [[x0, y0], [x1, y1]]) { if (px < -40 || px > W + 40) continue; ctx.fillStyle = col; ctx.fillRect(px - 5, py - 20, 10, 40); ctx.beginPath(); ctx.arc(px, py, 9, 0, TAU); ctx.fill(); }
  ctx.restore(); return { yAt, pts };
}
function wrZigzag(x0, y0, x1, y1, n, amp, seed) {
  const R = rng((seed || 1) * 7 + 3), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, pts = [[x0, y0]];
  for (let i = 1; i < n; i++) { const u = (i + (R() - .5) * .3) / n, a = amp * (.75 + R() * .5) * (i % 2 ? 1 : -1); pts.push([x0 + dx * u + nx * a, y0 + dy * u + ny * a]); }
  pts.push([x1, y1]); return pts;
}
function drawNeonPath(ctx, pts, prog, t, o = {}) {
  const col = o.col || '255,194,71', w = o.w || 5, g = o.glow == null ? 1 : o.glow; prog = clamp(prog);
  const lens = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
  let goal = tot * prog, path = [pts[0]], tip = pts[0];
  for (let i = 1; i < pts.length && goal > 0; i++) { const l = lens[i - 1]; if (goal >= l) { path.push(pts[i]); goal -= l; tip = pts[i]; } else { const u = goal / l; tip = [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; path.push(tip); goal = 0; } }
  if (path.length < 2) return tip;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const pass = (lw, a, c) => { ctx.strokeStyle = c || `rgba(${col},${a})`; ctx.lineWidth = lw; ctx.beginPath(); path.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
  pass(w * 7, .06 * g); pass(w * 3.6, .15 * g); pass(w * 2, .45 * g); ctx.globalCompositeOperation = 'source-over'; pass(w * 1.1, 1, `rgba(${col},1)`); pass(w * .45, 1, '#fff7dc');
  ctx.globalCompositeOperation = 'lighter';
  // pulso viajando
  const pu = (t * .5) % 1, seg = tot * prog * .12, st0 = tot * prog * pu; // trecho brilhante
  if (prog > .05) { let acc = 0; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = w * .6; ctx.beginPath(); let on = false; for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]), a0 = acc, a1 = acc + l; if (a1 > st0 && a0 < st0 + seg) { const u0 = clamp((st0 - a0) / l), u1 = clamp((st0 + seg - a0) / l); ctx.moveTo(lerp(path[i - 1][0], path[i][0], u0), lerp(path[i - 1][1], path[i][1], u0)); ctx.lineTo(lerp(path[i - 1][0], path[i][0], u1), lerp(path[i - 1][1], path[i][1], u1)); } acc = a1; } ctx.stroke(); }
  if (prog < 1 && prog > 0) {
    ctx.fillStyle = rg(ctx, tip[0], tip[1], 0, 46, [[0, 'rgba(255,255,255,.95)'], [.3, `rgba(${col},.6)`], [1, `rgba(${col},0)`]]); ctx.fillRect(tip[0] - 46, tip[1] - 46, 92, 92);
    ctx.fillStyle = '#fff'; wrSpark(ctx, tip[0], tip[1], 22 + Math.sin(t * 20) * 4, 1);
    const R = rng(Math.floor(t * 18) + 5); for (let i = 0; i < 6; i++) { const a = R() * TAU, d = 8 + R() * 36; ctx.fillStyle = `rgba(${col},${.8 * R()})`; ctx.fillRect(tip[0] + Math.cos(a) * d, tip[1] + Math.sin(a) * d, 2.2, 2.2); }
  }
  ctx.restore(); return tip;
}
function drawPortalRing(ctx, x, y, R, rot, t, o = {}) {
  const sq = o.squash || .3, n = o.n || 3, a = o.a == null ? 1 : o.a, c1 = o.col || '255,150,220', c2 = o.col2 || '140,220,255';
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.save(); ctx.scale(sq, 1); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, 0, 0, R * .1, R, [[0, `rgba(${c1},${.22 * a})`], [.7, `rgba(${c2},${.08 * a})`], [1, 'rgba(255,255,255,0)']]); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  for (let k = 0; k < n; k++) {
    const r = R * (1 - k * .06), gr = lg(ctx, 0, -r, 0, r, [[0, `rgba(${c1},${a})`], [.5, `rgba(255,255,255,${a})`], [1, `rgba(${c2},${a})`]]);
    ctx.strokeStyle = gr; ctx.globalAlpha = (.25 + .5 / (k + 1)); ctx.lineWidth = (14 - k * 3) ; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.globalAlpha = (1 - k * .2) * a; ctx.lineWidth = Math.max(1.2, 4.5 - k * 1.2); ctx.stroke();
  }
  ctx.restore(); ctx.globalCompositeOperation = 'lighter';
  const cols = ['#ffffff', '#ff9ad8', '#8fe8ff', '#ffe28a'];
  for (let i = 0; i < 12; i++) { const ang = t * (.9 + (i % 3) * .3) + i * .52, px = Math.cos(ang) * R * sq, py = Math.sin(ang) * R; ctx.fillStyle = cols[i % 4]; wrSpark(ctx, px, py, 5 + (i % 3) * 2.5, a * (.5 + .5 * Math.sin(t * 5 + i))); }
  ctx.restore();
}
function drawConstellation(ctx, pts, prog, t, o = {}) {
  const a = o.a == null ? 1 : o.a, sz = o.sz || 16, N = pts.length - 1, col = o.col || '255,255,255'; prog = clamp(prog); const g = prog * N;
  ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${col},${.1 * a})`; ctx.lineWidth = 1.2; ctx.setLineDash([4, 8]); ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
  const pass = (lw, al) => { ctx.strokeStyle = `rgba(${col},${al * a})`; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i < N && i < g; i++) { const u = Math.min(1, g - i), p = pts[i], q = pts[i + 1]; ctx.moveTo(p[0], p[1]); ctx.lineTo(lerp(p[0], q[0], u), lerp(p[1], q[1], u)); } ctx.stroke(); };
  pass(6, .12); pass(2.2, .9);
  const cc = ['#ffffff', '#ffd8f0', '#d8f0ff', '#fff2c0'];
  for (let i = 0; i <= N; i++) { if (i > g) break; const tw = .7 + .3 * Math.sin(t * 4 + i * 1.7), s = sz * (i === Math.floor(g) && g < N ? 1.4 : 1) * tw; ctx.fillStyle = cc[i % 4]; wrSpark(ctx, pts[i][0], pts[i][1], s, a); ctx.fillStyle = `rgba(255,255,255,${.25 * a})`; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], s * .5, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/* ===== EMBLEMA: estrela-bússola de vidro + raio dourado ===== */
function drawEmblem(ctx, x, y, R, t, o = {}) {
  const a = o.a == null ? 1 : o.a, rot = (o.rot || 0) + (o.spin || 0) * t, comp = o.compass == null ? 1.12 : o.compass, glow = o.glow == null ? 1 : o.glow;
  ctx.save();
  if (o.rays !== false) godRays(ctx, x, y, t, { n: 16, len: R * 13, a: .13 * a * glow, col: '255,236,210', sp: .07, w: .5, seed: 7 });
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, R * .2, R * 3.4, [[0, `rgba(255,236,255,${.3 * a * glow})`], [.25, `rgba(255,170,240,${.14 * a * glow})`], [.6, `rgba(160,140,255,${.05 * a * glow})`], [1, 'rgba(160,140,255,0)']]); ctx.fillRect(x - R * 3.4, y - R * 3.4, R * 6.8, R * 6.8);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  ctx.translate(x, y); ctx.rotate(rot);
  const star = (rotOff, Ls, rv, hue0, alpha) => {
    for (let k = 0; k < 8; k++) {
      const ak = -Math.PI / 2 + k * Math.PI / 4 + rotOff, L = Ls[k] * R, tx = Math.cos(ak) * L, ty = Math.sin(ak) * L;
      const vl = [Math.cos(ak - Math.PI / 8) * rv * R, Math.sin(ak - Math.PI / 8) * rv * R], vr = [Math.cos(ak + Math.PI / 8) * rv * R, Math.sin(ak + Math.PI / 8) * rv * R];
      const h = (hue0 + k * 38 + Math.sin(t * .8 + k) * 22 + 360) % 360;
      for (let side = 0; side < 2; side++) {
        const v = side ? vr : vl, hh = (h + (side ? 55 : 0)) % 360, l = side ? 70 : 84;
        ctx.fillStyle = lg(ctx, 0, 0, tx, ty, [[0, `hsla(${hh},60%,98%,${alpha})`], [.55, `hsla(${hh},85%,${l}%,${alpha * .95})`], [1, `hsla(${(hh + 40) % 360},90%,${l - 8}%,${alpha * .9})`]]);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(v[0], v[1]); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = `rgba(255,255,255,${.7 * alpha})`; ctx.lineWidth = R * .012; ctx.beginPath(); ctx.moveTo(vl[0], vl[1]); ctx.lineTo(tx, ty); ctx.lineTo(vr[0], vr[1]); ctx.moveTo(0, 0); ctx.lineTo(tx, ty); ctx.stroke();
    }
  };
  star(Math.PI / 8, [.72, .6, .72, .6, .72, .6, .72, .6], .4, 200, .9);
  star(0, [comp, .74, .96, .74, comp * .94, .74, .96, .74], .38, 150, 1);
  // varredura de brilho
  ctx.globalCompositeOperation = 'lighter';
  const FL = [comp, .74, .96, .74, comp * .94, .74, .96, .74]; ctx.save(); ctx.beginPath();
  for (let k = 0; k < 8; k++) { const ak = -Math.PI / 2 + k * Math.PI / 4; ctx.lineTo(Math.cos(ak - Math.PI / 8) * .38 * R, Math.sin(ak - Math.PI / 8) * .38 * R); ctx.lineTo(Math.cos(ak) * FL[k] * R, Math.sin(ak) * FL[k] * R); ctx.lineTo(Math.cos(ak + Math.PI / 8) * .38 * R, Math.sin(ak + Math.PI / 8) * .38 * R); }
  ctx.closePath(); ctx.clip();
  const sw = Math.sin(t * 1.3) * R; ctx.fillStyle = lg(ctx, sw - R * .3, -R * .3, sw + R * .3, R * .3, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4); ctx.restore();
  ctx.fillStyle = rg(ctx, 0, 0, 0, R * .34, [[0, 'rgba(255,255,255,.55)'], [.5, 'rgba(255,240,255,.18)'], [1, 'rgba(255,220,255,0)']]); ctx.fillRect(-R * .4, -R * .4, R * .8, R * .8);
  ctx.globalCompositeOperation = 'source-over';
  // RAIO DOURADO
  if (o.bolt !== false) {
    ctx.rotate(-rot + (o.boltRot == null ? .22 : o.boltRot));
    const J = o.crackle == null ? 1 : o.crackle, B = [[.30, -.82], [.08, -.46], [.24, -.40], [-.06, -.02], [.12, .06], [-.2, .42], [-.08, .48], [-.34, .86]];
    const rj = rng(Math.floor(t * 14) + 3), pts = B.map(p => [p[0] * R + (rj() - .5) * R * .012 * J, p[1] * R + (rj() - .5) * R * .012 * J]);
    const path = () => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); };
    ctx.lineJoin = 'miter'; ctx.miterLimit = 6; ctx.lineCap = 'butt';
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,190,70,${.22 * glow})`; ctx.lineWidth = R * .3; path(); ctx.stroke(); ctx.lineWidth = R * .17; ctx.strokeStyle = `rgba(255,200,90,${.3 * glow})`; path(); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#b8620f'; ctx.lineWidth = R * .16; path(); ctx.stroke();
    ctx.strokeStyle = '#f0a020'; ctx.lineWidth = R * .128; path(); ctx.stroke();
    ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = R * .085; path(); ctx.stroke();
    ctx.strokeStyle = '#fff3b8'; ctx.lineWidth = R * .03; ctx.save(); ctx.translate(-R * .012, -R * .01); path(); ctx.stroke(); ctx.restore();
    // faíscas no raio
    ctx.globalCompositeOperation = 'lighter'; const rs = rng(Math.floor(t * 8) + 11);
    for (let i = 0; i < 6; i++) { const p = pts[(rs() * pts.length) | 0]; ctx.fillStyle = '#fff4c0'; wrSpark(ctx, p[0] + (rs() - .5) * R * .1, p[1] + (rs() - .5) * R * .1, R * (.03 + rs() * .05), .9); }
  }
  ctx.restore();
  // flare e brilhos
  if (o.flare !== false) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    const sc = (.5 + .12 * Math.sin(t * 3)) * R;
    ctx.fillStyle = lg(ctx, x - R * 2.6, 0, x + R * 2.6, 0, [[0, 'rgba(255,220,255,0)'], [.5, `rgba(255,240,255,${.75 * glow})`], [1, 'rgba(255,220,255,0)']]); ctx.fillRect(x - R * 2.6, y - R * .018, R * 5.2, R * .036);
    ctx.fillStyle = lg(ctx, 0, y - R * 1.9, 0, y + R * 1.9, [[0, 'rgba(255,255,255,0)'], [.5, `rgba(255,255,255,${.5 * glow})`], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(x - R * .012, y - R * 1.9, R * .024, R * 3.8);
    ctx.fillStyle = '#fff'; wrSpark(ctx, x, y, sc * 1.1, .8 * glow);
    for (let i = 0; i < 8; i++) { const ang = t * .4 + i * .79, d = R * (1.15 + .35 * ((i * .37) % 1)); ctx.fillStyle = ['#fff', '#ffc8ee', '#bfe8ff', '#ffe9a0'][i % 4]; wrSpark(ctx, x + Math.cos(ang) * d, y + Math.sin(ang) * d, R * (.05 + .04 * Math.sin(t * 4 + i)), .8); }
    ctx.restore();
  }
}
function drawPhone(ctx, x, y, s, rot, o = {}) {
  const t = o.t || 0, pw = 150, ph = 300;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, 40, 340, [[0, 'rgba(120,170,255,.2)'], [1, 'rgba(120,170,255,0)']]); ctx.fillRect(-340, -340, 680, 680); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#1a1a24'; rrect(ctx, -pw / 2 - 6, -ph / 2 - 6, pw + 12, ph + 12, 30); ctx.fill(); ctx.strokeStyle = 'rgba(190,200,255,.45)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = lg(ctx, 0, -ph / 2, 0, ph / 2, [[0, '#0e1220'], [1, '#060810']]); rrect(ctx, -pw / 2, -ph / 2, pw, ph, 24); ctx.fill();
  ctx.fillStyle = '#05060c'; rrect(ctx, -26, -ph / 2 + 8, 52, 12, 6); ctx.fill();
  ctx.fillStyle = '#7e8aa8'; ctx.font = '30px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.time || '03:17', 0, -ph / 2 + 56);
  ctx.fillStyle = 'rgba(126,138,168,.6)'; ctx.font = '11px sans-serif'; ctx.fillText('terça-feira', 0, -ph / 2 + 80);
  // ícone de sinal cortado
  const cx = 0, cy = 10, blink = .55 + .45 * Math.max(0, Math.sin(t * 3));
  ctx.fillStyle = 'rgba(160,170,200,.5)'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - 34 + k * 18, cy + 24 - (k + 1) * 11, 11, (k + 1) * 11);
  ctx.strokeStyle = `rgba(255,70,80,${blink})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 46, cy + 34); ctx.lineTo(cx + 46, cy - 40); ctx.stroke();
  ctx.fillStyle = `rgba(255,255,255,${.7})`; ctx.font = '20px "Lilita One", sans-serif'; ctx.fillText(o.msg || 'Sem sinal', 0, cy + 68);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.moveTo(-pw / 2, -ph / 2 + 60); ctx.lineTo(pw / 2, -ph / 2 + 10); ctx.lineTo(pw / 2, -ph / 2 + 80); ctx.lineTo(-pw / 2, -ph / 2 + 140); ctx.fill();
  ctx.restore();
}
function drawClock(ctx, x, y, R, t, o = {}) {
  const gl = o.glow == null ? .5 : o.glow, sec = o.sec == null ? t : o.sec, mn = o.m == null ? (sec / 60) : o.m, hr = o.h == null ? mn / 12 : o.h;
  ctx.save(); ctx.translate(x, y);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 0, 0, R * .8, R * 2.4, [[0, `rgba(255,214,150,${.3 * gl})`], [1, 'rgba(255,214,150,0)']]); ctx.fillRect(-R * 2.4, -R * 2.4, R * 4.8, R * 4.8); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = o.col || '#2a2a38'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.fillStyle = lg(ctx, 0, -R, 0, R, [[0, '#fbf3df'], [1, '#e2d6b8']]); ctx.beginPath(); ctx.arc(0, 0, R * .9, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a2a38'; ctx.lineCap = 'round';
  for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, big = k % 5 === 0, r0 = R * (big ? .72 : .8), r1 = R * .86; ctx.lineWidth = big ? R * .045 : R * .015; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); ctx.lineTo(Math.sin(a) * r1, -Math.cos(a) * r1); ctx.stroke(); }
  const hand = (v, len, w, c) => { const a = v * TAU; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(-Math.sin(a) * len * .12, Math.cos(a) * len * .12); ctx.lineTo(Math.sin(a) * len, -Math.cos(a) * len); ctx.stroke(); };
  hand(hr, R * .5, R * .07, '#1c1c28'); hand(mn % 1, R * .76, R * .05, '#1c1c28'); hand(Math.floor(sec) % 60 / 60 + (1 - Math.exp(-(sec % 1) * 12)) / 60, R * .8, R * .018, '#c8283a');
  ctx.fillStyle = '#c8283a'; ctx.beginPath(); ctx.arc(0, 0, R * .05, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(-R * .25, -R * .45, R * .4, R * .2, -.5, 0, TAU); ctx.fill();
  ctx.restore();
}
