import { useState, type ReactNode } from "react";
import { Loader2, Sparkles, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AiDisclaimer } from "./ai-disclaimer";

type Field = {
  name: string;
  label: string;
  placeholder: string;
  rows?: number;
};

interface Props {
  feature: "email" | "summary" | "tasks" | "research";
  title: string;
  description: string;
  icon: ReactNode;
  fields: Field[];
  outputLabel?: string;
  ctaLabel?: string;
}

export function AiFeature({ feature, title, description, icon, fields, outputLabel = "AI Output", ctaLabel = "Generate" }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (fields.some((f) => !values[f.name]?.trim())) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { feature, inputs: values },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutput(data.text ?? "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <AiDisclaimer />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60" style={{ boxShadow: "var(--shadow-soft)" }}>
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
            <CardDescription>Provide the details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Textarea
                  id={f.name}
                  rows={f.rows ?? 3}
                  placeholder={f.placeholder}
                  value={values[f.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              </div>
            ))}
            <Button onClick={generate} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> {ctaLabel}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60" style={{ boxShadow: "var(--shadow-soft)" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{outputLabel}</CardTitle>
              <CardDescription>Edit freely before using.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOutput("")} disabled={!output}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={16}
              placeholder="Your AI-generated result will appear here…"
              className="font-mono text-sm leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}