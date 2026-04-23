import express from 'express';
import { vaccinationController } from '../controllers/vaccinationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/', vaccinationController.createVaccination);
router.get('/shelter', vaccinationController.getShelterVaccinations);
router.get('/upcoming', vaccinationController.getUpcomingVaccinations);
router.put('/:id', vaccinationController.updateVaccination);
router.delete('/:id', vaccinationController.deleteVaccination);

router.get('/pet/:petId', vaccinationController.getVaccinationsByPetId);
router.get('/:id', vaccinationController.getVaccinationById);

export { router as vaccinationRouter };