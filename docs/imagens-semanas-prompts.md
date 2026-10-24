# Prompts das ilustrações das semanas (Jornada / álbum de figurinhas)

As semanas 1–10 têm ilustração; as semanas **11–40** são PNGs de 1×1 px (placeholder) em
`assets/images/semanas/`. Estes prompts geram as 30 que faltam no mesmo estilo das semanas 8, 9 e 10.

## Estilo de referência (semanas 8, 9 e 10)

- Um único objeto **realista** no centro, dentro de uma **bolha de sabão iridescente** e transparente.
- Fundo em degradê **pêssego / damasco / creme**, desfocado, com bokeh suave, círculos claros e
  brilhinhos dourados; às vezes nuvenzinhas brancas.
- Luz suave e quente, renderização 3D macia, sem sombras duras.
- Quadrado **1024×1024**, **sem texto** e **sem rosto** no objeto.

Destoam do padrão e valem regerar depois: **semana 4** (tem texto escrito na imagem) e **semana 6**
(fruta com carinha, estilo kawaii).

## Prompt base (colar antes de cada assunto)

> Soft 3D illustration, square 1:1, 1024x1024. A single realistic {ASSUNTO} floating in the exact
> center, fully enclosed inside a large transparent iridescent soap bubble with rainbow reflections
> on its edges. The bubble fills about 60% of the frame. Dreamy pastel background in a smooth peach,
> apricot and cream gradient, blurred bokeh circles, a few tiny golden sparkles, warm soft lighting,
> gentle glow around the bubble, calm and cozy mood. Clean composition, high detail on the object,
> no text, no letters, no watermark, no face on the object.

**Negativo** (se o gerador aceitar): `text, letters, words, watermark, logo, face, eyes, cartoon face,
kawaii, people, hands, dark background, harsh shadows, multiple objects, cropped bubble`

Dica de consistência: gere a semana 11 primeiro e, se o gerador aceitar imagem de referência, use a
**semana 10** (`semana-10.jpeg`) como referência de estilo em todas.

## Assunto de cada semana

A comparação vem de `sint_db.json`. Objetos que se repetem (melancia, abóbora) estão variados para o
álbum não parecer repetido.

| Semana | Comparação (app) | {ASSUNTO} |
|---|---|---|
| 11 | Bola de golfe | white dimpled golf ball |
| 12 | Limão Taiti | fresh green Tahiti lime with a small leaf |
| 13 | Bola de tênis | bright yellow-green tennis ball |
| 14 | Laranja | ripe orange with a green leaf on the stem |
| 15 | Bola de bocha | glossy colored bocce ball |
| 16 | Toranja (Grapefruit) | pink grapefruit, whole |
| 17 | Mini bola de futebol | small classic black-and-white soccer ball |
| 18 | Melão pequeno | small cantaloupe melon with netted skin |
| 19 | Bola de handebol | handball with colorful panels |
| 20 | Coco verde redondo | round green young coconut |
| 21 | Bola de vôlei | white and pastel-blue volleyball |
| 22 | Melancia pequena redonda | small round striped watermelon |
| 23 | Bola de basquete | orange basketball |
| 24 | Repolho grande | large fresh green cabbage with curly leaves |
| 25 | Globo terrestre de mesa | small desktop world globe on a stand, pastel colors |
| 26 | Abóbora moranga | orange moranga (kabocha-like) pumpkin with a short stem |
| 27 | Bola de praia pequena | small striped beach ball in pastel colors |
| 28 | Melão amarelo grande | large yellow honeydew melon |
| 29 | Cúpula esférica de luminária | round white paper lantern lampshade, softly glowing |
| 30 | Melancia redonda média | medium round watermelon with a slice cut showing red flesh |
| 31 | Boia esférica de sinalização | round orange marine buoy |
| 32 | Abóbora redonda grande | large round light-orange pumpkin |
| 33 | Almofada de nó esférica | round knot pillow made of soft pastel knitted fabric |
| 34 | Melancia grande | large oval watermelon with dark green stripes |
| 35 | Bola de pilates (45 cm) | glossy pastel-pink pilates ball |
| 36 | Abóbora gigante redonda | giant round pumpkin, pale cream color |
| 37 | Pufe esférico médio | round knitted pouf ottoman in cream color |
| 38 | Melancia gigante | giant watermelon, whole, with a few water droplets |
| 39 | Bola de exercício (50 cm) | glossy pastel-blue exercise ball |
| 40 | Abóbora moranga gigante | giant moranga pumpkin with deep ribs and a curly stem |

## Onde salvar

Substituir os arquivos em `assets/images/semanas/semana-N.png`, mantendo o nome (o app importa por esse
caminho em `constants/imagesSemanas.ts`, nenhum código precisa mudar). As semanas 1–10 são JPEG com
extensão `.png` e funcionam normalmente; pode salvar as novas do mesmo jeito.

- Tamanho: 1024×1024. Para o app não ficar pesado, comprimir para ~150–300 KB (JPEG qualidade ~80).
- O objeto precisa ficar **no centro**: no álbum e no caminho da Jornada a imagem é recortada em
  quadrado/círculo pequeno.
