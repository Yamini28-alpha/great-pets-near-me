import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { StatsService, PublicStats } from '../../services/stats-service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage implements OnInit {
  stats: PublicStats = {
    availablePetsCount: 0,
    sheltersCount: 0,
    adoptionsCount: 0,
    totalPetsCount: 0
  };

  isLoading = true;

  constructor(
    private statsService: StatsService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.redirectToDashboard();
      return;
    }
    
    this.loadStats();
  }

  redirectToDashboard() {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser?.role === 'shelter_staff') {
      this.router.navigate(['/dashboard/shelter']);
    } else {
      this.router.navigate(['/dashboard/customer']);
    }
  }

  loadStats() {
    this.statsService.getPublicStats().subscribe({
      next: (stats: any) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
        this.stats = {
          availablePetsCount: 0,
          sheltersCount: 0,
          adoptionsCount: 0,
          totalPetsCount: 0
        };
      }
    });
  }

  getDashboardRoute(): string {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return '/dashboard/customer';
    return currentUser.role === 'shelter_staff' ? '/dashboard/shelter' : '/dashboard/customer';
  }
}