import { Suspense } from 'react';
import { AtlasView } from '@/components/atlas/AtlasView';

export default function AtlasPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100dvh-var(--header-h))]" />}>
      <AtlasView />
    </Suspense>
  );
}
