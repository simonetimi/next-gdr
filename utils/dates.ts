export function formatTimeHoursMinutes(date: Date, locale: string) {
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string, locale: string) {
  const parsedDate = new Date(date);

  const formattedTime = formatTimeHoursMinutes(parsedDate, locale);
  const formattedDate = formatDate(parsedDate, locale);

  const today = new Date();

  return {
    formattedDate,
    formattedTime,
    isToday: parsedDate.toDateString() === today.toDateString(),
  };
}
