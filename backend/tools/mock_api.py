"""Mock API layer — reads from JSON files instead of a real database.

Functions:
    get_flight(flight_id)   -> dict | None
    get_passenger(pnr, full_name) -> dict | None
"""

import json
from pathlib import Path

# Resolve paths relative to *this* file so it works regardless of cwd.
_DATA_DIR = Path(__file__).resolve().parent.parent / "mock_data"


def _load_json(filename: str) -> list[dict]:
    """Read and parse a JSON file from the mock_data directory."""
    filepath = _DATA_DIR / filename
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def get_flight(flight_id: str) -> dict | None:
    """Look up a flight by its ID (e.g. 'SB-101').

    Returns the flight dict if found, otherwise None.
    """
    flights = _load_json("flights.json")
    for flight in flights:
        if flight["flight_id"] == flight_id:
            return flight
    return None


def get_passenger(pnr: str, full_name: str) -> dict | None:
    """Look up a passenger by PNR and verify full name.

    Returns the passenger dict if both PNR exists AND full_name matches
    (case-insensitive and trimmed). Otherwise returns None.
    """
    passengers = _load_json("passengers.json")
    for passenger in passengers:
        if passenger["pnr"].upper() == pnr.upper():
            if passenger["full_name"].strip().lower() == full_name.strip().lower():
                return passenger
            # PNR found but full name doesn't match → auth failure
            return None
    # PNR not found
    return None
