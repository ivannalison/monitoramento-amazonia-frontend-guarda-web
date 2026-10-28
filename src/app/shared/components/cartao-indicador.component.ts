import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'guarda-cartao-indicador',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="cartao" [style.--cor]="cor()">
      <h3>{{ titulo() }}</h3>
      <p class="valor">{{ valor() }}</p>
      @if (detalhe()) { <p class="detalhe">{{ detalhe() }}</p> }
    </article>
  `,
  styles: [`
    .cartao { background: var(--painel-solido); border: 1px solid var(--borda); border-left: 4px solid var(--cor, var(--destaque)); border-radius: 10px; padding: 12px 14px; height: 100%; }
    h3 { font-size: 12px; font-weight: 600; color: var(--texto-suave); text-transform: uppercase; letter-spacing: 0.04em; }
    .valor { font-size: 26px; font-weight: 700; margin: 4px 0 2px; }
    .detalhe { margin: 0; color: var(--texto-suave); font-size: 12px; }
  `],
})
export class CartaoIndicadorComponent {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly detalhe = input('');
  readonly cor = input('#f97316');
}