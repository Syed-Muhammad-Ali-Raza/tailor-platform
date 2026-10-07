import { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';
import { Spinner } from '@/components/ui/Spinner';

export default function DesignsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}