import { Router } from 'express';
import { validate } from '../middlewares/validate';
import {
    createScheduleSchema,
    scheduleParamsSchema,
    updateScheduleSchema,
} from '../schemas/schedule';
import * as scheduleController from '../controllers/scheduleController';
import {authenticate} from "../middlewares/auth";

const router = Router();

router.post(
    '/api/v1/schedules',
    authenticate,
    validate(createScheduleSchema),
    scheduleController.createSchedule
);

router.get(
    '/api/v1/schedules',
    scheduleController.getAllSchedules
);

router.get(
    '/api/v1/schedules/:id',
    validate(scheduleParamsSchema),
    scheduleController.getSchedulesByClassId
);

router.patch(
    '/api/v1/schedules/:id',
    authenticate,
    validate(updateScheduleSchema),
    scheduleController.updateSchedule
);

router.delete(
    '/api/v1/schedules/:id',
    authenticate,
    validate(scheduleParamsSchema),
    scheduleController.deleteSchedule
);

export default router;
