import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from src.graph.state import GameState


async def final_report(state: GameState) -> dict:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    system = (
        "Jesteś narratorem procesu rekrutacyjnego.\n"
        "Napisz krótkie podsumowanie dla kandydata —\n"
        "co poszło dobrze, co źle, jaka była ostateczna decyzja.\n"
        "Bądź szczery ale konstruktywny.\n"
        "Uwzględnij oceny z każdego etapu."
    )

    summary_input = (
        f"Stanowisko: {state.get('target_role') or 'nieznane'} w {state.get('company_name') or 'nieznanej firmie'}\n\n"
        f"HR — ocena: {state.get('hr_score')}/10, "
        f"feedback: {state.get('hr_feedback')}\n"
        f"Tech — ocena: {state.get('tech_score')}/10, "
        f"feedback: {state.get('tech_feedback')}\n"
        f"Wynik końcowy: {state.get('current_stage')}"
    )

    messages = [SystemMessage(content=system), HumanMessage(content=summary_input)]
    response = await llm.ainvoke(messages)

    outcome = state.get("current_stage", "rejected")
    final_stage = "offer" if outcome == "offer" else "rejected"

    return {
        "game_over": True,
        "current_stage": final_stage,
        "final_summary": response.content,
        "messages": [response],
    }
