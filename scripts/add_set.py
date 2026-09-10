#!/usr/bin/env python3
from pathlib import Path
import argparse
import csv
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
SETS_DIR = ROOT / "web-src" / "data" / "sets"

def load_cards(path: Path):
    cards = []
    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        required = {"number", "name"}
        if not required.issubset(set(reader.fieldnames or [])):
            raise ValueError("CSV deve conter as colunas: number,name")
        for row in reader:
            number = str(row["number"]).strip().zfill(3)
            name = str(row["name"]).strip()
            if not number or not name:
                continue
            cards.append({"number": number, "name": name})
    return cards

def main():
    parser = argparse.ArgumentParser(description="Adiciona uma nova colecao ao Deckmanager.")
    parser.add_argument("--code", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--series", required=True)
    parser.add_argument("--release-date", default=None)
    parser.add_argument("--numbered", type=int, default=None)
    parser.add_argument("--complete", type=int, default=None)
    parser.add_argument("--input", required=True, help="CSV com colunas number,name")
    args = parser.parse_args()

    code = args.code.strip().upper()
    out = SETS_DIR / f"{code}.json"
    if out.exists():
        print(f"[ERRO] {out.name} ja existe. Nao sobrescrito.")
        return 1

    cards = load_cards(Path(args.input))
    if not cards:
        print("[ERRO] Nenhuma carta valida encontrada no CSV.")
        return 1

    data = {
        "code": code,
        "name": args.name.strip(),
        "series": args.series.strip(),
        "releaseDate": args.release_date,
        "counts": {
            "numbered": args.numbered,
            "complete": args.complete,
        },
        "cards": cards,
    }

    SETS_DIR.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Criado: {out}")
    print("Agora execute: python scripts/validate_data.py && python scripts/build.py")
    return 0

if __name__ == "__main__":
    sys.exit(main())
