import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

// The page of the base test, on the fresh PGlite database of the run. Tests share
// that database and run in parallel: each one writes notes of its own.
test("a note is written in a transaction, a cancelled one leaves no trace", async ({ page }) => {
  const marque = randomUUID().slice(0, 8);
  await page.goto("/essai-base");
  const champ = page.getByLabel("Nouvelle note");
  await champ.fill(`note ${marque}`);
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText(`note ${marque} (transaction)`)).toBeVisible();

  await champ.fill(`annuler ${marque}`);
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(champ).toHaveValue("");
  await page.reload();
  await expect(page.getByText(`note ${marque} (transaction)`)).toBeVisible();
  await expect(page.getByText(`annuler ${marque}`)).toHaveCount(0);
});
