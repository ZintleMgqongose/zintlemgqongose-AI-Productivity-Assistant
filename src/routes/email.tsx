import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AiFeature } from "@/components/ai-feature";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aura AI" },
      { name: "description", content: "Generate professional, ready-to-send emails with AI." },
    ],
  }),
  component: () => (
    <AiFeature
      feature="email"
      title="Smart Email Generator"
      description="Draft polished, on-tone emails in seconds."
      icon={<Mail className="h-5 w-5" />}
      ctaLabel="Generate Email"
      outputLabel="Generated Email"
      fields={[
        { name: "recipient", label: "Recipient & context", placeholder: "e.g. Marketing team — follow up after Tuesday's launch sync", rows: 2 },
        { name: "tone", label: "Tone", placeholder: "e.g. Friendly but professional", rows: 1 },
        { name: "points", label: "Key points to cover", placeholder: "• Confirm timeline\n• Ask for design assets\n• Propose Friday review", rows: 6 },
      ]}
    />
  ),
});