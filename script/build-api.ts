import { build } from "esbuild";

await build({
  entryPoints: ["api/_source.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "api/index.js",
  packages: "external",
  logLevel: "info",
});
