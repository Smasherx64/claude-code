# BRIEF — Opening de anime "Hikari no Mahou (光の魔法)"

Animação 100% em código (Canvas 2D, 1280x720 lógico, 30fps, 30.6s) sincronizada com a música (`audio/song.m4a`).
Renderização determinística: `renderFrame(t)` em `js/main.js` escolhe a cena pela tabela `SCENES`.
Estilo: abertura de anime. **Personagens simples/básicos (traço grosso com contorno), foco em cenários, quadros, closes, direção, arte.**

## Música (80 BPM, batida = 0.75s; `beatInfo(t)` em lib.js dá `.pulse` e `.f`)
- 0–2.9 intro calma · **2.92–14.4 verso de RAP em português** · 14.9–17.35 pré-refrão (queda de energia) · **17.35–29.9 REFRÃO em japonês** (drop em 17.35)
- Letra PT: "Acordo cedo, sol na cara, mais um dia pesado / Conta pra pagar, a geladeira pela metade / Me chamam de louco por ainda acreditar / Mas a fé é a única coisa que não dá pra roubar"
- Letra JP: "Hikari ga koko ni aru (14.9) / 光の中で踊ろう 魔法はまだ消えていない (17.35–23.7) / 星が導く 信じて (23.8–26.7) / あなたの夢は本物だよ (26.9–29.9)"

## Cenas (tabela SCENES em main.js; cada uma é `fn(ctx,t,L,D)`, L=tempo local, D=duração)
| t | função | arquivo | conteúdo |
|---|---|---|---|
| 0–2.92 | sceneIntro | scenes1.js | amanhecer cinza, tilt-up, esfera de porcelana rachada ("lua") pulsando |
| 2.92–4.80 | sceneWake | scenes1.js | extremo close nos olhos + persiana + "sol na cara" |
| 4.80–5.92 | sceneWeight | scenes1.js | peso 1000kg cai na cabeça |
| 5.92–7.17 | sceneBills | scenes1.js | boletos desabam na mesa da cozinha |
| 7.17–8.92 | sceneFridge | scenes1.js | geladeira pela metade (bateria 50%) |
| 8.92–10.90 | sceneStreet | scenes2.js | rua, vizinhos zombando, painel diagonal de mangá c/ olho |
| 10.90–11.92 | sceneShard | scenes2.js | esfera brilhando na palma |
| 11.92–14.92 | sceneFaith | scenes2.js | luz no peito, mão do ladrão (ZAP), cadeado |
| 14.92–17.35 | sceneHikari | scenes2.js | 光 se escreve em ouro, flare cresce até branco |
| 17.35–21.10 | sceneDrop | scenes3.js | DROP: cidade ganha cor, dança, closes |
| 21.10–23.80 | sceneMagic | scenes3.js | círculo mágico, olho com estrelas, janelas em coração |
| 23.80–26.90 | sceneStars | scenes3.js | constelação, gruas, vizinhos dançando, mãos em prece |
| 26.90–30.60 | sceneFinale | scenes3.js | mão ao espectador, 夢, recriação da capa, fade |

Legendas/títulos/karaokê NÃO ficam nas cenas: são desenhados por `overlay(ctx,t)` em `js/overlay.js` (dono: agente principal). Não desenhe letras de música dentro das cenas.

## Capa original (motivos recorrentes)
prédios cinza P&B à esquerda | nebulosa pintada azul/rosa/lilás com circuitos dourados à direita | esfera de porcelana rachada com kintsugi dourado e luz saindo | gruas de origami | linha horizontal de flare anamórfico.

## Biblioteca existente (leia os arquivos, estão comentados)
- `lib.js`: W,H,E(easing),rng,noise2,mix(hex|rgb),rgba,lg/rg(gradientes),poly,rrect,sparkle,beatInfo,cam(ctx,{x,y,z,r}),grain,vignette,speedLines,rays,flare,halftone,flash,invert,bloom(ctx,a,blur),chroma.
- `assets.js`: makeNebula/drawNebula(ctx,x,y,w,h,{z,ox,oy,hue}), drawStars, **CITY/pal/drawBlock/drawCity(ctx,camX,y0,c,o)/drawSky**, drawSphere(ctx,x,y,R,{crack,glow,shatter,t}), drawCrane(ctx,x,y,s,flap,{gold,rot}).
  `drawCity(ctx, camX, y0, c, o)`: c=0 mundo cinza … c=1 mundo colorido; o={night,lit,fog,t,noLayer,layerY}. `winRect(li,wx,col,row,camX,y0)` (scenes1.js) devolve uma janela para acender.
- `chars.js`: PAL, neighPal(i,c), POSE{stand,slump,fist,Vup,point,sweep,wide,hip,kick,crouch,reach}, walkPose, dancePose, skeleton, drawChar(ctx,x,y,s,pose,opts), drawHead, drawFace, charPt, lerpPose.
- `props.js`: eyesCU/fringe (closes), blinds, bokeh, motes, billSheet, weight1000, bigHand, lemon/ketchup/egg, batteryBadge, burst, emoji, starRing.
- `text.js`: txt/word/tag/bubble/ribbon/karaoke (só o overlay usa).

## Como testar (NÃO renderize o vídeo inteiro; só stills)
```
cd /home/user/claude-code/hikari-no-mahou
OUT=/tmp/out_<seuNome> SCALE=1 node render.mjs stills 1.2 3.5 17.8     # -> $OUT/stills/t01.20.png ...
OUT=/tmp/out_<seuNome> node render.mjs eval meu_teste.js               # roda código no contexto da página -> $OUT/stills/eval.png
```
Monte folhas de contato com ffmpeg (hstack/vstack, scale=480:270) e abra com a ferramenta Read para ver as imagens. Sempre confira visualmente.
Use `OUT` próprio para não colidir com outros agentes. Não faça git commit/push. Não edite arquivos que não são seus (veja "dono" abaixo). Erros de JS aparecem como PAGEERROR no stdout do render.

## Donos de arquivo
- Agente CHARS: `js/chars.js`, `js/props.js` (só cores/skin/hair padrão e o que for preciso p/ o novo personagem).
- Agente FAVELA: `js/assets.js` (parte da cidade: CITY, pal, drawBlock, drawCity, drawSky), `js/scenes1.js`, `js/scenes2.js`.
- Agente MAHOU: `js/scenes3.js`, novo `js/magic.js` (adicione `<script src="js/magic.js">` em index.html logo antes de scenes3.js — único edit permitido em index.html).
- Agente principal: `js/overlay.js`, `js/main.js`, `js/text.js`, `js/lib.js`, `render.mjs`.

## Contrato de API do personagem (novo)
`drawChar(ctx,x,y,s,pose,o)` mantém a assinatura. Opções novas:
- `o.magical` (0..1): 0 = visual de favela; 1 = traje de garota/garoto mágico (mahou shoujo kawaii). Valores intermediários = mistura/transição (a transformação/henshin usa isso).
- `o.wand` (0..1): varinha de estrela/coração na mão direita (aR[2]) com brilho.
- `o.wind` continua controlando o balanço do pano/fitas (cachecol vermelho vira fitas esvoaçantes no modo mágico).
`PAL.hero` continua existindo (cores do protagonista na versão favela); `PAL.heroMagic` = versão mágica. `drawHead(ctx,P,o,hairKind,t)` continua (o.magical também aceito).
