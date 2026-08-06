"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Receipt, Menu, X, Wallet } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
] as const;

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setIsMenuOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Wallet className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <span className="text-[15px]">Clarity</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:bg-surface-hover hover:text-foreground",
                )}
              >
                <link.icon className="h-4 w-4" strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover sm:hidden"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-border px-4 py-2 sm:hidden">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-accent/10 text-accent" : "text-secondary hover:bg-surface-hover hover:text-foreground",
                )}
              >
                <link.icon className="h-4 w-4" strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
