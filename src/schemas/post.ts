import {z} from 'zod';

const PostTypeEnum = z.enum(['NEWS', 'POST'] as const);


export const postParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const createPostSchema = z.object({
    body: z.object({
        title: z.string().min(1, {message: 'Заголовок обязателен'}),
        content: z.string().min(1, {message: 'Текст обязателен'}),
        type: PostTypeEnum.optional(),  // валидирует только 'NEWS' или 'POST'
    }),
});

export const updatePostSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        type: PostTypeEnum.optional(),
    }),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const getPostsSchema = z.object({
    query: z.object({
        page: z.coerce
            .number()
            .min(1, {message: 'page >= 1'})
            .default(1),
        limit: z.coerce
            .number()
            .min(1, {message: 'limit >= 1'})
            .max(100, {message: 'limit ≤ 20'})
            .default(10),
        type: PostTypeEnum
    }),
});

export type GetPostsInput = z.infer<typeof getPostsSchema>['query'];
export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type PostParams = z.infer<typeof postParamsSchema>['params'];