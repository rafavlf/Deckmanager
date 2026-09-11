#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
SETS_DIR = ROOT / "web-src" / "data" / "sets"
CODE_RE = re.compile(r"^[A-Z0-9]{2,8}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

def main():
    files = sorted(SETS_DIR.glob("*.json"))
    errors = 0
    warnings = 0
    seen_codes = set()

    if not files:
        print("[ERRO] Nenhum set encontrado.")
        return 1

    for path in files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"[ERRO] {path.name}: JSON invalido: {exc}")
            errors += 1
            continue

        code = str(data.get("code") or "").strip()
        name = str(data.get("name") or "").strip()
        series = str(data.get("series") or "").strip()
        cards = data.get("cards")
        release = data.get("releaseDate")
        counts = data.get("counts") or {}

        if not CODE_RE.match(code):
            print(f"[ERRO] {path.name}: code invalido: {code!r}")
            errors += 1
            continue

        if path.stem != code:
            print(f"[ERRO] {path.name}: nome do arquivo deve ser {code}.json")
            errors += 1

        if code in seen_codes:
            print(f"[ERRO] code duplicado: {code}")
            errors += 1
        seen_codes.add(code)

        if not name:
            print(f"[ERRO] {code}: name ausente.")
            errors += 1
        if not series:
            print(f"[AVISO] {code}: series ausente.")
            warnings += 1

        if release is not None:
            if not DATE_RE.match(str(release)):
                print(f"[ERRO] {code}: releaseDate deve ser YYYY-MM-DD ou null.")
                errors += 1
            else:
                try:
                    datetime.strptime(str(release), "%Y-%m-%d")
                except ValueError:
                    print(f"[ERRO] {code}: releaseDate invalida: {release}")
                    errors += 1

        if not isinstance(cards, list) or not cards:
            print(f"[ERRO] {code}: cards deve ser uma lista nao vazia.")
            errors += 1
            continue

        seen_numbers = set()
        for pos, card in enumerate(cards, start=1):
            number = str(card.get("number") or "").strip()
            card_name = str(card.get("name") or "").strip()

            if not number:
                print(f"[ERRO] {code}: carta na posicao {pos} sem number.")
                errors += 1
            elif number in seen_numbers:
                print(f"[ERRO] {code}: numero duplicado {number}.")
                errors += 1
            else:
                seen_numbers.add(number)

            if not card_name:
                print(f"[ERRO] {code}: carta {number or pos} sem name.")
                errors += 1

        numbered = counts.get("numbered")
        complete = counts.get("complete")

        for label, value in (("numbered", numbered), ("complete", complete)):
            if value is not None and (not isinstance(value, int) or value <= 0):
                print(f"[ERRO] {code}: counts.{label} deve ser inteiro positivo ou null.")
                errors += 1

        if numbered is not None and complete is not None and numbered > complete:
            print(f"[ERRO] {code}: numbered={numbered} > complete={complete}.")
            errors += 1

        if numbered is not None and numbered > len(cards):
            print(f"[AVISO] {code}: numbered={numbered} > cartas no arquivo={len(cards)}.")
            warnings += 1
        if complete is not None and complete > len(cards):
            print(f"[AVISO] {code}: complete={complete} > cartas no arquivo={len(cards)}.")
            warnings += 1

        print(f"[OK] {code}: {len(cards)} cartas")

    print(f"\nResultado: {len(files)} set(s), {errors} erro(s), {warnings} aviso(s).")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())
