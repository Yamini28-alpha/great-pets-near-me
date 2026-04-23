import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  constructor(private api: ApiService) {}

  getPets(filters?: any) {
    return this.api.get('/pets' + this.buildQueryParams(filters));
  }

  getPetById(id: string) {
    return this.api.get(`/pets/${id}`);
  }

  searchPets(query: string) {
    return this.api.get(`/pets/search?q=${query}`);
  }

  createPet(data: any) {
    return this.api.post('/pets', data);
  }

  getMyShelterPets() {
    return this.api.get('/pets/my-shelter/pets');
  }

  updatePet(id: string, data: any) {
    return this.api.put(`/pets/${id}`, data);
  }

  deletePet(id: string) {
    return this.api.delete(`/pets/${id}`);
  }

  private buildQueryParams(filters: any): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return '?' + params.toString();
  }
}