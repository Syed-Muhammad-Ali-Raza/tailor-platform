import { OrderFlow } from '@/components/order/OrderFlow';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ designId: string }>;
}) {
  const { designId } = await params;
  return <OrderFlow designId={designId} />;
}