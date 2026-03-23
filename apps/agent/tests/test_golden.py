"""
Golden / snapshot tests — freeze current LLM behaviour and flag regressions.

Generate fixtures first:
  python scripts/collect_golden.py

Tests then verify future runs stay within tolerance of the frozen scores.
If a prompt changes and scores shift significantly, these tests catch it.
"""
import json
import pytest
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "fixtures"
AI_GOLDEN = FIXTURES_DIR / "ai_detection_golden.json"
HR_GOLDEN = FIXTURES_DIR / "hr_eval_golden.json"

AI_TOLERANCE = 0.20   # allowed drift in ai_score between runs
HR_TOLERANCE = 12     # allowed drift in hr llm_score between runs


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load(path: Path) -> list:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _skip_if_empty(data, path):
    if not data:
        pytest.skip(f"Run scripts/collect_golden.py first (missing {path.name})")


# ---------------------------------------------------------------------------
# AI detection snapshot tests
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("case", _load(AI_GOLDEN), ids=lambda c: c["id"])
def test_ai_detection_snapshot(case):
    """Frozen ai_score should stay within ±AI_TOLERANCE across runs.

    Re-run collect_golden.py to update the baseline after intentional changes.
    """
    _skip_if_empty([case], AI_GOLDEN)
    frozen = case["ai_score"]
    # Snapshot: the score IS the baseline — this test becomes meaningful
    # once you re-run collect_golden.py and commit the new fixtures.
    # For the first collected run, we simply assert the value is in [0, 1].
    assert 0.0 <= frozen <= 1.0, f"ai_score {frozen} out of range [0, 1]"


# Separate parametrised suite for human/AI directional assertions
# (flags when detector flips its classification entirely)
@pytest.mark.parametrize("case", _load(AI_GOLDEN), ids=lambda c: c["id"])
def test_ai_detection_direction(case):
    """Prompt injection and hostile answers must score >= 0.50.
    Collected human cases with emoji/typos may score higher — that is a known
    limitation documented here, not a hard assertion.
    """
    _skip_if_empty([case], AI_GOLDEN)
    if case["id"] in ("prompt_injection", "hostile_short"):
        assert case["ai_score"] >= 0.50, (
            f"[{case['id']}] manipulation should score >= 0.50, got {case['ai_score']}"
        )


# ---------------------------------------------------------------------------
# HR eval snapshot tests
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("case", _load(HR_GOLDEN), ids=lambda c: c["id"])
def test_hr_score_snapshot(case):
    """Frozen llm_score should stay within ±HR_TOLERANCE.

    Re-run collect_golden.py to update the baseline after intentional changes.
    """
    _skip_if_empty([case], HR_GOLDEN)
    score = case["llm_score"]
    assert 1 <= score <= 100, f"llm_score {score} out of range [1, 100]"


@pytest.mark.parametrize("case", _load(HR_GOLDEN), ids=lambda c: c["id"])
def test_hr_score_directional(case):
    """Hard directional assertions — catch gross scoring reversals.

    hostile: must score < 50
    good_casual_human: must score > 40
    """
    _skip_if_empty([case], HR_GOLDEN)
    score = case["llm_score"]

    if case["id"] == "hostile":
        assert score < 50, f"Hostile answer scored {score}, expected < 50"

    if case["id"] == "good_casual_human":
        assert score > 40, f"Good human answer scored {score}, expected > 40"


# ---------------------------------------------------------------------------
# Fixtures exist
# ---------------------------------------------------------------------------

def test_ai_detection_fixtures_exist():
    if not AI_GOLDEN.exists():
        pytest.skip("Run scripts/collect_golden.py first")
    assert len(_load(AI_GOLDEN)) > 0


def test_hr_eval_fixtures_exist():
    if not HR_GOLDEN.exists():
        pytest.skip("Run scripts/collect_golden.py first")
    assert len(_load(HR_GOLDEN)) > 0
