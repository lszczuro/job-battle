# Job Battle

Symulator rozmowy rekrutacyjnej oparty na AI. Opisujesz wymarzone stanowisko, AI generuje oferty pracy, a następnie przeprowadza Cię przez rozmowę HR — z absurdalnymi pytaniami i wykrywaczem odpowiedzi AI.

## Jak to działa

1. **Opisz stanowisko** — wpisz czego szukasz, AI generuje kilka spersonalizowanych ofert
2. **Wybierz ofertę** — kliknij interesującą Cię pozycję
3. **Rozmowa HR z "Kasią"** — stereotypowa rekruterka zadaje absurdalne pytania metaforyczne ("Gdybyś był kolorem, jaki by to był kolor?")
4. **Ocena** — AI ocenia Twoje odpowiedzi (zaangażowanie, autentyczność) i wykrywa użycie AI do generowania odpowiedzi
5. **Wynik** — oferta pracy albo odrzucenie (z feedbackiem i wynikiem 0–100)

### Wykrywanie AI

Agent ocenia każdą odpowiedź pod kątem oznak użycia AI (markdown, buzzwordy, nadmierna struktura). Jeśli prawdopodobieństwo przekroczy 85% — kandydatura zostaje odrzucona niezależnie od treści.

## Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Agent**: LangGraph (Python), OpenAI
- **Integracja**: CopilotKit v2 (bidirectional agent state)
- **Monorepo**: Turborepo + pnpm

## Uruchomienie

### Wymagania

- Node.js 18+
- Python 3.8+
- pnpm
- Klucz OpenAI API

### Instalacja

```bash
# Zależności JS
pnpm install

# Zależności Python (agent)
pnpm install:agent
```

### Konfiguracja

```bash
# Skopiuj plik z przykładem i uzupełnij klucz API
cp apps/agent/.env.example apps/agent/.env
```

```env
OPENAI_API_KEY=your-key-here
```

### Uruchomienie (dev)

```bash
pnpm dev
```

Uruchamia jednocześnie:
- Frontend: `http://localhost:3000`
- Agent (LangGraph): `http://localhost:8123`

### Skrypty

| Komenda | Opis |
|---------|------|
| `pnpm dev` | Frontend + agent |
| `pnpm dev:app` | Tylko Next.js |
| `pnpm dev:agent` | Tylko agent |
| `pnpm build` | Build produkcyjny |
| `pnpm lint` | Linting |

## Struktura projektu

```
apps/
├── app/          # Next.js frontend
│   └── src/
│       ├── app/          # Next.js routes + API
│       └── components/
│           ├── game/     # Ekrany gry (chat, wynik, nagłówek)
│           └── offer-board/  # Wybór oferty
└── agent/        # LangGraph agent (Python)
    └── src/graph/
        ├── nodes/
        │   ├── generate_offers.py  # Generowanie ofert na podstawie preferencji
        │   ├── hr.py               # Rekruterka "Kasia"
        │   ├── evaluate.py         # Ocena odpowiedzi + wykrywanie AI
        │   └── final_report.py     # Podsumowanie końcowe
        ├── graph.py    # Definicja grafu LangGraph
        └── state.py    # Schema stanu gry
```

## Rozwiązywanie problemów

**Agent nie odpowiada** — sprawdź czy `OPENAI_API_KEY` jest ustawiony i czy agent działa na porcie 8123.

**Błędy importu Python** — uruchom `pnpm install:agent` ponownie.
