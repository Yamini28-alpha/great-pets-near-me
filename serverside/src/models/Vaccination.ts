import { Schema, model, Document, Types } from 'mongoose';
import Joi from 'joi';

export interface IVaccination extends Document {
  petId: Types.ObjectId;
  vaccineName: string;
  dateAdministered: Date;
  veterinarian: string;
  nextDueDate: Date;
  notes: string;
  shelterId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const VaccinationSchemaValidate = Joi.object({
  petId: Joi.string().required(),
  vaccineName: Joi.string().min(2).max(100).required(),
  dateAdministered: Joi.date().required(),
  veterinarian: Joi.string().min(2).max(100).required(),
  nextDueDate: Joi.date().required(),
  notes: Joi.string().max(500).optional()
});

export const UpdateVaccinationSchemaValidate = Joi.object({
  vaccineName: Joi.string().min(2).max(100),
  dateAdministered: Joi.date(),
  veterinarian: Joi.string().min(2).max(100),
  nextDueDate: Joi.date(),
  notes: Joi.string().max(500)
}).unknown(true);

const vaccinationSchema = new Schema<IVaccination>({
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  vaccineName: {
    type: String,
    required: true,
    trim: true
  },
  dateAdministered: {
    type: Date,
    required: true
  },
  veterinarian: {
    type: String,
    required: true,
    trim: true
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  },
  shelterId: {
    type: Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  }
}, {
  timestamps: true
});

vaccinationSchema.index({ petId: 1 });
vaccinationSchema.index({ shelterId: 1 });
vaccinationSchema.index({ nextDueDate: 1 });

export const Vaccination = model<IVaccination>('Vaccination', vaccinationSchema);