"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _pug = _interopRequireDefault(require("pug"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _sass = _interopRequireDefault(require("sass"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var ROOT = process.cwd();

var SRC = _path["default"].join(ROOT, "src");

var PAGES = _path["default"].join(SRC, "pages");

var OUT = _path["default"].join(ROOT, "public");

var SASS_DIR = _path["default"].join(SRC, "sass");

var CSS_OUT_DIR = _path["default"].join(OUT, "assets", "css");

var SASS_ENTRIES = [];
/** Utils **/

function loadJson(filePath) {
  return JSON.parse(_fs["default"].readFileSync(filePath, "utf-8"));
}

function walkFiles(dir) {
  if (!_fs["default"].existsSync(dir)) return [];
  var out = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _fs["default"].readdirSync(dir, {
      withFileTypes: true
    })[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var ent = _step.value;

      var p = _path["default"].join(dir, ent.name);

      if (ent.isDirectory()) out.push.apply(out, _toConsumableArray(walkFiles(p)));else out.push(p);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return out;
}

function ensureDir(dir) {
  _fs["default"].mkdirSync(dir, {
    recursive: true
  });
}

function copyDir(srcDir, destDir) {
  if (!_fs["default"].existsSync(srcDir)) return;
  ensureDir(destDir);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = _fs["default"].readdirSync(srcDir, {
      withFileTypes: true
    })[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var ent = _step2.value;

      var s = _path["default"].join(srcDir, ent.name);

      var d = _path["default"].join(destDir, ent.name);

      if (ent.isDirectory()) copyDir(s, d);else _fs["default"].copyFileSync(s, d);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}
/** Build **/


function buildPug() {
  ensureDir(OUT);

  var siteDataPath = _path["default"].join(SRC, "data", "site.json");

  var footerDataPath = _path["default"].join(SRC, "data", "footer.json");

  var site = _fs["default"].existsSync(siteDataPath) ? loadJson(siteDataPath) : {};
  var footer = _fs["default"].existsSync(footerDataPath) ? loadJson(footerDataPath) : {};
  if (!_fs["default"].existsSync(PAGES)) return;

  var files = _fs["default"].readdirSync(PAGES).filter(function (f) {
    return f.endsWith(".pug");
  });

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var file = _step3.value;

      var inFile = _path["default"].join(PAGES, file);

      var outFile = _path["default"].join(OUT, file.replace(/\.pug$/, ".html"));

      var html = _pug["default"].renderFile(inFile, {
        pretty: true,
        site: site,
        footer: footer
      });

      _fs["default"].writeFileSync(outFile, html, "utf-8");

      console.log("PUG :", _path["default"].relative(ROOT, outFile));
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

function buildSass() {
  if (!_fs["default"].existsSync(SASS_DIR)) return;
  ensureDir(CSS_OUT_DIR);
  var inputs = [];

  if (SASS_ENTRIES.length) {
    inputs = SASS_ENTRIES.map(function (rel) {
      return _path["default"].join(SASS_DIR, rel);
    });
  } else {
    inputs = walkFiles(SASS_DIR).filter(function (f) {
      return /\.(scss|sass)$/.test(f);
    });
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = inputs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var inFile = _step4.value;
      if (!_fs["default"].existsSync(inFile)) continue;
      if (_path["default"].basename(inFile).startsWith("_")) continue;

      var rel = _path["default"].relative(SASS_DIR, inFile);

      var outFile = _path["default"].join(CSS_OUT_DIR, rel).replace(/\.(scss|sass)$/, ".css");

      ensureDir(_path["default"].dirname(outFile));

      var result = _sass["default"].compile(inFile, {
        style: "expanded",
        sourceMap: true
      });

      _fs["default"].writeFileSync(outFile, result.css, "utf-8");

      if (result.sourceMap) {
        _fs["default"].writeFileSync(outFile + ".map", JSON.stringify(result.sourceMap), "utf-8");
      }

      console.log("SASS:", _path["default"].relative(ROOT, outFile));
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
}

function copyStatic() {
  copyDir(_path["default"].join(ROOT, "assets"), _path["default"].join(OUT, "assets"));
  copyDir(_path["default"].join(SRC, "assets"), _path["default"].join(OUT, "assets"));
}

function buildAll() {
  buildPug();
  copyStatic();
  buildSass();
}

buildAll();
var isWatch = process.argv.includes("--watch");

if (isWatch) {
  console.log("Watching...");

  _chokidar["default"].watch([SRC], {
    ignoreInitial: true
  }).on("all", function () {
    try {
      buildAll();
    } catch (e) {
      console.error(e);
    }
  });
}