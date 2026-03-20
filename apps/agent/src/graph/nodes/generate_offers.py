import json
import os
import uuid
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from src.graph.state import GameState, OfferCard

PRESET_OFFERS: list[OfferCard] = [
    {
        "id": "preset-1",
        "company_name": "NovaTech Sp. z o.o.",
        "target_role": "Senior Python Developer",
        "company_vibe": "scale-up, fintech, Warszawa, 200 os.",
        "offered_salary": "22 000 – 28 000 zł netto B2B",
        "emoji": "🐍",
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"],
    },
    {
        "id": "preset-2",
        "company_name": "CloudBase S.A.",
        "target_role": "Frontend Engineer (React)",
        "company_vibe": "startup, SaaS B2B, Kraków / remote, 60 os.",
        "offered_salary": "18 000 – 24 000 zł netto B2B",
        "emoji": "⚛️",
        "tech_stack": ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL"],
    },
    {
        "id": "preset-3",
        "company_name": "DataFlow Systems",
        "target_role": "Machine Learning Engineer",
        "company_vibe": "korporacja, AI/ML, Wrocław, 500 os.",
        "offered_salary": "25 000 – 35 000 zł netto B2B",
        "emoji": "🤖",
        "tech_stack": ["Python", "PyTorch", "MLflow", "AWS", "Spark"],
    },
    {
        "id": "preset-4",
        "company_name": "DevOps Hub",
        "target_role": "DevOps / Platform Engineer",
        "company_vibe": "agencja tech, infrastruktura chmurowa, Gdańsk, 80 os.",
        "offered_salary": "20 000 – 27 000 zł netto B2B",
        "emoji": "☁️",
        "tech_stack": ["Terraform", "Kubernetes", "AWS", "CI/CD", "Python"],
    },
    {
        "id": "preset-5",
        "company_name": "MobiSoft Sp. z o.o.",
        "target_role": "Backend Engineer (Java/Kotlin)",
        "company_vibe": "scale-up, e-commerce, Poznań, 150 os.",
        "offered_salary": "20 000 – 26 000 zł netto B2B",
        "emoji": "☕",
        "tech_stack": ["Java", "Kotlin", "Spring Boot", "Kafka", "PostgreSQL"],
    },
]

SYSTEM_PROMPT = (
    "Jesteś generatorem ofert pracy w polskiej branży IT.\n"
    "Na podstawie preferencji użytkownika wygeneruj DOKŁADNIE 5 ofert pracy.\n"
    "Każda oferta powinna być realistyczna i dopasowana do podanych preferencji.\n"
    "Zwróć TYLKO JSON array z 5 obiektami:\n"
    "[\n"
    "  {\n"
    '    "company_name": "nazwa fikcyjnej polskiej firmy tech",\n'
    '    "target_role": "konkretne stanowisko",\n'
    '    "company_vibe": "krótki opis: typ firmy, branża, miasto, wielkość",\n'
    '    "offered_salary": "widełki np. 20 000 – 26 000 zł netto B2B",\n'
    '    "emoji": "jedno emoji pasujące do roli",\n'
    '    "tech_stack": ["tech1", "tech2", "tech3", "tech4", "tech5"]\n'
    "  }\n"
    "]"
)


async def generate_offers(state: GameState) -> dict:
    preference = state.get("user_preference")

    if not preference:
        return {
            "available_offers": PRESET_OFFERS,
            "current_stage": "offer_selection",
        }

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        model_kwargs={"response_format": {"type": "json_object"}},
        temperature=0.9,
        api_key=os.environ["OPENAI_API_KEY"],
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Preferencje użytkownika: {preference}"),
    ]
    response = await llm.ainvoke(messages)

    raw = json.loads(response.content)
    # LLM may return {"offers": [...]} or just [...]
    items = raw if isinstance(raw, list) else raw.get("offers", raw.get("data", []))

    offers: list[OfferCard] = []
    for item in items[:5]:
        offers.append(
            {
                "id": str(uuid.uuid4()),
                "company_name": item.get("company_name", ""),
                "target_role": item.get("target_role", ""),
                "company_vibe": item.get("company_vibe", ""),
                "offered_salary": item.get("offered_salary", ""),
                "emoji": item.get("emoji", "💼"),
                "tech_stack": item.get("tech_stack", []),
            }
        )

    return {
        "available_offers": offers,
        "current_stage": "offer_selection",
    }
