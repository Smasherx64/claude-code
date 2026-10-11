// Renderiza frames deterministicamente com Chromium (Playwright) e, opcionalmente, junta tudo com ffmpeg + áudio original.
//   node render.mjs stills 1.2 3.5 ...        -> PNGs em out/stills/
//   node render.mjs frames 0 917 [worker]     -> JPGs em out/frames/
//   node render.mjs video                     -> out/luz-na-periferia.mp4
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync, spawn } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FPS = 30, DUR = 80.0, TOTAL = Math.round(FPS * DUR);
const SCALE = parseFloat(process.env.SCALE || '1.5');
const OUT = process.env.OUT || path.join(ROOT, 'out');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4' };

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, () => res(s));
  });
}
async function open(srv) {
  const b = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('pageerror', e => console.error('PAGEERROR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto(`http://localhost:${srv.address().port}/index.html?render=1&s=${SCALE}`);
  await p.evaluate(() => window.ready);
  return { b, p };
}
const [, , cmd, ...args] = process.argv;
const srv = await serve();
if (cmd === 'stills') {
  const { b, p } = await open(srv); fs.mkdirSync(`${OUT}/stills`, { recursive: true });
  for (const t of args) {
    const d = await p.evaluate(tt => { window.renderFrame(tt); return document.getElementById('c').toDataURL('image/png'); }, parseFloat(t));
    fs.writeFileSync(`${OUT}/stills/t${parseFloat(t).toFixed(2).padStart(5, '0')}.png`, Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close();
} else if (cmd === 'eval') {
  const { b, p } = await open(srv); fs.mkdirSync(`${OUT}/stills`, { recursive: true });
  const d = await p.evaluate(code => { ctx.setTransform(SC,0,0,SC,0,0); (0,eval)(code); return document.getElementById('c').toDataURL('image/png'); }, fs.readFileSync(args[0], 'utf8'));
  fs.writeFileSync(`${OUT}/stills/eval.png`, Buffer.from(d.split(',')[1], 'base64')); await b.close();
} else if (cmd === 'frames') {
  const a = parseInt(args[0] || 0), z = parseInt(args[1] ?? TOTAL - 1); fs.mkdirSync(`${OUT}/frames`, { recursive: true });
  const { b, p } = await open(srv); const t0 = Date.now();
  for (let i = a; i <= z; i++) {
    const d = await p.evaluate(tt => { window.renderFrame(tt); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, i / FPS);
    fs.writeFileSync(`${OUT}/frames/f${String(i).padStart(5, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
    if ((i - a) % 30 === 0) console.log(`frame ${i}/${z}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await b.close();
} else if (cmd === 'video') {
  const out = args[0] || `${OUT}/luz-na-periferia.mp4`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${OUT}/frames/f%05d.jpg`, '-i', path.join(ROOT, 'audio/song.m4a'),
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('ok', out);
}
srv.close(); process.exit(0);
