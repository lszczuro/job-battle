import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from src.graph.state import GameState


async def hr_agent(state: GameState) -> dict:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        streaming=True,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    summary_context = state.get("headhunter_summary") or "Brak podsumowania od headhuntera."

    system_content = (
        "Jesteś doświadczonym HR Managerem w polskiej firmie tech.\n"
        "Przeprowadzasz rozmowę HR z kandydatem.\n\n"
        f"Notatka od headhuntera (poufna):\n{summary_context}\n\n"
        "Twoje zadanie: oceń dopasowanie kulturowe i miękkie kompetencje.\n"
        "Pytaj o: motywację, pracę zespołową, oczekiwania dot. kultury pracy,\n"
        "sposoby radzenia sobie z wyzwaniami, plany zawodowe.\n"
        "Bądź profesjonalny i empatyczny. Zadawaj jedno pytanie na raz."
    )

    messages = [SystemMessage(content=system_content)] + state["messages"]
    response = await llm.ainvoke(messages)

    return {
        "messages": [response],
        "turn_count": state.get("turn_count", 0) + 1,
    }
