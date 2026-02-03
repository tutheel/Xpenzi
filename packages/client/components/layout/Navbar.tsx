"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/app" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg">Xpenzi</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/app">Dashboard</Link>
          </Button>
          <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
        </div>
      </div>
    </nav>
  );
}
