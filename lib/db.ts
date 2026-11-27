import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function creer() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manque : aucune base n'est branchée sur cet environnement.");
  return drizzle({ client: neon(url), schema });
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
