'use strict';
/* ============================================================
   lyrics.js — letra com tempos (texto: faixa de legenda embutida no vídeo; tempos: Whisper medium + conferência manual)
   LY_PT: rap em português, palavra a palavra · LY_JP: refrão em japonês, caractere a caractere (karaokê)
   ============================================================ */
function _pt(t0, t1, text, times) { const words = text.replace(/—/g, ' ').split(/\s+/).filter(Boolean); return { t0, t1, text, words: words.map((w, i) => [w, times[i]]) }; }
const LY_PT = [
  _pt(11.30, 13.54, 'Acordo cedo, sol na cara, mais um dia pesado', [11.30, 11.70, 12.10, 12.38, 12.60, 12.86, 13.00, 13.08, 13.24]),
  _pt(13.56, 15.02, 'Conta pra pagar, geladeira pela metade', [13.56, 13.78, 13.88, 14.12, 14.54, 14.70]),
  _pt(15.04, 17.55, 'A rua me ensinou o que escola não deu', [15.04, 15.22, 15.42, 15.70, 16.18, 16.44, 16.64, 17.08, 17.42]),
  _pt(17.60, 19.34, 'Sobreviver não é vitória, é obrigação aqui', [17.60, 18.12, 18.28, 18.40, 18.78, 19.00, 19.20]),
  _pt(19.36, 20.54, 'Minha mãe trabalha dobrado,', [19.62, 19.76, 19.88, 20.16]),
  _pt(20.56, 21.42, 'meu pai sumiu no vento', [20.56, 20.68, 20.84, 21.04, 21.14]),
  _pt(21.44, 23.50, 'Eu carrego o peso disso em cada movimento', [21.44, 21.68, 22.16, 22.32, 22.58, 22.86, 23.00, 23.16]),
  _pt(23.54, 25.12, 'Me chamam de louco por ainda acreditar', [23.54, 23.74, 23.84, 24.08, 24.28, 24.48, 24.64]),
  _pt(25.16, 27.40, 'Mas a fé é a única coisa que não dá pra roubar', [25.16, 25.40, 25.70, 25.78, 26.00, 26.10, 26.30, 26.52, 26.64, 26.76, 26.88, 26.96]),
  _pt(27.42, 29.62, 'Periferia não é fim — é ponto de partida', [27.42, 28.04, 28.14, 28.28, 28.78, 28.90, 29.10, 29.26]),
  _pt(29.66, 31.66, 'Cada cicatriz no peito é prova que eu ainda tenho vida', [29.66, 29.86, 30.28, 30.46, 30.70, 30.88, 31.08, 31.20, 31.30, 31.44, 31.58]),
  _pt(31.70, 33.60, 'E mesmo no escuro eu sei que existe uma saída', [31.70, 31.78, 31.94, 32.08, 32.32, 32.46, 32.52, 32.68, 32.86, 33.16]),
  _pt(48.36, 50.82, 'Quantas vezes caí e tive que me reerguer sozinho', [48.36, 48.86, 49.24, 49.70, 49.76, 49.90, 50.16, 50.50, 50.84]),
  _pt(51.26, 54.24, 'Não tinha rede de apoio, só o meu próprio destino', [51.30, 51.50, 51.84, 52.14, 52.42, 52.88, 53.00, 53.10, 53.36, 53.70]),
  _pt(54.26, 57.10, 'Olhei pro céu pedindo sinal, o sinal nunca veio', [54.26, 54.68, 54.84, 55.00, 55.70, 56.12, 56.36, 56.56, 56.98]),
  _pt(57.14, 60.28, 'Então fui eu mesmo que tracei o meu caminho no meio', [57.14, 57.46, 57.74, 57.94, 58.14, 58.48, 58.92, 59.04, 59.22, 59.68, 60.00]),
  _pt(60.30, 63.10, 'Não é sobre sorte, é sobre não parar de mover', [60.30, 60.68, 60.94, 61.10, 61.40, 61.58, 61.96, 62.18, 62.56, 62.80]),
  _pt(63.12, 65.86, 'É sobre chegar em casa e ter algo pra oferecer', [63.12, 63.50, 63.78, 64.10, 64.32, 64.54, 64.82, 65.00, 65.14, 65.30]),
  _pt(65.88, 67.50, 'Pra quem depende de mim, pra quem acredita em mim', [65.88, 66.02, 66.10, 66.32, 66.56, 66.78, 66.88, 67.00, 67.20, 67.32]),
  _pt(67.52, 69.08, 'A luta não tem pausa — mas também não tem fim', [67.52, 67.66, 67.78, 67.90, 68.00, 68.18, 68.30, 68.50, 68.70, 68.94]),
  _pt(69.10, 71.90, 'E quando tudo parece escuro demais pra ver', [69.10, 69.52, 69.78, 70.10, 70.48, 70.88, 71.22, 71.54]),
  _pt(91.28, 94.26, 'Eu sou da quebrada, mas meu sonho não tem cerca', [91.28, 91.92, 92.10, 92.24, 92.72, 92.88, 93.14, 93.44, 93.64, 93.96]),
  _pt(96.44, 100.90, 'Cada queda foi lição, cada dor foi escola', [96.44, 96.84, 97.20, 97.46, 98.24, 98.42, 98.72, 99.04]),
  _pt(117.10, 119.00, 'O seu sonho é real.', [117.10, 117.55, 117.90, 118.30, 118.50]),
];
/* JP: chars = [{c, t0}], t0/t1 = janela visível do verso */
function _jp(t0, t1, romaji, pt, str, times) { return { t0, t1, romaji, pt, chars: [...str].map((c, i) => ({ c, t0: times[i] })) }; }
const LY_JP = [
  _jp(33.68, 36.00, 'HIKARI GA KOKO NI ARU', 'A LUZ ESTÁ AQUI!', '光がここにある', [33.68, 34.22, 35.20, 35.45, 35.70, 35.85, 35.95]),
  _jp(36.10, 38.72, 'HIKARI NO NAKA DE ODOROU', 'VAMOS DANÇAR DENTRO DA LUZ!', '光の中で踊ろう', [36.10, 36.90, 37.30, 37.70, 38.00, 38.30, 38.50]),
  _jp(38.78, 41.80, 'MAHOU WA MADA KIETE INAI', 'A MÁGICA AINDA NÃO SE APAGOU!', '魔法はまだ消えていない', [38.78, 39.20, 39.56, 39.72, 40.00, 40.26, 40.70, 41.00, 41.30, 41.50, 41.70]),
  _jp(41.82, 44.20, 'HOSHI GA MICHIBIKU — SHINJITE', 'AS ESTRELAS GUIAM... ACREDITE!', '星が導く信じて', [41.82, 42.20, 42.56, 43.10, 43.50, 43.80, 44.00]),
  _jp(44.30, 47.90, 'ANATA NO YUME WA HONMONO DA YO', 'O SEU SONHO É DE VERDADE!', 'あなたの夢は本物だよ', [44.30, 44.50, 44.62, 44.74, 45.00, 45.46, 45.62, 45.80, 46.24, 46.54]),
  _jp(72.00, 73.35, 'DEMO... WATASHI GA IRU...', 'MAS... EU ESTOU AQUI...', 'でも私がいる', [72.00, 72.30, 72.70, 72.95, 73.10, 73.25]),
  _jp(73.40, 75.90, 'HIKARI NO NAKA DE ODOROU', 'VAMOS DANÇAR DENTRO DA LUZ!', '光の中で踊ろう', [73.40, 74.00, 74.40, 74.80, 75.10, 75.45, 75.65]),
  _jp(75.92, 79.15, 'MAHOU WA MADA KIETE INAI', 'A MÁGICA AINDA NÃO SE APAGOU!', '魔法はまだ消えていない', [75.92, 76.35, 76.70, 76.90, 77.20, 77.55, 77.95, 78.20, 78.45, 78.70, 78.90]),
  _jp(79.18, 81.90, 'ITAKUTE MO, MAE E SUSUMOU', 'MESMO DOENDO, VAMOS EM FRENTE!', '痛くても前へ進もう', [79.18, 79.55, 79.80, 80.10, 80.40, 80.80, 81.10, 81.50, 81.70]),
  _jp(81.95, 85.20, 'ANATA WA HITORI JA NAI', 'VOCÊ NÃO ESTÁ SÓ!', 'あなたは一人じゃない', [81.95, 82.30, 82.50, 82.75, 83.10, 83.50, 83.90, 84.10, 84.40, 84.70]),
  _jp(94.28, 96.42, 'YUME WA SORA YORI TAKAI', 'O SONHO É MAIS ALTO QUE O CÉU', '夢は空より高い', [94.28, 94.70, 95.00, 95.40, 95.65, 95.90, 96.20]),
  _jp(100.96, 102.35, 'MOTTO KAGAYAKE', 'BRILHE MAIS!', 'もっと輝け', [100.96, 101.20, 101.30, 101.70, 102.10]),
  _jp(102.40, 105.10, 'HIKARI NO NAKA DE ODOROU', 'VAMOS DANÇAR DENTRO DA LUZ!', '光の中で踊ろう', [102.40, 103.10, 103.40, 103.90, 104.20, 104.60, 104.85]),
  _jp(105.12, 109.25, 'MAHOU WA MADA KIETE INAI', 'A MÁGICA AINDA NÃO SE APAGOU!', '魔法はまだ消えていない', [105.20, 105.70, 106.20, 106.60, 107.00, 107.40, 107.90, 108.20, 108.50, 108.80, 109.00]),
  _jp(109.30, 111.72, 'HOSHI GA MICHIBIKU — SHINJITE', 'AS ESTRELAS GUIAM... ACREDITE!', '星が導く信じて', [109.32, 109.80, 110.20, 110.50, 110.75, 111.10, 111.40]),
  _jp(111.76, 117.05, 'ANATA NO YUME WA HONMONO DA YO', 'O SEU SONHO É DE VERDADE!', 'あなたの夢は本物だよ', [111.76, 111.94, 112.08, 112.22, 112.48, 112.94, 113.22, 113.64, 113.90, 114.10]),
];
/* marcos da música (para os agentes de cena) */
const SONG = { intro: [0, 11.3], verse1: [11.3, 33.68], pre1: [33.68, 36.0], chorus1: [36.0, 48.3], verse2: [48.3, 72.0], pre2: [72.0, 72.8], chorus2: [72.8, 86.5], breakdown: [86.5, 91.28], verse3: [91.28, 102.35], chorus3: [102.4, 118.9], silence: [119.0, 123.1], dur: 123.1 };
