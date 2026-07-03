"""STEP 0.5 — Verify mock_api.py works correctly.

Tests:
  1. get_flight("SK203") → should return the cancelled DEL→BOM flight
  2. get_passenger("AB12CD", "Mehta") → should return Dhyan Mehta's record
  3. get_passenger("AB12CD", "WrongName") → should return None (auth failure)
"""

import sys
from pathlib import Path

# Ensure the project root is on sys.path so 'backend' is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.tools.mock_api import get_flight, get_passenger


def main():
    print("=" * 60)
    print("TEST 1: get_flight('SK203')")
    print("=" * 60)
    flight = get_flight("SK203")
    print(f"  Result: {flight}")
    assert flight is not None, "FAIL: Expected a flight dict, got None"
    assert flight["flight_id"] == "SK203", f"FAIL: Wrong flight_id: {flight['flight_id']}"
    assert flight["status"] == "CANCELLED", f"FAIL: Expected CANCELLED, got {flight['status']}"
    print("  [PASSED]\n")

    print("=" * 60)
    print("TEST 2: get_passenger('AB12CD', 'Mehta')")
    print("=" * 60)
    passenger = get_passenger("AB12CD", "Dhyan Mehta")
    print(f"  Result: {passenger}")
    assert passenger is not None, "FAIL: Passenger not found for valid PNR and name."
    assert passenger["pnr"] == "AB12CD", f"FAIL: Wrong PNR: {passenger['pnr']}"
    assert passenger["full_name"] == "Dhyan Mehta", f"FAIL: Wrong full_name: {passenger['full_name']}"
    print("  [PASSED]\n")

    print("=" * 60)
    print("TEST 3: get_passenger('AB12CD', 'WrongName') -> should be None")
    print("=" * 60)
    result = get_passenger("AB12CD", "WrongName")
    print(f"  Result: {result}")
    assert result is None, f"FAIL: Expected None, got {result}"
    print("  [PASSED]\n")

    print("=" * 60)
    print("ALL TESTS PASSED")
    print("=" * 60)


if __name__ == "__main__":
    main()
