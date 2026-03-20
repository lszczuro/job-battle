import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Jesteś generatorem ofert pracy w polskiej branży IT.
Na podstawie preferencji użytkownika wygeneruj DOKŁADNIE 5 ofert pracy.
Każda oferta powinna być realistyczna, fikcyjna i dopasowana do podanych preferencji.
Zwróć TYLKO JSON object z kluczem "offers" zawierającym array 5 obiektów:
{
  "offers": [
    {
      "id": "unikalny-id",
      "company_name": "nazwa fikcyjnej polskiej firmy tech",
      "target_role": "konkretne stanowisko",
      "company_vibe": "krótki opis: typ firmy, branża, miasto, wielkość",
      "offered_salary": "widełki np. 20 000 – 26 000 zł netto B2B",
      "emoji": "jedno emoji pasujące do roli",
      "tech_stack": ["tech1", "tech2", "tech3", "tech4", "tech5"]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { preference } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Preferencje: ${preference}` },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "OpenAI error" }, { status: 500 });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ offers: parsed.offers });
  } catch {
    return NextResponse.json({ error: "Failed to generate offers" }, { status: 500 });
  }
}
