export function toNumberSafe(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === "object" && v !== null) {
    const s = typeof (v as any).toString === "function" ? (v as any).toString() : "";
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatMoney(v: unknown, currency = "₺"): string {
  const n = toNumberSafe(v);
  return `${n.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}
