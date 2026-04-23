import { Request, Response } from 'express';
import { Pet } from '../models/Pet';
import { Shelter } from '../models/Shelter';
import { Adoption } from '../models/Adoption';

class StatsController {
  async getPublicStats(req: Request, res: Response) {
    try {
      const availablePetsCount = await Pet.countDocuments({ 
        adoptionStatus: 'available' 
      });

      const sheltersCount = await Shelter.countDocuments();

      const adoptionsCount = await Adoption.countDocuments({ 
        status: 'completed' 
      });

      const totalPetsCount = await Pet.countDocuments();

      res.json({
        availablePetsCount,
        sheltersCount,
        adoptionsCount,
        totalPetsCount
      });
    } catch (error) {
      console.error('Get public stats error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const statsController = new StatsController();