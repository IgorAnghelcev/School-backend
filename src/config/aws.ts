import { S3Client } from '@aws-sdk/client-s3';
import {config} from "./config";

export const s3 = new S3Client(
    {
    region: config.AWS_REGION,
    endpoint: config.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID!,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY!,
    }
});
