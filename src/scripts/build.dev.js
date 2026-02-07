import fs from "fs";
import path from "path";
import pug from "pug";
import chokidar from "chokidar";
import sass from "sass";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const PAGES = path.join(SRC, "pages");

const OUT = ROOT;

// Input/Output cho SASS
const SASS_DIR = path.join(SRC, "sass");
const CSS_OUT_DIR = path.join(ROOT, "assets", "css");

// Nếu bạn muốn “xuất vài file thôi” thì liệt kê ở đây (tương đối so với src/sass)
// Ví dụ: ["global.scss", "about-cordydew.scss"]
const SASS_ENTRIES = []; // để [] = build tất cả file .scss/.sass không bắt đầu bằng "_"

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

function buildPug() {
  const siteDataPath = path.join(SRC, "data", "site.json");
  const site = fs.existsSync(siteDataPath) ? loadJson(siteDataPath) : {};

  const files = fs.readdirSync(PAGES).filter((f) => f.endsWith(".pug"));
  for (const file of files) {
    const inFile = path.join(PAGES, file);
    const outFile = path.join(OUT, file.replace(/\.pug$/, ".html"));

    const html = pug.renderFile(inFile, { pretty: true, site });
    fs.writeFileSync(outFile, html, "utf-8");
    console.log("Built:", path.relative(ROOT, outFile));
  }
}

function buildSass() {
  if (!fs.existsSync(SASS_DIR)) return;

  fs.mkdirSync(CSS_OUT_DIR, { recursive: true });

  let inputs = [];

  if (Array.isArray(SASS_ENTRIES) && SASS_ENTRIES.length > 0) {
    inputs = SASS_ENTRIES.map((rel) => path.join(SASS_DIR, rel));
  } else {
    inputs = walkFiles(SASS_DIR).filter((f) => /\.(scss|sass)$/.test(f));
  }

  for (const inFile of inputs) {
    if (!fs.existsSync(inFile)) continue;

    // Bỏ qua partials kiểu _variables.scss
    if (path.basename(inFile).startsWith("_")) continue;

    const rel = path.relative(SASS_DIR, inFile);
    const outFile = path
      .join(CSS_OUT_DIR, rel)
      .replace(/\.(scss|sass)$/, ".css");

    fs.mkdirSync(path.dirname(outFile), { recursive: true });

    const result = sass.compile(inFile, {
      style: "expanded",
      sourceMap: true,
      // Nếu bạn dùng @import cũ và muốn includePaths:
      // loadPaths: [SASS_DIR],
    });

    fs.writeFileSync(outFile, result.css, "utf-8");
    if (result.sourceMap) {
      fs.writeFileSync(outFile + ".map", JSON.stringify(result.sourceMap), "utf-8");
    }

    console.log("SASS:", path.relative(ROOT, outFile));
  }
}

function buildAll() {
  buildPug();
  buildSass();
}

buildAll();



/** Dev Watch **/
function startWatch() {
  const watchTargets = [
    path.join(SRC),
    path.join(ROOT, "assets"),
  ];

  console.log("Watching:");
  for (const t of watchTargets) console.log(" -", path.relative(ROOT, t));

  let timer = null;
  const debounceMs = 80;

  chokidar
    .watch(watchTargets, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    })
    .on("all", (event, filePath) => {
      // Debounce để tránh rebuild liên tục khi save nhiều file
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("Changed:", path.relative(ROOT, filePath));
        try {
          buildAll();
        } catch (e) {
          console.error(e);
        }
      }, debounceMs);
    });
}
startWatch();
