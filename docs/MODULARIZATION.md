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
