import json
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from src.graph.state import GameState

SYSTEM_PROMPT = (
    "Jesteś headhunterem. Na podstawie profilu kandydata "
    "wymyśl realistyczną polską firmę tech i dopasowaną ofertę.\n"
    "Firma musi być fikcyjna ale brzmieć wiarygodnie.\n"
    "Dopasuj rolę i widełki do doświadczenia kandydata.\n"
    "Zwróć TYLKO JSON:\n"
    "{\n"
    '  "company_name": "np. NovaTech Sp. z o.o.",\n'
    '  "target_role": "np. Senior Backend Engineer",\n'
    '  "company_vibe": "np. scale-up, fintech, Warszawa, 200 os.",\n'
    '  "offered_salary": "np. 22 000 – 28 000 zł netto B2B"\n'
    "}"
)


async def generate_offer(state: GameState) -> dict:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        model_kwargs={"response_format": {"type": "json_object"}},
        temperature=0.9,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    skills = ", ".join(state.get("player_skills") or []) or "brak danych"
    user_content = (
        f"Profil kandydata:\n"
        f"- Imię: {state.get('player_name') or 'nieznane'}\n"
        f"- Aktualna rola: {state.get('player_current_role') or 'nieznana'}\n"
        f"- Lata doświadczenia: {state.get('player_years_exp') or 'nieznane'}\n"
        f"- Umiejętności: {skills}\n"
        f"- Oczekiwania finansowe: {state.get('player_salary_expectation') or 'nieznane'}"
    )

    messages = [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=user_content)]
    response = await llm.ainvoke(messages)

    data = json.loads(response.content)

    return {
        "company_name": data["company_name"],
        "target_role": data["target_role"],
        "company_vibe": data["company_vibe"],
        "offered_salary": data["offered_salary"],
    }
