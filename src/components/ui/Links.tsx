'use client';

import Link from 'next/link';
import { createContext, useContext } from 'react';
import type { EntityRef, Fato } from '@/lib/types';
import { parseRich } from '@/lib/world';
import { chapterRef } from '@/data/chapters';
import { useWorld } from '@/components/spoilers/ReadingProvider';

/**
 * Como um link de entidade se comporta depende de onde ele está:
 * no Atlas abre o card por cima do mapa; nas outras páginas navega para a ficha.
 */
export interface LinkBehavior {
  open?: (ref: EntityRef) => void;
}
export const LinkBehaviorContext = createContext<LinkBehavior>({});

export function hrefFor(ref: EntityRef) {
  return ref.kind === 'character' ? `/personagens/${ref.id}/` : `/reinos/${ref.id}/`;
}

export function EntityLink({ refTo, children, className }: { refTo: EntityRef; children: React.ReactNode; className?: string }) {
  const behavior = useContext(LinkBehaviorContext);
  if (behavior.open) {
    return (
      <button type="button" className={`entity-link ${className ?? ''}`} onClick={() => behavior.open!(refTo)}>
        {children}
      </button>
    );
  }
  return (
    <Link href={hrefFor(refTo)} className={`entity-link ${className ?? ''}`}>
      {children}
    </Link>
  );
}

export function RichText({ text }: { text: string }) {
  const world = useWorld();
  return (
    <>
      {parseRich(world, text).map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <EntityLink key={i} refTo={seg.ref}>
            {seg.text}
          </EntityLink>
        ),
      )}
    </>
  );
}

/** Parágrafos com a etiqueta discreta do capítulo e da fonte de cada um. */
export function FactParagraphs({ facts, className }: { facts: Fato<string>[]; className?: string }) {
  return (
    <div className={`space-y-3 leading-relaxed ${className ?? ''}`}>
      {facts.map((f, i) => (
        <p key={i}>
          <RichText text={f.valor} />{' '}
          <span className="whitespace-nowrap align-middle font-caps text-[0.6rem] opacity-50">
            {chapterRef(f.revelado)}
          </span>
          {f.fonte === 'complementar' && <SourceTag />}
        </p>
      ))}
    </div>
  );
}

export function SourceTag() {
  return (
    <span
      title="Informação de fora de O Silmarillion publicado"
      className="ml-1.5 inline-block rounded-sm border border-deep-300/40 px-1.5 align-middle font-caps text-[0.55rem] text-deep-300"
    >
      complementar
    </span>
  );
}
