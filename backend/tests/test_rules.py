"""STEP 2 verification -- run classify_disruption and decide_action against
all entries in flights.json and passengers.json, print a result table.

Key check: ZZ77XX (prior_rebookings=3) must return escalate=True.
"""

import sys
import json
from pathlib import Path

# Ensure the project root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.agent.rules import classify_disruption, decide_action
from backend.tools.mock_api import get_flight, get_passenger

# Load raw data for iteration
DATA_DIR = Path(__file__).resolve().parent.parent / "mock_data"
with open(DATA_DIR / "passengers.json", "r", encoding="utf-8") as f:
    passengers = json.load(f)
with open(DATA_DIR / "flights.json", "r", encoding="utf-8") as f:
    flights = {fl["flight_id"]: fl for fl in json.load(f)}


def main():
    # Table header
    header = f"{'PNR':<10} {'Name':<18} {'Flight':<8} {'Status':<12} {'Delay':<6} {'Disruption':<16} {'Decision':<10} {'Escalate':<10} {'Reason'}"
    print("=" * len(header))
    print("RULES ENGINE TEST -- all passengers x their flights")
    print("=" * len(header))
    print(header)
    print("-" * len(header))

    for pax in passengers:
        flight = flights.get(pax["flight_id"])
        if flight is None:
            print(f"  {pax['pnr']:<10} FLIGHT NOT FOUND: {pax['flight_id']}")
            continue

        disruption = classify_disruption(flight)
        decision, escalate, reason = decide_action(disruption, pax)

        name = pax["full_name"]
        print(
            f"{pax['pnr']:<10} {name:<18} {flight['flight_id']:<8} "
            f"{flight['status']:<12} {flight.get('delay_minutes', 0):<6} "
            f"{disruption:<16} {decision:<10} {str(escalate):<10} "
            f"{reason or '-'}"
        )

    print("-" * len(header))

    # Explicit assertion for the escalation case
    zz_pax = next(p for p in passengers if p["pnr"] == "ZZ77XX")
    zz_flight = flights[zz_pax["flight_id"]]
    zz_disruption = classify_disruption(zz_flight)
    zz_decision, zz_escalate, zz_reason = decide_action(zz_disruption, zz_pax)

    print(f"\nESCALATION CHECK: PNR=ZZ77XX  prior_rebookings={zz_pax['prior_rebookings']}")
    print(f"  disruption_type = {zz_disruption}")
    print(f"  decision        = {zz_decision}")
    print(f"  escalate        = {zz_escalate}")
    print(f"  reason          = {zz_reason}")
    assert zz_escalate is True, f"FAIL: Expected escalate=True, got {zz_escalate}"
    assert zz_decision == "ESCALATE", f"FAIL: Expected ESCALATE, got {zz_decision}"
    print("  >> ESCALATION CONFIRMED -- TEST PASSED")


if __name__ == "__main__":
    main()
