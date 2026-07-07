import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, refreshAccessToken } from './auth.service';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: undefined as number | undefined,
  };
}

export const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const auth = await registerUser(name, email, password);
    res.cookie('refreshToken', auth.refreshToken, {
      ...refreshCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return sendSuccess(res, { user: auth.user, accessToken: auth.accessToken }, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const loginHandler = [
  loginLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const auth = await loginUser(email, password);
      res.cookie('refreshToken', auth.refreshToken, {
        ...refreshCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return sendSuccess(res, { user: auth.user, accessToken: auth.accessToken });
    } catch (error) {
      next(error);
    }
  },
];

export const refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw ApiError.unauthorized('Missing refresh token');
    }
    const accessToken = await refreshAccessToken(refreshToken);
    return sendSuccess(res, { accessToken });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', refreshCookieOptions());
  return sendSuccess(res, { message: 'Logged out successfully' });
};
