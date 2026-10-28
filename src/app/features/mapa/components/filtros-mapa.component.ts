import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HORAS_OPCOES } from '../../../core/config/camadas.config';
import { FiltrosService } from '../../../core/services/filtros.service';

@Component({
  selector: 'guarda-filtros-mapa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="t-filtros">
      <h3 id="t-filtros">Período das queimadas</h3>
      <label class="campo">
        <span class="sr-only">Janela de tempo</span>
        <select (change)="mudarHoras($event)" aria-label="Janela de tempo das queimadas">
          @for (h of opcoes; track h) {
            <option [value]="h" [selected]="h === filtros.horas()">{{ rotulo(h) }}</option>
          }
        </select>
      </label>
    </section>
  `,
  styles: [`
    h3 { font-size: 13px; margin-bottom: 6px; }
    select { width: 100%; background: #1b2430; border: 1px solid var(--borda); border-radius: 8px; padding: 6px 8px; }
  `],
})
export class FiltrosMapaComponent {
  protected readonly filtros = inject(FiltrosService);
  protected readonly opcoes = HORAS_OPCOES;

  protected rotulo(h: number): string {
    return h === 168 ? 'Últimos 7 dias' : h === 24 ? 'Últimas 24 horas' : 'Últimas ' + h + ' horas';
  }

  protected mudarHoras(evento: Event): void {
    this.filtros.horas.set(Number((evento.target as HTMLSelectElement).value));
  }
}