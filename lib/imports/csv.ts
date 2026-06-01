import Papa from "papaparse";

export function parseCsvRows(text: string) {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (parsed.errors.length) {
    const first = parsed.errors[0];
    throw new Error(`CSV parse error on row ${first.row ?? "unknown"}: ${first.message}`);
  }

  return parsed.data;
}

export function required(value: unknown, field: string) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`Missing required field: ${field}`);
  return text;
}

export function numberField(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid number for ${field}`);
  return number;
}

export function optionalNumberField(value: unknown) {
  if (value === undefined || value === null || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

export function isoDate(value: unknown, field: string) {
  const text = required(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date for ${field}`);
  return date.toISOString();
}

export function importId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
