import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PT. Pacific Marine Technology] - Internal Dashboard",
  description: "Dashboard management system for PT Pacific Mariney. Built with modern web technologies.",
  keywords: ["Pacific Mariney", "Next.js", "Dashboard", "Management", "React"],
  authors: [{ name: "Pacific Mariney Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AirShip Management",
    description: "Internal dashboard and management system",
    url: "https://pacificmariney.com",
    siteName: "PT Pacific Mariney",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PT Pacific Mariney",
    description: "Internal dashboard and management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
