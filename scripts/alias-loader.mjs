// Lets plain Node (with its built-in TypeScript support) run project files that import "@/…".
// Used only by scripts/generate-seed.mts:  node --import ./scripts/alias-loader.mjs scripts/generate-seed.mts
import { existsSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

register(
  "data:text/javascript," +
    encodeURIComponent(`
      import { existsSync } from "node:fs";
      import { fileURLToPath, pathToFileURL } from "node:url";
      const root = ${JSON.stringify(root)};
      const candidates = (base) => [base, base + ".ts", base + ".tsx", base + "/index.ts"];
      export async function resolve(specifier, context, next) {
        let base = null;
        if (specifier.startsWith("@/")) base = root + specifier.slice(2);
        else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:") && !/\\.[cm]?[jt]sx?$/.test(specifier)) {
          base = fileURLToPath(new URL(specifier, context.parentURL));
        }
        if (base) {
          const hit = candidates(base).find((p) => existsSync(p) && !p.endsWith("/"));
          if (hit) return next(pathToFileURL(hit).href, context);
        }
        return next(specifier, context);
      }
    `),
);

// Fail early with a clear message if run from the wrong place.
if (!existsSync(root + "data/models.ts")) throw new Error(`alias-loader: project root not found at ${pathToFileURL(root).href}`);
