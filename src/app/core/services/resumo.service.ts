import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ROTAS } from '../config/rotas-api';
import { EstatDesmatamento, EstatQueimadas, Relatorio, Resumo, ResumoCamadas, RespostaClima } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ResumoService {
  private readonly api = inject(ApiService);

  resumo(): Observable<Resumo> { return this.api.get<Resumo>(ROTAS.resumo); }
  camadas(estado?: string | null, horas?: number): Observable<ResumoCamadas> {
    return this.api.get<ResumoCamadas>(ROTAS.camadasResumo, { estado, horas });
  }
  relatorio(estado?: string | null): Observable<Relatorio> { return this.api.get<Relatorio>(ROTAS.relatorio, { estado }); }
  estatisticasQueimadas(estado?: string | null): Observable<EstatQueimadas> {
    return this.api.get<EstatQueimadas>(ROTAS.queimadasEstatisticas, { estado });
  }
  estatisticasDesmatamento(estado?: string | null): Observable<EstatDesmatamento> {
    return this.api.get<EstatDesmatamento>(ROTAS.desmatamentoEstatisticas, { estado });
  }
  clima(estado?: string | null): Observable<RespostaClima> { return this.api.get<RespostaClima>(ROTAS.clima, { estado }); }
}