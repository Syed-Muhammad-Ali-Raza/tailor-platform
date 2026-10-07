import { RequestHandler } from 'express';
import { currentUser } from '../middleware/auth.middleware';
import { body } from '../middleware/validate.middleware';
import * as authService from '../services/auth.service';

export const register: RequestHandler = async (req, res) => {
  const input = body<authService.RegisterInput>(req);
  const result = await authService.register(req.app.get('prisma'), input);
  res.status(201).json({ success: true, data: result });
};

export const login: RequestHandler = async (req, res) => {
  const input = body<authService.LoginInput>(req);
  const result = await authService.login(req.app.get('prisma'), input);
  res.status(200).json({ success: true, data: result });
};

export const me: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const result = await authService.me(req.app.get('prisma'), user.sub);
  res.status(200).json({ success: true, data: result });
};
