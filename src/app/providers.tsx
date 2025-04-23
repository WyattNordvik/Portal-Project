"use client";
import { SessionProvider } from "next-auth/react";
//import NotificationsBell   from "@/components/NotificationsBell";
import type { ReactNode }  from "react";
import TestIcon from "@/components/TestIcon";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <header className="w-full bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            {/* DEBUG BANNER */}
            <span className="text-red-600 font-bold mr-4">🚩 HEADER RENDERED 🚩</span>
			{/* My Icon */}
			<TestIcon />
          </div>
        </header>
        <main className="flex-grow">{children}</main>
      </div>
    </SessionProvider>
  );
}
