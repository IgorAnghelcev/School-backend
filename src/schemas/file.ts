import {z} from 'zod';

export const fileSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});
export type File = z.infer<typeof fileSchema>['params'];