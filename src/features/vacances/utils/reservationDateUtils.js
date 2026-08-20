export function parseYmdLocal(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split("-").map((part) => Number(part));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toIsoLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function extractConfirmedRanges(data) {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.dates)
        ? data.dates
        : Array.isArray(data?.reservations)
          ? data.reservations
          : [];

  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const dateArrivee = row.dateArrivee ?? row.startDate ?? row.dateDebut ?? row.from;
      const dateDepart = row.dateDepart ?? row.endDate ?? row.dateFin ?? row.to;
      if (!dateArrivee || !dateDepart) return null;
      return { dateArrivee: String(dateArrivee), dateDepart: String(dateDepart) };
    })
    .filter(Boolean);
}

export function buildReservedDaysSet(confirmedRanges = []) {
  const out = new Set();
  confirmedRanges.forEach((range) => {
    const start = parseYmdLocal(range?.dateArrivee);
    const end = parseYmdLocal(range?.dateDepart);
    if (!start || !end) return;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor < end) {
      out.add(toIsoLocal(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return out;
}

export function buildMonthCells(offset = 0) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const firstWeekDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return { first, cells };
}
