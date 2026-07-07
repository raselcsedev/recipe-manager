import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function createUploadMiddleware(folder: string) {
  const destination = path.join(process.cwd(), env.UPLOAD_DIR, folder);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (!imageMimeTypes.includes(file.mimetype)) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only JPG, PNG, and WEBP images are allowed'));
      }
      cb(null, true);
    },
    limits: {
      fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    },
  });
}
