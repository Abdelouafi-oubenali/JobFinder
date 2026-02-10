import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffresService {

  private apiUrl = 'https://www.themuse.com/api/public/jobs';

  constructor(private http: HttpClient) {}

  getJobs(page: number = 0): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?page=${page}&descending=true`
    );
  }
}   
