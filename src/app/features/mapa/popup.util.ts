import { CamadaId } from '../../core/config/camadas.config';
import { DataManausPipe } from '../../shared/pipes/data-manaus.pipe';

export interface Selecao {
  camada: CamadaId;
  titulo: string;
  propriedades: Record<string, unknown>;
}
export interface Linha { rotulo: string; valor: string; }

export const TITULOS: Record<CamadaId, string> = {
  queimadas: 'Foco de calor',
  ar: 'Qualidade do ar',
  chuva: 'Chuva prevista',
  cheias: 'Risco de cheia',
  desmatamento: 'Alerta de desmatamento',
};

const SATELITES: Record<string, string> = { modis: 'MODIS', noaa20: 'NOAA-20 (VIIRS)', suomi: 'Suomi NPP (VIIRS)' };
const pipeData = new DataManausPipe();

function num(v: unknown, casas = 1): string {
  return typeof v === 'number' && Number.isFinite(v) ? v.toLocaleString('pt-BR', { maximumFractionDigits: casas }) : '-';
}
function txt(v: unknown): string {
  return typeof v === 'string' && v ? v : '-';
}
function data(v: unknown): string {
  return typeof v === 'string' ? pipeData.transform(v, 'longo') : '-';
}

// Linhas "rotulo / valor" mostradas no cartao ao clicar em um ponto
export function linhasDe(sel: Selecao): Linha[] {
  const p = sel.propriedades;
  switch (sel.camada) {
    case 'queimadas':
      return [
        { rotulo: 'Data e hora', valor: data(p['data']) },
        { rotulo: 'Satélite', valor: SATELITES[txt(p['satelite'])] ?? txt(p['satelite']) },
        { rotulo: 'Intensidade (FRP)', valor: num(p['intensidade']) + ' MW' },
        { rotulo: 'Confiança', valor: txt(p['confianca']) },
        { rotulo: 'Município', valor: txt(p['municipio']) },
        { rotulo: 'Estado', valor: txt(p['estado']) },
        { rotulo: 'Fonte', valor: txt(p['fonte']) },
      ];
    case 'ar':
      return [
        { rotulo: 'Data e hora', valor: data(p['data']) },
        { rotulo: 'PM2.5', valor: num(p['pm2_5']) + ' \u00b5g/m\u00b3' },
        { rotulo: 'PM10', valor: num(p['pm10']) + ' \u00b5g/m\u00b3' },
        { rotulo: 'Índice de qualidade (AQI)', valor: num(p['indice'], 0) },
        { rotulo: 'Profundidade óptica do aerossol', valor: num(p['aerossol'], 2) },
        { rotulo: 'Estado', valor: txt(p['estado']) },
        { rotulo: 'Fonte', valor: txt(p['fonte']) },
      ];
    case 'chuva':
      return [
        { rotulo: 'Hora da previsão', valor: data(p['hora']) },
        { rotulo: 'Precipitação', valor: num(p['precipitacao_mm']) + ' mm' },
        { rotulo: 'Estado', valor: txt(p['estado']) },
        { rotulo: 'Fonte', valor: txt(p['fonte']) },
      ];
    case 'cheias':
      return [
        { rotulo: 'Data', valor: data(p['data']) },
        { rotulo: 'Nível', valor: txt(p['nivel']) },
        { rotulo: 'Razão (vazão / média 30 dias)', valor: num(p['razao'], 2) },
        { rotulo: 'Vazão', valor: num(p['vazao']) + ' m\u00b3/s' },
        { rotulo: 'Vazão média', valor: num(p['vazao_media']) + ' m\u00b3/s' },
        { rotulo: 'Estado', valor: txt(p['estado']) },
        { rotulo: 'Fonte', valor: txt(p['fonte']) },
      ];
    case 'desmatamento':
      return [
        { rotulo: 'Data', valor: data(p['data']) },
        { rotulo: 'Área', valor: num(p['area_ha']) + ' ha' },
        { rotulo: 'Classe', valor: txt(p['classe']) },
        { rotulo: 'Município', valor: txt(p['municipio']) },
        { rotulo: 'Estado', valor: txt(p['estado']) },
        { rotulo: 'Fonte', valor: txt(p['fonte']) },
      ];
  }
}