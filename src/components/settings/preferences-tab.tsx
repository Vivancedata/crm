"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Check } from "lucide-react";

interface Preferences {
  defaultDealStage: string;
  defaultServiceType: string;
  dateFormat: string;
  itemsPerPage: string;
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultDealStage: "LEAD",
  defaultServiceType: "CONSULTING",
  dateFormat: "MM/DD/YYYY",
  itemsPerPage: "25",
};

const DEAL_STAGES = [
  { value: "LEAD", label: "Lead" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "DISCOVERY", label: "Discovery" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "NEGOTIATION", label: "Negotiation" },
];

const SERVICE_TYPES = [
  { value: "CONSULTING", label: "Consulting" },
  { value: "INTEGRATION", label: "AI Integration" },
  { value: "TRAINING", label: "Training" },
  { value: "SUPPORT", label: "Support" },
  { value: "CUSTOM", label: "Custom Development" },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const ITEMS_PER_PAGE = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

const FIELD_IDS = {
  defaultDealStage: "preferences-default-deal-stage",
  defaultServiceType: "preferences-default-service-type",
  dateFormat: "preferences-date-format",
  itemsPerPage: "preferences-items-per-page",
} as const;

export function PreferencesTab() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("crm-preferences");
    if (stored) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  function handleSave() {
    localStorage.setItem("crm-preferences", JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleChange(key: keyof Preferences, value: string) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CRM Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Deal Stage */}
          <div className="grid gap-2">
            <Label
              className="text-sm font-medium"
              htmlFor={FIELD_IDS.defaultDealStage}
            >
              Default Deal Stage
            </Label>
            <Select
              value={preferences.defaultDealStage}
              onValueChange={(value) => handleChange("defaultDealStage", value)}
            >
              <SelectTrigger
                id={FIELD_IDS.defaultDealStage}
                className="w-full max-w-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEAL_STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The default stage when creating a new deal.
            </p>
          </div>

          {/* Default Service Type */}
          <div className="grid gap-2">
            <Label
              className="text-sm font-medium"
              htmlFor={FIELD_IDS.defaultServiceType}
            >
              Default Service Type
            </Label>
            <Select
              value={preferences.defaultServiceType}
              onValueChange={(value) =>
                handleChange("defaultServiceType", value)
              }
            >
              <SelectTrigger
                id={FIELD_IDS.defaultServiceType}
                className="w-full max-w-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The default service type when creating a new deal.
            </p>
          </div>

          {/* Date Format */}
          <div className="grid gap-2">
            <Label
              className="text-sm font-medium"
              htmlFor={FIELD_IDS.dateFormat}
            >
              Date Format Preference
            </Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) => handleChange("dateFormat", value)}
            >
              <SelectTrigger
                id={FIELD_IDS.dateFormat}
                className="w-full max-w-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How dates are displayed throughout the CRM.
            </p>
          </div>

          {/* Items Per Page */}
          <div className="grid gap-2">
            <Label
              className="text-sm font-medium"
              htmlFor={FIELD_IDS.itemsPerPage}
            >
              Items Per Page
            </Label>
            <Select
              value={preferences.itemsPerPage}
              onValueChange={(value) => handleChange("itemsPerPage", value)}
            >
              <SelectTrigger
                id={FIELD_IDS.itemsPerPage}
                className="w-full max-w-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Number of items displayed per page in list views.
            </p>
          </div>

          {/* Save Button */}
          <div className="border-t pt-4">
            <Button onClick={handleSave} className="gap-2">
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
