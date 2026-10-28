import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Alerta } from '../../core/models/api.models';
import { AlertasService } from '../../core/services/alertas.service';
import { FiltrosService } from '../../core/services/filtros.service';
import { AvisoComponent } from '../../shared/components/aviso.component';
import { CarregandoComponent } from '../../shared/components/carregando.component';
import { DataManausPipe } from '../../shared/pipes/data-manaus.pipe';

@Component({
  selector: 'guarda-alertas-page',
  imports: [AvisoComponent, CarregandoComponent, DataManausPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pg">
      <header class="topo">
        <h1>Alertas</h1>
        <div class="filtros">
          <label>Tipo
            <input type="search" placeholder="ex.: chuva" [value]="tipo()" (input)="tipo.set($any($event.target).value)" (keydown.enter)="carregar()" />
          </label>
          <label>Nível
            <select (change)="mudarNivel($event)">
              <option value="">Todos</option>
              @for (n of niveis; track n) { <option [value]="n">{{ n }}</option> }
            </select>
          </label>
          <button type="button" class="botao" (click)="carregar()">Filtrar</button>
        </div>
      </header>
      <p class="suave">Alertas cadastrados pela equipe responsável. Esta tela é somente de leitura.</p>

      @if (carregando()) {
        <guarda-carregando mensagem="Carregando alertas..." />
      } @else if (falhou()) {
        <guarda-aviso tipo="erro" titulo="Não foi possível carregar os alertas" [comAcao]="true" (tentar)="carregar()">Tente de novo em instantes.</guarda-aviso>
      } @else if (alertas().length === 0) {
        <guarda-aviso tipo="vazio" titulo="Nenhum alerta ativo no momento">Quando houver um alerta cadastrado, ele aparece aqui.</guarda-aviso>
      } @else {
        <ul class="lista">
          @for (a of alertas(); track a._id) {
            <li class="alerta" [class]="a.nivel">
              <div class="linha"><strong>{{ a.tipo }}</strong><span class="nivel">{{ a.nivel }}</span></div>
              <p>{{ a.descricao }}</p>
              <small>{{ a.estado || 'Amazônia Legal' }} · {{ a.ultima_atualizacao | dataManaus: 'longo' }}{{ a.ativo ? '' : ' · inativo' }}</small>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .pg { max-width: 860px; margin: 0 auto; padding: 18px 16px 40px; }
    .topo { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between; }
    .filtros { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--texto-suave); }
    input, select { background: #1b2430; border: 1px solid var(--borda); border-radius: 8px; padding: 6px 8px; }
    .suave { color: var(--texto-suave); }
    .lista { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    .alerta { background: var(--painel-solido); border: 1px solid var(--borda); border-left: 4px solid var(--alerta); border-radius: 10px; padding: 12px 14px; }
    .alerta.alto, .alerta.critico { border-left-color: var(--erro); }
    .alerta.baixo { border-left-color: var(--ok); }
    .linha { display: flex; justify-content: space-between; text-transform: capitalize; }
    .nivel { text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    p { margin: 6px 0; }
    small { color: var(--texto-suave); }
  `],
})
export class AlertasPage {
  private readonly servico = inject(AlertasService);
  private readonly filtros = inject(FiltrosService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly niveis = ['baixo', 'moderado', 'alto', 'critico'];
  protected readonly tipo = signal('');
  protected readonly nivel = signal('');
  protected readonly alertas = signal<Alerta[]>([]);
  protected readonly carregando = signal(true);
  protected readonly falhou = signal(false);

  constructor() {
    effect(() => {
      this.filtros.estado();
      untracked(() => this.carregar());
    });
  }

  protected mudarNivel(evento: Event): void {
    this.nivel.set((evento.target as HTMLSelectElement).value);
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.falhou.set(false);
    this.servico
      .listar({ tipo: this.tipo().trim() || null, nivel: this.nivel() || null, estado: this.filtros.estado() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.alertas.set(r.alertas);
          this.carregando.set(false);
        },
        error: () => {
          this.falhou.set(true);
          this.carregando.set(false);
        },
      });
  }
}