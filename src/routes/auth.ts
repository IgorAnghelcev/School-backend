import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { loginSchema } from '../schemas/auth';
import { loginUser } from '../controllers/authController';

const router = Router();

router.post(
    '/api/v1/login',
    validate(loginSchema),
    loginUser
);

export default router;
