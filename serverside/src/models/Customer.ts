import { Schema, model, Document, Types } from 'mongoose';
import Joi from 'joi';

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const CustomerSchemaValidate = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  address: Joi.string().min(5).max(200).required()
});

export const UpdateCustomerSchemaValidate = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().min(10).max(15),
  address: Joi.string().min(5).max(200)
}).unknown(true); 

const customerSchema = new Schema<ICustomer>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export const Customer = model<ICustomer>('Customer', customerSchema);