"use client";

import { SessionProvider } from "next-auth/react";
import NotificationsBell from "@/components/NotificationsBell";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {/* This header (and the bell) now live inside a client component */}
      <header className="flex justify-end p-4 border-b">
        <NotificationsBell />
      </header>
      {children}
    </SessionProvider>
  );
}

