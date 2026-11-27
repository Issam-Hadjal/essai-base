// Essai 28b : dit, dans le journal du build, quelle base ce build va migrer.
// Aucun secret : les noms des variables de base, et le point de terminaison Neon (ep-…).
const noms = Object.keys(process.env)
  .filter((nom) => /^(PG|POSTGRES|DATABASE|NEON)/.test(nom))
  .sort();
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const base = url ? new URL(url).hostname.split(".")[0] : "aucune";
console.log(
  `essai 28b : environnement ${process.env.VERCEL_ENV ?? "?"}, branche ${process.env.VERCEL_GIT_COMMIT_REF ?? "?"}, base du build ${base}`,
);
console.log(`essai 28b : variables de base présentes : ${noms.join(", ") || "aucune"}`);
