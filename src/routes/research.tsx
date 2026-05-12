import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AiFeature } from "@/components/ai-feature";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Aura AI" },
      { name: "description", content: "Structured briefings on any topic." },
    ],
  }),
  component: () => (
    <AiFeature
      feature="research"
      title="AI Research Assistant"
      description="Enter a topic — get a structured briefing with key facts, players, and sources."
      icon={<Search className="h-5 w-5" />}
      ctaLabel="Search & Analyze"
      outputLabel="Research Briefing"
      fields={[
        { name: "topic", label: "Topic", placeholder: "e.g. State of AI agents in 2026", rows: 2 },
        { name: "focus", label: "Focus / questions to answer (optional)", placeholder: "What specifically do you want to learn?", rows: 4 },
      ]}
    />
  ),
});