import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "./page";

afterEach(cleanup);

describe("AboutPage", () => {
  it("renders the app name as the page heading", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("About Hourglass");
  });

  it("describes the time-cost reframe and the local-only storage", () => {
    render(<AboutPage />);
    expect(screen.getByText(/hours of your life/i)).toBeTruthy();
    expect(screen.getByText(/no account, no backend/i)).toBeTruthy();
  });

  it("exports page metadata", () => {
    expect(metadata.title).toBe("About — Hourglass");
    expect(typeof metadata.description).toBe("string");
  });
});
