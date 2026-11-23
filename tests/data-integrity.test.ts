import { describe, expect, it } from 'vitest';
import { chapters, chapterIndex } from '@/data/chapters';
import { characters } from '@/data/characters';
import { houses } from '@/data/genealogies';
import { mapLayer } from '@/data/generated/map-layer';
import { relationships } from '@/data/relationships';
import { territories } from '@/data/territories';
import { timeline } from '@/data/timeline';
import { buildWorld, parseRich } from '@/lib/world';
import type { ChapterId } from '@/lib/types';

const charIds = new Set(characters.map((c) => c.id));
const terrIds = new Set<string>(territories.map((t) => t.id));
const idx = (c: ChapterId) => chapterIndex(c);

describe('integridade dos dados', () => {
  it('ids são únicos', () => {
    expect(charIds.size).toBe(characters.length);
    expect(terrIds.size).toBe(territories.length);
    expect(new Set(relationships.map((r) => r.id)).size).toBe(relationships.length);
  });

  it('todo capítulo citado existe', () => {
    const ids = new Set(chapters.map((c) => c.id));
    const all: ChapterId[] = [
      ...characters.flatMap((c) => [c.revelado, ...c.nome.map((n) => n.revelado), ...c.biografia.map((b) => b.revelado)]),
      ...territories.flatMap((t) => [t.revelado, ...t.descricao.map((d) => d.revelado), ...t.capitulos]),
      ...relationships.map((r) => r.revelado),
    ];
    for (const c of all) expect(ids.has(c), c).toBe(true);
  });

  it('pais, cônjuges e irmãos apontam para personagens existentes', () => {
    for (const c of characters) {
      for (const x of [...c.pais, ...c.conjuges, ...(c.irmaos ?? [])]) expect(charIds.has(x.valor), `${c.id} → ${x.valor}`).toBe(true);
    }
  });

  it('casamentos são recíprocos', () => {
    for (const c of characters) {
      for (const s of c.conjuges) {
        const other = characters.find((o) => o.id === s.valor)!;
        expect(other.conjuges.some((x) => x.valor === c.id), `${c.id} ↔ ${s.valor}`).toBe(true);
      }
    }
  });

  it('nenhum parentesco é revelado antes das pessoas que ele liga', () => {
    for (const c of characters) {
      for (const p of [...c.pais, ...c.conjuges]) {
        const other = characters.find((o) => o.id === p.valor)!;
        expect(idx(p.revelado) >= idx(c.revelado) && idx(p.revelado) >= idx(other.revelado), `${c.id} ↔ ${p.valor}`).toBe(true);
      }
    }
  });

  it('relações apontam para entidades existentes e não chegam antes delas', () => {
    for (const r of relationships) {
      for (const end of [r.de, r.para]) {
        const set = end.kind === 'character' ? charIds : terrIds;
        expect(set.has(end.id), `${r.id}: ${end.id}`).toBe(true);
        const ent = end.kind === 'character' ? characters.find((c) => c.id === end.id)! : territories.find((t) => t.id === end.id)!;
        expect(idx(r.revelado) >= idx(ent.revelado), r.id).toBe(true);
      }
    }
  });

  it('links [[id]] nos textos apontam para algo que existe', () => {
    const texts = [
      ...characters.flatMap((c) => c.biografia.map((b) => b.valor)),
      ...territories.flatMap((t) => t.descricao.map((d) => d.valor)),
    ];
    for (const text of texts) {
      for (const m of text.matchAll(/\[\[([a-z0-9-]+)/g)) expect(charIds.has(m[1]) || terrIds.has(m[1]), m[1]).toBe(true);
    }
  });

  it('cada território tem forma no mapa e cada forma tem território', () => {
    const shapes = new Set<string>(mapLayer.territories.map((s) => s.id));
    for (const t of territories) expect(shapes.has(t.id), t.id).toBe(true);
    for (const s of shapes) expect(terrIds.has(s), s).toBe(true);
  });

  it('árvores e linha do tempo apontam para quem existe', () => {
    for (const h of houses) for (const r of h.raiz) expect(charIds.has(r)).toBe(true);
    for (const e of timeline) for (const x of e.envolvidos) expect((x.kind === 'character' ? charIds : terrIds).has(x.id)).toBe(true);
  });
});

describe('controle de spoilers', () => {
  it('no capítulo 14, Fingolfin governa Hithlum e Gondolin está velada', () => {
    const w = buildWorld({ chapter: 'qs-14', showComplementar: false });
    expect(w.relationships.some((r) => r.id === 'fingolfin-governa-hithlum')).toBe(true);
    expect(w.territories.get('gondolin')?.velado).toBe(true);
    expect(w.territories.get('gondolin')?.nome).not.toBe('Gondolin');
    expect(w.characters.get('turgon')?.titulos).not.toContain('Rei de Gondolin');
    expect(w.territories.get('dorthonion')?.nome).toBe('Dorthonion');
  });

  it('nenhum texto visível no capítulo 14 menciona fatos de capítulos posteriores', () => {
    const w = buildWorld({ chapter: 'qs-14', showComplementar: false });
    const visible = [
      ...[...w.characters.values()].flatMap((c) => c.biografia.map((b) => b.valor)),
      ...[...w.territories.values()].flatMap((t) => t.descricao.map((d) => d.valor)),
    ].join(' ');
    for (const word of ['Gondolin', 'Hador', 'Taur-nu-Fuin', 'Anfauglith', 'Estolad', 'Eöl', 'Azaghâl', 'Haladin']) expect(visible).not.toContain(word);
  });

  it('Argon só aparece com fontes complementares ligadas', () => {
    expect(buildWorld({ chapter: 'qs-14', showComplementar: false }).characters.has('argon')).toBe(false);
    expect(buildWorld({ chapter: 'qs-14', showComplementar: true }).characters.has('argon')).toBe(true);
  });

  it('antes do capítulo 13 não há reinos dos Noldor em Beleriand', () => {
    const w = buildWorld({ chapter: 'qs-12', showComplementar: false });
    expect(w.territories.has('hithlum')).toBe(false);
    expect(w.territories.has('angband')).toBe(true);
  });

  it('reinos novos respeitam a leitura', () => {
    const w14 = buildWorld({ chapter: 'qs-14', showComplementar: false });
    for (const id of ['doriath', 'nargothrond', 'tol-sirion', 'falas', 'ossiriand', 'nogrod', 'belegost', 'beleriand-leste'] as const)
      expect(w14.territories.has(id)).toBe(true);
    expect(w14.territories.has('estolad')).toBe(false);
    expect(w14.characters.has('eol')).toBe(false);
    expect(w14.relationships.some((r) => r.id === 'orodreth-governa-tol-sirion')).toBe(false);
    expect(w14.relationships.some((r) => r.id === 'finrod-governa-nargothrond')).toBe(true);
    const w17 = buildWorld({ chapter: 'qs-17', showComplementar: false });
    expect(w17.territories.has('estolad')).toBe(true);
  });

  it('link para território velado vira texto neutro', () => {
    const w = buildWorld({ chapter: 'qs-14', showComplementar: false });
    const seg = parseRich(w, 'Ele foi para [[gondolin|Gondolin]].');
    expect(seg.map((s) => s.text).join('')).not.toContain('Gondolin');
  });
});
