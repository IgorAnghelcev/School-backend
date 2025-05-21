import {z} from 'zod';

export const createClassSchema = z.object({
    body: z.object({
        grade: z.number().int().min(1, {message: 'Grade must be between 1 and 12'}).max(12),
        section: z.string().min(1, {message: 'Section is required'}),
    }),
});
export type CreateClassInput = z.infer<typeof createClassSchema>['body'];

export const classParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid({message: 'Invalid class ID'}),
    }),
});
export type ClassParams = z.infer<typeof classParamsSchema>['params'];

export const updateClassSchema = z.object({
    ...classParamsSchema.shape,
    body: z.object({
        grade: z.number().int().min(1).max(12).optional(),
        section: z.string().min(1).optional(),
    }),
});
export type UpdateClassInput = {
    params: ClassParams;
    body: z.infer<typeof updateClassSchema>['body'];
};