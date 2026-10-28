import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { MunicipioResumo } from '../../../core/models/api.models';
import { FiltrosService } from '../../../core/services/filtros.service';
import { MunicipiosService } from '../../../core/services/municipios.service';

@Component({
  selector: 'guarda-busca-municipio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="t-busca">
      <h3 id="t-busca">Município</h3>
      @if (filtros.municipio(); as m) {
        <div class="escolhido">
          <span>{{ m.nome }} - {{ m.uf }}</span>
          <button type="button" class="botao" (click)="filtros.escolherMunicipio(null)" aria-label="Remover filtro de município">Limpar</button>
        </div>
      } @else {
        <input type="search" placeholder="Buscar município (ex.: Lábrea)" [value]="termo()" (input)="digitar($event)" aria-label="Buscar município" autocomplete="off" />
        @if (buscando()) { <small class="suave">Buscando...</small> }
        @if (resultados().length > 0) {
          <ul class="resultados" role="listbox" aria-label="Municípios encontrados">
            @for (m of resultados(); track m.codigo) {
              <li><button type="button" role="option" (click)="escolher(m)">{{ m.nome }} <small>{{ m.uf }}</small></button></li>
            }
          </ul>
        }
      }
    </section>
  `,
  styles: [`
    h3 { font-size: 13px; margin-bottom: 6px; }
    input { width: 100%; background: #1b2430; border: 1px solid var(--borda); border-radius: 8px; padding: 6px 8px; }
    .escolhido { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .resultados { list-style: none; margin: 4px 0 0; padding: 0; max-height: 180px; overflow: auto; border: 1px solid var(--borda); border-radius: 8px; }
    .resultados button { width: 100%; text-align: left; background: none; border: 0; padding: 6px 10px; cursor: pointer; }
    .resultados button:hover { background: #1b2430; }
    .suave { color: var(--texto-suave); }
  `],
})
export class BuscaMunicipioComponent {
  private readonly servico = inject(MunicipiosService);
  protected readonly filtros = inject(FiltrosService);
  protected readonly termo = signal('');
  protected readonly resultados = signal<MunicipioResumo[]>([]);
  protected readonly buscando = signal(false);
  private readonly digitado$ = new Subject<string>();

  constructor() {
    this.digitado$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((t) => {
          if (t.trim().length < 2) return of<MunicipioResumo[]>([]);
          this.buscando.set(true);
          return this.servico.buscar(t, this.filtros.estado()).pipe(
            catchError(() => of<MunicipioResumo[]>([])),
            finalize(() => this.buscando.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((lista) => this.resultados.set(lista));
  }

  protected digitar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.termo.set(valor);
    this.digitado$.next(valor);
  }

  protected escolher(m: MunicipioResumo): void {
    this.filtros.escolherMunicipio(m);
    this.termo.set('');
    this.resultados.set([]);
  }
}