#!/usr/bin/env python3
from pathlib import Path
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SETS_DIR = ROOT / "web-src" / "data" / "sets"
WEB_INDEX = ROOT / "web-src" / "index.html"
WEB_CSS = ROOT / "web-src" / "css" / "app.css"
WEB_CORE_DIR = ROOT / "web-src" / "js" / "core"
WEB_FEATURES_DIR = ROOT / "web-src" / "js" / "features"
WEB_UI_DIR = ROOT / "web-src" / "js" / "ui"
WEB_GENERATED = ROOT / "web-src" / "data" / "sets.generated.js"
ASSETS_DIR = ROOT / "apk-project" / "app" / "src" / "main" / "assets"
ASSETS_DATA = ASSETS_DIR / "data"

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

def main():
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_data.py")], check=True)

    generated = generate_sets()
    WEB_GENERATED.parent.mkdir(parents=True, exist_ok=True)
    WEB_GENERATED.write_text(generated, encoding="utf-8")

    ASSETS_DATA.mkdir(parents=True, exist_ok=True)
    shutil.copy2(WEB_GENERATED, ASSETS_DATA / "sets.generated.js")
    shutil.copy2(WEB_INDEX, ASSETS_DIR / "index.html")
    (ASSETS_DIR / "css").mkdir(parents=True, exist_ok=True)
    shutil.copy2(WEB_CSS, ASSETS_DIR / "css" / "app.css")
    core_target = ASSETS_DIR / "js" / "core"
    core_target.mkdir(parents=True, exist_ok=True)
    for core_file in WEB_CORE_DIR.glob("*.js"):
        shutil.copy2(core_file, core_target / core_file.name)
    features_target = ASSETS_DIR / "js" / "features"
    features_target.mkdir(parents=True, exist_ok=True)
    for feature_file in WEB_FEATURES_DIR.glob("*.js"):
        shutil.copy2(feature_file, features_target / feature_file.name)
    ui_target = ASSETS_DIR / "js" / "ui"
    ui_target.mkdir(parents=True, exist_ok=True)
    for ui_file in WEB_UI_DIR.glob("*.js"):
        shutil.copy2(ui_file, ui_target / ui_file.name)

    print("\nBuild web concluido.")
    print(f"Index: {ASSETS_DIR / 'index.html'}")
    print(f"Sets:  {ASSETS_DATA / 'sets.generated.js'}")
    print(f"CSS:   {ASSETS_DIR / 'css' / 'app.css'}")
    print(f"Core:  {ASSETS_DIR / 'js' / 'core'}")
    print(f"Features: {ASSETS_DIR / 'js' / 'features'}")
    print(f"UI:    {ASSETS_DIR / 'js' / 'ui'}")

if __name__ == "__main__":
    main()
