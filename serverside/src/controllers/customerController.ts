import { Request, Response } from 'express';
import { Customer, CustomerSchemaValidate, UpdateCustomerSchemaValidate } from '../models/Customer';
import { User } from '../models/User';

interface AuthRequest extends Request {
  userData?: any;
}

class CustomerController {
  async createCustomerProfile(req: AuthRequest, res: Response) {
    const data = req.body;
    const userId = req.userData._id;

    const { error, value } = CustomerSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'customer') {
        return res.status(403).json({ 
          message: 'Only customers can create customer profiles' 
        });
      }

      const existingCustomer = await Customer.findOne({ userId });
      if (existingCustomer) {
        return res.status(400).json({ 
          message: 'Customer profile already exists for this user' 
        });
      }

      const existingEmail = await Customer.findOne({ email: value.email });
      if (existingEmail) {
        return res.status(400).json({ 
          message: 'Email already used by another customer' 
        });
      }

      const newCustomer = await Customer.create({
        ...value,
        userId: userId
      });

      res.status(201).json({
        message: 'Customer profile created successfully',
        customer: newCustomer
      });
    } catch (error) {
      console.error('Create customer profile error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getCustomers(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'shelter_staff') {
        return res.status(403).json({ 
          message: 'Only shelter staff can view all customers' 
        });
      }

      const customers = await Customer.find()
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

      res.json(customers);
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getCustomerById(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      const customer = await Customer.findById(id).populate('userId', 'username email');

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      if (req.userData.role === 'customer' && customer.userId._id.toString() !== req.userData._id.toString()) {
        return res.status(403).json({ 
          message: 'You can only view your own customer profile' 
        });
      }

      res.json(customer);
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getMyCustomerProfile(req: AuthRequest, res: Response) {
    try {
      if (req.userData.role !== 'customer') {
        return res.status(403).json({ 
          message: 'Only customers can access this endpoint' 
        });
      }

      const customer = await Customer.findOne({ userId: req.userData._id })
        .populate('userId', 'username email');

      if (!customer) {
        return res.status(404).json({ message: 'Customer profile not found' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Get my customer profile error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateCustomer(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const data = req.body;

    const { error, value } = UpdateCustomerSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      if (req.userData.role === 'customer' && customer.userId.toString() !== req.userData._id.toString()) {
        return res.status(403).json({ 
          message: 'You can only update your own customer profile' 
        });
      }

      if (value.email && value.email !== customer.email) {
        const existingEmail = await Customer.findOne({ 
          email: value.email, 
          _id: { $ne: id } 
        });
        if (existingEmail) {
          return res.status(400).json({ 
            message: 'Email already used by another customer' 
          });
        }
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        id, 
        value, 
        { new: true, runValidators: true }
      ).populate('userId', 'username email');

      res.json({
        message: 'Customer profile updated successfully',
        customer: updatedCustomer
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateMyCustomerProfile(req: AuthRequest, res: Response) {
    const data = req.body;

    const { error, value } = UpdateCustomerSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (req.userData.role !== 'customer') {
        return res.status(403).json({ 
          message: 'Only customers can update their profile' 
        });
      }

      const customer = await Customer.findOne({ userId: req.userData._id });

      if (!customer) {
        return res.status(404).json({ message: 'Customer profile not found' });
      }

      if (value.email && value.email !== customer.email) {
        const existingEmail = await Customer.findOne({ 
          email: value.email, 
          _id: { $ne: customer._id } 
        });
        if (existingEmail) {
          return res.status(400).json({ 
            message: 'Email already used by another customer' 
          });
        }
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customer._id, 
        value, 
        { new: true, runValidators: true }
      ).populate('userId', 'username email');

      res.json({
        message: 'Profile updated successfully',
        customer: updatedCustomer
      });
    } catch (error) {
      console.error('Update my customer profile error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async deleteCustomer(req: AuthRequest, res: Response) {
    const id = req.params.id;

    try {
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      if (req.userData.role === 'customer' && customer.userId.toString() !== req.userData._id.toString()) {
        return res.status(403).json({ 
          message: 'You can only delete your own customer profile' 
        });
      }

      await Customer.findByIdAndDelete(id);

      res.json({ message: 'Customer profile deleted successfully' });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const customerController = new CustomerController();