import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/"web-src"/"index.html"
FEATURES=ROOT/"web-src"/"js"/"features"
UI=ROOT/"web-src"/"js"/"ui"

class TestStage8(unittest.TestCase):
    def test_dashboard_and_ui_files_exist(self):
        self.assertTrue((FEATURES/"dashboard.js").exists())
        self.assertTrue((UI/"layout.js").exists())

    def test_load_order(self):
        html=INDEX.read_text(encoding="utf-8")
        names=[
            "js/features/pokedex.js",
            "js/features/dashboard.js",
            "js/ui/layout.js",
        ]
        pos=[html.index(n) for n in names]
        self.assertEqual(pos, sorted(pos))

    def test_dashboard_external(self):
        html=INDEX.read_text(encoding="utf-8")
        js=(FEATURES/"dashboard.js").read_text(encoding="utf-8")
        for name in ["calcDashboardStats","buildDashboardTab"]:
            token=f"function {name}("
            self.assertIn(token,js)
            self.assertNotIn(token,html)

    def test_layout_external(self):
        html=INDEX.read_text(encoding="utf-8")
        js=(UI/"layout.js").read_text(encoding="utf-8")
        for name in ["initTheme","toggleTheme","showToast","render","buildApp","buildHeader","buildBottomNav","buildMain"]:
            token=f"function {name}("
            self.assertIn(token,js)
            self.assertNotIn(token,html)

    def test_remaining_pokedex_runtime_external(self):
        html=INDEX.read_text(encoding="utf-8")
        js=(FEATURES/"pokedex.js").read_text(encoding="utf-8")
        for name in ["openPokedexSlot","closePokedexModal","findPokedexSlotForCard","syncPokedexToCollection","buildPokedexView","_buildPokedexModalInner"]:
            token=f"function {name}("
            self.assertIn(token,js)
            self.assertNotIn(token,html)

    def test_attach_events_stays_inline_for_next_stage(self):
        html=INDEX.read_text(encoding="utf-8")
        self.assertIn("function attachEvents(", html)

if __name__=="__main__":
    unittest.main()
