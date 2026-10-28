import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CAMADAS, CamadaId, SATELITES } from '../../../core/config/camadas.config';
import { AtualizacaoService } from '../../../core/services/atualizacao.service';
import { FiltrosService } from '../../../core/services/filtros.service';
import { estaDefasada } from '../../../core/util/defasagem.util';
import { AtualizadoHaPipe } from '../../../shared/pipes/atualizado-ha.pipe';

@Component({
  selector: 'guarda-painel-camadas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="t-camadas">
      <h3 id="t-camadas">Camadas</h3>
      <ul class="lista">
        @for (c of camadas; track c.id) {
          <li>
            <button type="button" class="cam" role="switch" [attr.aria-checked]="filtros.camadaAtiva(c.id)" [class.ligada]="filtros.camadaAtiva(c.id)" [style.--cor]="c.cor" [title]="c.descricao" (click)="filtros.alternarCamada(c.id)">
              <span class="marca"></span><span class="nome">{{ c.nome }}</span>
            </button>
            <small class="fonte">{{ infoFonte(c.fonteId) }}</small>
            @if (c.id === 'queimadas' && filtros.camadaAtiva('queimadas')) {
              <div class="sats" role="group" aria-label="Satélites">
                @for (s of satelites; track s.id) {
                  <label class="sat"><input type="checkbox" [checked]="filtros.satelites().includes(s.id)" (change)="filtros.alternarSatelite(s.id)" /> {{ s.nome }}</label>
                }
              </div>
            }
          </li>
        }
      </ul>
    </section>
  `,
  styles: [`
    h3 { font-size: 13px; margin-bottom: 6px; }
    .lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .cam { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; background: #1b2430; border: 1px solid var(--borda); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    .cam.ligada { background: color-mix(in srgb, var(--cor) 30%, #1b2430); border-color: var(--cor); }
    .marca { width: 12px; height: 12px; border-radius: 50%; background: var(--cor); opacity: 0.45; }
    .ligada .marca { opacity: 1; }
    .fonte { display: block; color: var(--texto-suave); margin: 2px 2px 0; font-size: 11px; }
    .sats { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .sat { font-size: 12px; display: flex; align-items: center; gap: 4px; }
  `],
})
export class PainelCamadasComponent {
  protected readonly filtros = inject(FiltrosService);
  private readonly atualizacao = inject(AtualizacaoService);
  private readonly ha = new AtualizadoHaPipe();
  protected readonly camadas = CAMADAS;
  protected readonly satelites = SATELITES;

  protected infoFonte(fonteId: string): string {
    const f = this.atualizacao.fonteDe(fonteId);
    if (!f) return 'Verificando a fonte...';
    return f.nome + ' - ' + this.ha.transform(f.ultima_coleta_ok) + (estaDefasada(f) ? ' (defasado)' : '');
  }

  protected ligada(id: CamadaId): boolean {
    return this.filtros.camadaAtiva(id);
  }
}