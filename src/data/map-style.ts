import { mapLayer as camadaBicoDePena } from './generated/map-layer';
import { mapLayer as camadaFilme } from './generated/map-layer-filme';

// Qual desenho do mapa o Atlas usa. Os dois ficam no projeto:
//   'filme'        tinta sépia sobre pergaminho, no estilo dos mapas dos filmes (assets/map/filme/)
//   'bico-de-pena' o mapa à pena anterior, com nomes em vermelho (assets/map/bico-de-pena/)
// Para voltar ao mapa antigo, basta trocar a linha abaixo para 'bico-de-pena'.
export const MAP_STYLE: 'filme' | 'bico-de-pena' = 'filme';

const ESTILOS = {
  filme: { layer: camadaFilme, art: '/maps/filme/beleriand-base.webp', art2x: '/maps/filme/beleriand-base@2x.webp' },
  'bico-de-pena': { layer: camadaBicoDePena, art: '/maps/beleriand-base.webp', art2x: '/maps/beleriand-base@2x.webp' },
} as const;

export const mapLayer = ESTILOS[MAP_STYLE].layer;
export const MAP_ART = ESTILOS[MAP_STYLE].art;
export const MAP_ART_2X = ESTILOS[MAP_STYLE].art2x;
