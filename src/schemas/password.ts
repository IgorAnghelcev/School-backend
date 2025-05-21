import { z } from 'zod';

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z
            .string()
            .min(6, { message: 'Текущий пароль должен быть не менее 6 символов' }),
        newPassword: z
            .string()
            .min(6, { message: 'Новый пароль должен быть не менее 6 символов' }),
    }),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];