import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function creer() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manque : aucune base n'est branchée sur cet environnement.");
  const pool = new Pool({
    connectionString: url,
    // PGlite, la base des tests de bout en bout, n'a qu'une connexion.
    max: process.env.BASE_UNE_CONNEXION === "1" ? 1 : 10,
    // Une connexion inactive se ferme vite : une fonction de Vercel peut se mettre en veille.
    idleTimeoutMillis: 5_000,
  });
  // Sur Vercel, ferme les connexions inactives avant la mise en veille ; ailleurs, sans effet.
  attachDatabasePool(pool);
  return drizzle({ client: pool, schema });
}

let client: ReturnType<typeof creer> | undefined;

// Le client est créé à la première requête : le build n'a pas besoin de la base.
export function db() {
  client ??= creer();
  return client;
}

// Le point de terminaison Neon (ep-…) de cet environnement : il montre quelle copie
// de la base sert la page, sans rien révéler du mot de passe.
export function pointDeTerminaison(): string {
  const url = process.env.DATABASE_URL;
  return url ? new URL(url).hostname.split(".")[0] : "aucune base";
}
