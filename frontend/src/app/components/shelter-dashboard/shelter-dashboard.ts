import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShelterService } from '../../services/shelter.service';
import { PetService } from '../../services/pet.service';
import { AdoptionService } from '../../services/adoption.service';
import { VaccinationService } from '../../services/vaccination.service';
import { AuthService } from '../../services/auth.service';
import { YouTubeService } from '../../services/youtube';
import { YouTubePlayer } from '../youtube-player/youtube-player';

interface Shelter {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

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
  status: string;
  adoptionDate: string;
  notes: string;
  createdAt: string;
}

interface Vaccination {
  _id: string;
  petId: Pet;
  vaccineName: string;
  dateAdministered: string;
  veterinarian: string;
  nextDueDate: string;
  notes: string;
}

interface AdoptionForm {
  status: string;
  notes: string;
  adoptionDate: string;
}

@Component({
  selector: 'app-shelter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, YouTubePlayer],
  templateUrl: './shelter-dashboard.html',
  styleUrl: './shelter-dashboard.css'
})
export class ShelterDashboard implements OnInit {
  shelter: Shelter | null = null;
  pets: Pet[] = [];
  adoptions: Adoption[] = [];
  vaccinations: Vaccination[] = [];
  stats: any = null;
  showShelterModal = false;
  showPetModal = false;
  showAdoptionModal = false;
  showVaccinationModal = false;
  showStatsModal = false;
  showPetVideoModal = false;
  shelterForm: any = {};
  petForm: any = {
    youtubeVideoInput: '',
    youtubeVideoId: ''
  };
  adoptionForm: AdoptionForm = {
    status: '',
    notes: '',
    adoptionDate: ''
  };
  vaccinationForm: any = {};
  selectedPet: Pet | null = null;
  selectedAdoption: Adoption | null = null;
  selectedVaccination: Vaccination | null = null;
  selectedPetForVideo: Pet | null = null;
  youtubeVideoInfo: any = null;
  isLoading = true;
  isLoadingYouTube = false;
  isYoutubePreviewVisible = false;

  constructor(
    private shelterService: ShelterService,
    private petService: PetService,
    private adoptionService: AdoptionService,
    private vaccinationService: VaccinationService,
    private youtubeService: YouTubeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadShelterData();
  }

  loadShelterData() {
    this.isLoading = true;
    this.shelterService.getMyShelter().subscribe({
      next: (shelter: any) => {
        this.shelter = Array.isArray(shelter) ? shelter[0] : shelter;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Shelter API Error:', error);
        this.shelter = null;
        this.checkLoadingComplete();
      }
    });

    this.petService.getMyShelterPets().subscribe({
      next: (pets: any) => {
        this.pets = pets || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Pets API Error:', error);
        this.pets = [];
        this.checkLoadingComplete();
      }
    });

    this.adoptionService.getShelterAdoptions().subscribe({
      next: (adoptions: any) => {
        this.adoptions = adoptions || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Adoptions API Error:', error);
        this.adoptions = [];
        this.checkLoadingComplete();
      }
    });

    this.vaccinationService.getShelterVaccinations().subscribe({
      next: (vaccinations: any) => {
        this.vaccinations = vaccinations || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Vaccinations API Error:', error);
        this.vaccinations = [];
        this.checkLoadingComplete();
      }
    });

    this.adoptionService.getAdoptionStats().subscribe({
      next: (stats: any) => {
        this.stats = stats;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Stats API Error:', error);
        this.stats = null;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  isVaccinationOverdue(vaccination: Vaccination): boolean {
    const dueDate = new Date(vaccination.nextDueDate);
    const today = new Date();
    return dueDate < today;
  }

  openShelterModal() {
    this.shelterForm = this.shelter ? { ...this.shelter } : {};
    this.showShelterModal = true;
  }

  saveShelter() {
    if (this.shelter?._id) {
      this.shelterService.updateShelter(this.shelter._id, this.shelterForm).subscribe({
        next: () => {
          this.loadShelterData();
          this.showShelterModal = false;
        }
      });
    } else {
      this.shelterService.createShelter(this.shelterForm).subscribe({
        next: () => {
          this.loadShelterData();
          this.showShelterModal = false;
        }
      });
    }
  }

  openPetModal(pet?: Pet) {
    this.selectedPet = pet || null;
    this.petForm = pet ? { 
      ...pet, 
      youtubeVideoInput: pet.youtubeVideoId || '',
      youtubeVideoId: pet.youtubeVideoId || ''
    } : {
      name: '', breed: '', age: 0, weight: 0, species: 'dog',
      description: '', youtubeVideoId: '', youtubeVideoInput: ''
    };
    this.isYoutubePreviewVisible = false;
    this.showPetModal = true;
  }

  extractYouTubeId() {
    if (this.petForm.youtubeVideoInput) {
      const videoId = this.youtubeService.extractVideoId(this.petForm.youtubeVideoInput);
      if (videoId && this.youtubeService.validateVideoId(videoId)) {
        this.petForm.youtubeVideoId = videoId;
        this.isYoutubePreviewVisible = true;
        this.cdr.detectChanges();
      } else {
        alert('Invalid YouTube URL or Video ID. Please enter a valid YouTube video ID or URL.');
        this.petForm.youtubeVideoId = '';
        this.isYoutubePreviewVisible = false;
      }
    } else {
      this.petForm.youtubeVideoId = '';
      this.isYoutubePreviewVisible = false;
    }
  }

  savePet() {
    if (this.petForm.youtubeVideoInput && !this.petForm.youtubeVideoId) {
      this.extractYouTubeId();
    }

    const cleanPetData = {
      name: this.petForm.name,
      breed: this.petForm.breed,
      age: this.petForm.age,
      weight: this.petForm.weight,
      species: this.petForm.species,
      description: this.petForm.description,
      youtubeVideoId: this.petForm.youtubeVideoId
    };

    if (this.selectedPet?._id) {
      this.petService.updatePet(this.selectedPet._id, cleanPetData).subscribe({
        next: () => {
          this.loadShelterData();
          this.showPetModal = false;
        },
        error: (error) => {
          console.error('Update pet error:', error);
          alert('Error updating pet: ' + (error.error?.message || 'Unknown error'));
        }
      });
    } else {
      this.petService.createPet(cleanPetData).subscribe({
        next: () => {
          this.loadShelterData();
          this.showPetModal = false;
        },
        error: (error) => {
          console.error('Create pet error:', error);
          alert('Error creating pet: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  deletePet(pet: Pet) {
    if (confirm('Are you sure you want to delete this pet?')) {
      this.petService.deletePet(pet._id).subscribe({
        next: () => this.loadShelterData()
      });
    }
  }

  openAdoptionModal(adoption: Adoption) {
    this.selectedAdoption = adoption;
    this.adoptionForm = {
      status: adoption.status,
      notes: adoption.notes || '',
      adoptionDate: adoption.adoptionDate || ''
    };
    this.showAdoptionModal = true;
  }

  updateAdoptionStatus() {
    if (this.selectedAdoption) {
      const updateData: Partial<AdoptionForm> = {
        status: this.adoptionForm.status,
        notes: this.adoptionForm.notes,
        adoptionDate: this.adoptionForm.adoptionDate
      };

      Object.keys(updateData).forEach((key) => {
        const typedKey = key as keyof AdoptionForm;
        if (updateData[typedKey] === undefined || updateData[typedKey] === null || updateData[typedKey] === '') {
          delete updateData[typedKey];
        }
      });

      this.adoptionService.updateAdoption(this.selectedAdoption._id, updateData).subscribe({
        next: () => {
          this.loadShelterData();
          this.showAdoptionModal = false;
        },
        error: (error) => {
          console.error('Update adoption error:', error);
          alert('Error: ' + (error.error?.message || 'Failed to update adoption application'));
        }
      });
    }
  }

  updateAdoptionStatusDirect(adoption: Adoption, newStatus: string) {
    const updateData: { status: string; adoptionDate?: string } = {
      status: newStatus
    };

    if (newStatus === 'completed') {
      updateData.adoptionDate = new Date().toISOString().split('T')[0];
    }

    this.adoptionService.updateAdoption(adoption._id, updateData).subscribe({
      next: () => {
        this.loadShelterData();
      },
      error: (error) => {
        console.error('Update adoption status error:', error);
        alert('Failed to update adoption status: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  openVaccinationModal(vaccination?: Vaccination | null, pet?: Pet) {
    this.selectedVaccination = vaccination || null;
    this.vaccinationForm = vaccination ? { ...vaccination } : {
      petId: pet?._id || '',
      vaccineName: '', dateAdministered: '', veterinarian: '',
      nextDueDate: '', notes: ''
    };
    this.showVaccinationModal = true;
  }

  saveVaccination() {
    if (this.selectedVaccination?._id) {
      this.vaccinationService.updateVaccination(this.selectedVaccination._id, this.vaccinationForm).subscribe({
        next: () => {
          this.loadShelterData();
          this.showVaccinationModal = false;
        }
      });
    } else {
      this.vaccinationService.createVaccination(this.vaccinationForm).subscribe({
        next: () => {
          this.loadShelterData();
          this.showVaccinationModal = false;
        }
      });
    }
  }

  deleteVaccination(vaccination: Vaccination) {
    if (confirm('Are you sure you want to delete this vaccination record?')) {
      this.vaccinationService.deleteVaccination(vaccination._id).subscribe({
        next: () => this.loadShelterData()
      });
    }
  }

  openStatsModal() {
    this.showStatsModal = true;
  }

  viewPetVideo(pet: Pet) {
    this.selectedPetForVideo = pet;
    this.youtubeVideoInfo = null;
    this.isLoadingYouTube = true;
    this.showPetVideoModal = true;
    
    if (pet.youtubeVideoId) {
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
    } else {
      this.isLoadingYouTube = false;
    }
  }

  closeModal() {
    this.showShelterModal = false;
    this.showPetModal = false;
    this.showAdoptionModal = false;
    this.showVaccinationModal = false;
    this.showStatsModal = false;
    this.showPetVideoModal = false;
    this.isYoutubePreviewVisible = false;
  }

  getAdoptionCountByStatus(status: string): number {
    return this.adoptions.filter(adoption => adoption.status === status).length;
  }

  deleteAdoption(adoption: Adoption) {
    if (confirm('Are you sure you want to delete this adoption record? This action cannot be undone.')) {
      this.adoptionService.deleteAdoption(adoption._id).subscribe({
        next: () => {
          this.loadShelterData();
          alert('Adoption record deleted successfully');
        },
        error: (error) => {
          console.error('Delete adoption error:', error);
          alert('Error deleting adoption record: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }
}