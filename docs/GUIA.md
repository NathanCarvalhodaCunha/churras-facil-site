# Churras Fácil — site

Landing page da **Churras Fácil — Churrasco & Cia** (distribuidora oficial Kispeto em Atibaia/SP):
espetinho 3D sincronizado com a rolagem, cardápio com os produtos e preços do catálogo da loja no WhatsApp,
pacotes de 1 kg e 2 kg, e todos os pedidos pelo WhatsApp.

**Tecnologias:** React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · Three.js · GSAP + ScrollTrigger · Lucide.

---

## Como executar

Requisito: [Node.js](https://nodejs.org) 20.19 ou mais recente.

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento com recarga automática |
| `npm run build` | verifica os tipos, gera o site em `dist/` e pré-renderiza o HTML (SEO e carregamento rápido) |
| `npm run preview` | serve a versão de produção (`dist/`) em http://localhost:4173 |
| `npm run images` | gera as imagens otimizadas (AVIF + WebP) a partir da pasta `photos/` e, no fim, roda o `npm run brand` |
| `npm run brand` | gera, a partir do logo, o ícone da aba (`favicon.ico`), os ícones de atalho do celular e a imagem da prévia do link (`og-image.png`: só o logo, sem fundo) |

> **"Movimento reduzido" ligado no sistema** (no Windows: Configurações → Acessibilidade → Efeitos visuais →
> Efeitos de animação desligado): a pedido da loja, o site anima do mesmo jeito (espeto 3D, entradas ao rolar,
> menu, efeitos ao passar o mouse). Para voltar a respeitar essa preferência, tire a classe `force-motion`
> da tag `<html>` no `index.html`.

## Como publicar

O site está no ar na Vercel: **https://churras-facil.vercel.app** (projeto `churras-facil`, conta
`nathancarvalhodacunha`). A pasta já está ligada ao projeto (pasta `.vercel`), e o `vercel.json` diz à Vercel
como montar o site (`npm run build`, pasta `dist`) e por quanto tempo guardar fotos e scripts em cache.

**Para publicar uma alteração**, na pasta do projeto:

```bash
npx vercel --prod
```

A Vercel monta o site nos servidores dela e troca a versão no ar em 1–2 minutos. Se pedir login,
rode `npx vercel login` e aprove no navegador. As versões anteriores ficam no painel da Vercel
(Deployments) e dá para voltar a qualquer uma com "Promote to Production".

**Domínio próprio** (ex.: churrasfacil.com.br): no painel da Vercel, abra o projeto → Settings → Domains,
adicione o domínio e siga as instruções de DNS. Depois troque `siteUrl` em `src/config/store.ts` e publique de novo.

> **Plano da Vercel:** a conta está no plano gratuito Hobby, que pelas regras da Vercel é para uso pessoal.
> Para o site de uma loja (uso comercial), a Vercel pede o plano Pro.

Outra hospedagem: rode `npm run build` e envie o conteúdo da pasta **`dist/`** (site estático, sem servidor Node),
com HTTPS e compressão (gzip/brotli) ligados.

---

## Onde editar cada coisa

Tudo o que é informação comercial fica em `src/config/`. Alterou, salvou: o site inteiro se atualiza.

| Arquivo | Conteúdo |
|---|---|
| `src/config/store.ts` | nome, **WhatsApp** e link do catálogo, telefone, endereço, horários, Instagram, nota do Google, domínio do site |
| `src/config/messages.ts` | mensagens pré-preenchidas de cada botão do WhatsApp |
| `src/config/products.ts` | **produtos e preços do catálogo**, categorias, marca, peso e fotos do cardápio |
| `src/config/packages.ts` | ocasiões da seção "Pacotes" (os cards de pacotes vêm do cardápio) |
| `src/config/content.ts` | títulos e textos das seções, número "anos de experiência" da seção "Sobre" |
| `src/config/seo.ts` | título, descrição e imagem de compartilhamento |

**Cardápio = catálogo do WhatsApp.** Os 28 produtos de `products.ts` foram copiados do catálogo da loja
(prints de 12/11/2026), na mesma ordem. Cada produto tem o nome exibido no site (`name`) e o nome exato do
catálogo (`catalogName`), que vai na mensagem do botão "Pedir pelo WhatsApp" para a loja achar o item.
Produtos com **1 kg ou mais** aparecem também na seção "Pacotes", automaticamente.

**Preços:** use `price: 31.9` para exibir "R$ 31,90" (ou `price: null` para "Consulte o valor").

**WhatsApp:** o número fica em um único lugar (`store.whatsapp.number`, só dígitos: 55 + DDD + número).
Todos os botões geram links `https://wa.me/NUMERO?text=MENSAGEM` e abrem em nova aba.
(O link do catálogo, `store.whatsapp.catalogUrl`, continua guardado em `store.ts`, mas não aparece mais no site.)

### Trocar fotos dos produtos

Todas as fotos do cardápio têm crédito em `/creditos.html`:

- **18 produtos (espetos Kispeto)** usam a foto do próprio espeto, do site da Kispeto
  ([linha de espetinhos](https://kispeto.com.br/site/espetinhos-para-churrasco/)), recortada no prato
  (`photos/kp-*.jpg`). Pesos diferentes do mesmo espeto usam a mesma foto (ex.: bovino 500 g, 1 kg e 2 kg).
- **10 produtos** que a Kispeto não tem usam a foto de banco de imagens que mais se parece com o produto
  (`photos/st-*.jpg`, Unsplash e Wikimedia Commons), com a etiqueta **"Foto ilustrativa"**
  (`illustrative: true` em `products.ts`): abacaxi com canela (abacaxi fatiado), legumes (espetos de legumes
  na grelha), kafta com queijo e bacon (carne enrolada em bacon), abobrinha com queijo coalho (abobrinha
  grelhada), queijo coalho (espetos de queijo na grelha), mussarela defumada (queijo defumado), pão de alho
  e os medalhões Romeu e Julieta, mandioca e provolone (rolinhos enrolados em bacon).

Para trocar por uma foto melhor (ex.: a foto real de um produto ilustrativo):

1. Salve a foto em `photos/` com o nome da chave usada no produto (ex.: `photos/st-pao-de-alho.jpg`) ou crie
   uma chave nova (inclua em `photos/credits.json` com `"role": "thumb"`) e troque `image:` no produto.
2. Rode `npm run images`.
3. Se a foto agora é do produto exato, apague `illustrative: true` do produto.

### Trocar fotos das seções

1. Coloque a foto nova em `photos/` com o **mesmo nome** (ex.: `photos/pacotes.jpg`).
2. Ajuste o texto alternativo e os créditos em `photos/credits.json` (fotos da própria loja: `"own": true`, não entram em `/creditos.html`).
3. Rode `npm run images`.

Para um produto novo: salve `photos/cat-nome.jpg`, inclua uma entrada em `photos/credits.json`
(`"role": "thumb", "own": true`), rode `npm run images` e use `image: 'cat-nome'` no produto.

---

## ✅ Antes de colocar no ar — o que substituir

**Já confirmado**

- [x] **WhatsApp** — `551144122447`: o link `wa.me/c/551144122447` abre "o catálogo de CHURRAS FÁCIL no WhatsApp".
- [x] **Produtos e preços** — os 28 itens do catálogo do WhatsApp (prints de 12/11/2026).

**Confirmar com a loja**

- [ ] **Horário de domingo** — o Google mostrou 9h–15h na semana do feriado de 15/11, com o aviso "os horários podem ser diferentes".
- [ ] **Nota do Google** — 5,0 com 7 avaliações (nov/2026). Atualize de tempos em tempos.
- [ ] **Produtos fora do catálogo** — camarão, tilápia, pintado, jacaré e espetos veganos (citados no Instagram) saíram do site porque não estão no catálogo. Se a loja ainda vende, inclua no catálogo e em `products.ts`.
- [ ] **Preços** — confira de tempos em tempos se continuam iguais aos do catálogo.

**Placeholders (marcados no site como "a definir")**

- [ ] **Anos de experiência** — número da seção "Sobre" (`content.ts`, `value: null`).
- [x] **Endereço do site** — `siteUrl` em `store.ts` está com `https://churras-facil.vercel.app` (link canônico, `sitemap.xml` e imagem de compartilhamento já usam esse endereço).
- [ ] **Domínio próprio** (opcional) — se a loja tiver um (ex.: `churrasfacil.com.br`), ligue na Vercel e troque `siteUrl` (veja "Como publicar").

**Arquivos da marca e fotos**

- [ ] **Logo** — `public/brand/logo-churras-facil.png` foi recortado de um print do Instagram (627×304 px). Substitua pelo arquivo original em alta resolução (PNG com fundo transparente, mesmo nome) e rode `npm run brand` para gerar as versões do site, os ícones e a imagem de compartilhamento.
- [x] **Fotos dos espetos Kispeto** — do site da Kispeto, com crédito em `/creditos.html`.
- [ ] **10 fotos ilustrativas** (itens que a Kispeto não tem) — troque pelas fotos reais dos produtos quando tiver (veja "Trocar fotos dos produtos").
- [ ] **Fotos das seções** — as fotos grandes (topo, "Sobre", pacotes, diferenciais, chamada final) são **imagens ilustrativas** do Unsplash (licença gratuita, uso comercial permitido), listadas em `/creditos.html`. O ideal é trocá-las por fotos reais da loja. Sugestão de ensaio: os espetos no balcão, o freezer com os pacotes, os espetos na brasa, a fachada dentro do posto.

---

## Prévia do link no WhatsApp e ícone

- Título, descrição e imagem da prévia ficam em `src/config/seo.ts` (`shareTitle`, `shareDescription`, `ogImage`).
  O WhatsApp mostra o título em negrito, cerca de duas linhas da descrição e a imagem recortada em quadrado no centro
  (o logo fica dentro desse quadrado).
- O WhatsApp guarda a prévia de cada endereço por um tempo. Depois de mudar a imagem, troque o `?v=` de `ogImage`;
  para testar na hora, envie o link com algo no fim (ex.: `https://churras-facil.vercel.app/?v=3`).
- O ícone da aba e dos atalhos vem do logo: rode `npm run brand` depois de trocar `public/brand/logo-churras-facil.png`.

## Privacidade, acessibilidade e pendências legais

- **Aviso de privacidade:** `public/privacidade.html` (link no rodapé e na página de créditos). Descreve o que o site faz hoje:
  sem cookies, sem estatística, sem formulários; hospedagem na Vercel; WhatsApp; Google Maps só ao clicar; preferência
  "Pausar animações" guardada no navegador. Se entrar Google Analytics, Meta Pixel, formulário ou cadastro, atualize o texto.
- **Pausar animações** (rodapé e menu do celular): para a faixa de produtos, as brasas, a fumaça e o pulso do WhatsApp
  (acessibilidade, WCAG 2.2.2). Código em `src/lib/motionPause.ts`.
- **Pendências que dependem da loja:** razão social e CNPJ no rodapé e no aviso de privacidade; condições dos pedidos
  (pagamento, retirada/entrega, taxa, trocas e arrependimento); autorização por escrito da Kispeto para as fotos e para
  "distribuidora oficial"; anos de experiência (`about.stats.years` em `content.ts`); horário de domingo; revisão
  dos textos por um advogado.

## Estrutura

```
src/
  config/          ← dados da loja, produtos, pacotes, textos, SEO, mensagens do WhatsApp
  components/
    layout/        Header (menu mobile), Footer, botão flutuante do WhatsApp
    sections/      Hero, About (Sobre), Products, Packages, Craft (Diferenciais), CallToAction, Contact
    three/         SkewerStage — carrega a cena 3D sob demanda
    ui/            Picture, Price, Counter, TornEdge, ícones…
  three/           cena 3D: geometria procedural, material, brasas e fumaça
  lib/             WhatsApp, horários, formatação, GSAP
photos/            fotos originais (fonte para `npm run images`); kp-*.jpg = Kispeto, st-*.jpg = banco de imagens
photos/_nao-usadas fotos que o cardápio deixou de usar (fotos e recortes do catálogo substituídos), com os créditos
public/            imagens otimizadas, logo, ícones, créditos
scripts/           otimização de imagens e pré-renderização
```

## Sobre o espetinho 3D

- Modelado proceduralmente em Three.js, sem arquivo GLB, seguindo a foto do espetinho bovino Kispeto: 10 pedaços
  irregulares de carne apertados no palito de bambu, cada um com cortes e ângulos diferentes. O código ainda sabe
  fazer pimentão e cebola: veja a lista `specs` em `src/three/SkewerScene.ts`.
- Texturas geradas por ruído 3D em um único shader (selagem cor de mogno, brilho de marinada, fibras, pontas tostadas,
  ervas, pimenta e sal).
- Fumaça saindo da carne: tufos que nascem em cima dos pedaços, onde o espeto estiver, e sobem abrindo e sumindo
  (`createSkewerSmoke` em `src/three/particles.ts`). A quantidade por aparelho fica em `wisps`, em `src/three/SkewerScene.ts`.
- A rotação, a posição, a escala e a perspectiva seguem o progresso da rolagem (GSAP ScrollTrigger). O espeto dá uma volta completa enquanto vai até o centro da tela e fica parado ali até o fim do topo, junto com a frase "O resto é fácil." e o botão de pedido.
- Qualidade proporcional ao aparelho: resolução, sombras, partículas e detalhe dos shaders se ajustam, e a resolução cai sozinha se o aparelho não mantiver a fluidez.
- O three.js começa a baixar logo no início do site, junto com o resto da página, e a cena é montada assim que o topo fica pronto: o espeto aparece antes da primeira rolagem (principalmente no celular).
- Onde roda (`src/three/support.ts`): com placa de vídeo, 3D completo; em Windows sem aceleração de vídeo, uma versão leve (que vira foto se mesmo assim ficar travando); sem WebGL, com economia de dados ligada, ou em celulares e servidores de teste sem aceleração (como o PageSpeed), uma foto no lugar — é isso que mantém a nota alta no PageSpeed.
- O espeto e as frases do topo funcionam mesmo com "movimento reduzido" ligado no sistema (pedido da loja: 3D funcionando em qualquer Windows). O resto do site também anima sempre (veja a classe `force-motion` no `index.html`).

## Animações do site

- **Rolagem suave** no computador (Lenis), desligada em celulares e com "movimento reduzido".
- **Títulos** entram palavra por palavra; **fotos** são reveladas por uma "cortina" com zoom e têm parallax.
- **Cardápio**: faixa de texto em movimento que acelera com a rolagem, cards em cascata, filtro e botão "Ver todos" com transição (GSAP Flip).
- **Números** contam até o valor (nota do Google, dias abertos, quantidade dos pacotes).
- **Botões principais** com brilho no hover e efeito magnético (acompanham o cursor).
- **Chamada final** com fagulhas subindo.
- **Menu do celular e tablet**: o painel desliza da direita para a esquerda, as opções entram uma depois da outra e,
  no hover, ganham o mesmo sublinhado dos links do rodapé (`.menu-drawer` em `src/index.css`).

Todas ficam em `src/App.tsx` (atributos `data-split`, `data-reveal`, `data-reveal-img`, `data-parallax`, `data-magnetic`…) e respeitam a preferência de "movimento reduzido".

> **Pasta no OneDrive/Google Drive:** o `vite.config.ts` usa verificação periódica de arquivos (`usePolling`) porque pastas sincronizadas nem sempre avisam quando um arquivo muda.
