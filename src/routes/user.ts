import { Router } from 'express';
import {generateJwtToUser, registerUser} from '../controllers/userController';
import { validate } from '../middlewares/validate';
import {createUserSchema, userIdSchema} from '../schemas/user';

const router = Router();

router.post(
    '/api/v1/user',
    validate(createUserSchema),
    registerUser
);

router.post(
    '/api/v1/generate',
    validate(userIdSchema),
    generateJwtToUser
);

export default router;
