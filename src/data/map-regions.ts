import type { ChapterId } from '@/lib/types';

// Ajustes da camada do mapa que dependem da leitura.
// As formas e os rótulos em si vêm de generated/map-layer.ts (gerado a partir do SVG).

/** Rótulos que só aparecem a partir de um capítulo (o nome é spoiler ou só surge depois). */
export const labelReveal: Record<string, ChapterId> = {
  'lbl-gondolin': 'qs-15',
  'lbl-estolad': 'qs-17',
  'lbl-arvernien': 'qs-24',
  'lbl-nimbrethil': 'qs-24',
};

/** Partes de rótulos (linhas) reveladas depois do resto. Índice da linha → capítulo. */
export const labelPartReveal: Record<string, Record<number, ChapterId>> = {};

/** Marca da cidade de Gondolin no mapa. */
export const GONDOLIN_MARKER_REVEAL: ChapterId = 'qs-15';

/** Nível de detalhe de cada rótulo: 0 sempre visível, 1 com algum zoom, 2 de perto. */
export function labelLod(cls: string, isTerritory: boolean): 0 | 1 | 2 {
  const c = ` ${cls} `;
  if (isTerritory) return 0;
  if (/ (mar|big|mal) /.test(c) || / reg (xl|l) /.test(c)) return 0;
  if (/ (reg|lugar|mtn) /.test(c)) return 1;
  return 2; // rios, lagos e nomes menores
}

export function lodForZoom(rel: number): 0 | 1 | 2 {
  return rel < 1.45 ? 0 : rel < 2.4 ? 1 : 2;
}
