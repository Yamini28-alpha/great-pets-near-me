import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'shelter_staff' | 'customer';
  shelterId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    this.checkToken();
  }

  register(userData: { username: string; email: string; password: string; role: string }) {
    return this.api.post('/auth/register', userData);
  }

  login(credentials: { email: string; password: string }) {
    return this.api.post('/auth/login', credentials);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  setUserData(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}