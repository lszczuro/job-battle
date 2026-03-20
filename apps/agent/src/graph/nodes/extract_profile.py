import json
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from src.graph.state import GameState

SYSTEM_PROMPT = """Przeanalizuj historię rozmowy i wyciągnij dane kandydata.
Zwróć TYLKO JSON. Dla brakujących danych zwróć null.
Schema: {
    "player_name": string | null,
    "player_current_role": string | null,
    "player_years_exp": integer | null,
    "player_skills": list[string] | null,
    "player_salary_expectation": string | null
}"""


async def extract_profile(state: GameState) -> dict:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        model_kwargs={"response_format": {"type": "json_object"}},
        api_key=os.environ["OPENAI_API_KEY"],
    )

    recent_messages = state["messages"][-6:]
    response = await llm.ainvoke([SystemMessage(content=SYSTEM_PROMPT)] + recent_messages)

    extracted = json.loads(response.content)

    updates = {}

    if extracted.get("player_name") is not None and state.get("player_name") is None:
        updates["player_name"] = extracted["player_name"]

    if extracted.get("player_current_role") is not None and state.get("player_current_role") is None:
        updates["player_current_role"] = extracted["player_current_role"]

    if extracted.get("player_years_exp") is not None and state.get("player_years_exp") is None:
        updates["player_years_exp"] = extracted["player_years_exp"]

    if extracted.get("player_skills") is not None and not state.get("player_skills"):
        updates["player_skills"] = extracted["player_skills"]

    if extracted.get("player_salary_expectation") is not None and state.get("player_salary_expectation") is None:
        updates["player_salary_expectation"] = extracted["player_salary_expectation"]

    return updates
