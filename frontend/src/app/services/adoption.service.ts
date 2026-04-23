import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {
  constructor(private api: ApiService) {}

  createAdoption(data: any) {
    return this.api.post('/adoptions', data);
  }

  getShelterAdoptions(status?: string) {
    const url = status ? `/adoptions/shelter?status=${status}` : '/adoptions/shelter';
    return this.api.get(url);
  }

  getMyAdoptions() {
    return this.api.get('/adoptions/my-applications');
  }

  getAdoptionById(id: string) {
    return this.api.get(`/adoptions/${id}`);
  }

  updateAdoption(id: string, data: any) {
    return this.api.put(`/adoptions/${id}`, data);
  }

  cancelAdoption(id: string) {
    return this.api.delete(`/adoptions/${id}/cancel`);
  }

  getAdoptionStats() {
    return this.api.get('/adoptions/stats');
  }
  
  deleteAdoption(id: string) {
    return this.api.delete(`/adoptions/${id}`);
  }
}