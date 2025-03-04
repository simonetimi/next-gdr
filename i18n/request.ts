import { getRequestConfig } from "next-intl/server";
import { GameConfig } from "@/utils/config/GameConfig";

export default getRequestConfig(async () => {
  // default locale
  const defaultLocale = "it-IT";

  // read config
  const locale = GameConfig.getLocale();

  return {
    locale,
    messages: (await import(`@/messages/${locale ?? defaultLocale}.json`))
      .default,
  };
});
