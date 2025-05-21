import { RequestHandler, NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate =
    (schema: ZodSchema<any>): RequestHandler =>
        (req: Request, res: Response, next: NextFunction): void => {
            try {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                next();
            } catch (err) {
                if (err instanceof ZodError) {
                    const errors = err.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    }));
                    res.status(400).json({ errors });
                    return;
                }
                next(err as any);
            }
        };
