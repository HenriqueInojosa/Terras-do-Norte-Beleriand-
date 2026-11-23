'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PageHeading } from '@/components/layout/PageHeading';
import { HexPortrait } from '@/components/ui/HexPortrait';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import type { HouseId, PeopleId } from '@/lib/types';

export function CharactersIndex() {
  const world = useWorld();
  const [house, setHouse] = useState<HouseId | 'todas' | 'outros'>('todas');
  const [people, setPeople] = useState<PeopleId | 'todos'>('todos');

  const list = useMemo(
    () =>
      [...world.characters.values()].filter(
        (c) =>
          (house === 'todas' || (house === 'outros' ? !c.casa : c.casa === house)) &&
          (people === 'todos' || c.povo === people),
      ),
    [world, house, people],
  );
  const peoples = [...new Set([...world.characters.values()].map((c) => c.povo))];

  const Filter = <T extends string>({ group, value, current, set, children }: { group: string; value: T; current: T; set: (v: T) => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => set(value)}
      className={`relative rounded-full px-3.5 py-1.5 font-caps text-[0.64rem] transition-colors ${
        current === value ? 'text-ink-950' : 'text-muted hover:text-fg'
      }`}
    >
      {current === value && (
        <motion.span layoutId={`filtro-${group}`} className="absolute inset-0 rounded-full bg-gold-300" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
      )}
      <span className="relative">{children}</span>
    </button>
  );

  return (
    <div className="pb-24">
      <PageHeading
        kicker="Enciclopédia"
        title="Personagens"
        intro="Os príncipes e senhores da Primeira Era. Clique num retrato para abrir a ficha, a família e os domínios."
      />
      <div className="mx-auto mb-10 flex max-w-6xl flex-col items-center gap-3 px-5">
        <div className="panel flex flex-wrap justify-center gap-1 rounded-full p-1">
          <Filter value="todas" group="casa" current={house} set={setHouse}>Todas as casas</Filter>
          {world.houses.map((h) => (
            <Filter key={h.id} value={h.id} group="casa" current={house} set={setHouse}>
              {h.nome}
            </Filter>
          ))}
          <Filter value="outros" group="casa" current={house} set={setHouse}>Outros</Filter>
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <Filter value="todos" group="povo" current={people} set={setPeople}>Todos os povos</Filter>
          {peoples.map((p) => (
            <Filter key={p} value={p} group="povo" current={people} set={setPeople}>
              {world.peoples.get(p)?.nome ?? p}
            </Filter>
          ))}
        </div>
      </div>
      <motion.div layout className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 px-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <AnimatePresence mode="popLayout">
          {list.map((c, i) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.025, 0.4), ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/personagens/${c.id}/`} className="group flex flex-col items-center text-center">
                <div className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5">
                  <HexPortrait world={world} character={c} width={118} />
                </div>
                <span className="mt-3 font-display text-[1.25rem] leading-tight text-fg transition-colors group-hover:text-gold-200">{c.nome}</span>
                {c.titulos.length > 0 && (
                  <span className="mt-0.5 font-display text-[0.88rem] italic leading-tight text-muted">[{c.titulos.at(-1)}]</span>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
