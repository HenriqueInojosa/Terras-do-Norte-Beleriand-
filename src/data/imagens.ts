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
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Maedhros.jpg', obra: 'Maedhros', alterada: true },
  },
  maglor: {
    src: '/portraits/maglor.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Maglor.jpg', obra: 'Maglor', alterada: true },
  },
  celegorm: {
    src: '/portraits/celegorm.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Celegorm.jpg', obra: 'Celegorm', alterada: true },
  },
  curufin: {
    src: '/portraits/curufin.webp',
    credito: { autor: 'Elena Kukanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Elena_Kukanova_-_Curufin_sketch.jpg', obra: 'Curufin sketch', alterada: true },
  },
  caranthir: {
    src: '/portraits/caranthir.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Caranthir.jpg', obra: 'Caranthir', alterada: true },
  },
  fingolfin: {
    src: '/portraits/fingolfin.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Fingolfin.jpg', obra: 'Fingolfin', alterada: true },
  },
  feanor: {
    src: '/portraits/feanor.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Feanor.jpg', obra: 'Feanor', alterada: true },
  },
  morgoth: {
    src: '/portraits/morgoth.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Morgoth.jpg', obra: 'Morgoth', alterada: true },
  },
  galadriel: {
    src: '/portraits/galadriel.webp',
    credito: { autor: 'Marya Filatova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Marya_Filatova_-_Galadriel.jpg', obra: 'Galadriel', alterada: true },
  },
  luthien: {
    src: '/portraits/luthien.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Luthien_.jpeg', obra: 'Luthien', alterada: true },
  },
  aredhel: {
    src: '/portraits/aredhel.webp',
    credito: { autor: 'Ted Nasmith', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ted_Nasmith_-_Aredhel_the_White.jpg', obra: 'Aredhel the White', alterada: true },
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
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Fingon.jpg', obra: 'Fingon', alterada: true },
  },
  turgon: {
    src: '/portraits/turgon.webp',
    credito: { autor: 'Catherine Karina Chmiel', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Catherine_Karina_Chmiel_-_Turgon,_Idril,_and_Maeglin_together.jpg', obra: 'Turgon, Idril, and Maeglin together', alterada: true },
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
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Thingol.jpg', obra: 'Thingol', alterada: true },
  },
  melian: {
    src: '/portraits/melian.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Melian.jpg', obra: 'Melian', alterada: true },
  },
  olwe: {
    src: '/portraits/olwe.webp',
    credito: { autor: 'Karolina Węgrzyn', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Karolina_W%C4%99grzyn_-_OlweBeleriand.jpg', obra: 'OlweBeleriand', alterada: true },
  },
  cirdan: {
    src: '/portraits/cirdan.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Cirdan.jpg', obra: 'Cirdan', alterada: true },
  },
  eol: {
    src: '/portraits/eol.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Eol.jpg', obra: 'Eol', alterada: true },
  },
  azaghal: {
    src: '/portraits/azaghal.webp',
    credito: { autor: 'Jenny Dolfen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jenny_Dolfen_-_Azaghal.jpg', obra: 'Azaghal', alterada: true },
  },
  beor: {
    src: '/portraits/beor.webp',
    credito: { autor: 'ForeverMedhok', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:ForeverMedhok_-_Beor.png', obra: 'Beor', alterada: true },
  },
  bregolas: {
    src: '/portraits/bregolas.webp',
    credito: { autor: 'Peter Xavier Price', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Peter_Xavier_Price_-_Bregolas.jpg', obra: 'Bregolas', alterada: true },
  },
  barahir: {
    src: '/portraits/barahir.webp',
    credito: { autor: 'Marya Filatova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Marya_Filatova_-_Rescue_-_Finrod_and_Barahir.jpg', obra: 'Rescue - Finrod and Barahir', alterada: true },
  },
  beren: {
    src: '/portraits/beren.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Beren.jpg', obra: 'Beren', alterada: true },
  },
  morwen: {
    src: '/portraits/morwen.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Morwen.jpg', obra: 'Morwen', alterada: true },
  },
  hador: {
    src: '/portraits/hador.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Hador_the_Goldenhaired.jpg', obra: 'Hador the Goldenhaired', alterada: true },
  },
  galdor: {
    src: '/portraits/galdor.webp',
    credito: { autor: 'Peter Xavier Price', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Peter_Xavier_Price_-_Galdor_the_Tall.jpg', obra: 'Galdor the Tall', alterada: true },
  },
  hurin: {
    src: '/portraits/hurin.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Hurin_Thalion.jpg', obra: 'Hurin Thalion', alterada: true },
  },
  turin: {
    src: '/portraits/turin.webp',
    credito: { autor: 'Kimberly', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Kimberly_-_Turin.jpg', obra: 'Turin', alterada: true },
  },
  tuor: {
    src: '/portraits/tuor.webp',
    credito: { autor: 'Līga Kļaviņa', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:L%C4%ABga_K%C4%BCavi%C5%86a_-_Tuor.jpg', obra: 'Tuor', alterada: true },
  },
  haleth: {
    src: '/portraits/haleth.webp',
    credito: { autor: 'Alystraea', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Alystraea_-_Haleth.jpg', obra: 'Haleth', alterada: true },
  },
  bor: {
    src: '/portraits/bor.webp',
    credito: { autor: 'Helena Stepanova', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Helena_Stepanova_-_Bor_with_his_sons.jpg', obra: 'Bor with his sons', alterada: true },
  },
};

export const paisagens: Partial<Record<TerritoryId, Imagem>> = {
  hithlum: {
    src: '/realms/hithlum.webp',
    credito: { autor: 'Peter Xavier Price', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Peter_Xavier_Price_-_Hithlum.jpeg', obra: 'Hithlum', alterada: true },
  },
  nevrast: {
    src: '/realms/nevrast.webp',
    credito: { autor: 'Ted Nasmith', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ted_Nasmith_-_Tuor_is_Led_by_the_Swans_to_Vinyamar.jpg', obra: 'Tuor is Led by the Swans to Vinyamar', alterada: true },
  },
  aglon: {
    src: '/realms/aglon.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY 3.0', licencaUrl: 'https://creativecommons.org/licenses/by/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Aglon.jpg', obra: 'Passo de Aglon', alterada: true },
  },
  'tol-sirion': {
    src: '/realms/tol-sirion.webp',
    credito: { autor: 'Stefan Meisl', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Stefan_Meisl_-_Minas_Tirith.jpeg', obra: 'Minas Tirith', alterada: true },
  },
  nargothrond: {
    src: '/realms/nargothrond.webp',
    credito: { autor: 'Jonathan Guzi', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jonathan_Guzi_-_Nargothrond.jpg', obra: 'Nargothrond', alterada: true },
  },
  brethil: {
    src: '/realms/brethil.webp',
    credito: { autor: 'Alan Lee', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Alan_Lee_-_The_Coming_of_T%C3%BArin_into_Brethil.jpg', obra: 'The Coming of Túrin into Brethil', alterada: true },
  },
  falas: {
    src: '/realms/falas.webp',
    credito: { autor: 'Matěj Čadil', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', fonte: 'https://commons.wikimedia.org/wiki/File:Brithombar.jpg', obra: 'Brithombar', alterada: true },
  },
  ossiriand: {
    src: '/realms/ossiriand.webp',
    credito: { autor: 'Jenny Dolfen', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Jenny_Dolfen_-_Ossiriand.jpg', obra: 'Ossiriand', alterada: true },
  },
  thargelion: {
    src: '/realms/thargelion.webp',
    credito: { autor: 'Ted Nasmith', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ted_Nasmith_-_Lake_Helevorn.jpg', obra: 'Lake Helevorn', alterada: true },
  },
  doriath: {
    src: '/realms/doriath.webp',
    credito: { autor: 'Ted Nasmith', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ted_Nasmith_-_By_Moonlight_in_Neldoreth_Forest.jpg', obra: 'By Moonlight in Neldoreth Forest', alterada: true },
  },
  angband: {
    src: '/realms/angband.webp',
    credito: { autor: 'John Howe', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:John_Howe_-_Thangorodrim.jpg', obra: 'Thangorodrim', alterada: true },
  },
  dorthonion: {
    src: '/realms/dorthonion.webp',
    credito: { autor: 'Ted Nasmith', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ted_Nasmith_-_At_Tarn_Aeluin.jpg', obra: 'At Tarn Aeluin', alterada: true },
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
  gondolin: {
    src: '/realms/gondolin.webp',
    credito: { autor: 'Alan Lee', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Alan_Lee_-_Gondolin.jpg', obra: 'Gondolin (A Queda de Gondolin)', alterada: true },
  },
  belegost: {
    src: '/realms/belegost.webp',
    credito: { autor: 'Rob Alexander', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Rob_Alexander_-_Blue_Mountain_Dwarf-hold.jpg', obra: 'Blue Mountain Dwarf-hold', alterada: true },
  },
  mithrim: {
    src: '/realms/mithrim.webp',
    credito: { autor: 'J.R.R. Tolkien', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Lake_Mithrim.jpg', obra: 'Lake Mithrim', alterada: true },
  },
  'dor-lomin': {
    src: '/realms/dor-lomin.webp',
    credito: { autor: 'Ted Nasmith', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:Ted_Nasmith_-_T%C3%BArin_Reaches_the_Abandoned_Homestead.jpg', obra: 'Túrin Reaches the Abandoned Homestead', alterada: true },
  },
  himring: {
    src: '/realms/himring.webp',
    credito: { autor: 'David Monette', licenca: FAN_ART, fonte: 'https://tolkiengateway.net/wiki/File:David_Monette_-_Himring.jpg', obra: 'Himring', alterada: true },
  },
};
