'use client';

import { motion } from 'motion/react';
import { HexPortrait } from '@/components/ui/HexPortrait';
import { EntityLink } from '@/components/ui/Links';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import { childrenOf, parentsOf, siblingsOf, spousesOf, type ResolvedCharacter } from '@/lib/world';

/** Mini árvore de um personagem: pais, a pessoa com cônjuges, filhos e irmãos. */
export function KinshipTree({ character, onPick }: { character: ResolvedCharacter; onPick?: (id: string) => void }) {
  const world = useWorld();
  const parents = parentsOf(world, character.id);
  const spouses = spousesOf(world, character.id);
  const children = childrenOf(world, character.id);
  const siblings = siblingsOf(world, character.id);

  const Node = ({ c, label, me }: { c: ResolvedCharacter; label?: string; me?: boolean }) => (
    <motion.button
      type="button"
      layout
      onClick={() => onPick?.(c.id)}
      disabled={me}
      whileHover={me ? undefined : { y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group flex w-[76px] flex-col items-center gap-1.5 disabled:cursor-default"
    >
      <HexPortrait world={world} character={c} width={me ? 64 : 52} active={me} />
      <span className={`text-center font-display leading-tight ${me ? 'text-[0.95rem] text-gold-200' : 'text-[0.85rem] text-fg group-hover:text-gold-200'}`}>
        {c.nome}
      </span>
      {label && <span className="-mt-1 font-caps text-[0.5rem] text-faint">{label}</span>}
    </motion.button>
  );

  const Row = ({ title, children: kids }: { title: string; children: React.ReactNode }) => (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <span className="font-caps text-[0.58rem] text-gold-400">{title}</span>
        <span className="rule-gold flex-1" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-3">{kids}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      {parents.length > 0 && (
        <Row title="Pais">
          {parents.map((p) => (
            <Node key={p.id} c={p} />
          ))}
        </Row>
      )}
      <div className="flex items-center justify-center gap-1">
        <Node c={character} me />
        {spouses.map((s) => (
          <div key={s.id} className="flex items-center">
            <span className="mx-1 mb-8 font-display text-[0.75rem] italic text-muted">casou com</span>
            <Node c={s} />
          </div>
        ))}
      </div>
      {children.length > 0 && (
        <Row title="Filhos">
          {children.map((c) => (
            <Node key={c.id} c={c} />
          ))}
        </Row>
      )}
      {siblings.length > 0 && (
        <Row title="Irmãos">
          {siblings.map((s) => (
            <Node key={s.character.id} c={s.character} label={s.meio ? 'meio-irmão' : undefined} />
          ))}
        </Row>
      )}
    </div>
  );
}

/** Lista textual de parentes, com links (para a ficha completa). */
export function KinshipFacts({ character }: { character: ResolvedCharacter }) {
  const world = useWorld();
  const rows: [string, React.ReactNode][] = [];
  const list = (cs: ResolvedCharacter[]) =>
    cs.map((c, i) => (
      <span key={c.id}>
        {i > 0 && ', '}
        <EntityLink refTo={{ kind: 'character', id: c.id }}>{c.nome}</EntityLink>
      </span>
    ));
  const parents = parentsOf(world, character.id);
  const spouses = spousesOf(world, character.id);
  const children = childrenOf(world, character.id);
  const siblings = siblingsOf(world, character.id);
  if (parents.length) rows.push(['Pais', list(parents)]);
  if (siblings.length)
    rows.push([
      'Irmãos',
      siblings.map((s, i) => (
        <span key={s.character.id}>
          {i > 0 && ', '}
          <EntityLink refTo={{ kind: 'character', id: s.character.id }}>{s.character.nome}</EntityLink>
          {s.meio && <span className="italic opacity-70"> (meio-irmão)</span>}
        </span>
      )),
    ]);
  if (spouses.length) rows.push(['Cônjuge', list(spouses)]);
  if (children.length) rows.push(['Filhos', list(children)]);
  if (!rows.length) return null;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="pt-1 font-caps text-[0.6rem] text-gold-400">{k}</dt>
          <dd className="font-display text-[1.05rem]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
