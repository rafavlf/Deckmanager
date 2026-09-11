import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SETS_DIR = ROOT / "web-src" / "data" / "sets"

class TestSetData(unittest.TestCase):
    def test_unique_codes_and_card_ids(self):
        seen_codes = set()
        seen_ids = set()

        files = sorted(SETS_DIR.glob("*.json"))
        self.assertTrue(files, "Nenhum set encontrado")

        for path in files:
            data = json.loads(path.read_text(encoding="utf-8"))
            code = data["code"]
            self.assertNotIn(code, seen_codes)
            seen_codes.add(code)

            for card in data["cards"]:
                card_id = f"{code}_{str(card['number']).zfill(3)}"
                self.assertNotIn(card_id, seen_ids, f"ID duplicado: {card_id}")
                seen_ids.add(card_id)

    def test_required_fields(self):
        for path in SETS_DIR.glob("*.json"):
            data = json.loads(path.read_text(encoding="utf-8"))
            for field in ("code", "name", "series", "counts", "cards"):
                self.assertIn(field, data, f"{path.name}: faltando {field}")

if __name__ == "__main__":
    unittest.main()
