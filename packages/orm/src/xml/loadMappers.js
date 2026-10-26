"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadXmlMappers = loadXmlMappers;
exports.ensureXmlMappersLoaded = ensureXmlMappersLoaded;
exports.isXmlMappersLoaded = isXmlMappersLoaded;
exports.resetXmlLoadState = resetXmlLoadState;
exports.watchXmlMappers = watchXmlMappers;
var fs_1 = require("fs");
var path_1 = require("path");
var config_1 = require("../config");
var parseMapperXml_1 = require("./parseMapperXml");
var registry_1 = require("./registry");
var loaded = false;
var watching = false;
function resolveLocation(raw) {
    var loc = String(raw !== null && raw !== void 0 ? raw : "").trim();
    if (!loc)
        throw new Error("mapperLocations 项不能为空");
    // 相对路径相对 process.cwd()（项目根）；绝对路径原样使用。支持 ** / * 通配。
    var abs = path_1.default.isAbsolute(loc) ? loc : path_1.default.resolve(process.cwd(), loc);
    // 含通配：拆成目录前缀 + glob（勿对带尾部分隔符的路径再 dirname，否则会少一层）
    var star = abs.search(/[*?]/);
    if (star < 0) {
        return { root: abs, pattern: "**/*.xml" };
    }
    var before = abs.slice(0, star).replace(/[/\\]+$/, "");
    var root = before || process.cwd();
    var pattern = path_1.default
        .relative(root, abs)
        .split(path_1.default.sep)
        .join("/");
    return { root: root, pattern: pattern || "**/*.xml" };
}
function matchGlob(rel, pattern) {
    // 极简 glob：支持 ** / * ；`**/*.xml` 也能匹配根目录下 foo.xml
    var norm = rel.split(path_1.default.sep).join("/");
    var esc = pattern
        .split(path_1.default.sep)
        .join("/")
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*\//g, "(?:.*/)?")
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*");
    return new RegExp("^".concat(esc, "$"), "i").test(norm);
}
function walkFiles(dir, out) {
    if (out === void 0) { out = []; }
    if (!fs_1.default.existsSync(dir))
        return out;
    var st = fs_1.default.statSync(dir);
    if (st.isFile()) {
        if (dir.toLowerCase().endsWith(".xml"))
            out.push(dir);
        return out;
    }
    if (!st.isDirectory())
        return out;
    for (var _i = 0, _a = fs_1.default.readdirSync(dir); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        walkFiles(path_1.default.join(dir, name_1), out);
    }
    return out;
}
function collectXmlFiles(location) {
    var _a = resolveLocation(location), root = _a.root, pattern = _a.pattern;
    if (!fs_1.default.existsSync(root)) {
        console.warn("[ORM] mapperLocations \u8DEF\u5F84\u4E0D\u5B58\u5728: ".concat(location, " -> ").concat(root));
        return [];
    }
    var st = fs_1.default.statSync(root);
    if (st.isFile()) {
        return root.toLowerCase().endsWith(".xml") ? [root] : [];
    }
    var all = walkFiles(root);
    return all.filter(function (file) {
        var rel = path_1.default.relative(root, file);
        return matchGlob(rel, pattern);
    });
}
/** 从配置扫描并注册全部 XML（可重复调用；会清空后重载） */
function loadXmlMappers(locations) {
    var _a;
    var cfg = (0, config_1.getOrmConfig)();
    var locs = (_a = locations !== null && locations !== void 0 ? locations : cfg.mapperLocations) !== null && _a !== void 0 ? _a : [];
    (0, registry_1.clearXmlRegistry)();
    if (!locs.length) {
        loaded = true;
        return { files: 0, statements: 0, namespaces: [] };
    }
    var files = new Set();
    for (var _i = 0, locs_1 = locs; _i < locs_1.length; _i++) {
        var loc = locs_1[_i];
        for (var _b = 0, _c = collectXmlFiles(loc); _b < _c.length; _b++) {
            var f = _c[_b];
            files.add(path_1.default.normalize(f));
        }
    }
    for (var _d = 0, files_1 = files; _d < files_1.length; _d++) {
        var file = files_1[_d];
        var text = fs_1.default.readFileSync(file, "utf8");
        var parsed = (0, parseMapperXml_1.parseMapperXml)(text, file);
        (0, registry_1.registerXmlBundle)(parsed.namespace, file, parsed.sqlFragments, parsed.statements);
    }
    loaded = true;
    var statements = (0, registry_1.countXmlStatements)();
    var namespaces = (0, registry_1.listXmlNamespaces)();
    if (files.size || statements) {
        console.info("[ORM] loaded ".concat(statements, " statements from ").concat(files.size, " xml file(s)"));
    }
    return { files: files.size, statements: statements, namespaces: namespaces };
}
/** 确保已按配置加载（惰性） */
function ensureXmlMappersLoaded() {
    if (loaded)
        return;
    loadXmlMappers();
}
function isXmlMappersLoaded() {
    return loaded;
}
/** 测试用：标记未加载 */
function resetXmlLoadState() {
    loaded = false;
    (0, registry_1.clearXmlRegistry)();
}
/** 开发热加载：监听已配置目录（简版，按文件 mtime 全量重载） */
function watchXmlMappers() {
    var _a;
    if (watching)
        return;
    var cfg = (0, config_1.getOrmConfig)();
    if (!cfg.mapperReload)
        return;
    var locs = (_a = cfg.mapperLocations) !== null && _a !== void 0 ? _a : [];
    if (!locs.length)
        return;
    watching = true;
    var roots = new Set();
    for (var _i = 0, locs_2 = locs; _i < locs_2.length; _i++) {
        var loc = locs_2[_i];
        try {
            roots.add(resolveLocation(loc).root);
        }
        catch (_b) {
            // ignore
        }
    }
    var timer = null;
    var reload = function () {
        try {
            loadXmlMappers();
        }
        catch (err) {
            console.error("[ORM] XML 热加载失败", err);
        }
    };
    for (var _c = 0, roots_1 = roots; _c < roots_1.length; _c++) {
        var root = roots_1[_c];
        if (!fs_1.default.existsSync(root))
            continue;
        try {
            fs_1.default.watch(root, { recursive: true }, function (_event, filename) {
                if (filename && !String(filename).toLowerCase().endsWith(".xml")) {
                    return;
                }
                if (timer)
                    clearTimeout(timer);
                timer = setTimeout(reload, 300);
            });
        }
        catch (_d) {
            // Windows 部分路径不支持 recursive
        }
    }
}
