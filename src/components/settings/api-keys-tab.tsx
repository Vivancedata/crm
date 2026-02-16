"use client";

import { useState, useEffect } from "react";
import { getApiKeyStatus } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, CheckCircle2, XCircle } from "lucide-react";

interface ApiKeyInfo {
  name: string;
  envVar: string;
  description: string;
  configured: boolean;
}

export function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const status = await getApiKeyStatus();
        setKeys([
          {
            name: "Resend",
            envVar: "RESEND_API_KEY",
            description: "Email delivery service for sending transactional emails.",
            configured: status.resend,
          },
          {
            name: "Anthropic",
            envVar: "ANTHROPIC_API_KEY",
            description: "AI model provider for deal insights and email drafting.",
            configured: status.anthropic,
          },
        ]);
      } catch {
        // Silently fail — keys will show as not configured
        setKeys([
          {
            name: "Resend",
            envVar: "RESEND_API_KEY",
            description: "Email delivery service for sending transactional emails.",
            configured: false,
          },
          {
            name: "Anthropic",
            envVar: "ANTHROPIC_API_KEY",
            description: "AI model provider for deal insights and email drafting.",
            configured: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys & Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Keys & Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These API keys are configured through environment variables and
            cannot be edited from the UI. Contact your administrator to update
            them.
          </p>

          {keys.map((key) => (
            <div
              key={key.envVar}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {key.description}
                  </p>
                  <code className="mt-1 text-xs text-muted-foreground">
                    {key.envVar}
                  </code>
                </div>
              </div>
              {key.configured ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
