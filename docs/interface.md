# Interface do GUARDA

O GUARDA é uma tela única: um mapa em tela cheia, uma **caixa branca** no canto superior esquerdo (busca e opções) e, no canto superior direito, o nome do projeto com o botão **Sobre**. O mapa abre **limpo**, sem nenhuma opção marcada. Cada caixinha marcada liga uma camada e mostra a legenda dela; ao desmarcar, a camada e a legenda somem. **Todas as opções podem ficar marcadas ao mesmo tempo.**

O contorno preto em volta da Amazônia Legal aparece o tempo todo. Os dados vêm da API do projeto ([monitoramento-amazonia-api](https://github.com/ivannalison/monitoramento-amazonia-api), no computador em `C:\Users\nalis\monitoramento-amazonia-api`).

## 1. Mapa ao abrir (nenhuma opção marcada)

Só o mapa base, o contorno da Amazônia Legal e a caixa branca com o campo de busca e as 7 opções, todas desmarcadas. Não aparece nenhuma legenda.

![Mapa ao abrir, sem opcoes marcadas](imagens/01%20Primeira%20aba%20que%20aparece.png)

## 2. Chuvas

Uma superfície colorida sobre o mapa, calculada a partir dos pontos de uma grade de cerca de 165 km (mostra a tendência, não cada nuvem). Aparecem:

- a **barra de tempo**, de 24 horas antes a 24 horas depois da hora atual, com botão de **play** que avança uma hora por vez;
- uma etiqueta com **Passado / Agora / Previsão** e a data e hora (horário de Manaus);
- a **legenda** com 5 classes: Garoa (0,1 a 1 mm/h), Chuva fraca (1 a 2,5), Chuva moderada (2,5 a 7,5), Chuva forte (7,5 a 30) e Tempestade (mais de 30 mm/h).

![Chuvas, com barra de tempo e legenda](imagens/02%20Chuvas.png)

## 3. Qualidade do ar (estações virtuais)

Bolas coloridas pela concentração de MP2.5 (referência CONAMA/Brasil): Boa (0 a 25), Moderada (25 a 50), Ruim (50 a 75), Muito Ruim (75 a 125) e Péssimo (acima de 125 µg/m³). A legenda "Níveis de Poluição do Ar" mostra as faixas. São estações **virtuais**: valores de modelo de satélite, não de estações físicas. Ao aproximar o mapa, o valor aparece escrito dentro de cada bola.

![Qualidade do ar (estacoes virtuais)](imagens/03%20Qualidade%20do%20Ar%20%20Estacoes%20Virtuais.png)

## 4. Queimadas (MODIS, NOAA-20 e Suomi, últimas 24 h)

Cada satélite é uma caixinha, com a sua cor: **MODIS** vermelho-rosado, **NOAA-20** laranja e **Suomi NPP** amarelo. Podem ser ligados sozinhos ou juntos. Com o mapa afastado, aparecem **manchas de calor** que mostram onde há mais focos; ao aproximar, as manchas dão lugar a **uma bola por foco**. A legenda mostra quantos focos há na área visível do mapa.

**MODIS**

![Queimadas MODIS](imagens/04%20Queimadas%20%28MODIS%2024h%29.png)

**NOAA-20**

![Queimadas NOAA-20](imagens/05%20Queimadas%20%28NOAA%2020%2024h%29.png)

**Suomi NPP**

![Queimadas Suomi NPP](imagens/06%20Queimadas%20%28Suomi%2024h%29.png)

## 5. Risco de cheia

Pontos nos rios com a vazão acima do normal, comparando a vazão de hoje com a média dos últimos 30 dias: **Atenção** (1,5 a 2 vezes a média), **Alto** (2 a 3 vezes) e **Extremo** (3 vezes ou mais). É uma estimativa simples, **não é alerta oficial**. A API só devolve rios acima do normal; se não houver nenhum, aparece o aviso "Nenhum rio acima do normal no momento".

![Risco de cheia](imagens/07%20Risco%20de%20Cheia.png)

## 6. Desmatamento (DETER, 90 dias)

Alertas de desmatamento do INPE DETER dos últimos 90 dias. Com o mapa afastado, uma **mancha marrom** mostra onde se concentram; ao aproximar, cada alerta vira uma bola marrom de tamanho proporcional à área: pequeno (até 20 ha), médio (20 a 100 ha) e grande (mais de 100 ha). A legenda mostra quantos alertas há na área visível e, no fim, a idade do dado (aparece "defasado" quando a última coleta está antiga). Quando há mais pontos do que cabem na tela, um aviso no topo explica que são mostrados os mais relevantes e pede para aproximar o mapa.

![Desmatamento (DETER, 90 dias)](imagens/08%20Desmatamento%20%28DETER%2090%20dias%29.png)

## 7. Busca por cidade ou estado

O campo de busca, no topo da caixa branca, aceita o nome de uma cidade (com ou sem acento, por exemplo "Lábrea" ou "labrea") ou de um estado. Ao escolher um resultado, o mapa vai até o lugar e desenha o contorno em laranja; o "x" ao lado do nome remove a busca. As camadas marcadas passam a mostrar os dados da área enquadrada (no exemplo, o desmatamento em Lábrea). Também dá para achar o município **só navegando**: a partir do zoom 6 aparecem os limites municipais e, ao passar o mouse, o nome do município.

![Busca por cidade (Labrea) com desmatamento marcado](imagens/09%20Campo%20de%20busca%20labrea%20Am.png)

## 8. Celular e telas pequenas

Abaixo de 720 px de largura ou 560 px de altura, a caixa branca vira o botão **Opções**, que abre e fecha a caixa (o botão passa a dizer **Fechar**). A marca fica menor e as legendas ficam embaixo, com rolagem. Ao escolher uma cidade ou um estado, a caixa se fecha sozinha para mostrar o mapa. Em telas grandes a caixa fica sempre aberta.

**Caixa fechada**

![Celular, com a caixa fechada](imagens/01%20Interface%20no%20celular.png)

**Caixa de opções aberta**

![Celular, com a caixa de opcoes aberta](imagens/02%20Interface%20no%20celular%20Opcoes.png)

**Depois de buscar uma cidade (Lábrea)**

![Celular, depois de buscar uma cidade](imagens/03%20Interface%20no%20celular%20%20campo%20de%20busca%20%20labrea%20Am.png)

## Atualização dos dados

A cada 5 minutos o site confere se a API recebeu coletas novas e recarrega só a camada que mudou. As fontes mudam a cada 30 minutos (queimadas), 3 horas (chuva, ar e cheia) ou 6 horas (desmatamento).