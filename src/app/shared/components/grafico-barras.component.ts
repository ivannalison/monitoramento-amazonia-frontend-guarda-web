import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NumeroPipe } from '../pipes/numero.pipe';

export interface ItemGrafico { rotulo: string; valor: number; }

// Grafico de barras horizontais feito so com HTML e CSS (sem biblioteca externa)
@Component({
  selector: 'guarda-grafico-barras',
  imports: [NumeroPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="graf" role="img" [attr.aria-label]="descricao()">
      <figcaption>{{ titulo() }}</figcaption>
      @if (dados().length === 0) {
        <p class="vazio">Sem dados para exibir.</p>
      } @else {
        <ul>
          @for (d of dados(); track d.rotulo) {
            <li class="barra">
              <span class="rot">{{ d.rotulo }}</span>
              <span class="trilho"><span class="preenche" [style.width.%]="largura(d.valor)" [style.background]="cor()"></span></span>
              <span class="val">{{ d.valor | numero: casas() }}{{ unidade() }}</span>
            </li>
          }
        </ul>
      }
    </figure>
  `,
  styles: [`
    .graf { margin: 0; }
    figcaption { font-weight: 600; margin-bottom: 8px; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    .barra { display: grid; grid-template-columns: 54px 1fr auto; gap: 8px; align-items: center; font-size: 12px; }
    .trilho { height: 10px; background: rgba(255, 255, 255, 0.07); border-radius: 6px; overflow: hidden; }
    .preenche { display: block; height: 100%; border-radius: 6px; }
    .val { color: var(--texto-suave); min-width: 48px; text-align: right; }
    .vazio { color: var(--texto-suave); margin: 0; }
  `],
})
export class GraficoBarrasComponent {
  readonly titulo = input.required<string>();
  readonly dados = input.required<ItemGrafico[]>();
  readonly cor = input('#f97316');
  readonly unidade = input('');
  readonly casas = input(0);
  protected readonly maximo = computed(() => Math.max(1, ...this.dados().map((d) => d.valor)));
  protected readonly descricao = computed(() => this.titulo() + ': ' + this.dados().map((d) => d.rotulo + ' ' + d.valor).join(', '));
  protected largura(v: number): number {
    return Math.max(1, Math.round((v / this.maximo()) * 100));
  }
}