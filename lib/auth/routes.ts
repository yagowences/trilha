/** Rotas alcançáveis sem sessão. Todo o resto é protegido por padrão. */
export const PUBLIC_ROUTES = ["/login", "/signup", "/auth"] as const;

/**
 * Uma rota só é pública se bater exatamente ou for filha direta de um prefixo
 * público. Comparar com `startsWith` puro deixaria `/loginfalso` passar.
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Destino pós-login vindo de `?next=`.
 *
 * O parâmetro é entrada não confiável: sem esta checagem, `?next=//evil.com`
 * viraria um open redirect que empresta a credibilidade do nosso domínio a um
 * phishing. Só caminho interno passa.
 */
export function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/")) return "/";
  // `//host` e `/\host` são tratados como URL absoluta pelos browsers.
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
