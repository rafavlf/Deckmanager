import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "web-src" / "index.html"
FEATURES = ROOT / "web-src" / "js" / "features"

DECK_FUNCS = ['calcProgress', 'calcMissing', 'buildDecksTab', 'buildDeckEditorModal']
SHOPPING_FUNCS = ['buildShoppingList', 'formatLigaPokemon', 'copyShoppingList', 'exportShoppingList', 'buildShoppingTab']
POKEDEX_FUNCS = ['buildPokedexModal']

class TestFeatures67(unittest.TestCase):
    def test_files_exist(self):
        for name in ["decks.js","shopping.js","pokedex.js"]:
            self.assertTrue((FEATURES/name).exists(), name)

    def test_load_order(self):
        html = INDEX.read_text(encoding="utf-8")
        positions = [html.index(x) for x in [
            "js/features/sets.js",
            "js/features/decks.js",
            "js/features/shopping.js",
            "js/features/pokedex.js",
        ]]
        self.assertEqual(positions, sorted(positions))

    def test_deck_functions_external(self):
        html = INDEX.read_text(encoding="utf-8")
        js = (FEATURES/"decks.js").read_text(encoding="utf-8")
        for name in DECK_FUNCS:
            token=f"function {name}("
            self.assertIn(token, js)
            self.assertNotIn(token, html)

    def test_shopping_functions_external(self):
        html = INDEX.read_text(encoding="utf-8")
        js = (FEATURES/"shopping.js").read_text(encoding="utf-8")
        for name in SHOPPING_FUNCS:
            token=f"function {name}("
            self.assertIn(token, js)
            self.assertNotIn(token, html)

    def test_pokedex_functions_external(self):
        html = INDEX.read_text(encoding="utf-8")
        js = (FEATURES/"pokedex.js").read_text(encoding="utf-8")
        for name in POKEDEX_FUNCS:
            token=f"function {name}("
            self.assertIn(token, js)
            self.assertNotIn(token, html)

    def test_pokedex_storage_keys_still_preserved(self):
        storage = (ROOT/"web-src"/"js"/"core"/"storage.js").read_text(encoding="utf-8")
        for key in [
            "tcg_pokedex","tcg_pokedex_johto","tcg_pokedex_hoenn",
            "tcg_pokedex_sinnoh","tcg_pokedex_unova","tcg_pokedex_kalos",
            "tcg_pokedex_alola","tcg_pokedex_galar","tcg_pokedex_paldea"
        ]:
            self.assertIn(key, storage)

if __name__ == "__main__":
    unittest.main()
