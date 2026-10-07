import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { body, query } from '../middleware/validate.middleware';
import * as orderService from '../services/order.service';
import { ok } from '../utils/http';

export const create: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<orderService.CreateOrderInput>(req);
  const result = await orderService.createOrder(req.app.get('prisma'), user.sub, input);
  res.status(201).json({ success: true, data: result });
};

export const list: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const params = query<{ status?: string }>(req);
  const result = await orderService.listOrders(req.app.get('prisma'), user, params.status);
  ok(res, result);
};

export const detail: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const result = await orderService.getOrder(req.app.get('prisma'), String(req.params.id), user);
  ok(res, result);
};

export const cancel: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ reason?: string }>(req);
  const result = await orderService.cancelOrder(
    req.app.get('prisma'),
    String(req.params.id),
    user,
    input.reason,
  );
  ok(res, result);
};

export const status: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ status: string; note?: string }>(req);
  const result = await orderService.advanceStatus(
    req.app.get('prisma'),
    String(req.params.id),
    user,
    input.status,
    input.note,
  );
  ok(res, result);
};

export const quote: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ finalPrice: number }>(req);
  const result = await orderService.quoteOrder(
    req.app.get('prisma'),
    String(req.params.id),
    user,
    input.finalPrice,
  );
  ok(res, result);
};
