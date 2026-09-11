# Modularização — Etapa 2

Fonte funcional: `index.html` enviado em 10/09/2026.

## Concluído

- 23 coleções extraídas para `web-src/data/sets/*.json`.
- `index.html` deixou de conter:
  - `SET_COLLECTIONS`
  - `SET_THRESHOLDS`
  - `SET_RELEASE_DATES`
  - `SET_SERIES`
- O HTML agora carrega `data/sets.generated.js`.
- `scripts/build.py` valida, gera os dados e copia os artefatos para `apk-project/app/src/main/assets`.
- `scripts/add_set.py` cria uma nova coleção a partir de CSV `number,name`.
- Testes unitários básicos adicionados em `tests/test_sets_data.py`.

## Fluxo para nova coleção

```bash
python scripts/add_set.py \
  --code NOV \
  --name "Nova Coleção" \
  --series "Mega" \
  --release-date 2026-10-01 \
  --numbered 100 \
  --complete 130 \
  --input nova-colecao.csv

python scripts/validate_data.py
python scripts/build.py
python -m unittest discover -s tests -v
```

## Segurança de migração

Nenhuma chave de persistência (`tcg_decks`, `tcg_collection`, `tcg_pokedex*`) foi alterada nesta etapa.
O objetivo aqui é somente separar os dados das coleções sem alterar as regras funcionais.

## Etapa 3 — CSS externo

- O bloco `<style>` foi removido de `web-src/index.html`.
- Os estilos agora vivem em `web-src/css/app.css`.
- O build copia o CSS para `apk-project/app/src/main/assets/css/app.css`.
- Nenhuma regra funcional ou chave de persistência foi alterada.

## Etapa 4 — Núcleo JavaScript

Foram extraídos do HTML os primeiros componentes de infraestrutura:

```text
web-src/js/core/
├── helpers.js
├── state.js
├── android-bridge.js
└── storage.js
```

Responsabilidades:

- `helpers.js`: utilitários puros compartilhados (`fmtDate`, `genId`, `esc`);
- `state.js`: estado global, mantendo o schema atual;
- `android-bridge.js`: bridge mínimo de `AndroidStorage`;
- `storage.js`: `loadStorage` e `saveStorage`, mantendo todas as chaves `tcg_*`.

As bridges de navegador/exportação continuam temporariamente nas features para reduzir o risco da migração.

Nenhuma chave de persistência foi renomeada.

## Etapa 5 — Features de coleção e sets

Foram criados:

```text
web-src/js/features/
├── collection.js
└── sets.js
```

`collection.js` concentra:

- parsing de entrada manual;
- resolução de nomes de cartas;
- consulta e atualização de quantidade;
- backup/restauração da coleção;
- renderização da aba "Minha Coleção".

`sets.js` concentra:

- aba de coleções principais;
- pool;
- grade e detalhe das coleções/sets.

O `attachEvents()` permanece temporariamente no script principal. Isso evita mover, na mesma etapa, lógica de eventos de várias features ainda acopladas.

O build agora copia `web-src/js/features/*.js` para `apk-project/app/src/main/assets/js/features/`.

## Etapas 6–7 — Decks, Shopping e Pokédex

Foram criados:

```text
web-src/js/features/
├── decks.js
├── shopping.js
└── pokedex.js
```

Funções extraídas nesta etapa:

- Decks: calcProgress, calcMissing, buildDecksTab, buildDeckEditorModal
- Shopping: buildShoppingList, formatLigaPokemon, copyShoppingList, exportShoppingList, buildShoppingTab
- Pokédex: buildPokedexModal

Os dados brutos das gerações do Pokédex permanecem no `index.html` por enquanto.
Isso reduz o risco da migração; a separação dos dados ficará para uma etapa posterior.

## Etapa 8 — Dashboard e UI compartilhada

Foram extraídos `dashboard.js` e `ui/layout.js`. Também foi concluída a extração do runtime restante de Decks e Pokédex, mantendo apenas os dados brutos do Pokédex inline.

`attachEvents()` permanece no `index.html` e será tratado isoladamente na próxima etapa de maior risco.

## Etapa 9 — Eventos globais

`attachEvents()` foi movido integralmente para `web-src/js/ui/events.js`.

O conteúdo interno da função foi preservado. Nesta etapa não houve separação
dos listeners por feature; isso será feito somente depois que esta versão for
validada no APK instalado.
