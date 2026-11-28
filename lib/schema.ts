import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Essai 28b : une table, le temps de vérifier Neon, les copies de préversion et les
// migrations au build. Le kit définitif viendra après l'essai.
export const notes = pgTable("notes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  texte: text().notNull(),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  // Séance 2 : une colonne ajoutée sans valeur obligatoire, que l'ancienne version ignore.
  source: text(),
});
