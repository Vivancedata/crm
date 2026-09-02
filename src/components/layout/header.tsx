"use client";

import { UserButton } from "@clerk/nextjs";
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
        {/* "Quick Add" lived here with no onClick: the most prominent control
            in the app did nothing at all. Every entity already has a real
            create dialog on its own page, and ⌘K reaches any of them, so this
            is a deletion rather than a fifth way in. */}
        <NotificationsPopover />

        {/* v7 removed UserButton's sign-out redirect props; the redirect now
            lives on ClerkProvider (afterSignOutUrl in src/app/layout.tsx). */}
        {isClerkClientConfigured() ? <UserButton /> : null}
      </div>
    </header>
  );
}
