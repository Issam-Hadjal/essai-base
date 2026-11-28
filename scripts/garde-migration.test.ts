// @vitest-environment node
import { describe, expect, it } from "vitest";
import { decider } from "./garde-migration.mjs";

const base = "postgresql://u:secret@ep-essai-123.eu-central-1.aws.neon.tech/neondb?sslmode=require";

describe("la garde des migrations", () => {
  it("laisse migrer la production et la préversion de dev", () => {
    for (const [VERCEL_ENV, VERCEL_GIT_COMMIT_REF] of [
      ["production", "production"],
      ["preview", "dev"],
    ]) {
      const d = decider({ VERCEL_ENV, VERCEL_GIT_COMMIT_REF, DATABASE_URL_UNPOOLED: base });
      expect(d.permis).toBe(true);
      expect(d.lignes[0]).toContain("base ep-essai-123");
    }
  });

  it("arrête les autres builds, main compris", () => {
    for (const [VERCEL_ENV, VERCEL_GIT_COMMIT_REF] of [
      ["preview", "main"],
      ["preview", "feat/1-essai"],
      ["development", "dev"],
      [undefined, undefined],
    ]) {
      const d = decider({ VERCEL_ENV, VERCEL_GIT_COMMIT_REF, DATABASE_URL: base });
      expect(d.permis).toBe(false);
      expect(d.motif).toMatch(/^ARRÊT : ce build/);
    }
  });

  it("arrête une production sans base, avec la marche à suivre", () => {
    const d = decider({ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "production" });
    expect(d.permis).toBe(false);
    expect(d.motif).toContain("aucune base n'est branchée sur production");
  });

  it("ne montre que le nom des variables, jamais leur valeur", () => {
    const d = decider({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "dev", DATABASE_URL: base, PGPASSWORD: "secret" });
    expect(d.lignes.join("\n")).not.toContain("secret");
    expect(d.lignes[1]).toBe("garde : variables de base présentes : DATABASE_URL, PGPASSWORD.");
  });
});
