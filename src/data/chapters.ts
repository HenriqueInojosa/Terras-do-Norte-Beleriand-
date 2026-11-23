import type { Chapter, ChapterId } from '@/lib/types';

// Ordem de leitura de O Silmarillion. Os títulos dos capítulos ainda não lidos
// ficam ocultos na interface, porque alguns deles já são spoilers.
// Títulos traduzidos livremente; ajuste para bater com a sua edição.
export const chapters: Chapter[] = [
  { id: 'ainulindale', parte: 'Ainulindalë', titulo: 'A Música dos Ainur' },
  { id: 'valaquenta', parte: 'Valaquenta', titulo: 'Relato dos Valar e Maiar' },
  { id: 'qs-1', parte: 'Quenta Silmarillion', numero: 1, titulo: 'Do Princípio dos Dias' },
  { id: 'qs-2', parte: 'Quenta Silmarillion', numero: 2, titulo: 'De Aulë e Yavanna' },
  { id: 'qs-3', parte: 'Quenta Silmarillion', numero: 3, titulo: 'Da Chegada dos Elfos e do Cativeiro de Melkor' },
  { id: 'qs-4', parte: 'Quenta Silmarillion', numero: 4, titulo: 'De Thingol e Melian' },
  { id: 'qs-5', parte: 'Quenta Silmarillion', numero: 5, titulo: 'De Eldamar e dos Príncipes dos Eldalië' },
  { id: 'qs-6', parte: 'Quenta Silmarillion', numero: 6, titulo: 'De Fëanor e da Libertação de Melkor' },
  { id: 'qs-7', parte: 'Quenta Silmarillion', numero: 7, titulo: 'Das Silmarils e da Inquietação dos Noldor' },
  { id: 'qs-8', parte: 'Quenta Silmarillion', numero: 8, titulo: 'Do Obscurecimento de Valinor' },
  { id: 'qs-9', parte: 'Quenta Silmarillion', numero: 9, titulo: 'Da Fuga dos Noldor' },
  { id: 'qs-10', parte: 'Quenta Silmarillion', numero: 10, titulo: 'Dos Sindar' },
  { id: 'qs-11', parte: 'Quenta Silmarillion', numero: 11, titulo: 'Do Sol, da Lua e da Ocultação de Valinor' },
  { id: 'qs-12', parte: 'Quenta Silmarillion', numero: 12, titulo: 'Dos Homens' },
  { id: 'qs-13', parte: 'Quenta Silmarillion', numero: 13, titulo: 'Do Retorno dos Noldor' },
  { id: 'qs-14', parte: 'Quenta Silmarillion', numero: 14, titulo: 'De Beleriand e Seus Reinos' },
  { id: 'qs-15', parte: 'Quenta Silmarillion', numero: 15, titulo: 'Dos Noldor em Beleriand' },
  { id: 'qs-16', parte: 'Quenta Silmarillion', numero: 16, titulo: 'De Maeglin' },
  { id: 'qs-17', parte: 'Quenta Silmarillion', numero: 17, titulo: 'Da Vinda dos Homens para o Oeste' },
  { id: 'qs-18', parte: 'Quenta Silmarillion', numero: 18, titulo: 'Da Ruína de Beleriand e da Queda de Fingolfin' },
  { id: 'qs-19', parte: 'Quenta Silmarillion', numero: 19, titulo: 'De Beren e Lúthien' },
  { id: 'qs-20', parte: 'Quenta Silmarillion', numero: 20, titulo: 'Da Quinta Batalha: Nirnaeth Arnoediad' },
  { id: 'qs-21', parte: 'Quenta Silmarillion', numero: 21, titulo: 'De Túrin Turambar' },
  { id: 'qs-22', parte: 'Quenta Silmarillion', numero: 22, titulo: 'Da Ruína de Doriath' },
  { id: 'qs-23', parte: 'Quenta Silmarillion', numero: 23, titulo: 'De Tuor e da Queda de Gondolin' },
  { id: 'qs-24', parte: 'Quenta Silmarillion', numero: 24, titulo: 'Da Viagem de Eärendil e da Guerra da Ira' },
  { id: 'akallabeth', parte: 'Akallabêth', titulo: 'A Queda de Númenor' },
  { id: 'aneis', parte: 'Dos Anéis de Poder', titulo: 'Dos Anéis de Poder e da Terceira Era' },
];

export const DEFAULT_CHAPTER: ChapterId = 'qs-14';

const position = new Map(chapters.map((c, i) => [c.id, i]));

export function chapterIndex(id: ChapterId): number {
  const i = position.get(id);
  if (i === undefined) throw new Error(`Capítulo desconhecido: ${id}`);
  return i;
}

export function getChapter(id: ChapterId): Chapter {
  return chapters[chapterIndex(id)];
}

export function chapterShortLabel(c: Chapter): string {
  return c.numero ? `Capítulo ${c.numero}` : c.parte;
}

export function chapterRef(id: ChapterId): string {
  const c = getChapter(id);
  return c.numero ? `Cap. ${c.numero}` : c.parte;
}
