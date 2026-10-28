import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FiltrosService } from '../../core/services/filtros.service';
import { BarraStatusComponent } from './components/barra-status.component';
import { BuscaMunicipioComponent } from './components/busca-municipio.component';
import { FiltrosMapaComponent } from './components/filtros-mapa.component';
import { LegendaComponent } from './components/legenda.component';
import { LinhaDoTempoComponent } from './components/linha-do-tempo.component';
import { MapaCanvasComponent } from './components/mapa-canvas.component';
import { PainelCamadasComponent } from './components/painel-camadas.component';
import { PopupDetalheComponent } from './components/popup-detalhe.component';
import { RelatorioEstadoComponent } from './components/relatorio-estado.component';
import { Selecao } from './popup.util';

@Component({
  selector: 'guarda-mapa-page',
  imports: [MapaCanvasComponent, BuscaMunicipioComponent, FiltrosMapaComponent, PainelCamadasComponent, LinhaDoTempoComponent, LegendaComponent, PopupDetalheComponent, RelatorioEstadoComponent, BarraStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina">
      <div class="area">
        <guarda-mapa-canvas [limiteQueimadas]="limiteQueimadas()" [horaChuva]="horaChuva()" (pontoSelecionado)="selecao.set($event)" (estadoClicado)="estadoRelatorio.set($event)" />

        <button type="button" class="alternar botao nao-imprimir" (click)="painelAberto.set(!painelAberto())" [attr.aria-expanded]="painelAberto()">
          {{ painelAberto() ? 'Ocultar painel' : 'Camadas e filtros' }}
        </button>

        @if (painelAberto()) {
          <aside class="paineis vidro nao-imprimir" aria-label="Camadas e filtros">
            <guarda-busca-municipio />
            <guarda-filtros-mapa />
            <guarda-painel-camadas />
            @if (filtros.camadaAtiva('queimadas')) {
              <guarda-linha-do-tempo rotulo="Focos nas últimas 24 h" [min]="-24" [max]="0" [(valor)]="horaQueimadas" [formatar]="formatarQueimadas" />
            }
            @if (filtros.camadaAtiva('chuva')) {
              <guarda-linha-do-tempo rotulo="Chuva nas próximas horas" [min]="0" [max]="24" [(valor)]="horaChuvaOffset" [formatar]="formatarChuva" />
            }
          </aside>
        }

        <div class="legenda nao-imprimir"><guarda-legenda /></div>

        @if (selecao(); as sel) {
          <div class="popup"><guarda-popup-detalhe [selecao]="sel" (fechar)="selecao.set(null)" /></div>
        }
        @if (estadoRelatorio(); as uf) {
          <div class="relatorio"><guarda-relatorio-estado [estado]="uf" (fechar)="estadoRelatorio.set(null)" /></div>
        }
      </div>
      <guarda-barra-status class="nao-imprimir" />
    </section>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .pagina { display: flex; flex-direction: column; height: 100%; }
    .area { position: relative; flex: 1; min-height: 0; overflow: hidden; }
    .alternar { position: absolute; top: 12px; left: 12px; z-index: 6; }
    .paineis { position: absolute; top: 54px; left: 12px; z-index: 5; width: 300px; max-height: calc(100% - 150px); overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px; }
    .legenda { position: absolute; left: 12px; bottom: 12px; z-index: 4; max-width: calc(100% - 24px); }
    .popup { position: absolute; left: 50%; bottom: 72px; transform: translateX(-50%); z-index: 7; }
    .relatorio { position: absolute; top: 12px; right: 56px; z-index: 7; max-height: calc(100% - 24px); display: flex; }
    @media (max-width: 720px) {
      .paineis { width: calc(100% - 24px); max-height: 46%; }
      .popup { bottom: 12px; width: calc(100% - 24px); display: flex; justify-content: center; }
      .relatorio { right: 12px; left: 12px; top: auto; bottom: 12px; max-height: 60%; justify-content: center; }
      .legenda { bottom: 84px; }
    }
  `],
})
export class MapaPage {
  protected readonly filtros = inject(FiltrosService);
  protected readonly selecao = signal<Selecao | null>(null);
  protected readonly estadoRelatorio = signal<string | null>(null);
  protected readonly painelAberto = signal(window.innerWidth >= 720);
  protected readonly horaQueimadas = signal(0);
  protected readonly horaChuvaOffset = signal(0);

  protected readonly limiteQueimadas = computed(() => {
    const v = this.horaQueimadas();
    return v === 0 ? null : new Date(Date.now() + v * 3600000).toISOString();
  });
  protected readonly horaChuva = computed(() => {
    const v = this.horaChuvaOffset();
    if (v === 0) return null;
    const base = new Date();
    base.setUTCMinutes(0, 0, 0);
    return new Date(base.getTime() + v * 3600000).toISOString().slice(0, 16);
  });
  protected readonly formatarQueimadas = (v: number): string => (v === 0 ? 'agora' : -v + ' h atrás');
  protected readonly formatarChuva = (v: number): string => (v === 0 ? 'agora' : '+' + v + ' h');
}