import { Schema, model, Document, Types } from 'mongoose';
import Joi from 'joi';

export interface IShelter extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ShelterSchemaValidate = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(200).required(),
  phone: Joi.string().min(10).max(15).required(),
  email: Joi.string().email().required()
});

export const UpdateShelterSchemaValidate = Joi.object({
  name: Joi.string().min(2).max(100),
  address: Joi.string().min(5).max(200),
  phone: Joi.string().min(10).max(15),
  email: Joi.string().email()
});

const shelterSchema = new Schema<IShelter>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Shelter = model<IShelter>('Shelter', shelterSchema);