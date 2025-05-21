import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {config} from "../config/config";

const JWT_SECRET = config.JWT_SECRET!;

export interface AuthRequest extends Request {
    userId?: string;
    role?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const token =
        req.cookies?.t;

    if (!token) {
        res.status(403).json({error: 'Forbidden'});
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        req.userId = payload.userId;
        req.role = payload.role;
        if(payload.role !== 'ADMIN') {
            res.status(403).json({error: 'Forbidden'});
            return;
        }
        next();
    } catch {
        res.status(500).json({error: 'Undefined'});
        return;
    }
}
