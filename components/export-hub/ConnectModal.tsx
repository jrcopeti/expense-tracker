"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { X, Check, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Portal } from "@/components/ui/Portal";
import { Button } from "@/components/ui/Button";
import { fieldClasses } from "@/components/ui/Field";
import { useConnections } from "@/hooks/useConnections";
import { CONNECTION_META, type ConnectionId } from "@/lib/integrations/types";

interface ConnectModalProps {
  connectionId: ConnectionId;
  onClose: () => void;
}

export function ConnectModal({ connectionId, onClose }: ConnectModalProps) {
  const { connect } = useConnections();
  const meta = CONNECTION_META[connectionId];
  const titleId = useId();
  const [step, setStep] = useState<"signin" | "consent" | "connecting">("signin");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "connecting") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, step]);

  function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStep("consent");
  }

  async function handleAllow() {
    setStep("connecting");
    // A deliberately brief pause so the simulated flow reads like a real
    // OAuth round-trip - this whole modal is clearly-labeled demo/simulation,
    // nothing is actually sent anywhere.
    await new Promise((resolve) => setTimeout(resolve, 700));
    connect(connectionId, email);
    toast.success(`Connected to ${meta.name} as ${email}`);
    onClose();
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={step === "connecting" ? undefined : onClose}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p id={titleId} className="text-sm font-medium text-secondary">
              Connect {meta.name}
            </p>
            <button
              type="button"
              onClick={onClose}
              disabled={step === "connecting"}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step === "signin" && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4 p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <ShieldCheck className="h-5.5 w-5.5" strokeWidth={1.75} />
                </span>
                <p className="text-sm text-foreground">Sign in to continue to {meta.name}</p>
                <p className="text-xs text-muted">Simulated sign-in - this demo never contacts {meta.name}.</p>
              </div>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={fieldClasses()}
                aria-label="Email address"
              />
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          )}

          {step === "consent" && (
            <div className="flex flex-col gap-4 p-6">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Hourglass</span> wants to access your {meta.name} account
              </p>
              <p className="text-xs text-muted">Signed in as {email}</p>
              <ul className="flex flex-col gap-2 rounded-lg border border-border bg-surface-hover p-3">
                {meta.permissions.map((permission) => (
                  <li key={permission} className="flex items-start gap-2 text-xs text-secondary">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {permission}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleAllow}>Allow</Button>
              </div>
            </div>
          )}

          {step === "connecting" && (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <p className="text-sm text-secondary">Connecting to {meta.name}...</p>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
