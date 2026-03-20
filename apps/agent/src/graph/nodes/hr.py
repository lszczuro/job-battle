import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from src.graph.state import GameState


async def hr_agent(state: GameState) -> dict:
    selected = state.get("selected_offer") or {}
    role = state.get("target_role") or selected.get("target_role") or "nieznane stanowisko"
    company = state.get("company_name") or selected.get("company_name") or "firma"
    vibe = state.get("company_vibe") or selected.get("company_vibe") or ""

    turn_count = state.get("turn_count", 0)

    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano"),
        reasoning_effort="minimal",
        streaming=True,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    # First turn: minimal prompt → only greeting + first question, streams fast
    if turn_count == 0:
        messages = [
            SystemMessage(
                content=(
                    f"Główne zadanie: odpowiedz jako Anna Kowalska, HR Manager w {company}, "
                    f"prowadząca rozmowę z kandydatem na stanowisko {role}. "
                    "Wymagania:\n"
                    "- Przywitaj się w 1 zdaniu.\n"
                    "- Przedstaw się.\n"
                    "- Zadaj 1 krótkie pytanie o motywację kandydata.\n"
                    "- Cała odpowiedź: maksymalnie 3 zdania.\n"
                    "- Pisz po polsku\n"
                )
            ),
        ]
        response = await llm.ainvoke(messages)
        return {
            "messages": [AIMessage(content=response.content)],
            "turn_count": 1,
        }

    system_content = (
        "Jesteś doświadczonym HR Managerem w polskiej firmie tech.\n"
        "Przeprowadzasz rozmowę HR z kandydatem.\n\n"
        f"Stanowisko: {role} w {company}\n"
        f"Firma: {vibe}\n\n"
        "Twoje zadanie: oceń dopasowanie kulturowe i miękkie kompetencje.\n"
        "Pytaj o: motywację, pracę zespołową, oczekiwania dot. kultury pracy,\n"
        "sposoby radzenia sobie z wyzwaniami, plany zawodowe.\n"
        "Bądź profesjonalny i empatyczny. Zadawaj jedno pytanie na raz."
    )

    history = state.get("messages") or []
    messages = [SystemMessage(content=system_content)] + history
    response = await llm.ainvoke(messages)

    return {
        "messages": [response],
        "turn_count": turn_count + 1,
    }
