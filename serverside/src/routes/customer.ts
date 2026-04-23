import express from 'express';
import { customerController } from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/', customerController.createCustomerProfile);
router.get('/my-profile', customerController.getMyCustomerProfile);
router.put('/my-profile', customerController.updateMyCustomerProfile);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export { router as customerRouter };