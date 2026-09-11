import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/"web-src"/"index.html"
JS=ROOT/"web-src"/"js"
UI=JS/"ui"

class TestStage1011(unittest.TestCase):
    def test_no_inline_app_script(self):
        html=INDEX.read_text(encoding="utf-8")
        self.assertNotIn("<script>\n", html)
        self.assertIn('src="js/app.js"', html)

    def test_app_keeps_initialization(self):
        app=(JS/"app.js").read_text(encoding="utf-8")
        for token in ["initTheme();","loadStorage();","render();","serviceWorker"]:
            self.assertIn(token,app)

    def test_event_binders_exist(self):
        expected=[
            "events-navigation.js","events-interactions.js","events-decks.js",
            "events-collection.js","events-history.js","events.js"
        ]
        for name in expected:
            self.assertTrue((UI/name).exists(),name)

    def test_event_load_order(self):
        html=INDEX.read_text(encoding="utf-8")
        names=[
            "events-navigation.js","events-interactions.js","events-decks.js",
            "events-collection.js","events-history.js","events.js","js/app.js"
        ]
        pos=[html.index(n) for n in names]
        self.assertEqual(pos,sorted(pos))

    def test_attach_events_is_small_aggregator(self):
        events=(UI/"events.js").read_text(encoding="utf-8")
        for fn in ["bindNavigationEvents","bindInteractionEvents","bindDeckEvents","bindCollectionEvents","bindHistoryEvents"]:
            self.assertIn(fn,events)
        self.assertLess(len(events),700)

    def test_feature_event_smoke_tokens(self):
        deck=(UI/"events-decks.js").read_text(encoding="utf-8")
        collection=(UI/"events-collection.js").read_text(encoding="utf-8")
        nav=(UI/"events-navigation.js").read_text(encoding="utf-8")
        self.assertIn("btn-save-deck",deck)
        self.assertIn("data-dupe-deck",deck)
        self.assertIn("btn-add-collection",collection)
        self.assertIn("btn-export-csv",collection)
        self.assertIn("data-nav",nav)
        self.assertIn("data-league-tab",nav)

if __name__=="__main__": unittest.main()
