import fs from "fs";
import path from "path";
import pug from "pug";
import chokidar from "chokidar";
import sass from "sass";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const PAGES = path.join(SRC, "pages");

const OUT = path.join(ROOT, "public");

const SASS_DIR = path.join(SRC, "sass");
const CSS_OUT_DIR = path.join(OUT, "assets", "css");

const SASS_ENTRIES = [];

/** Utils **/
function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function walkFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const out = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) out.push(...walkFiles(p));
        else out.push(p);
    }
    return out;
}

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function copyDir(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;
    ensureDir(destDir);

    for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const s = path.join(srcDir, ent.name);
        const d = path.join(destDir, ent.name);
        if (ent.isDirectory()) copyDir(s, d);
        else fs.copyFileSync(s, d);
    }
}

/** Build **/
function buildPug() {
    ensureDir(OUT);

    const siteDataPath = path.join(SRC, "data", "site.json");
    const footerDataPath = path.join(SRC, "data", "footer.json");
    const site = fs.existsSync(siteDataPath) ? loadJson(siteDataPath) : {};
    const footer = fs.existsSync(footerDataPath) ? loadJson(footerDataPath) : {};

    if (!fs.existsSync(PAGES)) return;

    const files = fs.readdirSync(PAGES).filter((f) => f.endsWith(".pug"));
    for (const file of files) {
        const inFile = path.join(PAGES, file);
        const outFile = path.join(OUT, file.replace(/\.pug$/, ".html"));

        const html = pug.renderFile(inFile, { pretty: true, site, footer });
        fs.writeFileSync(outFile, html, "utf-8");
        console.log("PUG :", path.relative(ROOT, outFile));
    }
}

function buildSass() {
    if (!fs.existsSync(SASS_DIR)) return;

    ensureDir(CSS_OUT_DIR);

    let inputs = [];
    if (SASS_ENTRIES.length) {
        inputs = SASS_ENTRIES.map((rel) => path.join(SASS_DIR, rel));
    } else {
        inputs = walkFiles(SASS_DIR).filter((f) => /\.(scss|sass)$/.test(f));
    }

    for (const inFile of inputs) {
        if (!fs.existsSync(inFile)) continue;
        if (path.basename(inFile).startsWith("_")) continue;

        const rel = path.relative(SASS_DIR, inFile);
        const outFile = path
            .join(CSS_OUT_DIR, rel)
            .replace(/\.(scss|sass)$/, ".css");

        ensureDir(path.dirname(outFile));

        const result = sass.compile(inFile, {
            style: "expanded",
            sourceMap: true,
        });

        fs.writeFileSync(outFile, result.css, "utf-8");
        if (result.sourceMap) {
            fs.writeFileSync(outFile + ".map", JSON.stringify(result.sourceMap), "utf-8");
        }

        console.log("SASS:", path.relative(ROOT, outFile));
    }
}

function copyStatic() {
    copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
    copyDir(path.join(SRC, "assets"), path.join(OUT, "assets"));
}

function buildAll() {
    buildPug();
    copyStatic();
    buildSass();
}

buildAll();
const isWatch = process.argv.includes("--watch");

if (isWatch) {
  console.log("Watching...");
  chokidar.watch([SRC], { ignoreInitial: true }).on("all", () => {
    try {
      buildAll();
    } catch (e) {
      console.error(e);
    }
  });
}