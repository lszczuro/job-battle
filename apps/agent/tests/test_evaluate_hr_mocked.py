"""
Tests for evaluate_hr node with mocked LLM.
Covers: routing decisions, AI suspicion averaging, state updates, message transitions.
No real API calls.
"""
import json
import pytest
from unittest.mock import AsyncMock, patch
from langchain_core.messages import AIMessage, HumanMessage

from src.graph.nodes.evaluate import evaluate_hr, _score_single_pair


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hr_llm_response(score: int, feedback: str = "ok", summary: str = "good") -> AIMessage:
    return AIMessage(content=json.dumps({
        "score": score,
        "feedback": feedback,
        "hr_summary": summary,
    }))


def _ai_detection_response(score: int) -> AIMessage:
    return AIMessage(content=json.dumps({"score": score}))


def _convo(n: int) -> list:
    """n full turns: AIMessage question + HumanMessage answer."""
    msgs = []
    for i in range(n):
        msgs.append(AIMessage(content=f"Pytanie HR nr {i + 1}?"))
        msgs.append(HumanMessage(content=f"Odpowiedź kandydata {i + 1}"))
    return msgs


def _state(
    turn_count: int,
    messages: list,
    hr_ai_suspicion: float | None = None,
) -> dict:
    return {
        "turn_count": turn_count,
        "messages": messages,
        "hr_ai_suspicion": hr_ai_suspicion,
        "target_role": "Developer",
        "company_name": "TestCorp",
        "current_stage": "hr",
        "game_over": False,
        "decision": None,
        "hr_score": None,
        "hr_score_raw": None,
        "hr_feedback": None,
        "hr_summary": None,
        "tech_score": None,
        "tech_feedback": None,
        "final_summary": None,
        "selected_offer": None,
        "company_vibe": None,
    }


def _patched_llm(*responses):
    """Return a mock LLM whose ainvoke returns responses in sequence."""
    mock_llm = AsyncMock()
    mock_llm.ainvoke.side_effect = list(responses)
    return mock_llm


# ---------------------------------------------------------------------------
# Routing decisions
# ---------------------------------------------------------------------------

class TestEvaluateHrRouting:
    async def test_continue_mid_score(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(65), _ai_detection_response(20))):
            result = await evaluate_hr(state)
        assert result["decision"] == "continue"

    async def test_pass_high_score(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(75), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        assert result["decision"] == "pass"

    async def test_fail_low_score(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(35), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        assert result["decision"] == "fail"

    async def test_fail_score_exactly_40(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(40), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        assert result["decision"] == "fail"

    async def test_fail_too_many_turns(self):
        # turn_count=6 forces fail regardless of score
        state = _state(turn_count=6, messages=_convo(3))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(90), _ai_detection_response(5))):
            result = await evaluate_hr(state)
        assert result["decision"] == "fail"

    async def test_pass_score_exactly_70(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(70), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        assert result["decision"] == "pass"


# ---------------------------------------------------------------------------
# AI suspicion averaging
# ---------------------------------------------------------------------------

class TestAiSuspicionAveraging:
    async def test_first_eval_uses_latest_directly(self):
        # turn_count=1: ai_suspicion = latest (no averaging)
        state = _state(turn_count=1, messages=_convo(1), hr_ai_suspicion=None)
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(65), _ai_detection_response(80))):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.80

    async def test_averaging_second_eval(self):
        # turn_count=2, prev=0.40, latest=0.80
        # (0.40 * 1 + 0.80) / 2 = 0.60
        state = _state(turn_count=2, messages=_convo(1), hr_ai_suspicion=0.40)
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(65), _ai_detection_response(80))):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.60

    async def test_averaging_third_eval(self):
        # turn_count=3, prev=0.60, latest=0.30
        # (0.60 * 2 + 0.30) / 3 = 0.50
        state = _state(turn_count=3, messages=_convo(1), hr_ai_suspicion=0.60)
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(65), _ai_detection_response(30))):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.50

    async def test_no_messages_keeps_prev_suspicion(self):
        # Only AIMessages (no HumanMessage) → _score_latest_pair returns None → keep prev
        state = _state(turn_count=2, messages=[AIMessage(content="Pytanie?")], hr_ai_suspicion=0.40)
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(65))):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.40


# ---------------------------------------------------------------------------
# AI penalty applied to score
# ---------------------------------------------------------------------------

class TestAiPenaltyIntegration:
    async def test_high_suspicion_reduces_score_to_fail(self):
        # raw=65, ai_detection=90 → suspicion=0.90 → effective=65-30=35 → fail
        state = _state(turn_count=1, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(65), _ai_detection_response(90))):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 65
        assert result["hr_score"] == 35
        assert result["decision"] == "fail"

    async def test_medium_suspicion_reduces_score(self):
        # raw=70, ai_detection=55 → suspicion=0.55 → effective=70-15=55 → continue
        state = _state(turn_count=1, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(70), _ai_detection_response(55))):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 70
        assert result["hr_score"] == 55
        assert result["decision"] == "continue"

    async def test_low_suspicion_no_penalty(self):
        # raw=70, ai_detection=20 → suspicion=0.20 → effective=70 → pass
        state = _state(turn_count=1, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(70), _ai_detection_response(20))):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 70
        assert result["hr_score"] == 70


# ---------------------------------------------------------------------------
# State updates on pass / fail transitions
# ---------------------------------------------------------------------------

class TestStateTransitions:
    async def test_pass_sets_tech_stage(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(80), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        assert result["current_stage"] == "tech"

    async def test_pass_clears_messages_and_adds_transition(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(80), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        # Last message should be the tech transition message
        last_msg = result["messages"][-1]
        assert isinstance(last_msg, AIMessage)
        assert "techniczna" in last_msg.content

    async def test_fail_clears_messages_and_adds_farewell(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(30), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        last_msg = result["messages"][-1]
        assert isinstance(last_msg, AIMessage)
        assert "dziękuję" in last_msg.content.lower()

    async def test_continue_does_not_set_stage(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(_hr_llm_response(60), _ai_detection_response(10))):
            result = await evaluate_hr(state)
        assert "current_stage" not in result

    async def test_feedback_and_summary_stored(self):
        state = _state(turn_count=2, messages=_convo(1))
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_patched_llm(
                       _hr_llm_response(65, feedback="Dobra odpowiedź", summary="Kandydat zaangażowany"),
                       _ai_detection_response(10),
                   )):
            result = await evaluate_hr(state)
        assert result["hr_feedback"] == "Dobra odpowiedź"
        assert result["hr_summary"] == "Kandydat zaangażowany"


# ---------------------------------------------------------------------------
# _score_single_pair edge cases
# ---------------------------------------------------------------------------

class TestScoreSinglePair:
    async def test_valid_response_parsed(self):
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = AIMessage(content='{"score": 70}')
        result = await _score_single_pair("Pytanie?", "Odpowiedź", mock_llm)
        assert result == 0.70

    async def test_clamped_above_100(self):
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = AIMessage(content='{"score": 150}')
        result = await _score_single_pair("Pytanie?", "Odpowiedź", mock_llm)
        assert result == 1.0

    async def test_clamped_below_0(self):
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = AIMessage(content='{"score": -10}')
        result = await _score_single_pair("Pytanie?", "Odpowiedź", mock_llm)
        assert result == 0.0

    async def test_parse_error_returns_fallback(self):
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = AIMessage(content="not json at all")
        result = await _score_single_pair("Pytanie?", "Odpowiedź", mock_llm)
        assert result == 0.3
