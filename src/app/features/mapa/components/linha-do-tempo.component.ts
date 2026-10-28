import { ChangeDetectionStrategy, Component, OnDestroy, computed, input, model, signal } from '@angular/core';

// Linha do tempo com play/pause: troca o valor de tempos em tempos
@Component({
  selector: 'guarda-linha-do-tempo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lt">
      <span class="rotulo">{{ rotulo() }}</span>
      <div class="controles">
        <button type="button" class="botao" (click)="alternar()" [attr.aria-label]="tocando() ? 'Pausar' : 'Reproduzir'">
          @if (tocando()) { &#9208; } @else { &#9654; }
        </button>
        <input type="range" [min]="min()" [max]="max()" step="1" [value]="valor()" (input)="mudar($event)" [attr.aria-label]="rotulo()" />
        <span class="texto">{{ texto() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .rotulo { font-size: 12px; color: var(--texto-suave); }
    .controles { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    input[type='range'] { flex: 1; min-width: 0; accent-color: var(--destaque); }
    .texto { font-size: 12px; min-width: 62px; text-align: right; }
  `],
})
export class LinhaDoTempoComponent implements OnDestroy {
  readonly rotulo = input.required<string>();
  readonly min = input(0);
  readonly max = input(24);
  readonly valor = model(0);
  readonly formatar = input<(v: number) => string>((v) => String(v));
  protected readonly tocando = signal(false);
  protected readonly texto = computed(() => this.formatar()(this.valor()));
  private intervalo = 0;

  protected mudar(evento: Event): void {
    this.valor.set(Number((evento.target as HTMLInputElement).value));
  }

  protected alternar(): void {
    if (this.tocando()) {
      this.parar();
      return;
    }
    this.tocando.set(true);
    this.intervalo = window.setInterval(() => {
      const proximo = this.valor() + 1;
      this.valor.set(proximo > this.max() ? this.min() : proximo);
    }, 800);
  }

  private parar(): void {
    clearInterval(this.intervalo);
    this.tocando.set(false);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }
}