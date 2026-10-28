import type { Map as MapaMapLibre } from 'maplibre-gl';
import type { CamadaId } from '../../core/config/camadas.config';

export const IDS_CLIQUE = ['queimadas-pontos', 'queimadas-clusters', 'cheias', 'chuva', 'ar', 'desmatamento'];

export const CAMADA_DO_LAYER: Record<string, CamadaId> = {
  'queimadas-pontos': 'queimadas',
  'queimadas-clusters': 'queimadas',
  ar: 'ar',
  chuva: 'chuva',
  cheias: 'cheias',
  desmatamento: 'desmatamento',
};

const LAYERS_DA_CAMADA: Record<CamadaId, string[]> = {
  queimadas: ['queimadas-clusters', 'queimadas-halo', 'queimadas-pontos'],
  ar: ['ar'],
  chuva: ['chuva'],
  cheias: ['cheias'],
  desmatamento: ['desmatamento'],
};

const VAZIO = { type: 'FeatureCollection', features: [] };
const CONTAGEM_POR_ZOOM = ['interpolate', ['linear'], ['zoom']];

export function definirVisibilidadeCamada(mapa: MapaMapLibre, id: CamadaId, visivel: boolean): void {
  for (const layer of LAYERS_DA_CAMADA[id]) {
    if (mapa.getLayer(layer)) mapa.setLayoutProperty(layer, 'visibility', visivel ? 'visible' : 'none');
  }
}

// Cria as fontes de dados e as camadas (de baixo para cima)
export function adicionarFontesECamadas(mapa: MapaMapLibre): void {
  const fonte = (id: string, extra: Record<string, unknown> = {}): void => {
    mapa.addSource(id, { type: 'geojson', data: VAZIO, ...extra } as never);
  };
  const camada = (spec: Record<string, unknown>): void => {
    mapa.addLayer(spec as never);
  };

  fonte('estados');
  fonte('municipio-sel');
  fonte('ar');
  fonte('chuva');
  fonte('cheias');
  fonte('desmatamento');
  fonte('queimadas', { cluster: true, clusterRadius: 42, clusterMaxZoom: 9 });

  camada({ id: 'estados-fill', type: 'fill', source: 'estados', paint: { 'fill-color': '#000000', 'fill-opacity': 0.01 } });
  camada({ id: 'estados-linha', type: 'line', source: 'estados', paint: { 'line-color': '#475569', 'line-width': 1 } });
  camada({ id: 'estados-destaque', type: 'line', source: 'estados', filter: ['==', ['get', 'sigla'], ''], paint: { 'line-color': '#f97316', 'line-width': 2.5 } });
  camada({ id: 'municipio-fill', type: 'fill', source: 'municipio-sel', paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.12 } });
  camada({ id: 'municipio-linha', type: 'line', source: 'municipio-sel', paint: { 'line-color': '#f59e0b', 'line-width': 2 } });

  camada({
    id: 'ar', type: 'circle', source: 'ar',
    paint: {
      'circle-color': ['interpolate', ['linear'], ['get', 'pm2_5'], 0, '#d1d5db', 15, '#9ca3af', 35, '#a78bfa', 75, '#7c3aed', 150, '#4c1d95'],
      'circle-radius': [...CONTAGEM_POR_ZOOM, 3, 14, 8, 44],
      'circle-opacity': 0.45,
      'circle-blur': 0.6,
    },
  });
  camada({
    id: 'chuva', type: 'circle', source: 'chuva', filter: ['>', ['get', 'precipitacao_mm'], 0.1],
    paint: {
      'circle-color': ['interpolate', ['linear'], ['get', 'precipitacao_mm'], 0.1, '#bfdbfe', 2, '#60a5fa', 8, '#2563eb', 20, '#1e3a8a'],
      'circle-radius': [...CONTAGEM_POR_ZOOM, 3, 10, 8, 36],
      'circle-opacity': 0.55,
      'circle-blur': 0.4,
    },
  });
  camada({
    id: 'cheias', type: 'circle', source: 'cheias',
    paint: {
      'circle-color': ['match', ['get', 'nivel'], 'atencao', '#22d3ee', 'alto', '#0891b2', 'extremo', '#164e63', '#22d3ee'],
      'circle-radius': ['match', ['get', 'nivel'], 'atencao', 6, 'alto', 9, 'extremo', 12, 6],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
    },
  });
  camada({
    id: 'desmatamento', type: 'circle', source: 'desmatamento',
    paint: {
      'circle-color': '#b45309',
      'circle-radius': ['interpolate', ['linear'], ['get', 'area_ha'], 0, 3, 50, 6, 500, 12],
      'circle-opacity': 0.8,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 0.6,
    },
  });
  camada({
    id: 'queimadas-clusters', type: 'circle', source: 'queimadas', filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#fb923c', 50, '#f97316', 200, '#ef4444', 1000, '#b91c1c'],
      'circle-radius': ['step', ['get', 'point_count'], 10, 50, 14, 200, 18, 1000, 24],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.9,
    },
  });
  camada({
    id: 'queimadas-halo', type: 'circle', source: 'queimadas', filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#f97316',
      'circle-radius': [...CONTAGEM_POR_ZOOM, 3, ['interpolate', ['linear'], ['get', 'intensidade'], 0, 5, 100, 10], 10, ['interpolate', ['linear'], ['get', 'intensidade'], 0, 12, 100, 24]],
      'circle-opacity': 0.3,
      'circle-blur': 0.6,
    },
  });
  camada({
    id: 'queimadas-pontos', type: 'circle', source: 'queimadas', filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': ['interpolate', ['linear'], ['get', 'intensidade'], 0, '#fb923c', 20, '#f97316', 60, '#ef4444', 150, '#7f1d1d'],
      'circle-radius': [...CONTAGEM_POR_ZOOM, 3, ['interpolate', ['linear'], ['get', 'intensidade'], 0, 2, 100, 5], 10, ['interpolate', ['linear'], ['get', 'intensidade'], 0, 5, 100, 12]],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 0.5,
    },
  });
}