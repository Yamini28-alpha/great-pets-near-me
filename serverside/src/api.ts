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

// ✅ keep parseInt (good)
const port: number = parseInt(process.env.PORT || '10000', 10);

// ⚠️ allow your future deployed frontend too (optional for now)
app.use(cors({
  origin: [
    'http://localhost:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ✅ add a root test route (VERY IMPORTANT for Render)
app.get('/', (req: Request, res: Response) => {
  res.send('Great Pets Near Me backend is running successfully.');
});

// routes
app.use('/api/auth', authRouter); 
app.use('/api/shelters', shelterRouter);
app.use('/api/pets', petRouter);
app.use('/api/customers', customerRouter);
app.use('/api/adoptions', adoptionRouter);
app.use('/api/vaccinations', vaccinationRouter);
app.use('/api/stats', statsRouter);

// ❗ move DB connection AFTER server starts
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on port ${port}`);

  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
