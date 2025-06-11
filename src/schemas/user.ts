import {z} from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, {message: 'Имя не может быть пустым'}),
        email: z.string().email(),
        password: z
            .string()
            .min(6, {message: 'Пароль должен быть не менее 6 символов'}),
    }),
});

export const userIdSchema = z.object({
    body: z.object({
        id: z.string().uuid()
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UserId = z.infer<typeof userIdSchema>['body'];
