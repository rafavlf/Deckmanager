# Deckmanager

Gerenciador de coleção e decks de Pokémon TCG, com suporte a controle de cartas, progresso por coleção, Pokédex, decks, lista de compras e dashboard.

O projeto utiliza uma interface web embarcada em um aplicativo Android.

## Funcionalidades

- Controle de cartas por coleção
- Progresso individual de cada set
- Dashboard com estatísticas da coleção
- Gerenciamento de decks
- Cálculo de cartas faltantes
- Lista de compras
- Pokédex por geração
- Importação e exportação de dados
- Persistência local no Android
- Tema claro e escuro

## Arquitetura

O código web principal fica em:

```text
web-src/
├── index.html
├── css/
│   └── app.css
├── data/
│   ├── sets/
│   ├── sets.generated.js
│   └── pokedex/
│       └── pokedex.generated.js
└── js/
    ├── core/
    │   ├── helpers.js
    │   ├── state.js
    │   ├── android-bridge.js
    │   └── storage.js
    ├── features/
    │   ├── collection.js
    │   ├── dashboard.js
    │   ├── decks.js
    │   ├── pokedex.js
    │   ├── sets.js
    │   └── shopping.js
    ├── ui/
    │   ├── layout.js
    │   ├── events.js
    │   ├── events-navigation.js
    │   ├── events-interactions.js
    │   ├── events-decks.js
    │   ├── events-collection.js
    │   └── events-history.js
    └── app.js
