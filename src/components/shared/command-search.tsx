"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CheckSquare,
  LayoutDashboard,
  Loader2,
  Search,
  User,
  Users,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { DEAL_STAGE_LABELS, INDUSTRY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResults } from "@/lib/actions/search";

type CommandSearchState = {
  open: boolean;
  query: string;
  results: SearchResults | null;
  loading: boolean;
};

type CommandSearchAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "toggle" }
  | { type: "input"; query: string }
  | { type: "clearResults" }
  | { type: "searchStart" }
  | { type: "searchSuccess"; results: SearchResults }
  | { type: "searchError" };

type CommandLink = {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

type SearchItemClassNameProps = {
  className?: string;
};

const INITIAL_STATE: CommandSearchState = {
  open: false,
  query: "",
  results: null,
  loading: false,
};

const QUICK_LINKS: CommandLink[] = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    value: "go-dashboard",
  },
  {
    href: "/companies",
    icon: Building2,
    label: "Companies",
    value: "go-companies",
  },
  {
    href: "/contacts",
    icon: Users,
    label: "Contacts",
    value: "go-contacts",
  },
  {
    href: "/deals",
    icon: Briefcase,
    label: "Deals",
    value: "go-deals",
  },
  {
    href: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
    value: "go-tasks",
  },
];

const stageVariantMap: Record<string, BadgeProps["variant"]> = {
  LEAD: "lead",
  QUALIFIED: "qualified",
  DISCOVERY: "discovery",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
};

type DealStageLabelKey = keyof typeof DEAL_STAGE_LABELS;

function commandSearchReducer(
  state: CommandSearchState,
  action: CommandSearchAction
): CommandSearchState {
  switch (action.type) {
    case "open":
      return state.open ? state : { ...state, open: true };
    case "close":
      return INITIAL_STATE;
    case "toggle":
      return state.open ? INITIAL_STATE : { ...state, open: true };
    case "input":
      return { ...state, query: action.query };
    case "clearResults":
      return { ...state, loading: false, results: null };
    case "searchStart":
      return { ...state, loading: true, results: null };
    case "searchSuccess":
      return { ...state, loading: false, results: action.results };
    case "searchError":
      return { ...state, loading: false, results: null };
    default:
      return state;
  }
}

function SearchGroupHeading({ children }: { children: string }) {
  return (
    <span className="px-2 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function commandItemClassName({ className }: SearchItemClassNameProps = {}) {
  return cn(
    "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
    "aria-selected:bg-accent aria-selected:text-accent-foreground",
    className
  );
}

function SearchTriggerButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-10 w-80 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </button>
  );
}

function SearchResultsPanel({
  results,
  onNavigate,
}: {
  results: SearchResults;
  onNavigate: (href: string) => void;
}) {
  return (
    <>
      {results.companies.length > 0 && (
        <Command.Group heading={<SearchGroupHeading>Companies</SearchGroupHeading>}>
          {results.companies.map((company) => (
            <Command.Item
              key={company.id}
              value={`company-${company.id}`}
              onSelect={() => onNavigate(`/companies/${company.id}`)}
              className={commandItemClassName()}
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
        <Command.Group heading={<SearchGroupHeading>Contacts</SearchGroupHeading>}>
          {results.contacts.map((contact) => (
            <Command.Item
              key={contact.id}
              value={`contact-${contact.id}`}
              onSelect={() => onNavigate(`/contacts/${contact.id}`)}
              className={commandItemClassName()}
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
        <Command.Group heading={<SearchGroupHeading>Deals</SearchGroupHeading>}>
          {results.deals.map((deal) => (
            (() => {
              const stageKey = deal.stage as DealStageLabelKey;
              return (
                <Command.Item
                  key={deal.id}
                  value={`deal-${deal.id}`}
                  onSelect={() => onNavigate(`/deals/${deal.id}`)}
                  className={commandItemClassName()}
                >
                  <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span className="font-medium">{deal.title}</span>
                    <Badge
                      variant={stageVariantMap[stageKey] ?? "default"}
                      className="text-[10px]"
                    >
                      {DEAL_STAGE_LABELS[stageKey] ?? deal.stage}
                    </Badge>
                  </div>
                </Command.Item>
              );
            })()
          ))}
        </Command.Group>
      )}
    </>
  );
}

function QuickLinksPanel({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <Command.Group heading={<SearchGroupHeading>Quick Links</SearchGroupHeading>}>
      {QUICK_LINKS.map(({ href, icon: Icon, label, value }) => (
        <Command.Item
          key={value}
          value={value}
          onSelect={() => onNavigate(href)}
          className={commandItemClassName()}
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{label}</span>
        </Command.Item>
      ))}
    </Command.Group>
  );
}

function SearchFooter() {
  return (
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
  );
}

export function CommandSearch() {
  const router = useRouter();
  const [{ open, query, results, loading }, dispatch] = useReducer(
    commandSearchReducer,
    INITIAL_STATE
  );
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  const clearPendingSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    requestIdRef.current += 1;
  }, []);

  const openSearch = useCallback(() => {
    dispatch({ type: "open" });
  }, []);

  const closeSearch = useCallback(() => {
    clearPendingSearch();
    dispatch({ type: "close" });
  }, [clearPendingSearch]);

  const navigate = useCallback(
    (href: string) => {
      closeSearch();
      router.push(href);
    },
    [closeSearch, router]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openSearch();
      } else {
        closeSearch();
      }
    },
    [closeSearch, openSearch]
  );

  const handleSearch = useCallback(
    (value: string) => {
      dispatch({ type: "input", query: value });
      clearPendingSearch();

      if (!value.trim()) {
        dispatch({ type: "clearResults" });
        return;
      }

      dispatch({ type: "searchStart" });
      const requestId = requestIdRef.current;

      debounceRef.current = setTimeout(async () => {
        try {
          const data = await globalSearch(value);
          if (requestIdRef.current === requestId) {
            dispatch({ type: "searchSuccess", results: data });
          }
        } catch {
          if (requestIdRef.current === requestId) {
            dispatch({ type: "searchError" });
          }
        }
      }, 300);
    },
    [clearPendingSearch]
  );

  const toggleSearch = useCallback(() => {
    if (open) {
      closeSearch();
    } else {
      openSearch();
    }
  }, [closeSearch, open, openSearch]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSearch();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearPendingSearch();
    };
  }, [clearPendingSearch, toggleSearch]);

  const hasResults =
    !!results &&
    (results.companies.length > 0 ||
      results.contacts.length > 0 ||
      results.deals.length > 0);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      <SearchTriggerButton onOpen={openSearch} />

      <Command.Dialog
        open={open}
        onOpenChange={handleOpenChange}
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
          {loading && (
            <Command.Loading>
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            </Command.Loading>
          )}

          {!loading && hasQuery && !hasResults && (
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
          )}

          {!loading && results && hasResults && (
            <SearchResultsPanel results={results} onNavigate={navigate} />
          )}

          {!hasQuery && !loading && <QuickLinksPanel onNavigate={navigate} />}
        </Command.List>

        <SearchFooter />
      </Command.Dialog>
    </>
  );
}
