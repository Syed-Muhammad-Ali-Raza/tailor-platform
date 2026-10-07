import { DesignDetailView } from '@/components/catalog/DesignDetailView';

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DesignDetailView id={id} />;
}