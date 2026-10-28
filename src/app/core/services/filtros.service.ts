import { Injectable, signal } from '@angular/core';
import { CamadaId, SIGLAS } from '../config/camadas.config';
import { MunicipioResumo } from '../models/api.models';

function lerEstadoDaUrl(): string | null {
  try {
    const e = new URLSearchParams(window.location.search).get('estado');
    return e && SIGLAS.includes(e.toUpperCase()) ? e.toUpperCase() : null;
  } catch {
    return null;
  }
}

// Estado global dos filtros: vale para todas as telas
@Injectable({ providedIn: 'root' })
export class FiltrosService {
  readonly estado = signal<string | null>(lerEstadoDaUrl());
  readonly horas = signal<number>(24);
  readonly satelites = signal<string[]>(['modis', 'noaa20', 'suomi']);
  readonly camadasAtivas = signal<CamadaId[]>(['queimadas']);
  readonly municipio = signal<MunicipioResumo | null>(null);

  camadaAtiva(id: CamadaId): boolean {
    return this.camadasAtivas().includes(id);
  }

  alternarCamada(id: CamadaId): void {
    this.camadasAtivas.update((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  }

  alternarSatelite(id: string): void {
    this.satelites.update((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  }

  definirEstado(sigla: string | null): void {
    this.estado.set(sigla);
    const m = this.municipio();
    if (m && sigla && m.uf !== sigla) this.municipio.set(null);
  }

  escolherMunicipio(m: MunicipioResumo | null): void {
    this.municipio.set(m);
    if (m) this.estado.set(m.uf);
  }
}