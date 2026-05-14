import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Aura AI" },
      { name: "description", content: "Conversational AI assistant for everyday workplace tasks." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { feature: "chat", messages: next },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.text ?? "" }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8 h-[calc(100vh-3.5rem)]">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">AI Chatbot</h1>
          <p className="text-sm text-muted-foreground">Ask anything — get clear, structured answers.</p>
        </div>
        </div>
        <AiDisclaimer />
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-base">Conversation</CardTitle>
          <CardDescription>Chat with the assistant — responses render as rich text.</CardDescription>
        </CardHeader>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground gap-2">
              <Sparkles className="h-8 w-8 text-[#d8b4fe]" />
              <p className="text-sm">Start a conversation. Try: "Help me prep for a 1:1 with my manager."</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-[#d8b4fe] text-[#1a0b2e] px-4 py-2.5 text-sm whitespace-pre-wrap shadow-[0_4px_14px_rgba(216,180,254,0.25)]"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 text-white px-4 py-3 text-sm"
                }
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:text-white prose-strong:text-white prose-a:text-[#d8b4fe] prose-code:text-[#d8b4fe] prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-[#94A3B8] inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message the assistant…"
              rows={2}
              className="resize-none"
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="lg">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}