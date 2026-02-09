import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.base);
  }

  getByEmail(email: string): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.base}?email=${encodeURIComponent(email)}`);
  }

  create(user: AppUser): Observable<AppUser> {
    return this.http.post<AppUser>(this.base, user);
  }

  update(user: AppUser): Observable<AppUser> {
    if (!user.id) throw new Error('Missing user id');
    return this.http.put<AppUser>(`${this.base}/${user.id}`, user);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  login(email: string, password: string): Observable<AppUser | null> {
    return this.http
      .get<AppUser[]>(`${this.base}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
      .pipe(map(users => (users && users.length ? users[0] : null)));
  }
}
    