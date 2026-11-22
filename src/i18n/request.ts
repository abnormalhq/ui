import { getRequestConfig } from "next-intl/server";
import { isLocale } from "./locales";

export default getRequestConfig(async ({ locale: overrideLocale, requestLocale }) => {
  const requestedLocale = overrideLocale ?? (await requestLocale);
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  const messages =
    locale === "zh-CN" ? (await import("./messages/zh-CN.json")).default : (await import("./messages/en.json")).default;

  return { locale, messages, timeZone: "UTC" };
});
