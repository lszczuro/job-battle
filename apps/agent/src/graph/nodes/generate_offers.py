import json
import os
import uuid
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from src.graph.state import GameState, OfferCard
from pydantic import SecretStr


SYSTEM_PROMPT = (
    "Zwróć dokładnie 3 oferty. Odpowiedz wyłącznie poprawnym JSON-em w podanym formacie, bez dodatkowego tekstu, komentarzy ani znaczników markdown. "
    "Zgaduj brakujące preferencje: jeśli nie są podane, przyjmij zabawne, ogólne założenia zgodne z prośbą.\n"
    "Odpowiedz wyłącznie w formacie JSON: "
    '{"offers":[{"company_name":"","target_role":"","company_vibe":"typ firmy, branża, miasto, wielkość",'
    '"emoji":"","tech_stack":["","","",""]}]}'
)

async def generate_offers(state: GameState) -> dict:
    preference = state.get("user_preference")

    # Fall back to last human message from chat
    if not preference:
        for msg in reversed(state.get("messages", [])):
            if isinstance(msg, HumanMessage):
                preference = str(msg.content)
                break

    print(f"[generate_offers] called, preference={preference!r}", flush=True)

    if not preference:
        return {
            "current_stage": "offer_selection",
            "messages": [AIMessage(content="Cześć! Opisz czego szukasz — stanowisko, technologie, miasto — a znajdę dopasowane oferty. 🔍")],
        }

    llm = ChatOpenAI(
        model="gpt-5-nano",
        model_kwargs={"response_format": {"type": "json_object"}},
        temperature=0.9,
        reasoning_effort="minimal",
        api_key=SecretStr(os.environ["OPENAI_API_KEY"]),
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Preferencje użytkownika: {preference}"),
    ]
    response = await llm.ainvoke(messages)

    raw = json.loads(str(response.content))
    # LLM may return {"offers": [...]} or just [...]
    if isinstance(raw, list):
        items = raw
    else:
        # Try known keys first, then fall back to first list value found
        items = raw.get("offers") or raw.get("data") or next(
            (v for v in raw.values() if isinstance(v, list)), []
        )

    offers: list[OfferCard] = []
    for item in items[:3]:
        offers.append(
            {
                "id": str(uuid.uuid4()),
                "company_name": item.get("company_name", ""),
                "target_role": item.get("target_role", ""),
                "company_vibe": item.get("company_vibe", ""),
                "emoji": item.get("emoji", "💼"), # TODO: remove emoji
                "tech_stack": item.get("tech_stack", []),
            }
        )

    return {
        "available_offers": offers,
        "current_stage": "offer_selection",
        "messages": [
            AIMessage(
                content="",
                tool_calls=[{
                    "id": str(uuid.uuid4()),
                    "name": "show_job_offers",
                    "args": {"offers": offers},
                }],
            )
        ],
    }
