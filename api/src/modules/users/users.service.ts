import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { ApiError } from '../../utils/ApiError';

const SALT_ROUNDS = 12;

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

export async function updateProfile(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateAvatar(userId: string, relativePath: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatar: relativePath },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { oldAvatar: user.avatar, updated };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 },
    },
    select: {
      id: true,
      tokenVersion: true,
    },
  });

  return updated;
}
