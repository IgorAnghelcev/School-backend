import { Router } from 'express';
import { validate } from '../middlewares/validate';
import {
    createClassSchema,
    classParamsSchema,
    updateClassSchema,
} from '../schemas/class';
import * as classController from '../controllers/classController';
import {authenticate} from "../middlewares/auth";

const router = Router();

router.post(
    '/api/v1/classes',
    authenticate,
    validate(createClassSchema),
    classController.createClass
);

router.get(
    '/api/v1/classes',
    classController.getAllClasses
);

router.get(
    '/api/v1/classes/:id',
    validate(classParamsSchema),
    classController.getClassById
);

router.patch(
    '/api/v1/classes/:id',
    authenticate,
    validate(updateClassSchema),
    classController.updateClass
);

router.delete(
    '/api/v1/classes/:id',
    authenticate,
    validate(classParamsSchema),
    classController.deleteClass
);

export default router;
