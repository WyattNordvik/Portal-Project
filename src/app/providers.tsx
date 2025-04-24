"use client";

import { SessionProvider } from "next-auth/react";
import NotificationsBell   from "@/components/NotificationsBell";
import FooterNav from "@/components/FooterNav";
import type { ReactNode }  from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <header className="w-full bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-end items-center p-4">
            <NotificationsBell />
          </div>
        </header>
        <main className="flex-grow">{children}</main>
        <FooterNav />
		</div>
    </SessionProvider>
  );
}

