import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import * as designsController from '../controllers/designs.controller';

const createDesignSchema = z.object({
  name: z.string().min(2).max(120),
  audience: z.enum(['MEN', 'WOMEN']),
  category: z.enum([
    'SHALWAR_KAMEEZ',
    'KURTA',
    'WAISTCOAT',
    'KAMEEZ_SHALWAR',
    'SUIT',
    'TROUSER',
    'OTHER',
  ]),
  basePrice: z.number().positive().max(1000000),
  images: z.array(z.string().max(500)).max(12).optional(),
  description: z.string().max(2000).optional(),
  active: z.boolean().optional(),
});

const updateDesignSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  audience: z.enum(['MEN', 'WOMEN']).optional(),
  category: z
    .enum([
      'SHALWAR_KAMEEZ',
      'KURTA',
      'WAISTCOAT',
      'KAMEEZ_SHALWAR',
      'SUIT',
      'TROUSER',
      'OTHER',
    ])
    .optional(),
  basePrice: z.number().positive().max(1000000).optional(),
  images: z.array(z.string().max(500)).max(12).optional(),
  description: z.string().max(2000).optional(),
  active: z.boolean().optional(),
});

const fabricSchema = z.object({
  name: z.string().min(1).max(80),
  pricePerMeter: z.number().nonnegative().max(100000),
  extraCharge: z.number().nonnegative().max(100000).optional(),
  image: z.string().max(500).optional(),
});

const optionSchema = z.object({
  type: z.enum([
    'COLLAR',
    'CUFF',
    'FRONT',
    'POCKET',
    'TROUSER_STYLE',
    'NECKLINE',
    'SLEEVE',
    'SHAPE',
    'BOTTOM_STYLE',
    'EXTRA',
  ]),
  name: z.string().min(1).max(80),
  extraPrice: z.number().nonnegative().max(100000).optional(),
});

export function createTailorRouter(): Router {
  const router = Router();
  router.use(requireAuth, requireRole('TAILOR'));

  router.get('/designs', designsController.tailorList);
  router.post('/designs', validateBody(createDesignSchema), designsController.create);
  router.put('/designs/:id', validateBody(updateDesignSchema), designsController.update);
  router.delete('/designs/:id', designsController.remove);
  router.post('/designs/:id/fabrics', validateBody(fabricSchema), designsController.createFabric);
  router.delete('/fabrics/:id', designsController.deleteFabric);
  router.post('/designs/:id/options', validateBody(optionSchema), designsController.createOption);
  router.delete('/options/:id', designsController.deleteOption);
  return router;
}
