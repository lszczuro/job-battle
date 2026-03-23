"""
Unit tests for pure helper functions in evaluate.py.
No LLM calls, no network, no API key required.
"""
import pytest
from src.graph.nodes.evaluate import _apply_ai_penalty, _determine_hr_decision


# ---------------------------------------------------------------------------
# _apply_ai_penalty
# ---------------------------------------------------------------------------
#
# Logic:
#   latest_suspicion >= 0.85  → cap score at 25
#   latest_suspicion >= 0.70  → cap score at 40
#   avg_suspicion    >= 0.85  → subtract 20 (floor 1)
#   combinations apply both rules in order
# ---------------------------------------------------------------------------

class TestApplyAiPenalty:
    # --- no penalty ---
    def test_no_penalty_below_threshold(self):
        assert _apply_ai_penalty(80, 0.69, 0.0) == 80

    def test_no_penalty_none_suspicion(self):
        assert _apply_ai_penalty(60, None, 0.0) == 60

    def test_no_penalty_at_zero(self):
        assert _apply_ai_penalty(60, 0.0, 0.0) == 60

    # --- latest cap at 40 (0.70–0.84) ---
    def test_cap_40_at_70(self):
        assert _apply_ai_penalty(80, 0.70, 0.0) == 40

    def test_cap_40_at_84(self):
        assert _apply_ai_penalty(80, 0.84, 0.0) == 40

    def test_cap_40_score_already_below(self):
        assert _apply_ai_penalty(30, 0.75, 0.0) == 30  # already below cap

    # --- latest cap at 25 (>= 0.85) ---
    def test_cap_25_at_85(self):
        assert _apply_ai_penalty(80, 0.85, 0.0) == 25

    def test_cap_25_at_100(self):
        assert _apply_ai_penalty(100, 1.0, 0.0) == 25

    def test_cap_25_score_already_below(self):
        assert _apply_ai_penalty(20, 0.90, 0.0) == 20  # already below cap

    # --- avg penalty -20 ---
    def test_avg_penalty_no_latest_cap(self):
        assert _apply_ai_penalty(80, None, 0.85) == 60  # 80 - 20

    def test_avg_penalty_with_cap_40(self):
        assert _apply_ai_penalty(80, 0.75, 0.85) == 20  # min(80,40)=40, 40-20=20

    def test_avg_penalty_with_cap_25(self):
        assert _apply_ai_penalty(80, 0.90, 0.85) == 5   # min(80,25)=25, 25-20=5

    def test_avg_penalty_floor_at_1(self):
        assert _apply_ai_penalty(15, 0.90, 0.85) == 1   # min(15,25)=15, 15-20=-5 → 1

    def test_avg_penalty_floor_at_1_no_cap(self):
        assert _apply_ai_penalty(10, None, 0.90) == 1   # 10-20=-10 → 1


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
        assert _determine_hr_decision(60, 5) == "continue"

    def test_turn_6_forced_fail_even_high_score(self):
        assert _determine_hr_decision(90, 6) == "fail"
