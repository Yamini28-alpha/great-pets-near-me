import express from 'express';
import { petController } from '../controllers/petController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', petController.getPets);
router.get('/search', petController.searchPets);
router.get('/:id', petController.getPetById);

router.post('/', authMiddleware, petController.createPet);
router.get('/my-shelter/pets', authMiddleware, petController.getMyShelterPets);
router.put('/:id', authMiddleware, petController.updatePet);
router.delete('/:id', authMiddleware, petController.deletePet);

router.get('/:id/youtube', petController.getPetWithYouTubeInfo);

export { router as petRouter };