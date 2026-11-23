// Layout das árvores genealógicas: posições calculadas a partir de pais e cônjuges.
// Puro (sem React), para poder ser testado e animado.

import type { CharacterId, HouseId } from './types';
import { childrenOf, siblingsOf, spousesOf, type ResolvedCharacter, type World } from './world';

export const SLOT = 168; // largura reservada por pessoa
export const ROW = 300; // distância entre gerações
export const CARD_W = 112;
export const CARD_H = 130;

export interface LaidPerson {
  id: CharacterId;
  x: number; // centro
  y: number; // topo do card
  depth: number;
  /** pertence a outra casa: aparece, mas não se expande aqui */
  foreign?: HouseId;
  hasChildren: boolean;
  collapsed: boolean;
}

export interface LaidEdge {
  id: string;
  kind: 'casamento' | 'filhos' | 'irmaos';
  d: string;
  between: CharacterId[]; // pessoas ligadas (para destacar)
  label?: { x: number; y: number; text: string };
}

interface Unit {
  person: ResolvedCharacter;
  spouses: ResolvedCharacter[];
  unions: { spouse?: ResolvedCharacter; children: Unit[] }[];
  foreign?: HouseId;
  hasChildren: boolean;
  collapsed: boolean;
  width: number;
}

function buildUnit(world: World, house: HouseId, p: ResolvedCharacter, collapsed: Set<string>, seen: Set<string>): Unit {
  seen.add(p.id);
  const foreign = p.casa && p.casa !== house ? p.casa : undefined;
  const spouses = foreign ? [] : spousesOf(world, p.id).filter((s) => !seen.has(s.id));
  spouses.forEach((s) => seen.add(s.id));
  const kids = foreign ? [] : childrenOf(world, p.id);
  const isCollapsed = collapsed.has(p.id);
  const unions: Unit['unions'] = [];
  if (!isCollapsed) {
    const bySpouse = new Map<string, ResolvedCharacter[]>();
    for (const k of kids) {
      const other = k.pais.map((x) => x.valor).find((x) => x !== p.id) ?? '';
      const key = spouses.some((s) => s.id === other) ? other : '';
      bySpouse.set(key, [...(bySpouse.get(key) ?? []), k]);
    }
    const order = [...spouses.map((s) => s.id), ''];
    for (const key of order) {
      const list = bySpouse.get(key);
      if (!list?.length) continue;
      unions.push({
        spouse: spouses.find((s) => s.id === key),
        children: list.filter((k) => !seen.has(k.id)).map((k) => buildUnit(world, house, k, collapsed, seen)),
      });
    }
  }
  const own = (1 + spouses.length) * SLOT;
  const kidsWidth = unions.flatMap((u) => u.children).reduce((a, c) => a + c.width, 0);
  return { person: p, spouses, unions, foreign, hasChildren: kids.length > 0, collapsed: isCollapsed, width: Math.max(own, kidsWidth) };
}

export function layoutHouse(world: World, house: HouseId, collapsed: Set<string>) {
  const h = world.houses.find((x) => x.id === house);
  const people: LaidPerson[] = [];
  const edges: LaidEdge[] = [];
  if (!h) return { people, edges, width: 0, height: 0 };
  const seen = new Set<string>();
  const rootChars = h.raiz.map((id) => world.characters.get(id)).filter(Boolean) as ResolvedCharacter[];
  // irmãos explícitos da raiz (ex.: Olwë ao lado de Elwë) entram na mesma linha
  const extra = rootChars.flatMap((r) => siblingsOf(world, r.id).map((s) => s.character)).filter((c) => !h.raiz.includes(c.id));
  const roots = [...rootChars, ...extra].map((c) => (seen.has(c.id) ? null : buildUnit(world, house, c, collapsed, seen))).filter(Boolean) as Unit[];

  const place = (u: Unit, left: number, depth: number) => {
    const y = depth * ROW;
    const kids = u.unions.flatMap((un) => un.children);
    const kidsWidth = kids.reduce((a, c) => a + c.width, 0);
    // filhos centralizados sob a unidade
    let cursor = left + (u.width - kidsWidth) / 2;
    const childX = new Map<string, number>();
    for (const k of kids) {
      const cx = place(k, cursor, depth + 1);
      childX.set(k.person.id, cx);
      cursor += k.width;
    }
    // posição da unidade: centrada sobre os filhos, se houver; senão no meio do espaço
    const ownW = (1 + u.spouses.length) * SLOT;
    let center = left + u.width / 2;
    if (kids.length) {
      const xs = [...childX.values()];
      center = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    // um cônjuge: pessoa à esquerda, cônjuge à direita; dois ou mais: o primeiro à esquerda
    const slots: ResolvedCharacter[] =
      u.spouses.length >= 2 ? [u.spouses[0], u.person, ...u.spouses.slice(1)] : [u.person, ...u.spouses];
    const start = center - ownW / 2 + SLOT / 2;
    const xOf = new Map<string, number>();
    slots.forEach((p, i) => xOf.set(p.id, start + i * SLOT));
    const px = xOf.get(u.person.id)!;
    people.push({ id: u.person.id, x: px, y, depth, foreign: u.foreign, hasChildren: u.hasChildren, collapsed: u.collapsed });
    for (const s of u.spouses) people.push({ id: s.id, x: xOf.get(s.id)!, y, depth, hasChildren: false, collapsed: false });

    const midY = y + CARD_H * 0.5;
    for (const s of u.spouses) {
      const sx = xOf.get(s.id)!;
      const a = Math.min(px, sx) + CARD_W / 2 + 6;
      const b = Math.max(px, sx) - CARD_W / 2 - 6;
      edges.push({
        id: `m-${u.person.id}-${s.id}`,
        kind: 'casamento',
        d: `M${a} ${midY} H${b}`,
        between: [u.person.id, s.id],
        label: { x: (a + b) / 2, y: midY - 10, text: 'casou com' },
      });
    }
    for (const un of u.unions) {
      if (!un.children.length) continue;
      const fromX = un.spouse ? (px + xOf.get(un.spouse.id)!) / 2 : px;
      const fromY = un.spouse ? midY : y + CARD_H + 78;
      const busY = y + ROW - 62;
      const xs = un.children.map((c) => childX.get(c.person.id)!);
      const parts = [`M${fromX} ${fromY} V${busY}`];
      const lo = Math.min(fromX, ...xs);
      const hi = Math.max(fromX, ...xs);
      parts.push(`M${lo} ${busY} H${hi}`);
      for (const cx of xs) parts.push(`M${cx} ${busY} V${(depth + 1) * ROW - 6}`);
      edges.push({
        id: `f-${u.person.id}-${un.spouse?.id ?? 'x'}`,
        kind: 'filhos',
        d: parts.join(' '),
        between: [u.person.id, ...(un.spouse ? [un.spouse.id] : []), ...un.children.map((c) => c.person.id)],
      });
    }
    return px;
  };

  let left = 0;
  const rootX: number[] = [];
  for (const r of roots) {
    rootX.push(place(r, left, 0));
    left += r.width + SLOT * 0.5;
  }
  // irmãos na raiz: linha tracejada entre eles
  if (rootX.length > 1) {
    edges.push({
      id: 'irmaos-raiz',
      kind: 'irmaos',
      d: `M${Math.min(...rootX)} ${-28} H${Math.max(...rootX)} M${Math.min(...rootX)} -28 V${-6} M${Math.max(...rootX)} -28 V${-6}`,
      between: roots.map((r) => r.person.id),
      label: { x: (Math.min(...rootX) + Math.max(...rootX)) / 2, y: -38, text: 'irmãos' },
    });
  }

  const minX = Math.min(...people.map((p) => p.x)) - SLOT / 2;
  const maxX = Math.max(...people.map((p) => p.x)) + SLOT / 2;
  const maxY = Math.max(...people.map((p) => p.y)) + CARD_H + 80;
  return { people, edges, width: maxX - minX, height: maxY, offsetX: -minX };
}
