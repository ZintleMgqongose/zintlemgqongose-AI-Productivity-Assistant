import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AiFeature } from "@/components/ai-feature";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Aura AI" },
      { name: "description", content: "Turn raw meeting notes into TL;DR, decisions, and action items." },
    ],
  }),
  component: () => (
    <AiFeature
      feature="summary"
      title="Meeting Notes Summarizer"
      description="Paste raw notes — get a structured summary with decisions and actions."
      icon={<FileText className="h-5 w-5" />}
      ctaLabel="Summarize Notes"
      outputLabel="Meeting Summary"
      fields={[
        { name: "date", label: "Date", placeholder: "e.g. May 12, 2026", rows: 1 },
        { name: "attendees", label: "Attendees", placeholder: "e.g. Alice, Bob, Carla", rows: 1 },
        { name: "notes", label: "Raw notes / transcript", placeholder: "Paste your raw meeting notes or transcript here...", rows: 10 },
      ]}
    />
  ),
});