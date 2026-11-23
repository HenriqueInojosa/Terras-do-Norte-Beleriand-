# Atlas de Beleriand

Enciclopédia visual e interativa dos reinos do norte de Beleriand, baseada em *O Silmarillion*.
Começa pelo mapa: clique num reino, descubra quem o governa, abra a família de cada personagem
e volte ao mapa com os domínios dele destacados. Tudo respeita o ponto da sua leitura.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # integridade dos dados e controle de spoilers
npm run build      # gera o site estático em out/
```

## Como está organizado

```
assets/map/beleriand-estilizado.svg   mapa original estilizado (fonte)
scripts/split_map.py                  divide o mapa em arte (imagem) e camada interativa
public/maps/beleriand-base.svg        arte do mapa, gerada
src/
  app/                  rotas: Atlas, /reinos, /personagens, /genealogias, /relacoes, /linha-do-tempo
  components/
    atlas/              mapa (MapCanvas), painel do território, fichas e índice de reinos
    characters/         card sobre o mapa, mini árvore, fichas e índice de personagens
    genealogy/          árvore genealógica com zoom, arraste e ramos recolhíveis
    relations/          grafo de relações políticas
    timeline/           linha do tempo (estrutura)
    spoilers/           progresso de leitura, seletor de capítulo, boas-vindas
    ui/                 PanZoom (câmera), molduras hexagonais, brasões, links de texto
  data/                 o conteúdo, separado da interface
    chapters.ts  territories.ts  characters.ts  genealogies.ts
    relationships.ts  timeline.ts  peoples.ts  map-regions.ts
    generated/map-layer.ts   formas e rótulos do mapa, gerados pelo script
  lib/
    world.ts            filtro de leitura e seletores (único caminho entre dados e telas)
    family-layout.ts    cálculo das posições das árvores
tests/data-integrity.test.ts
```

## Regras de conteúdo

- Todo fato que pode ser spoiler tem `revelado: 'qs-N'`. Na dúvida, use o capítulo mais tardio.
- O governante de um território fica só em `relationships.ts`.
- Pais e cônjuges ficam no personagem; irmãos, filhos e árvores são calculados.
- Informação de fora de *O Silmarillion* publicado leva `fonte: 'complementar'` e fica oculta por padrão.
- Nos textos, `[[id]]` ou `[[id|texto]]` vira link para o personagem ou território.

## Retratos

Enquanto um personagem não tem retrato, a moldura mostra um brasão original da casa.
Para adicionar: salve a imagem em `public/portraits/<id>.webp` e preencha `retrato: '/portraits/<id>.webp'`
no personagem em `src/data/characters.ts`.

## Mapa

Depois de editar `assets/map/beleriand-estilizado.svg`, rode `npm run map` para gerar de novo a arte e a camada
interativa. Cada território é um elemento com o mesmo id usado em `territories.ts`.

A arte é exibida como WebP (`public/maps/beleriand-base.webp` e a versão `@2x`, carregada só ao aproximar), não como SVG:
os filtros do SVG deixavam o zoom lento. O passo de rasterização usa o Playwright com Chromium e o Pillow.
