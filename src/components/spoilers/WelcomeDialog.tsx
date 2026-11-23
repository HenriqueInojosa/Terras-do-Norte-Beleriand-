'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { DEFAULT_CHAPTER } from '@/data/chapters';
import type { ChapterId } from '@/lib/types';
import { ChapterList } from './ChapterPicker';
import { useReading } from './ReadingProvider';

/** No primeiro acesso, pergunta em que ponto da leitura o leitor está. */
export function WelcomeDialog() {
  const { chosen, setChapter } = useReading();
  const [pick, setPick] = useState<ChapterId>(DEFAULT_CHAPTER);
  return (
    <AnimatePresence>
      {!chosen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="panel w-full max-w-md rounded-2xl p-6"
          >
            <p className="font-caps text-[0.68rem] text-gold-400">Antes de começar</p>
            <h2 className="mt-1 font-display text-3xl text-gold-200">Até onde você leu?</h2>
            <p className="mt-2 font-display text-[1.05rem] italic leading-snug text-muted">
              O Atlas mostra só o que já foi revelado até o capítulo escolhido. Destinos, batalhas e acontecimentos
              posteriores ficam ocultos. Dá para mudar a qualquer momento no topo da página.
            </p>
            <div className="mt-4 rounded-lg border border-line/70 bg-ink-950/40 p-1.5">
              <ChapterList current={pick} onPick={setPick} />
            </div>
            <button
              type="button"
              onClick={() => setChapter(pick)}
              className="mt-5 w-full rounded-full border border-gold-400/60 bg-gold-500/15 py-2.5 font-caps text-[0.75rem] text-gold-200 transition-colors hover:bg-gold-500/25"
            >
              Entrar em Beleriand
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
