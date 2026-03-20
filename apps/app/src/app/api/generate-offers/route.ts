import { NextRequest, NextResponse } from "next/server";

const AGENT_URL =
  process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123";

export async function POST(req: NextRequest) {
  try {
    const { preference } = await req.json();

    // 1. Create a thread
    const threadRes = await fetch(`${AGENT_URL}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!threadRes.ok) {
      return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
    }
    const thread = await threadRes.json();

    // 2. Run the graph synchronously (wait for completion)
    const runRes = await fetch(
      `${AGENT_URL}/threads/${thread.thread_id}/runs/wait`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant_id: "job_battle",
          input: {
            user_preference: preference,
            current_stage: "offer_selection",
          },
        }),
      }
    );
    if (!runRes.ok) {
      return NextResponse.json({ error: "Agent run failed" }, { status: 500 });
    }

    const result = await runRes.json();

    // LangGraph may wrap state in different keys depending on version
    const state =
      result?.values ?? result?.state ?? result?.output ?? result ?? {};
    const offers = state?.available_offers ?? [];

    return NextResponse.json({ offers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate offers" }, { status: 500 });
  }
}
