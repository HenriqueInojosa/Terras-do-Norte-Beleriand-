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
  {
    id: 'beor',
    nome: 'Casa de Bëor',
    lema: 'A Primeira Casa dos Edain, de Dorthonion',
    raiz: ['beor'],
    revelado: 'qs-17',
  },
  {
    id: 'haleth',
    nome: 'Casa de Haleth',
    lema: 'A Segunda Casa dos Edain, de Brethil',
    raiz: ['haldad'],
    revelado: 'qs-17',
  },
  {
    id: 'hador',
    nome: 'Casa de Hador',
    lema: 'A Terceira Casa dos Edain, de Dor-lómin',
    raiz: ['hador'],
    revelado: 'qs-17',
  },
];
