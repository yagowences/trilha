import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Fase 0, requisito 6 — proteção de rotas.
 *
 * No Next 16 este arquivo se chama `proxy.ts`; até o 15 era `middleware.ts`.
 * É só o nome da convenção que mudou, o papel é o mesmo que a SPEC descreve.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Tudo, menos estáticos e imagens. A lista de rotas *públicas* vive em
     * lib/auth/routes.ts — assim o padrão aqui é sempre proteger, e liberar
     * uma rota exige uma edição deliberada e visível.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
