import { linhasDe } from './popup.util';

describe('linhasDe', () => {
  it('descreve um foco de calor', () => {
    const linhas = linhasDe({
      camada: 'queimadas',
      titulo: 'Foco de calor',
      propriedades: { satelite: 'noaa20', intensidade: 12.5, estado: 'PA', municipio: 'Uruará', data: '2026-10-20T15:00:00.000Z', fonte: 'NASA FIRMS' },
    });
    const mapa = new Map(linhas.map((l) => [l.rotulo, l.valor]));
    expect(mapa.get('Satélite')).toBe('NOAA-20 (VIIRS)');
    expect(mapa.get('Município')).toBe('Uruará');
    expect(mapa.get('Intensidade (FRP)')).toBe('12,5 MW');
    expect(mapa.get('Data e hora')).toContain('11:00');
  });

  it('mostra traco quando falta informacao', () => {
    const linhas = linhasDe({ camada: 'desmatamento', titulo: 'x', propriedades: {} });
    expect(linhas.every((l) => l.valor === '-' || l.valor.endsWith(' ha'))).toBeTrue();
  });

  it('cobre todas as camadas', () => {
    for (const camada of ['queimadas', 'ar', 'chuva', 'cheias', 'desmatamento'] as const) {
      expect(linhasDe({ camada, titulo: camada, propriedades: {} }).length).toBeGreaterThan(2);
    }
  });
});