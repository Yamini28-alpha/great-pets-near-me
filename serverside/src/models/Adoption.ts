import { Schema, model, Document, Types } from 'mongoose';
import Joi from 'joi';

export interface IAdoption extends Document {
  petId: Types.ObjectId;
  customerId: Types.ObjectId;
  shelterId: Types.ObjectId;
  adoptionDate: Date;
  status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AdoptionSchemaValidate = Joi.object({
  petId: Joi.string().required(),
  notes: Joi.string().max(500).optional()
});

export const UpdateAdoptionSchemaValidate = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed'),
  notes: Joi.string().max(500).optional(),
  adoptionDate: Joi.date().optional()
});

const adoptionSchema = new Schema<IAdoption>({
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  shelterId: {
    type: Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  },
  adoptionDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

adoptionSchema.index({ petId: 1 });
adoptionSchema.index({ customerId: 1 });
adoptionSchema.index({ shelterId: 1 });
adoptionSchema.index({ status: 1 });

export const Adoption = model<IAdoption>('Adoption', adoptionSchema);