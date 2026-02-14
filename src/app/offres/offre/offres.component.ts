import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OffresService } from '../service/offres.service';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './offres.component.html'
})
export class OffresComponent implements OnInit {

  jobs: any[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  favorites = new Set<number>();
  suived = new Set<number>();
  showFollowed = false;
  // Pagination
  currentPage = 1;
  pageSize = 10; 

  constructor(
    private offresService: OffresService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    try {
      const followed = this.route.snapshot.queryParamMap.get('followed');
      if (followed === 'true') this.showFollowed = true;
    } catch (e) {
    }
    this.loadAndPrepareJobs();
  }

  private loadAndPrepareJobs(page: number = 0) {
    this.loading = true;
    this.offresService.getJobs(page).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (res) => {
        this.jobs = res.results || [];
        this.sortJobsByDateDesc(this.jobs);

        const favSaved: number[] = (typeof window !== 'undefined' && window.localStorage)
          ? JSON.parse(window.localStorage.getItem('favoriteJobs') || '[]')
          : [];
        this.favorites = new Set(favSaved);
        const suivSaved: number[] = (typeof window !== 'undefined' && window.localStorage)
          ? JSON.parse(window.localStorage.getItem('suivedJobs') || '[]')
          : [];
        this.suived = new Set(suivSaved);
          this.currentPage = 1;
          this.jobs.forEach((j: any) => (j._expanded = false));
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.error = 'Erreur lors du chargement des offres';
      }
    });
  }


  search() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    this.loading = true;
    this.offresService.getJobs().pipe(finalize(() => (this.loading = false))).subscribe({
      next: (res) => {
        let list: any[] = res.results || [];
        if (term) {
          list = list.filter(j => (j.name || '').toLowerCase().includes(term));
        }
        this.sortJobsByDateDesc(list);
        this.jobs = list;
          this.currentPage = 1;
        this.jobs.forEach((j: any) => (j._expanded = false));
      },
      error: (err) => {
        console.error('Error searching jobs:', err);
        this.error = 'Erreur lors du chargement des offres';
      }
    });
  }

  private sortJobsByDateDesc(list: any[]) {
    list.sort((a: any, b: any) => {
      const dateA = this.extractDate(a);
      const dateB = this.extractDate(b);
      return dateB - dateA;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.jobs || []).length / this.pageSize));
  }

  get pagedJobs(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return (this.jobs || []).slice(start, start + this.pageSize);
  }

  goToPage(n: number) {
    if (n < 1) n = 1;
    if (n > this.totalPages) n = this.totalPages;
    this.currentPage = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private extractDate(job: any): number {
    const possible = [job.publication_date, job.publication_date_ts, job.created_at, job.date, job.publicationDate, job.updated_at];
    for (const p of possible) {
      if (!p) continue;
      const parsed = Date.parse(p);
      if (!isNaN(parsed)) return parsed;
      if (typeof p === 'number') return p;
    }
    return 0;
  }

  showDetails(job: any) {
    job._expanded = !job._expanded;
  }

  apply(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/users/login']);
      return;
    }
    const url = job.refs?.landing_page || job.refs?.api || job.refs?.url || job.url;

    if (typeof window === 'undefined') return;

    this.suived.add(job.id);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('suivedJobs', JSON.stringify(Array.from(this.suived)));
    }

    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Aucun lien de candidature disponible pour cette offre.');
    }
  }

   deleteJob(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/users/login']);
      return;
    }
    if (!job || job.id == null) return;
    this.suived.delete(job.id);

    if (typeof window !== 'undefined' && window.localStorage) {
      if (this.suived.size) {
        window.localStorage.setItem('suivedJobs', JSON.stringify(Array.from(this.suived)));
      } else {
        window.localStorage.removeItem('suivedJobs');
      }
    }

    this.suived = new Set(Array.from(this.suived));

    if (this.showFollowed) {
      this.jobs = this.jobs.filter(j => j.id !== job.id);
    }
  }

  toggleFavorite(job: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/users/login']);
      return;
    }
    if (!job || job.id == null) return;
    if (this.favorites.has(job.id)) {
      this.favorites.delete(job.id);
    } else {
      this.favorites.add(job.id);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(this.favorites)));
    }
  }

 

  isFavorite(job: any): boolean {
    return !!job && job.id != null && this.favorites.has(job.id);
  }

  get followedJobs(): any[] {
    return this.jobs.filter(j => j && j.id != null && this.suived.has(j.id));
  }

  toggleShowFollowed() {
    this.showFollowed = !this.showFollowed;
  }
}
