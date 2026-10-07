import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { body, query } from '../middleware/validate.middleware';
import * as catalogService from '../services/catalog.service';
import * as authService from '../services/auth.service';
import { noContent, ok } from '../utils/http';
import { Pagination, parsePagination } from '../utils/pagination';

async function tailorIdOf(req: any): Promise<string> {
  const user = currentUser(req);
  const tailor = await authService.requireTailorRow(req.app.get('prisma'), user.sub);
  return tailor.id;
}

export const list: RequestHandler = async (req, res) => {
  const params = query<{ audience?: string; category?: string; tailorId?: string; q?: string }>(req);
  const pagination: Pagination = parsePagination(req.query);
  const result = await catalogService.listDesigns(req.app.get('prisma'), params, pagination);
  ok(res, result);
};

export const detail: RequestHandler = async (req, res) => {
  const result = await catalogService.getDesign(req.app.get('prisma'), String(req.params.id));
  ok(res, result);
};

export const tailorList: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  const result = await catalogService.listTailorDesigns(req.app.get('prisma'), tailorId);
  ok(res, result);
};

export const create: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  const input = body<{ name: string; audience: string; category: string; basePrice: number; images?: string[]; description?: string; active?: boolean }>(req);
  const result = await catalogService.createDesign(req.app.get('prisma'), tailorId, input);
  res.status(201).json({ success: true, data: result });
};

export const update: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  const input = body<Record<string, unknown>>(req);
  const result = await catalogService.updateDesign(
    req.app.get('prisma'),
    String(req.params.id),
    tailorId,
    input,
  );
  ok(res, result);
};

export const remove: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  await catalogService.deleteDesign(req.app.get('prisma'), String(req.params.id), tailorId);
  noContent(res);
};

export const createFabric: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  const input = body<{ name: string; pricePerMeter: number; extraCharge?: number; image?: string }>(req);
  const result = await catalogService.createFabric(
    req.app.get('prisma'),
    String(req.params.id),
    tailorId,
    input,
  );
  res.status(201).json({ success: true, data: result });
};

export const deleteFabric: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  await catalogService.deleteFabric(req.app.get('prisma'), String(req.params.id), tailorId);
  noContent(res);
};

export const createOption: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  const input = body<{ type: string; name: string; extraPrice?: number }>(req);
  const result = await catalogService.createOption(
    req.app.get('prisma'),
    String(req.params.id),
    tailorId,
    input,
  );
  res.status(201).json({ success: true, data: result });
};

export const deleteOption: RequestHandler = async (req, res) => {
  const tailorId = await tailorIdOf(req);
  await catalogService.deleteOption(req.app.get('prisma'), String(req.params.id), tailorId);
  noContent(res);
};
