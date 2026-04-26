import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';
import { connectDB } from '../config/db';
import { Shelter } from '../models/shelter';
import { Pet } from '../models/pet';

dotenv.config();

const seedDemoPets = async () => {
  try {
    await connectDB();

    let demoShelter = await Shelter.findOne({ email: 'demo.shelter@greatpets.com' });

    if (!demoShelter) {
      demoShelter = await Shelter.create({
        name: 'Great Pets Demo Shelter',
        address: '123 Pet Care Street, Atlanta, GA',
        phone: '6785551234',
        email: 'demo.shelter@greatpets.com',
        createdBy: new Types.ObjectId()
      });

      console.log('Demo shelter created');
    } else {
      console.log('Demo shelter already exists');
    }

    const demoPets = [
      {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 2,
        weight: 55,
        species: 'dog',
        adoptionStatus: 'available',
        description: 'Friendly and playful Golden Retriever who loves walks and family time.',
        shelterId: demoShelter._id,
        youtubeVideoId: 'dQw4w9WgXcQ'
      },
      {
        name: 'Luna',
        breed: 'Labrador Retriever',
        age: 3,
        weight: 60,
        species: 'dog',
        adoptionStatus: 'available',
        description: 'Calm and loving Labrador who enjoys playing fetch and meeting new people.',
        shelterId: demoShelter._id,
        youtubeVideoId: 'dQw4w9WgXcQ'
      },
      {
        name: 'Max',
        breed: 'Beagle',
        age: 1,
        weight: 25,
        species: 'dog',
        adoptionStatus: 'available',
        description: 'Energetic young Beagle looking for an active and caring family.',
        shelterId: demoShelter._id,
        youtubeVideoId: 'dQw4w9WgXcQ'
      }
    ];

    for (const pet of demoPets) {
      const existingPet = await Pet.findOne({ name: pet.name, breed: pet.breed });

      if (!existingPet) {
        await Pet.create(pet);
        console.log(`${pet.name} added`);
      } else {
        console.log(`${pet.name} already exists`);
      }
    }

    console.log('Demo pet data seeding completed');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding demo pets:', error);
    process.exit(1);
  }
};

seedDemoPets();
