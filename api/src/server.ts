import 'dotenv/config';
import fs from 'fs';
import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const uploads = [env.UPLOAD_DIR, `${env.UPLOAD_DIR}/avatars`, `${env.UPLOAD_DIR}/recipes`];
for (const folder of uploads) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
