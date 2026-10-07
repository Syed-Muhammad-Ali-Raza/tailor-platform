import { RequestHandler } from 'express';
import { query } from '../middleware/validate.middleware';
import * as catalogService from '../services/catalog.service';
import { ok } from '../utils/http';

export const list: RequestHandler = async (req, res) => {
  const params = query<{ city?: string; q?: string }>(req);
  const result = await catalogService.listTailors(req.app.get('prisma'), params);
  ok(res, result);
};

export const detail: RequestHandler = async (req, res) => {
  const result = await catalogService.getTailor(req.app.get('prisma'), String(req.params.id));
  ok(res, result);
};
