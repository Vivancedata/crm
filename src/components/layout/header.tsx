"use client";

import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandSearch } from "@/components/shared/command-search";
import { NotificationsPopover } from "@/components/shared/notifications-popover";
import { isClerkClientConfigured } from "@/lib/clerk-config";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <CommandSearch />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Add
        </Button>

        <NotificationsPopover />

        {isClerkClientConfigured() ? <UserButton afterSignOutUrl="/sign-in" /> : null}
      </div>
    </header>
  );
}
