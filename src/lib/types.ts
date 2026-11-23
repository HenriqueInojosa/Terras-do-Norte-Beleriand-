// Tipos centrais do Atlas. Todo conteúdo referencia outros conteúdos por id.

export type ChapterId =
  | 'ainulindale'
  | 'valaquenta'
  | `qs-${number}`
  | 'akallabeth'
  | 'aneis';

export type Fonte = 'silmarillion' | 'complementar';

/** Um fato que pode ser spoiler: só aparece a partir do capítulo `revelado`. */
export interface Fato<T> {
  valor: T;
  revelado: ChapterId;
  fonte?: Fonte; // padrão: 'silmarillion'
  ref?: string; // ex.: 'Cap. 14'
  nota?: string; // versão alternativa, ressalva
}

export type TerritoryId =
  | 'hithlum'
  | 'mithrim'
  | 'dor-lomin'
  | 'nevrast'
  | 'dorthonion'
  | 'ard-galen'
  | 'himring'
  | 'maglors-gap'
  | 'himlad'
  | 'aglon'
  | 'thargelion'
  | 'angband'
  | 'gondolin'
  | 'doriath'
  | 'nargothrond'
  | 'tol-sirion'
  | 'falas'
  | 'brethil'
  | 'dimbar'
  | 'nan-dungortheb'
  | 'beleriand-leste'
  | 'nan-elmoth'
  | 'estolad'
  | 'ossiriand'
  | 'taur-im-duinath'
  | 'nogrod'
  | 'belegost';

export type CharacterId = string;
export type HouseId = 'finwe' | 'thingol';
export type PeopleId = 'noldor' | 'sindar' | 'teleri' | 'vanyar' | 'laiquendi' | 'maiar' | 'ainur' | 'homens' | 'anoes';

export type TerritoryType = 'reino' | 'regiao' | 'fortaleza' | 'passagem' | 'territorio';

export interface Territory {
  id: TerritoryId;
  /** Nomes em ordem de revelação; vale o último já revelado. */
  nome: Fato<string>[];
  significado?: Fato<string>;
  tipo: TerritoryType;
  parteDe?: TerritoryId;
  localizacao: Fato<string>[];
  /** Parágrafos. Use [[id]] ou [[id|texto]] para citar personagens e territórios. */
  descricao: Fato<string>[];
  povos: Fato<PeopleId>[];
  vizinhos: TerritoryId[];
  revelado: ChapterId;
  /** Ilustração do reino (ex.: '/realms/doriath.webp'). Sem ela, os cards usam um recorte do mapa. */
  imagem?: string;
  /** Antes deste capítulo o território aparece velado (sem nome) no mapa. */
  veladoAte?: ChapterId;
  capitulos: ChapterId[];
}

/** Crédito de uma imagem de terceiros (retrato ou paisagem). */
export interface Credito {
  autor: string;
  /** Ex.: 'CC BY-SA 4.0' ou 'Domínio público'. */
  licenca: string;
  licencaUrl?: string;
  /** Página da obra original (Wikimedia Commons). */
  fonte: string;
  /** Título da obra original. */
  obra?: string;
  /** true quando a imagem foi recortada ou teve as cores alteradas. */
  alterada?: boolean;
}

export interface Character {
  id: CharacterId;
  nome: Fato<string>[];
  titulos: Fato<string>[];
  povo: PeopleId;
  casa?: HouseId;
  pais: Fato<CharacterId>[];
  /** Só para irmãos cujos pais o livro não nomeia (ex.: Elwë e Olwë). */
  irmaos?: Fato<CharacterId>[];
  conjuges: Fato<CharacterId>[];
  /** Parágrafos. Use [[id]] ou [[id|texto]] para links. */
  biografia: Fato<string>[];
  retrato?: string;
  revelado: ChapterId;
  fonte?: Fonte;
  nota?: string;
}

export type EntityRef =
  | { kind: 'character'; id: CharacterId }
  | { kind: 'territory'; id: TerritoryId };

export type RelationshipType = 'governa' | 'vassalo-de' | 'alianca' | 'amizade' | 'reconhece-rei';

export interface Relationship {
  id: string;
  tipo: RelationshipType;
  de: EntityRef;
  para: EntityRef;
  revelado: ChapterId;
  fonte?: Fonte;
  ref?: string;
  nota?: string;
}

export interface House {
  id: HouseId;
  nome: string;
  lema: string;
  raiz: CharacterId[];
  /** Personagens cujos descendentes começam recolhidos. */
  recolhidosPorPadrao?: CharacterId[];
  revelado: ChapterId;
}

export interface People {
  id: PeopleId;
  nome: string;
  descricao: string;
  revelado: ChapterId;
}

export interface TimelineEvent {
  id: string;
  titulo: string;
  era: 'anos-das-arvores' | 'primeira-era';
  ano?: number;
  descricao: string;
  envolvidos: EntityRef[];
  revelado: ChapterId;
}

export interface Chapter {
  id: ChapterId;
  parte: string;
  numero?: number;
  titulo: string;
}

// Camada do mapa gerada a partir do SVG
export type TerritoryShape =
  | { id: TerritoryId; shape: 'path'; d: string }
  | { id: TerritoryId; shape: 'circle'; cx: number; cy: number; r: number };

export interface MapLabel {
  id: string;
  cls: string;
  transform: string;
  territory?: TerritoryId;
  parts: { text: string; cls?: string; x?: string; dy?: string }[];
}

export interface MapLayer {
  viewBox: number[];
  territories: TerritoryShape[];
  labels: MapLabel[];
  titles: { cls: string; x: number; y: number; text: string }[];
  gondolinMarker: string;
}
