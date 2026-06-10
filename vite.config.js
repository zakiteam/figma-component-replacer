import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { buildSync } from "esbuild";

function figmaPluginBuild() {
  return {
    name: "figma-plugin-build",
    enforce: "post",
    generateBundle(options, bundle) {
      const htmlFile = Object.values(bundle).find((item) => item.type === "asset" && item.fileName.endsWith(".html"));

      if (!htmlFile) {
        return;
      }

      let html = String(htmlFile.source);

      const inlineScripts = [];

      for (const item of Object.values(bundle)) {
        if (item.type === "chunk" && item.fileName.endsWith(".js")) {
          inlineScripts.push(item.code);
          html = html.replace(
            new RegExp('<script type="module" crossorigin src="/' + item.fileName + '"></script>'),
            ""
          );
          delete bundle[item.fileName];
        }

        if (item.type === "asset" && item.fileName.endsWith(".css")) {
          html = html.replace(
            new RegExp('<link rel="stylesheet" crossorigin href="/' + item.fileName + '">'),
            () => "<style>" + item.source + "</style>"
          );
          delete bundle[item.fileName];
        }
      }

      if (inlineScripts.length > 0) {
        html = html.replace(
          "</body>",
          () => "<script>" + inlineScripts.join("\n") + "</script>\n  </body>"
        );
      }

      htmlFile.source = html;
    },
    closeBundle() {
      const distDir = resolve("dist");

      if (!existsSync(distDir)) {
        mkdirSync(distDir);
      }

      buildSync({
        entryPoints: [resolve("src/figma/boot.js")],
        bundle: true,
        outfile: resolve("dist/boot.js"),
        format: "iife",
        target: "es2017"
      });
    }
  };
}

export default defineConfig({
  plugins: [vue(), figmaPluginBuild()],
  root: "src/ui",
  build: {
    outDir: "../../dist",
    emptyOutDir: true
  }
});
