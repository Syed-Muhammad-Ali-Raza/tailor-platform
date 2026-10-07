import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { body } from '../middleware/validate.middleware';
import * as reviewService from '../services/review.service';
import { ok } from '../utils/http';
import { Pagination, parsePagination } from '../utils/pagination';

export const create: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ rating: number; comment?: string }>(req);
  const result = await reviewService.createReview(
    req.app.get('prisma'),
    user.sub,
    String(req.params.id),
    input,
  );
  res.status(201).json({ success: true, data: result });
};

export const update: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ rating?: number; comment?: string }>(req);
  const result = await reviewService.updateReview(
    req.app.get('prisma'),
    user.sub,
    String(req.params.id),
    input,
  );
  ok(res, result);
};

export const listByDesign: RequestHandler = async (req, res) => {
  const pagination: Pagination = parsePagination(req.query);
  const result = await reviewService.listDesignReviews(
    req.app.get('prisma'),
    String(req.params.id),
    pagination,
  );
  ok(res, result);
};