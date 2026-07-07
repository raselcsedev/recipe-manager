import { Response } from 'express';

export function sendSuccess(res: Response, data: unknown, meta?: unknown, statusCode = 200) {
  const payload: Record<string, unknown> = { success: true, data };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}
