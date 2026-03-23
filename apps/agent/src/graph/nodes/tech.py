import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from src.graph.state import GameState
from pydantic import SecretStr



async def tech_agent(state: GameState) -> dict:
    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano"),
        streaming=True,
        reasoning_effort="minimal",
        api_key=SecretStr(os.environ["OPENAI_API_KEY"]),
    )

    hr_context = state.get("hr_summary") or "Brak podsumowania od HR."
    skills = ", ".join(state.get("tech_stack") or []) or "nieznane"

    system_content = (
        "Jesteś doświadczonym technical interviewerem.\n"
        "Przeprowadzasz rozmowę techniczną z kandydatem.\n\n"
        f"Notatka od HR (poufna):\n{hr_context}\n\n"
        f"Umiejętności do sprawdzenia u kandydata: {skills}\n"
        f"Stanowisko: {state.get('target_role') or 'nieznane'} w {state.get('company_name') or 'nieznanej firmie'}\n\n"
        "Zadawaj pytania techniczne dostosowane do doświadczenia kandydata.\n"
        "Pytaj o konkretne projekty, problemy techniczne, decyzje architektoniczne.\n"
        "Bądź dociekliwy ale fair. Zadawaj jedno pytanie na raz."
    )

    messages = [SystemMessage(content=system_content)] + state["messages"]
    response = await llm.ainvoke(messages)

    return {
        "messages": [response],
        "turn_count": state.get("turn_count", 0) + 1,
    }
