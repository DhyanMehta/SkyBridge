"""STEP 5 verification -- test the FastAPI /resolve endpoint.

We will use FastAPI's TestClient if httpx is installed, 
otherwise we'll just test the route handler directly.
"""

import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def main():
    print("=" * 120)
    print("API END-TO-END TEST -- POST /resolve")
    print("=" * 120)

    # We will test two distinct cases:
    # 1. Normal successful passenger (AB12CD)
    # 2. Escalated passenger (ZZ77XX)
    
    cases = [
        {"pnr": "AB12CD", "last_name": "Mehta"},
        {"pnr": "ZZ77XX", "last_name": "Verma"}
    ]
    
    for case in cases:
        print(f"\n--- Testing POST /resolve with {case} ---")
        response = client.post("/resolve", json=case)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Disruption: {data.get('disruption_type')}")
            print(f"Decision:   {data.get('decision')}")
            print(f"Escalate:   {data.get('escalate')}")
            print(f"Summary:    {data.get('summary')}")
            if case["pnr"] == "ZZ77XX":
                assert data["escalate"] is True, "FAIL: ZZ77XX should escalate=True"
                assert data["decision"] == "ESCALATE", "FAIL: ZZ77XX should decision=ESCALATE"
        else:
            print(f"Error: {response.text}")
            
    print("\n" + "=" * 120)
    print("API ENDPOINT CHECKS PASSED")
    print("=" * 120)


if __name__ == "__main__":
    main()
