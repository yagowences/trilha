import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  negotiateLocale,
  type Locale,
} from "./config";

/**
 * Idioma da requisição atual, em ordem de precedência:
 *
 *   1. cookie `NEXT_LOCALE` — espelho de `profiles.locale`, escrito no login
 *      e em Configurações;
 *   2. `Accept-Language` — só para quem ainda não tem preferência salva;
 *   3. `pt`.
 *
 * O cookie existe para não pagar uma ida ao banco por render. A fonte de
 * verdade continua sendo `profiles.locale`: se os dois divergirem (login em
 * outro dispositivo), o próximo login reescreve o cookie.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return negotiateLocale(headerStore.get("accept-language"));
}

/**
 * Fixa o idioma da pessoa no cookie após o login.
 *
 * `httpOnly: false` de propósito: é preferência de UI, não credencial, e o
 * client precisa ler para trocar de idioma sem round-trip.
 */
export async function persistLocale(locale: Locale = DEFAULT_LOCALE) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
}
