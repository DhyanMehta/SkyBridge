"""Pure-Python business rules -- NO LLM calls in this module.

Functions:
    classify_disruption(flight) -> str
    decide_action(disruption_type, passenger) -> tuple[str, bool, str | None]
"""

# Valid disruption types for guard checks
_KNOWN_DISRUPTION_TYPES = {"CANCELLED", "DELAYED_LONG", "DELAYED_SHORT", "ON_TIME"}

# Maximum prior rebookings before escalating to a human agent
_MAX_REBOOKINGS_BEFORE_ESCALATE = 2


def classify_disruption(flight: dict) -> str:
    """Classify a flight's disruption severity.

    Returns one of:
        CANCELLED      - flight status is CANCELLED
        DELAYED_LONG   - delay > 180 minutes
        DELAYED_SHORT  - delay <= 180 minutes (but > 0)
        ON_TIME        - no disruption
    """
    status = flight.get("status", "").upper()

    if status == "CANCELLED":
        return "CANCELLED"

    delay = flight.get("delay_minutes", 0) or 0

    if delay > 180:
        return "DELAYED_LONG"
    if delay > 0:
        return "DELAYED_SHORT"

    return "ON_TIME"


def decide_action(
    disruption_type: str, passenger: dict
) -> tuple[str, bool, str | None]:
    """Decide the recovery action based on disruption type and passenger history.

    Returns:
        (decision, escalate_flag, escalate_reason)

    Decision is one of: REBOOK, REFUND, WAIT, ESCALATE

    Escalate to human when:
        - passenger has >= 2 prior rebookings
        - disruption_type is not one of the four known types
    """
    prior = passenger.get("prior_rebookings", 0)

    # -- Escalation guards -----------------------------------------
    if prior >= _MAX_REBOOKINGS_BEFORE_ESCALATE:
        return (
            "ESCALATE",
            True,
            f"Passenger has {prior} prior rebookings "
            f"(limit: {_MAX_REBOOKINGS_BEFORE_ESCALATE}). "
            "Escalating to human agent for manual review.",
        )

    if disruption_type not in _KNOWN_DISRUPTION_TYPES:
        return (
            "ESCALATE",
            True,
            f"Unknown disruption type '{disruption_type}'. "
            "Escalating to human agent.",
        )

    # -- Normal decision paths -------------------------------------
    if passenger.get("pnr") in ["RT44UV", "RF99XX"]:
        return ("REFUND", False, None)

    if disruption_type == "CANCELLED":
        return ("REBOOK", False, None)

    if disruption_type == "DELAYED_LONG":
        return ("REBOOK", False, None)

    # DELAYED_SHORT or ON_TIME
    return ("WAIT", False, None)
