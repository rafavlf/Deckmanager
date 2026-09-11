#!/usr/bin/env python3
from pathlib import Path
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SETS_DIR = ROOT / "web-src" / "data" / "sets"
WEB_DIR = ROOT / "web-src"
WEB_INDEX = WEB_DIR / "index.html"
WEB_GENERATED = WEB_DIR / "data" / "sets.generated.js"
ASSETS_DIR = ROOT / "apk-project" / "app" / "src" / "main" / "assets"

def generate_sets():
    collections = []
    thresholds = {}
    release_dates = {}
    series = {}

    for path in sorted(SETS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        code = data["code"]

        cards = [{
            "id": f"{code}_{str(c['number']).zfill(3)}",
            "name": c["name"],
            "set": code,
            "number": str(c["number"]).zfill(3),
        } for c in data["cards"]]

        collections.append({
            "sigla": code,
            "name": data["name"],
            "cards": cards,
        })

        counts = data.get("counts") or {}
        threshold = {}
        if counts.get("numbered") is not None:
            threshold["basic"] = counts["numbered"]
        if counts.get("complete") is not None:
            threshold["complete"] = counts["complete"]
        if threshold:
            thresholds[code] = threshold

        release_dates[code] = data.get("releaseDate")
        series[code] = data.get("series")

    return (
        "// ARQUIVO GERADO AUTOMATICAMENTE. NAO EDITE MANUALMENTE.\n"
        "// Fonte: web-src/data/sets/*.json\n"
        + "const SET_COLLECTIONS=" + json.dumps(collections, ensure_ascii=False, separators=(",", ":")) + ";\n"
        + "const SET_THRESHOLDS=" + json.dumps(thresholds, ensure_ascii=False, separators=(",", ":")) + ";\n"
        + "const SET_RELEASE_DATES=" + json.dumps(release_dates, ensure_ascii=False, separators=(",", ":")) + ";\n"
        + "const SET_SERIES=" + json.dumps(series, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )

def copy_tree(source: Path, target: Path):
    if not source.exists():
        return
    for item in source.rglob("*"):
        if not item.is_file():
            continue
        rel = item.relative_to(source)
        dest = target / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, dest)

def main():
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_data.py")], check=True)

    generated = generate_sets()
    WEB_GENERATED.parent.mkdir(parents=True, exist_ok=True)
    WEB_GENERATED.write_text(generated, encoding="utf-8")

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(WEB_INDEX, ASSETS_DIR / "index.html")

    for folder in ("css", "data", "js"):
        copy_tree(WEB_DIR / folder, ASSETS_DIR / folder)

    print("\nBuild web concluido.")
    print(f"Index: {ASSETS_DIR / 'index.html'}")
    print(f"Assets modulares: {ASSETS_DIR}")

if __name__ == "__main__":
    main()
