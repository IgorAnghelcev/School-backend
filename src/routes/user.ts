import { Router } from 'express';
import { registerUser } from '../controllers/userController';
import { validate } from '../middlewares/validate';
import { createUserSchema } from '../schemas/user';

const router = Router();

router.post(
    '/api/v1/user',
    validate(createUserSchema),
    registerUser
);

export default router;
