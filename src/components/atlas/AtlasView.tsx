'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CharacterOverlay } from '@/components/characters/CharacterOverlay';
import { LinkBehaviorContext } from '@/components/ui/Links';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import type { EntityRef, TerritoryId } from '@/lib/types';
import { TYPE_LABEL, highlightFor } from '@/lib/world';
import { MapCanvas, territoryCenter, type MapCanvasHandle } from './MapCanvas';
import { TerritoryDetails } from './TerritoryDetails';

const HEADER_H = 64; // igual a --header-h em globals.css
const PANEL_W = 440;
const PERSON_W = 590; // largura do card de personagem + margem

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

export function AtlasView() {
  const world = useWorld();
  const router = useRouter();
  const params = useSearchParams();
  const map = useRef<MapCanvasHandle>(null);
  const narrow = useIsNarrow();
  const [hover, setHover] = useState<TerritoryId | null>(null);

  const r = params.get('r') as TerritoryId | null;
  const p = params.get('p');
  const selected = r && world.territories.has(r) ? r : undefined;
  const person = p && world.characters.has(p) ? p : null;
  const territory = selected ? world.territories.get(selected) : undefined;

  const setParams = useCallback(
    (next: { r?: string | null; p?: string | null }) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      const qs = sp.toString();
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
    },
    [params, router],
  );

  const related = useMemo(() => (person ? highlightFor(world, person) : []), [world, person]);

  // O card nunca cobre o reino: abre do lado oposto ao território no mapa.
  // Reino no leste → painel à esquerda; no celular, reino no sul → gaveta em cima.
  const where = useMemo(() => (selected ? territoryCenter(selected) : null), [selected]);
  const panelSide: 'left' | 'right' = !narrow && where && where.fx > 0.5 ? 'left' : 'right';
  const sheetSide: 'top' | 'bottom' = narrow && where && where.fy > 0.55 ? 'top' : 'bottom';
  const personSide: 'left' | 'right' = selected && panelSide === 'left' ? 'right' : 'left';

  const offsets = useCallback(() => {
    if (narrow) {
      const sheet = selected ? window.innerHeight * 0.52 : 0;
      return sheetSide === 'top'
        ? { offsetTop: HEADER_H + sheet }
        : { offsetTop: HEADER_H, offsetBottom: sheet };
    }
    const panel = selected ? PANEL_W + 24 : 0;
    const card = person ? PERSON_W : 0;
    const left = (panelSide === 'left' ? panel : 0) + (personSide === 'left' ? card : 0);
    const right = (panelSide === 'right' ? panel : 0) + (personSide === 'right' ? card : 0);
    return { offsetTop: HEADER_H, offsetLeft: left, offsetRight: right };
  }, [narrow, selected, person, panelSide, personSide, sheetSide]);

  // Câmera: vai para o que mudou por último — o território escolhido ou os domínios do personagem aberto
  const last = useRef<{ r?: string; p?: string | null; n?: boolean; first: boolean }>({ first: true });
  useEffect(() => {
    const prev = last.current;
    const first = prev.first;
    const changedR = selected !== prev.r;
    const changedP = person !== prev.p;
    const changedN = narrow !== prev.n;
    last.current = { r: selected, p: person, n: narrow, first: false };
    if (!first && !changedR && !changedP && !changedN) return;
    const run = () => {
      if (person && related.length && (changedP || !selected)) {
        map.current?.flyToTerritories(related, { fill: 0.5, maxRel: 3, ...offsets() });
      } else if (selected && (changedR || changedN || first)) {
        map.current?.flyToTerritories([selected], { fill: 0.5, maxRel: 3.4, ...offsets() });
      } else if (!selected && !person) {
        map.current?.fit();
      }
    };
    const id = window.setTimeout(run, first ? 350 : 0);
    return () => window.clearTimeout(id);
  }, [selected, person, related, offsets, narrow]);

  const openRef = useCallback(
    (ref: EntityRef) => {
      if (ref.kind === 'character') setParams({ p: ref.id });
      else setParams({ r: ref.id, p: null });
    },
    [setParams],
  );

  return (
    <LinkBehaviorContext.Provider value={{ open: openRef }}>
      {/* Tela cheia: o mapa fica por trás do cabeçalho, que flutua por cima */}
      <div className="fixed inset-0 overflow-hidden bg-ink-950">
        <MapCanvas
          ref={map}
          world={world}
          selected={selected}
          related={related}
          onSelect={(id) => setParams({ r: id === selected ? null : id })}
          onHover={setHover}
          className="h-full w-full"
        />

        {/* Dica de hover */}
        <AnimatePresence>
          {hover && hover !== selected && world.territories.get(hover) && (
            <motion.div
              key={hover}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="panel pointer-events-none absolute left-1/2 top-[calc(var(--header-h)+16px)] -translate-x-1/2 rounded-full px-4 py-1.5"
            >
              <span className="font-display text-lg text-gold-200">
                {world.territories.get(hover)!.velado ? 'Um vale oculto…' : world.territories.get(hover)!.nome}
              </span>
              {!world.territories.get(hover)!.velado && (
                <span className="ml-2 font-caps text-[0.58rem] text-muted">{TYPE_LABEL[world.territories.get(hover)!.tipo]}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles de zoom */}
        <div
          className={`absolute bottom-5 z-10 flex flex-col ${
            !narrow && ((selected && panelSide === 'left') || (person && personSide === 'left')) ? 'right-5' : 'left-5'
          } overflow-hidden rounded-full border border-gold-500/30 bg-ink-900/95`}
        >
          {[
            { l: '+', f: () => map.current?.zoomBy(1.6), a: 'Aproximar' },
            { l: '−', f: () => map.current?.zoomBy(1 / 1.6), a: 'Afastar' },
            {
              l: '⤢',
              f: () => {
                setParams({ r: null, p: null });
                map.current?.fit();
              },
              a: 'Ver Beleriand inteira',
            },
          ].map((b) => (
            <button
              key={b.a}
              type="button"
              aria-label={b.a}
              title={b.a}
              onClick={b.f}
              className="h-10 w-10 text-lg text-gold-300 transition-colors hover:bg-gold-500/15"
            >
              {b.l}
            </button>
          ))}
        </div>

        {!selected && !person && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="panel pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full px-5 py-1.5 font-display text-[1rem] italic text-muted md:block"
          >
            Clique num reino para conhecê-lo · role para aproximar · arraste para navegar
          </motion.div>
        )}

        {/* Painel do território */}
        <AnimatePresence>
          {territory && (
            <motion.aside
              key={narrow ? `sheet-${sheetSide}` : `panel-${panelSide}`}
              initial={
                narrow
                  ? { x: 0, y: sheetSide === 'top' ? '-100%' : '100%', opacity: 1 }
                  : { x: panelSide === 'left' ? -(PANEL_W + 40) : PANEL_W + 40, y: 0, opacity: 0.4 }
              }
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={
                narrow
                  ? { x: 0, y: sheetSide === 'top' ? '-100%' : '100%', opacity: 1 }
                  : { x: panelSide === 'left' ? -(PANEL_W + 40) : PANEL_W + 40, y: 0, opacity: 0 }
              }
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={`panel absolute z-20 flex flex-col overflow-hidden ${
                narrow
                  ? sheetSide === 'top'
                    ? 'inset-x-0 top-[var(--header-h)] h-[52%] rounded-b-2xl'
                    : 'inset-x-0 bottom-0 h-[52%] rounded-t-2xl'
                  : `bottom-3 top-[calc(var(--header-h)+12px)] rounded-2xl ${panelSide === 'left' ? 'left-3' : 'right-3'}`
              }`}
              style={narrow ? undefined : { width: PANEL_W }}
            >
              <button
                type="button"
                onClick={() => setParams({ r: null })}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/30 text-gold-300 transition-colors hover:bg-gold-500/15"
                aria-label="Fechar"
              >
                ✕
              </button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={territory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 overflow-y-auto px-6 pb-6 pt-6"
                >
                  <TerritoryDetails
                    territory={territory}
                    compact
                    onCharacter={(id) => setParams({ p: id })}
                    onTerritory={(id) => setParams({ r: id })}
                  />
                  {!territory.velado && (
                    <Link
                      href={`/reinos/${territory.id}/`}
                      className="mt-6 inline-flex items-center gap-2 font-caps text-[0.66rem] text-gold-300 transition-colors hover:text-gold-200"
                    >
                      Ficha completa <span aria-hidden>→</span>
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.aside>
          )}
        </AnimatePresence>

        <CharacterOverlay
          id={person}
          onClose={() => setParams({ p: null })}
          onPick={(id) => setParams({ p: id })}
          onTerritory={(id) => setParams({ r: id, p: null })}
          mapHref={false}
          backdrop={false}
          side={personSide}
        />
      </div>
    </LinkBehaviorContext.Provider>
  );
}
