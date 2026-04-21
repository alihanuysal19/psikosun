export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data.toISOString() as any;
  if (typeof data === "object") {
    const d = data as any;
    // Prisma.Decimal (decimal.js tabanlı): s, e, d özellikleri + toNumber/toString
    if (
      typeof d.toNumber === "function" &&
      typeof d.toString === "function" &&
      "s" in d &&
      "e" in d &&
      ("d" in d || "coefficient" in d)
    ) {
      return d.toString() as any;
    }
    if (Array.isArray(data)) {
      return data.map(serializePrisma) as any;
    }
    const out: any = {};
    for (const key of Object.keys(data as object)) {
      out[key] = serializePrisma((data as any)[key]);
    }
    return out;
  }
  return data;
}
