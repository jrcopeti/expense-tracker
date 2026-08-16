import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import HelpPage from "./page";

afterEach(cleanup);

describe("HelpPage", () => {
  it("renders the page heading", () => {
    render(<HelpPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Help" })).toBeDefined();
  });

  it("documents every nav section and links it to its route", () => {
    render(<HelpPage />);

    // Every entry in the header's NAV_LINKS except /help, which is this page.
    const expected = [
      { label: "Dashboard", href: "/" },
      { label: "Expenses", href: "/expenses" },
      { label: "Categories", href: "/categories" },
      { label: "Vendors", href: "/vendors" },
      { label: "About", href: "/about" },
    ];

    for (const { label, href } of expected) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("href")).toBe(href);
      // Each section is a heading with at least one bullet describing it, so a
      // section can't silently degrade to a bare link with no explanation.
      const section = link.closest("li");
      expect(section?.querySelectorAll("ul li").length).toBeGreaterThan(0);
    }

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(expected.length);
  });
});
