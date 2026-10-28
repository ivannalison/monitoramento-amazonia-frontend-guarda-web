import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type TipoAviso = 'erro' | 'defasado' | 'info' | 'vazio';

@Component({
  selector: 'guarda-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aviso" [class]="tipo()" role="alert">
      <strong>{{ titulo() }}</strong>
      <div class="texto"><ng-content /></div>
      @if (comAcao()) {
        <button type="button" class="botao" (click)="tentar.emit()">Tentar de novo</button>
      }
    </div>
  `,
  styles: [`
    .aviso { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--borda); background: var(--painel-solido); }
    .aviso.erro { border-color: var(--erro); }
    .aviso.defasado { border-color: var(--alerta); }
    .aviso.vazio { color: var(--texto-suave); }
    .texto { color: var(--texto-suave); }
    button { align-self: flex-start; }
  `],
})
export class AvisoComponent {
  readonly tipo = input<TipoAviso>('info');
  readonly titulo = input('');
  readonly comAcao = input(false);
  readonly tentar = output<void>();
}