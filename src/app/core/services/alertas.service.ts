import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ROTAS } from '../config/rotas-api';
import { RespostaAlertas } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private readonly api = inject(ApiService);
  listar(filtro: { tipo?: string | null; nivel?: string | null; estado?: string | null } = {}): Observable<RespostaAlertas> {
    return this.api.get<RespostaAlertas>(ROTAS.alertas, { tipo: filtro.tipo, nivel: filtro.nivel, estado: filtro.estado });
  }
}