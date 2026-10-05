const SITE_TIME_ZONE = "Asia/Kolkata";

const labelFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: SITE_TIME_ZONE,
});

// en-CA formats dates as YYYY-MM-DD, which is what the time tag wants
const isoFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: SITE_TIME_ZONE,
});

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { label: value, iso: undefined };
  }

  return {
    label: labelFormat.format(date),
    iso: isoFormat.format(date),
  };
}
