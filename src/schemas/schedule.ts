import {z} from 'zod';

export const createScheduleSchema = z.object({
    body: z.object({
        classId: z.string().uuid({message: 'Invalid class ID'}),
        dayOfWeek: z.number().int().min(1, {message: 'dayOfWeek must be between 1 and 7'}).max(7),
    }),
});
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>['body'];

export const scheduleParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid({message: 'Invalid schedule ID'}),
    }),
});
export type ScheduleParams = z.infer<typeof scheduleParamsSchema>['params'];

export const updateScheduleSchema = z.object({
    params: scheduleParamsSchema.shape.params,
    body: z.object({
        classId: z.string().uuid({message: 'Invalid class ID'}).optional(),
        dayOfWeek: z.number().int().min(1).max(7).optional(),
    }),
});
export type UpdateScheduleInput = {
    params: ScheduleParams;
    body: z.infer<typeof updateScheduleSchema>['body'];
};