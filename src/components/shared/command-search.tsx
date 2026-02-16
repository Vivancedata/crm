"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Building2,
  User,
  Briefcase,
  Search,
  Users,
  CheckSquare,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResults } from "@/lib/actions/search";
import { DEAL_STAGE_LABELS, INDUSTRY_LABELS } from "@/lib/constants";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const stageVariantMap: Record<string, BadgeProps["variant"]> = {
  LEAD: "lead",
  QUALIFIED: "qualified",
  DISCOVERY: "discovery",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
};

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
      setLoading(false);
    }
  }, [open]);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await globalSearch(value);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  const hasResults =
    results &&
    (results.companies.length > 0 ||
      results.contacts.length > 0 ||
      results.deals.length > 0);

  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-80 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      {/* Command palette dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global search"
        shouldFilter={false}
        loop
        overlayClassName="fixed inset-0 z-50 bg-black/50"
        contentClassName="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background shadow-lg"
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={handleSearch}
            placeholder="Search contacts, companies, deals..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          {/* Loading state */}
          {loading && (
            <Command.Loading>
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            </Command.Loading>
          )}

          {/* Empty state */}
          {!loading && hasQuery && !hasResults && (
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
          )}

          {/* Search results */}
          {!loading && hasResults && (
            <>
              {results.companies.length > 0 && (
                <Command.Group
                  heading={
                    <span className="px-2 text-xs font-medium text-muted-foreground">
                      Companies
                    </span>
                  }
                >
                  {results.companies.map((company) => (
                    <Command.Item
                      key={company.id}
                      value={`company-${company.id}`}
                      onSelect={() => navigate(`/companies/${company.id}`)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground"
                      )}
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {INDUSTRY_LABELS[company.industry] ?? company.industry}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.contacts.length > 0 && (
                <Command.Group
                  heading={
                    <span className="px-2 text-xs font-medium text-muted-foreground">
                      Contacts
                    </span>
                  }
                >
                  {results.contacts.map((contact) => (
                    <Command.Item
                      key={contact.id}
                      value={`contact-${contact.id}`}
                      onSelect={() => navigate(`/contacts/${contact.id}`)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground"
                      )}
                    >
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.email && (
                          <span className="text-xs text-muted-foreground">
                            {contact.email}
                          </span>
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.deals.length > 0 && (
                <Command.Group
                  heading={
                    <span className="px-2 text-xs font-medium text-muted-foreground">
                      Deals
                    </span>
                  }
                >
                  {results.deals.map((deal) => (
                    <Command.Item
                      key={deal.id}
                      value={`deal-${deal.id}`}
                      onSelect={() => navigate(`/deals/${deal.id}`)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground"
                      )}
                    >
                      <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-medium">{deal.title}</span>
	                        <Badge
	                          variant={stageVariantMap[deal.stage] ?? "default"}
	                          className="text-[10px]"
	                        >
                          {DEAL_STAGE_LABELS[deal.stage] ?? deal.stage}
                        </Badge>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </>
          )}

          {/* Quick links (initial state) */}
          {!hasQuery && !loading && (
            <Command.Group
              heading={
                <span className="px-2 text-xs font-medium text-muted-foreground">
                  Quick Links
                </span>
              }
            >
              <Command.Item
                value="go-dashboard"
                onSelect={() => navigate("/")}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                  "aria-selected:bg-accent aria-selected:text-accent-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                value="go-companies"
                onSelect={() => navigate("/companies")}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                  "aria-selected:bg-accent aria-selected:text-accent-foreground"
                )}
              >
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Companies</span>
              </Command.Item>
              <Command.Item
                value="go-contacts"
                onSelect={() => navigate("/contacts")}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                  "aria-selected:bg-accent aria-selected:text-accent-foreground"
                )}
              >
                <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Contacts</span>
              </Command.Item>
              <Command.Item
                value="go-deals"
                onSelect={() => navigate("/deals")}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                  "aria-selected:bg-accent aria-selected:text-accent-foreground"
                )}
              >
                <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Deals</span>
              </Command.Item>
              <Command.Item
                value="go-tasks"
                onSelect={() => navigate("/tasks")}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                  "aria-selected:bg-accent aria-selected:text-accent-foreground"
                )}
              >
                <CheckSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Tasks</span>
              </Command.Item>
            </Command.Group>
          )}
        </Command.List>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
              &#8593;&#8595;
            </kbd>
            <span>Navigate</span>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
              &#9166;
            </kbd>
            <span>Select</span>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>
            <span>Close</span>
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}
