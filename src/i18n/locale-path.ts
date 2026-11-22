import type { Locale } from "./locales";

const unlocalizedRoots = ["/r", "/source", "/md", "/api", "/trpc", "/_next", "/fonts"];

function isUnlocalizedPath(pathname: string) {
  return unlocalizedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

export function localePath(locale: Locale, pathname: string) {
  if (!pathname.startsWith("/") || isUnlocalizedPath(pathname)) return pathname;
  const unprefixed = pathname === "/zh" ? "/" : pathname.startsWith("/zh/") ? pathname.slice(3) : pathname;
  if (locale === "en") return unprefixed;
  return unprefixed === "/" ? "/zh" : `/zh${unprefixed}`;
}

export function localeHref(locale: Locale, href: string) {
  if (href.startsWith("#") || href.startsWith("?") || href.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return href;
  }

  const suffixIndex = href.search(/[?#]/);
  const pathname = suffixIndex < 0 ? href : href.slice(0, suffixIndex);
  if (!pathname) return href;
  return `${localePath(locale, pathname)}${suffixIndex < 0 ? "" : href.slice(suffixIndex)}`;
}

export function localeSwitchHref(locale: Locale, pathname: string, search: string, hash: string) {
  return `${localePath(locale, pathname)}${search}${hash}`;
}
