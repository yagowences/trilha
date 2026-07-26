import { describe, expect, it } from "vitest";

import { isPublicRoute, safeNext } from "./routes";

describe("isPublicRoute", () => {
  it("libera as rotas de entrada e suas filhas", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/signup")).toBe(true);
    expect(isPublicRoute("/signup/confirme")).toBe(true);
    expect(isPublicRoute("/auth/confirm")).toBe(true);
  });

  it("protege todo o resto por padrão", () => {
    expect(isPublicRoute("/")).toBe(false);
    expect(isPublicRoute("/cockpit")).toBe(false);
    expect(isPublicRoute("/metas/123")).toBe(false);
  });

  it("não deixa um prefixo parecido se passar por rota pública", () => {
    expect(isPublicRoute("/loginfalso")).toBe(false);
    expect(isPublicRoute("/authenticate")).toBe(false);
  });
});

describe("safeNext", () => {
  it("preserva caminho interno", () => {
    expect(safeNext("/cockpit")).toBe("/cockpit");
    expect(safeNext("/metas/123?aba=fase")).toBe("/metas/123?aba=fase");
  });

  it("recusa destino externo", () => {
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
  });

  it("cai para a raiz quando não há destino utilizável", () => {
    expect(safeNext(null)).toBe("/");
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext("")).toBe("/");
    expect(safeNext(42)).toBe("/");
  });
});
