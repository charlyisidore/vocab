import { describe, expect, it } from 'vitest';
import { dateISOString, todayISOString } from './date';

describe('date library', () => {
  it('formats a date', async () => {
    const date = new Date(1970, 0, 1);
    const formatted = dateISOString(date);
    expect(formatted).toBe('1970-01-01');
  });

  it('gets the date of today', async () => {
    // This test should always succeed, except at midnight
    const now = new Date();
    const formatted = dateISOString(now);
    const today = todayISOString();
    expect(today).toBe(formatted);
  });
});
