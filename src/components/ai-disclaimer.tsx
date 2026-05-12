import { ShieldAlert } from "lucide-react";

export function AiDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <p>
        AI-generated content may be inaccurate or incomplete. Always review,
        edit, and verify outputs before using them in professional settings.
      </p>
    </div>
  );
}