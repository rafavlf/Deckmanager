import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB_INDEX = ROOT / "web-src" / "index.html"
WEB_CSS = ROOT / "web-src" / "css" / "app.css"

class TestWebStructure(unittest.TestCase):
    def test_css_is_external(self):
        html = WEB_INDEX.read_text(encoding="utf-8")
        self.assertIn('href="css/app.css"', html)
        self.assertNotIn("<style>", html)
        self.assertTrue(WEB_CSS.exists())
        self.assertGreater(WEB_CSS.stat().st_size, 1000)

if __name__ == "__main__":
    unittest.main()
