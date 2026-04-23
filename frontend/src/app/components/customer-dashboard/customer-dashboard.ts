import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { AdoptionService } from '../../services/adoption.service';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';
import { YouTubeService } from '../../services/youtube';
import { YouTubePlayer } from '../youtube-player/youtube-player';

interface Pet {
  _id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  species: string;
  adoptionStatus: string;
  description: string;
  youtubeVideoId: string;
  shelterId: any;
}

interface Adoption {
  _id: string;
  petId: Pet;
  customerId: any;
  shelterId: any;
  status: string;
  adoptionDate: string;
  notes: string;
  createdAt: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface YouTubeVideoInfo {
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, YouTubePlayer],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard implements OnInit {
  customerProfile: Customer | null = null;
  customerAdoptions: Adoption[] = [];
  availablePets: Pet[] = [];
  showCustomerProfileModal = false;
  showApplyAdoptionModal = false;
  showPetDetailsModal = false;
  customerForm: any = {};
  selectedPetForAdoption: Pet | null = null;
  selectedPetForDetails: Pet | null = null;
  youtubeVideoInfo: YouTubeVideoInfo | null = null;
  isLoading = true;
  isLoadingYouTube = false;

  constructor(
    private customerService: CustomerService,
    private adoptionService: AdoptionService,
    private petService: PetService,
    private youtubeService: YouTubeService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCustomerData();
  }

  loadCustomerData() {
    this.isLoading = true;
    this.customerService.getMyCustomerProfile().subscribe({
      next: (profile: any) => {
        this.customerProfile = profile;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Customer profile error:', error);
        this.customerProfile = null;
        this.checkLoadingComplete();
      }
    });

    this.adoptionService.getMyAdoptions().subscribe({
      next: (adoptions: any) => {
        this.customerAdoptions = adoptions || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Adoptions error:', error);
        this.customerAdoptions = [];
        this.checkLoadingComplete();
      }
    });

    this.petService.getPets({ adoptionStatus: 'available' }).subscribe({
      next: (pets: any) => {
        this.availablePets = pets || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Pets error:', error);
        this.availablePets = [];
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete() {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  openCustomerProfileModal() {
    this.customerForm = this.customerProfile ? { ...this.customerProfile } : {};
    this.showCustomerProfileModal = true;
  }

  saveCustomerProfile() {
    if (this.customerProfile?._id) {
      this.customerService.updateMyCustomerProfile(this.customerForm).subscribe({
        next: () => {
          this.loadCustomerData();
          this.showCustomerProfileModal = false;
        },
        error: (error) => {
          console.error('Update profile error:', error);
          alert('Error updating profile: ' + (error.error?.message || 'Unknown error'));
        }
      });
    } else {
      this.customerService.createCustomerProfile(this.customerForm).subscribe({
        next: () => {
          this.loadCustomerData();
          this.showCustomerProfileModal = false;
        },
        error: (error) => {
          console.error('Create profile error:', error);
          alert('Error creating profile: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  deleteCustomerProfile() {
    if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      this.customerService.deleteCustomer(this.customerProfile!._id).subscribe({
        next: () => {
          alert('Profile deleted successfully');
          this.customerProfile = null;
          this.auth.logout();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Delete profile error:', error);
          alert('Error deleting profile: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  openApplyAdoptionModal(pet: Pet) {
    if (!this.customerProfile) {
      alert('Please complete your profile before applying for adoption.');
      this.openCustomerProfileModal();
      return;
    }
    
    this.selectedPetForAdoption = pet;
    this.showApplyAdoptionModal = true;
  }

  applyForAdoption() {
    if (this.selectedPetForAdoption) {
      const adoptionData = {
        petId: this.selectedPetForAdoption._id,
        notes: 'Interested in adopting this wonderful pet!'
      };

      this.adoptionService.createAdoption(adoptionData).subscribe({
        next: () => {
          this.loadCustomerData();
          this.showApplyAdoptionModal = false;
          alert('Adoption application submitted successfully!');
        },
        error: (error) => {
          console.error('Adoption application error:', error);
          alert('Error submitting application: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  viewPetDetails(pet: Pet) {
    this.selectedPetForDetails = pet;
    this.youtubeVideoInfo = null;
    
    if (pet.youtubeVideoId) {
      this.isLoadingYouTube = true;
      this.youtubeService.getPetWithYouTubeInfo(pet._id).subscribe({
        next: (petData: any) => {
          this.youtubeVideoInfo = petData.youtubeInfo || null;
          this.isLoadingYouTube = false;
        },
        error: (error) => {
          console.error('YouTube info error:', error);
          this.isLoadingYouTube = false;
        }
      });
    }
    
    this.showPetDetailsModal = true;
  }

  viewApplicationDetails(adoption: Adoption) {
    alert(`Application Details:\nPet: ${adoption.petId.name}\nStatus: ${adoption.status}\nApplied: ${new Date(adoption.createdAt).toLocaleDateString()}`);
  }

  cancelAdoption(adoption: Adoption) {
    if (confirm('Are you sure you want to cancel this adoption application?')) {
      this.adoptionService.cancelAdoption(adoption._id).subscribe({
        next: () => {
          this.loadCustomerData();
          alert('Adoption application cancelled successfully.');
        },
        error: (error) => {
          console.error('Cancel adoption error:', error);
          alert('Error cancelling application: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  closeModal() {
    this.showCustomerProfileModal = false;
    this.showApplyAdoptionModal = false;
    this.showPetDetailsModal = false;
    this.selectedPetForAdoption = null;
    this.selectedPetForDetails = null;
    this.youtubeVideoInfo = null;
  }

  getAdoptionCountByStatus(status: string): number {
    return this.customerAdoptions.filter(adoption => adoption.status === status).length;
  }
}