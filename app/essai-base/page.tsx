import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";
import { db, pointDeTerminaison } from "@/lib/db";
import { notes } from "@/lib/schema";

export default function EssaiBase() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Essai de la base</h1>
      <Suspense fallback={<p className="mt-6">Lecture de la base…</p>}>
        <Notes />
      </Suspense>
    </main>
  );
}

async function ajouter(formulaire: FormData) {
  "use server";
  const texte = String(formulaire.get("texte") ?? "").trim();
  if (texte) await db().insert(notes).values({ texte });
  revalidatePath("/essai-base");
}

async function Notes() {
  await connection();
  const lignes = await db().select().from(notes).orderBy(desc(notes.id)).limit(20);
  return (
    <>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        Environnement {process.env.VERCEL_ENV ?? "local"}, branche{" "}
        {process.env.VERCEL_GIT_COMMIT_REF ?? "inconnue"}, base {pointDeTerminaison()}.
      </p>
      <form action={ajouter} className="mt-6 flex gap-2">
        <label htmlFor="texte" className="sr-only">
          Nouvelle note
        </label>
        <input id="texte" name="texte" required className="flex-1 rounded border px-2 py-1" />
        <button type="submit" className="rounded border px-3 py-1">
          Ajouter
        </button>
      </form>
      <ul className="mt-6 list-disc pl-6">
        {lignes.map((l) => (
          <li key={l.id}>{l.texte}</li>
        ))}
      </ul>
    </>
  );
}
