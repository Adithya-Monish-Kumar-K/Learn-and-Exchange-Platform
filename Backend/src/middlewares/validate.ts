import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

type Targets = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, target: Targets = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse((req as any)[target]);
      (req as any)[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
  return res.status(400).json({ message: 'Validation failed', issues: err.issues });
      }
      next(err);
    }
  };
}
