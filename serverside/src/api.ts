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
const port: number = parseInt(process.env.PORT || '8000', 10);

app.use(cors({
  origin: [
    'http://localhost:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Great Pets Near Me backend is running successfully.');
});

connectDB();

app.use('/api/auth', authRouter);
app.use('/api/shelters', shelterRouter);
app.use('/api/pets', petRouter);
app.use('/api/customers', customerRouter);
app.use('/api/adoptions', adoptionRouter);
app.use('/api/vaccinations', vaccinationRouter);
app.use('/api/stats', statsRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
