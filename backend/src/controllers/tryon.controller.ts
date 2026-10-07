import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { body } from '../middleware/validate.middleware';
import * as tryonService from '../services/tryon.service';

export const preview: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = body<{ designId: string; photoBase64?: string }>(req);
  const result = await tryonService.preview(
    req.app.get('prisma'),
    req.app.get('tryOnProvider'),
    user.sub,
    input,
  );
  res.status(201).json({ success: true, data: result });
};
