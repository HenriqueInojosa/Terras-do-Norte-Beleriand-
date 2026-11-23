'use client';

import Link from 'next/link';
import { HexPortrait } from '@/components/ui/HexPortrait';
import { EntityLink, FactParagraphs, SourceTag } from '@/components/ui/Links';
import { ImageCredit } from '@/components/ui/ImageCredit';
import { HiddenNotice } from '@/components/spoilers/HiddenNotice';
import { useWorld } from '@/components/spoilers/ReadingProvider';
import { chapterRef } from '@/data/chapters';
import { RELATION_LABEL, entityName, relationsOf, territoriesRuledBy } from '@/lib/world';
import { MiniMap } from '@/components/atlas/MiniMap';
import { useRouter } from 'next/navigation';
import { KinshipFacts, KinshipTree } from './Kinship';

export function CharacterPage({ id }: { id: string }) {
  const world = useWorld();
  const router = useRouter();
  const c = world.characters.get(id);
  if (!c) return <HiddenNotice what="Este personagem" />;
  const house = c.casa ? world.houses.find((h) => h.id === c.casa) : undefined;
  const ruled = territoriesRuledBy(world, c.id);
  const rels = relationsOf(world, { kind: 'character', id: c.id }).filter((r) => r.tipo !== 'governa');
  const chapters = [...new Set(c.biografia.map((b) => b.revelado))];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-24 pt-10 lg:grid-cols-[1fr_400px]">
      <article className="panel rounded-2xl p-7 md:p-10">
        <Link href="/personagens/" className="font-caps text-[0.62rem] text-muted transition-colors hover:text-gold-300">
          ← Personagens
        </Link>
        <div className="mt-6 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <HexPortrait world={world} character={c} width={150} active />
          <div>
            <p className="font-caps text-[0.62rem] text-gold-400">
              {[world.peoples.get(c.povo)?.nome, house?.nome].filter(Boolean).join(' · ')}
            </p>
            <h1 className="font-display text-[3.2rem] leading-none text-gold-200">{c.nome}</h1>
            {c.titulos.length > 0 && <p className="mt-2 font-display text-xl italic text-muted">{c.titulos.join(' · ')}</p>}
            {c.outrosNomes.length > 0 && <p className="font-display italic text-faint">Também chamado {c.outrosNomes.join(', ')}</p>}
            {c.fonte === 'complementar' && <SourceTag />}
          </div>
        </div>
        {c.retratoCredito && <ImageCredit credito={c.retratoCredito} rotulo="Retrato" className="mt-4 text-center sm:text-left" />}
        <div className="rule-gold my-7" />
        <h2 className="mb-3 font-caps text-[0.62rem] text-gold-400">Biografia</h2>
        <FactParagraphs facts={c.biografia} className="font-display text-[1.2rem] text-fg/90" />
        {c.nota && <p className="mt-4 border-l border-deep-300/40 pl-3 font-display italic text-deep-300">{c.nota}</p>}

        <div className="mt-8">
          <h2 className="mb-3 font-caps text-[0.62rem] text-gold-400">Família</h2>
          <KinshipFacts character={c} />
        </div>

        {rels.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-caps text-[0.62rem] text-gold-400">Relações políticas</h2>
            <ul className="space-y-1.5 font-display text-[1.08rem]">
              {rels.map((r) => (
                <li key={r.id}>
                  <EntityLink refTo={r.de}>{entityName(world, r.de)}</EntityLink>{' '}
                  <span className="italic text-muted">{RELATION_LABEL[r.tipo]}</span>{' '}
                  <EntityLink refTo={r.para}>{entityName(world, r.para)}</EntityLink>
                  {r.nota && <span className="block text-[0.92rem] italic text-faint">{r.nota}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-8 font-caps text-[0.58rem] text-faint">Referências: O Silmarillion, {chapters.map(chapterRef).join(', ')}</p>
      </article>

      <aside className="space-y-5 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        {ruled.length > 0 && (
          <Link href={`/?p=${c.id}`} className="group panel block overflow-hidden rounded-2xl">
            <MiniMap id={ruled[0].id} zoom={3} className="aspect-[4/3] w-full transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="px-5 py-3">
              <p className="font-caps text-[0.58rem] text-gold-400">Governa</p>
              <p className="font-display text-xl text-gold-200">{ruled.map((t) => t.nome).join(', ')}</p>
              <p className="mt-1 font-caps text-[0.62rem] text-gold-300 transition-transform group-hover:translate-x-1">Ver no Atlas →</p>
            </div>
          </Link>
        )}
        <div className="panel rounded-2xl p-5">
          <KinshipTree character={c} onPick={(pid) => router.push(`/personagens/${pid}/`)} />
          {c.casa && (
            <Link href={`/genealogias/${c.casa}/?foco=${c.id}`} className="chip mt-5 py-1.5 hover:bg-gold-500/15">
              Abrir na árvore genealógica
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
