/**
 * Converts a datetime-local wall-clock value to an ISO timestamp using the
 * browser's UTC offset (Date#getTimezoneOffset: UTC minus local time).
 */
export function parseDateTimeLocal(value: string, timezoneOffsetMinutes: number): string | null {
  if (!value) return null;
  if (!Number.isInteger(timezoneOffsetMinutes) || timezoneOffsetMinutes < -840 || timezoneOffsetMinutes > 840) return null;
  if (!/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(value)) return null;

  const utcMilliseconds = Date.parse(`${value}:00.000Z`);
  if (!Number.isFinite(utcMilliseconds) || new Date(utcMilliseconds).toISOString().slice(0, 16) !== value) return null;
  return new Date(utcMilliseconds + timezoneOffsetMinutes * 60_000).toISOString();
}
