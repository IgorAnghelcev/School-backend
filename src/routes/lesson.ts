import { Router } from 'express';
import { validate } from '../middlewares/validate';
import {
    createLessonSchema,
    lessonParamsSchema,
    updateLessonSchema,
} from '../schemas/lesson';
import * as lessonController from '../controllers/lessonController';
import {authenticate} from "../middlewares/auth";

const router = Router();

router.post(
    '/api/v1/lessons',
    authenticate,
    validate(createLessonSchema),
    lessonController.createLesson
);

router.get(
    '/api/v1/lessons',
    lessonController.getAllLessons
);

router.get(
    '/api/v1/lessons/:id',
    validate(lessonParamsSchema),
    lessonController.getLessonById
);

router.patch(
    '/api/v1/lessons/:id',
    authenticate,
    validate(updateLessonSchema),
    lessonController.updateLesson
);

router.delete(
    '/api/v1/lessons/:id',
    authenticate,
    validate(lessonParamsSchema),
    lessonController.deleteLesson
);

export default router;
