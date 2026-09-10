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
