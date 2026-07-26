import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, negotiateLocale } from "./config";

describe("isLocale", () => {
  it("aceita os três idiomas do produto", () => {
    expect(isLocale("pt")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
  });

  it("recusa qualquer outra coisa", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("pt-BR")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});

describe("negotiateLocale", () => {
  it("cai no padrão sem header", () => {
    expect(negotiateLocale(null)).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale("")).toBe(DEFAULT_LOCALE);
  });

  it("reduz variante regional ao idioma base", () => {
    expect(negotiateLocale("pt-BR")).toBe("pt");
    expect(negotiateLocale("es-419")).toBe("es");
    expect(negotiateLocale("EN-GB")).toBe("en");
  });

  it("respeita a ordem de qualidade, não a de escrita", () => {
    expect(negotiateLocale("en;q=0.3, es;q=0.9")).toBe("es");
    // Sem `q`, vale 1 — então `en` ganha do `es;q=0.8` que veio antes.
    expect(negotiateLocale("es;q=0.8, en")).toBe("en");
  });

  it("ignora idiomas que não falamos", () => {
    expect(negotiateLocale("fr-FR, de;q=0.8")).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale("fr-FR, es;q=0.2")).toBe("es");
  });

  it("trata q=0 como recusa explícita, não como última opção", () => {
    // O cliente está dizendo "en não, obrigado". Aceitar seria inverter o
    // significado do header.
    expect(negotiateLocale("en;q=0")).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale("en;q=0, es;q=0.5")).toBe("es");
  });

  it("não deixa q ilegível virar preferência máxima", () => {
    expect(negotiateLocale("en;q=abc, es;q=0.5")).toBe("es");
  });

  it("aguenta header malformado sem estourar", () => {
    expect(negotiateLocale(",,,")).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale(";q=0.5")).toBe(DEFAULT_LOCALE);
  });
});
