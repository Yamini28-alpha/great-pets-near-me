import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'shelter_staff'
  };

  showPassword = false;
  agreeToTerms = false;
  error = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  selectRole(role: 'customer' | 'shelter_staff') {
    this.userData.role = role;
  }

  getPasswordStrength(): string {
    const password = this.userData.password;
    if (!password) return '';

    let strength = 0;
    
    if (password.length >= 8) strength++;
    
    if (/[a-z]/.test(password)) strength++;
    
    if (/[A-Z]/.test(password)) strength++;
    
    if (/[0-9]/.test(password)) strength++;
    
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthPercentage(): number {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
      default: return 0;
    }
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  }

  onSubmit() {
    if (this.isLoading) return;

    if (!this.userData.username || !this.userData.email || !this.userData.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (!this.agreeToTerms) {
      this.error = 'Please agree to the terms and conditions';
      return;
    }

    const strength = this.getPasswordStrength();
    if (strength === 'weak') {
      this.error = 'Please choose a stronger password (at least 8 characters with mix of letters, numbers, and symbols)';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.auth.register(this.userData).subscribe({
      next: (response: any) => {
        this.auth.setUserData(response.token, response.user);
        this.isLoading = false;

        this.showSuccessAnimation();

        setTimeout(() => {
          const currentUser = this.auth.getCurrentUser();
          if (currentUser?.role === 'shelter_staff') {
            this.router.navigate(['/dashboard/shelter']);
          } else {
            this.router.navigate(['/dashboard/customer']);
          }
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.userData.password = '';
      }
    });
  }

  private showSuccessAnimation() {
    const registerBtn = document.querySelector('.register-btn') as HTMLElement;
    if (registerBtn) {
      registerBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
      registerBtn.innerHTML = '<span>Account Created!</span>';
    }
  }
}