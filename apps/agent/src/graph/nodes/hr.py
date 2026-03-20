import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from src.graph.state import GameState


async def hr_agent(state: GameState) -> dict:
    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        streaming=True,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    selected = state.get("selected_offer") or {}
    role = state.get("target_role") or selected.get("target_role") or "nieznane stanowisko"
    company = state.get("company_name") or selected.get("company_name") or "firma"
    vibe = state.get("company_vibe") or selected.get("company_vibe") or ""
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
    if not history:
        history = [HumanMessage(content="Rozpocznij rozmowę — przedstaw się i zadaj pierwsze pytanie.")]

    messages = [SystemMessage(content=system_content)] + history
    response = await llm.ainvoke(messages)

    return {
        "messages": [response],
        "turn_count": state.get("turn_count", 0) + 1,
    }
