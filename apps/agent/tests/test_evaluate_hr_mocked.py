"""
Tests for evaluate_hr node with mocked LLM.
Covers: routing decisions, AI suspicion averaging, state updates, message transitions.
No real API calls.
"""
import json
import pytest
from contextlib import contextmanager
from unittest.mock import AsyncMock, patch
from langchain_core.messages import AIMessage, HumanMessage

from src.graph.nodes.evaluate import evaluate_hr, _score_single_pair
from src.graph.state import GameState


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hr_llm_response(score: int, feedback: str = "ok") -> AIMessage:
    return AIMessage(content=json.dumps({
        "score": score,
        "feedback": feedback,
    }))


def _detection_llm_response(score: int) -> AIMessage:
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
) -> GameState:
    return {
        "turn_count": turn_count,
        "messages": messages,
        "hr_ai_suspicion": hr_ai_suspicion,
        "hr_ai_rejected": None,
        "target_role": "Developer",
        "company_name": "TestCorp",
        "company_vibe": None,
        "current_stage": "hr",
        "game_over": False,
        "decision": None,
        "hr_score": None,
        "hr_score_raw": None,
        "hr_feedback": None,
        "tech_score": None,
        "tech_feedback": None,
        "final_summary": None,
        "selected_offer": None,
        "available_offers": [],
        "user_preference": None,
    }


def _mock_hr_llm(hr_response: AIMessage) -> AsyncMock:
    mock = AsyncMock()
    mock.ainvoke.return_value = hr_response
    return mock


def _mock_detection_llm(detection_score: int) -> AsyncMock:
    mock = AsyncMock()
    mock.ainvoke.return_value = _detection_llm_response(detection_score)
    return mock


@contextmanager
def _patch_llms(hr_score: int, detection_score: int, hr_feedback: str = "ok"):
    """Patch both LLM factories with canned responses."""
    with patch("src.graph.nodes.evaluate._make_llm",
               return_value=_mock_hr_llm(_hr_llm_response(hr_score, hr_feedback))):
        with patch("src.graph.nodes.evaluate._make_detection_llm",
                   return_value=_mock_detection_llm(detection_score)):
            yield


# ---------------------------------------------------------------------------
# Routing decisions
# ---------------------------------------------------------------------------

class TestEvaluateHrRouting:
    async def test_continue_mid_score(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=65, detection_score=20):
            result = await evaluate_hr(state)
        assert result["decision"] == "continue"

    async def test_pass_high_score(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=75, detection_score=10):
            result = await evaluate_hr(state)
        assert result["decision"] == "pass"

    async def test_fail_low_score(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=35, detection_score=10):
            result = await evaluate_hr(state)
        assert result["decision"] == "fail"

    async def test_fail_score_exactly_40(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=40, detection_score=10):
            result = await evaluate_hr(state)
        assert result["decision"] == "fail"

    async def test_fail_too_many_turns(self):
        state = _state(turn_count=6, messages=_convo(3))
        with _patch_llms(hr_score=90, detection_score=5):
            result = await evaluate_hr(state)
        assert result["decision"] == "fail"

    async def test_pass_score_exactly_70(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=70, detection_score=10):
            result = await evaluate_hr(state)
        assert result["decision"] == "pass"


# ---------------------------------------------------------------------------
# AI suspicion averaging
# ---------------------------------------------------------------------------

class TestAiSuspicionAveraging:
    async def test_first_eval_uses_latest_directly(self):
        # turn_count=1: ai_suspicion = latest (no averaging)
        state = _state(turn_count=1, messages=_convo(1), hr_ai_suspicion=None)
        with _patch_llms(hr_score=65, detection_score=80):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.80

    async def test_averaging_second_eval(self):
        # turn_count=2, prev=0.40, latest=0.80
        # (0.40 * 1 + 0.80) / 2 = 0.60
        state = _state(turn_count=2, messages=_convo(1), hr_ai_suspicion=0.40)
        with _patch_llms(hr_score=65, detection_score=80):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.60

    async def test_averaging_third_eval(self):
        # turn_count=3, prev=0.60, latest=0.30
        # (0.60 * 2 + 0.30) / 3 = 0.50
        state = _state(turn_count=3, messages=_convo(1), hr_ai_suspicion=0.60)
        with _patch_llms(hr_score=65, detection_score=30):
            result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.50

    async def test_no_messages_keeps_prev_suspicion(self):
        # Only AIMessages (no HumanMessage) → _score_latest_pair returns None → keep prev
        state = _state(turn_count=2, messages=[AIMessage(content="Pytanie?")], hr_ai_suspicion=0.40)
        with patch("src.graph.nodes.evaluate._make_llm",
                   return_value=_mock_hr_llm(_hr_llm_response(65))):
            with patch("src.graph.nodes.evaluate._make_detection_llm",
                       return_value=_mock_detection_llm(0)):
                result = await evaluate_hr(state)
        assert result["hr_ai_suspicion"] == 0.40


# ---------------------------------------------------------------------------
# AI penalty applied to score
# ---------------------------------------------------------------------------

class TestAiPenaltyIntegration:
    async def test_high_suspicion_caps_score_to_25_then_minus_20(self):
        # raw=65, detection=90 (0.90), turn_count=1 → avg=latest=0.90
        # latest ≥ 0.85 → cap at 25; avg ≥ 0.85 → -20 → 5
        state = _state(turn_count=1, messages=_convo(1))
        with _patch_llms(hr_score=65, detection_score=90):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 65
        assert result["hr_score"] == 5
        assert result["decision"] == "fail"

    async def test_high_suspicion_caps_score_to_25_without_avg_penalty(self):
        # raw=65, detection=90 (0.90), turn_count=2, prev=0.0
        # avg = (0.0*1 + 0.90)/2 = 0.45 < 0.85 → only cap at 25, no -20
        state = _state(turn_count=2, messages=_convo(1), hr_ai_suspicion=0.0)
        with _patch_llms(hr_score=65, detection_score=90):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 65
        assert result["hr_score"] == 25
        assert result["decision"] == "fail"

    async def test_medium_high_suspicion_caps_score_to_40(self):
        # raw=65, detection=75 (0.75), turn_count=2, prev=0.0
        # avg = (0.0*1 + 0.75)/2 = 0.375 < 0.85 → only cap at 40, no -20
        state = _state(turn_count=2, messages=_convo(1), hr_ai_suspicion=0.0)
        with _patch_llms(hr_score=65, detection_score=75):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 65
        assert result["hr_score"] == 40
        assert result["decision"] == "fail"

    async def test_low_suspicion_no_penalty(self):
        # raw=70, ai_detection=20 (0.20) → no cap → pass
        state = _state(turn_count=1, messages=_convo(1))
        with _patch_llms(hr_score=70, detection_score=20):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 70
        assert result["hr_score"] == 70

    async def test_avg_suspicion_subtracts_20(self):
        # raw=65, detection=10 (0.10) latest → no latest cap
        # prev=0.90, avg after turn_count=2: (0.90*1 + 0.10)/2 = 0.50 → no avg penalty
        # Use high enough prev to trigger avg >= 0.85 after averaging
        # prev=0.90, latest=0.90, turn_count=2: avg=(0.90*1+0.90)/2=0.90 ≥ 0.85 → -20
        # latest=0.90 also ≥ 0.85 → cap at 25; then -20 → 5
        state = _state(turn_count=2, messages=_convo(1), hr_ai_suspicion=0.90)
        with _patch_llms(hr_score=65, detection_score=90):
            result = await evaluate_hr(state)
        assert result["hr_score_raw"] == 65
        assert result["hr_score"] == 5   # min(65,25)=25, 25-20=5


# ---------------------------------------------------------------------------
# State updates on pass / fail transitions
# ---------------------------------------------------------------------------

class TestStateTransitions:
    async def test_pass_does_not_set_stage(self):
        # pass routing is handled by the graph edge, not by evaluate_hr
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=80, detection_score=10):
            result = await evaluate_hr(state)
        assert "current_stage" not in result

    async def test_pass_clears_messages_no_transition_message(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=80, detection_score=10):
            result = await evaluate_hr(state)
        from langchain_core.messages import RemoveMessage
        assert all(isinstance(m, RemoveMessage) for m in result["messages"])

    async def test_fail_sets_hr_failed_stage(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=30, detection_score=10):
            result = await evaluate_hr(state)
        assert result["current_stage"] == "hr_failed"

    async def test_fail_sets_game_over(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=30, detection_score=10):
            result = await evaluate_hr(state)
        assert result["game_over"] is True

    async def test_fail_clears_messages_no_farewell(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=30, detection_score=10):
            result = await evaluate_hr(state)
        from langchain_core.messages import RemoveMessage
        assert all(isinstance(m, RemoveMessage) for m in result["messages"])

    async def test_continue_does_not_set_stage(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=60, detection_score=10):
            result = await evaluate_hr(state)
        assert "current_stage" not in result

    async def test_feedback_stored(self):
        state = _state(turn_count=2, messages=_convo(1))
        with _patch_llms(hr_score=65, detection_score=10, hr_feedback="Dobra odpowiedź"):
            result = await evaluate_hr(state)
        assert result["hr_feedback"] == "Dobra odpowiedź"


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
