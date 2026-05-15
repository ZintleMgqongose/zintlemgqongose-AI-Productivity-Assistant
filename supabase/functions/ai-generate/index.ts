const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_CHARS = 8000;

const PROMPTS: Record<string, (i: Record<string, string>) => string> = {
  email: (i) =>
    `Write a professional workplace email.\n\nRecipient / context: ${i.recipient}\nTone: ${i.tone}\nKey points to cover:\n${i.points}\n\nStrict formatting rules:\n1. The FIRST line MUST be a clear, specific subject line in the exact format: "Subject: <concise subject>". Never omit it.\n2. Follow with a blank line, then a greeting, then the body, then a sign-off and sender placeholder.\n3. The sign-off MUST be a professional closing chosen to match the tone:\n   - Formal / serious tone → "Sincerely,"\n   - Neutral / standard professional tone → "Best regards,"\n   - Friendly / warm professional tone → "Kind regards," or "Best,"\n   Never use casual closings like "Cheers" or "Thanks!" unless the tone is explicitly casual.\n4. Keep it concise, clear, and ready to send.`,
  summary: (i) =>
    `Summarize the following meeting notes for a busy professional. Use formal, polished business terminology suitable for an executive audience. Avoid casual phrasing, slang, or filler.\n\nMEETING DATE (provided by user): ${i.date || "Not specified"}\nATTENDEES (provided by user): ${i.attendees || "Not specified"}\n\nNOTES:\n"""\n${i.notes}\n"""\n\nProduce the summary in this EXACT markdown structure:\n\n**Date:** ${i.date || "Not specified"}\n**Attendees:** ${i.attendees || "Not specified"}\n\n## Executive Summary\n(2-3 sentence professional overview of the meeting's purpose and outcomes)\n\n## Key Decisions\n(bulleted list)\n\n## Action Items\nFormat each action item as a bold bullet point so it stands out:\n- **[Owner]** **Task description** — Due date if mentioned\n(Every action item bullet MUST use bold for the owner and the task. Never output plain non-bold action items.)\n\n## Open Questions\n(bulleted list)\n\nAlways place the Date and Attendees lines verbatim at the very top, before any heading. Do NOT replace the user-provided Date or Attendees with "Not specified" if values were given above.`,
  tasks: (i) =>
    `You are an AI productivity planner. Build a clear, prioritized task plan.\n\nGoal: ${i.goal}\nTimeframe: ${i.timeframe}\nConstraints / context: ${i.context}\n\nReturn a markdown plan with:\n## Overview\n(1-2 sentences)\n\n## Prioritized Tasks\n(numbered list — each item: title, priority [High/Med/Low], estimated time, brief description)\n\n## Suggested Schedule\n(day-by-day or block-by-block)\n\n## Risks & Tips\n(short bulleted list)`,
  research: (i) =>
    `Act as an AI research assistant. Provide a structured briefing on the topic below using your general knowledge. Be balanced and note when something is uncertain.\n\nTopic: ${i.topic}\nFocus / questions: ${i.focus}\n\nReturn markdown with:\n## Executive Summary\n## Key Concepts\n## Current Landscape\n## Notable Considerations / Trade-offs\n## Suggested Next Steps\n\nDo not invent specific statistics or sources. If unsure, say so.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require authenticated Supabase user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_PUBLISHABLE_KEY =
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      console.error("Missing Supabase env vars for auth verification");
      return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { feature, inputs, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    let payloadMessages;
    if (feature === "chat") {
      const rawMessages = Array.isArray(messages) ? messages : [];
      if (rawMessages.length > MAX_MESSAGES) {
        return new Response(
          JSON.stringify({ error: `Too many messages. Maximum is ${MAX_MESSAGES}.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const sanitized = [];
      for (const m of rawMessages) {
        if (!m || typeof m !== "object") continue;
        const role = (m as { role?: unknown }).role;
        const content = (m as { content?: unknown }).content;
        if (role !== "user" && role !== "assistant") continue;
        if (typeof content !== "string") continue;
        if (content.length === 0) continue;
        sanitized.push({
          role,
          content: content.length > MAX_MESSAGE_CHARS ? content.slice(0, MAX_MESSAGE_CHARS) : content,
        });
      }
      payloadMessages = [
        {
          role: "system",
          content:
            "You are a helpful, professional AI workplace assistant. Be concise, structured, and practical. Use markdown when helpful. Note when you are uncertain.",
        },
        ...sanitized,
      ];
    } else {
      const builder = PROMPTS[feature as keyof typeof PROMPTS];
      if (!builder) {
        return new Response(JSON.stringify({ error: "Invalid request." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});