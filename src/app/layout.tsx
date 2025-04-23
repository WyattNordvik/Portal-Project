import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "Portal", description: "" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			{/* clamp horizontal overflow here too */}
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
