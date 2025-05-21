import path from 'path';
import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});
const envSchema = z.object({
    PORT: z.coerce.number(),
    JWT_SECRET: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_REGION: z.string(),
    S3_ENDPOINT: z.string().url(),
    S3_BUCKET_NAME: z.string(),
});

type Env = z.infer<typeof envSchema>;
export const config: Env = envSchema.parse(process.env);