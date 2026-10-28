import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CAMADAS } from '../../../core/config/camadas.config';
import { AtualizacaoService } from '../../../core/services/atualizacao.service';
import { FiltrosService } from '../../../core/services/filtros.service';
import { estaDefasada } from '../../../core/util/defasagem.util';
import { AtualizadoHaPipe } from '../../../shared/pipes/atualizado-ha.pipe';
import { DataManausPipe } from '../../../shared/pipes/data-manaus.pipe';

@Component({
  selector: 'guarda-barra-status',
  imports: [AtualizadoHaPipe, DataManausPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="barra" aria-label="Fonte e horário de cada camada">
      @if (atualizacao.falhou()) { <span class="item erro">Não foi possível conferir a API.</span> }
      @for (i of itens(); track i.id) {
        <span class="item" [class.defasado]="i.defasada" [title]="i.fonte?.ultima_coleta_ok | dataManaus: 'longo'">
          <strong>{{ i.nome }}:</strong> {{ i.fonte ? (i.fonte.ultima_coleta_ok | atualizadoHa) : 'verificando' }}{{ i.defasada ? ' (defasado)' : '' }}
        </span>
      }
      <span class="item suave">Conferência a cada 5 min</span>
    </footer>
  `,
  styles: [`
    .barra { display: flex; flex-wrap: wrap; gap: 4px 16px; padding: 6px 12px; background: rgba(15, 20, 27, 0.92); border-top: 1px solid var(--borda); font-size: 12px; }
    .item.defasado { color: var(--alerta); }
    .item.erro { color: var(--erro); }
    .suave { color: var(--texto-suave); margin-left: auto; }
  `],
})
export class BarraStatusComponent {
  protected readonly atualizacao = inject(AtualizacaoService);
  private readonly filtros = inject(FiltrosService);
  protected readonly itens = computed(() =>
    CAMADAS.filter((c) => this.filtros.camadasAtivas().includes(c.id)).map((c) => {
      const fonte = this.atualizacao.fonteDe(c.fonteId);
      return { id: c.id, nome: c.nome, fonte, defasada: fonte ? estaDefasada(fonte) : false };
    }),
  );
}