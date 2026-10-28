import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';
import { NOMES_ESTADOS } from '../../../core/config/camadas.config';
import { Relatorio } from '../../../core/models/api.models';
import { ResumoService } from '../../../core/services/resumo.service';
import { AvisoComponent } from '../../../shared/components/aviso.component';
import { CarregandoComponent } from '../../../shared/components/carregando.component';
import { AtualizadoHaPipe } from '../../../shared/pipes/atualizado-ha.pipe';
import { NumeroPipe } from '../../../shared/pipes/numero.pipe';

@Component({
  selector: 'guarda-relatorio-estado',
  imports: [AvisoComponent, CarregandoComponent, NumeroPipe, AtualizadoHaPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="rel vidro" aria-label="Relatório do estado">
      <header>
        <h2>{{ nome() }}</h2>
        <div class="acoes nao-imprimir">
          <button type="button" class="botao" (click)="imprimir()">Imprimir</button>
          <button type="button" class="x" aria-label="Fechar relatório" (click)="fechar.emit()">&times;</button>
        </div>
      </header>
      @if (carregando()) {
        <guarda-carregando mensagem="Carregando relatório..." />
      } @else if (falhou()) {
        <guarda-aviso tipo="erro" titulo="Relatório indisponível">Não foi possível carregar este estado agora.</guarda-aviso>
      } @else if (dados(); as r) {
        <dl>
          <div class="linha"><dt>Focos de calor (7 dias)</dt><dd>{{ (linha()?.focos ?? 0) | numero }}</dd></div>
          <div class="linha"><dt>Intensidade média</dt><dd>{{ linha()?.intensidade_media | numero: 1 }} MW</dd></div>
          <div class="linha"><dt>Alertas de desmatamento</dt><dd>{{ (linha()?.desmatamentos ?? 0) | numero }}</dd></div>
          <div class="linha"><dt>Área desmatada</dt><dd>{{ (linha()?.area_desmatada_ha ?? 0) | numero: 0 }} ha</dd></div>
          <div class="linha"><dt>Alertas ativos</dt><dd>{{ (linha()?.alertas_ativos ?? 0) | numero }}</dd></div>
          <div class="linha"><dt>Focos nas últimas 24 h</dt><dd>{{ r.camadas.queimadas.total | numero }}</dd></div>
          <div class="linha"><dt>Pontos de ar monitorados</dt><dd>{{ r.camadas.qualidade_ar.pontos | numero }}</dd></div>
          <div class="linha"><dt>PM2.5 médio</dt><dd>{{ r.camadas.qualidade_ar.media_pm2_5 | numero: 1 }}</dd></div>
          <div class="linha"><dt>Pontos com chuva agora</dt><dd>{{ r.camadas.chuva.pontos_com_chuva | numero }}</dd></div>
          <div class="linha"><dt>Rios em alerta</dt><dd>{{ r.camadas.cheias.em_alerta | numero }}</dd></div>
        </dl>
        <small class="suave">Gerado {{ r.gerado_em | atualizadoHa }}. Fontes: {{ r.fontes.join(', ') }}.</small>
      }
    </aside>
  `,
  styles: [`
    .rel { padding: 12px 14px; width: min(94vw, 360px); max-height: 100%; overflow: auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .acoes { display: flex; align-items: center; gap: 6px; }
    .x { background: none; border: 0; font-size: 22px; cursor: pointer; line-height: 1; }
    dl { margin: 0; }
    .linha { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--borda); font-size: 13px; }
    dt { color: var(--texto-suave); }
    dd { margin: 0; }
    .suave { display: block; margin-top: 8px; color: var(--texto-suave); font-size: 11px; }
  `],
})
export class RelatorioEstadoComponent {
  private readonly servico = inject(ResumoService);
  readonly estado = input.required<string>();
  readonly fechar = output<void>();
  protected readonly dados = signal<Relatorio | null>(null);
  protected readonly carregando = signal(true);
  protected readonly falhou = signal(false);
  protected readonly nome = computed(() => NOMES_ESTADOS[this.estado()] ?? this.estado());
  protected readonly linha = computed(() => this.dados()?.por_estado.find((l) => l.estado === this.estado()) ?? null);

  constructor() {
    toObservable(this.estado)
      .pipe(
        tap(() => {
          this.carregando.set(true);
          this.falhou.set(false);
          this.dados.set(null);
        }),
        switchMap((uf) =>
          this.servico.relatorio(uf).pipe(
            catchError(() => {
              this.falhou.set(true);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((r) => {
        this.dados.set(r);
        this.carregando.set(false);
      });
  }

  protected imprimir(): void {
    window.print();
  }
}