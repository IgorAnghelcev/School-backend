import { z } from 'zod';

export const createLessonSchema = z.object({
    body: z.object({
        scheduleId: z.string().uuid({ message: 'Invalid schedule ID' }),
        period: z.number().int().min(1, { message: 'Period must be at least 1' }),
        subject: z.string().min(1, { message: 'Subject is required' }),
    }),
});
export type CreateLessonInput = z.infer<typeof createLessonSchema>['body'];

export const lessonParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid lesson ID' }),
    }),
});
export type LessonParams = z.infer<typeof lessonParamsSchema>['params'];

export const updateLessonSchema = z.object({
    params: lessonParamsSchema.shape.params,
    body: z.object({
        scheduleId: z.string().uuid({ message: 'Invalid schedule ID' }).optional(),
        period: z.number().int().min(1).optional(),
        subject: z.string().min(1).optional(),
    }),
});
export type UpdateLessonInput = {
    params: LessonParams;
    body: z.infer<typeof updateLessonSchema>['body'];
};