import { Schema, model, Document, Types } from 'mongoose';
import Joi from 'joi';

export interface IPet extends Document {
  name: string;
  breed: string;
  age: number;
  weight: number;
  species: string;
  adoptionStatus: string;
  description: string;
  shelterId: Types.ObjectId;
  youtubeVideoId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PetSchemaValidate = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  breed: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(0).max(30).required(),
  weight: Joi.number().min(0.1).max(100).required(),
  species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').required(),
  adoptionStatus: Joi.string().valid('available', 'adopted', 'pending').default('available'),
  description: Joi.string().max(500).required(),
  youtubeVideoId: Joi.string().allow('').optional()
});

export const UpdatePetSchemaValidate = Joi.object({
  name: Joi.string().min(2).max(50),
  breed: Joi.string().min(2).max(50),
  age: Joi.number().min(0).max(30),
  weight: Joi.number().min(0.1).max(100),
  species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other'),
  adoptionStatus: Joi.string().valid('available', 'adopted', 'pending'),
  description: Joi.string().max(500),
  youtubeVideoId: Joi.string().allow('')
}).unknown(true);

const petSchema = new Schema<IPet>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    required: true,
    min: 0.1
  },
  species: {
    type: String,
    required: true,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'other']
  },
  adoptionStatus: {
    type: String,
    enum: ['available', 'adopted', 'pending'],
    default: 'available'
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  shelterId: {
    type: Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  },
  youtubeVideoId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Pet = model<IPet>('Pet', petSchema);