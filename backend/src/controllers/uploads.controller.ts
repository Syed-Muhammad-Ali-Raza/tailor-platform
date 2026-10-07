import { RequestHandler } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env';
import { currentUser } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';
import { AppError, notFound } from '../utils/errors';
import { ok } from '../utils/http';

export const PRIVATE_UPLOADS_DIR = path.join(process.cwd(), 'uploads-private');

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
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
  fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
  const ext = ALLOWED[req.file.mimetype] ?? 'bin';
  const name = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(PRIVATE_UPLOADS_DIR, name), req.file.buffer);
  ok(res, { url: `/uploads/${name}` }, 201);
};

export const servePrivateUpload: RequestHandler = async (req, res, next) => {
  try {
    const user = currentUser(req);
    const raw = req.params.name;
    const name = path.basename(typeof raw === 'string' ? raw : (raw?.[0] ?? ''));
    const ext = path.extname(name).slice(1);
    if (!name || !EXT_TO_MIME[ext]) throw notFound('Upload not found');

    const prisma = req.app.get('prisma');
    const order = await prisma.order.findFirst({
      where: { referencePhotoUrl: { endsWith: `/uploads/${name}` } },
    });
    if (!order) throw notFound('Upload not found');

    if (user.role === 'ADMIN') {
      void 0;
    } else if (user.role === 'CUSTOMER') {
      if (order.customerId !== user.sub) throw notFound('Upload not found');
    } else if (user.role === 'TAILOR') {
      const tailor = await authService.requireTailorRow(prisma, user.sub);
      if (order.tailorId !== tailor.id) throw notFound('Upload not found');
    } else {
      throw notFound('Upload not found');
    }

    const filePath = path.join(PRIVATE_UPLOADS_DIR, name);
    res.setHeader('Content-Type', EXT_TO_MIME[ext]);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.sendFile(filePath, (err) => {
      if (err) next(notFound('Upload not found'));
    });
  } catch (err) {
    next(err);
  }
};