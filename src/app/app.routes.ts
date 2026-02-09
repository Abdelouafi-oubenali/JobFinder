import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  {
    path: 'users',
    loadChildren: () => import('./users/module/users.module').then(m => m.UsersModule)
  }
];
