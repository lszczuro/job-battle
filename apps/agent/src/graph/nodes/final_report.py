import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from src.graph.state import GameState
from pydantic import SecretStr



async def final_report(state: GameState) -> dict:
    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano"),
        temperature=0.4,
        reasoning_effort="minimal",
        api_key=SecretStr(os.environ["OPENAI_API_KEY"]),
    )

    target_role = state.get("target_role") or "nieznane stanowisko"
    company_name = state.get("company_name") or "nieznana firma"
    hr_score = state.get("hr_score")
    hr_feedback = state.get("hr_feedback") or ""
    hr_summary = state.get("hr_summary") or ""

    system = (
        "Jesteś narratorem procesu rekrutacyjnego.\n"
        "Kandydat właśnie pomyślnie przeszedł rozmowę HR i otrzymuje ofertę pracy.\n"
        "Napisz krótkie, entuzjastyczne podsumowanie z gratulacjami (3-4 zdania).\n"
        "Uwzględnij stanowisko, firmę i wynik HR. Bądź ciepły, konkretny i motywujący.\n"
        "Pisz po polsku, bezpośrednio do kandydata."
    )

    summary_input = (
        f"Stanowisko: {target_role} w {company_name}\n"
        f"Wynik HR: {hr_score}/100\n"
        f"Feedback rekrutera: {hr_feedback}\n"
        f"Podsumowanie rozmowy: {hr_summary}"
    )

    messages = [SystemMessage(content=system), HumanMessage(content=summary_input)]
    response = await llm.ainvoke(messages)

    return {
        "game_over": True,
        "current_stage": "offer",
        "final_summary": response.content,
    }
