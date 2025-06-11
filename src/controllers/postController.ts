import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {CreatePostInput, UpdatePostInput, PostParams} from '../schemas/post';
import {AuthRequest} from "../middlewares/auth";
import {GetPostsInput} from '../schemas/post';
import {RequestHandler} from 'express';
import {DeleteObjectsCommand} from "@aws-sdk/client-s3";
import {s3} from "../config/aws";
import {config} from "../config/config";

const prisma = new PrismaClient();

export async function createPost(
    req: Request<{}, {}, CreatePostInput>,
    res: Response
): Promise<void> {
    const authorId = (req as AuthRequest).userId;  // из authentication middleware
    const {title, content, type} = req.body;
    try {
        const post = await prisma.post.create({
            data: {
                title,
                content,
                type: type ?? undefined,
                author: {
                    connect: {id: authorId},
                }
            },
            include: {
                files: true
            }
        });
        const files = (req.files as Express.MulterS3.File[]) || [];
        if (files.length > 0) {
            // Соберём данные для создания записей в таблице File
            const filesData = files.map((file) => ({
                url: file.location,                 // S3 URL
                mimeType: file.mimetype,            // MIME-тип (image/jpeg, application/pdf и т. д.)
                postId: post.id,
            }));

            // Запись сразу нескольких строк в БД через Prisma
            await prisma.file.createMany({data: filesData});
        }


        const full = await prisma.post.findUnique({
            where: {id: post.id},
            include: {files: true},
        });
        res.status(201).json(full);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Ошибка создания поста'});
    }
}


export const getAllPosts: RequestHandler = async (req, res) => {
    const {page, limit, type: postType} = req.query as unknown as GetPostsInput;

    const skip = (page - 1) * limit;

    const whereClause = postType ? {type: postType} : undefined;

    const [total, posts] = await Promise.all([
        prisma.post.count({where: whereClause}),
        prisma.post.findMany({
            where: whereClause,
            skip,
            take: parseInt(String(limit)),
            orderBy: {createdAt: 'desc'},
            include: {files: true},
        }),
    ]);

    res.json({
        data: posts,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};

export async function getPostById(
    req: Request<PostParams>,
    res: Response
) {
    const {id} = req.params;
    const post = await prisma.post.findUnique({
        where: {id},
        include: {files: true},
    });
    if (!post) {
        res.status(404).json({error: 'Пост не найден'});
        return;
    }
    res.json(post);
}

export async function updatePost(
    req: Request<PostParams, {}, UpdatePostInput>,
    res: Response
) {
    const {id} = req.params;
    const {title, content} = req.body;
    try {
        const post = await prisma.post.update({
            where: {id},
            data: {title, content},
        });

        const files = req.files ?? [];
        if (files.length > 0) {
            const filesData = files.map(f => ({
                url: f.location,                 // S3 URL
                mimeType: f.mimetype,            // MIME-тип (image/jpeg, application/pdf и т. д.)
                postId: post.id
            }));
            await prisma.file.createMany({data: filesData});
        }

        const full = await prisma.post.findUnique({
            where: {id},
            include: {files: true},
        });
        res.json(full);
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({error: 'Пост не найден'});
            return;
        }
        console.error(e);
        res.status(500).json({error: 'Ошибка обновления'});
    }
}

export async function deletePost(
    req: Request<PostParams>,
    res: Response
): Promise<void> {
    const {id} = req.params;

    try {
        const files = await prisma.file.findMany({
            where: {postId: id},
        });

        const keys = files.map((file) => {
            const url = new URL(file.url);
            const fullPath = decodeURIComponent(url.pathname);
            const prefix = `/${config.S3_BUCKET_NAME}/`;
            const key = fullPath.startsWith(prefix)
                ? fullPath.slice(prefix.length)
                : fullPath.slice(1); // fallback

            return {Key: key};
        });
        if (keys.length > 0) {
            await s3.send(
                new DeleteObjectsCommand({
                    Bucket: config.S3_BUCKET_NAME,
                    Delete: {
                        Objects: keys,
                        Quiet: false,
                    },
                })
            );
        }

        await prisma.file.deleteMany({where: {postId: id}});
        await prisma.post.delete({where: {id}});

        res.json({message: 'Пост и фотографии удалены'});
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({error: 'Пост не найден'});
            return;
        }
        console.error(e);
        res.status(500).json({error: 'Ошибка удаления поста'});
    }
}


export const getAllFiles: RequestHandler = async (req, res) => {
    const {page: rawPage, limit: rawLimit} = req.query as {
        page?: string | number;
        limit?: string | number;
    };

    const page = Number(rawPage) > 0 ? Math.floor(Number(rawPage)) : 1;
    const limit = Number(rawLimit) > 0 ? Math.floor(Number(rawLimit)) : 10;

    const skip = (page - 1) * limit;

    const whereFiles = {
        mimeType: {
            startsWith: 'image/',
        },
    };
    const [total, files] = await Promise.all([
        prisma.file.count({
            where: whereFiles,
        }),
        prisma.file.findMany({
            where: whereFiles,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    res.json({
        data: files,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};