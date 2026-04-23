import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      const currentUser = this.auth.getCurrentUser();
      if (currentUser?.role === 'shelter_staff') {
        this.router.navigate(['/dashboard/shelter']);
      } else {
        this.router.navigate(['/dashboard/customer']);
      }
      return false;
    }
    
    return true;
  }
}