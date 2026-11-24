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
scripts/import_map.py                 gera a camada interativa do mapa (áreas e rótulos)
public/maps/beleriand-base.webp       arte do mapa (e @2x)
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

O mapa é um desenho à pena, de borda a borda, que ocupa a tela inteira no Atlas.
Os arquivos ficam em `assets/map/bico-de-pena/`:

- `beleriand-regioes.svg`: as áreas clicáveis, cada uma com o mesmo id usado em `territories.ts`;
- `beleriand-rotulos.svg`: os nomes do mapa, desenhados pelo app por cima da arte para respeitar spoilers e zoom;
- `beleriand-estilizado.svg` e `fonte/`: a versão vetorial completa e os scripts que geram a arte.

A arte vai pronta em `public/maps/beleriand-base.webp` (2400px) e `@2x` (4800px, carregada só ao aproximar no desktop),
sem nenhum nome escrito. Depois de trocar as regiões ou os rótulos, rode `npm run map` para gerar de novo
`src/data/generated/map-layer.ts`.

### Dois desenhos do mapa

O Atlas tem dois desenhos e usa um de cada vez, escolhido em `src/data/map-style.ts` (`MAP_STYLE`):

- `filme` (o atual): tinta sépia sobre pergaminho, no estilo dos mapas dos filmes, em `assets/map/filme/`
  e `public/maps/filme/`. A arte sai de `assets/map/filme/fonte/filme.py` (tinta) + `compor.py` (papel);
  os nomes saem de `fonte/rotulos.py`, que parte dos rótulos do mapa à pena. Depois de mudar, rode
  `python3 scripts/import_map.py filme`.
- `bico-de-pena` (o anterior): continua intacto. Para voltar a ele, troque `MAP_STYLE` para `'bico-de-pena'`.
