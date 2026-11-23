'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { PageHeading } from '@/components/layout/PageHeading';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import type { TerritoryType } from '@/lib/types';
import { TYPE_LABEL, effectiveRulers } from '@/lib/world';
import { MiniMap } from './MiniMap';

const ORDER: { tipo: TerritoryType[]; titulo: string }[] = [
  { tipo: ['reino'], titulo: 'Reinos' },
  { tipo: ['territorio', 'regiao'], titulo: 'Territórios e regiões' },
  { tipo: ['fortaleza', 'passagem'], titulo: 'Fortalezas e passagens' },
];

export function RealmsIndex() {
  const world = useWorld();
  const all = [...world.territories.values()];
  let n = 0;
  return (
    <div className="pb-24">
      <PageHeading
        kicker="Enciclopédia"
        title="Reinos de Beleriand"
        intro="Os reinos dos Elfos e dos Anões em Beleriand, como o capítulo 14 os descreve. Só aparece o que já foi revelado na sua leitura."
      />
      <div className="mx-auto max-w-6xl space-y-14 px-5">
        {ORDER.map((g) => {
          const items = all.filter((t) => g.tipo.includes(t.tipo));
          if (!items.length) return null;
          return (
            <section key={g.titulo}>
              <div className="mb-5 flex items-center gap-4">
                <h2 className="font-caps text-[0.75rem] text-gold-300">{g.titulo}</h2>
                <span className="rule-gold flex-1" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => {
                  const { rulers } = effectiveRulers(world, t.id);
                  const i = n++;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={t.velado ? `/?r=${t.id}` : `/reinos/${t.id}/`}
                        className="group panel block overflow-hidden rounded-2xl transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-gold-400/50"
                      >
                        <div className="relative h-40 overflow-hidden">
                          {t.imagem ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.imagem}
                              alt=""
                              className="h-full w-full scale-105 object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-115"
                            />
                          ) : (
                            <MiniMap
                              id={t.id}
                              veiled={t.velado}
                              className="h-full w-full scale-105 transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-115"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/10 to-transparent" />
                          <span className="chip absolute left-4 top-4 bg-ink-950/60 backdrop-blur">{t.velado ? 'Oculto' : TYPE_LABEL[t.tipo]}</span>
                        </div>
                        <div className="px-5 pb-5 pt-1">
                          <h3 className="font-display text-[1.75rem] leading-tight text-gold-200">{t.nome}</h3>
                          <p className="font-display text-[1rem] italic text-muted">
                            {t.velado
                              ? 'Ainda não revelado'
                              : rulers.length
                                ? rulers.map((r) => r.nome).join(' e ')
                                : t.significado ?? 'Sem governante próprio'}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
