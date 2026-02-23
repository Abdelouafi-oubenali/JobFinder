import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private storageKey = 'applications';

  private readAll(): any[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      return JSON.parse(window.localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  private writeAll(list: any[]) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  getByUser(userId: number): Observable<any[]> {
    const all = this.readAll().filter(a => a.userId === userId);
    return of(all);
  }

  getByUserAndOffer(userId: number, offerId: number): Observable<any[]> {
    const all = this.readAll().filter(a => a.userId === userId && a.offerId === offerId);
    return of(all);
  }

  create(app: any): Observable<any> {
    const all = this.readAll();
    const id = Date.now();
    const created = { ...app, id };
    all.push(created);
    this.writeAll(all);
    return of(created);
  }

  update(id: number, app: any): Observable<any> {
    const all = this.readAll();
    const idx = all.findIndex(a => a.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...app };
      this.writeAll(all);
      return of(all[idx]);
    }
    return of(null as any);
  }

  delete(id: number): Observable<any> {
    let all = this.readAll();
    all = all.filter(a => a.id !== id);
    this.writeAll(all);
    return of({});
  }
}
