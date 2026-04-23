import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ShelterService {
  constructor(private api: ApiService) {}

  createShelter(data: any) {
    return this.api.post('/shelters', data);
  }

  getShelters() {
    return this.api.get('/shelters');
  }

  getShelterById(id: string) {
    return this.api.get(`/shelters/${id}`);
  }

  getMyShelter() {
    return this.api.get('/shelters/my-shelter');
  }

  updateShelter(id: string, data: any) {
    return this.api.put(`/shelters/${id}`, data);
  }

  deleteShelter(id: string) {
    return this.api.delete(`/shelters/${id}`);
  }
}