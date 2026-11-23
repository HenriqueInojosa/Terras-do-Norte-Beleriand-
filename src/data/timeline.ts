import type { TimelineEvent } from '@/lib/types';

// Linha do tempo: estrutura pronta para crescer. Por enquanto, poucos eventos até o capítulo 14.

export const timeline: TimelineEvent[] = [
  {
    id: 'chegada-noldor',
    titulo: 'Os Noldor chegam à Terra-média',
    era: 'primeira-era',
    descricao: 'As hostes dos Noldor chegam a Beleriand e acampam junto ao lago Mithrim.',
    envolvidos: [{ kind: 'territory', id: 'mithrim' }, { kind: 'character', id: 'fingolfin' }],
    revelado: 'qs-13',
  },
  {
    id: 'resgate-maedhros',
    titulo: 'O resgate de Maedhros',
    era: 'primeira-era',
    descricao: 'Fingon liberta Maedhros de Thangorodrim com a ajuda de Thorondor.',
    envolvidos: [{ kind: 'character', id: 'fingon' }, { kind: 'character', id: 'maedhros' }],
    revelado: 'qs-13',
  },
  {
    id: 'cerco-angband',
    titulo: 'Começa o Cerco de Angband',
    era: 'primeira-era',
    descricao: 'Os Noldor cercam Angband a partir de Hithlum, Dorthonion e das terras do leste.',
    envolvidos: [{ kind: 'territory', id: 'angband' }, { kind: 'territory', id: 'ard-galen' }],
    revelado: 'qs-13',
  },
  {
    id: 'divisao-reinos',
    titulo: 'A divisão dos reinos',
    era: 'primeira-era',
    descricao: 'Os príncipes dos Noldor se estabelecem em seus domínios por toda Beleriand.',
    envolvidos: [{ kind: 'territory', id: 'hithlum' }, { kind: 'territory', id: 'himring' }],
    revelado: 'qs-14',
  },
];
