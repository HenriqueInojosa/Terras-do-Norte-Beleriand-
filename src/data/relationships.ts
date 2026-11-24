import type { ChapterId, EntityRef, Relationship, RelationshipType } from '@/lib/types';

// Relações políticas: quem governa o quê, vassalagem, alianças e amizades.
// É a única fonte de "governante" do Atlas: fichas de território e de personagem leem daqui.

const c = (id: string): EntityRef => ({ kind: 'character', id });
const t = (id: Extract<EntityRef, { kind: 'territory' }>['id']): EntityRef => ({ kind: 'territory', id });

function rel(
  tipo: RelationshipType,
  de: EntityRef,
  para: EntityRef,
  revelado: ChapterId,
  extra: Partial<Relationship> = {},
): Relationship {
  return { id: `${de.id}-${tipo}-${para.id}`, tipo, de, para, revelado, ref: undefined, ...extra };
}

export const relationships: Relationship[] = [
  // Governo
  rel('governa', c('fingolfin'), t('hithlum'), 'qs-13'),
  rel('governa', c('fingolfin'), t('mithrim'), 'qs-13'),
  rel('governa', c('fingon'), t('dor-lomin'), 'qs-14'),
  rel('governa', c('turgon'), t('nevrast'), 'qs-13'),
  rel('governa', c('turgon'), t('gondolin'), 'qs-15'),
  rel('governa', c('angrod'), t('dorthonion'), 'qs-14'),
  rel('governa', c('aegnor'), t('dorthonion'), 'qs-14'),
  rel('governa', c('maedhros'), t('himring'), 'qs-14'),
  rel('governa', c('maglor'), t('maglors-gap'), 'qs-14'),
  rel('governa', c('celegorm'), t('himlad'), 'qs-14'),
  rel('governa', c('curufin'), t('himlad'), 'qs-14'),
  rel('governa', c('celegorm'), t('aglon'), 'qs-14'),
  rel('governa', c('curufin'), t('aglon'), 'qs-14'),
  rel('governa', c('caranthir'), t('thargelion'), 'qs-14'),
  rel('governa', c('morgoth'), t('angband'), 'qs-9'),
  rel('governa', c('thingol'), t('doriath'), 'qs-10'),
  rel('governa', c('melian'), t('doriath'), 'qs-10'),
  rel('governa', c('finrod'), t('nargothrond'), 'qs-13'),
  rel('governa', c('finrod'), t('tol-sirion'), 'qs-13'),
  rel('governa', c('orodreth'), t('tol-sirion'), 'qs-15', { nota: 'Finrod deixou a torre de Minas Tirith aos cuidados de Orodreth.' }),
  rel('governa', c('cirdan'), t('falas'), 'qs-10'),
  rel('governa', c('amrod'), t('beleriand-leste'), 'qs-14'),
  rel('governa', c('amras'), t('beleriand-leste'), 'qs-14'),
  rel('governa', c('eol'), t('nan-elmoth'), 'qs-16'),
  rel('governa', c('azaghal'), t('belegost'), 'qs-20'),
  // Homens
  rel('governa', c('hador'), t('dor-lomin'), 'qs-17', { nota: 'Fingolfin deu Dor-lómin como herança a Hador e à sua casa.' }),
  rel('governa', c('galdor'), t('dor-lomin'), 'qs-18', { nota: 'Sucedeu Hador, morto na Dagor Bragollach.' }),
  rel('governa', c('hurin'), t('dor-lomin'), 'qs-18', { nota: 'Sucedeu o pai, Galdor, morto em Eithel Sirion.' }),
  rel('governa', c('boromir'), t('dorthonion'), 'qs-17', { nota: 'Senhor de Ladros, no nordeste de Dorthonion, sob Angrod e Aegnor.' }),
  rel('governa', c('barahir'), t('dorthonion'), 'qs-18', { nota: 'Senhor da Casa de Bëor em Ladros; depois da Dagor Bragollach, resistiu em Dorthonion como fora da lei.' }),
  rel('governa', c('haleth'), t('brethil'), 'qs-17', { nota: 'Thingol permitiu que o Povo de Haleth vivesse em Brethil.' }),
  rel('governa', c('haldan'), t('brethil'), 'qs-17'),
  rel('governa', c('halmir'), t('brethil'), 'qs-18'),
  rel('governa', c('brandir'), t('brethil'), 'qs-21'),

  // Vassalagem e soberania
  rel('vassalo-de', c('fingon'), c('fingolfin'), 'qs-14', { nota: 'Dor-lómin é parte de Hithlum, entregue a Fingon pelo pai.' }),
  rel('vassalo-de', c('angrod'), c('finrod'), 'qs-14'),
  rel('vassalo-de', c('aegnor'), c('finrod'), 'qs-14'),
  rel('vassalo-de', c('beor'), c('finrod'), 'qs-17'),
  rel('vassalo-de', c('boromir'), c('angrod'), 'qs-17', { nota: 'O povo de Bëor recebeu Ladros de Angrod e Aegnor.' }),
  rel('vassalo-de', c('hador'), c('fingolfin'), 'qs-17'),
  rel('vassalo-de', c('bor'), c('maedhros'), 'qs-18', { nota: 'Bór e os seus filhos seguiram Maedhros e Maglor.' }),
  rel('vassalo-de', c('ulfang'), c('caranthir'), 'qs-18'),
  rel('reconhece-rei', c('maedhros'), c('fingolfin'), 'qs-13', {
    nota: 'Maedhros abriu mão da realeza dos Noldor em favor de Fingolfin, mas os filhos de Fëanor mantiveram terras próprias.',
  }),

  // Amizades e alianças
  rel('amizade', c('fingon'), c('maedhros'), 'qs-13', { nota: 'Fingon resgatou Maedhros de Thangorodrim.' }),
  rel('alianca', c('fingolfin'), c('maedhros'), 'qs-13', { nota: 'Juntos mantinham o Cerco de Angband.' }),
  rel('amizade', c('finrod'), c('beor'), 'qs-17', { nota: 'Finrod foi o primeiro dos Eldar a encontrar os Homens.' }),
  rel('amizade', c('barahir'), c('finrod'), 'qs-18', { nota: 'Barahir salvou Finrod na Dagor Bragollach e recebeu dele o seu anel.' }),
];
