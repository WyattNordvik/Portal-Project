"use client";
import { SessionProvider } from "next-auth/react";
import NotificationsBell from "@/components/NotificationsBell";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-end items-center p-4">
            <NotificationsBell />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

