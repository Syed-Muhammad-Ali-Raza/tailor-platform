import { cache } from '../utils/cache';
import { AppError, notFound } from '../utils/errors';
import { Pagination } from '../utils/pagination';
import * as designModel from '../models/design.model';
import * as tailorModel from '../models/tailor.model';
import { PrismaLike } from '../types/deps';

const TTL = 30_000;

export async function listDesigns(
  prisma: PrismaLike,
  filters: designModel.DesignFilters,
  pagination: Pagination,
) {
  const key = `designs:${JSON.stringify(filters)}:${pagination.page}:${pagination.limit}`;
  return cache.getOrSet(key, TTL, async () => {
    const [designs, total] = await Promise.all([
      designModel.listDesigns(prisma, filters, pagination),
      designModel.countDesigns(prisma, filters),
    ]);
    return {
      designs: designs.map((d) => ({
        id: d.id,
        tailorId: d.tailorId,
        name: d.name,
        audience: d.audience,
        category: d.category,
        basePrice: Number(d.basePrice),
        images: d.images,
        active: d.active,
        tailorName: d.tailor?.shopName ?? null,
      })),
      page: pagination.page,
      limit: pagination.limit,
      total,
    };
  });
}

export async function getDesign(prisma: PrismaLike, id: string) {
  const design = await designModel.findDesignById(prisma, id);
  if (!design || !design.active) throw notFound('Design not found');
  return { design: serializeDesignDetail(design) };
}

export function serializeDesignDetail(design: {
  id: string;
  tailorId: string;
  name: string;
  audience: string;
  category: string;
  basePrice: unknown;
  images: string[];
  description: string | null;
  active: boolean;
  tailor?: { id: string; shopName: string; whatsapp: string; city: string; rating: number };
  fabrics?: {
    id: string;
    name: string;
    pricePerMeter: unknown;
    extraCharge: unknown;
    image: string | null;
  }[];
  options?: { id: string; type: string; name: string; extraPrice: unknown }[];
}) {
  return {
    id: design.id,
    tailorId: design.tailorId,
    name: design.name,
    audience: design.audience,
    category: design.category,
    basePrice: Number(design.basePrice),
    images: design.images,
    description: design.description,
    active: design.active,
    tailor: design.tailor
      ? {
          id: design.tailor.id,
          shopName: design.tailor.shopName,
          whatsapp: design.tailor.whatsapp,
          city: design.tailor.city,
          rating: design.tailor.rating,
        }
      : undefined,
    fabrics: (design.fabrics ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      pricePerMeter: Number(f.pricePerMeter),
      extraCharge: Number(f.extraCharge),
      image: f.image,
    })),
    styleOptions: (design.options ?? []).map((o) => ({
      id: o.id,
      type: o.type,
      name: o.name,
      extraPrice: Number(o.extraPrice),
    })),
  };
}

export async function listTailors(prisma: PrismaLike, filters: { city?: string; q?: string }) {
  const key = `tailors:${JSON.stringify(filters)}`;
  return cache.getOrSet(key, TTL, async () => {
    const tailors = await tailorModel.listTailors(prisma, filters);
    return {
      tailors: tailors.map((t) => ({
        id: t.id,
        userId: t.userId,
        shopName: t.shopName,
        address: t.address,
        city: t.city,
        area: t.area,
        whatsapp: t.whatsapp,
        bio: t.bio,
        rating: t.rating,
        servesWomen: t.servesWomen,
        femaleStaff: t.femaleStaff,
        portfolioImages: t.portfolioImages,
      })),
    };
  });
}

export async function getTailor(prisma: PrismaLike, id: string) {
  const tailor = await tailorModel.findTailorById(prisma, id);
  if (!tailor) throw notFound('Tailor not found');
  return {
    tailor: {
      id: tailor.id,
      userId: tailor.userId,
      shopName: tailor.shopName,
      address: tailor.address,
      city: tailor.city,
      area: tailor.area,
      whatsapp: tailor.whatsapp,
      bio: tailor.bio,
      rating: tailor.rating,
      servesWomen: tailor.servesWomen,
      femaleStaff: tailor.femaleStaff,
      portfolioImages: tailor.portfolioImages,
    },
  };
}

function invalidateCatalog(): void {
  cache.invalidate('designs:');
  cache.invalidate('tailors:');
}

export async function createDesign(
  prisma: PrismaLike,
  tailorId: string,
  input: {
    name: string;
    audience: string;
    category: string;
    basePrice: number;
    images?: string[];
    description?: string;
    active?: boolean;
  },
) {
  const design = await designModel.createDesign(prisma, tailorId, input);
  invalidateCatalog();
  return { design: { ...design, basePrice: Number(design.basePrice) } };
}

export async function updateDesign(
  prisma: PrismaLike,
  designId: string,
  tailorId: string,
  input: Record<string, unknown>,
) {
  const existing = await designModel.findOwnedDesign(prisma, designId, tailorId);
  if (!existing) throw notFound('Design not found');
  const updated = await designModel.updateDesign(prisma, designId, input);
  invalidateCatalog();
  return { design: { ...updated, basePrice: Number(updated.basePrice) } };
}

export async function deleteDesign(prisma: PrismaLike, designId: string, tailorId: string) {
  const existing = await designModel.findOwnedDesign(prisma, designId, tailorId);
  if (!existing) throw notFound('Design not found');
  await designModel.deleteDesign(prisma, designId);
  invalidateCatalog();
}

export async function listTailorDesigns(prisma: PrismaLike, tailorId: string) {
  const designs = await designModel.listTailorDesigns(prisma, tailorId);
  return { designs: designs.map((d) => serializeDesignDetail(d)) };
}

async function requireDesignForTailor(prisma: PrismaLike, designId: string, tailorId: string) {
  const design = await designModel.findOwnedDesign(prisma, designId, tailorId);
  if (!design) throw notFound('Design not found');
  return design;
}

export async function createFabric(
  prisma: PrismaLike,
  designId: string,
  tailorId: string,
  input: { name: string; pricePerMeter: number; extraCharge?: number; image?: string },
) {
  await requireDesignForTailor(prisma, designId, tailorId);
  const fabric = await designModel.createFabric(prisma, { ...input, designId, tailorId });
  invalidateCatalog();
  return { fabric: { ...fabric, pricePerMeter: Number(fabric.pricePerMeter), extraCharge: Number(fabric.extraCharge) } };
}

export async function deleteFabric(prisma: PrismaLike, fabricId: string, tailorId: string) {
  const fabric = await designModel.findFabric(prisma, fabricId, tailorId);
  if (!fabric) throw notFound('Fabric not found');
  await designModel.deleteFabric(prisma, fabricId);
  invalidateCatalog();
}

export async function createOption(
  prisma: PrismaLike,
  designId: string,
  tailorId: string,
  input: { type: string; name: string; extraPrice?: number },
) {
  await requireDesignForTailor(prisma, designId, tailorId);
  const option = await designModel.createOption(prisma, { ...input, designId, tailorId });
  invalidateCatalog();
  return { styleOption: { ...option, extraPrice: Number(option.extraPrice) } };
}

export async function deleteOption(prisma: PrismaLike, optionId: string, tailorId: string) {
  const option = await designModel.findOption(prisma, optionId, tailorId);
  if (!option) throw notFound('Style option not found');
  await designModel.deleteOption(prisma, optionId);
  invalidateCatalog();
}

export async function assertDesignActive(prisma: PrismaLike, designId: string) {
  const design = await designModel.findDesignById(prisma, designId);
  if (!design || !design.active) throw new AppError('NOT_FOUND', 'Design not found');
  return design;
}
