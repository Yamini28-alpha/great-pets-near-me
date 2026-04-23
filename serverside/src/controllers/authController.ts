import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser, RegisterSchemaValidate, LoginSchemaValidate } from '../models/User';

const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'fallback_secret', 
    { expiresIn: '30d' }
  );
};

class AuthController {
  async register(req: Request, res: Response) {
    const data = req.body;

    const { error, value } = RegisterSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      const existingUser = await User.findOne({
        $or: [{ email: value.email }, { username: value.username }]
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      const newUser = await User.create(value);

      const token = generateToken((newUser._id as mongoose.Types.ObjectId).toString());

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          shelterId: newUser.shelterId
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async login(req: Request, res: Response) {
    const data = req.body;

    const { error, value } = LoginSchemaValidate.validate(data);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      const user = await User.findOne({ email: value.email }) as IUser;
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await user.comparePassword(value.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          shelterId: user.shelterId
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const user = await User.findById((req as any).user.userId).select('-password') as IUser;
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role, 
          shelterId: user.shelterId
        }
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export const authController = new AuthController();