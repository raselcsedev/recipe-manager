import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';

const SALT_ROUNDS = 12;

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const payload = { userId: user.id, tokenVersion: 0 };
  return {
    user,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const payload = { userId: user.id, tokenVersion: user.tokenVersion };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const { verifyRefreshToken } = await import('../../utils/jwt');
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  return signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion });
}
