import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { query } from '../middleware/validate.middleware';
import * as dashboardService from '../services/dashboard.service';
import { ok } from '../utils/http';
import { parsePagination } from '../utils/pagination';

export const summary: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const result = await dashboardService.summary(req.app.get('prisma'), user.sub);
  ok(res, result);
};

export const orders: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const params = query<{ status?: string }>(req);
  const pagination = parsePagination(req.query);
  const result = await dashboardService.orders(
    req.app.get('prisma'),
    user.sub,
    params.status,
    pagination,
  );
  ok(res, result);
};
