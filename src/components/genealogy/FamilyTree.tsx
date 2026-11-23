'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CharacterOverlay } from '@/components/characters/CharacterOverlay';
import { HexPortrait } from '@/components/ui/HexPortrait';
import { PanZoom, type PanZoomHandle } from '@/components/ui/PanZoom';
import { HiddenNotice } from '@/components/spoilers/HiddenNotice';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import { CARD_H, CARD_W, layoutHouse } from '@/lib/family-layout';
import type { HouseId } from '@/lib/types';
import { childrenOf, parentsOf, siblingsOf, spousesOf } from '@/lib/world';

const PAD_X = 120;
const PAD_TOP = 90;
const EASE = [0.22, 1, 0.36, 1] as const;

export function FamilyTree({ house }: { house: HouseId }) {
  const world = useWorld();
  const router = useRouter();
  const params = useSearchParams();
  const camera = useRef<PanZoomHandle>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const foco = params.get('foco');
  const h = world.houses.find((x) => x.id === house);

  const layout = useMemo(() => layoutHouse(world, house, collapsed), [world, house, collapsed]);
  const W = layout.width + PAD_X * 2;
  const H = layout.height + PAD_TOP + 40;
  const ox = (layout.offsetX ?? 0) + PAD_X;

  // parentes destacados ao passar o mouse (ou do personagem em foco)
  const anchor = hover ?? foco;
  const kin = useMemo(() => {
    if (!anchor || !world.characters.has(anchor)) return null;
    return new Set([
      anchor,
      ...parentsOf(world, anchor).map((c) => c.id),
      ...spousesOf(world, anchor).map((c) => c.id),
      ...childrenOf(world, anchor).map((c) => c.id),
      ...siblingsOf(world, anchor).map((s) => s.character.id),
    ]);
  }, [anchor, world]);

  // câmera no personagem em foco
  useEffect(() => {
    if (!foco) return;
    const p = layout.people.find((x) => x.id === foco);
    if (!p) return;
    const t = window.setTimeout(
      () => camera.current?.flyTo({ x: p.x + ox - 260, y: p.y + PAD_TOP - 200, w: 520, h: CARD_H + 400 }, { fill: 0.9, maxRel: 1.6 }),
      250,
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco, house]);

  if (!h) return <HiddenNotice what="Esta casa" />;

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setFoco = (id: string) => {
    const c = world.characters.get(id);
    if (c?.casa && c.casa !== house) router.replace(`/genealogias/${c.casa}/?foco=${id}`, { scroll: false });
    else router.replace(`/genealogias/${house}/?foco=${id}`, { scroll: false });
  };

  return (
    <div className="relative h-[calc(100dvh-var(--header-h))] overflow-hidden">
      {/* Cabeçalho da casa */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center pt-6">
        <div className="pointer-events-auto panel flex gap-1 rounded-full p-1">
          {world.houses.map((x) => (
            <Link
              key={x.id}
              href={`/genealogias/${x.id}/`}
              className={`relative rounded-full px-4 py-1.5 font-caps text-[0.64rem] transition-colors ${
                x.id === house ? 'text-ink-950' : 'text-muted hover:text-fg'
              }`}
            >
              {x.id === house && (
                <motion.span layoutId="casa-ativa" className="absolute inset-0 rounded-full bg-gold-300" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{x.nome}</span>
            </Link>
          ))}
        </div>
        <h1 className="mt-4 font-display text-[2.6rem] leading-none text-gold-200" style={{ textShadow: '0 2px 20px #000' }}>
          <span className="mr-2 italic text-gold-400">A</span>
          {h.nome}
        </h1>
        <p className="font-display text-lg italic text-muted">{h.lema}</p>
      </div>

      <PanZoom ref={camera} width={W} height={H} minRel={0.6} maxRel={3} className="h-full w-full">
        <Knot cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.42} />
        <svg width={W} height={H} className="absolute inset-0 overflow-visible">
          <g transform={`translate(${ox} ${PAD_TOP})`}>
            <AnimatePresence>
              {layout.edges.map((e) => {
                const on = !kin || e.between.filter((b) => kin.has(b)).length >= 2;
                return (
                  <motion.g key={e.id} initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0.18 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <motion.path
                      d={e.d}
                      animate={{ d: e.d }}
                      transition={{ duration: 0.6, ease: EASE }}
                      fill="none"
                      stroke={kin && on ? '#e6cd8c' : '#8a7448'}
                      strokeWidth={kin && on ? 1.6 : 1.1}
                      strokeDasharray={e.kind === 'irmaos' ? '4 5' : undefined}
                    />
                    {e.label && (
                      <motion.text
                        animate={{ x: e.label.x, y: e.label.y }}
                        transition={{ duration: 0.6, ease: EASE }}
                        textAnchor="middle"
                        className="font-display"
                        fontStyle="italic"
                        fontSize="14"
                        fill="#a8987c"
                      >
                        {e.label.text}
                      </motion.text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
        </svg>

        <AnimatePresence>
          {layout.people.map((p) => {
            const c = world.characters.get(p.id)!;
            const dim = !!kin && !kin.has(p.id);
            const isFoco = foco === p.id;
            return (
              <motion.div
                key={p.id}
                className="absolute left-0 top-0"
                initial={{ opacity: 0, x: p.x + ox - CARD_W / 2, y: p.y + PAD_TOP - 20, scale: 0.9 }}
                animate={{ opacity: dim ? 0.5 : 1, x: p.x + ox - CARD_W / 2, y: p.y + PAD_TOP, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ width: CARD_W }}
              >
                <button
                  type="button"
                  onPointerEnter={() => setHover(p.id)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => {
                    setOpen(p.id);
                    setFoco(p.id);
                  }}
                  className="group flex w-full flex-col items-center"
                >
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
                    <HexPortrait world={world} character={c} width={CARD_W} active={isFoco || hover === p.id} dim={dim} />
                  </motion.div>
                  <span
                    className={`mt-2.5 w-[148px] text-center font-display text-[1.15rem] leading-tight transition-colors ${
                      isFoco ? 'text-gold-200' : 'text-fg group-hover:text-gold-200'
                    }`}
                  >
                    {c.nome}
                  </span>
                  {c.titulos.length > 0 && (
                    <span className="w-[148px] text-center font-display text-[0.82rem] italic leading-tight text-muted">[{c.titulos.at(-1)}]</span>
                  )}
                  {p.foreign && <span className="chip mt-1 scale-90">outra casa</span>}
                </button>
                {p.hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className="absolute left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-gold-500/50 bg-ink-900 text-[0.8rem] leading-none text-gold-300 transition-colors hover:bg-gold-500/20"
                    style={{ top: CARD_H + 52 }}
                    aria-label={p.collapsed ? 'Mostrar descendentes' : 'Recolher descendentes'}
                    title={p.collapsed ? 'Mostrar descendentes' : 'Recolher descendentes'}
                  >
                    {p.collapsed ? '+' : '−'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </PanZoom>

      <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="panel rounded-full px-5 py-1.5 font-display text-[1rem] italic text-muted">
          Passe o mouse para ver os parentes · clique para abrir · − recolhe um ramo
        </div>
      </div>

      <CharacterOverlay
        id={open}
        onClose={() => setOpen(null)}
        onPick={(id) => {
          setOpen(id);
          setFoco(id);
        }}
        onTerritory={(id) => router.push(`/?r=${id}`)}
      />
    </div>
  );
}

/** Nó celta decorativo atrás da árvore (desenho original). */
function Knot({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const rings = [0, 1, 2, 3].map((i) => {
    const a = (Math.PI / 2) * i + Math.PI / 4;
    return { x: cx + Math.cos(a) * r * 0.36, y: cy + Math.sin(a) * r * 0.36 };
  });
  return (
    <svg className="pointer-events-none absolute inset-0" width="100%" height="100%" aria-hidden>
      <g fill="none" stroke="#b8923f" opacity="0.07">
        <circle cx={cx} cy={cy} r={r} strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r - 22} strokeWidth="2" />
        {rings.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={r * 0.5} strokeWidth="14" />
        ))}
      </g>
    </svg>
  );
}
