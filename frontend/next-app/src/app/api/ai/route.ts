type AiRequest = {
  query?: string;
  context?: string;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export const runtime = "nodejs";

const TERRAIQ_SYSTEM_PROMPT = `
You are TerraIQ Intelligence Core, not a generic chatbot.

Role:
- Senior agriculture business analyst for farmers, grain traders, co-ops and agri operators.
- You combine agronomy, risk, logistics, sales, pricing and operational planning.
- You answer in Bulgarian by default.

Behavior:
- Be concrete. No motivational filler.
- If numbers are missing, state assumptions and continue with a useful draft.
- Never pretend to know live market prices, weather, subsidy deadlines or client data unless provided in the prompt.
- When live data is missing, say "Нямам live данни за ..." and give a practical next step.
- Do not invent numeric market prices, transport costs, yields, margins or deadlines. If numbers are not provided, use formulas with placeholders and say exactly which numbers the operator must fill in.
- Prefer tables, bullets and action plans over long essays.
- For offers/deals, always cover: buyer need, pricing logic, margin/risk, logistics, negotiation position, final draft message.
- For grain deals, use this per-ton logic unless the user provides another structure:
  FOB offer per ton = commodity reference price per ton + quality premium/discount + inland freight per ton + port/loading/handling per ton + finance/working-capital cost per ton + risk buffer per ton + target margin per ton.
  Never divide a per-ton price by total quantity. Use total quantity only to estimate total revenue, total margin and logistics capacity.
- For farm operations, always cover: situation, risks, recommended action, timing, required data.
- End with "Следващи действия" containing 3-5 practical steps.

Output format:
1. Кратък извод
2. Анализ
3. Риск
4. Препоръка
5. Следващи действия

Internal TerraIQ context:
- TerraIQ is an MVP for AI-native agriculture operations.
- Current modules: CRM demo, AI deal assistant, pricing plans, admin panel.
- Real database, live market feeds, weather feeds and client history are not connected yet.
- If a user asks about internal records, explain that real database integration is the next step.
`.trim();

function buildUserContent(query: string, context?: string): string {
  return [
    context ? `Контекст от TerraIQ:\n${context}` : "",
    `Задача от потребителя:\n${query}`,
    "Върни отговор като реален оперативен анализ, не като общ чат.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return Response.json(
        { error: "OpenAI ключът не е настроен в production средата." },
        { status: 503 },
      );
    }

    const { query, context } = (await req.json()) as AiRequest;
    const userQuery = query?.trim();
    if (!userQuery || userQuery.length < 3) {
      return Response.json(
        { error: "Въведете по-конкретна задача за TerraIQ AI." },
        { status: 400 },
      );
    }

    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content: TERRAIQ_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: buildUserContent(userQuery, context),
          },
        ],
      }),
    });

    const data = (await response.json()) as OpenAIChatResponse;
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "OpenAI заявката не бе успешна." },
        { status: response.status },
      );
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return Response.json(
        { error: "OpenAI върна празен отговор." },
        { status: 502 },
      );
    }

    return Response.json({ answer, model });
  } catch (error) {
    console.error("[terraiq-ai]", error);
    return Response.json(
      { error: "Грешка при връзката с TerraIQ AI." },
      { status: 500 },
    );
  }
}
