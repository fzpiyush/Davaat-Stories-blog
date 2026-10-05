export const ADMIN_TIME_ZONE = "Asia/Kolkata";

// India has no daylight saving, so this offset never changes
const ADMIN_UTC_OFFSET = "+05:30";

const INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const partsFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: ADMIN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/* Turns a saved date into the value a datetime-local input expects, in IST */
export function toAdminInputValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  const parts = Object.fromEntries(
    partsFormat.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/* Reads a datetime-local value as IST and returns the real moment */
export function parseAdminInputValue(value: string): Date | null {
  if (!INPUT_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(`${value}:00${ADMIN_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}