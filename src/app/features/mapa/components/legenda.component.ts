import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CAMADAS } from '../../../core/config/camadas.config';
import { FiltrosService } from '../../../core/services/filtros.service';

@Component({
  selector: 'guarda-legenda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ativas().length > 0) {
      <div class="leg vidro" role="group" aria-label="Legenda do mapa">
        @for (c of ativas(); track c.id) {
          <div class="grupo">
            <strong>{{ c.nome }}</strong>
            @for (i of c.legenda; track i.rotulo) {
              <span class="item"><span class="cor" [style.background]="i.cor"></span>{{ i.rotulo }}</span>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .leg { padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; max-width: 100%; }
    .grupo { display: flex; flex-direction: column; gap: 2px; }
    .item { display: flex; align-items: center; gap: 6px; color: var(--texto-suave); }
    .cor { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  `],
})
export class LegendaComponent {
  private readonly filtros = inject(FiltrosService);
  protected readonly ativas = computed(() => CAMADAS.filter((c) => this.filtros.camadasAtivas().includes(c.id)));
}