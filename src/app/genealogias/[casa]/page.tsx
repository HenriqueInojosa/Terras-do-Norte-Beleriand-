import { Suspense } from 'react';
import { FamilyTree } from '@/components/genealogy/FamilyTree';
import { houses } from '@/data/genealogies';
import type { HouseId } from '@/lib/types';

export const metadata = { title: 'Genealogias · Atlas de Beleriand' };

export function generateStaticParams() {
  return houses.map((h) => ({ casa: h.id }));
}

export default async function Page({ params }: { params: Promise<{ casa: string }> }) {
  const { casa } = await params;
  return (
    <Suspense fallback={null}>
      <FamilyTree house={casa as HouseId} />
    </Suspense>
  );
}
