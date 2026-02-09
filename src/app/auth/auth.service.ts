import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { UsersService, AppUser } from '../users/service/users.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'currentUser';

  constructor(private users: UsersService, private router: Router) {}

  register(user: AppUser): Observable<AppUser> {
    return this.users.create(user).pipe(
      tap(u => {
        // do
      })
    );
  }

  login(email: string, password: string): Observable<AppUser | null> {
    return this.users.login(email, password).pipe(
      map(user => {
        if (user) {
          const safe = { ...user } as any;
          delete safe.password;
          sessionStorage.setItem(this.storageKey, JSON.stringify(safe));
          return safe;
        }
        return null;
      })
    );
  }
  

  logout() {
    sessionStorage.removeItem(this.storageKey);
    this.router.navigate(['/users/login']);
  }

  currentUser(): AppUser | null {
    const raw = sessionStorage.getItem(this.storageKey) || localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
