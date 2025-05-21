import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/auth';
import { ChangePasswordInput } from '../schemas/password';

const prisma = new PrismaClient();

export async function changePassword(
    req: Request<{}, {}, ChangePasswordInput>,
    res: Response
):
    Promise<void> {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as AuthRequest).userId;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: 'Exception' });
            return;
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Exception' });
            return;
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNew },
        });

        res.json({ message: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Exception' });
    }
}