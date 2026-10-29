# Ilha Verde 1 - plataforma 2D cooperativa (2 jogadores)

Fase de plataforma 2D em HTML5 canvas (arquivo único, sem dependências) para 2 pessoas no mesmo teclado, com um conjunto de golpes inspirado em jogos 3D de plataforma, adaptado para 2D. Personagens, fase, gráficos e sons são originais e gerados por código.

## Como jogar

Abra `index.html` em um navegador moderno (ou rode `python3 -m http.server` nesta pasta). `1` ou `2` escolhe o número de jogadores, `Enter` começa.

| | TICO (P1) | NINA (P2) |
|---|---|---|
| Andar | `A` / `D` | `←` / `→` |
| Pular | `W` ou `Espaço` | `↑` ou `/` |
| Agachar | `S` | `↓` |
| Soco (chão) / Mergulho (ar) | `F` ou `Shift` esq. | `.` ou `Shift` dir. |

Gamepads também funcionam (controle 1 → TICO, controle 2 → NINA; A pula, X/B/gatilhos socam/mergulham, direcional para baixo agacha).

## Golpes (como cada um funciona no código)

Todos ficam em `updatePlayer` como estados (`p.st`) e variáveis de controle:

| Golpe | Como fazer | Detalhe da implementação |
|---|---|---|
| Pulo triplo | 3 pulos seguidos andando | Ao pousar de um pulo normal abre-se uma janela de 10 frames (`landT`). Pular dentro dela, com `|vx| > 0.8`, sobe `chain` de 1→2→3. Velocidades de pulo: 5.1 / 5.9 / 6.9 (+ bônus da velocidade). O 3º tem giro. |
| Pulo longo | agachar + pular correndo | Impulso horizontal de 3.7 com pulo baixo e gravidade menor (0.28). |
| Mortal para trás | agachar + pular parado | Pulo alto (6.8) com leve impulso para trás. |
| Mortal lateral | pular ao virar bruscamente | Detecta `vx` contrário à direção apertada com `|vx| > 1.2`. |
| Chute de parede | no ar, encostado na parede, apertar pular | Encostar na parede no ar guarda `wallT = 6` frames; pular nessa janela lança para longe da parede (vx 2.2, vy -5.6). Também há escorregamento lento na parede. |
| Pancada no chão | `↓` no ar | 14 frames girando suspenso, depois queda rápida. No impacto: quebra blocos giratórios abaixo e derruba inimigos próximos. |
| Mergulho | soco no ar | Impulso horizontal 3.3 sem controle; ao pousar vira *slide* de ~34 frames. |
| Soco | soco no chão | Caixa de acerto de 14x10 px à frente; quebra blocos giratórios e fere inimigos. |
| Pulo "buffer" e "coyote" | automático | Aceita o botão apertado até 6 frames antes de pousar e até 5 frames depois de sair da borda. |

Vida em **8 fatias** (como um medidor circular): contato custa 1 a 3 fatias conforme o inimigo, moedas curam 1 e o cogumelo cura tudo.

## Na fase

- Dinos (2 pulos ou 1 pancada), bala gigante (4), plantas saltadoras nos canos e um brutamontes final (3 golpes)
- 5 moedas-dragão, moedas, bloco `?` com cogumelo, blocos giratórios, 2 blocos de dica
- Cano azul, plataformas, colinas em degraus, checkpoint e o portal final (a barra móvel dá bônus)

## Cooperativo

- A câmera segue os dois; ninguém sai da tela.
- Quem morre volta numa "bolha" ao lado do parceiro (ou no checkpoint, se os dois morrerem). 5 vidas por jogador.
- Pular um em cima do outro não machuca.

## Limitações

Sem área subterrânea nem inclinações reais (colinas em degraus).
