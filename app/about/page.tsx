import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About — Hourglass",
  description: "What Hourglass is and why it prices spending in hours of your life.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight">About Hourglass</h1>
      <p className="mt-1 text-sm text-secondary">Spend time wisely.</p>

      <Card className="mt-6 p-6">
        <p className="max-w-2xl text-sm leading-relaxed text-secondary">
          Hourglass is an expense tracker that reframes every dollar as the hours of your life you
          spent earning it. Set the value of your time once, and each expense, category, and monthly
          total is shown in hours of work alongside its amount — so the question stops being
          &ldquo;can I afford this?&rdquo; and starts being &ldquo;is this worth the hours?&rdquo;
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-secondary">
          Everything stays in your browser. There is no account, no backend, and no data leaving
          this device.
        </p>
      </Card>
    </div>
  );
}
