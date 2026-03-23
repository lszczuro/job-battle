"""
Unit tests for pure helper functions in evaluate.py.
No LLM calls, no network, no API key required.
"""
import pytest
from src.graph.nodes.evaluate import _apply_ai_penalty, _determine_hr_decision


# ---------------------------------------------------------------------------
# _apply_ai_penalty
# ---------------------------------------------------------------------------

class TestApplyAiPenalty:
    def test_no_penalty_below_threshold(self):
        assert _apply_ai_penalty(80, 0.49) == 80

    def test_no_penalty_at_zero(self):
        assert _apply_ai_penalty(60, 0.0) == 60

    def test_medium_penalty_at_50(self):
        assert _apply_ai_penalty(80, 0.50) == 65  # -15

    def test_medium_penalty_at_69(self):
        assert _apply_ai_penalty(80, 0.69) == 65  # -15

    def test_high_penalty_at_70(self):
        assert _apply_ai_penalty(80, 0.70) == 50  # -30

    def test_high_penalty_at_100(self):
        assert _apply_ai_penalty(80, 1.0) == 50  # -30

    def test_floor_at_1_medium_penalty(self):
        assert _apply_ai_penalty(10, 0.55) == 1  # 10-15 = -5, clamped to 1

    def test_floor_at_1_high_penalty(self):
        assert _apply_ai_penalty(5, 0.90) == 1   # 5-30 = -25, clamped to 1

    def test_high_score_high_penalty(self):
        assert _apply_ai_penalty(100, 0.80) == 70  # -30


# ---------------------------------------------------------------------------
# _determine_hr_decision
# ---------------------------------------------------------------------------

class TestDetermineHrDecision:
    # --- fail conditions ---
    def test_fail_on_turn_6(self):
        assert _determine_hr_decision(90, 6) == "fail"

    def test_fail_on_turn_10(self):
        assert _determine_hr_decision(90, 10) == "fail"

    def test_fail_on_low_score(self):
        assert _determine_hr_decision(40, 2) == "fail"

    def test_fail_on_score_1(self):
        assert _determine_hr_decision(1, 1) == "fail"

    def test_fail_on_score_40_exactly(self):
        assert _determine_hr_decision(40, 3) == "fail"

    # --- pass conditions ---
    def test_pass_on_score_70(self):
        assert _determine_hr_decision(70, 2) == "pass"

    def test_pass_on_score_100(self):
        assert _determine_hr_decision(100, 1) == "pass"

    def test_pass_on_score_70_turn_5(self):
        # Turn 5 is still <= 5, so not forced fail
        assert _determine_hr_decision(70, 5) == "pass"

    # --- continue conditions ---
    def test_continue_mid_score(self):
        assert _determine_hr_decision(60, 2) == "continue"

    def test_continue_score_41(self):
        assert _determine_hr_decision(41, 1) == "continue"

    def test_continue_score_69(self):
        assert _determine_hr_decision(69, 3) == "continue"

    # --- boundary: turn 5 vs 6 ---
    def test_turn_5_not_forced_fail(self):
        # turn_count > 5 means 6+; turn 5 is still valid
        result = _determine_hr_decision(60, 5)
        assert result == "continue"

    def test_turn_6_forced_fail_even_high_score(self):
        assert _determine_hr_decision(90, 6) == "fail"
