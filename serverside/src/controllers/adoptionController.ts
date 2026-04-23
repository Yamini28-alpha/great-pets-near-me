import { Request, Response } from 'express';
import { Adoption, AdoptionSchemaValidate, UpdateAdoptionSchemaValidate } from '../models/Adoption';
import { Pet } from '../models/Pet';
import { Customer } from '../models/Customer';
import { Shelter } from '../models/Shelter';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  userData?: any;
}

class AdoptionController {
  async createAdoption(req: AuthRequest, res: Response) {
    const data = req.body;
    const userId = req.userData._id;

    const { error, value } = AdoptionSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'customer') {
        return res.status(403).json({ 
          message: 'Only customers can apply for adoption' 
        });
      }

      const customer = await Customer.findOne({ userId });
      if (!customer) {
        return res.status(400).json({ 
          message: 'Please create a customer profile before applying for adoption' 
        });
      }

      const pet = await Pet.findById(value.petId);
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      if (pet.adoptionStatus !== 'available') {
        return res.status(400).json({ 
          message: 'This pet is not available for adoption' 
        });
      }

      const existingApplication = await Adoption.findOne({
        petId: value.petId,
        customerId: customer._id,
        status: 'pending'
      });

      if (existingApplication) {
        return res.status(400).json({ 
          message: 'You already have a pending application for this pet' 
        });
      }

      const newAdoption = await Adoption.create({
        petId: value.petId,
        customerId: customer._id,
        shelterId: pet.shelterId,
        notes: value.notes || ''
      });

      await Pet.findByIdAndUpdate(value.petId, { 
        adoptionStatus: 'pending' 
      });

      await newAdoption.populate('petId', 'name breed species age');
      await newAdoption.populate('customerId', 'firstName lastName email phone');
      await newAdoption.populate('shelterId', 'name email phone');

      res.status(201).json({
        message: 'Adoption application submitted successfully',
        adoption: newAdoption
      });
    } catch (error) {
      console.error('Create adoption error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getShelterAdoptions(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can view adoption applications' 
        });
      }

      const { status } = req.query;
      
      const filter: any = { shelterId: req.userData.shelterId };
      if (status) filter.status = status;

      const adoptions = await Adoption.find(filter)
        .populate('petId', 'name breed species age adoptionStatus')
        .populate('customerId', 'firstName lastName email phone address')
        .populate('shelterId', 'name email phone')
        .sort({ createdAt: -1 });

      res.json(adoptions);
    } catch (error) {
      console.error('Get shelter adoptions error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getMyAdoptions(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'customer') {
        return res.status(403).json({ 
          message: 'Only customers can view their adoption applications' 
        });
      }

      const customer = await Customer.findOne({ userId: req.userData._id });
      if (!customer) {
        return res.status(404).json({ message: 'Customer profile not found' });
      }

      const adoptions = await Adoption.find({ customerId: customer._id })
        .populate('petId', 'name breed species age adoptionStatus shelterId')
        .populate('shelterId', 'name email phone address')
        .sort({ createdAt: -1 });

      res.json(adoptions);
    } catch (error) {
      console.error('Get my adoptions error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getAdoptionById(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      const adoption = await Adoption.findById(id)
        .populate('petId', 'name breed species age adoptionStatus')
        .populate('customerId', 'firstName lastName email phone address')
        .populate('shelterId', 'name email phone address');

      if (!adoption) {
        return res.status(404).json({ message: 'Adoption application not found' });
      }

      if (req.userData.role === 'customer') {
        const customer = await Customer.findOne({ userId: req.userData._id });
        if (!customer || String(adoption.customerId._id) !== String(customer._id)) {
          return res.status(403).json({ 
            message: 'You can only view your own adoption applications' 
          });
        }
      } else if (req.userData.role === 'shelter_staff') {
        if (String(adoption.shelterId._id) !== String(req.userData.shelterId)) {
          return res.status(403).json({ 
            message: 'You can only view adoption applications for your shelter' 
          });
        }
      }

      res.json(adoption);
    } catch (error) {
      console.error('Get adoption error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateAdoption(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const data = req.body;

    const { error, value } = UpdateAdoptionSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can update adoption applications' 
        });
      }

      const adoption = await Adoption.findById(id);
      if (!adoption) {
        return res.status(404).json({ message: 'Adoption application not found' });
      }

      if (String(adoption.shelterId) !== String(req.userData.shelterId)) {
        return res.status(403).json({ 
          message: 'You can only update adoption applications for your shelter' 
        });
      }

      const updatedAdoption = await Adoption.findByIdAndUpdate(
        id, 
        value, 
        { new: true, runValidators: true }
      )
      .populate('petId', 'name breed species age adoptionStatus')
      .populate('customerId', 'firstName lastName email phone address')
      .populate('shelterId', 'name email phone');

      if (value.status === 'approved' || value.status === 'completed') {
        await Pet.findByIdAndUpdate(adoption.petId, { 
          adoptionStatus: 'adopted' 
        });
      } else if (value.status === 'rejected') {
        await Pet.findByIdAndUpdate(adoption.petId, { 
          adoptionStatus: 'available' 
        });
      }

      res.json({
        message: 'Adoption application updated successfully',
        adoption: updatedAdoption
      });
    } catch (error) {
      console.error('Update adoption error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async cancelAdoption(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      if (req.userData.role !== 'customer') {
        return res.status(403).json({ 
          message: 'Only customers can cancel their adoption applications' 
        });
      }

      const customer = await Customer.findOne({ userId: req.userData._id });
      if (!customer) {
        return res.status(404).json({ message: 'Customer profile not found' });
      }

      const adoption = await Adoption.findOne({ 
        _id: id, 
        customerId: customer._id 
      });

      if (!adoption) {
        return res.status(404).json({ 
          message: 'Adoption application not found or you do not have permission to cancel it' 
        });
      }

      if (adoption.status !== 'pending') {
        return res.status(400).json({ 
          message: 'Only pending adoption applications can be cancelled' 
        });
      }

      await Adoption.findByIdAndDelete(id);

      await Pet.findByIdAndUpdate(adoption.petId, { 
        adoptionStatus: 'available' 
      });

      res.json({ message: 'Adoption application cancelled successfully' });
    } catch (error) {
      console.error('Cancel adoption error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getAdoptionStats(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({ 
          message: 'Only shelter staff can view adoption statistics' 
        });
      }

      const stats = await Adoption.aggregate([
        {
          $match: { shelterId: req.userData.shelterId }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalApplications = await Adoption.countDocuments({ 
        shelterId: req.userData.shelterId 
      });

      res.json({
        totalApplications,
        statusBreakdown: stats
      });
    } catch (error) {
      console.error('Get adoption stats error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async deleteAdoption(req: AuthRequest, res: Response) {
    const id = req.params.id;
    
    try {
      if (req.userData.role !== 'shelter_staff' || !req.userData.shelterId) {
        return res.status(403).json({
          message: 'Only shelter staff can delete adoption records'
        });
      }

      const adoption = await Adoption.findById(id);
      if (!adoption) {
        return res.status(404).json({ message: 'Adoption record not found' });
      }

      if (String(adoption.shelterId) !== String(req.userData.shelterId)) {
        return res.status(403).json({
          message: 'You can only delete adoption records for your shelter'
        });
      }

      if (adoption.status === 'completed' || adoption.status === 'approved') {
        await Pet.findByIdAndUpdate(adoption.petId, {
          adoptionStatus: 'available'
        });
      }

      await Adoption.findByIdAndDelete(id);

      res.json({ message: 'Adoption record deleted successfully' });
    } catch (error) {
      console.error('Delete adoption error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const adoptionController = new AdoptionController();