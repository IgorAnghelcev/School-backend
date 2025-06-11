import {Request, Response} from 'express';
import {PrismaClient, Role} from '@prisma/client';
import bcrypt from 'bcryptjs';
import {CreateUserInput, UserId} from '../schemas/user';
import jwt from "jsonwebtoken";
import {config} from "../config/config";

const prisma = new PrismaClient();


const JWT_SECRET = config.JWT_SECRET!;

export async function registerUser(
    req: Request<{}, {}, CreateUserInput>,
    res: Response
): Promise<void> {
    const {name, password, email} = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: Role.USER,
            }
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




export async function generateJwtToUser(
    req: Request<{}, {}, UserId>,
    res: Response,
): Promise<void> {
    try {
        const {id} = req.body;

        const user = await prisma.user.findUnique({where: {id}});
        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        if (user.role !== 'ADMIN') {
            res.status(403).json({error: 'Access denied'});
            return;
        }

        // Генерируем токен
        const payload = {userId: user.id, role: user.role};
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});

        res.cookie('t', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        res.status(200)
            .json(
                {user: payload}
            );
    } catch (err) {
        res.status(500);
    }
}


