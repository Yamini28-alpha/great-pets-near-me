import express from 'express';
import { adoptionController } from '../controllers/adoptionController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/', adoptionController.createAdoption);
router.get('/my-applications', adoptionController.getMyAdoptions);
router.delete('/:id/cancel', adoptionController.cancelAdoption);

router.get('/shelter', adoptionController.getShelterAdoptions);
router.get('/stats', adoptionController.getAdoptionStats);
router.put('/:id', adoptionController.updateAdoption);

router.get('/:id', adoptionController.getAdoptionById);

router.delete('/:id', adoptionController.deleteAdoption);

export { router as adoptionRouter };