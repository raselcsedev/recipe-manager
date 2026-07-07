import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function validate(schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const toValidate = req[source] as unknown;
    const result = schema.safeParse(toValidate);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }

    (req as any)[source] = result.data;
    next();
  };
}
