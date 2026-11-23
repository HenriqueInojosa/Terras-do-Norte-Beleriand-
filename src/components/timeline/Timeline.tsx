'use client';

import { motion } from 'motion/react';
import { PageHeading } from '@/components/layout/PageHeading';
import { EntityLink } from '@/components/ui/Links';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import { chapterRef } from '@/data/chapters';
import { entityName } from '@/lib/world';

const ERA_LABEL = { 'anos-das-arvores': 'Anos das Árvores', 'primeira-era': 'Primeira Era do Sol' } as const;

/** Linha do tempo: estrutura pronta, poucos eventos por enquanto. */
export function Timeline() {
  const world = useWorld();
  const eras = (['anos-das-arvores', 'primeira-era'] as const).filter((e) => world.timeline.some((x) => x.era === e));
  return (
    <div className="pb-24">
      <PageHeading
        kicker="Em construção"
        title="Linha do tempo"
        intro="A estrutura da Primeira Era, pronta para crescer junto com a leitura. Por enquanto, só os marcos até o capítulo 14."
      />
      <div className="mx-auto max-w-3xl px-5">
        {eras.map((era) => (
          <section key={era} className="mb-12">
            <h2 className="mb-6 text-center font-caps text-[0.72rem] text-gold-300">{ERA_LABEL[era]}</h2>
            <ol className="relative border-l border-gold-500/30 pl-8">
              {world.timeline
                .filter((e) => e.era === era)
                .map((e, i) => (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mb-8"
                  >
                    <span className="absolute -left-[39px] top-2 h-3.5 w-3.5 rotate-45 border border-gold-400 bg-ink-900" />
                    <div className="panel rounded-xl p-5">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-2xl text-gold-200">{e.titulo}</h3>
                        <span className="font-caps text-[0.58rem] text-faint">{chapterRef(e.revelado)}</span>
                      </div>
                      <p className="mt-1 font-display text-[1.1rem] leading-relaxed text-fg/85">{e.descricao}</p>
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-display text-[0.98rem]">
                        {e.envolvidos.map((r) => {
                          const name = entityName(world, r);
                          return name ? (
                            <EntityLink key={r.id} refTo={r}>
                              {name}
                            </EntityLink>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </motion.li>
                ))}
            </ol>
          </section>
        ))}
        <p className="text-center font-display italic text-faint">Novos eventos entram em src/data/timeline.ts, cada um com o capítulo em que é revelado.</p>
      </div>
    </div>
  );
}
