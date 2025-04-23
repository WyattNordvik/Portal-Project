// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import NotificationsBell from "@/components/NotificationsBell";
import {SessionProvider} from "next-auth/react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your App Title",
  description: "Your project description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Only one <body> in the entire tree */}
      <body className="antialiased">
        {/* Wrap the whole tree in SessionProvider */}
        <Providers>
			<header className="flex justify-end p-4 border-b">
				<NotificationsBell />
			</header>
			{children}
		</Providers>
      </body>
    </html>
  );
}

