import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Mail, FileText, ListTodo, Search, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aura AI Workplace" },
      { name: "description", content: "Your AI-powered workplace dashboard for emails, summaries, planning, research, and chat." },
    ],
  }),
  component: Index,
});

const features = [
  { url: "/email", title: "Smart Email Generator", description: "Draft polished, on-tone emails in seconds.", icon: Mail },
  { url: "/meeting-notes", title: "Meeting Notes Summarizer", description: "Turn raw notes into TL;DR, decisions, and actions.", icon: FileText },
  { url: "/tasks", title: "AI Task Planner", description: "Get a prioritized plan and schedule for any goal.", icon: ListTodo },
  { url: "/research", title: "AI Research Assistant", description: "Structured briefings on any topic.", icon: Search },
  { url: "/chat", title: "AI Chatbot", description: "Conversational assistant for everyday work.", icon: MessageSquare },
];

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <section
        className="relative overflow-hidden rounded-2xl border border-border p-8 md:p-10 text-primary-foreground"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-90">
          <Sparkles className="h-3.5 w-3.5" />
          AI Workplace
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">
          Automate the busywork. Focus on what matters.
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base opacity-90">
          Aura brings together five AI tools — email, meetings, planning, research, and chat — into one
          clean, professional workspace.
        </p>
      </section>

      <AiDisclaimer />

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.url} to={f.url} className="group">
              <Card
                className="h-full border-border/60 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <CardHeader>
                  <div
                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base flex items-center justify-between">
                    {f.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
