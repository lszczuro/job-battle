"""
Few-shot examples for dynamic HR scenario generation.

These are NOT used directly — they serve as style and tone anchors
for the LLM to generate new, absurd HR questions each interview session.

Each example shows ONLY the pure conversational output — exactly what
Kasia should say, nothing more. No labels, no meta-commentary.
"""

FEW_SHOT_SCENARIOS = [
    {
        "example": (
            "Hej! Zanim przejdziemy dalej, mam do Ciebie jedno z moich ulubionych pytań "
            "— nasze HR Research Team pracowało nad nim przez cały kwartał. "
            "Gdybyś był/a owocem, jakim owocem byś był/a "
            "i jak to przekłada się na Twoją wartość dla naszego zespołu?"
        ),
    },
    {
        "example": (
            "Fascynujące! A teraz coś z naszej matrycy kompetencji miękkich. "
            "Wyobraź sobie, że jesteś funkcją w Excelu. "
            "Którą z nich byś był/a i w jaki sposób WYSZUKUJ.PIONOWO "
            "najlepiej opisuje Twoją synergię z resztą zespołu?"
        ),
    },
    {
        "example": (
            "To bardzo 'out of the box'! A jak u Ciebie z 'crisis managementem'? "
            "Wyobraź sobie, że w open space nagle wysiadło Wi-Fi, a Ty możesz "
            "uratować tylko firmowy ekspres do kawy albo tablicę z wczorajszego brainstormingu. "
            "Co wybierasz, żeby zachować nasz 'core company spirit'?"
        ),
    },
    {
        "example": (
            "Och, to rezonuje z moim sercem! W ramach naszego 'Feedback Culture' "
            "lubimy dzielić się trudnymi emocjami. Jaką emotikoną zareagowałbyś/zareagowałabyś "
            "na maila od CEO o anulowaniu owocowych czwartków w imię optymalizacji kosztów?"
        ),
    },
    {
        "example": (
            "Ambitnie! U nas rozwój to ciągła podróż, tzw. 'employee journey'. "
            "Gdyby Twoja ścieżka kariery była grą RPG, to na którym levelu "
            "odblokowujesz skilla 'proaktywny leadership' i ile punktów many "
            "kosztuje Cię zrobienie nadgodzin?"
        ),
    },
]


def build_few_shot_block() -> str:
    """Returns formatted few-shot examples for injection into the HR system prompt."""
    parts = [
        "PRZYKŁADY czystej wypowiedzi Kasi (wzorzec tonu — NIE kopiuj, wygeneruj nowe pytanie):"
    ]
    for i, s in enumerate(FEW_SHOT_SCENARIOS, 1):
        parts.append(f'\n--- Przykład {i} ---\n"{s["example"]}"')
    return "\n".join(parts)
