import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SobreConteudoComponent } from './sobre-conteudo.component';

@Component({
  selector: 'guarda-sobre-page',
  imports: [SobreConteudoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="pg"><h1>Sobre o GUARDA</h1><guarda-sobre-conteudo /></div>`,
  styles: [`.pg { max-width: 820px; margin: 0 auto; padding: 20px 16px 40px; } h1 { margin-bottom: 14px; }`],
})
export class SobrePage {}