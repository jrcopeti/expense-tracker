import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Receipt, ChartPie, Store, Info, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Help — Hourglass",
  description: "What each section of Hourglass does.",
};

// Deliberately a literal copy of the nav rather than an import of Header's
// NAV_LINKS: the help copy is prose about each section, so it has to be
// written and reviewed here anyway, and importing the registry would drag a
// "use client" component into this static page. Every nav section is listed
// except Help itself, which is this page.
const SECTIONS: Array<{ href: string; label: string; icon: LucideIcon; summary: string; details: string[] }> = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    summary: "The month at a glance, led by the hours it cost you rather than the dollar total.",
    details: [
      "This month's spending as hours of your life, plus a streak badge for days under your daily budget.",
      "Stat cards for all-time spending, transaction count, and your top category.",
      "A six-month heatmap calendar — click a day to see what you logged on it.",
      "A chart of categories ranked by time cost, and a quick-capture box for logging an expense in plain text.",
      "Export your data, or load six months of sample data if you're just exploring.",
    ],
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: Receipt,
    summary: "The full list of everything you've logged, with the tools to search and correct it.",
    details: [
      "Filter by text, category, and date range, and sort by date or amount.",
      "Add an expense from the quick-capture box, or click one in the list to edit or delete it.",
      "The header counts what's showing versus the total, in both dollars and hours.",
      "Export the currently filtered expenses to CSV.",
    ],
  },
  {
    href: "/categories",
    label: "Categories",
    icon: ChartPie,
    summary: "Your categories ranked by what they really cost, biggest spender first.",
    details: [
      "Each row shows a category's total, its share of your spending, and the hours behind it.",
      "Toggle between this month and all time.",
      "Custom categories you create while logging an expense show up here alongside the built-in ones.",
    ],
  },
  {
    href: "/vendors",
    label: "Vendors",
    icon: Store,
    summary: "Who your money — and your hours — actually go to.",
    details: [
      "Vendor names are read from each expense's description, so no extra data entry is needed.",
      "Your top 25 vendors, each with its number of expenses, share of spending, and most recent date.",
    ],
  },
  {
    href: "/about",
    label: "About",
    icon: Info,
    summary: "What Hourglass is and why it prices spending in hours instead of dollars.",
    details: [
      "The idea behind the app: every amount is also the time you spent earning it.",
      "A note on where your data lives — this browser, with no account and no server.",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
        <p className="mt-1 text-sm text-secondary">
          Hourglass measures spending in hours of your life, not just dollars. Here&apos;s what each section does.
        </p>
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <Card className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <section.icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-medium text-foreground">
                    <Link href={section.href} className="hover:text-accent hover:underline">
                      {section.label}
                    </Link>
                  </h2>
                  <p className="mt-0.5 text-sm text-secondary">{section.summary}</p>
                  <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-secondary marker:text-muted">
                    {section.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted">
        The Settings button in the header is where you set your hourly wage (or monthly income and hours per week) and
        your daily budget — without it, every section falls back to showing dollars only. Everything you log stays in
        this browser&apos;s local storage; there is no account and no server.
      </p>
    </div>
  );
}
