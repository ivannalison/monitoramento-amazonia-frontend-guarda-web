# GUARDA - Monitoramento da Amazônia (site)

Mapa interativo da **Amazônia Legal** com queimadas, chuva, qualidade do ar, risco de cheia e desmatamento, quase em tempo real. O mapa abre limpo e a pessoa marca, na caixa branca, o que quer ver. Tela única, tema claro, somente leitura, sem cadastro.

Inspirado no SELVA (Sistema Eletrônico de Vigilância Ambiental), com identidade e código próprios. Apoia o acompanhamento ambiental e a resiliência das comunidades (ODS 11 - Cidades e Comunidades Sustentáveis).

Angular 20 (componentes standalone e signals) + MapLibre GL 6.

- **Site publicado:** https://guarda-web-rtcwqczkea-rj.a.run.app
- **API publicada:** https://guarda-api-rtcwqczkea-rj.a.run.app (documentação interativa em `/api/docs`)

Desenvolvido como projeto final do programa Reconecta, da Recode.

## Onde está cada parte do projeto

| Parte | Pasta no computador | Repositório no GitHub |
|---|---|---|
| **Site (front end)** - este repositório | `C:\Users\nalis\guarda-web` | https://github.com/ivannalison/monitoramento-amazonia-frontend-guarda-web |
| **API (back end)** | `C:\Users\nalis\monitoramento-amazonia-api` | https://github.com/ivannalison/monitoramento-amazonia-api |

O site só faz leituras (GET) na API. A API coleta os dados das fontes públicas (NASA FIRMS, INPE DETER, Open-Meteo e IBGE), guarda no MongoDB Atlas e serve JSON e GeoJSON. Os dois repositórios são independentes: cada um tem o seu próprio container e roda como um serviço separado no Cloud Run, no Google Cloud.

## Como a interface funciona

Veja o passo a passo, opção por opção, com imagens: **[docs/interface.md](docs/interface.md)**.

## Site publicado (Google Cloud)

O site está em https://guarda-web-rtcwqczkea-rj.a.run.app, em um serviço do **Cloud Run** (`guarda-web`, região `southamerica-east1`, São Paulo), separado da API. A imagem é montada em duas etapas: o Angular é compilado e os arquivos prontos são servidos por um Nginx na porta 8080 (as rotas do Angular, o worker do MapLibre e o cache ficam em `nginx.conf`).

O endereço da API é gravado no site **na montagem da imagem** (`--build-arg API_URL=...`). Por isso o site só é montado depois que a API tem endereço público, e a API precisa aceitar o endereço do site em `CORS_ORIGIN`. O arquivo `src/environments/environment.prod.ts` do repositório continua com um valor de exemplo: quem troca é a montagem da imagem, sem alterar o arquivo.

O serviço escala de 0 a 2 instâncias (dorme quando ninguém usa) e não guarda segredos: o site só lê a API pública. A coleta dos dados é feita pela API, com o Cloud Scheduler, e não pelo site.

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

A URL da API fica em `src/environments/environment.ts` (local) e `src/environments/environment.prod.ts` (produção; o valor do repositório é de exemplo e é trocado na montagem da imagem, veja a seção do container).

## Como rodar em container (Docker)

Pré-requisito: Docker Desktop. A API precisa estar acessível no endereço que você passar em `API_URL`.

```powershell
docker build --build-arg API_URL=http://localhost:3000 -t guarda-web:local .
docker run -d --name guarda-web-teste -p 8080:8080 guarda-web:local   # http://localhost:8080
docker rm -f guarda-web-teste                                          # para e remove
```

O `Dockerfile` usa duas etapas (Node 22 compila o Angular, Nginx 1.27 serve os arquivos) e o `.dockerignore` deixa de fora `node_modules`, `docs` e arquivos de ambiente.

## Publicar uma nova versão no Cloud Run

Com o `gcloud` logado no projeto do GUARDA e a API já publicada:

```powershell
$regiao = 'southamerica-east1'
$api = gcloud run services describe guarda-api --region=$regiao --format='value(status.url)'
$img = "$regiao-docker.pkg.dev/guarda-amazonia/guarda/web:$(Get-Date -Format 'yyyyMMdd-HHmm')"
docker build --platform linux/amd64 --build-arg API_URL=$api -t $img .
docker push $img
gcloud run deploy guarda-web --image=$img --region=$regiao
```

As demais configurações do serviço (conta de serviço, limite de instâncias) são mantidas.

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
Dockerfile         container do site (Angular compilado + Nginx)
nginx.conf         configuração do Nginx (rotas, worker do MapLibre, cache)
```

## Pontos importantes

- O site só faz GET e nunca usa a chave da API.
- O MapLibre 6 precisa do arquivo `public/maplibre-gl-worker.mjs`. Sem ele o mapa não desenha contornos, focos nem manchas ("Worker failed to load" no console).
- Chuva, qualidade do ar e risco de cheia são estimativas de modelo (Open-Meteo), não medições de estações físicas nem alertas oficiais.
- O mapa base é do OpenStreetMap, que não prevê tráfego pesado: para produção, trocar por um provedor próprio ou contratado.

## Próximos passos

Domínio próprio, trava automática de cobrança na nuvem e troca do mapa base por um provedor próprio ou contratado.

## Créditos e termos dos dados

NASA FIRMS (focos de calor), INPE DETER (desmatamento), Open-Meteo (chuva, ar e vazão dos rios; uso gratuito apenas não comercial), IBGE (municípios) e © colaboradores do OpenStreetMap (mapa base).