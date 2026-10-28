// scripts/testar-api.mjs
// Teste de contrato: confere se CADA rota usada pelo front (src/app/core/config/rotas-api.ts)
// existe na API e devolve o formato que os servicos esperam.
// Uso: GUARDA_API=http://localhost:3000 node scripts/testar-api.mjs
import { readFileSync } from 'node:fs';

const BASE = (process.env.GUARDA_API || 'http://localhost:3000').replace(/\/$/, '');
const ORIGEM = 'http://localhost:4200';
let total = 0;
let falhas = 0;

function checar(nome, ok, detalhe = '') {
  total++;
  if (ok) console.log('  OK      ' + nome);
  else {
    falhas++;
    console.log('  FALHOU  ' + nome + (detalhe ? ' -> ' + detalhe : ''));
  }
}

async function pegar(caminho, cabecalhos = {}) {
  try {
    const r = await fetch(BASE + caminho, { headers: { Origin: ORIGEM, ...cabecalhos } });
    let json = null;
    try { json = await r.json(); } catch { /* sem corpo JSON */ }
    return { status: r.status, json, headers: r.headers };
  } catch (e) {
    return { status: 0, json: null, headers: new Headers(), erro: String(e && e.message ? e.message : e) };
  }
}

const ehFC = (j) => !!j && j.type === 'FeatureCollection' && Array.isArray(j.features);
const todos = (lista, fn) => Array.isArray(lista) && lista.every(fn);

const contrato = {
  status: { q: '', ok: (j) => j.status === 'online' },
  fontes: { q: '', ok: (j) => Array.isArray(j.fontes) && j.fontes.length === 6 && todos(j.fontes, (f) => f.id && f.nome && f.situacao) },
  estados: { q: '', ok: (j) => Array.isArray(j.estados) && j.estados.length === 9 },
  resumo: { q: '', ok: (j) => typeof j.focos_de_calor === 'number' && !!j.camadas && !!j.camadas.queimadas },
  camadasResumo: { q: '', ok: (j) => !!j.queimadas && typeof j.queimadas.total === 'number' && !!j.qualidade_ar && !!j.chuva && !!j.cheias && typeof j.cheias.em_alerta === 'number' },
  relatorio: { q: '?estado=AM', ok: (j) => !!j.totais && Array.isArray(j.por_estado) && !!j.camadas },
  queimadasGeojson: { q: '?horas=168&limite=5&bbox=-75,-18,-40,6', ok: (j) => ehFC(j) && j.features.length <= 5 && typeof j.truncado === 'boolean' && typeof j.limite === 'number' && todos(j.features, (f) => typeof f.properties.satelite === 'string' && typeof f.properties.data === 'string') },
  queimadasEstatisticas: { q: '', ok: (j) => Array.isArray(j.por_estado) && Array.isArray(j.por_dia) },
  desmatamentoGeojson: { q: '?limite=5', ok: (j) => ehFC(j) && typeof j.truncado === 'boolean' && todos(j.features, (f) => typeof f.properties.area_ha === 'number') },
  desmatamentoEstatisticas: { q: '', ok: (j) => Array.isArray(j.por_estado) && Array.isArray(j.por_dia) && typeof j.area_total_ha === 'number' },
  qualidadeArGeojson: { q: '', ok: (j) => ehFC(j) && todos(j.features, (f) => typeof f.properties.pm2_5 === 'number') },
  chuvasGeojson: { q: '', ok: (j) => ehFC(j) && todos(j.features, (f) => typeof f.properties.precipitacao_mm === 'number') },
  cheiasGeojson: { q: '', ok: (j) => ehFC(j) && todos(j.features, (f) => typeof f.properties.nivel === 'string') },
  alertas: { q: '', ok: (j) => Array.isArray(j.alertas) && typeof j.total === 'number' },
  clima: { q: '', ok: (j) => Array.isArray(j.registros) },
  municipios: { q: '?busca=labrea', ok: (j) => Array.isArray(j.municipios) && j.municipios.length > 0 && todos(j.municipios, (m) => /^\d{7}$/.test(m.codigo) && Array.isArray(m.centro) && m.centro.length === 2 && Array.isArray(m.bbox) && m.bbox.length === 4) },
  municipiosGeojson: { q: '?estado=AC', ok: (j) => ehFC(j) && j.features.length === 22 && todos(j.features, (f) => !!f.properties.codigo) },
  contornosEstados: { q: '', ok: (j) => ehFC(j) && j.features.length > 0 && todos(j.features, (f) => typeof f.properties.sigla === 'string') },
};

const texto = readFileSync(new URL('../src/app/core/config/rotas-api.ts', import.meta.url), 'utf8');
const rotas = {};
for (const m of texto.matchAll(/^\s*(\w+):\s*'(\/api\/[^']+)'/gm)) rotas[m[1]] = m[2];

console.log('API testada: ' + BASE);
console.log('\nAlinhamento entre rotas-api.ts e o contrato');
checar('rotas-api.ts lido (' + Object.keys(rotas).length + ' rotas)', Object.keys(rotas).length > 0);
for (const chave of Object.keys(rotas)) checar('a rota "' + chave + '" tem teste de contrato', chave in contrato);
for (const chave of Object.keys(contrato)) checar('o contrato "' + chave + '" existe em rotas-api.ts', chave in rotas);

console.log('\nRespostas da API (formato que os servicos do front esperam)');
let primeira = null;
for (const [chave, c] of Object.entries(contrato)) {
  if (!(chave in rotas)) continue;
  const r = await pegar(rotas[chave] + c.q);
  if (!primeira && r.status === 200) primeira = r;
  checar(rotas[chave] + c.q + '  (http ' + r.status + ')', r.status === 200 && r.json !== null && !!c.ok(r.json), r.status === 404 ? 'rota nao existe na API (falta a Fase 1.5?)' : (r.erro || ''));
}

console.log('\nComportamentos que o front usa');
checar('CORS libera http://localhost:4200', !!primeira && primeira.headers.get('access-control-allow-origin') === ORIGEM);
const ruim = await pegar('/api/queimadas/geojson?bbox=abc');
checar('bbox invalido devolve 400 com mensagem', ruim.status === 400 && !!ruim.json && typeof ruim.json.erro === 'string');
const semAcento = await pegar('/api/queimadas?municipio=labrea&limite=1');
checar('filtro de municipio sem acento responde 200', semAcento.status === 200 && Array.isArray(semAcento.json && semAcento.json.focos));
const naoExiste = await pegar('/api/municipios/9999999');
checar('municipio inexistente devolve 404', naoExiste.status === 404);
const m = await pegar('/api/municipios?busca=labrea&limite=1');
const cod = m.json && m.json.municipios && m.json.municipios[0] && m.json.municipios[0].codigo;
if (cod) {
  const porCodigo = await pegar('/api/queimadas?municipio_codigo=' + cod + '&limite=1');
  checar('filtro por codigo IBGE (?municipio_codigo=) responde 200', porCodigo.status === 200);
  const cont = await pegar('/api/municipios/geojson?codigo=' + cod);
  checar('contorno de um municipio (?codigo=) traz 1 feicao', cont.status === 200 && ehFC(cont.json) && cont.json.features.length === 1);
}

console.log('\nResultado: ' + (total - falhas) + ' de ' + total + ' verificacoes OK' + (falhas ? ' | ' + falhas + ' FALHARAM' : ''));
process.exit(falhas ? 1 : 0);