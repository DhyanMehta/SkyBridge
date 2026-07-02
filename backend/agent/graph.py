"""LangGraph StateGraph for the SkyBridge disruption recovery agent.

Graph topology:
    fetch_data -> classify -> route_decision -+--> rebook   --+--> summarize -> END
                                              +--> refund   --+
                                              +--> wait     --+
                                              +--> escalate --+
"""

from langgraph.graph import StateGraph, END

from backend.agent.state import SkyBridgeState
from backend.agent.nodes import (
    fetch_data_node,
    classify_node,
    route_decision_node,
    rebook_node,
    refund_node,
    wait_node,
    escalate_node,
    summarize_node,
)


# ================================================================
# Conditional router
# ================================================================
def _route_by_decision(state: SkyBridgeState) -> str:
    """Return the next node name based on the decision field."""
    decision = state.get("decision", "ESCALATE")
    mapping = {
        "REBOOK": "rebook",
        "REFUND": "refund",
        "WAIT": "wait",
        "ESCALATE": "escalate",
    }
    return mapping.get(decision, "escalate")


# ================================================================
# Build the graph
# ================================================================
def _build_graph() -> StateGraph:
    """Construct and compile the SkyBridge StateGraph."""
    graph = StateGraph(SkyBridgeState)

    # -- Add nodes ---------------------------------------------
    graph.add_node("fetch_data", fetch_data_node)
    graph.add_node("classify", classify_node)
    graph.add_node("route_decision", route_decision_node)
    graph.add_node("rebook", rebook_node)
    graph.add_node("refund", refund_node)
    graph.add_node("wait", wait_node)
    graph.add_node("escalate", escalate_node)
    graph.add_node("summarize", summarize_node)

    # -- Linear edges ------------------------------------------
    graph.set_entry_point("fetch_data")
    graph.add_edge("fetch_data", "classify")
    graph.add_edge("classify", "route_decision")

    # -- Conditional edge from route_decision ------------------
    graph.add_conditional_edges(
        "route_decision",
        _route_by_decision,
        {
            "rebook": "rebook",
            "refund": "refund",
            "wait": "wait",
            "escalate": "escalate",
        },
    )

    # -- All action nodes converge to summarize ----------------
    graph.add_edge("rebook", "summarize")
    graph.add_edge("refund", "summarize")
    graph.add_edge("wait", "summarize")
    graph.add_edge("escalate", "summarize")

    # -- summarize -> END --------------------------------------
    graph.add_edge("summarize", END)

    return graph.compile()


# Compile once at module level
skybridge_graph = _build_graph()


# ================================================================
# Public entry point
# ================================================================
def run_skybridge_graph(pnr: str, last_name: str) -> dict:
    """Run the full disruption-recovery graph and return the final state.

    Args:
        pnr: Passenger Name Record code (e.g. 'AB12CD')
        last_name: Passenger's last name for auth verification

    Returns:
        The final SkyBridgeState dict after all nodes have executed.
    """
    initial_state: SkyBridgeState = {
        "pnr": pnr,
        "last_name": last_name,
        "passenger": None,
        "flight": None,
        "disruption_type": None,
        "decision": None,
        "escalate": False,
        "escalate_reason": None,
        "action_result": None,
        "summary": None,
        "error": None,
    }

    result = skybridge_graph.invoke(initial_state)
    return result
