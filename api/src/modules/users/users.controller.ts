import fs from 'fs/promises';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/ApiResponse';
import { getProfile, updateProfile, updateAvatar, changePassword } from './users.service';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';

export const getProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getProfile(req.user!.userId);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await updateProfile(req.user!.userId, req.body.name);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Avatar file is required' });
    }

    const relativePath = path.join('avatars', req.file.filename).replace(/\\/g, '/');
    const { oldAvatar, updated } = await updateAvatar(req.user!.userId, relativePath);

    if (oldAvatar) {
      const oldFile = path.join(process.cwd(), env.UPLOAD_DIR, oldAvatar);
      fs.unlink(oldFile).catch(() => undefined);
    }

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const updated = await changePassword(req.user!.userId, currentPassword, newPassword);

    const payload = { userId: req.user!.userId, tokenVersion: updated.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { message: 'Password changed successfully', accessToken });
  } catch (error) {
    next(error);
  }
};
