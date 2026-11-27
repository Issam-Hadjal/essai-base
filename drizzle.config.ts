import { defineConfig } from "drizzle-kit";

// drizzle-kit generate écrit les migrations sans base. drizzle-kit migrate les applique
// au build de Vercel, par l'adresse directe de la base de l'environnement.
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
