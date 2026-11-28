// La garde des migrations, au début du build de Vercel (essai 28b, séance 2). Elle écrit
// au journal du build ce qu'il voit, puis arrête tout build qui n'a pas de base à lui :
// seules la production et la préversion de dev migrent.
import { pathToFileURL } from "node:url";

export function decider(env) {
  const environnement = env.VERCEL_ENV ?? "inconnu";
  const branche = env.VERCEL_GIT_COMMIT_REF ?? "inconnue";
  const url = env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL;
  let base = "aucune";
  if (url) {
    try {
      base = new URL(url).hostname.split(".")[0];
    } catch {
      base = "illisible";
    }
  }
  const noms = Object.keys(env)
    .filter((n) => /^(PG|POSTGRES|DATABASE|NEON)/.test(n))
    .sort();
  const lignes = [
    `garde : environnement ${environnement}, branche ${branche}, base ${base}.`,
    `garde : variables de base présentes : ${noms.join(", ") || "aucune"}.`,
  ];
  const permis = environnement === "production" || (environnement === "preview" && branche === "dev");
  if (permis === false) {
    return {
      permis,
      lignes,
      motif: `ARRÊT : ce build (environnement ${environnement}, branche ${branche}) n'a pas de base à lui : pas de migration, pas de déploiement.`,
    };
  }
  if (url === undefined) {
    return {
      permis: false,
      lignes,
      motif: `ARRÊT : aucune base n'est branchée sur ${environnement} : branche la base Neon, puis relance le déploiement.`,
    };
  }
  return { permis, lignes, motif: `garde : migration permise (environnement ${environnement}, branche ${branche}).` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { permis, lignes, motif } = decider(process.env);
  for (const ligne of lignes) console.log(ligne);
  if (permis) {
    console.log(motif);
  } else {
    console.error(motif);
    process.exit(1);
  }
}
