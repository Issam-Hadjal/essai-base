// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import { notes } from "./schema";

// PGlite : le vrai Postgres, dans le processus du test. Ni serveur, ni réseau, ni secret.
async function baseNeuve() {
  const base = drizzle({ client: new PGlite() });
  await migrate(base, { migrationsFolder: "drizzle" });
  return base;
}

describe("la table des notes", () => {
  it("reçoit les migrations, puis garde et rend les notes", async () => {
    const base = await baseNeuve();
    await base.insert(notes).values([{ texte: "première" }, { texte: "seconde", source: "test" }]);
    const lignes = await base.select().from(notes).orderBy(desc(notes.id));
    expect(lignes.map((l) => [l.texte, l.source])).toEqual([
      ["seconde", "test"],
      ["première", null],
    ]);
    expect(lignes[0].creeLe).toBeInstanceOf(Date);
  });

  it("annule toute une transaction quand elle échoue", async () => {
    const base = await baseNeuve();
    await expect(
      base.transaction(async (tx) => {
        await tx.insert(notes).values({ texte: "écrite puis annulée" });
        tx.rollback();
      }),
    ).rejects.toThrow();
    expect(await base.select().from(notes)).toEqual([]);
  });
});
