import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(url: string) {
    return this.http.get(`${this.apiUrl}${url}`, this.getHeaders());
  }

  post(url: string, data: any) {
    return this.http.post(`${this.apiUrl}${url}`, data, this.getHeaders());
  }

  put(url: string, data: any) {
    return this.http.put(`${this.apiUrl}${url}`, data, this.getHeaders());
  }

  delete(url: string) {
    return this.http.delete(`${this.apiUrl}${url}`, this.getHeaders());
  }

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }
}