import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:900px;margin:0 auto;padding:1rem">
      <h2 *ngIf="name">Hello, {{ name }}</h2>
      <p *ngIf="!name">Redirecting to login...</p>
      <p>Welcome to JobFinder.</p>
      <p><a routerLink="/users/profile">Profile</a></p>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  name = '';

  ngOnInit() {
    const u = this.auth.currentUser();
    if (!u) {
      this.router.navigate(['/users/login']);
      return;
    }
    this.name = (u.firstName && u.firstName.trim()) || u.email || 'User';
  }
}
