import { RealmPage } from '@/components/atlas/RealmPage';
import { territories } from '@/data/territories';
import type { TerritoryId } from '@/lib/types';

export function generateStaticParams() {
  return territories.map((t) => ({ id: t.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RealmPage id={id as TerritoryId} />;
}
