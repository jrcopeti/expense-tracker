import type { Category } from "@/lib/types";

/**
 * Shareable "report" links, done honestly for a client-only app: there's no
 * backend to persist a share record, so the whole payload is embedded in the
 * URL's hash fragment (never sent to a server, never logged) rather than
 * faking a link that would silently 404 for anyone else. Summary-level only
 * (totals, not individual transaction descriptions) - a link you'd actually
 * be comfortable sending someone.
 */
export interface SharePayload {
  title: string;
  from: string | null;
  to: string | null;
  count: number;
  total: number;
  byCategory: Array<{ category: Category; total: number }>;
  generatedAt: string;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeSharePayload(payload: SharePayload): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(encoded));
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    if (!("count" in parsed) || !("total" in parsed)) return null;
    return parsed as SharePayload;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/shared#${encodeSharePayload(payload)}`;
}
