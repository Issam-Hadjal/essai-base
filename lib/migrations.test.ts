// @vitest-environment node
import { readFileSync } from "node:fs";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { describe, expect, it } from "vitest";
import * as schema from "./schema";

// Chaque changement de lib/schema.ts a sa migration dans drizzle/ : sinon, ce test
// échoue, et npm run db:generate l'écrit. Aucune base n'est nécessaire.
describe("les migrations", () => {
  it("couvrent tout le schéma", async () => {
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
    const derniere = journal.entries.at(-1);
    const precedent = derniere
      ? JSON.parse(readFileSync(`drizzle/meta/${String(derniere.idx).padStart(4, "0")}_snapshot.json`, "utf8"))
      : generateDrizzleJson({});
    const manquant = await generateMigration(precedent, generateDrizzleJson(schema, precedent.id));
    expect(manquant, "migration manquante : lance npm run db:generate").toEqual([]);
  });
});
