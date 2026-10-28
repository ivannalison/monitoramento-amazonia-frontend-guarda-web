import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, of } from 'rxjs';
import { NOMES_ESTADOS, SIGLAS } from '../core/config/camadas.config';
import { AtualizacaoService } from '../core/services/atualizacao.service';
import { EstadosService } from '../core/services/estados.service';
import { FiltrosService } from '../core/services/filtros.service';
import { estaDefasada } from '../core/util/defasagem.util';
import { LogoComponent } from '../shared/components/logo.component';

@Component({
  selector: 'guarda-cabecalho',
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="cab nao-imprimir">
      <a class="marca" routerLink="/mapa" queryParamsHandling="preserve" aria-label="GUARDA - página inicial">
        <guarda-logo [tamanho]="30" /><span>GUARDA</span>
      </a>
      <nav aria-label="Principal">
        <a routerLink="/mapa" routerLinkActive="ativo" queryParamsHandling="preserve">Mapa</a>
        <a routerLink="/painel" routerLinkActive="ativo" queryParamsHandling="preserve">Painel</a>
        <a routerLink="/alertas" routerLinkActive="ativo" queryParamsHandling="preserve">Alertas</a>
      </nav>
      <div class="acoes">
        <span class="estado-api" [class.alerta]="problema()" [title]="textoStatus()">
          <span class="ponto" aria-hidden="true"></span><span class="sr-only">{{ textoStatus() }}</span>
        </span>
        <label class="sel">
          <span class="sr-only">Estado</span>
          <select (change)="mudarEstado($event)" aria-label="Filtrar por estado">
            <option value="" [selected]="!filtros.estado()">Toda a Amazônia Legal</option>
            @for (uf of estados(); track uf) {
              <option [value]="uf" [selected]="uf === filtros.estado()">{{ uf }} - {{ nome(uf) }}</option>
            }
          </select>
        </label>
        <button type="button" class="botao" (click)="abrirSobre.emit()">Sobre</button>
      </div>
    </header>
  `,
  styles: [`
    .cab { display: flex; align-items: center; gap: 16px; height: 56px; padding: 0 14px; background: #0f151d; border-bottom: 1px solid var(--borda); }
    .marca { display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: 0.08em; text-decoration: none; }
    nav { display: flex; gap: 4px; flex: 1; }
    nav a { text-decoration: none; padding: 6px 12px; border-radius: 8px; color: var(--texto-suave); }
    nav a.ativo { background: #1b2430; color: var(--texto); }
    .acoes { display: flex; align-items: center; gap: 10px; }
    .sel select { background: #1b2430; border: 1px solid var(--borda); border-radius: 8px; padding: 6px 8px; max-width: 200px; }
    .ponto { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--ok); }
    .alerta .ponto { background: var(--alerta); }
    @media (max-width: 720px) {
      .cab { gap: 8px; padding: 0 8px; }
      .marca span { display: none; }
      nav a { padding: 6px 8px; }
      .sel select { max-width: 120px; }
    }
  `],
})
export class CabecalhoComponent {
  protected readonly filtros = inject(FiltrosService);
  private readonly atualizacao = inject(AtualizacaoService);
  private readonly router = inject(Router);
  readonly abrirSobre = output<void>();

  protected readonly estados = toSignal(inject(EstadosService).listar().pipe(catchError(() => of(SIGLAS))), { initialValue: SIGLAS });
  protected readonly problema = computed(() => this.atualizacao.falhou() || this.atualizacao.fontes().some((f) => estaDefasada(f)));
  protected readonly textoStatus = computed(() =>
    this.atualizacao.falhou() ? 'Não foi possível conferir a API' : this.problema() ? 'Alguma fonte está com dado defasado' : 'Dados em dia',
  );

  protected nome(uf: string): string {
    return NOMES_ESTADOS[uf] ?? uf;
  }

  protected mudarEstado(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.filtros.definirEstado(valor || null);
    void this.router.navigate([], { queryParams: { estado: valor || null }, queryParamsHandling: 'merge' });
  }
}