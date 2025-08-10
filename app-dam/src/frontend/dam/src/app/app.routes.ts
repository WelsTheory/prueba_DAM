import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'dispositivo',
    loadComponent: () => import('./dispositivos/dispositivo.page').then( m => m.DispositivoPage)
  },
  {
    path: 'dispositivo/:id',
    loadComponent: () =>
      import('./dispositivos/dispositivo.page').then((m) => m.DispositivoPage),
  },
  {
    path: 'dispositivo/:id/mediciones',
    loadComponent: () =>
      import('./mediciones/mediciones.page').then((m) => m.MedicionesPage),
  },
  
];
