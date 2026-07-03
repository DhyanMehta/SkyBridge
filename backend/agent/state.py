"""SkyBridge LangGraph state schema.

This TypedDict is the single source of truth for every node in the graph.
Do NOT add or rename fields without explicit approval.
"""

from typing import TypedDict


class SkyBridgeState(TypedDict, total=False):
    # ── Inputs ───────────────────────────────────────────────
    pnr: str
    full_name: str

    # ── Fetched data ─────────────────────────────────────────
    passenger: dict | None
    flight: dict | None

    # ── Classification & decision ────────────────────────────
    disruption_type: str | None          # CANCELLED | DELAYED_LONG | DELAYED_SHORT | ON_TIME
    decision: str | None                 # REBOOK | REFUND | WAIT | ESCALATE
    escalate: bool
    escalate_reason: str | None

    # ── Action result ────────────────────────────────────────
    action_result: dict | None

    # ── Final output ─────────────────────────────────────────
    summary: str | None

    # ── Error handling ───────────────────────────────────────
    error: str | None
