const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPTS: Record<string, (i: Record<string, string>) => string> = {
  email: (i) =>
    `Write a professional workplace email.\n\nRecipient / context: ${i.recipient}\nTone: ${i.tone}\nKey points to cover:\n${i.points}\n\nReturn a complete email with a subject line on the first line ("Subject: ..."), then a blank line, then the body. Keep it concise, clear, and ready to send.`,
  summary: (i) =>
    `Summarize the following meeting notes for a busy professional.\n\nNOTES:\n"""\n${i.notes}\n"""\n\nProduce sections with these exact markdown headings:\n## TL;DR\n(2-3 sentence overview)\n\n## Key Decisions\n(bulleted list)\n\n## Action Items\n(bulleted list as: - [Owner] Task — Due date if mentioned)\n\n## Open Questions\n(bulleted list)`,
  tasks: (i) =>
    `You are an AI productivity planner. Build a clear, prioritized task plan.\n\nGoal: ${i.goal}\nTimeframe: ${i.timeframe}\nConstraints / context: ${i.context}\n\nReturn a markdown plan with:\n## Overview\n(1-2 sentences)\n\n## Prioritized Tasks\n(numbered list — each item: title, priority [High/Med/Low], estimated time, brief description)\n\n## Suggested Schedule\n(day-by-day or block-by-block)\n\n## Risks & Tips\n(short bulleted list)`,
  research: (i) =>
    `Act as an AI research assistant. Provide a structured briefing on the topic below using your general knowledge. Be balanced and note when something is uncertain.\n\nTopic: ${i.topic}\nFocus / questions: ${i.focus}\n\nReturn markdown with:\n## Executive Summary\n## Key Concepts\n## Current Landscape\n## Notable Considerations / Trade-offs\n## Suggested Next Steps\n\nDo not invent specific statistics or sources. If unsure, say so.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { feature, inputs, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    let payloadMessages;
    if (feature === "chat") {
      payloadMessages = [
        {
          role: "system",
          content:
            "You are a helpful, professional AI workplace assistant. Be concise, structured, and practical. Use markdown when helpful. Note when you are uncertain.",
        },
        ...(Array.isArray(messages) ? messages : []),
      ];
    } else {
      const builder = PROMPTS[feature as keyof typeof PROMPTS];
      if (!builder) throw new Error("Unknown feature");
      payloadMessages = [
        { role: "system", content: "You are an AI assistant for workplace productivity. Always produce clear, well-structured, professional output." },
        { role: "user", content: builder(inputs ?? {}) },
      ];
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: payloadMessages,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in your Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});