import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { CreateScheduleInput, UpdateScheduleInput } from '../schemas/schedule';

export async function createSchedule(
    req: Request<{}, {}, CreateScheduleInput>,
    res: Response
): Promise<void> {
    const { classId, dayOfWeek } = req.body;
    try {
        const schedule = await prisma.schedule.create({
            data: { classId, dayOfWeek },
        });
        res.status(201).json(schedule);
    } catch (e: any) {
        if (e.code === 'P2002') {
            res.status(409).json({ error: 'Schedule for this class and day already exists' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getAllSchedules(
    _req: Request,
    res: Response
): Promise<void> {
    const schedules = await prisma.schedule.findMany({ include: { lessons: true } });
    res.json(schedules);
}

export async function getScheduleById(
    req: Request<{ id: string }>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: { lessons: true },
    });
    if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
    }
    res.json(schedule);
}

export async function updateSchedule(
    req: Request<{ id: string }, {}, UpdateScheduleInput['body']>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    const data = req.body;
    try {
        const updated = await prisma.schedule.update({ where: { id }, data });
        res.json(updated);
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Schedule not found' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteSchedule(
    req: Request<{ id: string }>,
    res: Response
): Promise<void> {
    const { id } = req.params;
    try {
        await prisma.schedule.delete({ where: { id } });
        res.status(204).send();
    } catch (e: any) {
        if (e.code === 'P2025') {
            res.status(404).json({ error: 'Schedule not found' });
            return;
        }
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
