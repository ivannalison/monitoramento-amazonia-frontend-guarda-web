export type CamadaId = 'queimadas' | 'ar' | 'chuva' | 'cheias' | 'desmatamento';

export interface ItemLegenda { cor: string; rotulo: string; }
export interface CamadaConfig {
  id: CamadaId;
  nome: string;
  cor: string;
  fonteId: string;
  descricao: string;
  legenda: ItemLegenda[];
}

export const CAMADAS: CamadaConfig[] = [
  {
    id: 'queimadas', nome: 'Queimadas', cor: '#f97316', fonteId: 'firms',
    descricao: 'Focos de calor detectados por satélite (NASA FIRMS)',
    legenda: [{ cor: '#fb923c', rotulo: 'Intensidade baixa' }, { cor: '#ef4444', rotulo: 'Intensidade média' }, { cor: '#7f1d1d', rotulo: 'Intensidade alta' }],
  },
  {
    id: 'ar', nome: 'Fumaça / qualidade do ar', cor: '#a78bfa', fonteId: 'ar',
    descricao: 'PM2.5 estimado por modelo de satélite (Open-Meteo)',
    legenda: [{ cor: '#d1d5db', rotulo: 'PM2.5 baixo' }, { cor: '#a78bfa', rotulo: 'PM2.5 moderado' }, { cor: '#4c1d95', rotulo: 'PM2.5 alto' }],
  },
  {
    id: 'chuva', nome: 'Chuva', cor: '#3b82f6', fonteId: 'chuva',
    descricao: 'Precipitação por hora (Open-Meteo)',
    legenda: [{ cor: '#bfdbfe', rotulo: 'Fraca' }, { cor: '#2563eb', rotulo: 'Moderada' }, { cor: '#1e3a8a', rotulo: 'Forte' }],
  },
  {
    id: 'cheias', nome: 'Risco de cheia', cor: '#06b6d4', fonteId: 'cheia',
    descricao: 'Vazão dos rios contra a média de 30 dias (estimativa, não é alerta oficial)',
    legenda: [{ cor: '#22d3ee', rotulo: 'Atenção' }, { cor: '#0891b2', rotulo: 'Alto' }, { cor: '#164e63', rotulo: 'Extremo' }],
  },
  {
    id: 'desmatamento', nome: 'Desmatamento (DETER)', cor: '#b45309', fonteId: 'desmatamento',
    descricao: 'Alertas dos últimos 90 dias (INPE DETER)',
    legenda: [{ cor: '#b45309', rotulo: 'Alerta (tamanho = área)' }],
  },
];

export const SATELITES: Array<{ id: string; nome: string }> = [
  { id: 'modis', nome: 'MODIS' },
  { id: 'noaa20', nome: 'NOAA-20' },
  { id: 'suomi', nome: 'Suomi NPP' },
];
export const HORAS_OPCOES: number[] = [6, 12, 24, 48, 72, 168];
export const SIGLAS: string[] = ['AC', 'AM', 'AP', 'MA', 'MT', 'PA', 'RO', 'RR', 'TO'];
export const NOMES_ESTADOS: Record<string, string> = {
  AC: 'Acre', AM: 'Amazonas', AP: 'Amapá', MA: 'Maranhão', MT: 'Mato Grosso', PA: 'Pará', RO: 'Rondônia', RR: 'Roraima', TO: 'Tocantins',
};
// ids de /api/fontes -> camada do mapa
export const CAMADA_DA_FONTE: Record<string, CamadaId> = {
  firms: 'queimadas', ar: 'ar', chuva: 'chuva', cheia: 'cheias', desmatamento: 'desmatamento',
};
// a partir de quantas horas sem coleta ok o dado e considerado defasado
export const LIMITE_DEFASAGEM_H: Record<string, number> = {
  firms: 3, ar: 8, chuva: 8, cheia: 8, clima: 14, desmatamento: 14,
};