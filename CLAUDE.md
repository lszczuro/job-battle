# Job Battle

## Purpose

**Job Battle** is a humorous interactive game where the player goes through a fake job interview with an AI recruiter. The goal is to pass a series of absurd HR questions without being detected as using AI to answer.

**Deployed at:** `jobbattle.pixelnest.pl`

## Gameplay Flow

1. User describes their desired job (or picks a preset)
2. AI generates 3 fake job offers based on the preference
3. User selects an offer
4. HR bot conducts an interview with metaphorical/absurd questions (max 6 turns)
5. Each answer is scored (engagement, authenticity) and checked for AI usage
6. Result: job offer (score ≥70, no AI detected) or rejection

## Architecture

Turborepo monorepo with two apps:

```
apps/
├── app/                          # Next.js 16 frontend (React 19)
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Root page (CopilotKit setup, thread ID)
│       │   ├── layout.tsx        # Root layout with OG/Twitter metadata
│       │   ├── providers.tsx     # Theme provider
│       │   └── api/copilotkit/route.ts  # CopilotKit runtime → LangGraph bridge
│       ├── components/
│       │   ├── game/             # Main game UI
│       │   │   ├── game-page.tsx          # Orchestrator (useAgent, stage routing)
│       │   │   ├── game-result-screen.tsx # Pass/fail screen with score display
│       │   │   ├── chat-header.tsx        # HR interview header
│       │   │   ├── progress-tracker.tsx   # Progress bar
│       │   │   └── result-ui.tsx
│       │   ├── offer-board/      # Job offer selection
│       │   │   ├── index.tsx     # Welcome + preset offers + custom input
│       │   │   └── offer-card.tsx
│       │   ├── ui/               # Radix-based components (Badge, Button, Card, etc.)
│       │   ├── headless-chat.tsx
│       │   └── tool-rendering.tsx
│       ├── hooks/
│       │   ├── index.ts
│       │   └── use-theme.tsx
│       └── mocks/game-state.ts
│
└── agent/                        # LangGraph Python agent
    ├── main.py                   # Entry point: imports game_graph
    ├── pyproject.toml            # Python deps (uv)
    └── src/graph/
        ├── state.py              # GameState schema
        ├── graph.py              # LangGraph StateGraph definition
        ├── scenarios.py          # Few-shot HR question examples
        └── nodes/
            ├── generate_offers.py   # Generates 3 job offers from user preference
            ├── hr.py                # HR agent (absurd questions)
            ├── evaluate.py          # Scores answers + AI detection
            └── final_report.py      # Congratulation message on pass
```

## Agent: State & Graph

**State schema** (`state.py`):

```python
class GameState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_preference: str | None
    selected_offer: OfferCard | None
    hr_score_raw: int | None        # Pre-AI-penalty score
    hr_score: int | None            # Post-AI-penalty (1-100)
    hr_ai_suspicion: float | None   # 0.0-1.0 (latest turn)
    hr_ai_rejected: bool | None     # True if auto-rejected for AI use
    hr_feedback: str | None
    decision: Decision | None       # "pass" | "fail" | "continue"
    current_stage: Stage            # "offer_selection" | "hr" | "offer" | "rejected"
    turn_count: int
    game_over: bool
    final_summary: str | None
```

**Graph flow:**

```
START → route_start → generate_offers (stage=offer_selection)
                    → hr_agent        (first greeting or follow-up)
                    → evaluate_hr     (after each human message)

evaluate_hr → "continue" → hr_agent
evaluate_hr → "pass"     → final_report → END
evaluate_hr → "fail"     → END
```

## Agent Nodes

### `generate_offers.py`
- Model: `gpt-5-nano` (temp 0.9)
- Input: user preference string
- Returns 3 `OfferCard` objects with uuid4 IDs, in JSON format
- Falls back to greeting if no preference given

### `hr.py` — recruiter
- Model: `gpt-5-nano` (or `OPENAI_MODEL` env)
- Turn 0: Greeting + first absurd question
- Subsequent turns: React + generate new metaphorical question
- Few-shot examples: fruit analogy, Excel function, Wi-Fi apocalypse, emoji self-description, RPG leveling
- Polish language only, max 4-5 sentences

### `evaluate.py` — Scoring + AI detection
Two parallel LLM calls:

**HR evaluation** (`gpt-5-nano`, JSON):
- Scores answer 1-100 on soft skills/engagement
- <20: hostile/manipulative; 20-40: disengaged; 55-75: normal honest response
- Returns `{"score": int, "feedback": str}`

**AI detection** (`gpt-4o-mini`, JSON):
- Starts at 15 (human baseline)
- +25 each: markdown, buzzwords, meta-phrases, excessive length, numbered sections
- -10 each: typos, colloquialisms, short answers, emoji, informal tone
- Returns `{"score": int}` (0-100, where 100 = definitely AI)

**Scoring logic:**
- Convert detection score to 0-1 suspicion
- Rolling average suspicion across all turns
- Penalties:
  - Latest ≥ 0.85 → cap effective score at 25 (auto-reject)
  - Latest ≥ 0.70 → cap at 40
  - Average ≥ 0.85 → floor effective at -20
- Decision: fail if `turn_count > 5 OR effective_score ≤ 40`, pass if `effective_score ≥ 70`

### `final_report.py`
- Model: `gpt-5-nano` (temp 0.4)
- 3-4 sentence congratulations in Polish
- Includes role, company name, score

## Frontend

**API route** (`api/copilotkit/route.ts`):
```typescript
const defaultAgent = new LangGraphAgent({
  deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL ?? "http://localhost:8123",
  graphId: "job_battle",
  langsmithApiKey: process.env.LANGSMITH_API_KEY,
});
```

**`game-page.tsx`** uses `useAgent()` (CopilotKit v2) to:
- Read `agent.state` (stage, scores, offers, etc.)
- Write `agent.setState()` on offer selection
- Render `useRenderTool()` to show offer board inside chat
- Route UI based on `current_stage`

**`offer-board/index.tsx`**: preset offers (NovaTech/Python, CloudBase/React, DataFlow/ML) + free-text custom preference. Validates with Zod.

**`game-result-screen.tsx`**: shows score (green ≥70, yellow ≥50, red <50), AI detection status/suspicion %, feedback, LinkedIn share button.

## Tech Stack

- **Frontend**: Next.js 16.1.6, React 19, TailwindCSS 4, Radix UI, CopilotKit (`@next` tag)
- **Agent**: Python 3.12+, LangGraph 1.0.5, LangChain 1.2.0, OpenAI SDK, FastAPI + uvicorn
- **Package managers**: pnpm (JS), uv (Python)
- **Monorepo**: Turborepo 2.5.4 with pnpm workspaces
- **Deployment**: Docker Compose, nginx (rate-limiting, SSL via Let's Encrypt)

## Development

```bash
# Install JS dependencies
pnpm install

# Start everything
pnpm dev

# Start individually
pnpm dev:app    # Next.js on port 3000
pnpm dev:agent  # LangGraph on port 8123

# Build
pnpm build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | Used by all agent LLM calls |
| `OPENAI_MODEL` | No | `gpt-5-nano` | Override model for HR/offer/report nodes |
| `LANGGRAPH_DEPLOYMENT_URL` | No | `http://localhost:8123` | Agent endpoint |
| `LANGSMITH_API_KEY` | No | — | LangSmith tracing |

## Deployment

**Docker Compose** (`docker-compose.yml`): services `agent` (port 8123) and `app` (port 3002), images pulled from `ghcr.io`.

**nginx** (`docker/nginx.conf`):
- Rate limit: 6 req/min on `/api/copilotkit` (burst 2)
- Client body limit: 64KB (prompt injection protection)
- SSL/TLS via Let's Encrypt (Certbot)
- HTTP → HTTPS redirect

## Testing

```bash
cd apps/agent
pytest tests/
```

Key test files:
- `tests/test_evaluate_hr_mocked.py` — evaluate node with mocked LLM
- `tests/test_evaluate_pure.py` — pure scoring logic
- `tests/test_golden.py` — golden test cases
