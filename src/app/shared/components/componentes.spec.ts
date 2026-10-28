import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GraficoBarrasComponent } from './grafico-barras.component';
import { ModalComponent } from './modal.component';

@Component({
  imports: [ModalComponent],
  template: `<guarda-modal titulo="Teste" [aberto]="aberto" (fechar)="fechou = true">conteudo do modal</guarda-modal>`,
})
class HospedeiroModal {
  aberto = false;
  fechou = false;
}

describe('GraficoBarrasComponent', () => {
  it('desenha uma barra por item', () => {
    const fixture = TestBed.createComponent(GraficoBarrasComponent);
    fixture.componentRef.setInput('titulo', 'Focos por estado');
    fixture.componentRef.setInput('dados', [{ rotulo: 'PA', valor: 10 }, { rotulo: 'MA', valor: 5 }]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.barra').length).toBe(2);
    expect(el.textContent).toContain('PA');
  });

  it('avisa quando nao ha dados', () => {
    const fixture = TestBed.createComponent(GraficoBarrasComponent);
    fixture.componentRef.setInput('titulo', 'Vazio');
    fixture.componentRef.setInput('dados', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sem dados');
  });
});

describe('ModalComponent', () => {
  it('mostra o conteudo so quando aberto e emite fechar', () => {
    const fixture = TestBed.createComponent(HospedeiroModal);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.modal')).toBeNull();
    fixture.componentInstance.aberto = true;
    fixture.detectChanges();
    expect(el.querySelector('.modal')).not.toBeNull();
    (el.querySelector('button.x') as HTMLButtonElement).click();
    expect(fixture.componentInstance.fechou).toBeTrue();
  });
});