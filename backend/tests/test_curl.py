import json
import httpx
import time

def main():
    print("Running curl-equivalent tests against http://localhost:8000")
    
    # 2. GET /health
    print("\n" + "="*80)
    print("TEST 2: GET /health")
    print("="*80)
    res = httpx.get("http://localhost:8000/health")
    print(f"Status: {res.status_code}")
    print("Body:")
    print(json.dumps(res.json(), indent=2))
    
    # 3a. AB12CD / Mehta
    print("\n" + "="*80)
    print("TEST 3a: POST /resolve (AB12CD, Mehta)")
    print("="*80)
    res = httpx.post("http://localhost:8000/resolve", json={"pnr": "AB12CD", "last_name": "Mehta"})
    print(f"Status: {res.status_code}")
    print("Body:")
    print(json.dumps(res.json(), indent=2))
    
    # 3b. ZZ77XX / Verma
    print("\n" + "="*80)
    print("TEST 3b: POST /resolve (ZZ77XX, Verma)")
    print("="*80)
    res = httpx.post("http://localhost:8000/resolve", json={"pnr": "ZZ77XX", "last_name": "Verma"})
    print(f"Status: {res.status_code}")
    print("Body:")
    print(json.dumps(res.json(), indent=2))
    
    # 3c. AB12CD / WrongName
    print("\n" + "="*80)
    print("TEST 3c: POST /resolve (AB12CD, WrongName) -> Expect 404")
    print("="*80)
    res = httpx.post("http://localhost:8000/resolve", json={"pnr": "AB12CD", "last_name": "WrongName"})
    print(f"Status: {res.status_code}")
    print("Body:")
    print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    main()
