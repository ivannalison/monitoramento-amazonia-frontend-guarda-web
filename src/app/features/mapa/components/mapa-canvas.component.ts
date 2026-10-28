import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, OnDestroy, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { GeoJSONSource, Map as MapaMapLibre, MapMouseEvent } from 'maplibre-gl';
import { EMPTY, Observable, Subject, catchError, debounceTime, defer, finalize, merge, switchMap, tap } from 'rxjs';
import { CAMADAS, CAMADA_DA_FONTE, CamadaId } from '../../../core/config/camadas.config';
import { ColecaoGeo, MunicipioResumo, PontoGeo, PropsQueimada } from '../../../core/models/api.models';
import { AtualizacaoService } from '../../../core/services/atualizacao.service';
import { ContornosService } from '../../../core/services/contornos.service';
import { DadosMapaService } from '../../../core/services/dados-mapa.service';
import { FiltrosService } from '../../../core/services/filtros.service';
import { Caixa, caixaDeCoordenadas } from '../../../core/util/bbox.util';
import { ESTILO_BASE } from '../mapa.estilo';
import { CAMADA_DO_LAYER, IDS_CLIQUE, adicionarFontesECamadas, definirVisibilidadeCamada } from '../mapa.camadas';
import { Selecao, TITULOS } from '../popup.util';

@Component({
  selector: 'guarda-mapa-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #recipiente class="mapa" role="application" aria-label="Mapa interativo da Amazônia Legal"></div>
    <div class="chips" aria-live="polite">
      @if (carregando() > 0) { <span class="chip">Carregando dados...</span> }
      @if (filtros.camadaAtiva('queimadas') && totalQueimadas() > 0) { <span class="chip">Focos na tela: {{ totalQueimadas() }}</span> }
      @if (truncado()) { <span class="chip aviso">Mostrando os {{ limitePontos() }} focos mais intensos desta área. Aproxime o mapa para ver mais.</span> }
      @if (erroMapa(); as msg) { <span class="chip erro">{{ msg }}</span> }
    </div>
  `,
  styles: [`
    :host { display: block; position: absolute; inset: 0; }
    .mapa { position: absolute; inset: 0; }
    .chips { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none; z-index: 3; max-width: 92%; }
    .chip { background: rgba(15, 20, 27, 0.88); color: var(--texto); border: 1px solid var(--borda); border-radius: 999px; padding: 4px 12px; font-size: 12px; text-align: center; }
    .chip.aviso { border-color: var(--alerta); }
    .chip.erro { border-color: var(--erro); }
  `],
})
export class MapaCanvasComponent implements AfterViewInit, OnDestroy {
  protected readonly filtros = inject(FiltrosService);
  private readonly dados = inject(DadosMapaService);
  private readonly contornos = inject(ContornosService);
  private readonly atualizacao = inject(AtualizacaoService);
  private readonly zona = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipiente = viewChild.required<ElementRef<HTMLDivElement>>('recipiente');

  /** ISO: mostra so os focos ate este instante (linha do tempo das queimadas) */
  readonly limiteQueimadas = input<string | null>(null);
  /** hora da previsao de chuva (AAAA-MM-DDTHH:00); null = hora atual */
  readonly horaChuva = input<string | null>(null);
  readonly pontoSelecionado = output<Selecao>();
  readonly estadoClicado = output<string>();

  protected readonly carregando = signal(0);
  protected readonly truncado = signal(false);
  protected readonly limitePontos = signal(0);
  protected readonly totalQueimadas = signal(0);
  protected readonly erroMapa = signal<string | null>(null);
  private readonly pronto = signal(false);

  private mapa?: MapaMapLibre;
  private todasQueimadas: PontoGeo<PropsQueimada>[] = [];
  private contornosEstados: ColecaoGeo | null = null;
  private readonly areaMudou$ = new Subject<void>();
  private chaveEnquadre = '';
  private municipioDesenhado = '';
  private temporizador = 0;
  private fase = 0;
  private observador?: ResizeObserver;

  constructor() {
    this.areaMudou$
      .pipe(
        debounceTime(350),
        switchMap(() => merge(this.carregarQueimadas(), this.carregarDesmatamento())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    effect(() => {
      if (!this.pronto()) return;
      const ativas = this.filtros.camadasAtivas();
      const estado = this.filtros.estado();
      const horas = this.filtros.horas();
      const sats = this.filtros.satelites();
      const municipio = this.filtros.municipio();
      untracked(() => this.sincronizar(ativas, estado, horas, sats, municipio));
    });
    effect(() => {
      this.limiteQueimadas();
      if (!this.pronto()) return;
      untracked(() => this.aplicarQueimadas());
    });
    effect(() => {
      const hora = this.horaChuva();
      if (!this.pronto()) return;
      untracked(() => this.carregarChuva(hora).subscribe());
    });
    this.atualizacao.mudancas$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ids) => this.aoMudarFontes(ids));
  }

  ngAfterViewInit(): void {
    void this.iniciarMapa();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
    this.observador?.disconnect();
    this.mapa?.remove();
  }

  private async iniciarMapa(): Promise<void> {
    try {
      const modulo = await import('maplibre-gl');
      const candidato = (modulo as unknown as { default?: typeof modulo }).default;
      const lib = candidato && candidato.Map ? candidato : modulo;
      const mapa = new lib.Map({
        container: this.recipiente().nativeElement,
        style: ESTILO_BASE,
        center: [-60, -5],
        zoom: 4.2,
        minZoom: 3,
        maxZoom: 14,
        attributionControl: { compact: true },
      });
      this.mapa = mapa;
      mapa.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right');
      mapa.addControl(new lib.ScaleControl({ unit: 'metric' }), 'bottom-left');
      mapa.on('load', () => this.aoCarregar());
      mapa.on('moveend', () => this.areaMudou$.next());
      mapa.on('click', (e) => this.aoClicar(e));
      this.observador = new ResizeObserver(() => mapa.resize());
      this.observador.observe(this.recipiente().nativeElement);
    } catch {
      this.erroMapa.set('Não foi possível iniciar o mapa neste navegador (WebGL indisponível?).');
    }
  }

  private aoCarregar(): void {
    const mapa = this.mapa;
    if (!mapa) return;
    adicionarFontesECamadas(mapa);
    for (const id of IDS_CLIQUE) {
      mapa.on('mouseenter', id, () => (mapa.getCanvas().style.cursor = 'pointer'));
      mapa.on('mouseleave', id, () => (mapa.getCanvas().style.cursor = ''));
    }
    this.contornos.estados().pipe(catchError(() => EMPTY), takeUntilDestroyed(this.destroyRef)).subscribe((geo) => {
      this.contornosEstados = geo;
      this.definirDados('estados', geo);
      this.tentarEnquadrar(this.filtros.estado(), this.filtros.municipio());
    });
    this.pronto.set(true);
    this.zona.runOutsideAngular(() => this.animar());
  }

  private aoClicar(e: MapMouseEvent): void {
    const mapa = this.mapa;
    if (!mapa) return;
    const f = mapa.queryRenderedFeatures(e.point, { layers: IDS_CLIQUE })[0];
    if (f) {
      const layerId = f.layer.id;
      const coords = (f.geometry as unknown as { coordinates: [number, number] }).coordinates;
      if (layerId === 'queimadas-clusters') {
        mapa.easeTo({ center: coords, zoom: Math.min(mapa.getZoom() + 2.5, 14) });
        return;
      }
      const camada = CAMADA_DO_LAYER[layerId];
      if (!camada) return;
      this.pontoSelecionado.emit({ camada, titulo: TITULOS[camada], propriedades: (f.properties ?? {}) as Record<string, unknown> });
      return;
    }
    const sigla = mapa.queryRenderedFeatures(e.point, { layers: ['estados-fill'] })[0]?.properties?.['sigla'];
    if (typeof sigla === 'string') this.estadoClicado.emit(sigla);
  }

  private sincronizar(ativas: CamadaId[], estado: string | null, horas: number, sats: string[], municipio: MunicipioResumo | null): void {
    const mapa = this.mapa;
    if (!mapa) return;
    for (const c of CAMADAS) definirVisibilidadeCamada(mapa, c.id, ativas.includes(c.id));
    mapa.setFilter('estados-destaque', ['==', ['get', 'sigla'], estado ?? ''] as never);
    this.desenharMunicipio(municipio);
    this.tentarEnquadrar(estado, municipio);
    this.areaMudou$.next();
    if (ativas.includes('ar')) this.carregarAr().subscribe();
    if (ativas.includes('chuva')) this.carregarChuva(this.horaChuva()).subscribe();
    if (ativas.includes('cheias')) this.carregarCheias().subscribe();
  }

  private tentarEnquadrar(estado: string | null, municipio: MunicipioResumo | null): void {
    const mapa = this.mapa;
    if (!mapa) return;
    const chave = municipio?.codigo ?? estado ?? '';
    if (chave === this.chaveEnquadre) return;
    let caixa: Caixa | null = null;
    if (municipio) {
      caixa = municipio.bbox;
    } else if (estado) {
      if (!this.contornosEstados) return;
      const f = this.contornosEstados.features.find((x) => x.properties['sigla'] === estado);
      caixa = f ? caixaDeCoordenadas(f.geometry.coordinates) : null;
    } else {
      caixa = [-74, -18, -44, 6];
    }
    this.chaveEnquadre = chave;
    if (!caixa) return;
    mapa.fitBounds([[caixa[0], caixa[1]], [caixa[2], caixa[3]]], { padding: 40, maxZoom: 11, duration: 800 });
  }

  private desenharMunicipio(municipio: MunicipioResumo | null): void {
    const codigo = municipio?.codigo ?? '';
    if (codigo === this.municipioDesenhado) return;
    this.municipioDesenhado = codigo;
    if (!municipio) {
      this.definirDados('municipio-sel', { type: 'FeatureCollection', features: [] });
      return;
    }
    this.contornos.municipio(municipio.codigo).pipe(catchError(() => EMPTY), takeUntilDestroyed(this.destroyRef)).subscribe((geo) => this.definirDados('municipio-sel', geo));
  }

  private bboxAtual(): string | null {
    const mapa = this.mapa;
    if (!mapa) return null;
    const b = mapa.getBounds();
    const w = Math.max(-180, b.getWest());
    const s = Math.max(-90, b.getSouth());
    const e = Math.min(180, b.getEast());
    const n = Math.min(90, b.getNorth());
    return [w, s, e, n].map((v) => v.toFixed(4)).join(',');
  }

  private rastrear<T>(origem: Observable<T>): Observable<T> {
    return defer(() => {
      this.carregando.update((n) => n + 1);
      return origem.pipe(finalize(() => this.carregando.update((n) => Math.max(0, n - 1))));
    });
  }

  private carregarQueimadas(): Observable<unknown> {
    if (!this.mapa || !this.filtros.camadaAtiva('queimadas')) return EMPTY;
    const sats = this.filtros.satelites();
    if (sats.length === 0) {
      this.todasQueimadas = [];
      this.truncado.set(false);
      this.aplicarQueimadas();
      return EMPTY;
    }
    const limite = window.innerWidth < 720 ? 2000 : 5000;
    const municipio = this.filtros.municipio();
    return this.rastrear(
      this.dados.queimadas({
        bbox: municipio ? null : this.bboxAtual(),
        estado: this.filtros.estado(),
        municipio_codigo: municipio?.codigo ?? null,
        horas: this.filtros.horas(),
        satelite: sats.length === 1 ? sats[0] : null,
        limite,
      }),
    ).pipe(
      tap((r) => {
        this.todasQueimadas = r.features;
        this.truncado.set(r.truncado === true);
        this.limitePontos.set(r.limite ?? limite);
        this.aplicarQueimadas();
      }),
      catchError(() => EMPTY),
    );
  }

  private aplicarQueimadas(): void {
    const fonte = this.mapa?.getSource('queimadas') as GeoJSONSource | undefined;
    if (!fonte) return;
    const sats = this.filtros.satelites();
    const limite = this.limiteQueimadas();
    const visiveis = this.todasQueimadas.filter((f) => sats.includes(f.properties.satelite) && (!limite || f.properties.data <= limite));
    this.totalQueimadas.set(visiveis.length);
    fonte.setData({ type: 'FeatureCollection', features: visiveis } as never);
  }

  private carregarDesmatamento(): Observable<unknown> {
    if (!this.mapa || !this.filtros.camadaAtiva('desmatamento')) return EMPTY;
    const municipio = this.filtros.municipio();
    return this.rastrear(
      this.dados.desmatamento({ bbox: municipio ? null : this.bboxAtual(), estado: this.filtros.estado(), municipio: municipio?.nome ?? null, limite: window.innerWidth < 720 ? 2000 : 5000 }),
    ).pipe(
      tap((r) => this.definirDados('desmatamento', r)),
      catchError(() => EMPTY),
    );
  }

  private carregarAr(): Observable<unknown> {
    return this.rastrear(this.dados.ar(this.filtros.estado())).pipe(tap((r) => this.definirDados('ar', r)), catchError(() => EMPTY));
  }

  private carregarChuva(hora: string | null): Observable<unknown> {
    if (!this.mapa || !this.filtros.camadaAtiva('chuva')) return EMPTY;
    return this.rastrear(this.dados.chuva(hora, this.filtros.estado())).pipe(tap((r) => this.definirDados('chuva', r)), catchError(() => EMPTY));
  }

  private carregarCheias(): Observable<unknown> {
    return this.rastrear(this.dados.cheias(this.filtros.estado())).pipe(tap((r) => this.definirDados('cheias', r)), catchError(() => EMPTY));
  }

  private definirDados(id: string, dados: unknown): void {
    (this.mapa?.getSource(id) as GeoJSONSource | undefined)?.setData(dados as never);
  }

  private aoMudarFontes(ids: string[]): void {
    if (!this.pronto()) return;
    const camadas = ids.map((id) => CAMADA_DA_FONTE[id]).filter((c): c is CamadaId => !!c);
    if (camadas.includes('queimadas') || camadas.includes('desmatamento')) this.areaMudou$.next();
    if (camadas.includes('ar') && this.filtros.camadaAtiva('ar')) this.carregarAr().subscribe();
    if (camadas.includes('chuva')) this.carregarChuva(this.horaChuva()).subscribe();
    if (camadas.includes('cheias') && this.filtros.camadaAtiva('cheias')) this.carregarCheias().subscribe();
  }

  // Focos "pulsando": o halo muda de opacidade (desligado se o usuario pediu menos movimento)
  private animar = (): void => {
    const mapa = this.mapa;
    const reduzir = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (mapa && !reduzir && this.filtros.camadaAtiva('queimadas') && !mapa.isMoving() && mapa.getLayer('queimadas-halo')) {
      this.fase = (this.fase + 0.25) % (Math.PI * 2);
      mapa.setPaintProperty('queimadas-halo', 'circle-opacity', 0.16 + 0.24 * (0.5 + 0.5 * Math.sin(this.fase)));
    }
    this.temporizador = window.setTimeout(this.animar, 160);
  };
}