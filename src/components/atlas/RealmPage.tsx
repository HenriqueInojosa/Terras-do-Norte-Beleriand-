'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import type { TerritoryId } from '@/lib/types';
import { MiniMap } from './MiniMap';
import { TerritoryDetails } from './TerritoryDetails';
import { HiddenNotice } from '@/components/spoilers/HiddenNotice';

export function RealmPage({ id }: { id: TerritoryId }) {
  const world = useWorld();
  const router = useRouter();
  const t = world.territories.get(id);
  if (!t) return <HiddenNotice what="Este lugar" />;
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-24 pt-10 lg:grid-cols-[1fr_380px]">
      <article className="panel rounded-2xl p-7 md:p-10">
        <Link href="/reinos/" className="font-caps text-[0.62rem] text-muted transition-colors hover:text-gold-300">
          ← Reinos
        </Link>
        <div className="mt-4">
          <TerritoryDetails
            territory={t}
            onCharacter={(c) => router.push(`/personagens/${c}/`)}
            onTerritory={(v) => router.push(`/reinos/${v}/`)}
          />
        </div>
      </article>
      <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <Link href={`/?r=${t.id}`} className="group panel block overflow-hidden rounded-2xl">
          <MiniMap id={t.id} veiled={t.velado} zoom={3.4} className="aspect-square w-full transition-transform duration-[1.2s] group-hover:scale-105" />
          <div className="flex items-center justify-between px-5 py-3">
            <span className="font-caps text-[0.66rem] text-gold-300">Ver no Atlas</span>
            <span className="text-gold-400 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </Link>
      </aside>
    </div>
  );
}
