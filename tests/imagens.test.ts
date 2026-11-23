import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { characters } from '@/data/characters';
import { FAN_ART, paisagens, retratos } from '@/data/imagens';
import { territories } from '@/data/territories';

const LICENCAS_LIVRES = /^(Domínio público|CC0|CC BY(-SA)? \d\.\d)$/;

describe('imagens de terceiros', () => {
  const todas = [
    ...Object.entries(retratos).map(([id, img]) => ({ id, img: img!, existe: characters.some((c) => c.id === id) })),
    ...Object.entries(paisagens).map(([id, img]) => ({ id, img: img!, existe: territories.some((t) => t.id === id) })),
  ];

  it('apontam para personagens e territórios que existem', () => {
    for (const { id, existe } of todas) expect(existe, id).toBe(true);
  });

  it('têm o arquivo em public/', () => {
    for (const { id, img } of todas) expect(existsSync(join(process.cwd(), 'public', img.src)), `${id}: ${img.src}`).toBe(true);
  });

  it('têm autor, link da obra e licença', () => {
    for (const { id, img } of todas) {
      expect(img.credito.autor, id).toBeTruthy();
      if (img.credito.licenca === FAN_ART) {
        expect(img.credito.fonte, id).toMatch(/^https:\/\/tolkiengateway\.net\/wiki\/File:/);
        continue;
      }
      expect(img.credito.fonte, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(img.credito.licenca, id).toMatch(LICENCAS_LIVRES);
      if (img.credito.licenca.startsWith('CC BY')) expect(img.credito.licencaUrl, id).toMatch(/^https:\/\/creativecommons\.org\//);
    }
  });
});
