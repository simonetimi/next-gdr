import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // default locale
  const locale = "it";

  // provide here any custom logic to fetch a different locale (eg. user settings)

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
