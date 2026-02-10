import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffresService } from '../service/offres.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offres-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html'
})
export class FavoritesComponent implements OnInit {
  jobs: any[] = [];
  loading = true;
  error = '';
  favorites = new Set<number>();

  constructor(
    private offresService: OffresService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const saved: number[] = (typeof window !== 'undefined' && window.localStorage)
      ? JSON.parse(window.localStorage.getItem('favoriteJobs') || '[]')
      : [];
    this.favorites = new Set(saved);

    this.offresService.getJobs().subscribe({
      next: (res) => {
        const all = res.results || [];
        this.jobs = all.filter((j: any) => j && j.id != null && this.favorites.has(j.id));
        this.jobs.forEach((j: any) => (j._expanded = false));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des offres favorites';
        this.loading = false;
      }
    });
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
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Aucun lien de candidature disponible pour cette offre.');
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
      // remove from displayed jobs
      this.jobs = this.jobs.filter(j => j.id !== job.id);
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
}
