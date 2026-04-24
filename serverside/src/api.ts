import express, { Application, Request, Response } from 'express';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import cors from 'cors';

import { authRouter } from './routes/auth';
import { shelterRouter } from './routes/shelter';
import { petRouter } from './routes/pet';
import { customerRouter } from './routes/customer';
import { adoptionRouter } from './routes/adoption';
import { vaccinationRouter } from './routes/vaccination';
import { statsRouter } from './routes/stats';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('Great Pets Near Me backend is running successfully.');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/shelters', shelterRouter);
app.use('/api/pets', petRouter);
app.use('/api/customers', customerRouter);
app.use('/api/adoptions', adoptionRouter);
app.use('/api/vaccinations', vaccinationRouter);
app.use('/api/stats', statsRouter);

// Start server FIRST
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on port ${port}`);

  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
