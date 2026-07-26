import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/i18n/config";
import en from "./en.json";
import es from "./es.json";
import pt from "./pt.json";

const CATALOGS: Record<string, unknown> = { pt, en, es };

/** Achata `{a: {b: "x"}}` em `["a.b"]` para comparar formatos, não conteúdo. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];

  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

/** Placeholders ICU (`{email}`) presentes numa string. */
function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

function leaves(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  if (typeof value !== "object" || value === null) return [];

  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("catálogos de tradução", () => {
  it("cobre exatamente os idiomas declarados em LOCALES", () => {
    expect(Object.keys(CATALOGS).sort()).toEqual([...LOCALES].sort());
  });

  // Uma chave que existe só em pt.json vira crash em runtime para quem está em
  // espanhol — e só no dia em que alguém abre aquela tela naquele idioma.
  const reference = keyPaths(pt).sort();

  for (const locale of LOCALES.filter((l) => l !== "pt")) {
    it(`${locale}.json tem as mesmas chaves de pt.json`, () => {
      expect(keyPaths(CATALOGS[locale]).sort()).toEqual(reference);
    });

    it(`${locale}.json usa os mesmos placeholders de pt.json`, () => {
      const base = new Map(leaves(pt));
      for (const [path, text] of leaves(CATALOGS[locale])) {
        expect(placeholders(text), `${locale}: ${path}`).toEqual(
          placeholders(base.get(path) ?? ""),
        );
      }
    });
  }

  it("não tem string vazia em nenhum idioma", () => {
    for (const locale of LOCALES) {
      for (const [path, text] of leaves(CATALOGS[locale])) {
        expect(text.trim(), `${locale}: ${path}`).not.toBe("");
      }
    }
  });
});
