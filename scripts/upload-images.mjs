//   npm run images:list    → liste les images déjà en ligne
//   npm run images:upload  → envoie celles qui manquent (aucune n'est écrasée)
import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

// Les images ne sont plus dans le repo : on envoie les originaux haute définition gardés en local.
const ORIGINALS = join(homedir(), "regenel-originaux");
const SOURCE_DIRECTORIES = ["site", "diagnostic"].map((directory) => join(ORIGINALS, directory));
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

cloudinary.config({ secure: true });
// "femme alopecie-regenel.jpeg" → "femme_alopecie-regenel" (même règle que l'upload via la console)
const toPublicId = (file) =>
  basename(file, extname(file)).toLowerCase().replaceAll(" ", "_");

async function listImages(directory) {
  const files = await readdir(directory);
  return files
    .filter((file) => IMAGE_EXTENSIONS.includes(extname(file).toLowerCase()))
    .map((file) => join(directory, file));
}

async function collectSources() {
  return (await Promise.all(SOURCE_DIRECTORIES.map(listImages))).flat();
}

async function listRemote() {
  const { resources } = await cloudinary.api.resources({ max_results: 500 });
  resources.forEach(({ public_id }) => console.log(public_id));
  console.log(`\n${resources.length} image(s) en ligne.`);
}

async function upload() {
  const summary = { envoyée: 0, "déjà présente": 0, erreur: 0 };

  for (const file of await collectSources()) {
    const publicId = toPublicId(file);
    try {
      const result = await cloudinary.uploader.upload(file, {
        public_id: publicId,
        overwrite: false,
      });
      const status = result.existing ? "déjà présente" : "envoyée";
      summary[status]++;
      console.log(`${status.padEnd(14)} ${publicId}`);
    } catch (error) {
      summary.erreur++;
      console.error(`erreur         ${publicId} : ${error.message ?? error.error?.message}`);
    }
  }

  console.log("\n", summary);
}

if (!process.env.CLOUDINARY_URL) {
  console.error("CLOUDINARY_URL manquant : ajoute-le dans le fichier .env à la racine du projet.");
  process.exit(1);
}

await (process.argv.includes("--list") ? listRemote() : upload());
