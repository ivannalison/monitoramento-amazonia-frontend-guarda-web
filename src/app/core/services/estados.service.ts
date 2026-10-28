import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ROTAS } from '../config/rotas-api';
import { RespostaEstados } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EstadosService {
  private readonly api = inject(ApiService);
  listar(): Observable<string[]> {
    return this.api.get<RespostaEstados>(ROTAS.estados).pipe(map((r) => r.estados));
  }
}