# GUARDA - Monitoramento da Amazônia (site)

Mapa interativo da **Amazônia Legal** com queimadas, chuva, qualidade do ar, risco de cheia e desmatamento, quase em tempo real. O mapa abre limpo e a pessoa marca, na caixa branca, o que quer ver. Tela única, tema claro, somente leitura, sem cadastro.

Inspirado no SELVA (Sistema Eletrônico de Vigilância Ambiental), com identidade e código próprios. Apoia o acompanhamento ambiental e a resiliência das comunidades (ODS 11 - Cidades e Comunidades Sustentáveis).

Angular 20 (componentes standalone e signals) + MapLibre GL 6.

## Onde está cada parte do projeto

| Parte | Pasta no computador | Repositório no GitHub |
|---|---|---|
| **Site (front end)** - este repositório | `C:\Users\nalis\guarda-web` | https://github.com/ivannalison/monitoramento-amazonia-frontend-guarda-web |
| **API (back end)** | `C:\Users\nalis\monitoramento-amazonia-api` | https://github.com/ivannalison/monitoramento-amazonia-api |

O site só faz leituras (GET) na API. A API coleta os dados das fontes públicas (NASA FIRMS, INPE DETER, Open-Meteo e IBGE), guarda no MongoDB Atlas e serve JSON e GeoJSON. Os dois repositórios são independentes: cada um terá o seu próprio container na publicação.

## Como a interface funciona

Veja o passo a passo, opção por opção, com imagens: **[docs/interface.md](docs/interface.md)**.

## Como rodar no seu computador (Windows PowerShell)

Pré-requisitos: Node.js 22 e npm 10. A API precisa estar rodando em `http://localhost:3000` (veja o repositório da API).

```powershell
npm ci
npm start                          # http://localhost:4200
npm run build                      # build de produção em dist/
npm test                           # testes unitários (Karma + Chrome sem janela)
npm run testar:api                 # teste de contrato contra a API (GUARDA_API=http://localhost:3000)
node scripts/gerar-contorno.mjs    # refaz o contorno da Amazônia Legal (lê os municípios da API; use API_DADOS se as pastas não forem vizinhas)
node scripts/copiar-worker.mjs     # copia o worker do MapLibre para public/ (rode de novo se atualizar o maplibre-gl)
```

A URL da API fica em `src/environments/environment.ts` (local) e `src/environments/environment.prod.ts` (produção; hoje é um valor de exemplo).

## Estrutura

```text
public/            guarda.svg, geo/amazonia-legal.geojson, maplibre-gl-worker.mjs
scripts/           testar-api.mjs, gerar-contorno.mjs, copiar-worker.mjs
src/environments/  endereço da API (local e produção)
src/app/
  core/            config (rotas da API e opções do mapa), models, services, interceptors, util
  shared/          toast, modal e pipes
  features/mapa/   página, componentes (mapa, caixa de opções, busca, legenda, linha do tempo, marca) e utilitários
  features/sobre/  conteúdo do botão "Sobre"
docs/              documentação da interface e imagens
```

## Pontos importantes

- O site só faz GET e nunca usa a chave da API.
- O MapLibre 6 precisa do arquivo `public/maplibre-gl-worker.mjs`. Sem ele o mapa não desenha contornos, focos nem manchas ("Worker failed to load" no console).
- Chuva, qualidade do ar e risco de cheia são estimativas de modelo (Open-Meteo), não medições de estações físicas nem alertas oficiais.
- O mapa base é do OpenStreetMap, que não prevê tráfego pesado: para produção, trocar por um provedor próprio ou contratado.

## Próximos passos

Containers (um para o site e outro para a API), publicação no Google Cloud, domínio e documentação final.

## Créditos e termos dos dados

NASA FIRMS (focos de calor), INPE DETER (desmatamento), Open-Meteo (chuva, ar e vazão dos rios; uso gratuito apenas não comercial), IBGE (municípios) e © colaboradores do OpenStreetMap (mapa base).