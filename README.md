# Portfólio interativo

Portfólio acadêmico de página única, desenvolvido com HTML, CSS e JavaScript puros. O menu é navegável por mouse, toque e teclado; suas seções abrem sem recarregar a página.

## Como abrir

Abra `index.html` diretamente em um navegador ou use a extensão Live Server no VS Code. Não é necessário instalar dependências.

## Navegação

- Use `↑` e `↓` para selecionar uma opção do menu.
- Pressione `Enter` para abrir uma seção.
- Pressione `Esc` para voltar ao menu.
- Clique ou toque nas opções para navegar.

## Estrutura

- `index.html`: estrutura semântica, conteúdo e modelos das telas.
- `css/style.css`: identidade visual, fundo, estados de interação e adaptação para telas menores.
- `js/script.js`: navegação, abertura e fechamento de telas, foco de teclado e preferência de animação.
- `assets/images/background2.mp4`, `assets/images/background.gif` e `assets/images/persona-reference.jpg`: arquivos locais excluídos do repositório público por não haver licença de redistribuição.
- O título e as opções usam Arial Black em negrito e itálico, aproximando a tipografia da referência visual.
- `assets/fonts/RobotoCondensed-BlackItalic.ttf` e `assets/fonts/OFL.txt`: fonte e licença SIL Open Font License 1.1.
- `assets/fonts/FOT-NewRodin Pro EB.otf`: fonte local excluída do repositório público por não haver licença de redistribuição.

Na publicação pública, o fundo de mídia não acompanha o código; a interface continua usando o fundo azul de base. Para publicar um fundo, use um arquivo próprio ou com licença que permita redistribuição.

## Personalização

- Para trocar o fundo, use mídia própria ou licenciada e atualize o `<source>` em `index.html` e a imagem de fallback em `css/style.css`.
- Edite os textos e os modelos `<template>` em `index.html` para atualizar as informações das telas.
- Para adicionar outra opção, inclua seu botão no menu, um modelo de conteúdo e os metadados correspondentes em `sections` no `js/script.js`.
- Ajuste cores, tipografia e posicionamento em `css/style.css`. Evite remover os IDs e atributos `data-section` usados pelo JavaScript.

O modo de animação reduzida respeita a preferência do dispositivo por padrão e também pode ser alternado na tela **SISTEMA**.

## Publicar no GitHub Pages

1. Envie os arquivos do projeto para um repositório no GitHub.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha a branch principal e a pasta `/ (root)`, depois salve.
5. Aguarde a publicação e abra o endereço indicado pelo GitHub Pages.

Mantenha `index.html`, `css/`, `js/` e os recursos licenciados em `assets/` na raiz publicada para que os caminhos relativos continuem funcionando.
