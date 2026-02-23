import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OffresService } from '../service/offres.service';
import { AuthService } from '../../auth/auth.service';
import { ApplicationsService } from '../service/applications.service';
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
  applications: any[] = [];
  appMap: Map<number, any> = new Map();
  // Pagination
  currentPage = 1;
  pageSize = 10; 

  constructor(
    private offresService: OffresService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private applicationsService: ApplicationsService
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
            this.loadUserApplications();
            
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
        this.loadUserApplications();
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

  // Save notes locally (and in ApplicationsService storage)
  saveNotes(job: any) {
    if (!job || job.id == null) return;
    const app = this.appMap.get(job.id);
    if (app && app.id) {
      const updated = { ...app, notes: job._note || '' };
      this.applicationsService.update(app.id, updated).subscribe(res => {
        if (res) {
          this.appMap.set(job.id, res);
        }
      });
    } else {
      // if not existing on storage, create an application record for notes
      const user = this.auth.currentUser();
      if (!user) return;
      const newApp = {
        userId: user.id,
        offerId: job.id,
        title: job.name || '',
        company: job.company?.name || '',
        location: job.locations?.[0]?.name || '',
        url: job.refs?.landing_page || job.url || '',
        status: 'suivi',
        notes: job._note || '',
        dateAdded: new Date().toISOString()
      };
      this.applicationsService.create(newApp).subscribe(created => {
        this.applications.push(created);
        this.appMap.set(job.id, created);
      });
    }
  }

  unfollowOffer(job: any) {
    // remove follow locally and from storage
    const app = this.appMap.get(job.id);
    if (app && app.id) {
      this.applicationsService.delete(app.id).subscribe(() => {
        this.appMap.delete(job.id);
        this.applications = this.applications.filter(a => a.id !== app.id);
      });
    }
    this.suived.delete(job.id);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (this.suived.size) {
        window.localStorage.setItem('suivedJobs', JSON.stringify(Array.from(this.suived)));
      } else {
        window.localStorage.removeItem('suivedJobs');
      }
    }
    if (this.showFollowed) {
      this.jobs = this.jobs.filter(j => j.id !== job.id);
    }
  }

  followOffer(job: any) {
    const user = this.auth.currentUser();
    if (!user) {
      this.router.navigate(['/users/login']);
      return;
    }
    const existing = this.appMap.get(job.id);
    if (existing) return;
    const app = {
      userId: user.id,
      offerId: job.id,
      title: job.name || '',
      company: job.company?.name || '',
      location: job.locations?.[0]?.name || '',
      url: job.refs?.landing_page || job.url || '',
      status: 'suivi',
      notes: '',
      dateAdded: new Date().toISOString()
    };
    this.applicationsService.create(app).subscribe(created => {
      this.applications.push(created);
      this.appMap.set(job.id, created);
      this.suived.add(job.id);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('suivedJobs', JSON.stringify(Array.from(this.suived)));
      }
    });
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

  // Persist or create status for a followed job
  saveStatus(job: any) {
    if (!job || job.id == null) return;
    const app = this.appMap.get(job.id);
    const newStatus = job._status || (job._app && job._app.status) || 'en_attente';
    if (app && app.id) {
      const updated = { ...app, status: newStatus };
      this.applicationsService.update(app.id, updated).subscribe(res => {
        if (res) {
          this.appMap.set(job.id, res);
          job._app = res;
        }
      });
    } else {
      const user = this.auth.currentUser();
      if (!user) return;
      const newApp = {
        userId: user.id,
        offerId: job.id,
        title: job.name || '',
        company: job.company?.name || '',
        location: job.locations?.[0]?.name || '',
        url: job.refs?.landing_page || job.url || '',
        status: newStatus,
        notes: job._note || '',
        dateAdded: new Date().toISOString()
      };
      this.applicationsService.create(newApp).subscribe(created => {
        this.applications.push(created);
        this.appMap.set(job.id, created);
        job._app = created;
      });
    }
  }

  setStatus(job: any, status: string) {
    job._status = status;
    this.saveStatus(job);
  }

  displayStatus(status?: string): string {
    if (!status) return 'En attente';
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'suivi':
        return 'Suivi';
      case 'accepté':
      case 'accepted':
        return 'Accepté';
      case 'refusé':
      case 'rejected':
        return 'Refusé';
      default:
        return status;
    }
  }

  loadUserApplications() {
    const user = this.auth.currentUser();
    if (!user || user.id == null) return;
    this.applicationsService.getByUser(user.id).subscribe({
      next: (apps) => {
        this.applications = apps || [];
        this.appMap.clear();
        this.applications.forEach(a => {
          if (a && a.offerId != null) {
            this.appMap.set(a.offerId, a);
            this.suived.add(a.offerId);
            const job = this.jobs.find(j => j.id === a.offerId);
            if (job) {
              (job as any)._app = a;
              (job as any)._note = a.notes || '';
              (job as any)._status = a.status || 'en_attente';
            }
          }
        });
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('suivedJobs', JSON.stringify(Array.from(this.suived)));
        }
      },
      error: (e) => console.error('Failed to load user applications', e)
    });
  }
}
