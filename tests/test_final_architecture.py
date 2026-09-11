import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/"web-src"; INDEX=WEB/"index.html"; APP=WEB/"js"/"app.js"
class TestFinalArchitecture(unittest.TestCase):
    def test_index_has_no_inline_app_logic(self):
        html=INDEX.read_text(encoding="utf-8")
        self.assertIn('src="js/app.js"',html)
        self.assertNotIn("function attachEvents()",html)
        self.assertNotIn("const POKEDEX_151",html)
        self.assertNotIn("let state = {",html)
    def test_expected_modules_exist(self):
        expected=["js/core/helpers.js","js/core/state.js","js/core/android-bridge.js","js/core/storage.js","js/features/collection.js","js/features/sets.js","js/features/decks.js","js/features/shopping.js","js/features/pokedex.js","js/features/dashboard.js","js/ui/layout.js","js/ui/events.js","js/ui/events-navigation.js","js/ui/events-interactions.js","js/ui/events-decks.js","js/ui/events-collection.js","js/ui/events-history.js","js/app.js","data/pokedex/pokedex.generated.js","data/sets.generated.js","css/app.css"]
        for rel in expected: self.assertTrue((WEB/rel).exists(),rel)
    def test_app_initialization(self):
        app=APP.read_text(encoding="utf-8")
        for token in ["initTheme();","loadStorage();","render();"]: self.assertIn(token,app)
    def test_pokedex_data_not_in_app(self):
        app=APP.read_text(encoding="utf-8")
        self.assertNotIn("const POKEDEX_151",app)
        self.assertNotIn("const POKEDEX_PALDEA",app)
if __name__=="__main__": unittest.main()
