'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import { TYPE_LABEL } from '@/lib/world';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface Item {
  key: string;
  label: string;
  sub: string;
  href: string;
  haystack: string;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const world = useWorld();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const t of world.territories.values()) {
      if (t.velado) continue;
      out.push({
        key: `t-${t.id}`,
        label: t.nome,
        sub: `${TYPE_LABEL[t.tipo]}${t.significado ? ` · ${t.significado}` : ''}`,
        href: `/?r=${t.id}`,
        haystack: norm([t.nome, ...t.outrosNomes, t.significado ?? ''].join(' ')),
      });
    }
    for (const c of world.characters.values()) {
      out.push({
        key: `c-${c.id}`,
        label: c.nome,
        sub: c.titulos.at(-1) ?? 'Personagem',
        href: `/personagens/${c.id}/`,
        haystack: norm([c.nome, ...c.outrosNomes, ...c.titulos].join(' ')),
      });
    }
    return out;
  }, [world]);

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return items.slice(0, 8);
    return items
      .filter((i) => i.haystack.includes(n))
      .sort((a, b) => Number(!norm(a.label).startsWith(n)) - Number(!norm(b.label).startsWith(n)))
      .slice(0, 10);
  }, [items, q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);

  const go = (i?: Item) => {
    if (!i) return;
    onClose();
    router.push(i.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/60 px-4 pt-[14vh] backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="panel w-full max-w-lg overflow-hidden rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'ArrowDown') setSel((s) => Math.min(s + 1, results.length - 1));
                if (e.key === 'ArrowUp') setSel((s) => Math.max(s - 1, 0));
                if (e.key === 'Enter') go(results[sel]);
              }}
              placeholder="Buscar reinos e personagens…"
              className="w-full border-b border-gold-500/20 bg-transparent px-5 py-4 font-display text-xl text-fg placeholder:italic placeholder:text-faint focus:outline-none"
            />
            <ul className="max-h-[50vh] overflow-y-auto p-1.5">
              {results.map((r, i) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => go(r)}
                    className={`flex w-full items-baseline justify-between gap-4 rounded-lg px-4 py-2.5 text-left transition-colors ${
                      i === sel ? 'bg-gold-500/12' : ''
                    }`}
                  >
                    <span className="font-display text-lg text-gold-200">{r.label}</span>
                    <span className="truncate font-display text-[0.95rem] italic text-muted">{r.sub}</span>
                  </button>
                </li>
              ))}
              {!results.length && (
                <li className="px-4 py-6 text-center font-display italic text-muted">
                  Nada encontrado até o seu ponto de leitura.
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
