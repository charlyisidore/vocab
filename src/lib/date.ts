/**
 * Format a date as a date-only ISO string (`yyyy-mm-dd`).
 *
 * @returns Formatted date.
 */
export function dateISOString(date: Date): string {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the date of today in ISO format (`yyyy-mm-dd`).
 *
 * @returns Today's date in ISO format.
 */
export function todayISOString(): string {
  return dateISOString(new Date());
}
