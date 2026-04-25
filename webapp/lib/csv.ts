import Papa from "papaparse";
import type { DevpostRow } from "./types";

export function parseDevpostCsv(csvText: string): DevpostRow[] {
  const result = Papa.parse<DevpostRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors.length) {
    const first = result.errors[0];
    if (first.type === "FieldMismatch") {
      // tolerate field-mismatch rows; Devpost exports have ragged trailing cols
    } else {
      throw new Error(`CSV parse error: ${first.message}`);
    }
  }
  return result.data;
}
