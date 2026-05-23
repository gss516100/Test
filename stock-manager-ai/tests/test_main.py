import unittest

from app.main import analyze, health


class TestMain(unittest.TestCase):
    def test_health(self):
        self.assertEqual(health(), {"status": "ok"})

    def test_analyze_returns_input(self):
        payload = {"symbol": "INFY", "range": "1M"}
        result = analyze(payload)
        self.assertEqual(result["input"], payload)
        self.assertEqual(result["analysis"], "not implemented")


if __name__ == "__main__":
    unittest.main()
