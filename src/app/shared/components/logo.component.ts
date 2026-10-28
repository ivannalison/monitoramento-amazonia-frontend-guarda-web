import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'guarda-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 64 64" role="img" aria-label="Logo do GUARDA: olho de onça" fill="none">
      <ellipse cx="32" cy="32" rx="28" ry="17" stroke="currentColor" stroke-width="3" />
      <circle cx="32" cy="32" r="11" fill="currentColor" fill-opacity="0.35" />
      <ellipse cx="32" cy="32" rx="3.2" ry="10" fill="currentColor" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
      <circle cx="52" cy="20" r="2" fill="currentColor" />
      <circle cx="18" cy="48" r="1.6" fill="currentColor" />
      <circle cx="46" cy="48" r="1.6" fill="currentColor" />
    </svg>
  `,
  styles: [':host { display: inline-flex; color: #fff; }'],
})
export class LogoComponent {
  readonly tamanho = input(32);
}