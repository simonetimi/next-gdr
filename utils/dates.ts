export function formatTimeHoursMinutes(date: Date | string, locale: string) {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(date: Date | string, locale: string) {
  const messageDate = new Date(date);
  const today = new Date();

  // today
  if (messageDate.toDateString() === today.toDateString()) {
    return formatTimeHoursMinutes(messageDate, locale);
  }

  // older than today
  return messageDate.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
