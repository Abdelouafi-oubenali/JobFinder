import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('JobFinder');
  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);

  get currentUser() {
    return this.auth.currentUser();
  }

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  logout() {
    this.auth.logout();
  }
  authAction() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      // navigate to login
      try {
        this.router.navigate(['/users/login']);
      } catch (e) {
        try { (window as any).location.href = '/users/login'; } catch {}
      }
    }
  }
}
