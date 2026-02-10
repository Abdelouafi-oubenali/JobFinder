import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OffresService } from '../service/offres.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-detail-job',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-job.component.html'
})
export class DetailJobComponent implements OnInit {
  job: any = null;
  loading = true;
  error = '';
  favorites = new Set<number>();
  suived = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offresService: OffresService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('id');
    
    if (!jobId) {
      this.error = 'ID de l\'offre non trouvé';
      this.loading = false;
      return;
    }

    this.loadFavorites();
    this.loadFollowed();
    this.loadJob();
  }

  loadJob() {
    this.offresService.getJobs().subscribe({
      next: (res) => {
        const jobId = this.route.snapshot.paramMap.get('id');
        console.log('Searching for job ID:', jobId);
        console.log('Jobs received:', res.results?.length);
        
        this.job = res.results?.find((j: any) => {
          const idMatch = j.id.toString() === jobId || j.id === parseInt(jobId || '0');
          console.log('Job ID:', j.id, 'Match:', idMatch);
          return idMatch;
        });
        
        if (!this.job) {
          this.error = 'Offre non trouvée';
          console.error('Job not found for ID:', jobId);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'offre';
        console.error('Error loading job:', err);
        this.loading = false;
      }
    });
  }

  loadFavorites() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const favSaved = JSON.parse(window.localStorage.getItem('favoriteJobs') || '[]');
      this.favorites = new Set(favSaved);
    }
  }

  loadFollowed() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const suivSaved = JSON.parse(window.localStorage.getItem('suivedJobs') || '[]');
      this.suived = new Set(suivSaved);
    }
  }

  isFavorite(): boolean {
    return !!this.job && this.job.id != null && this.favorites.has(this.job.id);
  }

  isFollowed(): boolean {
    return !!this.job && this.job.id != null && this.suived.has(this.job.id);
  }

  toggleFavorite() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/users/login']);
      return;
    }
    if (!this.job || this.job.id == null) return;

    if (this.favorites.has(this.job.id)) {
      this.favorites.delete(this.job.id);
    } else {
      this.favorites.add(this.job.id);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(this.favorites)));
    }
  }

  apply() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/users/login']);
      return;
    }
    const url = this.job.refs?.landing_page || this.job.refs?.api || this.job.refs?.url || this.job.url;

    if (typeof window === 'undefined') return;

    this.suived.add(this.job.id);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('suivedJobs', JSON.stringify(Array.from(this.suived)));
    }

    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Aucun lien de candidature disponible pour cette offre.');
    }
  }

  goBack() {
    this.router.navigate(['/offres']);
  }
}
