"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { X, Clock3, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Field, fieldClasses } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Portal } from "@/components/ui/Portal";
import { useSettings } from "@/hooks/useSettings";
import { useExpenses } from "@/hooks/useExpenses";
import { effectiveHourlyWage } from "@/lib/time-cost";
import { formatCurrency } from "@/lib/format";
import { validateSettings, type SettingsFormValues, type SettingsFormErrors } from "@/lib/validation";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { clearAllExpenses } = useExpenses();
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const [values, setValues] = useState<SettingsFormValues>(() => ({
    mode: settings.monthlyIncome && !settings.hourlyWage ? "income" : settings.hourlyWage ? "wage" : "income",
    hourlyWage: settings.hourlyWage ? String(settings.hourlyWage) : "",
    monthlyIncome: settings.monthlyIncome ? String(settings.monthlyIncome) : "",
    hoursPerWeek: String(settings.hoursPerWeek || 40),
    dailyBudget: settings.dailyBudget ? String(settings.dailyBudget) : "",
  }));
  const [errors, setErrors] = useState<SettingsFormErrors>({});

  useEffect(() => {
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const previewWage = useMemo(() => {
    return effectiveHourlyWage({
      hourlyWage: values.mode === "wage" ? Number(values.hourlyWage) || null : null,
      monthlyIncome: values.mode === "income" ? Number(values.monthlyIncome) || null : null,
      hoursPerWeek: Number(values.hoursPerWeek) || 40,
      dailyBudget: null,
    });
  }, [values]);

  function set<K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateSettings(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    updateSettings({
      hourlyWage: values.mode === "wage" ? Number(values.hourlyWage) : null,
      monthlyIncome: values.mode === "income" ? Number(values.monthlyIncome) : null,
      hoursPerWeek: Number(values.hoursPerWeek) || 40,
      dailyBudget: values.dailyBudget.trim() ? Number(values.dailyBudget) : null,
    });
    toast.success(
      previewWage ? `You're set — ${formatCurrency(previewWage)}/hour of your life.` : "Settings saved",
    );
    onClose();
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 id={titleId} className="flex items-center gap-2 text-lg font-semibold">
            <Clock3 className="h-4.5 w-4.5 text-accent" />
            The value of your time
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <p className="mb-5 text-sm text-secondary">
          Hourglass converts every expense into hours of your life, so you feel the real cost, not just the number.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-hover p-1">
            <button
              type="button"
              onClick={() => set("mode", "income")}
              className={clsx(
                "rounded-md py-1.5 text-sm font-medium transition-colors",
                values.mode === "income" ? "bg-surface text-foreground shadow-sm" : "text-secondary hover:text-foreground",
              )}
            >
              Calculate it
            </button>
            <button
              type="button"
              onClick={() => set("mode", "wage")}
              className={clsx(
                "rounded-md py-1.5 text-sm font-medium transition-colors",
                values.mode === "wage" ? "bg-surface text-foreground shadow-sm" : "text-secondary hover:text-foreground",
              )}
            >
              I know my rate
            </button>
          </div>

          {values.mode === "wage" ? (
            <Field label="Hourly rate" htmlFor="settings-wage" error={errors.hourlyWage}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                <input
                  ref={firstFieldRef}
                  id="settings-wage"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="35.00"
                  value={values.hourlyWage}
                  onChange={(e) => set("hourlyWage", e.target.value)}
                  className={fieldClasses(Boolean(errors.hourlyWage)) + " pl-6"}
                />
              </div>
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monthly income (after tax)" htmlFor="settings-income" error={errors.monthlyIncome} className="col-span-2">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    ref={firstFieldRef}
                    id="settings-income"
                    type="number"
                    inputMode="decimal"
                    step="1"
                    min="0"
                    placeholder="5200"
                    value={values.monthlyIncome}
                    onChange={(e) => set("monthlyIncome", e.target.value)}
                    className={fieldClasses(Boolean(errors.monthlyIncome)) + " pl-6"}
                  />
                </div>
              </Field>
              <Field label="Hours worked / week" htmlFor="settings-hours" error={errors.hoursPerWeek} className="col-span-2">
                <input
                  id="settings-hours"
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="1"
                  max="168"
                  value={values.hoursPerWeek}
                  onChange={(e) => set("hoursPerWeek", e.target.value)}
                  className={fieldClasses(Boolean(errors.hoursPerWeek))}
                />
              </Field>
            </div>
          )}

          {previewWage !== null && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-foreground">
              ≈ <span className="font-semibold">{formatCurrency(previewWage)}</span> per hour of your life.
            </p>
          )}

          <Field
            label="Daily budget (optional)"
            htmlFor="settings-budget"
            error={errors.dailyBudget}
            hint="Set this to unlock streaks - consecutive days you stayed at or under it."
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
              <input
                id="settings-budget"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="e.g. 40"
                value={values.dailyBudget}
                onChange={(e) => set("dailyBudget", e.target.value)}
                className={fieldClasses(Boolean(errors.dailyBudget)) + " pl-6"}
              />
            </div>
          </Field>

          <div className="mt-1 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-danger hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all data
            </button>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Clear all expenses?"
        description="Every expense you've logged in this browser will be permanently deleted. Your settings stay put."
        confirmLabel="Clear everything"
        onConfirm={() => {
          clearAllExpenses();
          setIsClearConfirmOpen(false);
          toast.success("All expenses cleared");
          onClose();
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
    </Portal>
  );
}
