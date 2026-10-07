import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { body } from '../middleware/validate.middleware';
import * as measurementService from '../services/measurement.service';
import { noContent, ok } from '../utils/http';

export const list: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const result = await measurementService.listMeasurements(req.app.get('prisma'), user.sub);
  ok(res, result);
};

export const create: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<measurementService.MeasurementInput>(req);
  const result = await measurementService.createMeasurement(req.app.get('prisma'), user.sub, input);
  res.status(201).json({ success: true, data: result });
};

export const update: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ label?: string; values?: Record<string, number> }>(req);
  const result = await measurementService.updateMeasurement(
    req.app.get('prisma'),
    String(req.params.id),
    user.sub,
    input,
  );
  ok(res, result);
};

export const remove: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  await measurementService.deleteMeasurement(req.app.get('prisma'), String(req.params.id), user.sub);
  noContent(res);
};
