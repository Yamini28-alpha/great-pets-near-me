import { Request, Response } from 'express';
import { Shelter, ShelterSchemaValidate, UpdateShelterSchemaValidate } from '../models/Shelter';
import { User } from '../models/User';

interface AuthRequest extends Request {
  userData?: any;
}

class ShelterController {
  async createShelter(req: AuthRequest, res: Response) {
    const data = req.body;
    const userId = req.userData._id;

    const { error, value } = ShelterSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff') {
        return res.status(403).json({ 
          message: 'Only shelter staff can create shelters' 
        });
      }

      if (req.userData.shelterId) {
        return res.status(400).json({ 
          message: 'You already have a shelter associated with your account' 
        });
      }

      const newShelter = await Shelter.create({
        ...value,
        createdBy: userId
      });

      await User.findByIdAndUpdate(userId, { 
        shelterId: newShelter._id 
      });

      res.status(201).json({
        message: 'Shelter created successfully',
        shelter: newShelter
      });
    } catch (error) {
      console.error('Create shelter error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getShelters(req: Request, res: Response) {
    try {
      const shelters = await Shelter.find().populate('createdBy', 'username email');
      res.json(shelters);
    } catch (error) {
      console.error('Get shelters error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getShelterById(req: Request, res: Response) {
    const id = req.params.id;

    try {
      const shelter = await Shelter.findById(id).populate('createdBy', 'username email');

      if (!shelter) {
        return res.status(404).json({ message: 'Shelter not found' });
      }

      res.json(shelter);
    } catch (error) {
      console.error('Get shelter error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getMyShelter(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff') {
        return res.status(403).json({ 
          message: 'Only shelter staff can access this endpoint' 
        });
      }

      if (!req.userData.shelterId) {
        return res.status(404).json({ message: 'No shelter found for your account' });
      }

      const shelter = await Shelter.findById(req.userData.shelterId)
        .populate('createdBy', 'username email');

      if (!shelter) {
        return res.status(404).json({ message: 'Shelter not found' });
      }

      res.json(shelter);
    } catch (error) {
      console.error('Get my shelter error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateShelter(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const data = req.body;

    const { error, value } = UpdateShelterSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff' || req.userData.shelterId?.toString() !== id) {
        return res.status(403).json({ 
          message: 'You can only update your own shelter' 
        });
      }

      const updatedShelter = await Shelter.findByIdAndUpdate(
        id, 
        value, 
        { new: true, runValidators: true }
      ).populate('createdBy', 'username email');

      if (!updatedShelter) {
        return res.status(404).json({ message: 'Shelter not found' });
      }

      res.json({
        message: 'Shelter updated successfully',
        shelter: updatedShelter
      });
    } catch (error) {
      console.error('Update shelter error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async deleteShelter(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      if (req.userData.role !== 'shelter_staff' || req.userData.shelterId?.toString() !== id) {
        return res.status(403).json({ 
          message: 'You can only delete your own shelter' 
        });
      }

      const deletedShelter = await Shelter.findByIdAndDelete(id);

      if (!deletedShelter) {
        return res.status(404).json({ message: 'Shelter not found' });
      }

      await User.findByIdAndUpdate(req.userData._id, { 
        $unset: { shelterId: 1 } 
      });

      res.json({ message: 'Shelter deleted successfully' });
    } catch (error) {
      console.error('Delete shelter error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const shelterController = new ShelterController();