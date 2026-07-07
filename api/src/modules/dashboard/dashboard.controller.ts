import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import { getDashboardCounts } from './dashboard.service';

export const getDashboardHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const counts = await getDashboardCounts(req.user!.userId);
    return sendSuccess(res, counts);
  } catch (error) {
    next(error);
  }
};
