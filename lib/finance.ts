/**
 * Finance maths. 0% interest example — replace with the partner bank's real
 * rate/fees once [BANKA PARTNERE] confirms them (keep the signature).
 */
export const TERM_OPTIONS = [12, 24, 36, 48] as const;
export type Term = (typeof TERM_OPTIONS)[number];

export const DEPOSIT_STEPS = Array.from({ length: 11 }, (_, i) => i * 5); // 0–50%

export function monthlyPayment(price: number, depositPct: number, months: number): number {
  const financed = price - (price * depositPct) / 100;
  return financed / months;
}

/** "ose €X/muaj" shown on model cards: 20% deposit over 36 months. */
export function fromMonthly(price: number): number {
  return monthlyPayment(price, 20, 36);
}
