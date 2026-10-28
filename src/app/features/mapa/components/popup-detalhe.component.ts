import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Selecao, linhasDe } from '../popup.util';

@Component({
  selector: 'guarda-popup-detalhe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="popup vidro" aria-label="Detalhes do ponto selecionado">
      <header>
        <h3>{{ selecao().titulo }}</h3>
        <button type="button" class="x" aria-label="Fechar detalhes" (click)="fechar.emit()">&times;</button>
      </header>
      <dl>
        @for (l of linhas(); track l.rotulo) {
          <div class="linha"><dt>{{ l.rotulo }}</dt><dd>{{ l.valor }}</dd></div>
        }
      </dl>
    </article>
  `,
  styles: [`
    .popup { padding: 10px 14px; width: min(92vw, 340px); }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    h3 { font-size: 14px; }
    .x { background: none; border: 0; font-size: 22px; cursor: pointer; line-height: 1; }
    dl { margin: 0; }
    .linha { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; border-bottom: 1px solid var(--borda); font-size: 13px; }
    dt { color: var(--texto-suave); }
    dd { margin: 0; text-align: right; }
  `],
})
export class PopupDetalheComponent {
  readonly selecao = input.required<Selecao>();
  readonly fechar = output<void>();
  protected readonly linhas = computed(() => linhasDe(this.selecao()));
}