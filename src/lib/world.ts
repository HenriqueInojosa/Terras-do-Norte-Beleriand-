// O filtro de leitura: o único caminho entre os arquivos de dados e as telas.
// Recebe o ponto de leitura e devolve um "mundo" contendo só o que já foi revelado.
// Nenhum componente importa src/data diretamente (exceto os capítulos, que não têm spoilers por si).

import { characters as allCharacters } from '@/data/characters';
import { chapterIndex } from '@/data/chapters';
import { houses as allHouses } from '@/data/genealogies';
import { peoples as allPeoples } from '@/data/peoples';
import { relationships as allRelationships } from '@/data/relationships';
import { territories as allTerritories } from '@/data/territories';
import { timeline as allTimeline } from '@/data/timeline';
import type {
  Character,
  CharacterId,
  ChapterId,
  EntityRef,
  Fato,
  Fonte,
  House,
  HouseId,
  People,
  PeopleId,
  Relationship,
  Territory,
  TerritoryId,
  TerritoryType,
  TimelineEvent,
} from './types';

export interface ReadingSettings {
  chapter: ChapterId;
  showComplementar: boolean;
}

export interface ResolvedTerritory {
  id: TerritoryId;
  nome: string;
  outrosNomes: string[];
  significado?: string;
  tipo: TerritoryType;
  parteDe?: TerritoryId;
  localizacao: string[];
  descricao: Fato<string>[];
  povos: PeopleId[];
  vizinhos: TerritoryId[];
  /** Revelado, mas ainda sem nome nem forma definida (ex.: Gondolin antes do cap. 15). */
  velado: boolean;
  imagem?: string;
  capitulos: ChapterId[];
}

export interface ResolvedCharacter {
  id: CharacterId;
  nome: string;
  outrosNomes: string[];
  titulos: string[];
  povo: PeopleId;
  casa?: HouseId;
  pais: Fato<CharacterId>[];
  irmaosExplicitos: Fato<CharacterId>[];
  conjuges: Fato<CharacterId>[];
  biografia: Fato<string>[];
  retrato?: string;
  fonte: Fonte;
  nota?: string;
}

export interface World {
  settings: ReadingSettings;
  progress: number;
  territories: Map<TerritoryId, ResolvedTerritory>;
  characters: Map<CharacterId, ResolvedCharacter>;
  relationships: Relationship[];
  houses: House[];
  peoples: Map<PeopleId, People>;
  timeline: TimelineEvent[];
}

export function buildWorld(settings: ReadingSettings): World {
  const progress = chapterIndex(settings.chapter);
  const seen = (c: ChapterId) => chapterIndex(c) <= progress;
  const allowed = (fonte?: Fonte) => fonte !== 'complementar' || settings.showComplementar;
  const facts = <T,>(list: Fato<T>[]) => list.filter((x) => seen(x.revelado) && allowed(x.fonte));
  const last = <T,>(list: Fato<T>[]) => facts(list).at(-1)?.valor;

  const characterVisible = (c: Character) => seen(c.revelado) && allowed(c.fonte) && facts(c.nome).length > 0;
  const visibleCharIds = new Set(allCharacters.filter(characterVisible).map((c) => c.id));
  const visibleTerrIds = new Set(allTerritories.filter((t) => seen(t.revelado)).map((t) => t.id));

  const characters = new Map<CharacterId, ResolvedCharacter>();
  for (const c of allCharacters) {
    if (!visibleCharIds.has(c.id)) continue;
    const nomes = facts(c.nome).map((n) => n.valor);
    const refs = (list: Fato<CharacterId>[]) => facts(list).filter((x) => visibleCharIds.has(x.valor));
    characters.set(c.id, {
      id: c.id,
      nome: nomes.at(-1)!,
      outrosNomes: nomes.slice(0, -1).filter((n) => !nomes.at(-1)!.startsWith(n)),
      titulos: facts(c.titulos).map((x) => x.valor),
      povo: c.povo,
      casa: c.casa,
      pais: refs(c.pais),
      irmaosExplicitos: refs(c.irmaos ?? []),
      conjuges: refs(c.conjuges),
      biografia: facts(c.biografia),
      retrato: c.retrato,
      fonte: c.fonte ?? 'silmarillion',
      nota: c.nota,
    });
  }

  const territories = new Map<TerritoryId, ResolvedTerritory>();
  for (const t of allTerritories as Territory[]) {
    if (!visibleTerrIds.has(t.id)) continue;
    const nomes = facts(t.nome).map((n) => n.valor);
    territories.set(t.id, {
      id: t.id,
      nome: nomes.at(-1)!,
      outrosNomes: nomes.slice(0, -1),
      significado: t.significado && seen(t.significado.revelado) ? t.significado.valor : undefined,
      tipo: t.tipo,
      parteDe: t.parteDe && visibleTerrIds.has(t.parteDe) ? t.parteDe : undefined,
      localizacao: facts(t.localizacao).map((x) => x.valor).slice(-1),
      descricao: facts(t.descricao),
      povos: facts(t.povos).map((x) => x.valor),
      vizinhos: t.vizinhos.filter((v) => visibleTerrIds.has(v)),
      velado: t.veladoAte ? !seen(t.veladoAte) : false,
      // a imagem de um lugar velado entregaria o que ele é
      imagem: t.veladoAte && !seen(t.veladoAte) ? undefined : t.imagem,
      capitulos: t.capitulos.filter(seen),
    });
  }

  const refVisible = (r: EntityRef) =>
    r.kind === 'character' ? visibleCharIds.has(r.id) : visibleTerrIds.has(r.id);

  return {
    settings,
    progress,
    territories,
    characters,
    relationships: allRelationships.filter(
      (r) => seen(r.revelado) && allowed(r.fonte) && refVisible(r.de) && refVisible(r.para),
    ),
    houses: allHouses.filter((h) => seen(h.revelado) && h.raiz.some((id) => visibleCharIds.has(id))),
    peoples: new Map(allPeoples.filter((p) => seen(p.revelado)).map((p) => [p.id, p])),
    timeline: allTimeline.filter((e) => seen(e.revelado)),
  };
}

// ——— Seletores ———

export function rulersOf(world: World, territory: TerritoryId): ResolvedCharacter[] {
  return world.relationships
    .filter((r) => r.tipo === 'governa' && r.para.kind === 'territory' && r.para.id === territory)
    .map((r) => world.characters.get(r.de.id)!)
    .filter(Boolean);
}

/** Governante efetivo: o do próprio território ou, se não houver, o do território-mãe. */
export function effectiveRulers(world: World, territory: TerritoryId) {
  const own = rulersOf(world, territory);
  if (own.length) return { rulers: own, inherited: false };
  const parent = world.territories.get(territory)?.parteDe;
  return parent ? { rulers: rulersOf(world, parent), inherited: true } : { rulers: [], inherited: false };
}

export function territoriesRuledBy(world: World, character: CharacterId): ResolvedTerritory[] {
  return world.relationships
    .filter((r) => r.tipo === 'governa' && r.de.kind === 'character' && r.de.id === character && r.para.kind === 'territory')
    .map((r) => world.territories.get(r.para.id as TerritoryId)!)
    .filter(Boolean);
}

export function childrenOf(world: World, id: CharacterId): ResolvedCharacter[] {
  return [...world.characters.values()].filter((c) => c.pais.some((p) => p.valor === id));
}

export function parentsOf(world: World, id: CharacterId): ResolvedCharacter[] {
  const c = world.characters.get(id);
  return c ? c.pais.map((p) => world.characters.get(p.valor)!).filter(Boolean) : [];
}

export function spousesOf(world: World, id: CharacterId): ResolvedCharacter[] {
  const ids = new Set<CharacterId>();
  world.characters.get(id)?.conjuges.forEach((x) => ids.add(x.valor));
  for (const c of world.characters.values()) if (c.conjuges.some((x) => x.valor === id)) ids.add(c.id);
  return [...ids].map((x) => world.characters.get(x)!).filter(Boolean);
}

export interface Sibling {
  character: ResolvedCharacter;
  meio: boolean;
}

export function siblingsOf(world: World, id: CharacterId): Sibling[] {
  const me = world.characters.get(id);
  if (!me) return [];
  const myParents = new Set(me.pais.map((p) => p.valor));
  const out = new Map<CharacterId, Sibling>();
  if (myParents.size) {
    for (const c of world.characters.values()) {
      if (c.id === id) continue;
      const theirs = new Set(c.pais.map((p) => p.valor));
      const shared = [...theirs].filter((p) => myParents.has(p)).length;
      if (!shared) continue;
      // Meio-irmão: ambos com dois pais conhecidos e só um em comum.
      const meio = shared === 1 && theirs.size === 2 && myParents.size === 2;
      out.set(c.id, { character: c, meio });
    }
  }
  const explicit = [
    ...me.irmaosExplicitos.map((x) => x.valor),
    ...[...world.characters.values()].filter((c) => c.irmaosExplicitos.some((x) => x.valor === id)).map((c) => c.id),
  ];
  for (const x of explicit) {
    const c = world.characters.get(x);
    if (c && !out.has(x)) out.set(x, { character: c, meio: false });
  }
  return [...out.values()];
}

export function relationsOf(world: World, ref: EntityRef): Relationship[] {
  return world.relationships.filter(
    (r) => (r.de.kind === ref.kind && r.de.id === ref.id) || (r.para.kind === ref.kind && r.para.id === ref.id),
  );
}

export function entityName(world: World, ref: EntityRef): string | undefined {
  return ref.kind === 'character' ? world.characters.get(ref.id)?.nome : world.territories.get(ref.id)?.nome;
}

/** Ids de territórios relacionados a um personagem (governa), para destacar no mapa. */
export function highlightFor(world: World, character: CharacterId): TerritoryId[] {
  return territoriesRuledBy(world, character).map((t) => t.id);
}

// ——— Texto com links [[id]] / [[id|rótulo]] ———

export type RichSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; ref: EntityRef; text: string };

export function parseRich(world: World, text: string): RichSegment[] {
  const out: RichSegment[] = [];
  const re = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    const id = m[1];
    const terr = world.territories.get(id as TerritoryId);
    const char = world.characters.get(id);
    const label = m[2] ?? terr?.nome ?? char?.nome ?? id;
    if (char) out.push({ type: 'link', ref: { kind: 'character', id }, text: label });
    else if (terr && !terr.velado) out.push({ type: 'link', ref: { kind: 'territory', id: terr.id }, text: label });
    else if (terr?.velado) out.push({ type: 'text', text: 'um vale oculto' });
    else out.push({ type: 'text', text: label });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

export const TYPE_LABEL: Record<TerritoryType, string> = {
  reino: 'Reino',
  regiao: 'Região',
  fortaleza: 'Fortaleza',
  passagem: 'Passagem',
  territorio: 'Território',
};

export const RELATION_LABEL: Record<Relationship['tipo'], string> = {
  governa: 'governa',
  'vassalo-de': 'é vassalo de',
  alianca: 'aliado de',
  amizade: 'amigo de',
  'reconhece-rei': 'reconhece como Alto Rei',
};
