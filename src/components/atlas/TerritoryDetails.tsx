'use client';

import { HexPortrait } from '@/components/ui/HexPortrait';
import { EntityLink, FactParagraphs } from '@/components/ui/Links';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import { chapterRef } from '@/data/chapters';
import { RELATION_LABEL, TYPE_LABEL, effectiveRulers, entityName, relationsOf, type ResolvedTerritory } from '@/lib/world';
import type { TerritoryId } from '@/lib/types';

/** Conteúdo da ficha de um território (usado no painel do Atlas e na página do reino). */
export function TerritoryDetails({
  territory: t,
  onCharacter,
  onTerritory,
  compact = false,
}: {
  territory: ResolvedTerritory;
  onCharacter?: (id: string) => void;
  onTerritory?: (id: TerritoryId) => void;
  compact?: boolean;
}) {
  const world = useWorld();
  const { rulers, inherited } = effectiveRulers(world, t.id);
  const parent = t.parteDe ? world.territories.get(t.parteDe) : undefined;

  if (t.velado) {
    return (
      <div>
        <p className="font-caps text-[0.62rem] text-gold-400">Lugar oculto</p>
        <h2 className="mt-1 font-display text-[2.4rem] leading-none text-gold-200">{t.nome}</h2>
        <div className="rule-gold my-5" />
        <FactParagraphs facts={t.descricao} className="font-display text-[1.12rem] text-fg/90" />
        <p className="mt-5 rounded-lg border border-line/60 bg-ink-950/40 p-4 font-display text-[1rem] italic text-muted">
          O livro ainda não revelou o nome nem a forma deste lugar até o capítulo que você está lendo.
        </p>
      </div>
    );
  }

  const politics = rulers.flatMap((r) => relationsOf(world, { kind: 'character', id: r.id })).filter((r) => r.tipo !== 'governa');
  const seenPol = new Set<string>();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-6">
      <div className="mb-2.5 flex items-center gap-3">
        <h3 className="font-caps text-[0.6rem] text-gold-400">{title}</h3>
        <span className="rule-gold flex-1" />
      </div>
      {children}
    </section>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{TYPE_LABEL[t.tipo]}</span>
        {parent && (
          <span className="font-display text-[0.95rem] italic text-muted">
            parte de{' '}
            <button type="button" className="entity-link" onClick={() => onTerritory?.(parent.id)}>
              {parent.nome}
            </button>
          </span>
        )}
      </div>
      <h2 className="mt-2 font-display text-[2.6rem] leading-none text-gold-200">{t.nome}</h2>
      {(t.significado || t.outrosNomes.length > 0) && (
        <p className="mt-1.5 font-display text-[1.05rem] italic text-muted">
          {t.significado && `“${t.significado}”`}
          {t.outrosNomes.length > 0 && ` · também ${t.outrosNomes.join(', ')}`}
        </p>
      )}

      <Section title={inherited ? `Governante (de ${parent?.nome})` : rulers.length > 1 ? 'Governantes' : 'Governante'}>
        {rulers.length ? (
          <div className="flex flex-wrap gap-3">
            {rulers.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onCharacter?.(r.id)}
                className="group flex items-center gap-3 rounded-xl border border-transparent p-1.5 pr-4 text-left transition-all hover:border-gold-500/25 hover:bg-gold-500/5"
              >
                <HexPortrait world={world} character={r} width={54} />
                <span>
                  <span className="block font-display text-[1.3rem] leading-tight text-gold-200 group-hover:text-gold-100">{r.nome}</span>
                  <span className="block font-display text-[0.92rem] italic leading-tight text-muted">{r.titulos.at(-1)}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="font-display text-[1rem] italic text-muted">Sem governante próprio.</p>
        )}
      </Section>

      <Section title="Resumo">
        <FactParagraphs facts={t.descricao} className="font-display text-[1.12rem] text-fg/90" />
      </Section>

      {t.localizacao.length > 0 && (
        <Section title="Localização">
          <p className="font-display text-[1.05rem] leading-relaxed text-fg/85">{t.localizacao[0]}</p>
        </Section>
      )}

      {!compact && politics.length > 0 && (
        <Section title="Relações políticas">
          <ul className="space-y-1.5 font-display text-[1.02rem]">
            {politics
              .filter((r) => (seenPol.has(r.id) ? false : (seenPol.add(r.id), true)))
              .map((r) => (
                <li key={r.id}>
                  <EntityLink refTo={r.de}>{entityName(world, r.de)}</EntityLink>{' '}
                  <span className="italic text-muted">{RELATION_LABEL[r.tipo]}</span>{' '}
                  <EntityLink refTo={r.para}>{entityName(world, r.para)}</EntityLink>
                </li>
              ))}
          </ul>
        </Section>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {t.povos.length > 0 && (
          <div>
            <h3 className="mb-2 font-caps text-[0.6rem] text-gold-400">Povos</h3>
            <div className="flex flex-wrap gap-1.5">
              {t.povos.map((p) => (
                <span key={p} className="chip" title={world.peoples.get(p)?.descricao}>
                  {world.peoples.get(p)?.nome ?? p}
                </span>
              ))}
            </div>
          </div>
        )}
        {t.vizinhos.length > 0 && (
          <div>
            <h3 className="mb-2 font-caps text-[0.6rem] text-gold-400">Vizinhos</h3>
            <div className="flex flex-wrap gap-1.5">
              {t.vizinhos.map((v) => {
                const n = world.territories.get(v);
                if (!n || n.velado) return null;
                return (
                  <button key={v} type="button" onClick={() => onTerritory?.(v)} className="chip transition-colors hover:bg-gold-500/15">
                    {n.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 font-caps text-[0.58rem] text-faint">
        Referências: O Silmarillion, {t.capitulos.map(chapterRef).join(', ')}
      </p>
    </div>
  );
}
