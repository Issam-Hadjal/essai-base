// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import { notes } from "./schema";

// PGlite : le vrai Postgres, dans le processus du test. Ni serveur, ni réseau, ni secret.
describe("la table des notes", () => {
  it("reçoit les migrations, puis garde et rend les notes", async () => {
    const base = drizzle({ client: new PGlite() });
    await migrate(base, { migrationsFolder: "drizzle" });
    await base.insert(notes).values([{ texte: "première" }, { texte: "seconde" }]);
    const lignes = await base.select().from(notes).orderBy(desc(notes.id));
    expect(lignes.map((l) => l.texte)).toEqual(["seconde", "première"]);
    expect(lignes[0].creeLe).toBeInstanceOf(Date);
  });
});
