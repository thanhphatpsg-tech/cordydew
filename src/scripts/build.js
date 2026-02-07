import fs from "fs";
import path from "path";
import pug from "pug";
import chokidar from "chokidar";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const PAGES = path.join(SRC, "pages");

const OUT = ROOT;

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function buildAll() {
  const siteDataPath = path.join(SRC, "data", "site.json");
  const site = fs.existsSync(siteDataPath) ? loadJson(siteDataPath) : {};

  const files = fs.readdirSync(PAGES).filter(f => f.endsWith(".pug"));
  for (const file of files) {
    const inFile = path.join(PAGES, file);
    const outFile = path.join(OUT, file.replace(/\.pug$/, ".html"));

    const html = pug.renderFile(inFile, { pretty: true, site });
    fs.writeFileSync(outFile, html, "utf-8");
    console.log("Built:", path.relative(ROOT, outFile));
  }
}

const isWatch = process.argv.includes("--watch");
buildAll();

if (isWatch) {
  console.log("Watching...");
  chokidar.watch([SRC], { ignoreInitial: true }).on("all", () => {
    try { buildAll(); } catch (e) { console.error(e); }
  });
}
