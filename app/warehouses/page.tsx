'use client';

import { Suspense } from 'react';
import { WarehousesContent } from '@/components/warehouses/warehouses-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WarehouseOperations } from '@/components/warehouses/warehouse-operations';

export default function WarehousesPage() {
  return (
    <div className="space-y-8">
    <Suspense fallback={<LoadingSpinner />}>
      <WarehousesContent />
    </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <WarehouseOperations warehouseId={null} />
      </Suspense>
    </div>
  );
}