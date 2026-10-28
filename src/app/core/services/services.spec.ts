import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RespostaFontes } from '../models/api.models';
import { caixaDeCoordenadas } from '../util/bbox.util';
import { estaDefasada } from '../util/defasagem.util';
import { ApiService } from './api.service';
import { AtualizacaoService } from './atualizacao.service';
import { DadosMapaService } from './dados-mapa.service';
import { FiltrosService } from './filtros.service';
import { MunicipiosService } from './municipios.service';

function configurar(): HttpTestingController {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return TestBed.inject(HttpTestingController);
}

describe('ApiService', () => {
  it('monta a URL e ignora parametros vazios', () => {
    const mock = configurar();
    TestBed.inject(ApiService).get('/api/x', { a: 1, b: '', c: null, d: 'z', e: undefined }).subscribe();
    const req = mock.expectOne((r) => r.url === environment.apiUrl + '/api/x');
    expect(req.request.params.keys().sort()).toEqual(['a', 'd']);
    expect(req.request.params.get('a')).toBe('1');
    req.flush({});
  });
});

describe('DadosMapaService', () => {
  it('pede as queimadas com bbox, horas e limite', () => {
    const mock = configurar();
    TestBed.inject(DadosMapaService).queimadas({ bbox: '-65,-9,-63,-7', horas: 24, limite: 100, municipio_codigo: '1302603' }).subscribe();
    const req = mock.expectOne((r) => r.url.endsWith('/api/queimadas/geojson'));
    expect(req.request.params.get('bbox')).toBe('-65,-9,-63,-7');
    expect(req.request.params.get('horas')).toBe('24');
    expect(req.request.params.get('limite')).toBe('100');
    expect(req.request.params.get('municipio_codigo')).toBe('1302603');
    expect(req.request.params.has('estado')).toBeFalse();
    req.flush({ type: 'FeatureCollection', features: [] });
  });

  it('pede a chuva de uma hora especifica', () => {
    const mock = configurar();
    TestBed.inject(DadosMapaService).chuva('2026-10-28T15:00').subscribe();
    const req = mock.expectOne((r) => r.url.endsWith('/api/chuvas/geojson'));
    expect(req.request.params.get('hora')).toBe('2026-10-28T15:00');
    req.flush({ type: 'FeatureCollection', features: [] });
  });
});

describe('MunicipiosService', () => {
  it('busca por nome e devolve a lista', () => {
    const mock = configurar();
    let lista: unknown[] = [];
    TestBed.inject(MunicipiosService).buscar(' labrea ', 'AM').subscribe((l) => (lista = l));
    const req = mock.expectOne((r) => r.url.endsWith('/api/municipios'));
    expect(req.request.params.get('busca')).toBe('labrea');
    expect(req.request.params.get('estado')).toBe('AM');
    expect(req.request.params.get('limite')).toBe('8');
    req.flush({ fonte: 'IBGE', total: 1, municipios: [{ codigo: '1302603', nome: 'Lábrea', uf: 'AM', centro: [-64.8, -7.2], bbox: [-66, -8, -63, -6] }] });
    expect(lista.length).toBe(1);
  });
});

describe('AtualizacaoService', () => {
  const resposta = (ok: string): RespostaFontes => ({
    total_focos: 1,
    fontes: [{ id: 'firms', nome: 'NASA FIRMS', ultima_coleta: ok, ultima_coleta_ok: ok, situacao: 'ok' }],
  });

  it('so avisa quando uma coleta nova aparece', () => {
    configurar();
    const servico = TestBed.inject(AtualizacaoService);
    const avisos: string[][] = [];
    servico.mudancas$.subscribe((ids) => avisos.push(ids));
    servico.aplicar(resposta('2026-10-28T10:00:00.000Z'));
    expect(avisos.length).toBe(0);
    servico.aplicar(resposta('2026-10-28T10:00:00.000Z'));
    expect(avisos.length).toBe(0);
    servico.aplicar(resposta('2026-10-28T10:30:00.000Z'));
    expect(avisos).toEqual([['firms']]);
  });

  it('marca fonte em erro ou antiga como defasada', () => {
    const agora = new Date('2026-10-28T12:00:00.000Z').getTime();
    const base = { id: 'firms', nome: 'x', ultima_coleta: null, situacao: 'ok' };
    expect(estaDefasada({ ...base, ultima_coleta_ok: '2026-10-28T11:30:00.000Z' }, agora)).toBeFalse();
    expect(estaDefasada({ ...base, ultima_coleta_ok: '2026-10-28T06:00:00.000Z' }, agora)).toBeTrue();
    expect(estaDefasada({ ...base, ultima_coleta_ok: null }, agora)).toBeTrue();
    expect(estaDefasada({ ...base, situacao: 'erro', ultima_coleta_ok: '2026-10-28T11:59:00.000Z' }, agora)).toBeTrue();
  });
});

describe('FiltrosService', () => {
  it('liga e desliga camadas e satelites', () => {
    const f = TestBed.inject(FiltrosService);
    expect(f.camadaAtiva('queimadas')).toBeTrue();
    f.alternarCamada('chuva');
    expect(f.camadaAtiva('chuva')).toBeTrue();
    f.alternarCamada('chuva');
    expect(f.camadaAtiva('chuva')).toBeFalse();
    f.alternarSatelite('modis');
    expect(f.satelites()).not.toContain('modis');
  });

  it('escolher um municipio ajusta o estado e trocar de estado limpa o municipio', () => {
    const f = TestBed.inject(FiltrosService);
    f.escolherMunicipio({ codigo: '1302603', nome: 'Lábrea', uf: 'AM', centro: [-64.8, -7.2], bbox: [-66, -8, -63, -6] });
    expect(f.estado()).toBe('AM');
    f.definirEstado('PA');
    expect(f.municipio()).toBeNull();
  });
});

describe('caixaDeCoordenadas', () => {
  it('acha a caixa de um poligono', () => {
    const caixa = caixaDeCoordenadas([[[-65, -9], [-63, -9], [-63, -7], [-65, -7], [-65, -9]]]);
    expect(caixa).toEqual([-65, -9, -63, -7]);
  });
  it('devolve null sem coordenadas', () => {
    expect(caixaDeCoordenadas([])).toBeNull();
  });
});