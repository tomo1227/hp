const JST_TIMEZONE = "Asia/Tokyo";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
type DateInput = string | number | Date | null | undefined;

const parseNumberish = (value: string | undefined, fallback = 0) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const parseDateAsJst = (date: DateInput): Date => {
  if (date instanceof Date) {
    return new Date(date.getTime());
  }

  if (typeof date === "number") {
    return new Date(date);
  }

  if (typeof date !== "string") {
    return new Date(Number.NaN);
  }

  const normalizedDate = date.trim();
  if (!normalizedDate) {
    return new Date(Number.NaN);
  }

  const normalizedIso = normalizedDate.replace(" ", "T");
  const jstLikeDatePattern =
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2})(?::?(\d{2}))?(?::?(\d{2}))?(?:\.(\d{1,3}))?)?(?:Z|[+-]\d{2}:?\d{2})?$/;
  const match = normalizedIso.match(jstLikeDatePattern);

  // Treat date values as JST wall-clock values, even when they include Z/offset.
  if (match) {
    const [, year, month, day, hour, minute, second, milliSecond] = match;
    const milliseconds = parseNumberish(milliSecond?.padEnd(3, "0"));
    const utcTime = Date.UTC(
      parseNumberish(year),
      parseNumberish(month) - 1,
      parseNumberish(day),
      parseNumberish(hour),
      parseNumberish(minute),
      parseNumberish(second),
      milliseconds,
    );
    return new Date(utcTime - JST_OFFSET_MS);
  }

  return new Date(normalizedDate);
};

export const getJstTimestamp = (date: DateInput): number => {
  return parseDateAsJst(date).getTime();
};

export const toFrontmatterDateTime = (date: DateInput = new Date()): string => {
  const parsedDate = parseDateAsJst(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(parsedDate);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!year || !month || !day || !hour || !minute) {
    return "";
  }

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const getJstYear = (date: DateInput): number => {
  const parsedDate = parseDateAsJst(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return Number.NaN;
  }

  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: JST_TIMEZONE,
      year: "numeric",
    }).format(parsedDate),
  );
};

export const formattedDate = (date: DateInput) => {
  return parseDateAsJst(date).toLocaleDateString("ja-JP", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formattedDateEn = (date: DateInput) => {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parseDateAsJst(date));

  const [month, day, year] = formatted.split("/");

  if (!month || !day || !year) {
    return "";
  }

  return `${month}/${day}/${year}`;
};

export const formattedDateWithHyphen = (date: DateInput) => {
  return parseDateAsJst(date)
    .toLocaleDateString("ja-JP", {
      timeZone: JST_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
};

export const formattedDateWithHyphenInTimezone = (
  date: DateInput,
  timeZone: string,
) => {
  const parsedDate = parseDateAsJst(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsedDate);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
};
