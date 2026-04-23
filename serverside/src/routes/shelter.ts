import express from 'express';
import { shelterController } from '../controllers/shelterController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', shelterController.getShelters);

router.get('/my-shelter', authMiddleware, shelterController.getMyShelter);
router.post('/', authMiddleware, shelterController.createShelter);

router.get('/:id', shelterController.getShelterById);
router.put('/:id', authMiddleware, shelterController.updateShelter);
router.delete('/:id', authMiddleware, shelterController.deleteShelter);

export { router as shelterRouter };