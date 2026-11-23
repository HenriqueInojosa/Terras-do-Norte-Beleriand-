import type { CharacterId, Credito, TerritoryId } from '@/lib/types';

// Imagens de licença livre, todas do Wikimedia Commons, com autor e licença de cada uma.
// Os retratos foram recortados no rosto e tingidos em sépia para combinar entre si e com o
// mapa à pena; as paisagens dos reinos foram só recortadas. Toda imagem nova entra aqui com
// crédito completo: o teste de integridade confere autor, licença, fonte e o arquivo.

export interface Imagem {
  src: string;
  credito: Credito;
}

export const retratos: Partial<Record<CharacterId, Imagem>> = {
  maedhros: {
    src: '/portraits/maedhros.webp',
    credito: { autor: 'Carmen Haberichter', licenca: 'Domínio público', fonte: 'https://commons.wikimedia.org/wiki/File:Yes%2C_I%27m_angry.jpg', obra: 'Yes, I\'m angry', alterada: true },
  },
  maglor: {
    src: '/portraits/maglor.webp',
    credito: { autor: 'Carmen Haberichter', licenca: 'Domínio público', fonte: 'https://commons.wikimedia.org/wiki/File:Maglor%2C_the_minstrel.jpg', obra: 'Maglor, the minstrel', alterada: true },
  },
  celegorm: {
    src: '/portraits/celegorm.webp',
    credito: { autor: 'Carmen Haberichter', licenca: 'Domínio público', fonte: 'https://commons.wikimedia.org/wiki/File:Celegorm.jpg', obra: 'Celegorm', alterada: true },
  },
  curufin: {
    src: '/portraits/curufin.webp',
    credito: { autor: 'Carmen Haberichter', licenca: 'Domínio público', fonte: 'https://commons.wikimedia.org/wiki/File:Curufin.JPG', obra: 'Curufin', alterada: true },
  },
  caranthir: {
    src: '/portraits/caranthir.webp',
    credito: { autor: 'Carmen Haberichter', licenca: 'Domínio público', fonte: 'https://commons.wikimedia.org/wiki/File:Just_practising.jpg', obra: 'Just practising', alterada: true },
  },
  fingolfin: {
    src: '/portraits/fingolfin.webp',
    credito: { autor: 'Carmen Haberichter', licenca: 'Domínio público', fonte: 'https://commons.wikimedia.org/wiki/File:Measure_intension_more_forcefull_than_blows.jpg', obra: 'Measure intension more forcefull than blows', alterada: true },
  },
  feanor: {
    src: '/portraits/feanor.webp',
    credito: { autor: 'Fëanor l\'immortel', licenca: 'CC BY-SA 4.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', fonte: 'https://commons.wikimedia.org/wiki/File:F%C3%ABanor.jpg', obra: 'Fëanor', alterada: true },
  },
  morgoth: {
    src: '/portraits/morgoth.webp',
    credito: { autor: 'Outcast', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Morgoth_-_the_first_Dark_Lord.jpg', obra: 'Morgoth - the first Dark Lord', alterada: true },
  },
  galadriel: {
    src: '/portraits/galadriel.webp',
    credito: { autor: 'T-Jacques', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Galadriel_retouched.png', obra: 'Galadriel retouched', alterada: true },
  },
  luthien: {
    src: '/portraits/luthien.webp',
    credito: { autor: 'Álvaro Fernández González', licenca: 'CC BY-SA 4.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Huan_y_L%C3%BAthien.jpg', obra: 'Huan y Lúthien', alterada: true },
  },
  aredhel: {
    src: '/portraits/aredhel.webp',
    credito: { autor: 'Tom Loback', licenca: 'CC BY 2.5', licencaUrl: 'https://creativecommons.org/licenses/by/2.5/', fonte: 'https://commons.wikimedia.org/wiki/File:E%C3%B6l_and_Aredhel.jpg', obra: 'Eöl and Aredhel', alterada: true },
  },
};

export const paisagens: Partial<Record<TerritoryId, Imagem>> = {
  hithlum: {
    src: '/realms/hithlum.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Barad_eithel.jpg', obra: 'Barad Eithel', alterada: true },
  },
  nevrast: {
    src: '/realms/nevrast.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Vinyamar.jpg', obra: 'Vinyamar', alterada: true },
  },
  aglon: {
    src: '/realms/aglon.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Aglon.jpg', obra: 'Passo de Aglon', alterada: true },
  },
  'tol-sirion': {
    src: '/realms/tol-sirion.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Tol_sirion.jpg', obra: 'Tol Sirion', alterada: true },
  },
  nargothrond: {
    src: '/realms/nargothrond.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Taur-en-faroth.jpg', obra: 'Taur-en-Faroth', alterada: true },
  },
  brethil: {
    src: '/realms/brethil.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Brethil.jpg', obra: 'Brethil', alterada: true },
  },
  falas: {
    src: '/realms/falas.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Brithombar.jpg', obra: 'Brithombar', alterada: true },
  },
  ossiriand: {
    src: '/realms/ossiriand.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Duilwen.jpg', obra: 'O rio Duilwen', alterada: true },
  },
};
