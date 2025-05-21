import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { CreateClassInput, UpdateClassInput } from '../schemas/class';

export async function createClass(
    req: Request<{}, {}, CreateClassInput>,
    res: Response
): Promise<void> {
    const { grade, section } = req.body;
    try {
        const newClass = await prisma.class.create({
            data: { grade, section },
        });
        res.status(201).json(newClass);
    } catch (e: any) {
        if (e.code === 'P2002') {
            res.status(409).json({ error: 'Class with this grade and section already exists' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getAllClasses(
    _req: Request,
    res: Response
): Promise<void> {
    const classes = await prisma.class.findMany({
        include: { schedules: true },
    });
    res.json(classes);
}

export async function getClassById(
    req: Request<{ id: string }>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    const cls = await prisma.class.findUnique({
        where: { id },
        include: { schedules: true },
    });
    if (!cls) {
        res.status(404).json({ error: 'Class not found' });
        return;
    }
    res.json(cls);
}

export async function updateClass(
    req: Request<{ id: string }, {}, UpdateClassInput['body']>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    const data = req.body;
    try {
        const updated = await prisma.class.update({
            where: { id },
            data,
        });
        res.json(updated);
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Class not found' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteClass(
    req: Request<{ id: string }>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    try {
        await prisma.class.delete({ where: { id } });
        res.status(204).send();
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Class not found' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
