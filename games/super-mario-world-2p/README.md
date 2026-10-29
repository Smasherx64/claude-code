# Yoshi's Island 1 - 2 Jogadores

Recriação fã-feita (HTML5 canvas, arquivo único, sem dependências) da primeira fase de *Super Mario World*, jogável por 2 pessoas no mesmo teclado. Todos os gráficos e sons são gerados por código — nenhum asset da Nintendo é usado.

## Como jogar

Abra `index.html` em qualquer navegador moderno (ou `python3 -m http.server` nesta pasta). Pressione `1` ou `2` para escolher o número de jogadores e `Enter` para começar.

| | Mario (P1) | Luigi (P2) |
|---|---|---|
| Andar | `A` / `D` | `←` / `→` |
| Pular | `W` ou `Espaço` | `↑` ou `/` |
| Correr (segurar) | `Shift` esq. ou `F` | `Shift` dir. ou `.` |

Gamepads também funcionam (controle 1 → Mario, controle 2 → Luigi; A = pular, X/B/gatilhos = correr).

## O que tem na fase

Baseado na descrição da fase no [Super Mario Wiki](https://www.mariowiki.com/Yoshi%27s_Island_1):

- Koopa sem casco, **Rex** (2 pisões), **Banzai Bills** (4), **Piranha Plants saltadoras** nos canos e o **Chargin' Chuck** (3 pisões) guardando o final
- **5 Dragon Coins**, moedas, bloco `?` com Super Cogumelo, blocos giratórios (só Mario/Luigi grande quebra), 2 blocos de mensagem
- Cano azul, plataformas, colinas em degraus e o **Portal Gigante** (a barra móvel dá bônus)
- Checkpoint no meio da fase, tempo de 400, vidas individuais

## Regras do co-op

- A câmera segue os dois; ninguém pode sair da tela, então o jogador da frente espera o de trás.
- Quem morre volta numa "bolha" no ponto do parceiro (ou no checkpoint, se os dois morrerem).
- Jogadores podem pular um em cima do outro sem se machucar.

## Diferenças em relação ao jogo original

- Sem o ambiente subterrâneo e sem inclinações reais (as colinas são em degraus); o Cape/Yoshi/3-Up Moon não existem.
- Os inimigos e blocos foram posicionados seguindo a ordem da fase original, mas não é um mapa idêntico.
