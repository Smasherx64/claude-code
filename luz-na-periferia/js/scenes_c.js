'use strict';
/* ============================================================
   scenes_c.js — CENAS C (42.6 → 66.7 s): refrão kawaii/cósmico
   hikari ga… (mão luminosa) · hikari no naka de odorou (fitas, estrela nasce) · DROP 49.0 (estrela explode, favela neon)
   mahou wa mada kiete inai (anéis/portais, saltos) · hoshi ga michibiku (escalada da constelação) · anata no yume wa honmono da yo (plano gigante)
   ============================================================ */

/* ---------- utilidades ---------- */
var C_RIM = [{ col: '#ff9ad8', dx: -1, dy: -.5, a: .9 }, { col: '#8fe8ff', dx: 1, dy: -.3, a: .55 }];
function c_hero(ctx, x, y, s, pose, t, o) { drawHero(ctx, x, y, s, pose, Object.assign({ t: t, rim: C_RIM }, o || {})); }
function c_magic(ctx, x, y, s, pose, t, o) { drawMagic(ctx, x, y, s, pose, Object.assign({ t: t, ribbons: 3, glow: .6 }, o || {})); }
function c_spark(ctx, x, y, r, a, t, col) {
  col = col || '255,220,240'; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rg(ctx, x, y, 0, r * 3, [[0, `rgba(255,255,255,${a})`], [.25, `rgba(${col},${.55 * a})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  ctx.fillStyle = '#fff'; ctx.globalAlpha = clamp(a); sparkle(ctx, x, y, r * 1.5, t * 1.2, '#fff'); sparkle(ctx, x, y, r * 1.0, .785 + t * .8, '#ffe6f6');
  ctx.restore();
}
/* hélice de fitas de luz em espiral em torno de um eixo vertical */
function c_spiral(ctx, cx, y0, y1, R, turns, ph, t, a, strands) {
  strands = strands || 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const N = 70;
  for (let k = 0; k < strands; k++) {
    const pk = ph + k * TAU / strands;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < N; i++) {
        const s0 = i / N, s1 = (i + 1) / N;
        const P = s => { const ang = pk + s * turns * TAU, rad = R * (.25 + .75 * Math.pow(Math.sin(Math.PI * clamp(s * .85 + .1)), .7)); return [cx + Math.sin(ang) * rad, lerp(y0, y1, s) + Math.cos(ang) * rad * .22, Math.cos(ang)]; };
        const A = P(s0), B = P(s1), dep = (A[2] + 1) / 2, tail = Math.pow(s1, .8);
        const al = a * tail * (.35 + .65 * dep);
        ctx.strokeStyle = pass ? `rgba(255,248,255,${al})` : `rgba(255,150,220,${al * .35})`;
        ctx.lineWidth = pass ? 1.8 + 3.4 * dep * tail : 9 + 10 * dep * tail;
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
    }
  }
  ctx.restore();
}
/* laje + postes/fios em coordenadas de mundo (largura grande) */
function c_roofFG(ctx, t, y, x0, x1) {
  ctx.save();
  const col = '#0b0719';
  // brilho da cidade subindo na beira da laje
  ctx.fillStyle = lg(ctx, 0, y - 150, 0, y, [[0, 'rgba(255,120,200,0)'], [1, 'rgba(255,120,200,.22)']]); ctx.globalCompositeOperation = 'lighter'; ctx.fillRect(x0, y - 150, x1 - x0, 150); ctx.globalCompositeOperation = 'source-over';
  // mureta de fundo
  ctx.fillStyle = '#1a0f36'; ctx.fillRect(x0, y - 22, x1 - x0, 23);
  ctx.fillStyle = 'rgba(255,170,230,.35)'; ctx.fillRect(x0, y - 23, x1 - x0, 2);
  // itens
  for (let i = Math.floor(x0 / 340); i * 340 < x1; i++) {
    const x = i * 340 + 40 + hash2(i, 1) * 120, k = ((i % 3) + 3) % 3;
    ctx.fillStyle = col; ctx.strokeStyle = col;
    if (k === 0) { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 32, y - 20); ctx.lineTo(x - 28, y - 70); ctx.moveTo(x + 32, y - 20); ctx.lineTo(x + 28, y - 70); ctx.stroke(); rrect(ctx, x - 44, y - 128, 88, 62, 13); ctx.fill(); ctx.fillStyle = 'rgba(255,150,220,.35)'; ctx.fillRect(x - 40, y - 126, 3, 56); }
    else if (k === 1) { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 190); ctx.stroke(); ctx.lineWidth = 2.6; ctx.beginPath(); for (let j = 0; j < 4; j++) { const yy = y - 190 + j * 24, hw = 44 - j * 6; ctx.moveTo(x - hw, yy); ctx.lineTo(x + hw, yy); } ctx.stroke(); }
    else { ctx.fillRect(x - 40, y - 62, 80, 42); ctx.fillRect(x - 24, y - 104, 56, 42); ctx.fillStyle = 'rgba(255,150,220,.3)'; ctx.fillRect(x - 40, y - 62, 80, 2); }
  }
  // laje
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 400, [[0, '#1c1040'], [1, '#07050f']]); ctx.fillRect(x0, y, x1 - x0, 1500);
  ctx.fillStyle = 'rgba(255,170,230,.55)'; ctx.fillRect(x0, y, x1 - x0, 2);
  ctx.fillStyle = lg(ctx, 0, y, 0, y + 40, [[0, 'rgba(255,140,220,.2)'], [1, 'rgba(255,140,220,0)']]); ctx.fillRect(x0, y, x1 - x0, 40);
  ctx.restore();
}
function c_poles(ctx, t, y, x0, x1, h) {
  ctx.save(); const gap = 640, flags = ['#ff6ab8', '#35d6ff', '#ffd23f', '#a98cff', '#6dff9c'];
  const i0 = Math.floor(x0 / gap) - 1, i1 = Math.ceil(x1 / gap) + 1;
  ctx.strokeStyle = '#07050f'; ctx.fillStyle = '#07050f';
  for (let i = i0; i <= i1; i++) {
    const x = i * gap + 120; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 46, y - h + 26); ctx.lineTo(x + 46, y - h + 26); ctx.stroke();
    for (let w = 0; w < 2; w++) {
      const xa = x + (w ? -40 : 40), xb = xa + gap, sag = 46, ya = y - h + 24, yb = ya;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, ya); ctx.quadraticCurveTo((xa + xb) / 2, ya + sag * 2, xb, yb); ctx.stroke();
      if (w === 0) for (let k = 1; k < 14; k++) { const u = k / 14, px = lerp(xa, xb, u), py = ya + sag * 2 * u * (1 - u) * 1, sw = Math.sin(t * 2 + k + i) * 3; ctx.fillStyle = flags[(k + i + 50) % 5]; ctx.globalAlpha = .85; ctx.beginPath(); ctx.moveTo(px - 8, py); ctx.lineTo(px + 8, py); ctx.lineTo(px + sw, py + 20); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    }
  }
  ctx.restore();
}
function c_blobs(ctx, t, x0, y0, x1, y1, n, seed, a, col) {
  const R = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, R()), y = lerp(y0, y1, R()), r = 150 + R() * 230, dx = Math.sin(t * .2 + i) * 20;
    ctx.fillStyle = rg(ctx, x + dx, y, 0, r, [[0, `rgba(${col || '150,90,215'},${a * (.5 + R() * .5)})`], [1, `rgba(${col || '150,90,215'},0)`]]);
    ctx.save(); ctx.translate(x + dx, y); ctx.scale(1.7, .6); ctx.translate(-(x + dx), -y); ctx.fillRect(x + dx - r, y - r, r * 2, r * 2); ctx.restore();
  }
  ctx.restore();
}

/* palco: céu + cidade (paralaxe) + fg em câmera (cx,cy,z,r) + pós-processamento */
function c_stage(ctx, t, c) {
  const z = c.z || 1, cx = c.cx == null ? 360 : c.cx, cy = c.cy == null ? 640 : c.cy, r = c.r || 0, roofY = c.roofY == null ? 900 : c.roofY;
  let sx = 0, sy = 0; if (c.shake) { sx = wob(t, 23, 3) * c.shake; sy = wob(t, 23, 9) * c.shake; }
  const ccx = cx + sx, ccy = cy + sy, rs = 640 + (roofY - ccy) * z, shift = rs - roofY, zb = 1.1 + (z - 1) * .5;
  const bi = beatInfo(t), beat = c.beat === false ? 0 : .55 + .45 * bi.pulse;
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(r * .85); ctx.scale(zb, zb); ctx.translate(-W / 2, -H / 2);
  const baseS = roofY + 14 + shift * .4, baseL = 640 + (baseS - 640) / zb;
  drawSky(ctx, c.mood, t, { hy: c.hy || (c.city === false ? 1500 : 980), cam: ccx, glow: c.skyGlow, stars: c.stars, clouds: c.clouds == null ? 1 : c.clouds });
  ctx.save(); ctx.translate(-(ccx - 360) * .12, -(ccy - 640) * .28 + (c.skyY || 0));
  if (c.rays) godRays(ctx, c.rays.x, c.rays.y, t, { n: c.rays.n || 14, len: 2200, a: c.rays.a, col: c.rays.col || '255,214,240', sp: .05, w: .45, seed: 3 });
  if (c.emb) drawEmblem(ctx, c.emb.x, c.emb.y, c.emb.R, t, { a: c.emb.a == null ? 1 : c.emb.a, glow: c.emb.glow == null ? 1 : c.emb.glow, rays: c.emb.rays, rot: c.emb.rot || 0, spin: c.emb.spin || 0, flare: c.emb.flare });
  if (c.sky) c.sky(ctx, t);
  ctx.restore();
  if (c.city !== false) {
    drawSkyline(ctx, ccx - 360, baseL, c.mood2 == null ? c.mood : c.mood2, { t: t, lit: c.lit, beat: beat, hillH: c.hill || 560, camY: -.6 * shift, seed: c.seed || 3, fog: c.fog == null ? .55 : c.fog, haze: c.fog == null ? .6 : c.fog });
    if (c.wave) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const wx = ((t * 330) % (W + 500)) - 250; ctx.fillStyle = lg(ctx, wx - 200, 0, wx + 200, 0, [[0, 'rgba(255,120,220,0)'], [.5, `rgba(255,170,240,${.22 * c.wave})`], [1, 'rgba(255,120,220,0)']]); ctx.fillRect(wx - 200, baseL - 560, 400, 620); ctx.restore(); }
  }
  { const dm = c.dim == null ? .34 : c.dim; if (dm > 0) { ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, `rgba(34,10,86,${dm * .55})`], [1, `rgba(34,10,86,${dm})`]]); ctx.fillRect(-W, -H, W * 3, H * 3); } }
  ctx.restore();
  ctx.save(); cam(ctx, { x: ccx, y: ccy, z: z, r: r });
  if (c.roof !== false && roofY < ccy + 900) { c_roofFG(ctx, t, roofY, ccx - 1400, ccx + 1400); }
  if (c.fg) c.fg(ctx, t, bi);
  if (c.poles) c_poles(ctx, t, roofY, ccx - 900, ccx + 900, 520);
  if (c.fg2) c.fg2(ctx, t, bi);
  ctx.restore();
  if (c.over) c.over(ctx, t, bi);
  if (c.bloom !== 0) fxBloom(ctx, c.bloom == null ? .2 : c.bloom, 10);
  fxGrade(ctx, 'neon', c.grade == null ? .16 : c.grade);
  fxVignette(ctx, c.vig == null ? .5 : c.vig, '8,0,26');
}
/* mapa mood/lit por tempo para o build */
function c_dust(ctx, t, a, kind, seed, n) { fxParticles(ctx, t, kind || 'dust', { x: 0, y: 0, w: W, h: H }, { n: n || 50, seed: seed || 2, a: a == null ? .7 : a, col: '#ffd0f0' }); }

/* ---------- caminho de estrelas (degraus) ---------- */
var C_ST = { x0: 260, y0: 880, dx: 64, dy: 105 };
function c_stairPts(n) { const p = []; for (let i = 0; i < n; i++) { const x = C_ST.x0 + i * C_ST.dx, y = C_ST.y0 - i * C_ST.dy; p.push([x, y], [x + C_ST.dx, y]); } p.push([C_ST.x0 + n * C_ST.dx, C_ST.y0 - n * C_ST.dy]); return p; }
var C_STP = null;
function c_stairPos(p) { // p em degraus -> [x, y, ph]
  const i = Math.floor(p), f = p - i, x = C_ST.x0 + i * C_ST.dx, y = C_ST.y0 - i * C_ST.dy;
  const up = E.io2(seg(f, .45, 1));
  return [x + 8 + (C_ST.dx - 16) * f * .9, y - C_ST.dy * up - Math.sin(Math.PI * clamp(seg(f, .45, 1))) * 22, p * Math.PI];
}
function c_climbP(t) { return clamp((t - 55.7) / .375, 0, 99) * (t > 56.9 ? 1 : 1) ; }
function c_climbHero(t) { return c_stairPos(Math.max(0, (t - 55.7) / .4)); }
function c_climbMag(t) { const q = c_stairPos(Math.max(0, (t - 55.7) / .4) + 1.6); return [q[0] - 8, q[1] - 40 + Math.sin(t * 2.4) * 10]; }
function c_climbFG(ctx, t, prog, o) {
  o = o || {}; if (!C_STP) C_STP = c_stairPts(22);
  drawConstellation(ctx, C_STP, prog, t, { sz: 15, a: o.a == null ? 1 : o.a, col: '255,236,255' });
  // linhas de brilho nos degraus acesos
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 22; i++) { if (i / 22 > prog) break; const x = C_ST.x0 + i * C_ST.dx, y = C_ST.y0 - i * C_ST.dy; ctx.fillStyle = lg(ctx, 0, y, 0, y + 70, [[0, 'rgba(255,170,240,.28)'], [1, 'rgba(255,170,240,0)']]); ctx.fillRect(x, y, C_ST.dx, 70); }
  ctx.restore();
}
function c_climbActors(ctx, t, o) {
  o = o || {}; const hp = c_climbHero(t), mg = c_climbMag(t), s = o.s || 46, ph = hp[2];
  const hpose = climbPose(ph, .9); hpose.hR = 'fist'; hpose.aR = [lerp(hpose.aR[0], 150, .5), lerp(hpose.aR[1], 160, .5)];
  c_magic(ctx, mg[0], mg[1] + 44, s, flyPose(t), t, { ribbons: 3, wind: [-.8, .6] });
  c_hero(ctx, hp[0], hp[1], s, hpose, t, { shadow: false });
  return { h: hp, m: mg };
}

/* ============================================================
   1) 42.6–44.3  Hikari ga… koko ni aru… — mão luminosa e a faísca
   ============================================================ */
function c_s1(ctx, t, L, D) {
  const u = L / D, hs = 64, HY = 900;
  const ru = E.io2(seg(u, .12, .86)), hp = reachUp(ru);
  const full = charPt(0, HY, hs, reachUp(1), 'handR', {}); const HX = 330 - full[0];
  const hand = charPt(HX, HY, hs, hp, 'handR', {});
  const S = [330, full[1] - 70];
  const cs = 1.55 + 4 * 0, p = E.out3(seg(u, 0, .86));
  const palmEnd = [S[0] + 100, S[1] - 168], palm = [lerp(900, palmEnd[0], p), lerp(-320, palmEnd[1], p) + Math.sin(L * 3) * 4 * (1 - p)];
  const near = seg(u, .55, .95), burst = seg(u, .86, 1);
  c_stage(ctx, t, {
    mood: .15, lit: .16, cx: lerp(380, 340, u), cy: lerp(740, 560, E.io2(u)), z: lerp(1, 1.42, E.io2(u)), r: lerp(.03, -.01, u), hy: 940, wave: 0,
    skyGlow: .7, beat: false, bloom: .22, grade: .4,
    sky(g, tt) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, 360, 380, 0, 560, [[0, 'rgba(150,80,230,.4)'], [1, 'rgba(90,40,170,0)']]); g.fillRect(-300, -200, 1300, 1200); g.restore(); },
    fg(g, tt) {
      // feixe suave da mão até a faísca
      g.save(); g.globalCompositeOperation = 'lighter'; const gg = lg(g, palm[0], palm[1], S[0], S[1], [[0, 'rgba(255,200,240,.0)'], [1, `rgba(255,200,240,${.25 * near})`]]); g.strokeStyle = gg; g.lineWidth = 30; g.beginPath(); g.moveTo(palm[0], palm[1]); g.lineTo(S[0], S[1]); g.stroke(); g.restore();
      drawGiantHand(g, palm[0], palm[1], hs, Math.PI + .5, .35 - .3 * near, { lum: 1, arm: 5, t: tt, glowCol: '#ff9ed6', seed: 3, rim: [{ col: '#fff', dx: -1, dy: 0, a: .8 }] });
      c_hero(g, HX, HY, hs, hp, tt, { shadow: false });
      c_spark(g, S[0], S[1], 12 + 36 * near + 90 * burst * (1 - burst * .4), .5 + .5 * near + burst, tt);
      if (burst > 0) { fxShock(g, S[0], S[1], 43.95 + 0, t, { dur: .5, R: 300, w: 22, col: '#ffd0f0' }); }
      fxParticles(g, tt, 'fireflies', { x: S[0] - 260, y: S[1] - 260, w: 520, h: 520 }, { n: 22, seed: 4, a: .9 * (.3 + near), col: '#ffd6f0', clip: false });
    },
    over(g, tt) { c_dust(g, tt, .7, 'dust', 5, 60); flash(g, .35 * Math.exp(-(L) * 7)); }
  });
}

/* ============================================================
   2) 44.3–45.96  a figura mágica desce em fitas de luz espiralando
   ============================================================ */
function c_s2(ctx, t, L, D) {
  const u = L / D, hs = 58, HX = 230, GY = 900;
  const pd = E.out3(clamp(u * 1.05)), my = lerp(-380, GY - 6, pd), mx = 470 + 70 * Math.sin(u * 7) * (1 - pd) + 20 * (1 - u);
  const mpose = lerpPose(flyPose(t), danceMagic(t, 0), E.io2(seg(u, .6, 1)));
  const hpose = lerpPose(POSE.lookUp, POSE.reach, E.io2(seg(u, .25, .9)));
  c_stage(ctx, t, {
    mood: lerp(.5, 1.5, u), lit: lerp(.3, .5, u), cx: lerp(330, 400, u), cy: lerp(840, 640, E.io2(u)), z: lerp(1.15, 1.02, u), r: lerp(-.035, .015, u), wave: .5 * u,
    bloom: .22, rays: { x: 470, y: 120, a: .12 * u, n: 12 },
    fg(g, tt) {
      c_spiral(g, mx, my - 1100, my + 40, 150 * (1 - .45 * pd), 3.2, -tt * 3.3, tt, .95, 3);
      c_hero(g, HX, GY, hs, hpose, tt, { shadow: false });
      c_magic(g, mx, my, hs, mpose, tt, { ribbons: 3, ribbonLen: 1.3 });
      if (pd > .85) { g.save(); g.globalCompositeOperation = 'lighter'; fxShock(g, mx, GY, 44.3 + .85 * D / 1.05 * .88, t, { dur: .6, R: 260, w: 14, col: '#ffd0f0' }); g.restore(); }
      fxParticles(g, tt, 'petals', { x: 150, y: -300, w: 620, h: 1250 }, { n: 26, seed: 8, a: .8, col: '#ffe0f6', clip: false });
    },
    over(g, tt) { c_dust(g, tt, .55, 'dust', 6, 50); }
  });
}

/* ============================================================
   3) 45.96–47.46  close do herói olhando para cima — tilt up, a estrela nasce
   ============================================================ */
function c_s3(ctx, t, L, D) {
  const u = L / D, hs = 132, HY = 1380, e = E.io3(u);
  const pose = lerpPose(POSE.stand, POSE.lookUp, E.out2(seg(u, 0, .4))); pose.head = lerp(-10, -34, E.io2(u)); pose.lean = -6;
  const emR = 18 + 60 * E.out3(seg(u, .35, 1));
  c_stage(ctx, t, {
    mood: lerp(1.6, 2.4, u), lit: lerp(.5, .65, u), cx: lerp(330, 380, u), cy: lerp(760, 380, e), z: lerp(1.0, 1.1, u), r: lerp(.04, -.02, u), roof: false, city: true, roofY: 1000, hill: 520, wave: .6,
    bloom: .22, rays: { x: 470, y: 260, a: .22 * seg(u, .3, 1), n: 14 },
    emb: { x: 470, y: 280, R: emR, a: seg(u, .3, .6), glow: .4, rays: false, spin: .1 },
    fg(g, tt) {
      c_hero(g, 290, HY, hs, pose, tt, { shadow: false, rim: [{ col: '#ff9ad8', dx: 1, dy: -.6, a: .95, w: 1.4 }, { col: '#ffd9a0', dx: -1, dy: -.2, a: .5 }] });
      const hd = charPt(290, HY, hs, pose, 'head', {});
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, 560, hd[1] - 60, 0, 420, [[0, `rgba(255,150,220,${.35 * seg(u, .3, 1)})`], [1, 'rgba(255,150,220,0)']]); g.fillRect(100, hd[1] - 500, 900, 900); g.restore();
    },
    over(g, tt) { c_dust(g, tt, .75, 'starrain', 3, 40); flash(g, .2 * seg(u, .9, 1)); }
  });
}

/* ============================================================
   4) 47.46–49.0  build: a estrela cresce, janelas acendem, tudo vibra
   ============================================================ */
function c_s4(ctx, t, L, D) {
  const u = L / D, hs = 52, HX = 230, MX = 470, GY = 900, k = E.in2(u);
  const hp = reachUp(E.io2(seg(u, 0, .5))); hp.sq = (hp.sq || 0) + .03 * Math.sin(t * 40) * k;
  const mp = lerpPose(danceMagic(t, 0), flyPose(t), E.io2(seg(u, .2, .8)));
  const R = lerp(60, 130, E.io2(u)), c0 = { x: 360, y: 320 };
  c_stage(ctx, t, {
    mood: lerp(2.5, 3.4, u), lit: lerp(.55, 1, E.io2(u)), cx: 360 + wob(t, 3, 2) * 14, cy: lerp(760, 690, u), z: lerp(1.0, 1.28, E.in2(u)), r: lerp(.02, -.025, u), wave: 1, shake: 1 + 5 * k,
    bloom: .22, rays: { x: 360, y: 320, a: .1 + .28 * u, n: 16, col: '255,210,245' },
    emb: { x: c0.x, y: c0.y, R: R, a: 1, glow: .3 + .7 * u * u, spin: .12 * u },
    fg(g, tt) {
      c_hero(g, HX, GY, hs, hp, tt, { shadow: false });
      const hy = lerp(GY - 140, GY - 330, E.io2(u));
      c_magic(g, MX, hy, hs, mp, tt, { ribbons: 4, ribbonLen: 1.2 });
      c_spiral(g, MX, hy - 420, hy, 70, 2.4, -tt * 4, tt, .7 * (1 - u * .5), 2);
    },
    over(g, tt) {
      fxSpeed(g, tt, { kind: 'radial', cx: 360, cy: 330, n: 60, a: .55 * k, r0: 140, r1: 1000, seed: 3 });
      c_dust(g, tt, .8, 'starrain', 7, 60);
      flash(g, .85 * E.in3(seg(u, .84, 1)), '255,240,250');
    }
  });
}

/* ============================================================
   5) 49.0–50.29  DROP: a estrela-bússola explode, favela neon, os dois dançam
   ============================================================ */
function c_s5(ctx, t, L, D) {
  const u = L / D, hs = 50, GY = 900, bi = beatInfo(t), e = E.out3(seg(L, 0, .5));
  const R = lerp(190, 150, e) * (1 + .05 * bi.pulse);
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: lerp(290, 440, E.io2(u)), cy: lerp(740, 690, u), z: lerp(1.28, 1.06, E.out2(u)) * (1 + .018 * bi.pulse), r: lerp(-.055, .04, E.io2(u)), wave: .6,
    bloom: .2, grade: .16, rays: { x: 360, y: 300, a: .2, n: 18, col: '255,200,240' },
    emb: { x: 360, y: 300, R: R, a: 1, glow: .3 + .9 * Math.exp(-L * 4), spin: .15 }, hill: 470, fog: .45,
    fg(g, tt) {
      c_magic(g, 470, GY - 6, hs * 1.1, danceMagic(tt, 0), tt, { ribbons: 4, ribbonLen: 1.4, lift: .2 });
      c_hero(g, 250, GY, hs, danceHero(tt, 0), tt, { shadow: false });
    },
    over(g, tt) {
      const sp = c_dropSP(tt);
      fxShock(g, sp[0], sp[1], 49.0, tt, { dur: .8, R: 900, w: 54, col: '#fff0ff' }); fxShock(g, sp[0], sp[1], 49.12, tt, { dur: .8, R: 700, w: 30, col: '#ff9ad8' }); fxShock(g, sp[0], sp[1], 49.34, tt, { dur: .8, R: 600, w: 20, col: '#8fe8ff' });
      fxFlare(g, sp[0], sp[1], 1.2 * Math.exp(-L * 1.4) + .4, { a: .6 * Math.exp(-L * 1.6) + .1, col: '255,180,240' });
      fxSpeed(g, tt, { kind: 'radial', cx: sp[0], cy: sp[1], n: 70, a: .7 * Math.exp(-L * 4), r0: 120, r1: 1100, seed: 5 });
      fxParticles(g, tt, 'confettiStars', { x: 0, y: 0, w: W, h: H }, { n: 60, seed: 9, a: .9, speed: 1.4 });
      fxImpact(g, 49.0, tt, { dur: .09, x: sp[0], y: sp[1] });
      flash(g, .9 * Math.exp(-L * 16), '255,250,255');
    }
  });
}
function c_dropSP() { return [360, 330]; }

/* ============================================================
   6) 50.29–51.79  anéis de luz em fila: o herói salta através deles (travelling lateral)
   ============================================================ */
function c_leapPos(L, x0) { const cyc = .5, j = Math.floor(L / cyc), uj = L / cyc - j; return { x: x0 + 520 * L, uj: uj, j: j }; }
function c_rings(ctx, t, x0, nStart, n, hx, y, R, tag) {
  for (let k = 0; k < n; k++) {
    const rx = x0 + k * 260, near = clamp(1 - Math.abs(rx - hx) / 520), after = clamp((hx - rx) / 300);
    const a = clamp(.35 + .75 * near) * clamp(1.4 - after * .9);
    drawPortalRing(ctx, rx, y, R * (1 + .08 * Math.sin(t * 3 + k) + .25 * after * (1 - after)), 0, t + k, { squash: .26, a: a, n: 3, col: k % 2 ? '255,150,220' : '140,220,255', col2: k % 2 ? '255,230,160' : '255,150,220' });
  }
}
function c_s6(ctx, t, L, D) {
  const u = L / D, hs = 48, GY = 900, x0 = 60, hxF = tt => x0 + 520 * (tt - 50.29);
  const hp = c_leapPos(L, x0), pose = leapPose(hp.uj, 3.5);
  const hero = (g, tt, info) => { const q = c_leapPos(tt - 50.29, x0), ps = leapPose(clamp(q.uj < 0 ? 0 : q.uj), 3.5); c_hero(g, hxF(tt), GY, hs, ps, tt, { shadow: false, alpha: info && info.ghost ? 1 : 1 }); };
  const cx = hxF(t) + 150;
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: cx, cy: lerp(700, 640, u) + 20 * Math.sin(hp.uj * Math.PI) * -1, z: 1.3, r: lerp(.05, -.02, u) + .01 * Math.sin(hp.uj * 6.28), wave: .5, bloom: .22, hill: 540,
    sky(g, tt) { drawConstellation(g, [[100, 330], [210, 260], [330, 360], [440, 230], [560, 310], [660, 190]], seg(u, 0, .8), tt, { sz: 14, a: .9 }); },
    fg(g, tt) {
      c_rings(g, tt, 270, 0, 8, hxF(tt), 650, 150);
      // pegadas de poeira a cada pouso
      for (let j = 0; j < 4; j++) dustPuff(g, hxF(50.29 + j * .5 + .5 * .93) , GY, 50.29 + j * .5 + .46, tt, { size: 24, dir: -1, col: '255,190,230', a: .5 });
      drawTrail(g, hero, tt, 4, .045, { a: .5, col: '#ff9ad8', comp: 'lighter' });
      hero(g, tt, { ghost: false });
      const q = c_leapPos(tt - 50.29, x0); const p = charPt(hxF(tt), GY, hs, leapPose(q.uj, 3.5), 'chest', {});
      for (let i = 1; i < 14; i++) { const tp = tt - i * .035, qq = c_leapPos(tp - 50.29, x0), pp = charPt(hxF(tp), GY, hs, leapPose(clamp(qq.uj), 3.5), 'chest', {}); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = ['#fff', '#ffd0f0', '#bfe8ff', '#ffe9a0'][i % 4]; g.globalAlpha = 1 - i / 14; sparkle(g, pp[0] - i * 4, pp[1] + Math.sin(i * 2.3) * 12, 11 * (1 - i / 16), i, '#fff'); g.restore(); }
    },
    over(g, tt) { fxSpeed(g, tt, { kind: 'dir', ang: -.1, n: 26, a: .35, thick: 3, seed: 7 }); fxParticles(g, tt, 'confettiStars', { x: 0, y: 0, w: W, h: H }, { n: 30, seed: 3, a: .8 }); }
  });
}

/* ============================================================
   7) 51.79–53.29  a figura mágica gira em piruetas e voa; constelação se desenha (tilt-up orbital)
   ============================================================ */
function c_s7(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), hs = 62;
  const mx = 380 + 90 * Math.sin(L * 2.2), my = lerp(860, 700, E.out2(u)) + 18 * Math.sin(L * 4);
  const mp = danceMagic(t, 1); mp.lift = (mp.lift || 0) + 1.6 + .4 * Math.sin(L * 5);
  const pts = [[110, 230], [210, 140], [330, 230], [400, 90], [520, 190], [640, 90], [700, 220]];
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: lerp(400, 320, e), cy: lerp(830, 560, e), z: lerp(1.05, 1.3, e), r: lerp(-.06, .05, e), wave: .6, bloom: .22,
    rays: { x: 360, y: 100, a: .14, n: 12 },
    sky(g, tt) { drawConstellation(g, pts, seg(u, .05, .85), tt, { sz: 20, a: 1 }); shootingStar(g, tt, 3, { period: 1.3, dur: .35, len: 380, col: '255,255,255', a: 1 }); shootingStar(g, tt, 9, { period: 1.7, dur: .35, len: 320, col: '255,200,255', a: 1 }); },
    fg(g, tt) {
      c_hero(g, 130, 900, 40, danceHero(tt, 1), tt, { shadow: false });
      c_spiral(g, mx, my - 800, my, 130, 2.6, tt * 2, tt, .6, 2);
      drawTrail(g, (gg, t2) => { const mp2 = danceMagic(t2, 1); mp2.lift = (mp2.lift || 0) + 1.6 + .4 * Math.sin((t2 - 51.79) * 5); c_magic(gg, 380 + 90 * Math.sin((t2 - 51.79) * 2.2), my + 18 * Math.sin((t2 - 51.79) * 4) - 18 * Math.sin(L * 4), hs, mp2, t2, { ribbons: 2, glow: .6 }); }, tt, 3, .06, { a: .22, col: '#ffb8e8', comp: 'lighter' });
      c_magic(g, mx, my, hs, mp, tt, { ribbons: 4, ribbonLen: 1.5 });
    },
    over(g, tt) { fxParticles(g, tt, 'petals', { x: 0, y: 0, w: W, h: H }, { n: 40, seed: 2, a: .8, col: '#ffd0f0' }); fxFlare(g, mx * .3 + 250, 300, .5, { a: .35, col: '255,170,230' }); }
  });
}

/* ============================================================
   8) 53.29–54.79  túnel de anéis: o herói atravessa em queda livre, magia orbita (câmera rolando)
   ============================================================ */
function c_s8(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), cxm = 360, cym = 560;
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: 360 + wob(t, 2, 4) * 20, cy: lerp(700, 620, u), z: lerp(1.2, 1.5, e), r: lerp(-.12, .2, e), wave: .4, bloom: .22, roof: false, hill: 500,
    fg(g, tt) {
      for (let i = 0; i < 8; i++) {
        const d = ((i / 8 + L * .75) % 1), Rr = 30 + 640 * Math.pow(d, 2.4), a = Math.sin(Math.PI * Math.min(1, d * 1.25)) * .95;
        drawPortalRing(g, cxm + Math.sin(d * 5 + i) * 6 * d, cym + 20 * d, Rr, d * 3.2 + i, tt + i, { squash: 1, a: a, n: 2, col: i % 2 ? '255,150,220' : '140,220,255', col2: '255,230,170' });
      }
      const hsz = lerp(26, 62, E.in2(u)), ang = Math.sin(L * 3) * .25;
      c_magic(g, cxm + lerp(110, 190, e) * Math.cos(L * 5), cym + 70 + 40 * Math.sin(L * 5), hsz * .85, danceMagic(tt, 1), tt, { lift: 1, ribbons: 3 });
      c_hero(g, cxm, cym + hsz * 3.2, hsz, lerpPose(jumpPose(.55 + .1 * Math.sin(L * 4), 0), POSE.Vup, .3), tt, { shadow: false, rot: ang });
    },
    over(g, tt) { fxSpeed(g, tt, { kind: 'radial', cx: cxm, cy: cym, n: 80, a: .55, r0: 120, r1: 1000, seed: 11 }); fxParticles(g, tt, 'confettiStars', { x: 0, y: 0, w: W, h: H }, { n: 40, seed: 12, a: .9, speed: 2 }); }
  });
}

/* ============================================================
   9) 54.79–55.6  pousam, olham para cima; whip-tilt até os primeiros degraus de estrelas
   ============================================================ */
function c_s9(ctx, t, L, D) {
  const u = L / D, w = E.io3(seg(u, .38, 1)), hs = 52, lp = seg(u, 0, .45);
  const hp = lerpPose(POSE.crouch, POSE.lookUp, E.out2(seg(u, .12, .45))); const mp = lerpPose(danceMagic(t, 0), flyPose(t), E.io2(seg(u, .2, .8)));
  if (!C_STP) C_STP = c_stairPts(22);
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: lerp(380, 520, w), cy: lerp(780, -60, w), z: lerp(1.25, 1.05, w), r: lerp(.0, -.06, w), wave: .5, bloom: .22,
    rays: { x: 360, y: 200, a: .18, n: 14 },
    sky(g, tt) { shootingStar(g, tt, 5, { period: 1.0, dur: .3, len: 360, a: 1 }); },
    fg(g, tt) {
      c_climbFG(g, tt, seg(u, .3, 1) * .55);
      c_hero(g, 250, 900, hs, hp, tt, { shadow: false });
      c_magic(g, 440, 900 - 6 - 25 * Math.sin(u * 3), hs, mp, tt, { ribbons: 3 });
      dustPuff(g, 250, 900, 54.79, tt, { size: 30, dir: 1, col: '255,190,230', a: .5 });
    },
    over(g, tt) { fxSpeed(g, tt, { kind: 'dir', ang: Math.PI / 2, n: 50, a: .5 * w, thick: 4, seed: 9 }); c_dust(g, tt, .6, 'starrain', 3, 40); }
  });
}

/* ============================================================
   10–13) escalada da constelação (55.6–61.9)
   ============================================================ */
function c_s10(ctx, t, L, D) { // 55.6–57.04: crane acompanhando a subida dos degraus
  const u = L / D, hp = c_climbHero(t), hp2 = c_climbHero(t - .25);
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: hp2[0] + lerp(120, 40, u), cy: hp2[1] - lerp(80, 150, u), z: lerp(1.0, 1.18, E.io2(u)), r: lerp(.05, -.04, u), wave: .4, bloom: .22,
    rays: { x: 700, y: -400, a: .15, n: 12 }, skyY: 0, stars: 1.2,
    fg(g, tt) { c_blobs(g, tt, -200, -500, 1600, 800, 12, 5, .16); c_climbFG(g, tt, clamp(1.0 - 0)); c_climbActors(g, tt); },
    over(g, tt) { fxRainStars(g, tt, { a: .8, n: 60 }); }
  });
}
function c_s11(ctx, t, L, D) { // 57.04–58.54: close das mãos se tocando
  const u = L / D, s = 84, ru = E.io2(seg(u, .08, .5));
  const hpose = lerpPose({ lean: 6, head: 6, spread: .6, hs: .4, aR: [18, 10], aL: [-14, -8], lR: [3, 0], lL: [-3, 0] }, { lean: 6, head: -2, spread: .6, hs: .4, aR: [86, 90], aL: [-14, -8], lR: [3, 0], lL: [-3, 0], hR: 'flat' }, ru);
  const full = { lean: 6, head: -2, spread: .6, hs: .4, aR: [86, 90], aL: [-14, -8], lR: [3, 0], lL: [-3, 0], hR: 'flat' };
  const mpose = lerpPose({ lean: 2, head: 6, spread: .6, hs: .4, aR: [20, 10], aL: [-14, -8], lR: [3, 0], lL: [-3, 0], flare: .4 }, { lean: 2, head: -2, spread: .6, hs: .4, aR: [84, 88], aL: [-14, -8], lR: [3, 0], lL: [-3, 0], flare: .5, hR: 'flat' }, ru);
  const hh = charPt(0, 0, s, full, 'handR', {}), hm = charPt(0, 0, s, full, 'handR', {});
  const FY = 640 - hh[1] + 40, HX = 360 - hh[0] - 4, MX = 360 + hm[0] + 4;
  const touch = seg(u, .5, .62), kb = Math.exp(-Math.max(0, u - .52) * 6);
  const tp = [360, FY + hh[1]];
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: 360, cy: 640, z: lerp(1.0, 1.16, E.io2(u)), r: lerp(-.03, .03, u), roof: false, city: false, bloom: .22, stars: 1.3,
    sky(g, tt) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, 360, 560, 0, 520, [[0, 'rgba(255,170,240,.3)'], [1, 'rgba(255,170,240,0)']]); g.fillRect(-300, -100, 1300, 1200); g.restore(); drawConstellation(g, [[60, 220], [190, 300], [300, 190], [420, 300], [560, 170], [680, 280]], 1, tt, { sz: 17, a: .85 }); },
    fg(g, tt) {
      c_blobs(g, tt, -100, 300, 900, 1500, 7, 4, .14, '120,70,200');
      c_hero(g, HX, FY, s, hpose, tt, { shadow: false, rim: [{ col: '#ff9ad8', dx: 1, dy: -.4, a: 1, w: 1.5 }] });
      c_magic(g, MX, FY, s, mpose, tt, { flip: true, ribbons: 2, glow: .8 });
      c_spark(g, tp[0], tp[1], 10 + 60 * touch * (.3 + kb), touch, tt);
      fxShock(g, tp[0], tp[1], 57.04 + .5 * D, t, { dur: .7, R: 380, w: 20, col: '#ffd0f0' });
    },
    over(g, tt) { fxFlare(g, tp[0] + (0), tp[1], .6 + 1.2 * kb, { a: touch * (.3 + .7 * kb), col: '255,190,240', streak: .6 }); fxParticles(g, tt, 'fireflies', { x: 0, y: 0, w: W, h: H }, { n: 50, seed: 3, a: .9, col: '#ffd6f0' }); fxRainStars(g, tt, { a: .5, n: 30 }); }
  });
}
function c_s12(ctx, t, L, D) { // 58.54–60.04: sobem entre nuvens roxas (crane vertical)
  const u = L / D, hp = c_climbHero(t), hp2 = c_climbHero(t - .3);
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: hp2[0] - lerp(20, 140, u), cy: hp2[1] - lerp(260, 120, E.io2(u)), z: lerp(1.15, .98, u), r: lerp(-.05, .04, u), city: false, roof: false, wave: 0, bloom: .22, stars: 1.4,
    rays: { x: 360, y: 80, a: .2, n: 14 },
    sky(g, tt) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, 360, 100, 0, 700, [[0, 'rgba(255,150,230,.3)'], [1, 'rgba(255,150,230,0)']]); g.fillRect(-300, -400, 1300, 1300); g.restore(); },
    fg(g, tt) { c_blobs(g, tt, -300, -1200, 1700, 700, 16, 8, .2); c_climbFG(g, tt, 1); c_climbActors(g, tt, { s: 50 }); c_blobs(g, tt * 1.3, -300, hp[1] - 500, 1700, hp[1] + 200, 6, 12, .16, '255,150,220'); },
    over(g, tt) { fxRainStars(g, tt, { a: .9, n: 80 }); }
  });
}
function c_s13(ctx, t, L, D) { // 60.04–61.9: close do boné vermelho contra as estrelas
  const u = L / D, e = E.io2(u), s = 220;
  const pose = lerpPose(POSE.lookUp, POSE.reach, .0); pose.head = lerp(-30, -42, e); pose.lean = -8;
  const hd = charPt(0, 0, s, pose, 'head', {}); const HX = 300 - hd[0], HY = 760 - hd[1] + 40;
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: lerp(340, 380, e), cy: lerp(660, 600, e), z: lerp(1.0, 1.2, e), r: lerp(.05, -.03, u), city: false, roof: false, bloom: .22, stars: 1.4,
    emb: { x: 530, y: 150, R: lerp(120, 250, E.in2(u)), a: 1, glow: .4, spin: .1 },
    rays: { x: 530, y: 150, a: .2, n: 16 },
    fg(g, tt) {
      c_blobs(g, tt, -100, 500, 900, 1500, 8, 6, .2, '120,70,200');
      c_hero(g, HX, HY, s, pose, tt, { shadow: false, rim: [{ col: '#ffe4f6', dx: 1, dy: -.9, a: 1, w: 1.6 }, { col: '#ff9ad8', dx: -1, dy: -.3, a: .8, w: 1 }] });
      const cp = charPt(HX, HY, s, pose, 'top', {}); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rg(g, cp[0] + 40, cp[1] + 20, 0, 200, [[0, `rgba(255,70,90,${.25})`], [1, 'rgba(255,70,90,0)']]); g.fillRect(cp[0] - 200, cp[1] - 200, 500, 500); g.restore();
    },
    over(g, tt) { fxFlare(g, 530 + (0), 150 + (0), .8, { a: .6, col: '255,190,240' }); fxRainStars(g, tt, { a: .9, n: 70 }); flash(g, .5 * E.in3(seg(u, .9, 1)), '255,245,252'); }
  });
}

/* ============================================================
   14) 61.9–64.4  plano gigante: estrela enorme, cidade em festa, herói de braços erguidos
   ============================================================ */
function c_finalActors(ctx, t, s, hx, mx) {
  c_hero(ctx, hx, 900, s, lerpPose(POSE.Vup, POSE.cheer, .5 + .5 * Math.sin(t * 4)), t, { shadow: false });
  c_magic(ctx, mx, 900 - 6, s * 1.05, danceMagic(t, 0), t, { ribbons: 4, ribbonLen: 1.5 });
}
function c_s14(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), bi = beatInfo(t);
  const R = 215 * (1 + .03 * bi.pulse);
  c_stage(ctx, t, {
    mood: 4, lit: 1, cx: lerp(440, 360, e), cy: lerp(640, 690, e), z: lerp(1.3, 1.04, E.out2(u)), r: lerp(.05, -.015, e), wave: .5, bloom: .2,
    rays: { x: 360, y: 250, a: .2, n: 20, col: '255,200,240' },
    emb: { x: 360, y: 250, R: R, a: 1, glow: .35, spin: .05 }, hill: 400, fog: .4,
    fg(g, tt) { c_finalActors(g, tt, 40, 270, 460); },
    over(g, tt) {
      fxFlare(g, 360, 250, .9, { a: .25, col: '255,190,240' });
      fxParticles(g, tt, 'confettiStars', { x: 0, y: 0, w: W, h: H }, { n: 80, seed: 14, a: 1, speed: 1.2 });
      fxParticles(g, tt, 'petals', { x: 0, y: 0, w: W, h: H }, { n: 30, seed: 15, a: .8, col: '#ffd0f0' });
    }
  });
}
/* ============================================================
   15) 64.4–66.7  câmera recua e gira; a luz recua e tudo escurece rápido
   ============================================================ */
function c_s15(ctx, t, L, D) {
  const u = L / D, e = E.io2(u), bi = beatInfo(t), fade = sstep(66.05, 66.7, t), R = 215 * (1 - .5 * fade) * (1 + .03 * bi.pulse);
  c_stage(ctx, t, {
    mood: 4 - 1.6 * fade, lit: 1 - .5 * fade, cx: lerp(300, 420, e), cy: lerp(720, 690, e), z: lerp(1.18, 1.05, e), r: lerp(-.05, .05, e), wave: .4 * (1 - fade), bloom: .2 * (1 - fade * .8), poles: true,
    rays: { x: 360, y: 250, a: .2 * (1 - fade), n: 20, col: '255,200,240' },
    emb: { x: 360, y: 250, R: R, a: 1 - .7 * fade, glow: .35 * (1 - fade), spin: .05 }, hill: 400, fog: .4,
    fg(g, tt) { c_finalActors(g, tt, 40, 270, 460); },
    over(g, tt) {
      fxFlare(g, 360, 250, .9, { a: .22 * (1 - fade), col: '255,190,240' });
      fxParticles(g, tt, 'confettiStars', { x: 0, y: 0, w: W, h: H }, { n: 70, seed: 17, a: 1 - fade, speed: 1.2 });
      fxParticles(g, tt, 'petals', { x: 0, y: 0, w: W, h: H }, { n: 30, seed: 18, a: .8 * (1 - fade), col: '#ffd0f0' });
      if (fade > 0) { g.save(); g.fillStyle = `rgba(14,6,38,${.95 * E.in2(fade)})`; g.fillRect(0, 0, W, H); g.restore(); }
    }
  });
}

var SCENES_C = [
  { t0: 42.6, t1: 44.3, name: 'c_hand', fn: c_s1 },
  { t0: 44.3, t1: 45.96, name: 'c_descend', fn: c_s2 },
  { t0: 45.96, t1: 47.46, name: 'c_lookup', fn: c_s3 },
  { t0: 47.46, t1: 49.0, name: 'c_build', fn: c_s4 },
  { t0: 49.0, t1: 50.29, name: 'c_drop', fn: c_s5 },
  { t0: 50.29, t1: 51.79, name: 'c_rings', fn: c_s6 },
  { t0: 51.79, t1: 53.29, name: 'c_pirouette', fn: c_s7 },
  { t0: 53.29, t1: 54.79, name: 'c_tunnel', fn: c_s8 },
  { t0: 54.79, t1: 55.6, name: 'c_whip', fn: c_s9 },
  { t0: 55.6, t1: 57.04, name: 'c_climb1', fn: c_s10 },
  { t0: 57.04, t1: 58.54, name: 'c_hands', fn: c_s11 },
  { t0: 58.54, t1: 60.04, name: 'c_climb2', fn: c_s12 },
  { t0: 60.04, t1: 61.9, name: 'c_cap', fn: c_s13 },
  { t0: 61.9, t1: 64.4, name: 'c_giant1', fn: c_s14 },
  { t0: 64.4, t1: 66.7, name: 'c_giant2', fn: c_s15 }
];
var IMPACTS_C = [{ t: 49.0, d: .14, type: 'white' }, { t: 61.9, d: .1, type: 'white' }];
