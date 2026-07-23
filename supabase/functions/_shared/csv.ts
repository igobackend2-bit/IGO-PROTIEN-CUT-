/** Minimal, dependency-free CSV serializer — good enough for admin export
 * rows (flat objects, no nested structures) without pulling in a library. */
export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map(escape).join(",");
  const lines = rows.map((row) => columns.map((col) => escape(row[col])).join(","));
  return [header, ...lines].join("\n");
}
