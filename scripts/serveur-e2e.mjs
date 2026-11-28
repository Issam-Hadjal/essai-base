// Le serveur des tests de bout en bout : une base PGlite neuve, avec ses migrations,
// servie sur un port le temps des tests ; puis l'application construite, sur cette base.
// Ni Neon, ni secret : la CI et ta machine lancent la même chose.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const portBase = Number(process.env.PORT_BASE ?? 5433);
const portApp = process.env.PORT_APP ?? "3000";

const base = await PGlite.create();
await migrate(drizzle({ client: base }), { migrationsFolder: "drizzle" });
const serveur = new PGLiteSocketServer({ db: base, host: "127.0.0.1", port: portBase });
await serveur.start();

const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
const app = spawn(process.execPath, [next, "start", "--port", portApp], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${portBase}/postgres`,
    // PGlite n'a qu'une connexion : l'application n'en garde qu'une.
    BASE_UNE_CONNEXION: "1",
  },
});

async function arreter(code) {
  app.kill("SIGTERM");
  await serveur.stop();
  await base.close();
  process.exit(code);
}
process.on("SIGTERM", () => arreter(0));
process.on("SIGINT", () => arreter(0));
app.on("exit", (code) => arreter(code ?? 1));
