import type { House } from '@/lib/types';

// As árvores só definem o recorte e a apresentação.
// O parentesco em si vem de characters.ts (pais, cônjuges), sem duplicação.

export const houses: House[] = [
  {
    id: 'finwe',
    nome: 'Casa de Finwë',
    lema: 'Os príncipes dos Noldor',
    raiz: ['finwe'],
    revelado: 'qs-5',
  },
  {
    id: 'thingol',
    nome: 'Casa de Thingol',
    lema: 'Os senhores de Doriath',
    raiz: ['thingol'],
    revelado: 'qs-4',
  },
];
