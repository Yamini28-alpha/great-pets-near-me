import { Request, Response } from 'express';
import { Vaccination, VaccinationSchemaValidate, UpdateVaccinationSchemaValidate } from '../models/Vaccination';
import { Pet } from '../models/Pet';
import { Adoption } from '../models/Adoption';

interface AuthRequest extends Request {
  userData?: any;
}

class VaccinationController {
  async createVaccination(req: AuthRequest, res: Response) {
    const data = req.body;

    const { error, value } = VaccinationSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can create vaccination records' 
        });
      }

      const pet = await Pet.findOne({ 
        _id: value.petId, 
        shelterId: req.userData.shelterId 
      });

      if (!pet) {
        return res.status(404).json({ 
          message: 'Pet not found or you do not have permission to add vaccinations for this pet' 
        });
      }

      const newVaccination = await Vaccination.create({
        ...value,
        shelterId: req.userData.shelterId
      });

      await newVaccination.populate('petId', 'name breed species');
      await newVaccination.populate('shelterId', 'name email phone');

      res.status(201).json({
        message: 'Vaccination record created successfully',
        vaccination: newVaccination
      });
    } catch (error) {
      console.error('Create vaccination error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getVaccinationsByPetId(req: AuthRequest, res: Response) {
    const petId = req.params.petId;

    try {
      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      if (req.userData.role === 'customer') {
        const customer = await require('../models/Customer').default.findOne({ userId: req.userData._id });
        if (!customer) {
          return res.status(404).json({ message: 'Customer profile not found' });
        }

        const adoption = await Adoption.findOne({
          petId: petId,
          customerId: customer._id,
          status: { $in: ['pending', 'approved', 'completed'] }
        });

        if (!adoption) {
          return res.status(403).json({ 
            message: 'You can only view vaccination records for pets you are adopting' 
          });
        }
      } else if (req.userData.role === 'shelter_staff') {
        if (String(pet.shelterId) !== String(req.userData.shelterId)) {
          return res.status(403).json({ 
            message: 'You can only view vaccination records for your shelter\'s pets' 
          });
        }
      }

      const vaccinations = await Vaccination.find({ petId })
        .populate('petId', 'name breed species')
        .populate('shelterId', 'name email phone')
        .sort({ dateAdministered: -1 });

      res.json(vaccinations);
    } catch (error) {
      console.error('Get vaccinations by pet error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getShelterVaccinations(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can view vaccination records' 
        });
      }

      const vaccinations = await Vaccination.find({ shelterId: req.userData.shelterId })
        .populate('petId', 'name breed species adoptionStatus')
        .populate('shelterId', 'name email phone')
        .sort({ createdAt: -1 });

      res.json(vaccinations);
    } catch (error) {
      console.error('Get shelter vaccinations error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getUpcomingVaccinations(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can view upcoming vaccinations' 
        });
      }

      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const upcomingVaccinations = await Vaccination.find({
        shelterId: req.userData.shelterId,
        nextDueDate: { 
          $gte: today,
          $lte: thirtyDaysFromNow
        }
      })
        .populate('petId', 'name breed species adoptionStatus')
        .populate('shelterId', 'name email phone')
        .sort({ nextDueDate: 1 });

      res.json(upcomingVaccinations);
    } catch (error) {
      console.error('Get upcoming vaccinations error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getVaccinationById(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      const vaccination = await Vaccination.findById(id)
        .populate('petId', 'name breed species adoptionStatus')
        .populate('shelterId', 'name email phone');

      if (!vaccination) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      if (req.userData.role === 'customer') {
        const customer = await require('../models/Customer').default.findOne({ userId: req.userData._id });
        if (!customer) {
          return res.status(404).json({ message: 'Customer profile not found' });
        }

        const adoption = await Adoption.findOne({
          petId: vaccination.petId._id,
          customerId: customer._id,
          status: { $in: ['pending', 'approved', 'completed'] }
        });

        if (!adoption) {
          return res.status(403).json({ 
            message: 'You can only view vaccination records for pets you are adopting' 
          });
        }
      } else if (req.userData.role === 'shelter_staff') {
        if (String(vaccination.shelterId._id) !== String(req.userData.shelterId)) {
          return res.status(403).json({ 
            message: 'You can only view vaccination records for your shelter' 
          });
        }
      }

      res.json(vaccination);
    } catch (error) {
      console.error('Get vaccination error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateVaccination(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const data = req.body;

    const { error, value } = UpdateVaccinationSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can update vaccination records' 
        });
      }

      const vaccination = await Vaccination.findById(id);
      if (!vaccination) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      if (String(vaccination.shelterId) !== String(req.userData.shelterId)) {
        return res.status(403).json({ 
          message: 'You can only update vaccination records for your shelter' 
        });
      }

      const updatedVaccination = await Vaccination.findByIdAndUpdate(
        id, 
        value, 
        { new: true, runValidators: true }
      )
      .populate('petId', 'name breed species adoptionStatus')
      .populate('shelterId', 'name email phone');

      res.json({
        message: 'Vaccination record updated successfully',
        vaccination: updatedVaccination
      });
    } catch (error) {
      console.error('Update vaccination error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async deleteVaccination(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can delete vaccination records' 
        });
      }

      const vaccination = await Vaccination.findById(id);
      if (!vaccination) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      if (String(vaccination.shelterId) !== String(req.userData.shelterId)) {
        return res.status(403).json({ 
          message: 'You can only delete vaccination records for your shelter' 
        });
      }

      await Vaccination.findByIdAndDelete(id);

      res.json({ message: 'Vaccination record deleted successfully' });
    } catch (error) {
      console.error('Delete vaccination error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const vaccinationController = new VaccinationController();