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
        console.log("user create avec ... ")
      })
    );
  }

  login(email: string, password: string): Observable<AppUser | null> {
    return this.users.login(email, password).pipe(
      map(user => {
        if (user) {
          const safe = { ...user } as any;
          delete safe.password;
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(this.storageKey, JSON.stringify(safe));
          }
          return safe;
        }
        return null;
      })
    );
  }
  

  logout() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(this.storageKey);
    }
    this.router.navigate(['/users/login']);
  }

  currentUser(): AppUser | null {
    if (typeof window === 'undefined') return null;
    const raw = (window.sessionStorage && window.sessionStorage.getItem(this.storageKey)) ||
      (window.localStorage && window.localStorage.getItem(this.storageKey));
    return raw ? (JSON.parse(raw) as AppUser) : null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
