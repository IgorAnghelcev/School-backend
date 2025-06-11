import {Router} from 'express';
import {validate} from '../middlewares/validate';
import {loginSchema} from '../schemas/auth';
import {loginUser, logoutUser} from '../controllers/authController';

const router = Router();

router.post(
    '/api/v1/login',
    validate(loginSchema),
    loginUser
);

router.post(
    '/api/v1/logout',
    logoutUser
);

export default router;
