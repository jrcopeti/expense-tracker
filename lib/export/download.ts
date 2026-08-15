/** Every format funnels through this one function - a single, tested download code path. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Strips characters that are illegal (or awkward) in filenames on Windows/macOS/Linux alike. */
export function sanitizeFilename(name: string): string {
  const cleaned = name.trim().replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "-");
  return cleaned || "export";
}
