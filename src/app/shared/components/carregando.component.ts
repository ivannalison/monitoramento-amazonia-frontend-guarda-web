import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'guarda-carregando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="car" role="status" aria-live="polite">
      <span class="giro" aria-hidden="true"></span>
      <span>{{ mensagem() }}</span>
    </div>
  `,
  styles: [`
    .car { display: flex; align-items: center; gap: 10px; padding: 16px; color: var(--texto-suave); }
    .giro { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--borda); border-top-color: var(--destaque); animation: g 0.9s linear infinite; }
    @keyframes g { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .giro { animation: none; } }
  `],
})
export class CarregandoComponent {
  readonly mensagem = input('Carregando...');
}