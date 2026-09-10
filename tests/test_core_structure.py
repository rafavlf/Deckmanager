import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "web-src" / "index.html"
CORE = ROOT / "web-src" / "js" / "core"

class TestCoreStructure(unittest.TestCase):
    def test_core_files_exist(self):
        expected = {"helpers.js", "state.js", "android-bridge.js", "storage.js"}
        self.assertTrue(CORE.exists())
        self.assertTrue(expected.issubset({p.name for p in CORE.glob("*.js")}))

    def test_index_loads_core_in_dependency_order(self):
        html = INDEX.read_text(encoding="utf-8")
        scripts = [
            'js/core/helpers.js',
            'js/core/state.js',
            'js/core/android-bridge.js',
            'js/core/storage.js',
        ]
        positions = [html.index(s) for s in scripts]
        self.assertEqual(positions, sorted(positions))

    def test_core_code_not_inline_anymore(self):
        html = INDEX.read_text(encoding="utf-8")
        forbidden = [
            "let state = {",
            "function hasNativeBridge()",
            "function nativeGet(key)",
            "function nativeSet(key, value)",
            "function loadStorage()",
            "function saveStorage()",
            "function fmtDate(iso)",
            "function genId()",
            "function esc(str)",
        ]
        for token in forbidden:
            self.assertNotIn(token, html)

    def test_storage_keys_preserved(self):
        storage = (CORE / "storage.js").read_text(encoding="utf-8")
        keys = [
            "tcg_decks",
            "tcg_collection",
            "tcg_pokedex",
            "tcg_pokedex_johto",
            "tcg_pokedex_hoenn",
            "tcg_pokedex_sinnoh",
            "tcg_pokedex_unova",
            "tcg_pokedex_kalos",
            "tcg_pokedex_alola",
            "tcg_pokedex_galar",
            "tcg_pokedex_paldea",
        ]
        for key in keys:
            self.assertIn(key, storage)

if __name__ == "__main__":
    unittest.main()
