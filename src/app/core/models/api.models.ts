export interface Fonte {
  id: string;
  nome: string;
  ultima_coleta: string | null;
  ultima_coleta_ok: string | null;
  situacao: string;
  erro?: string;
}
export interface RespostaFontes { fontes: Fonte[]; total_focos: number; }
export interface RespostaEstados { total: number; estados: string[]; }

export interface PontoGeo<P> {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: P;
}
export interface ColecaoPontos<P> {
  type: 'FeatureCollection';
  features: PontoGeo<P>[];
  fonte?: string;
  ultima_atualizacao?: string | null;
  total?: number;
  limite?: number;
  truncado?: boolean;
  bbox?: number[] | null;
}
export interface PropsQueimada {
  data: string; hora: string | null; satelite: string; intensidade: number;
  confianca: string | null; estado: string; municipio: string | null; fonte: string;
}

// Contornos (estados e municipios): so precisamos de propriedades e coordenadas
export interface FeatureGeo {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}
export interface ColecaoGeo { type: 'FeatureCollection'; features: FeatureGeo[]; fonte?: string; total?: number; }

export interface MunicipioResumo {
  codigo: string; nome: string; uf: string;
  centro: [number, number];
  bbox: [number, number, number, number];
}
export interface RespostaMunicipios { fonte: string; total: number; municipios: MunicipioResumo[]; }

export interface Alerta {
  _id: string; tipo: string; nivel: string; descricao: string;
  estado?: string; ativo: boolean; fonte: string; ultima_atualizacao: string;
}
export interface RespostaAlertas { fonte: string; ultima_atualizacao: string | null; total: number; alertas: Alerta[]; }

export interface ResumoQueimadas {
  periodo_horas: number; total: number; intensidade_media: number | null; intensidade_maxima: number | null;
  por_satelite: { modis: number; noaa20: number; suomi: number };
  fonte: string; ultima_atualizacao: string | null;
}
export interface ResumoAr {
  pontos: number; media_pm2_5: number | null;
  pior: { estado: string; latitude: number; longitude: number; pm2_5: number; indice: number | null; data: string } | null;
  fonte: string; ultima_atualizacao: string | null;
}
export interface ResumoChuva {
  hora: string; pontos: number; pontos_com_chuva: number; media_mm: number | null; maximo_mm: number | null;
  maior_proximas_24h: { estado: string; latitude: number; longitude: number; hora: string; precipitacao_mm: number } | null;
  fonte: string; ultima_atualizacao: string | null;
}
export interface ResumoCheias {
  pontos_monitorados: number;
  por_nivel: { normal: number; atencao: number; alto: number; extremo: number };
  em_alerta: number;
  maior_razao: { estado: string; razao: number; vazao: number; vazao_media: number; nivel: string; data: string } | null;
  fonte: string; ultima_atualizacao: string | null;
}
export interface ResumoCamadas {
  estado: string; gerado_em: string;
  queimadas: ResumoQueimadas; qualidade_ar: ResumoAr; chuva: ResumoChuva; cheias: ResumoCheias;
}
export interface Resumo {
  regiao: string; focos_de_calor: number; alertas_desmatamento: number; alertas_climaticos: number;
  alertas_ativos: number; ultima_atualizacao: string | null; camadas: ResumoCamadas;
}
export interface LinhaRelatorio {
  estado: string; focos: number; intensidade_media: number | null; desmatamentos: number;
  area_desmatada_ha: number; alertas: number; alertas_ativos: number;
}
export interface Relatorio {
  gerado_em: string;
  filtros: { estado: string | null; inicio: string | null; fim: string | null };
  fontes: string[];
  totais: { focos_de_calor: number; ocorrencias_desmatamento: number; area_desmatada_ha: number; alertas: number; alertas_ativos: number };
  por_estado: LinhaRelatorio[];
  camadas: ResumoCamadas;
}
export interface EstatQueimadas {
  total: number;
  por_estado: Array<{ estado: string; total: number; intensidade_media: number | null; intensidade_maxima: number | null }>;
  por_dia: Array<{ data: string; total: number }>;
}
export interface EstatDesmatamento {
  total: number; area_total_ha: number;
  por_estado: Array<{ estado: string; total: number; area_total_ha: number; area_media_ha: number | null; area_maxima_ha: number | null }>;
  por_dia: Array<{ data: string; total: number; area_ha: number }>;
}
export interface RespostaClima {
  total: number;
  registros: Array<{ estado: string; condicao: string; temperatura: number; umidade?: number; pontos?: number; observado_em?: string }>;
}