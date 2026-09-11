import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "web-src" / "index.html"
UI = ROOT / "web-src" / "js" / "ui"

class TestStage9Events(unittest.TestCase):
    def test_events_file_exists(self):
        self.assertTrue((UI / "events.js").exists())

    def test_attach_events_is_external(self):
        html = INDEX.read_text(encoding="utf-8")
        events = (UI / "events.js").read_text(encoding="utf-8")
        self.assertNotIn("function attachEvents()", html)
        self.assertIn("function attachEvents()", events)

    def test_events_load_after_layout(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertLess(html.index("js/ui/layout.js"), html.index("js/ui/events.js"))

    def test_render_still_binds_events(self):
        layout = (UI / "layout.js").read_text(encoding="utf-8")
        self.assertIn("attachEvents()", layout)

    def test_events_not_truncated(self):
        events = (UI / "events.js").read_text(encoding="utf-8")
        self.assertGreater(len(events), 9000)
        self.assertIn("addEventListener", events)
        self.assertIn("saveStorage()", events)
        self.assertIn("render()", events)

if __name__ == "__main__":
    unittest.main()
