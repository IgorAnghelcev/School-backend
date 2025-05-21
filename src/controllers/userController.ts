import {Request, Response} from 'express';
import {PrismaClient, Role} from '@prisma/client';
import bcrypt from 'bcryptjs';
import {CreateUserInput} from '../schemas/user';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;

export async function registerUser(
    req: Request<{}, {}, CreateUserInput>,
    res: Response
): Promise<void> {
    const {name, password} = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                password: hashed,
                role: Role.USER,
            }
        });

        const payload = {userId: user.id, role: user.role};


        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '7d',
        });


        res.cookie('t', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });


        const {password: _, ...userSafe} = user;
        res.status(201).json(userSafe);
        return;
    } catch (e: any) {
        if (e.code === 'P2002') {
            res
                .status(409)
                .json({error: 'Пользователь с таким именем уже существует'});
            return;
        }
        console.error(e);
        res.status(500).json({error: 'Внутренняя ошибка сервера'});
        return;
    }
}
