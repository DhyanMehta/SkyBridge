"""STEP 4 verification -- run the full graph for all passengers and print results.

Tests:
  1. Run run_skybridge_graph for every passenger in passengers.json
  2. Print table: pnr | disruption_type | decision | escalate | summary (truncated)
  3. Assert ZZ77XX -> escalate=True, decision=ESCALATE
  4. Directly test refund_node for SK521 passenger -> eligibility=not eligible
     (The graph routes CANCELLED -> REBOOK via rules, so we test refund_node
      directly to confirm OPERATIONAL reason -> not eligible)
"""

import sys
import json
from pathlib import Path

# Ensure the project root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.agent.graph import run_skybridge_graph
from backend.agent.nodes import refund_node

DATA_DIR = Path(__file__).resolve().parent.parent / "mock_data"
with open(DATA_DIR / "passengers.json", "r", encoding="utf-8") as f:
    passengers = json.load(f)


def truncate(text, max_len=60):
    """Truncate text for table display."""
    if text and len(text) > max_len:
        return text[:max_len] + "..."
    return text or ""


def main():
    print("=" * 120)
    print("GRAPH END-TO-END TEST -- all passengers")
    print("=" * 120)

    header = f"{'PNR':<10} {'Name':<18} {'Disruption':<16} {'Decision':<10} {'Escalate':<10} {'Summary'}"
    print(header)
    print("-" * 120)

    results = {}

    for pax in passengers:
        pnr = pax["pnr"]
        full_name = pax["full_name"]
        name = pax["full_name"]
        print(f"[{pnr}] {name} on {pax['flight_id']}")
        result = run_skybridge_graph(pnr, full_name)
        results[pnr] = result

        print(
            f"{pnr:<10} {name:<18} "
            f"{result.get('disruption_type', '-'):<16} "
            f"{result.get('decision', '-'):<10} "
            f"{str(result.get('escalate', '-')):<10} "
            f"{truncate(result.get('summary', ''))}"
        )

    print("-" * 120)

    # -- Assertion 1: ZZ77XX must escalate ---------------------
    print("\n[CHECK 1] ZZ77XX escalation:")
    zz = results["ZZ77XX"]
    print(f"  decision = {zz['decision']}")
    print(f"  escalate = {zz['escalate']}")
    print(f"  reason   = {zz.get('escalate_reason', '-')}")
    assert zz["escalate"] is True, f"FAIL: Expected escalate=True, got {zz['escalate']}"
    assert zz["decision"] == "ESCALATE", f"FAIL: Expected ESCALATE, got {zz['decision']}"
    print("  >> PASSED")

    # -- Assertion 2: SK521 refund not eligible ----------------
    # The graph routes CANCELLED -> REBOOK (not REFUND), so we test
    # refund_node directly with the SK521 passenger's state.
    print("\n[CHECK 2] SK521 refund eligibility (direct refund_node test):")
    rt = results.get("RT44UV")  # SK521 passenger
    if rt:
        # Build a state as if the graph had routed to refund_node
        mock_state = {
            "pnr": "RT44UV",
            "full_name": "Kavya Iyer",
            "passenger": rt["passenger"],
            "flight": rt["flight"],
            "disruption_type": rt["disruption_type"],
            "decision": "REFUND",
            "escalate": False,
            "escalate_reason": None,
            "action_result": None,
            "summary": None,
            "error": None,
        }
        refund_result = refund_node(mock_state)
        action = refund_result["action_result"]
        print(f"  flight_id    = SK521")
        print(f"  reason       = {rt['flight'].get('reason', '-')}")
        print(f"  eligible     = {action['eligible']}")
        print(f"  reference_id = {action['reference_id']}")
        print(f"  message      = {action['reason']}")
        assert action["eligible"] is False, f"FAIL: Expected eligible=False, got {action['eligible']}"
        assert action["reference_id"] is None, f"FAIL: Expected no ref_id, got {action['reference_id']}"
        print("  >> PASSED")
    else:
        print("  SKIPPED: RT44UV/SK521 passenger not found in results")

    print("\n" + "=" * 120)
    print("ALL CHECKS PASSED")
    print("=" * 120)


if __name__ == "__main__":
    main()
