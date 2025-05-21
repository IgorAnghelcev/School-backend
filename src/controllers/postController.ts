import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {CreatePostInput, UpdatePostInput, PostParams} from '../schemas/post';
import {AuthRequest} from "../middlewares/auth";
import { GetPostsInput } from '../schemas/post';
import { RequestHandler } from 'express';
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
                    connect: { id: authorId },
                }
            },
            include: {
                photos: true
            }
        });
        const files = req.files ?? [];
        if (files.length > 0) {
            const photosData = files.map(f => ({
                url: f.location,
                postId: post.id,
            }));
            await prisma.photo.createMany({data: photosData});
        }

        const full = await prisma.post.findUnique({
            where: {id: post.id},
            include: {photos: true},
        });
        res.status(201).json(full);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Ошибка создания поста'});
    }
}


export const getAllPosts: RequestHandler = async (req, res) => {
    const { page, limit, type: postType } = req.query as unknown as GetPostsInput;

    const skip = (page - 1) * limit;

    const whereClause = postType ? { type: postType } : undefined;

    const [total, posts] = await Promise.all([
        prisma.post.count({ where: whereClause }),
        prisma.post.findMany({
            where: whereClause,
            skip,
            take: parseInt(String(limit)),
            orderBy: { createdAt: 'desc' },
            include: { photos: true },
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
        include: {photos: true},
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
            const photosData = files.map(f => ({
                url: f.location,
                postId: post.id,
            }));
            await prisma.photo.createMany({data: photosData});
        }

        const full = await prisma.post.findUnique({
            where: {id},
            include: {photos: true},
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
    const { id } = req.params;

    try {
        const photos = await prisma.photo.findMany({
            where: { postId: id },
        });

        const keys = photos.map((photo) => {
            const url = new URL(photo.url);
            const fullPath = decodeURIComponent(url.pathname);
            const prefix = `/${config.S3_BUCKET_NAME}/`;
            const key = fullPath.startsWith(prefix)
                ? fullPath.slice(prefix.length)
                : fullPath.slice(1); // fallback

            return { Key: key };
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

        await prisma.photo.deleteMany({ where: { postId: id } });
        await prisma.post.delete({ where: { id } });

        res.json({ message: 'Пост и фотографии удалены' });
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Пост не найден' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Ошибка удаления поста' });
    }
}