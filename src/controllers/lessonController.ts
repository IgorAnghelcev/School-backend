import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { CreateLessonInput, UpdateLessonInput } from '../schemas/lesson';

export async function createLesson(
    req: Request<{}, {}, CreateLessonInput>,
    res: Response
): Promise<void> {
    const { scheduleId, period, subject } = req.body;
    try {
        const lesson = await prisma.lesson.create({
            data: { scheduleId, period, subject },
        });
        res.status(201).json(lesson);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getAllLessons(
    _req: Request,
    res: Response
): Promise<void> {
    const lessons = await prisma.lesson.findMany();
    res.json(lessons);
}

export async function getLessonById(
    req: Request<{ id: string }>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
    }
    res.json(lesson);
}

export async function updateLesson(
    req: Request<{ id: string }, {}, UpdateLessonInput['body']>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    const data = req.body;
    try {
        const updated = await prisma.lesson.update({ where: { id }, data });
        res.json(updated);
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteLesson(
    req: Request<{ id: string }>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    try {
        await prisma.lesson.delete({ where: { id } });
        res.status(204).send();
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}