import { createFileRoute } from "@tanstack/react-router";
import { ListTodo } from "lucide-react";
import { AiFeature } from "@/components/ai-feature";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aura AI" },
      { name: "description", content: "Get a prioritized plan and schedule for any goal." },
    ],
  }),
  component: () => (
    <AiFeature
      feature="tasks"
      title="AI Task Planner"
      description="Describe your goal — get a prioritized, scheduled task list."
      icon={<ListTodo className="h-5 w-5" />}
      ctaLabel="Generate Plan"
      outputLabel="Task Plan"
      fields={[
        { name: "goal", label: "Goal or project", placeholder: "e.g. Launch Q3 marketing campaign", rows: 2 },
        { name: "deadline", label: "Deadline / timeframe", placeholder: "e.g. 3 weeks", rows: 1 },
        { name: "context", label: "Context & constraints", placeholder: "Team size, dependencies, blockers...", rows: 5 },
      ]}
    />
  ),
});