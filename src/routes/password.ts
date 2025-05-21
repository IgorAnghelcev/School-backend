import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { changePasswordSchema } from '../schemas/password';
import { changePassword } from '../controllers/passwordController';

const router = Router();

router.put(
    '/api/v1/user/password',
    authenticate,
    validate(changePasswordSchema),
    changePassword
);

export default router;
