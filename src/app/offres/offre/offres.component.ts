import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OffresService } from '../service/offres.service';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offres.component.html'
})
export class OffresComponent implements OnInit {

  jobs: any[] = [];
  loading = true;
  error = '';
  favorites = new Set<number>();
  suived = new Set<number>();
  showFollowed = false;

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
    this.offresService.getJobs().subscribe({
      next: (res) => {
        this.jobs = res.results || [];
        const favSaved: number[] = (typeof window !== 'undefined' && window.localStorage)
          ? JSON.parse(window.localStorage.getItem('favoriteJobs') || '[]')
          : [];
        this.favorites = new Set(favSaved);
        const suivSaved: number[] = (typeof window !== 'undefined' && window.localStorage)
          ? JSON.parse(window.localStorage.getItem('suivedJobs') || '[]')
          : [];
        this.suived = new Set(suivSaved);
        this.jobs.forEach((j: any) => (j._expanded = false));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des offres';
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
