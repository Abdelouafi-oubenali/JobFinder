import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  {
    path: 'users',
    loadChildren: () => import('./users/module/users.module').then(m => m.UsersModule)
  }
  ,
  {
    path: 'offres/favorites',
    loadComponent: () => import('./offres/offre/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'offres/:id',
    loadComponent: () => import('./offres/offre/detail-job.component').then(m => m.DetailJobComponent)
  },
  {
    path: 'offres',
    loadComponent: () => import('./offres/offre/offres.component').then(m => m.OffresComponent)
  }
];
