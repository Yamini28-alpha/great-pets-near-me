import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  showProfileModal = false;
  isUserDropdownOpen = false;
  isMobileMenuOpen = false;
  currentUser: User | null = null;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    this.currentUser = this.auth.getCurrentUser();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserDropdownOpen = false;
    }
    if (!target.closest('.mobile-menu-toggle') && !target.closest('.nav-links')) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  openProfileModal() {
    this.showProfileModal = true;
    this.isUserDropdownOpen = false;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  getInitials(): string {
    if (!this.currentUser?.username) return 'U';
    return this.currentUser.username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getUserRoleDisplay(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role === 'shelter_staff' ? 'Shelter Staff' : 'Customer';
  }

  getDashboardRoute(): string {
    if (!this.currentUser) return '/dashboard/customer';
    return this.currentUser.role === 'shelter_staff' ? '/dashboard/shelter' : '/dashboard/customer';
  }

  logout() {
    this.auth.logout();
    this.isUserDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.router.navigate(['/login']);
  }
}