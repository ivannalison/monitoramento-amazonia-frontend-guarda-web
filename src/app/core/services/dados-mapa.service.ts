import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ROTAS } from '../config/rotas-api';
import { ColecaoPontos, PropsQueimada } from '../models/api.models';
import { ApiService } from './api.service';

export interface ParamsArea {
  bbox?: string | null;
  estado?: string | null;
  municipio?: string | null;
  municipio_codigo?: string | null;
  horas?: number;
  satelite?: string | null;
  limite?: number;
}

export interface PropsDesmat { data: string; estado: string; municipio: string | null; area_ha: number; classe: string | null; fonte: string; }
export interface PropsAr { data: string; pm2_5: number; pm10: number | null; indice: number | null; aerossol: number | null; estado: string; fonte: string; }
export interface PropsChuva { hora: string; precipitacao_mm: number; estado: string; fonte: string; }
export interface PropsCheia { data: string; vazao: number; vazao_media: number; razao: number; nivel: string; estado: string; fonte: string; }

@Injectable({ providedIn: 'root' })
export class DadosMapaService {
  private readonly api = inject(ApiService);

  queimadas(p: ParamsArea): Observable<ColecaoPontos<PropsQueimada>> {
    return this.api.get<ColecaoPontos<PropsQueimada>>(ROTAS.queimadasGeojson, {
      bbox: p.bbox, estado: p.estado, municipio_codigo: p.municipio_codigo, horas: p.horas, satelite: p.satelite, limite: p.limite,
    });
  }

  desmatamento(p: ParamsArea): Observable<ColecaoPontos<PropsDesmat>> {
    return this.api.get<ColecaoPontos<PropsDesmat>>(ROTAS.desmatamentoGeojson, {
      bbox: p.bbox, estado: p.estado, municipio: p.municipio, limite: p.limite,
    });
  }

  ar(estado?: string | null): Observable<ColecaoPontos<PropsAr>> {
    return this.api.get<ColecaoPontos<PropsAr>>(ROTAS.qualidadeArGeojson, { estado });
  }

  chuva(hora?: string | null, estado?: string | null): Observable<ColecaoPontos<PropsChuva>> {
    return this.api.get<ColecaoPontos<PropsChuva>>(ROTAS.chuvasGeojson, { hora, estado });
  }

  cheias(estado?: string | null): Observable<ColecaoPontos<PropsCheia>> {
    return this.api.get<ColecaoPontos<PropsCheia>>(ROTAS.cheiasGeojson, { estado });
  }
}