export function formatTimeHoursMinutes(date: Date | string, locale: string) {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(
  date: Date | string,
  locale: string,
  showDateForToday = false,
) {
  const messageDate = new Date(date);

  if (!showDateForToday) {
    // if today only returns time
    const today = new Date();
    if (messageDate.toDateString() === today.toDateString()) {
      return formatTimeHoursMinutes(messageDate, locale);
    }
  }

  // else returns date time
  return messageDate.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
