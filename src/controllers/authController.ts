import {Request, Response} from 'express';
import {prisma} from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {LoginInput} from '../schemas/auth';
import {config} from "../config/config";

const JWT_SECRET = config.JWT_SECRET!;

export async function loginUser(
    req: Request<{}, {}, LoginInput>,
    res: Response
): Promise<void> {
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findFirst({where: {email: email}});
        if (!user) {
            res.status(401).json({error: 'Неверные имя или пароль'});
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({error: 'Неверные имя или пароль'});
            return;
        }

        if (user.role === 'ADMIN') {
            const payload = {userId: user.id, role: user.role};
            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});

            res.cookie('t', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });

        }

        const {password: _, ...userSafe} = user;
        res.json(userSafe);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({error: 'Внутренняя ошибка сервера'});
    }
}

export async function logoutUser(
    req: Request<{}, {}, LoginInput>,
    res: Response
): Promise<void> {

    res.cookie('t', "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });

}

