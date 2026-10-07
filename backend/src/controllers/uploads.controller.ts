import { RequestHandler } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { ok } from '../utils/http';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const storage = multer.memoryStorage();

export const uploadMiddleware: RequestHandler = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      cb(new AppError('VALIDATION_ERROR', 'Only jpg, png, and webp images are allowed'));
      return;
    }
    cb(null, true);
  },
}).single('file');

export const upload: RequestHandler = (req, res) => {
  if (!req.file) {
    throw new AppError('VALIDATION_ERROR', 'A file field named "file" is required');
  }
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const ext = ALLOWED[req.file.mimetype] ?? 'bin';
  const name = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), req.file.buffer);
  ok(res, { url: `/uploads/${name}` }, 201);
};
