import { buildSync } from "esbuild";

buildSync({
    entryPoints: ["src/game.ts"],
    bundle: true,
    minify: true,
    treeShaking: true,
    outfile: "dist/bundle.js"
});