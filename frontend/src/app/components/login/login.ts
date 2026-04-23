import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  showPassword = false;
  error = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLoading) return;

    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.auth.login(this.credentials).subscribe({
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
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Login failed. Please check your credentials and try again.';
        
        this.credentials.password = '';
      }
    });
  }

  private showSuccessAnimation() {
    const loginBtn = document.querySelector('.login-btn') as HTMLElement;
    if (loginBtn) {
      loginBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
      loginBtn.innerHTML = '<span>Login Successful!</span>';
    }
  }
}