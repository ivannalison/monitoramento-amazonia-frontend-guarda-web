import { Routes } from '@angular/router';

// Uma tela so. Ela carrega sob demanda: o MapLibre so e baixado quando o mapa abre
export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'GUARDA | Monitoramento da Amazônia', loadComponent: () => import('./features/mapa/mapa.page').then((m) => m.MapaPage) },
  { path: '**', redirectTo: '' },
];