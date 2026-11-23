'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { chapterIndex, chapterShortLabel, chapters, getChapter } from '@/data/chapters';
import type { ChapterId } from '@/lib/types';
import { useReading } from './ReadingProvider';

/** Lista de capítulos: os já lidos mostram o título; os futuros, só o número (alguns títulos são spoilers). */
export function ChapterList({ current, onPick }: { current: ChapterId; onPick: (c: ChapterId) => void }) {
  const cur = chapterIndex(current);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelector('[data-current="true"]')?.scrollIntoView({ block: 'center' });
  }, []);
  let lastPart = '';
  return (
    <div ref={listRef} className="max-h-[52vh] overflow-y-auto pr-1">
      {chapters.map((c, i) => {
        const header = c.parte !== lastPart && c.numero !== undefined && c.numero === 1;
        lastPart = c.parte;
        const read = i <= cur;
        return (
          <div key={c.id}>
            {header && <div className="mt-2 px-3 pb-1 pt-2 font-caps text-[0.6rem] text-faint">Quenta Silmarillion</div>}
            <button
              type="button"
              data-current={i === cur}
              onClick={() => onPick(c.id)}
              className={`flex w-full items-baseline gap-3 rounded-md px-3 py-1.5 text-left transition-colors ${
                i === cur ? 'bg-gold-500/15 text-gold-200' : read ? 'text-fg hover:bg-gold-500/8' : 'text-faint hover:bg-white/5 hover:text-muted'
              }`}
            >
              <span className="w-9 shrink-0 font-caps text-[0.62rem] opacity-70">{c.numero ?? '·'}</span>
              <span className="font-display text-[1rem] leading-snug">
                {read || i === cur + 1 ? (c.numero ? c.titulo : c.parte) : chapterShortLabel(c)}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ChapterPicker() {
  const { settings, setChapter, setShowComplementar } = useReading();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getChapter(settings.chapter);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/5 px-2.5 py-1.5 sm:px-3 transition-colors hover:border-gold-400/60"
        aria-expanded={open}
        title="O Atlas esconde o que vem depois deste ponto da leitura"
      >
        <BookIcon />
        <span className="font-caps text-[0.66rem] text-gold-300">
          <span className="hidden sm:inline">Lendo: </span>
          {current.numero ? <><span className="hidden sm:inline">cap. </span>{current.numero}</> : current.parte}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="panel absolute right-0 top-full mt-2 w-[min(92vw,380px)] rounded-xl p-3"
          >
            <p className="px-3 pb-2 font-display text-[0.98rem] italic text-muted">
              Até onde você leu? Tudo o que vem depois fica oculto.
            </p>
            <ChapterList
              current={settings.chapter}
              onPick={(c) => {
                setChapter(c);
                setOpen(false);
              }}
            />
            <div className="rule-gold my-3" />
            <label className="flex cursor-pointer items-start gap-3 px-3 pb-1">
              <input
                type="checkbox"
                checked={settings.showComplementar}
                onChange={(e) => setShowComplementar(e.target.checked)}
                className="mt-1 accent-[#b8923f]"
              />
              <span className="font-display text-[0.95rem] leading-snug text-muted">
                Mostrar fontes complementares
                <span className="block text-[0.85rem] italic text-faint">Informações de outros escritos de Tolkien, como Argon.</span>
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1b16a" strokeWidth="1.5">
      <path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5Z" />
      <path d="M12 6v13.5" />
    </svg>
  );
}
