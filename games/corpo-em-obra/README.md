# Corpo em Obra

Simulador de treino e evolução corporal em pixel art (HTML5 canvas, arquivo único, sem dependências). Você começa com um de quatro corpos, treina com um minigame de execução, escolhe o que comer e quanto dormir, e acompanha o corpo mudar ao longo dos dias.

Abra `index.html` no navegador. Teclado ou mouse/toque.

## Seu personagem com altura e peso reais

Na seleção, **CRIAR O MEU PERSONAGEM** pede sexo, altura (140-210 cm), peso (35-200 kg) e idade (16-70), e deixa escolher pele, cabelo, cor do cabelo e roupa. O jogo estima a gordura corporal pela fórmula de Deurenberg (1,2 x IMC + 0,23 x idade - 10,8 x [1 se homem] - 5,4), mostra o IMC e o gasto basal estimado e avisa se os valores forem extremos. É uma estimativa, não um diagnóstico.

## Os quatro pontos de partida

| | Peso | Gordura | Músculo | Gasto basal |
|---|---|---|---|---|
| Marta (mulher, mais gordura) | 92 kg | 42% | 21,3 kg | 1523 kcal |
| Bia (mulher, muito magra) | 46 kg | 18% | 15,1 kg | 1185 kcal |
| Caio (homem, mais gordura) | 118 kg | 38% | 33,7 kg | 1950 kcal |
| Davi (homem, muito magro) | 56 kg | 12% | 22,7 kg | 1434 kcal |

## No celular

Funciona por toque, de preferência com o celular na **horizontal** (há um botão "Tela cheia"):

- toque nos botões; segurar `+` / `-` repete, para ajustar peso, altura e calorias rápido;
- no treino, **segure o dedo em qualquer ponto da tela** para subir a carga e solte para descer; o botão ENCERRAR termina a série;
- o botão VOLTAR substitui a tecla Esc, e "LIBERAR TUDO (DEMO)" na escolha de técnica substitui a tecla `U`;
- no drop set toque na tela para reduzir a carga, e no rest-pause toque para pular a pausa;
- os gestos do navegador (zoom por toque duplo, menu de pressão longa, puxar para atualizar) ficam desligados dentro do jogo.

## Visual e animação

Pixel art detalhado, com personagens originais desenhados por código (nenhum arquivo de imagem). Um rasterizador de sprites próprio pinta cada parte do corpo pixel a pixel, com luz vinda de cima à esquerda, três tons de sombreamento, contorno escuro por grupo de peças, roupa, tênis, munhequeiras, cabelo e rosto com expressão.

O corpo muda com a gordura corporal (barriga, rosto, coxas) e com a massa de cada grupo muscular (braços, pernas, peito e costas).

**Execução dos exercícios:** cada exercício tem uma pose biomecânica própria (cinemática inversa nos braços e pernas) com a barra ou halter descrevendo o trajeto certo. Durante a série:

- a respiração acelera e a cabeça balança conforme o cansaço;
- o corpo treme e se inclina (rosca, desenvolvimento e agachamento) quando a energia acaba;
- no supino o quadril levanta ao fim da série;
- o rosto passa de neutro para esforço (dentes cerrados) e para falha;
- o músculo trabalhado incha e avermelha, e o suor escorre da cabeça;
- um anel acompanha a posição ideal da barra, e cada repetição perfeita solta um brilho;
- na **negativa** de supino, agachamento e desenvolvimento, um parceiro entra para ajudar na subida.

**Desempenho:** lógica fixa em 60 Hz e desenho a cada quadro. Medido jogando uma série por 10 s: 60,0 fps, pior quadro 16,8 ms. Aperte `P` no jogo para ver FPS e tempo por quadro.

## Como se joga

Cada dia: **Treinar**, **Nutrição**, **Dormir**. Dormir encerra o dia e mostra a reconstrução muscular da noite.

**Treino (minigame):** segure `Espaço` (ou o mouse/toque) para subir a carga e solte para descer, seguindo o marcador GUIA. Quanto mais perto do guia, melhor a forma. Cada repetição gasta energia das fibras (painel do músculo: laranja = tipo II, força; azul = tipo I, resistência). Forma ruim com carga alta pode causar lesão (3 dias sem treinar aquele músculo).

Exercícios: supino, remada, desenvolvimento, rosca, tríceps, agachamento, abdominal.

**Técnicas** (liberadas por nível; `U` libera todas):

| Técnica | O que faz |
|---|---|
| Drop set | Na falha, a carga cai 25% e a série continua (até 2 drops). Aperte `D`. |
| Rest-pause | Na falha, pausa de 12 s e continua com a mesma carga (até 2 pausas). |
| Bi-set | Dois exercícios para o mesmo músculo, sem descanso. |
| Super-set | Dois exercícios de músculos opostos (peito/costas, bíceps/tríceps). |
| Negativa | Subida ajudada, descida lenta (3 s ou mais). Muito estímulo e muita dor no dia seguinte. |

## O que a simulação faz

Valores de referência usados (conferidos em literatura):

- **Gasto basal:** músculo ~13 kcal/kg/dia e gordura ~4,5 kcal/kg/dia (Elia 1992; Wang et al.). Ganhar músculo eleva o basal pouco, e perder gordura o reduz um pouco.
- **Reparo pós-treino:** a síntese de proteína muscular fica elevada ~65% em 24 h e ~34% em 48 h. O jogo usa isso para a capacidade de reparo e para um aumento temporário do gasto (por isso o "gasto total" dá saltos nos dias após treinar).
- **Proteína:** ganho máximo perto de 1,6 g/kg/dia (meta-análise de Morton et al., 2018).
- **Sono:** 7-9 h recupera 100%; 5 h, 55%.
- **Déficit/superávit:** 7700 kcal por kg de gordura; em déficit com pouca proteína ou pouca gordura, perde-se também músculo.
- **Adaptação neural:** a força sobe antes do tamanho do músculo, nas primeiras semanas.
- **Teto genético:** o ganho de cada músculo desacelera até ~+50% (homem) / ~+45% (mulher).

**Ritmo acelerado:** 1 dia de jogo muda o corpo como cerca de 3 dias reais (constante `RITMO`), para a evolução ficar visível.

## Teste automatizado

`window.__gym` expõe o estado e `step(n)` para simular frames. Na simulação de 30 dias:

- Sem treino com superávit (Davi): +4,6 kg, quase tudo gordura, músculo parado.
- Com treino e superávit: ganha músculo e menos gordura.
- Com treino e déficit (Marta, Caio): perde gordura e mantém o músculo.

## Ciência do treino (baseada nos materiais de referência)

Esta versão incorpora conceitos de sete materiais fornecidos pelo autor do projeto (nutrição esportiva de Asker Jeukendrup e colaboradores, a Enciclopédia do Treinamento e Nutrição, "Prescrição e Periodização do Treinamento de Força em Academias" de Prestes et al., "Ciência do Treinamento Desportivo" de Zakharov e Gomes, os slides "Métodos e Sistemas" do LTF/UFRJ, o guia de 117 exercícios de mobilidade e o guia de treino feminino de Charles Glass). Os textos não são reproduzidos: o jogo usa os conceitos e números com palavras próprias, e simplifica o que não cabe num jogo.

| Conceito | Onde aparece no jogo |
|---|---|
| Marcos de volume semanal por músculo (MV, MEV, MAV, MRV) e faixas por nível (iniciante até ~12, intermediário até ~24, avançado até ~30-35 séries/semana) | Tela **PLANILHA**; fator de ganho muscular: abaixo do MEV ganha menos, na zona ótima ganha tudo, acima do MRV ganha menos de novo |
| Volume é dose-resposta, mas tem teto; séries secundárias contam em parte | Contagem dos últimos 7 dias, com séries de exercícios compostos somando parcialmente nos músculos auxiliares |
| Fadiga acumulada, recuperação, deload (reduzir 40-60% do volume por ~1 semana) e supercompensação | Barra de fadiga; acima de 60% a força cai até 12%, acima de 80% sobe o risco de lesão e cai o ganho; botão de **semana deload**, com rebote de +5% de força e +10% de ganho por 7 dias |
| Aquecimento / feeder / top set e repetições na reserva (RIR) | Cargas 40% (aquecimento, não conta no volume, reduz o risco de lesão), 55-70% (trabalho) e 85% (top set); a tela de resultado mostra RIR estimado |
| Volume load (séries x repetições x carga) | Tela de resultado |
| Técnicas: drop set, rest-pause, bi-set, super-set, negativa | Já existiam; drop e rest-pause agora contam meia série extra cada |
| Carboidrato por kg, proteína 1,6-2,2 g/kg, gordura ~0,9 g/kg, superávit/déficit em % da manutenção | Tela de nutrição; carboidrato abaixo de ~3 g/kg reduz a energia da série |
| Disponibilidade de energia (kcal/kg de massa magra, limiar ~30) | Tela de nutrição; abaixo do limiar a recuperação cai |
| Memória muscular e destreino | Quem perdeu massa recupera mais rápido; parar de treinar por mais de 10 dias reduz massa e força lentamente |
| Mobilidade e aquecimento articular | Dicas e o efeito do aquecimento na redução de lesões |

Simplificações: a escala de tempo é acelerada (1 dia de jogo ~ 3 dias de efeito corporal), os números são calibrados para jogabilidade e não são prescrição. Os marcos de volume variam muito entre pessoas.

### Segunda rodada de leitura (Prestes, Enciclopédia, Belmiro/UFRJ e guia de mobilidade)

| Conceito | Onde aparece no jogo |
|---|---|
| Prescrição por nível (iniciante: 1-3 séries, 8-12RM, corpo todo 2-3x/sem; intermediário: dividir 4x/sem; avançado: 3-6 séries periodizadas 4-6x/sem) | Linha de prescrição na **PLANILHA**, que muda com o seu nível |
| Nas primeiras ~12 semanas o ganho de força é sobretudo neural e a hipertrofia demora; iniciante sente mais a dor tardia | Força neural sobe mais rápido no começo, ganho de massa começa mais lento e a dor das séries é maior até o nível 3 |
| Fases do ciclo: base, choque (volume e técnicas avançadas no máximo, 2-8 semanas) e deload | Botão **INICIAR CHOQUE** (14 dias, nível 4+): limites de volume +20%, mais ganho e fadiga sobe mais rápido; ao fim o jogo sugere o deload |
| Excesso de técnicas avançadas aumenta a fadiga sem render mais; use no choque | Drop set, rest-pause, bi/super-set e negativa fora do choque somam fadiga extra |
| Descanso entre séries (cerca de 1-3 min, mais para exercícios multiarticulares e cargas pesadas) | O descanso corre mais rápido que o real; começar a série antes da hora reduz a energia inicial do músculo |
| Cada articulação tem função de mobilidade ou de estabilidade; uma travada faz a vizinha compensar; testes de agachamento acima da cabeça, ombro e stiff na parede | Tela **MOBILID.**: tornozelo, quadril, tórax e ombro (mobilidade) e lombar (estabilidade), com classificação excelente/bom/ruim e um minigame de alongamento. Mobilidade baixa piora a forma e aumenta o risco de lesão nos exercícios que dependem da articulação |
| Drop set e pirâmide não superaram o treino tradicional em treinados (mesmo volume total, mesmo ganho) | O jogo trata as técnicas como ferramenta de tempo e variação, não como atalho |

Não implementado: periodização ondulatória, % de 1RM exato por série, os 12 testes de movimento do curso completo (o PDF traz só 3 de bônus) e as demais articulações (joelho, escápula).

### Terceira rodada (leitura completa dos sete materiais)

Ajustes feitos depois de ler os capítulos de nutrição, periodização e prescrição por inteiro:

| Ajuste | Fonte (conceito) |
|---|---|
| EPOC limitado a no máximo 100 kcal (antes era 10% do gasto da sessão) | Enciclopédia, EPOC: dura minutos e é irrelevante para emagrecer |
| Séries de músculos auxiliares contam meia série (supino: 1 peito + 0,5 tríceps + 0,5 ombro) | Enciclopédia, séries por grupo muscular |
| Gasto basal cai ao perder peso além do esperado (-10% do peso ≈ -6% do gasto) | Jeukendrup, controle do peso (adaptação metabólica) |
| Janela de síntese proteica mais curta no nível avançado | Enciclopédia, nutrient timing |
| 5 dicas novas (progressão de carga 2-10%, EPOC, adaptação metabólica, proteína por refeição, meia série) | Prestes et al.; Enciclopédia; Jeukendrup |

Ainda não implementado, mas anotado para próximas rodadas: periodização ondulatória e em bloco, escolha da zona de repetições por nível (iniciante 8-12RM, avançado 1-12RM), prescrição por RM com ajuste automático de 2-10%, variação individual de resposta (alta e baixa responsividade), meta SMART e sequência de treinos (hábito), pré-exaustão, circuito, pirâmide e repetições forçadas como métodos extras.

## Aviso

Jogo educativo e simplificado. Não substitui orientação médica, de nutricionista ou de profissional de Educação Física.
