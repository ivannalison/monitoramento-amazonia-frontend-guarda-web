import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AtualizacaoService } from './core/services/atualizacao.service';
import { SobreConteudoComponent } from './features/sobre/sobre-conteudo.component';
import { CabecalhoComponent } from './layout/cabecalho.component';
import { ModalComponent } from './shared/components/modal.component';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'guarda-root',
  imports: [RouterOutlet, CabecalhoComponent, ToastComponent, ModalComponent, SobreConteudoComponent],
  template: `
    <guarda-cabecalho (abrirSobre)="sobreAberto.set(true)" />
    <main><router-outlet /></main>
    <guarda-toast />
    <guarda-modal titulo="Sobre o GUARDA" [aberto]="sobreAberto()" (fechar)="sobreAberto.set(false)">
      <guarda-sobre-conteudo />
    </guarda-modal>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100dvh; }
    main { flex: 1; min-height: 0; position: relative; overflow: auto; }
  `],
})
export class App implements OnInit {
  private readonly atualizacao = inject(AtualizacaoService);
  protected readonly sobreAberto = signal(false);

  ngOnInit(): void {
    this.atualizacao.iniciar();
  }
}