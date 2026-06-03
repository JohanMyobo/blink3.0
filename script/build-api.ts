import { build } from "esbuild";

build({
  entryPoints: ["api/_source.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "api/index.js",
  packages: "external",
  logLevel: "info",
}).catch((e) => { console.error(e); process.exit(1); });
