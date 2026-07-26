import { getRequestConfig } from "next-intl/server";

import { getLocale } from "./locale";

/**
 * Sem segmento `[locale]` na URL, o next-intl não tem de onde deduzir o idioma
 * sozinho — quem resolve é o `getLocale()` daqui (cookie → Accept-Language).
 */
export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
