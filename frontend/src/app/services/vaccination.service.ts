import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class VaccinationService {
  constructor(private api: ApiService) {}

  createVaccination(data: any) {
    return this.api.post('/vaccinations', data);
  }

  getVaccinationsByPetId(petId: string) {
    return this.api.get(`/vaccinations/pet/${petId}`);
  }

  getShelterVaccinations() {
    return this.api.get('/vaccinations/shelter');
  }

  getUpcomingVaccinations() {
    return this.api.get('/vaccinations/upcoming');
  }

  getVaccinationById(id: string) {
    return this.api.get(`/vaccinations/${id}`);
  }

  updateVaccination(id: string, data: any) {
    return this.api.put(`/vaccinations/${id}`, data);
  }

  deleteVaccination(id: string) {
    return this.api.delete(`/vaccinations/${id}`);
  }
}