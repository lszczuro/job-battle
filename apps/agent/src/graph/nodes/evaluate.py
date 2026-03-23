import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage, RemoveMessage
from src.graph.state import GameState

HR_PROMPT = """\
Jesteś HR managerem który właśnie przeprowadził rozmowę z kandydatem na {target_role} w {company_name}.

Oceń ostatnią odpowiedź kandydata.
Liczba tur rozmowy dotychczas: {turn_count}

Dodatkowo napisz krótkie podsumowanie dla technical interviewera \
(max 3 zdania, rzeczowe). To jest wewnętrzna notatka — kandydat jej nie widzi.

Zwróć TYLKO JSON:
{{
  "score": int (1-100),
  "feedback": str (1 zdanie co poszło dobrze/źle),
  "decision": "pass" | "fail" | "continue",
  "hr_summary": str (2-3 zdania: dopasowanie kulturowe, motywacja, red flagi lub plusy)
}}

Zasady decyzji (BEZWZGLĘDNE — musisz ich przestrzegać):
- Jeśli liczba tur jest większa niż 5: ZAWSZE "fail".
- Jeśli score <= 40: ZAWSZE "fail". Nie ma wyjątków.
- Jeśli score >= 70: "pass".
- Jeśli score 41-69: "continue" (potrzebujesz jeszcze jednego pytania).
NIGDY nie zwracaj "continue" gdy score <= 40. To jest błąd logiczny.\
"""

TECH_PROMPT = """\
Jesteś technical interviewerem który właśnie przeprowadził rozmowę techniczną \
z kandydatem na {target_role} w {company_name}.

Oceń ostatnią odpowiedź kandydata.
Zwróć TYLKO JSON:
{{
  "score": int (1-10),
  "feedback": str (1 zdanie co poszło dobrze/źle),
  "decision": "pass" | "fail" | "continue"
}}

"continue" jeśli chcesz zadać jeszcze jedno pytanie techniczne.
"pass" oznacza że kandydat jest zatrudniony.
"fail" oznacza odrzucenie.
Bądź wymagający.\
"""


def _make_llm():
    return ChatOpenAI(
        model="gpt-5-nano",
        model_kwargs={"response_format": {"type": "json_object"}},
        reasoning_effort="minimal",
        api_key=os.environ["OPENAI_API_KEY"],
    )


def _clear_messages(state: GameState) -> list:
    return [RemoveMessage(id=m.id) for m in state["messages"]]


async def evaluate_hr(state: GameState) -> dict:
    llm = _make_llm()
    turn_count = state.get("turn_count", 0)
    system = HR_PROMPT.format(
        target_role=state.get("target_role") or "kandydata",
        company_name=state.get("company_name") or "nieznanej firmy",
        turn_count=turn_count,
    )
    messages = state["messages"]
    response = await llm.ainvoke(
        [SystemMessage(content=system)] + messages,
        config={"callbacks": []},
    )
    result = json.loads(response.content)

    # Enforce hard rules regardless of LLM decision
    score = result["score"]
    decision = result["decision"]
    if turn_count > 5 or score <= 40:
        decision = "fail"
    elif score >= 70 and decision != "fail":
        decision = "pass"

    updates = {
        "hr_score": score,
        "hr_feedback": result["feedback"],
        "decision": decision,
        "hr_summary": result.get("hr_summary"),
    }

    if decision == "pass":
        transition_msg = AIMessage(
            content=(
                "Świetnie! Rozmowa HR przebiegła bardzo dobrze. "
                "Czeka Cię teraz rozmowa techniczna — przygotuj się na pytania o kod i architekturę. "
                "Napisz coś aby kontynuować. Powodzenia! 💻"
            )
        )
        updates["messages"] = _clear_messages(state) + [transition_msg]
        updates["current_stage"] = "tech"
    elif decision == "fail":
        farewell_msg = AIMessage(
            content=(
                "Okej, super, dziękuję za poświęcony czas! "
                "Skontaktujemy się z Panem/Panią w ciągu kilku dni. "
                "Miłego dnia!"
            )
        )
        updates["messages"] = _clear_messages(state) + [farewell_msg]

    return updates


async def evaluate_tech(state: GameState) -> dict:
    llm = _make_llm()
    system = TECH_PROMPT.format(
        target_role=state.get("target_role") or "kandydata",
        company_name=state.get("company_name") or "nieznanej firmy",
    )
    response = await llm.ainvoke(
        [SystemMessage(content=system)] + state["messages"],
        config={"callbacks": []},
    )
    result = json.loads(response.content)

    updates = {
        "tech_score": result["score"],
        "tech_feedback": result["feedback"],
        "decision": result["decision"],
    }

    if result["decision"] == "pass":
        updates["current_stage"] = "offer"
    elif result["decision"] == "fail":
        updates["current_stage"] = "rejected"

    return updates
