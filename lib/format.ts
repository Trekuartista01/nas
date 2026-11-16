/** €3.990 — de-DE grouping, written by hand so server and client always match. */
export function eur(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}€${digits}`;
}

/** €2,45 — two decimals with a comma, for the per-day figure. */
export function eurCents(n: number): string {
  const [int, dec] = n.toFixed(2).split(".");
  return `${eur(Number(int))},${dec}`;
}

const MONTHS_SQ = [
  "Janar",
  "Shkurt",
  "Mars",
  "Prill",
  "Maj",
  "Qershor",
  "Korrik",
  "Gusht",
  "Shtator",
  "Tetor",
  "Nëntor",
  "Dhjetor",
];

export function monthYearSq(date: Date): string {
  return `${MONTHS_SQ[date.getMonth()]} ${date.getFullYear()}`;
}
