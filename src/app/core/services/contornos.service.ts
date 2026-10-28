import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ROTAS } from '../config/rotas-api';
import { ColecaoGeo } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ContornosService {
  private readonly api = inject(ApiService);
  estados(): Observable<ColecaoGeo> { return this.api.get<ColecaoGeo>(ROTAS.contornosEstados); }
  municipio(codigo: string): Observable<ColecaoGeo> { return this.api.get<ColecaoGeo>(ROTAS.municipiosGeojson, { codigo }); }
}