import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage, RemoveMessage
from src.graph.state import GameState

HEADHUNTER_PROMPT = """\
Jesteś headhunterem który właśnie przeprowadził rozmowę z kandydatem na {target_role} w {company_name}.

Oceń ostatnią odpowiedź kandydata.
Dodatkowo napisz krótkie podsumowanie kandydata dla następnego rekrutera \
(max 3 zdania, rzeczowe, bez ozdób). To jest wewnętrzna notatka — kandydat jej nie widzi.

Zwróć TYLKO JSON:
{{
  "score": int (1-10),
  "feedback": str (1 zdanie co poszło dobrze/źle),
  "decision": "pass" | "fail" | "continue",
  "headhunter_summary": str (2-3 zdania: profil kandydata, kluczowe umiejętności, wrażenie z rozmowy)
}}

"continue" jeśli potrzebujesz więcej informacji.
"pass" jeśli kandydat kwalifikuje się do rozmowy HR.
"fail" jeśli kandydat odpada.
Bądź wymagający — nie każdy powinien przechodzić.\
"""

HR_PROMPT = """\
Jesteś HR managerem który właśnie przeprowadził rozmowę z kandydatem na {target_role} w {company_name}.

Oceń ostatnią odpowiedź kandydata.
Dodatkowo napisz krótkie podsumowanie dla technical interviewera \
(max 3 zdania, rzeczowe). To jest wewnętrzna notatka — kandydat jej nie widzi.

Zwróć TYLKO JSON:
{{
  "score": int (1-10),
  "feedback": str (1 zdanie co poszło dobrze/źle),
  "decision": "pass" | "fail" | "continue",
  "hr_summary": str (2-3 zdania: dopasowanie kulturowe, motywacja, red flagi lub plusy)
}}

"continue" jeśli potrzebujesz więcej informacji.
"pass" jeśli kandydat kwalifikuje się do rozmowy technicznej.
"fail" jeśli kandydat odpada.
Bądź wymagający — nie każdy powinien przechodzić.\
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
        model="gpt-4o-mini",
        temperature=0.1,
        model_kwargs={"response_format": {"type": "json_object"}},
        api_key=os.environ["OPENAI_API_KEY"],
    )


def _clear_messages(state: GameState) -> list:
    return [RemoveMessage(id=m.id) for m in state["messages"]]


async def evaluate_headhunter(state: GameState) -> dict:
    llm = _make_llm()
    system = HEADHUNTER_PROMPT.format(
        target_role=state.get("target_role") or "kandydata",
        company_name=state.get("company_name") or "nieznanej firmy",
    )
    response = await llm.ainvoke([SystemMessage(content=system)] + state["messages"])
    result = json.loads(response.content)

    updates = {
        "headhunter_score": result["score"],
        "headhunter_feedback": result["feedback"],
        "decision": result["decision"],
        "headhunter_summary": result.get("headhunter_summary"),
    }

    if result["decision"] == "pass":
        transition_msg = AIMessage(
            content=(
                "Gratulacje! Twój profil bardzo nas zainteresował. "
                "Przekazuję Cię teraz do naszego HR Managera — kolejny etap to rozmowa "
                "o kulturze pracy i Twojej motywacji. Napisz coś aby kontynuować. Powodzenia! 🎉"
            )
        )
        updates["messages"] = _clear_messages(state) + [transition_msg]
        updates["current_stage"] = "hr"

    return updates


async def evaluate_hr(state: GameState) -> dict:
    llm = _make_llm()
    system = HR_PROMPT.format(
        target_role=state.get("target_role") or "kandydata",
        company_name=state.get("company_name") or "nieznanej firmy",
    )
    response = await llm.ainvoke([SystemMessage(content=system)] + state["messages"])
    result = json.loads(response.content)

    updates = {
        "hr_score": result["score"],
        "hr_feedback": result["feedback"],
        "decision": result["decision"],
        "hr_summary": result.get("hr_summary"),
    }

    if result["decision"] == "pass":
        transition_msg = AIMessage(
            content=(
                "Świetnie! Rozmowa HR przebiegła bardzo dobrze. "
                "Czeka Cię teraz rozmowa techniczna — przygotuj się na pytania o kod i architekturę. "
                "Napisz coś aby kontynuować. Powodzenia! 💻"
            )
        )
        updates["messages"] = _clear_messages(state) + [transition_msg]
        updates["current_stage"] = "tech"

    return updates


async def evaluate_tech(state: GameState) -> dict:
    llm = _make_llm()
    system = TECH_PROMPT.format(
        target_role=state.get("target_role") or "kandydata",
        company_name=state.get("company_name") or "nieznanej firmy",
    )
    response = await llm.ainvoke([SystemMessage(content=system)] + state["messages"])
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
