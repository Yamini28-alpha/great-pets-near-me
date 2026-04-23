import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private api: ApiService) {}

  createCustomerProfile(data: any) {
    return this.api.post('/customers', data);
  }

  getCustomers() {
    return this.api.get('/customers');
  }

  getCustomerById(id: string) {
    return this.api.get(`/customers/${id}`);
  }

  getMyCustomerProfile() {
    return this.api.get('/customers/my-profile');
  }

  updateCustomer(id: string, data: any) {
    return this.api.put(`/customers/${id}`, data);
  }

  updateMyCustomerProfile(data: any) {
    return this.api.put('/customers/my-profile', data);
  }

  deleteCustomer(id: string) {
    return this.api.delete(`/customers/${id}`);
  }
}