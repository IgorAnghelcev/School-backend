import { StorageEngine } from 'multer';
import { S3Client } from '@aws-sdk/client-s3';

declare module 'multer-s3-v3' {
    export interface MulterS3V3Options {
        s3: S3Client;       // <-- было client, теперь s3
        bucket: string;
        acl?: string;
        contentType?: (
            req: Express.Request,
            file: Express.Multer.File,
            cb: (err: Error | null, ct?: string) => void
        ) => void;
        contentDisposition?: (
            req: Express.Request,
            file: Express.Multer.File,
            cb: (err: Error | null, contentDisposition?: string) => void
        ) => void;
        metadata?: (
            req: Express.Request,
            file: Express.Multer.File,
            cb: (err: Error | null, md?: Record<string, any>) => void
        ) => void;
        key: (
            req: Express.Request,
            file: Express.Multer.File,
            cb: (err: Error | null, key?: string) => void
        ) => void;
    }

    function multerS3V3(opts: MulterS3V3Options): StorageEngine;
    export default multerS3V3;
}
