// Essai 28b : la garde des migrations. Neon ne donne une copie de la base qu'à la
// préversion de dev ; celle de main tournait sur la base de production (27/11/2026).
// La production migre sa base, la préversion de dev migre sa copie ; tout autre build
// s'arrête ici, avant la moindre migration.
const env = process.env.VERCEL_ENV;
const branche = process.env.VERCEL_GIT_COMMIT_REF;
const permis = env === "production" || (env === "preview" && branche === "dev");
if (permis) {
  console.log(`essai 28b : migration permise (environnement ${env}, branche ${branche}).`);
} else {
  console.error(
    `ARRÊT : ce build (environnement ${env ?? "inconnu"}, branche ${branche ?? "inconnue"}) n'a pas de base à lui : pas de migration, pas de déploiement.`,
  );
  process.exit(1);
}
