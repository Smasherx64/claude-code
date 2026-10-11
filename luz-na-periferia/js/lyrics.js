'use strict';
/* letra com tempos (Whisper small+medium cruzados com a letra da música; o áudio original é um corte de 80 s que termina em "…o meu caminho no meio") */
function _pt(t0, t1, text, times) { const words = text.replace(/—/g, ' ').split(/\s+/).filter(Boolean); return { t0, t1, text, words: words.map((w, i) => [w, times[i]]) }; }
const LY_PT = [
  _pt(13.10, 16.30, 'Acordo cedo, sol na cara, mais um dia pesado', [13.14, 13.72, 14.30, 14.56, 14.72, 15.06, 15.36, 15.52, 15.70]),
  _pt(16.40, 18.85, 'Conta pra pagar, geladeira pela metade', [16.40, 16.60, 16.90, 17.40, 18.02, 18.32]),
  _pt(18.90, 21.60, 'A rua me ensinou o que escola não deu', [18.90, 19.08, 19.24, 19.56, 19.98, 20.26, 20.52, 20.86, 21.22]),
  _pt(21.68, 23.98, 'Sobreviver não é vitória, é obrigação aqui', [21.68, 22.22, 22.36, 22.54, 22.96, 23.16, 23.56]),
  _pt(24.00, 25.12, 'Minha mãe trabalha dobrado,', [24.00, 24.10, 24.30, 24.70]),
  _pt(25.18, 26.38, 'meu pai sumiu no vento', [25.18, 25.30, 25.45, 25.78, 25.96]),
  _pt(26.44, 28.82, 'Eu carrego o peso disso em cada movimento', [26.44, 26.60, 27.00, 27.16, 27.40, 27.66, 27.88, 28.20]),
  _pt(28.88, 31.20, 'Me chamam de louco por ainda acreditar', [28.88, 29.00, 29.10, 29.38, 29.64, 30.04, 30.56]),
  _pt(31.28, 33.90, 'Mas a fé é a única coisa que não dá pra roubar', [31.28, 31.46, 31.60, 31.74, 31.98, 32.02, 32.20, 32.58, 32.78, 33.02, 33.28, 33.52]),
  _pt(33.94, 37.10, 'Periferia não é fim — é ponto de partida', [33.94, 34.82, 35.08, 35.30, 35.86, 35.95, 36.28, 36.60]),
  _pt(37.14, 39.98, 'Cada cicatriz no peito é prova que eu ainda tenho vida', [37.14, 37.48, 38.00, 38.20, 38.42, 38.64, 38.82, 39.00, 39.12, 39.32, 39.60]),
  _pt(40.02, 42.60, 'E mesmo no escuro eu sei que existe uma saída', [40.02, 40.14, 40.38, 40.66, 40.98, 41.18, 41.30, 41.54, 41.78, 42.16]),
  _pt(66.66, 69.40, 'Quantas vezes caí e tive que me reerguer', [66.66, 67.14, 67.72, 68.14, 68.26, 68.46, 68.74, 69.02]),
  _pt(69.42, 72.85, 'sozinho. Não tinha rede de apoio, só o meu próprio destino', [69.42, 69.86, 70.06, 70.38, 70.72, 71.02, 71.50, 71.74, 71.98, 72.12, 72.44]),
  _pt(72.88, 75.90, 'Olhei pro céu pedindo sinal, o sinal nunca veio', [72.88, 73.20, 73.40, 73.62, 74.10, 74.55, 74.78, 75.20, 75.56]),
  _pt(75.94, 79.40, 'Então fui eu mesmo que tracei o meu caminho no meio', [75.94, 76.32, 76.56, 76.74, 76.98, 77.30, 77.76, 77.86, 78.04, 78.36, 78.66]),
];
function _jp(t0, t1, romaji, pt, str, times) { return { t0, t1, romaji, pt, chars: [...str].map((c, i) => ({ c, t0: times[i] })) }; }
const LY_JP = [
  _jp(42.62, 44.28, 'HIKARI GA... KOKO NI ARU...', 'A LUZ... ESTÁ AQUI', '光がここにある', [42.62, 43.00, 43.35, 43.55, 43.75, 43.95, 44.10]),
  _jp(44.30, 49.00, 'HIKARI NO NAKA DE ODOROU', 'VAMOS DANÇAR NA LUZ', '光の中で踊ろう', [44.30, 44.84, 45.38, 46.18, 46.82, 47.50, 47.86]),
  _jp(49.60, 55.60, 'MAHOU WA MADA KIETE INAI', 'A MAGIA AINDA NÃO SUMIU', '魔法はまだ消えていない', [49.90, 51.44, 52.30, 53.30, 53.60, 53.94, 54.34, 54.70, 55.00, 55.20, 55.40]),
  _jp(55.62, 61.80, 'HOSHI GA MICHIBIKU, SHINJITE', 'AS ESTRELAS GUIAM. ACREDITE.', '星が導く信じて', [55.98, 56.68, 57.24, 58.20, 59.48, 59.88, 60.56]),
  _jp(61.90, 66.80, 'ANATA NO YUME WA HONMONO DA YO', 'SEU SONHO É REAL', 'あなたの夢は本物だよ', [62.10, 62.82, 63.52, 65.20, 65.60, 66.04, 66.26, 66.40, 66.52, 66.60]),
];
/* marcos de energia/estrutura (RMS): verso 13–38 · calmo 38–49 · DROP 49 · refrão 49–66.7 · verso 2 66.7–80 */
const SONG = { intro: [0, 13.1], verse1: [13.1, 42.6], quiet: [38, 49], pre: [42.6, 49], chorus: [49, 66.7], verse2: [66.7, 80], dur: 80.0 };
