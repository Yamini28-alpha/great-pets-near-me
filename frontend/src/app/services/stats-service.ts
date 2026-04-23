import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface PublicStats {
  availablePetsCount: number;
  sheltersCount: number;
  adoptionsCount: number;
  totalPetsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor(private api: ApiService) {}

  getPublicStats() {
    return this.api.get('/stats/public');
  }
}
