import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "web-src" / "index.html"
FEATURES = ROOT / "web-src" / "js" / "features"

class TestFeatureStructure(unittest.TestCase):
    def test_feature_files_exist(self):
        expected = {"collection.js", "sets.js"}
        self.assertTrue(FEATURES.exists())
        self.assertTrue(expected.issubset({p.name for p in FEATURES.glob("*.js")}))

    def test_index_loads_features_after_core(self):
        html = INDEX.read_text(encoding="utf-8")
        storage_pos = html.index("js/core/storage.js")
        collection_pos = html.index("js/features/collection.js")
        sets_pos = html.index("js/features/sets.js")
        self.assertLess(storage_pos, collection_pos)
        self.assertLess(collection_pos, sets_pos)

    def test_collection_functions_are_external(self):
        html = INDEX.read_text(encoding="utf-8")
        js = (FEATURES / "collection.js").read_text(encoding="utf-8")
        expected = [
            "parseInput",
            "resolveCardName",
            "getOwnedQty",
            "updateCollectionQty",
            "exportCollectionCSV",
            "processCSVText",
            "importCollectionCSV",
            "buildCollectionTab",
        ]
        for name in expected:
            token = f"function {name}("
            self.assertIn(token, js)
            self.assertNotIn(token, html)

    def test_sets_functions_are_external(self):
        html = INDEX.read_text(encoding="utf-8")
        js = (FEATURES / "sets.js").read_text(encoding="utf-8")
        expected = ["buildLeagueTab", "buildLeaguePool", "buildLeagueSets"]
        for name in expected:
            token = f"function {name}("
            self.assertIn(token, js)
            self.assertNotIn(token, html)

    def test_collection_backup_callback_still_present(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertIn("window.onCSVImported", html)
        self.assertIn("processCSVText", html)

if __name__ == "__main__":
    unittest.main()
