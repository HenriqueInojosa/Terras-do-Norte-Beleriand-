'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { HexPortrait } from '@/components/ui/HexPortrait';
import { FactParagraphs, SourceTag } from '@/components/ui/Links';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import type { TerritoryId } from '@/lib/types';
import { territoriesRuledBy } from '@/lib/world';
import { KinshipTree } from './Kinship';

/**
 * Card do personagem aberto por cima de qualquer tela: resumo, família navegável e territórios.
 * Ao trocar de parente, o card troca com uma transição, sem fechar.
 */
export function CharacterOverlay({
  id,
  onClose,
  onPick,
  onTerritory,
  mapHref = true,
  backdrop = true,
  side = 'left',
}: {
  id: string | null;
  onClose: () => void;
  onPick: (id: string) => void;
  onTerritory?: (id: TerritoryId) => void;
  mapHref?: boolean;
  backdrop?: boolean;
  /** lado da tela onde o card abre */
  side?: 'left' | 'right';
}) {
  const world = useWorld();
  const c = id ? world.characters.get(id) : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ruled = c ? territoriesRuledBy(world, c.id) : [];
  const house = c?.casa ? world.houses.find((h) => h.id === c.casa) : undefined;
  const people = c ? world.peoples.get(c.povo) : undefined;

  return (
    <AnimatePresence>
      {c && backdrop && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-30 bg-ink-950/45 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
        />
      )}
      {c && (
        <motion.aside
          key="card"
          role="dialog"
          aria-label={c.nome}
          initial={{ opacity: 0, x: side === 'left' ? -40 : 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: side === 'left' ? -30 : 30, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`panel fixed bottom-3 ${side === 'left' ? 'left-3' : 'right-3'} top-[calc(var(--header-h)+12px)] z-30 flex w-[min(560px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/30 text-gold-300 transition-colors hover:bg-gold-500/15"
            aria-label="Fechar"
          >
            ✕
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 overflow-y-auto px-6 pb-6 pt-6"
            >
              <div className="flex items-center gap-5">
                <HexPortrait world={world} character={c} width={104} active />
                <div className="min-w-0">
                  <p className="font-caps text-[0.6rem] text-gold-400">
                    {[people?.nome, house?.nome].filter(Boolean).join(' · ')}
                  </p>
                  <h2 className="font-display text-[2.3rem] leading-none text-gold-200">{c.nome}</h2>
                  {c.titulos.length > 0 && (
                    <p className="mt-1.5 font-display text-[1.05rem] italic text-muted">{c.titulos.join(' · ')}</p>
                  )}
                  {c.outrosNomes.length > 0 && (
                    <p className="font-display text-[0.9rem] italic text-faint">Também chamado {c.outrosNomes.join(', ')}</p>
                  )}
                  {c.fonte === 'complementar' && <SourceTag />}
                </div>
              </div>

              <div className="rule-gold my-5" />
              <FactParagraphs facts={c.biografia} className="font-display text-[1.12rem] text-fg/90" />
              {c.nota && <p className="mt-3 border-l border-deep-300/40 pl-3 font-display text-[0.95rem] italic text-deep-300">{c.nota}</p>}

              {ruled.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="mr-1 font-caps text-[0.58rem] text-gold-400">Governa</span>
                  {ruled.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onTerritory?.(t.id)}
                      className="chip transition-colors hover:bg-gold-500/15"
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-xl border border-line/60 bg-ink-950/35 p-4">
                <KinshipTree character={c} onPick={onPick} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {c.casa && (
                  <Link href={`/genealogias/${c.casa}/?foco=${c.id}`} className="chip py-1.5 hover:bg-gold-500/15">
                    Árvore completa
                  </Link>
                )}
                <Link href={`/personagens/${c.id}/`} className="chip py-1.5 hover:bg-gold-500/15">
                  Ficha completa
                </Link>
                {mapHref && ruled.length > 0 && (
                  <Link href={`/?p=${c.id}`} className="chip py-1.5 hover:bg-gold-500/15">
                    Ver no mapa
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
