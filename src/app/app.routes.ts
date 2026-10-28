import { Routes } from '@angular/router';

// Cada tela carrega sob demanda (lazy): o MapLibre so e baixado quando o mapa abre
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mapa' },
  { path: 'mapa', title: 'Mapa | GUARDA', loadComponent: () => import('./features/mapa/mapa.page').then((m) => m.MapaPage) },
  { path: 'painel', title: 'Painel | GUARDA', loadComponent: () => import('./features/painel/painel.page').then((m) => m.PainelPage) },
  { path: 'alertas', title: 'Alertas | GUARDA', loadComponent: () => import('./features/alertas/alertas.page').then((m) => m.AlertasPage) },
  { path: 'sobre', title: 'Sobre | GUARDA', loadComponent: () => import('./features/sobre/sobre.page').then((m) => m.SobrePage) },
  { path: '**', redirectTo: 'mapa' },
];