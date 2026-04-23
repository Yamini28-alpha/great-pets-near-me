import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
  userData?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = decoded;
    req.userData = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const requireShelterRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userData) {
    return res.status(401).json({ message: 'User data not available' });
  }

  if (req.userData.role !== 'shelter_staff') {
    return res.status(403).json({ 
      message: 'Access denied. Shelter staff role required' 
    });
  }

  next();
};

export const requireCustomerRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userData) {
    return res.status(401).json({ message: 'User data not available' });
  }

  if (req.userData.role !== 'customer') {
    return res.status(403).json({ 
      message: 'Access denied. Customer role required' 
    });
  }

  next();
};