// Ganjil runs in the later half of the year, so it sorts after Genap within a year.
// (year, semester) is unique per schema.ts, so this key is a total order.
export function periodOrder(p: { year: string; semester: number }) {
  return Number(p.year) * 2 + (p.semester === 1 ? 1 : 0);
}
