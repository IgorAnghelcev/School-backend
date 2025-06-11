import {PrismaClient} from "@prisma/client";
import {File} from "../schemas/file";
import {Request, Response} from 'express';
import {config} from "../config/config";
import {s3} from "../config/aws";
import {DeleteObjectsCommand} from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

export async function deleteFile(
    req: Request<File>,
    res: Response
): Promise<void> {
    let {id} = req.params;

    let file = await prisma.file.findUnique({where: {id}});
    if (!file) {
         res.status(404).json({ error: 'File not found' });
         return;
    }
    if (file.url) {
        const url = new URL(file.url);
        const fullPath = decodeURIComponent(url.pathname);
        const prefix = `/${config.S3_BUCKET_NAME}/`;
        const key = fullPath.startsWith(prefix)
            ? fullPath.slice(prefix.length)
            : fullPath.slice(1);

        // 3) delete from S3
        await s3.send(
            new DeleteObjectsCommand({
                Bucket: config.S3_BUCKET_NAME,
                Delete: {
                    Objects: [
                        { Key: key }
                    ],
                    Quiet: false,
                },
            })
        );
    }

    await prisma.file.delete({ where: { id } });

    res.status(200).json({ message: 'File deleted' });
}