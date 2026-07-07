import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '.env.test');
dotenv.config({ path: envPath });
process.env.NODE_ENV = 'test';

const uploadDir = process.env.UPLOAD_DIR ?? 'uploads_test';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
