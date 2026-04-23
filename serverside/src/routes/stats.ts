import express from 'express';
import { statsController } from '../controllers/statsController';

const router = express.Router();

router.get('/public', statsController.getPublicStats);

export { router as statsRouter };