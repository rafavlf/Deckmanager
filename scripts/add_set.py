#!/usr/bin/env python3
from pathlib import Path
import argparse
import csv
import json
import re
import subprocess
import sys
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
SETS_DIR = ROOT / "web-src" / "data" / "sets"
CODE_RE = re.compile(r"^[A-Z0-9]{2,8}$")

def load_cards(path: Path):
    cards = []
    seen = set()

    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        if not {"number", "name"}.issubset(set(reader.fieldnames or [])):
            raise ValueError("CSV deve conter as colunas: number,name")

        for line_no, row in enumerate(reader, start=2):
            number = str(row.get("number") or "").strip()
            name = str(row.get("name") or "").strip()

            if not number and not name:
                continue
            if not number or not name:
                raise ValueError(f"Linha {line_no}: number e name sao obrigatorios.")

            number = number.zfill(3)
            if number in seen:
                raise ValueError(f"Linha {line_no}: numero duplicado {number}.")
            seen.add(number)
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
    parser.add_argument("--build", action="store_true", help="Valida e executa o build ao final")
    args = parser.parse_args()

    code = args.code.strip().upper()
    name = args.name.strip()
    series = args.series.strip()

    if not CODE_RE.match(code):
        print("[ERRO] code deve conter A-Z/0-9 e ter de 2 a 8 caracteres.")
        return 1
    if not name or not series:
        print("[ERRO] name e series sao obrigatorios.")
        return 1

    if args.release_date:
        try:
            datetime.strptime(args.release_date, "%Y-%m-%d")
        except ValueError:
            print("[ERRO] release-date deve ser uma data valida YYYY-MM-DD.")
            return 1

    if args.numbered is not None and args.numbered <= 0:
        print("[ERRO] numbered deve ser positivo.")
        return 1
    if args.complete is not None and args.complete <= 0:
        print("[ERRO] complete deve ser positivo.")
        return 1
    if args.numbered is not None and args.complete is not None and args.numbered > args.complete:
        print("[ERRO] numbered nao pode ser maior que complete.")
        return 1

    out = SETS_DIR / f"{code}.json"
    if out.exists():
        print(f"[ERRO] {out.name} ja existe. Nao sobrescrito.")
        return 1

    try:
        cards = load_cards(Path(args.input))
    except Exception as exc:
        print(f"[ERRO] Falha ao ler CSV: {exc}")
        return 1

    if not cards:
        print("[ERRO] Nenhuma carta valida encontrada no CSV.")
        return 1

    data = {
        "code": code,
        "name": name,
        "series": series,
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

    if args.build:
        subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_data.py")], check=True)
        subprocess.run([sys.executable, str(ROOT / "scripts" / "build.py")], check=True)
    else:
        print("Agora execute: python scripts/validate_data.py && python scripts/build.py")
    return 0

if __name__ == "__main__":
    sys.exit(main())
