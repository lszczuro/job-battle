import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from src.graph.state import GameState


async def headhunter_agent(state: GameState) -> dict:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        streaming=True,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    turn_count = state.get("turn_count", 0)
    has_offer = state.get("company_name") is not None

    if has_offer:
        system_content = """Jesteś headhunterem w polskiej branży IT.
            Właśnie dopasowałeś ofertę do kandydata.
            Przedstaw ofertę w jednym krótkim akapicie:
            firma, rola, widełki, dlaczego pasuje do kandydata.
            Zapytaj czy jest zainteresowany. Maksymalnie 3 zdania."""

        system_content += (
            f"\nOferta: {state.get('target_role')} w {state.get('company_name')}, "
            f"{state.get('offered_salary')}, {state.get('company_vibe')}."
        )

    else:
        # Dynamiczny prompt zależny od tury
        collected = []
        if state.get("player_current_role"):
            collected.append("stanowisko")
        if state.get("player_years_exp"):
            collected.append("doświadczenie")
        if state.get("player_skills"):
            collected.append("technologie")
        if state.get("player_salary_expectation"):
            collected.append("oczekiwania finansowe")

        missing = [x for x in [
            "aktualne stanowisko",
            "lata doświadczenia", 
            "główne technologie",
            "oczekiwania finansowe"
        ] if x not in collected]

        if turn_count == 0:
            system_content = """Jesteś headhunterem w polskiej branży IT.
                Zadzwoniłeś do kandydata z potencjalną ofertą.
                Przedstaw się w jednym zdaniu (Anna Kowalska, TalentBridge).
                Zapytaj o jedno: aktualne stanowisko i firmę.
                Bądź zwięzły i konkretny. Maksymalnie 2 zdania."""

        elif missing:
            next_question = missing[0]
            system_content = f"""Jesteś headhunterem w polskiej branży IT.
                Prowadzisz krótki screening kandydata.
                Masz już: {', '.join(collected) if collected else 'nic'}.
                Zadaj JEDNO krótkie pytanie o: {next_question}.
                Maksymalnie 1-2 zdania. Bez wstępów."""

        else:
            system_content = """Jesteś headhunterem w polskiej branży IT.
Masz wszystkie potrzebne informacje o kandydacie.
Powiedz że masz dla niego dopasowaną ofertę i że
za chwilę ją przedstawisz. Jedno zdanie."""

    messages = [SystemMessage(content=system_content)] + state["messages"]
    response = await llm.ainvoke(messages)

    return {
        "messages": [response],
        "turn_count": turn_count + 1,
    }