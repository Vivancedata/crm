"use client";

import { useState } from "react";
import { generateDealInsights } from "@/lib/actions/ai";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface DealInsightsProps {
  dealId: string;
}

interface InsightsData {
  summary: string;
  risk: "low" | "medium" | "high";
  nextSteps: string[];
  winProbability: string;
}

const riskConfig = {
  low: {
    variant: "success" as const,
    label: "Low Risk",
    icon: CheckCircle2,
  },
  medium: {
    variant: "warning" as const,
    label: "Medium Risk",
    icon: Info,
  },
  high: {
    variant: "destructive" as const,
    label: "High Risk",
    icon: AlertTriangle,
  },
};

export function DealInsights({ dealId }: DealInsightsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (insights) return; // Use cached result
    setLoading(true);
    setError(null);
    try {
      const result = await generateDealInsights(dealId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setInsights(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate insights"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!insights && !loading && !error) {
    return (
      <Card variant="neu">
        <CardContent className="flex items-center justify-center p-6">
          <Button onClick={handleGenerate} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card variant="neu">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse text-primary" />
            Generating Insights...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="neu">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                handleGenerate();
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const risk = riskConfig[insights.risk];
  const RiskIcon = risk.icon;

  return (
    <Card variant="neu">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div>
          <p className="text-sm text-muted-foreground">{insights.summary}</p>
        </div>

        {/* Risk Assessment */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Risk Assessment:</span>
          <Badge variant={risk.variant} className="gap-1">
            <RiskIcon className="h-3 w-3" />
            {risk.label}
          </Badge>
        </div>

        {/* Next Steps */}
        <div>
          <p className="mb-2 text-sm font-medium">Suggested Next Steps:</p>
          <ul className="space-y-1.5">
            {insights.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Win Probability */}
        <div>
          <p className="mb-1 text-sm font-medium">Win Probability Assessment:</p>
          <p className="text-sm text-muted-foreground">
            {insights.winProbability}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
