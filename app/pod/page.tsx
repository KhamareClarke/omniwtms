'use client';

import { Suspense } from 'react';
import { PODManagementContent } from '@/components/pod/pod-management-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function PODPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PODManagementContent />
    </Suspense>
  );
} 