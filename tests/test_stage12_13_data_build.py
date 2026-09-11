import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "web-src" / "index.html"
APP = ROOT / "web-src" / "js" / "app.js"
POKEDEX = ROOT / "web-src" / "data" / "pokedex" / "pokedex.generated.js"
BUILD = ROOT / "scripts" / "build.py"

class TestStage1213(unittest.TestCase):
    def test_pokedex_data_external(self):
        html = INDEX.read_text(encoding="utf-8")
        app = APP.read_text(encoding="utf-8")
        self.assertIn("data/pokedex/pokedex.generated.js", html)
        self.assertNotIn("const POKEDEX_151", app)
        self.assertTrue(POKEDEX.exists())

    def test_pokedex_contains_all_generations(self):
        js = POKEDEX.read_text(encoding="utf-8")
        expected = [
            "POKEDEX_151","POKEDEX_JOHTO","POKEDEX_HOENN","POKEDEX_SINNOH",
            "POKEDEX_UNOVA","POKEDEX_KALOS","POKEDEX_ALOLA",
            "POKEDEX_GALAR","POKEDEX_PALDEA"
        ]
        for name in expected:
            self.assertIn(f"const {name}", js)

    def test_build_is_recursive(self):
        build = BUILD.read_text(encoding="utf-8")
        self.assertIn("def copy_tree", build)
        self.assertIn('for folder in ("css", "data", "js")', build)

if __name__ == "__main__":
    unittest.main()
