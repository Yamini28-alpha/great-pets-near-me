import { Request, Response } from 'express';
import { Pet, PetSchemaValidate, UpdatePetSchemaValidate } from '../models/Pet';
import { Shelter } from '../models/Shelter';
import { youtubeService } from '../config/youtube';

interface AuthRequest extends Request {
  userData?: any;
}

class PetController {
  async createPet(req: AuthRequest, res: Response) {
    const data = req.body;

    const { error, value } = PetSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff with a shelter can create pets' 
        });
      }

      const newPet = await Pet.create({
        ...value,
        shelterId: req.userData.shelterId
      });

      await newPet.populate('shelterId', 'name address phone email');

      res.status(201).json({
        message: 'Pet created successfully',
        pet: newPet
      });
    } catch (error) {
      console.error('Create pet error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getPets(req: Request, res: Response) {
    try {
      const { 
        species, 
        adoptionStatus, 
        breed, 
        minAge, 
        maxAge,
        shelterId 
      } = req.query;

      const filter: any = {};

      if (species) filter.species = species;
      if (adoptionStatus) filter.adoptionStatus = adoptionStatus;
      if (breed) filter.breed = { $regex: breed, $options: 'i' };
      if (shelterId) filter.shelterId = shelterId;

      if (minAge || maxAge) {
        filter.age = {};
        if (minAge) filter.age.$gte = parseInt(minAge as string);
        if (maxAge) filter.age.$lte = parseInt(maxAge as string);
      }

      const pets = await Pet.find(filter)
        .populate('shelterId', 'name address phone email')
        .sort({ createdAt: -1 });

      res.json(pets);
    } catch (error) {
      console.error('Get pets error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getPetById(req: Request, res: Response) {
    const id = req.params.id;

    try {
      const pet = await Pet.findById(id)
        .populate('shelterId', 'name address phone email');

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      res.json(pet);
    } catch (error) {
      console.error('Get pet error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getMyShelterPets(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can access their shelter pets' 
        });
      }

      const pets = await Pet.find({ shelterId: req.userData.shelterId })
        .populate('shelterId', 'name address phone email')
        .sort({ createdAt: -1 });

      res.json(pets);
    } catch (error) {
      console.error('Get my shelter pets error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updatePet(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const data = req.body;

    const { error, value } = UpdatePetSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can update pets' 
        });
      }

      const existingPet = await Pet.findOne({ 
        _id: id, 
        shelterId: req.userData.shelterId 
      });

      if (!existingPet) {
        return res.status(404).json({ 
          message: 'Pet not found or you do not have permission to update this pet' 
        });
      }

      const updatedPet = await Pet.findByIdAndUpdate(
        id, 
        value, 
        { new: true, runValidators: true }
      ).populate('shelterId', 'name address phone email');

      res.json({
        message: 'Pet updated successfully',
        pet: updatedPet
      });
    } catch (error) {
      console.error('Update pet error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async deletePet(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can delete pets' 
        });
      }

      const pet = await Pet.findOne({ 
        _id: id, 
        shelterId: req.userData.shelterId 
      });

      if (!pet) {
        return res.status(404).json({ 
          message: 'Pet not found or you do not have permission to delete this pet' 
        });
      }

      await Pet.findByIdAndDelete(id);

      res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
      console.error('Delete pet error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async searchPets(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const pets = await Pet.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { breed: { $regex: q, $options: 'i' } }
        ],
        adoptionStatus: 'available'
      })
      .populate('shelterId', 'name address phone email')
      .sort({ createdAt: -1 });

      res.json(pets);
    } catch (error) {
      console.error('Search pets error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

    async getPetWithYouTubeInfo(req: Request, res: Response) {
    const id = req.params.id;
    
    try {
      const pet = await Pet.findById(id)
        .populate('shelterId', 'name address phone email');
      
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      let youtubeInfo = null;
      if (pet.youtubeVideoId) {
        youtubeInfo = await youtubeService.getVideoInfo(pet.youtubeVideoId);
      }

      res.json({
        ...pet.toObject(),
        youtubeInfo
      });
    } catch (error) {
      console.error('Get pet with YouTube info error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const petController = new PetController();