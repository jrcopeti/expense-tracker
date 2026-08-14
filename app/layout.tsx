import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hourglass — Spend Time Wisely",
  description: "An expense tracker that measures spending in hours of your life, not just dollars.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface-1)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            },
            success: { iconTheme: { primary: "var(--status-good)", secondary: "var(--surface-1)" } },
            error: { iconTheme: { primary: "var(--status-critical)", secondary: "var(--surface-1)" } },
          }}
        />
      </body>
    </html>
  );
}
