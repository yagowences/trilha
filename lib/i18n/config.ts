/**
 * Produto trilíngue (decisão da revisão de protótipo, ver AGENTS.md).
 *
 * O idioma NÃO aparece na URL: `/login` é `/login` nos três idiomas. A escolha
 * vive em `profiles.locale` e é espelhada no cookie abaixo, para não custar uma
 * query ao banco a cada render de página.
 */

export const LOCALES = ["pt", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** Idioma do produto original — a spec inteira foi escrita em PT-BR. */
export const DEFAULT_LOCALE: Locale = "pt";

/**
 * Nome fixado pelo next-intl. Manter este valor faz o `setRequestLocale` e o
 * cache de rota do Next enxergarem o mesmo cookie que a gente escreve.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

/**
 * Melhor idioma a partir de um header `Accept-Language`.
 *
 * Usado só para quem ainda não tem preferência salva (visita anônima do login).
 * Depois do primeiro login, `profiles.locale` manda e este caminho não roda.
 *
 * Casa por idioma-base de propósito: `pt-BR`, `pt-PT` e `pt` são todos `pt`
 * para nós — o produto não tem variantes regionais.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);

      // `q` ausente vale 1 (RFC 9110). `q` ilegível não deve promover o item
      // a preferido — cai para 0 e só entra se nada melhor existir.
      const quality = q === undefined ? 1 : Number.parseFloat(q);

      return {
        base: tag.toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    // `q=0` significa "explicitamente recusado", não "última opção".
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  const match = ranked.find((entry) => isLocale(entry.base));
  return match && isLocale(match.base) ? match.base : DEFAULT_LOCALE;
}
