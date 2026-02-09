import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffresService } from '../service/offres.service';

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offres.component.html'
})
export class OffresComponent implements OnInit {

  jobs: any[] = [];
  loading = true;
  error = '';

  constructor(private offresService: OffresService) {}

  ngOnInit() {
    this.offresService.getJobs().subscribe({
      next: (res) => {
        this.jobs = res.results;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des offres';
        this.loading = false;
      }
    });
  }
}
