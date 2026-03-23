import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from src.graph.state import GameState
from src.graph.scenarios import build_few_shot_block


async def hr_agent(state: GameState) -> dict:
    selected = state.get("selected_offer") or {}
    role = state.get("target_role") or selected.get("target_role") or "nieznane stanowisko"
    company = state.get("company_name") or selected.get("company_name") or "firma"
    vibe = state.get("company_vibe") or selected.get("company_vibe") or ""

    turn_count = state.get("turn_count", 0)

    llm = ChatOpenAI(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano"),
        streaming=True,
        reasoning_effort="minimal",
        api_key=os.environ["OPENAI_API_KEY"],
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
                    "2. Zadaj ABSURDALNE, STEREOTYPOWE pytanie rekrutacyjne — "
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
        f"Jesteś Kasia, HR Specialist w {company}, rekrutujesz na stanowisko {role}.\n"
        f"Kultura firmy: {vibe}\n\n"
        "TWOJA OSOBOWOŚĆ:\n"
        "- Stereotypowa, lekko roztrzepana rekruterka — entuzjastyczna, serdeczna, absolutnie pewna siebie.\n"
        "- Używasz korporacyjnego żargonu jakby miał magiczną moc: 'synergia', 'value add', "
        "'growth mindset', 'alignment', 'holistic approach'.\n"
        "- Traktujesz swoje absurdalne pytania śmiertelnie poważnie — to są dla Ciebie głęboka psychologia.\n"
        "- Co jakiś czas wtrącasz że 'jesteśmy jak rodzina' lub 'u nas pasja to waluta'.\n"
        "- Reagujesz entuzjastycznie na każdą odpowiedź, nawet jeśli nie ma sensu: "
        "'O, to bardzo dużo mówi o Tobie!', 'Wow, to dokładnie nasza energia!'.\n\n"
        "ZASADY PROWADZENIA ROZMOWY:\n"
        "- Każda Twoja odpowiedź MUSI kończyć się nowym pytaniem.\n"
        "- Zadajesz JEDNO pytanie na raz — jedno, proste zdanie pytające. BEZ pytań złożonych, BEZ 'a jeśli...', BEZ wielokrotnych metafor w jednym pytaniu.\n"
        "- Maks 4-5 zdań.\n"
        "- Pisz po polsku.\n\n"
        "TWOJE ZADANIE — ABSURDALNE PYTANIA HR:\n"
        "Zadajesz absurdalne, metaforyczne, stereotypowo-korporacyjne pytania rekrutacyjne.\n"
        "Patrz na historię rozmowy:\n"
        "- Po każdej odpowiedzi kandydata: zareaguj entuzjastycznie, zinterpretuj odpowiedź "
        "jakby cokolwiek powiedział/a było genialnym insight'em, a potem zadaj NOWE absurdalne pytanie.\n"
        "- Każde pytanie musi być inne — nie powtarzaj metafor (nie pytaj dwa razy o owoce, zwierzęta itp.).\n\n"
        "JAK GENEROWAĆ PYTANIA:\n"
        "- Pytanie ma brzmieć jak 'głęboka' mądrość HR, ale być totalnym nonsensem.\n"
        "- Używaj metafor z życia codziennego: pogoda, jedzenie, filmy, kolory, zwierzęta, pory roku, "
        "sprzęty domowe, zjawiska atmosferyczne, gatunki muzyczne — cokolwiek.\n"
        "- Możesz mieszać buzzwordy z absurdem: 'na skali od 1 do synergii...', "
        "'jak bardzo Twój growth mindset przypomina...'\n"
        "- Pytania muszą pasować do KAŻDEJ branży — są o kandydacie jako człowieku, nie o jego zawodzie.\n"
        "- Bądź naturalna — wpleć swój entuzjazm, może powołaj się na 'nasze badania wewnętrzne'.\n\n"
        f"{few_shot}"
    )

    messages = [SystemMessage(content=system_content)] + history
    response = await llm.ainvoke(messages)

    return {
        "messages": [AIMessage(content=response.content)],
        "turn_count": turn_count + 1,
    }
