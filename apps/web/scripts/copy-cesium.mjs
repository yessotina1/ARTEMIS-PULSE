// Copie les assets statiques de Cesium dans public/cesium (sans token Cesium ion).
// Idempotent : ne recopie pas si le dossier est déjà présent.
import { cp, mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = join(root, "node_modules", "cesium", "Build", "Cesium");
const target = join(root, "public", "cesium");
const directories = ["Workers", "ThirdParty", "Assets", "Widgets"];

try {
  await access(join(target, "Workers"));
  console.log("[cesium] assets déjà présents dans public/cesium");
} catch {
  await mkdir(target, { recursive: true });
  for (const directory of directories) {
    await cp(join(source, directory), join(target, directory), { recursive: true });
    console.log(`[cesium] ${directory} copié`);
  }
}
