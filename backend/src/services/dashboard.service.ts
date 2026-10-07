import * as orderModel from '../models/order.model';
import * as authService from './auth.service';
import { serializeOrderSummary } from './order.service';
import { PrismaLike } from '../types/deps';
import { Pagination } from '../utils/pagination';
import { toMoney } from '../utils/price';

export async function summary(prisma: PrismaLike, userId: string) {
  const tailor = await authService.requireTailorRow(prisma, userId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [groups, newToday, activeOrders, readyOrders, deliveredThisMonth, revenue] =
    await Promise.all([
      orderModel.dashboardStatusCounts(prisma, tailor.id),
      orderModel.countOrdersSince(prisma, tailor.id, startOfDay),
      orderModel.countOrders(prisma, tailor.id, 'STITCHING'),
      orderModel.countOrders(prisma, tailor.id, 'READY'),
      prisma.order.count({
        where: {
          tailorId: tailor.id,
          status: 'DELIVERED',
          updatedAt: { gte: startOfMonth },
        },
      }),
      orderModel.sumExpectedRevenue(prisma, tailor.id),
    ]);

  const ordersByStatus: Record<string, number> = {};
  for (const group of groups) {
    ordersByStatus[group.status] = group._count._all;
  }

  return {
    newToday,
    activeOrders,
    readyOrders,
    deliveredThisMonth,
    expectedRevenue: toMoney(revenue._sum.totalPrice ?? 0),
    ordersByStatus,
  };
}

export async function orders(
  prisma: PrismaLike,
  userId: string,
  status: string | undefined,
  pagination: Pagination,
) {
  const tailor = await authService.requireTailorRow(prisma, userId);
  const [rows, total] = await Promise.all([
    orderModel.listOrdersByTailor(prisma, tailor.id, status, pagination),
    orderModel.countOrders(prisma, tailor.id, status),
  ]);
  return {
    orders: rows.map(serializeOrderSummary),
    page: pagination.page,
    limit: pagination.limit,
    total,
  };
}
