// src/types/express/index.d.ts
import { File as MulterFile } from 'multer';

declare module 'express-serve-static-core' {
    interface Request {
        // если загружается одно фото
        file?: MulterFile & {
            bucket: string;
            key: string;
            acl: string;
            contentType: string;
            contentDisposition: string | null;
            storageClass: string;
            serverSideEncryption: string | null;
            metadata: Record<string, string>;
            location: string;  // <-- URL в S3
            etag: string;
            versionId?: string | null;
        }

        files?: Array<MulterFile & {
            location: string;
            bucket: string;
            key: string;
            etag: string;
        }>;
    }
}
