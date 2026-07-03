"""LangGraph node functions for the SkyBridge disruption recovery agent.

Each function signature:  (state: SkyBridgeState) -> dict
Returns a partial dict that LangGraph merges into the state.
"""

import os
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from backend.agent.state import SkyBridgeState
from backend.agent import rules
from backend.tools import mock_api

# Load .env from backend/ directory
load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, ".env")
)


# ================================================================
# PROMPT TEMPLATE -- used by summarize_node
# ================================================================
SUMMARY_PROMPT_TEMPLATE = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful airline customer-service assistant. "
            "Write a 2-3 sentence plain-language summary for the passenger. "
            "Be empathetic, clear, and concise. Do not use jargon.",
        ),
        (
            "human",
            "Flight disruption type: {disruption_type}\n"
            "Decision taken: {decision}\n"
            "Action details: {action_result}\n\n"
            "Summarize what happened and what the passenger should expect next.",
        ),
    ]
)


# ================================================================
# Node: fetch_data_node
# ================================================================
def fetch_data_node(state: SkyBridgeState) -> dict:
    """Fetch passenger and flight data from mock API.

    Sets error in action_result (not crash) if passenger not found.
    """
    pnr = state["pnr"]
    full_name = state["full_name"]

    passenger = mock_api.get_passenger(pnr, full_name)
    if passenger is None:
        return {
            "passenger": None,
            "flight": None,
            "error": (
                f"We could not find a booking for PNR '{pnr}' and "
                f"full name '{full_name}'. Please check your details and try again."
            ),
        }

    flight = mock_api.get_flight(passenger["flight_id"])
    if flight is None:
        return {
            "passenger": passenger,
            "flight": None,
            "error": f"Flight '{passenger['flight_id']}' not found in records.",
        }

    return {"passenger": passenger, "flight": flight, "error": None}


# ================================================================
# Node: classify_node
# ================================================================
def classify_node(state: SkyBridgeState) -> dict:
    """Classify the disruption severity of the passenger's flight."""
    if state.get("error"):
        return {}

    flight = state["flight"]
    disruption_type = rules.classify_disruption(flight)
    return {"disruption_type": disruption_type}


# ================================================================
# Node: route_decision_node
# ================================================================
def route_decision_node(state: SkyBridgeState) -> dict:
    """Decide the recovery action and check escalation conditions."""
    if state.get("error"):
        return {
            "decision": "ESCALATE",
            "escalate": True,
            "escalate_reason": state["error"],
        }

    disruption_type = state["disruption_type"]
    passenger = state["passenger"]

    decision, escalate, escalate_reason = rules.decide_action(
        disruption_type, passenger
    )
    return {
        "decision": decision,
        "escalate": escalate,
        "escalate_reason": escalate_reason,
    }


# ================================================================
# Node: rebook_node
# ================================================================
def rebook_node(state: SkyBridgeState) -> dict:
    """Generate 2 mock alternate flights on the same route.

    Departure times: original + 2hr and original + 4hr.
    """
    flight = state["flight"]
    scheduled = datetime.fromisoformat(flight["scheduled_departure"])

    alternatives = []
    for offset_hours in (2, 4):
        new_time = scheduled + timedelta(hours=offset_hours)
        alt_num = random.randint(100, 999)
        alternatives.append(
            {
                "flight_id": f"SK{alt_num}",
                "origin": flight["origin"],
                "destination": flight["destination"],
                "departure": new_time.isoformat(),
                "class": state["passenger"].get("class", "economy"),
            }
        )

    return {
        "action_result": {
            "type": "REBOOK",
            "message": "Two alternate flights are available for rebooking.",
            "alternatives": alternatives,
            "refund_also_available": state["disruption_type"] == "CANCELLED",
        }
    }


# ================================================================
# Node: refund_node
# ================================================================
def refund_node(state: SkyBridgeState) -> dict:
    """Determine refund eligibility and generate a mock reference ID.

    WEATHER / ATC = eligible for refund.
    OPERATIONAL = not eligible.
    """
    flight = state["flight"]
    reason = (flight.get("reason") or "").upper()

    eligible = reason in ("WEATHER", "ATC")
    ref_id = f"REF-{random.randint(100000, 999999)}" if eligible else None

    return {
        "action_result": {
            "type": "REFUND",
            "eligible": eligible,
            "reference_id": ref_id,
            "reason": (
                f"Refund approved -- disruption caused by {reason}."
                if eligible
                else f"Refund not eligible -- disruption caused by {reason}. "
                "Operational disruptions are not covered under current policy."
            ),
        }
    }


# ================================================================
# Node: wait_node
# ================================================================
def wait_node(state: SkyBridgeState) -> dict:
    """No recovery action needed."""
    return {
        "action_result": {
            "type": "WAIT",
            "message": (
                "No action needed. Your flight is on schedule or has a minor "
                "delay. You will be notified of any changes."
            ),
        }
    }


# ================================================================
# Node: escalate_node
# ================================================================
def escalate_node(state: SkyBridgeState) -> dict:
    """Mark the case for human agent review (no LLM)."""
    return {
        "action_result": {
            "type": "ESCALATE",
            "message": "Your case has been escalated to a human agent for review.",
            "escalate_reason": state.get(
                "escalate_reason", "Unspecified reason."
            ),
        }
    }


# ================================================================
# Node: summarize_node
# ================================================================
def summarize_node(state: SkyBridgeState) -> dict:
    """Use ChatGroq (Llama 3.1 8B) to write a passenger-friendly summary.

    Falls back to a template if GROQ_API_KEY is not set.
    """
    # If there was a data-fetch error, just echo it
    if state.get("error"):
        return {"summary": state["error"]}

    groq_api_key = os.environ.get("GROQ_API_KEY")

    # -- Fallback: no API key -> template-based summary --------
    if not groq_api_key or groq_api_key == "your_key_here":
        disruption = state.get("disruption_type", "UNKNOWN")
        decision = state.get("decision", "UNKNOWN")
        action = state.get("action_result", {})
        message = action.get("message") or action.get("reason", "")
        return {
            "summary": (
                f"Your flight has been classified as {disruption}. "
                f"We have decided to proceed with {decision}. "
                f"{message}"
            )
        }

    # -- Primary path: LLM-generated summary -------------------
    try:
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.3,
            api_key=groq_api_key,
        )

        chain = SUMMARY_PROMPT_TEMPLATE | llm
        response = chain.invoke(
            {
                "disruption_type": state.get("disruption_type", "UNKNOWN"),
                "decision": state.get("decision", "UNKNOWN"),
                "action_result": str(state.get("action_result", {})),
            }
        )

        return {"summary": response.content}
    except Exception as e:
        # Groq API failure (bad key, rate limit, network error, etc.)
        # Fall back gracefully instead of crashing the graph
        print(f"[summarize_node] LLM call failed: {e}")
        disruption = state.get("disruption_type", "UNKNOWN")
        decision = state.get("decision", "UNKNOWN")
        action = state.get("action_result", {})
        message = action.get("message") or action.get("reason", "")
        return {
            "summary": (
                f"[LLM summary unavailable] "
                f"Disruption: {disruption}. Decision: {decision}. {message}"
            )
        }
