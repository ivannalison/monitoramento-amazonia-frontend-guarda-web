import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { NOMES_ESTADOS } from '../../core/config/camadas.config';
import { EstatDesmatamento, EstatQueimadas, Relatorio, Resumo, ResumoCamadas, RespostaClima } from '../../core/models/api.models';
import { FiltrosService } from '../../core/services/filtros.service';
import { ResumoService } from '../../core/services/resumo.service';
import { AvisoComponent } from '../../shared/components/aviso.component';
import { CarregandoComponent } from '../../shared/components/carregando.component';
import { CartaoIndicadorComponent } from '../../shared/components/cartao-indicador.component';
import { GraficoBarrasComponent, ItemGrafico } from '../../shared/components/grafico-barras.component';
import { AtualizadoHaPipe } from '../../shared/pipes/atualizado-ha.pipe';
import { NumeroPipe } from '../../shared/pipes/numero.pipe';

interface DadosPainel {
  resumo: Resumo;
  camadas: ResumoCamadas;
  relatorio: Relatorio;
  queimadas: EstatQueimadas;
  desmatamento: EstatDesmatamento;
  clima: RespostaClima;
}

@Component({
  selector: 'guarda-painel-page',
  imports: [AvisoComponent, CarregandoComponent, CartaoIndicadorComponent, GraficoBarrasComponent, NumeroPipe, AtualizadoHaPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg">
      <header class="topo">
        <h1>Painel - {{ titulo() }}</h1>
        <button type="button" class="botao nao-imprimir" (click)="recarregar()">Atualizar</button>
      </header>

      @if (carregando()) {
        <guarda-carregando mensagem="Carregando indicadores..." />
      } @else if (falhou()) {
        <guarda-aviso tipo="erro" titulo="Não foi possível carregar o painel" [comAcao]="true" (tentar)="recarregar()">A API não respondeu como esperado.</guarda-aviso>
      } @else if (dados(); as d) {
        <section class="cartoes" aria-label="Indicadores">
          <guarda-cartao-indicador titulo="Focos de calor (24 h)" [valor]="d.camadas.queimadas.total | numero" [detalhe]="'Intensidade média: ' + (d.camadas.queimadas.intensidade_media | numero: 1) + ' MW'" cor="#f97316" />
          <guarda-cartao-indicador titulo="Alertas ativos" [valor]="d.resumo.alertas_ativos | numero" detalhe="Cadastrados pela equipe" cor="#eab308" />
          <guarda-cartao-indicador titulo="Pior qualidade do ar" [valor]="piorAr(d)" [detalhe]="detalheAr(d)" cor="#a78bfa" />
          <guarda-cartao-indicador titulo="Maior chuva (24 h)" [valor]="maiorChuva(d)" [detalhe]="detalheChuva(d)" cor="#3b82f6" />
          <guarda-cartao-indicador titulo="Rios em alerta" [valor]="d.camadas.cheias.em_alerta | numero" [detalhe]="'de ' + (d.camadas.cheias.pontos_monitorados | numero) + ' pontos monitorados'" cor="#06b6d4" />
          <guarda-cartao-indicador titulo="Desmatamento (90 dias)" [valor]="(d.desmatamento.area_total_ha | numero: 0) + ' ha'" [detalhe]="(d.desmatamento.total | numero) + ' alertas DETER'" cor="#b45309" />
        </section>

        <section class="graficos" aria-label="Gráficos">
          <div class="bloco"><guarda-grafico-barras titulo="Focos de calor por dia" [dados]="focosPorDia()" cor="#f97316" /></div>
          <div class="bloco"><guarda-grafico-barras titulo="Focos de calor por estado" [dados]="focosPorEstado()" cor="#ef4444" /></div>
          <div class="bloco"><guarda-grafico-barras titulo="Área desmatada por estado (ha)" [dados]="desmatPorEstado()" cor="#b45309" /></div>
        </section>

        <section class="tabelas" aria-label="Tabelas">
          <div class="bloco">
            <h2>Relatório por estado</h2>
            <div class="rolagem">
              <table>
                <thead><tr><th>Estado</th><th>Focos</th><th>Intens. média</th><th>Desmat. (ha)</th><th>Alertas</th></tr></thead>
                <tbody>
                  @for (l of d.relatorio.por_estado; track l.estado) {
                    <tr><td>{{ l.estado }}</td><td>{{ l.focos | numero }}</td><td>{{ l.intensidade_media | numero: 1 }}</td><td>{{ l.area_desmatada_ha | numero: 0 }}</td><td>{{ l.alertas_ativos | numero }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div class="bloco">
            <h2>Clima</h2>
            @if (d.clima.registros.length === 0) {
              <p class="suave">Sem registros de clima.</p>
            } @else {
              <div class="rolagem">
                <table>
                  <thead><tr><th>Estado</th><th>Condição</th><th>Temp.</th><th>Umid.</th></tr></thead>
                  <tbody>
                    @for (c of d.clima.registros; track c.estado) {
                      <tr><td>{{ c.estado }}</td><td>{{ c.condicao }}</td><td>{{ c.temperatura | numero: 1 }} °C</td><td>{{ c.umidade | numero }}%</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
        <p class="suave rodape">Focos: {{ d.camadas.queimadas.fonte }}, atualizado {{ d.camadas.queimadas.ultima_atualizacao | atualizadoHa }}. Ar: {{ d.camadas.qualidade_ar.fonte }}, {{ d.camadas.qualidade_ar.ultima_atualizacao | atualizadoHa }}.</p>
      }
    </div>
  `,
  styles: [`
    .pg { max-width: 1100px; margin: 0 auto; padding: 18px 16px 48px; }
    .topo { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
    .cartoes { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
    .graficos { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-top: 14px; }
    .tabelas { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 12px; margin-top: 14px; }
    .bloco { background: var(--painel-solido); border: 1px solid var(--borda); border-radius: 10px; padding: 14px; min-width: 0; }
    h2 { font-size: 15px; margin-bottom: 8px; }
    .rolagem { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid var(--borda); white-space: nowrap; }
    .suave { color: var(--texto-suave); }
    .rodape { margin-top: 12px; font-size: 12px; }
  `],
})
export class PainelPage {
  private readonly servico = inject(ResumoService);
  private readonly filtros = inject(FiltrosService);
  private readonly gatilho = signal(0);
  protected readonly carregando = signal(true);
  protected readonly falhou = signal(false);
  protected readonly dados = signal<DadosPainel | null>(null);

  protected readonly titulo = computed(() => {
    const uf = this.filtros.estado();
    return uf ? (NOMES_ESTADOS[uf] ?? uf) : 'Amazônia Legal';
  });
  protected readonly focosPorDia = computed<ItemGrafico[]>(() =>
    (this.dados()?.queimadas.por_dia ?? []).map((d) => ({ rotulo: d.data.slice(8, 10) + '/' + d.data.slice(5, 7), valor: d.total })),
  );
  protected readonly focosPorEstado = computed<ItemGrafico[]>(() =>
    (this.dados()?.queimadas.por_estado ?? []).map((e) => ({ rotulo: e.estado, valor: e.total })),
  );
  protected readonly desmatPorEstado = computed<ItemGrafico[]>(() =>
    (this.dados()?.desmatamento.por_estado ?? []).map((e) => ({ rotulo: e.estado, valor: Math.round(e.area_total_ha) })),
  );

  constructor() {
    const chave = computed(() => ({ uf: this.filtros.estado(), n: this.gatilho() }));
    toObservable(chave)
      .pipe(
        tap(() => {
          this.carregando.set(true);
          this.falhou.set(false);
        }),
        switchMap(({ uf }) =>
          forkJoin({
            resumo: this.servico.resumo(),
            camadas: this.servico.camadas(uf),
            relatorio: this.servico.relatorio(uf),
            queimadas: this.servico.estatisticasQueimadas(uf),
            desmatamento: this.servico.estatisticasDesmatamento(uf),
            clima: this.servico.clima(uf),
          }).pipe(
            catchError(() => {
              this.falhou.set(true);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((d) => {
        this.dados.set(d);
        this.carregando.set(false);
      });
  }

  protected recarregar(): void {
    this.gatilho.update((n) => n + 1);
  }

  protected piorAr(d: DadosPainel): string {
    const p = d.camadas.qualidade_ar.pior;
    return p ? p.pm2_5.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' \u00b5g/m\u00b3' : '-';
  }
  protected detalheAr(d: DadosPainel): string {
    const p = d.camadas.qualidade_ar.pior;
    return p ? 'PM2.5 em ' + p.estado : 'Sem leituras';
  }
  protected maiorChuva(d: DadosPainel): string {
    const c = d.camadas.chuva.maior_proximas_24h;
    return c ? c.precipitacao_mm.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mm' : '0 mm';
  }
  protected detalheChuva(d: DadosPainel): string {
    const c = d.camadas.chuva.maior_proximas_24h;
    return c ? 'Previsto em ' + c.estado : 'Sem chuva prevista';
  }
}