"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, ExternalLink } from "lucide-react";

interface ProfileTabProps {
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
    role: string;
  };
}

export function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Name */}
            <div className="flex items-center gap-4">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name ?? "User avatar"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {user.name ?? "No name set"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role === "ADMIN" ? "Admin" : "Member"}
              </Badge>
            </div>
          </div>

          {/* Clerk Profile Link */}
          <div className="border-t pt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Manage your account settings, password, and connected accounts
              through Clerk.
            </p>
            <Button variant="outline" className="gap-2" asChild>
              <a
                href="https://accounts.clerk.dev/user"
                target="_blank"
                rel="noopener noreferrer"
              >
                <User className="h-4 w-4" />
                Manage Account
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
