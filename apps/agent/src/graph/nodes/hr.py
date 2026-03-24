import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from src.graph.state import GameState
from src.graph.scenarios import build_few_shot_block
from pydantic import SecretStr



async def hr_agent(state: GameState) -> dict:
    selected = state.get("selected_offer") or {}
    role = selected.get("target_role") or "nieznane stanowisko"
    company = selected.get("company_name") or "firma"
    vibe = selected.get("company_vibe") or ""

    turn_count = state.get("turn_count", 0)

    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano"),
        streaming=True,
        reasoning_effort="low",
        api_key=SecretStr(os.environ["OPENAI_API_KEY"]),
    )

    # First turn: greeting + first absurd HR question
    if turn_count == 0:
        few_shot = build_few_shot_block()
        messages = [
            SystemMessage(
                content=(
                    f"Jesteś Kasia, HR Specialist w {company}, rekrutujesz na stanowisko {role}. "
                    f"Kultura firmy: {vibe}\n\n"
                    "Jesteś stereotypową, lekko roztrzepaną rekruterką — entuzjastyczna, serdeczna, "
                    "pełna korporacyjnego żargonu, który sam w sobie nic nie znaczy.\n\n"
                    "ZADANIE NA TĘ TURĘ:\n"
                    "1. Przywitaj się bardzo entuzjastycznie i przedstaw się (1-2 zdania).\n"
                    "2. Zadaj STEREOTYPOWE pytanie rekrutacyjne — "
                    "wygenerowane przez siebie, unikalne, lekko surrealistyczne.\n\n"
                    "JAK GENEROWAĆ PYTANIE:\n"
                    "- Pytanie to JEDNO zdanie pytające — proste gramatycznie, choć absurdalne treściowo.\n"
                    "- Pytanie ma brzmieć jak 'głęboka' mądrość HR, ale być totalnym nonsensem.\n"
                    "- Może być metaforyczne (owoce, zwierzęta, kolory, pogoda, jedzenie, filmy).\n"
                    "- Może mieszać buzzwordy z absurdem.\n"
                    "- Dostarcz je w swoim stylu: z entuzjazmem, może z małą dygresją o sobie.\n"
                    "- Maks 4-5 zdań łącznie.\n"
                    "- Pisz po polsku.\n\n"
                    f"{few_shot}"
                )
            ),
        ]
        response = await llm.ainvoke(messages)
        return {
            "messages": [AIMessage(content=response.content)],
            "turn_count": 1,
        }

    # Subsequent turns: generate next question based on history
    history = state.get("messages") or []

    few_shot = build_few_shot_block()
    system_content = (
        f"Jesteś Kasia, HR Specialist w {company}, rekrutujesz na stanowisko {role}. {vibe}\n\n"
        "Jesteś entuzjastyczną, roztrzepaną rekruterką pełną korporacyjnego żargonu. "
        "Traktujesz absurdalne pytania śmiertelnie poważnie. "
        "Reagujesz entuzjastycznie na każdą odpowiedź.\n\n"
        "ZASADY:\n"
        "- Zareaguj krótko na odpowiedź kandydata (1-2 zdania).\n"
        "- Zadaj JEDNO nowe absurdalne metaforyczne pytanie HR (1 zdanie pytające).\n"
        "- Nie powtarzaj metafor użytych wcześniej w rozmowie.\n"
        "- Maks 4 zdania łącznie. Po polsku.\n"
    )


    messages = [SystemMessage(content=system_content)] + history
    response = await llm.ainvoke(messages)

    return {
        "messages": [AIMessage(content=response.content)],
        "turn_count": turn_count + 1,
    }
