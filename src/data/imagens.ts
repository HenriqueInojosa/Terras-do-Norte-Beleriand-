import type { CharacterId, Credito, TerritoryId } from '@/lib/types';

// Imagens dos cards, com autor, licença e link de cada uma. Primeiro as de licença livre
// (Wikimedia Commons); para quem não tinha nenhuma, fan art da Tolkien Gateway (FAN_ART).
// Os retratos foram recortados no rosto e tingidos em sépia para combinar entre si e com o
// mapa à pena; as paisagens dos reinos foram só recortadas. Toda imagem nova entra aqui com
// crédito completo: o teste de integridade confere autor, licença, fonte e o arquivo.

/** Fan art sem licença livre: usada com crédito, num site pessoal, sem fins comerciais. */
export const FAN_ART = 'Fan art, todos os direitos do autor';

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
  finwe: {
    src: '/portraits/finwe.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Finwe.jpg', obra: 'Finwe', alterada: true },
  },
  miriel: {
    src: '/portraits/miriel.webp',
    credito: { autor: 'MySilverGreen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:MySilverGreen_-_Miriel.jpg', obra: 'Miriel', alterada: true },
  },
  indis: {
    src: '/portraits/indis.webp',
    credito: { autor: 'Shyangell', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Shyangell_-_Queen_Indis.jpg', obra: 'Queen Indis', alterada: true },
  },
  nerdanel: {
    src: '/portraits/nerdanel.webp',
    credito: { autor: 'Jenny Dolfen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jenny_Dolfen_-_Nerdanel.jpg', obra: 'Nerdanel', alterada: true },
  },
  amrod: {
    src: '/portraits/amrod.webp',
    credito: { autor: 'Jenny Dolfen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jenny_Dolfen_-_Amrod_and_Amras%2C_sons_of_Feanor.jpg', obra: 'Amrod and Amras, sons of Feanor', alterada: true },
  },
  amras: {
    src: '/portraits/amras.webp',
    credito: { autor: 'Jenny Dolfen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jenny_Dolfen_-_Amrod_and_Amras%2C_sons_of_Feanor.jpg', obra: 'Amrod and Amras, sons of Feanor', alterada: true },
  },
  fingon: {
    src: '/portraits/fingon.webp',
    credito: { autor: 'Anna Lee', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Anna_Lee_-_Fingon.jpg', obra: 'Fingon', alterada: true },
  },
  turgon: {
    src: '/portraits/turgon.webp',
    credito: { autor: 'NimwenHabareth', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:NimwenHabareth_-_Turgon.png', obra: 'Turgon', alterada: true },
  },
  argon: {
    src: '/portraits/argon.webp',
    credito: { autor: 'Marya Filatova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Marya_Filatova_-_Arakano.jpeg', obra: 'Arakano', alterada: true },
  },
  finarfin: {
    src: '/portraits/finarfin.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_King_of_the_Valinorian_Noldor.jpg', obra: 'King of the Valinorian Noldor', alterada: true },
  },
  earwen: {
    src: '/portraits/earwen.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_The_Swan-Maiden_of_Alqualonde.jpeg', obra: 'The Swan-Maiden of Alqualonde', alterada: true },
  },
  finrod: {
    src: '/portraits/finrod.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_Finrod_-_First_Encounter_with_Edain.jpg', obra: 'Finrod - First Encounter with Edain', alterada: true },
  },
  orodreth: {
    src: '/portraits/orodreth.webp',
    credito: { autor: 'Ebe Kastein', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ebe_Kastein_-_King_Orodreth.jpg', obra: 'King Orodreth', alterada: true },
  },
  angrod: {
    src: '/portraits/angrod.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_Angrod.jpg', obra: 'Angrod', alterada: true },
  },
  aegnor: {
    src: '/portraits/aegnor.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_Aegnor_2.jpg', obra: 'Aegnor 2', alterada: true },
  },
  thingol: {
    src: '/portraits/thingol.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_King_of_Doriath.jpg', obra: 'King of Doriath', alterada: true },
  },
  melian: {
    src: '/portraits/melian.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_The_Light_of_Valinor.jpg', obra: 'The Light of Valinor', alterada: true },
  },
  olwe: {
    src: '/portraits/olwe.webp',
    credito: { autor: 'Karolina Węgrzyn', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Karolina_W%C4%99grzyn_-_OlweBeleriand.jpg', obra: 'OlweBeleriand', alterada: true },
  },
  cirdan: {
    src: '/portraits/cirdan.webp',
    credito: { autor: 'Alystraea', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Alystraea_-_Cirdan.jpg', obra: 'Cirdan', alterada: true },
  },
  eol: {
    src: '/portraits/eol.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_Destiny.jpg', obra: 'Destiny', alterada: true },
  },
  azaghal: {
    src: '/portraits/azaghal.webp',
    credito: { autor: 'Jenny Dolfen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jenny_Dolfen_-_Azaghal.jpg', obra: 'Azaghal', alterada: true },
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
  thargelion: {
    src: '/realms/thargelion.webp',
    credito: { autor: 'Matěj Čadil', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Mat%C4%9Bj_%C4%8Cadil_-_Dor_Caranthir.jpg', obra: 'Dor Caranthir', alterada: true },
  },
  doriath: {
    src: '/realms/doriath.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_Doriath_-_Beleg_and_young_Turin.jpg', obra: 'Doriath - Beleg and young Turin', alterada: true },
  },
  angband: {
    src: '/realms/angband.webp',
    credito: { autor: 'Henning Janssen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Henning_Janssen_-_Three_Peaks_Fortified.jpg', obra: 'Three Peaks Fortified', alterada: true },
  },
  dorthonion: {
    src: '/realms/dorthonion.webp',
    credito: { autor: 'Peter Xavier Price', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Peter_Xavier_Price_-_Beren_the_Solitary_Outlaw.jpg', obra: 'Beren the Solitary Outlaw', alterada: true },
  },
  'ard-galen': {
    src: '/realms/ard-galen.webp',
    credito: { autor: 'Marya Filatova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Marya_Filatova_-_Peaceful_Years_-_Aegnor.jpeg', obra: 'Peaceful Years - Aegnor', alterada: true },
  },
  'maglors-gap': {
    src: '/realms/maglors-gap.webp',
    credito: { autor: 'Peter Xavier Price', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Peter_Xavier_Price_-_Maglor%27s_Gap.jpg', obra: 'Maglor\'s Gap', alterada: true },
  },
  himlad: {
    src: '/realms/himlad.webp',
    credito: { autor: 'Marya Filatova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Marya_Filatova_-_Celegorm_in_Himlad.jpg', obra: 'Celegorm in Himlad', alterada: true },
  },
  'nan-dungortheb': {
    src: '/realms/nan-dungortheb.webp',
    credito: { autor: 'Peter Xavier Price', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Peter_Xavier_Price_-_Aredhel_Escapes_Nan_Dungortheb.jpg', obra: 'Aredhel Escapes Nan Dungortheb', alterada: true },
  },
  'nan-elmoth': {
    src: '/realms/nan-elmoth.webp',
    credito: { autor: 'Anna Kulisz', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Anna_Kulisz_-_Nan_Elmoth.jpg', obra: 'Nan Elmoth', alterada: true },
  },
  nogrod: {
    src: '/realms/nogrod.webp',
    credito: { autor: 'Lída Holubová', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:L%C3%ADda_Holubov%C3%A1_-_Nogrod.jpg', obra: 'Nogrod', alterada: true },
  },
};
