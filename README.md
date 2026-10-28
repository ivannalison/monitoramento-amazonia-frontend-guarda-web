# GUARDA (guarda-web)

Site de monitoramento da Amazônia Legal: queimadas, fumaça, chuva, risco de cheia e desmatamento em um mapa interativo.
Angular 20 (componentes standalone, signals) + MapLibre GL. Somente leitura: consome a API `monitoramento-amazonia-api`.

## Como rodar

```powershell
npm install
npm start                 # http://localhost:4200  (a API precisa estar em http://localhost:3000)
npm run build             # build de produção em dist/
npm test                  # testes unitários (Karma + Chrome headless)
npm run testar:api        # teste de contrato contra a API (GUARDA_API=http://localhost:3000)
```

A URL da API fica em `src/environments/environment.ts` (local) e `environment.prod.ts` (produção).

## Estrutura

```text
src/app/
  core/        config (rotas da API, camadas), models, services, interceptors (erro e cache), util
  shared/      componentes reutilizáveis (logo, carregando, aviso, toast, modal, gráfico, cartão) e pipes
  layout/      cabeçalho
  features/
    mapa/      página + components (mapa-canvas, painel-camadas, legenda, filtros, busca de município,
               linha do tempo, popup, relatório do estado, barra de status)
    painel/    cards, gráficos e tabelas
    alertas/   lista de leitura
    sobre/     conteúdo usado no modal e na página /sobre
scripts/testar-api.mjs   teste de contrato (front x API)
docs/                    escopo e relatórios
```

## Decisões

- O site nunca usa a chave de API (só GET).
- Atualização: confere `/api/fontes` a cada 5 minutos e recarrega só a camada cuja coleta mudou.
- O mapa pede só a área visível (`bbox`) e avisa quando a API devolve `truncado: true`.
- O logo em `src/app/shared/components/logo.component.ts` e `public/guarda.svg` é provisório: troque pelo definitivo.