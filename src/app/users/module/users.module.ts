import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth.guard';

const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{
		path: 'login',
		loadComponent: () => import('./login.component').then(m => m.LoginComponent)
	},
	{
		path: 'register',
		loadComponent: () => import('./register.component').then(m => m.RegisterComponent)
	},
	{
		path: 'profile',
		loadComponent: () => import('./profile.component').then(m => m.ProfileComponent),
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [CommonModule, RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UsersModule {}
