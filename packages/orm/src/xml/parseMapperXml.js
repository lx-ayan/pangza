"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMapperXml = parseMapperXml;
function stripNoise(xml) {
    return xml
        .replace(/<\?xml[\s\S]*?\?>/gi, "")
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim();
}
function parseAttrs(raw) {
    var _a, _b;
    var attrs = {};
    var re = /([A-Za-z_][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    var m;
    while ((m = re.exec(raw))) {
        attrs[m[1]] = (_b = (_a = m[2]) !== null && _a !== void 0 ? _a : m[3]) !== null && _b !== void 0 ? _b : "";
    }
    return attrs;
}
function readOpenTag(src, from) {
    if (src[from] !== "<")
        return null;
    if (src[from + 1] === "/" || src[from + 1] === "!" || src[from + 1] === "?") {
        return null;
    }
    var end = src.indexOf(">", from);
    if (end < 0)
        throw new Error("XML 标签未闭合");
    var body = src.slice(from + 1, end).trim();
    var selfClosing = body.endsWith("/");
    var inner = selfClosing ? body.slice(0, -1).trim() : body;
    var sp = inner.search(/\s/);
    var name = (sp < 0 ? inner : inner.slice(0, sp)).toLowerCase();
    var attrRaw = sp < 0 ? "" : inner.slice(sp);
    return {
        name: name,
        attrs: parseAttrs(attrRaw),
        selfClosing: selfClosing,
        end: end + 1,
    };
}
function findCloseTag(src, name, from) {
    var openRe = new RegExp("<".concat(name, "\\b"), "gi");
    var closeRe = new RegExp("</".concat(name, "\\s*>"), "gi");
    var depth = 1;
    var i = from;
    while (i < src.length && depth > 0) {
        openRe.lastIndex = i;
        closeRe.lastIndex = i;
        var o = openRe.exec(src);
        var c = closeRe.exec(src);
        if (!c)
            throw new Error("\u7F3A\u5C11\u7ED3\u675F\u6807\u7B7E </".concat(name, ">"));
        if (o && o.index < c.index) {
            // 可能是开标签；检查是否自闭合
            var tag = readOpenTag(src, o.index);
            if (tag && !tag.selfClosing)
                depth += 1;
            i = tag ? tag.end : o.index + 1;
        }
        else {
            depth -= 1;
            if (depth === 0)
                return c.index;
            i = c.index + c[0].length;
        }
    }
    throw new Error("\u7F3A\u5C11\u7ED3\u675F\u6807\u7B7E </".concat(name, ">"));
}
function parseChildren(src) {
    var nodes = [];
    var i = 0;
    while (i < src.length) {
        var lt = src.indexOf("<", i);
        if (lt < 0) {
            var text = src.slice(i);
            if (text)
                nodes.push({ type: "text", text: text });
            break;
        }
        if (lt > i) {
            nodes.push({ type: "text", text: src.slice(i, lt) });
        }
        if (src.startsWith("</", lt))
            break;
        // CDATA → 纯文本
        if (src.startsWith("<![CDATA[", lt)) {
            var end = src.indexOf("]]>", lt);
            if (end < 0)
                throw new Error("CDATA 未闭合");
            nodes.push({ type: "text", text: src.slice(lt + 9, end) });
            i = end + 3;
            continue;
        }
        var open_1 = readOpenTag(src, lt);
        if (!open_1) {
            // 非标签的 <（如 age < 10）当作文本；建议用 CDATA
            nodes.push({ type: "text", text: src[lt] });
            i = lt + 1;
            continue;
        }
        if (open_1.selfClosing) {
            nodes.push(elementToNode(open_1.name, open_1.attrs, []));
            i = open_1.end;
            continue;
        }
        var closeAt = findCloseTag(src, open_1.name, open_1.end);
        var inner = src.slice(open_1.end, closeAt);
        var closeEnd = src.indexOf(">", closeAt) + 1;
        nodes.push(elementToNode(open_1.name, open_1.attrs, parseChildren(inner)));
        i = closeEnd;
    }
    return nodes;
}
function elementToNode(name, attrs, children) {
    var _a, _b, _c, _d, _e;
    switch (name) {
        case "if":
            if (!((_a = attrs.test) === null || _a === void 0 ? void 0 : _a.trim()))
                throw new Error("<if> 缺少 test");
            return { type: "if", test: attrs.test.trim(), children: children };
        case "where":
            return { type: "where", children: children };
        case "set":
            return { type: "set", children: children };
        case "trim":
            return {
                type: "trim",
                prefix: attrs.prefix,
                suffix: attrs.suffix,
                prefixOverrides: attrs.prefixOverrides,
                suffixOverrides: attrs.suffixOverrides,
                children: children,
            };
        case "foreach":
            if (!((_b = attrs.collection) === null || _b === void 0 ? void 0 : _b.trim()))
                throw new Error("<foreach> 缺少 collection");
            return {
                type: "foreach",
                collection: attrs.collection.trim(),
                item: ((_c = attrs.item) !== null && _c !== void 0 ? _c : "item").trim(),
                index: (_d = attrs.index) === null || _d === void 0 ? void 0 : _d.trim(),
                open: attrs.open,
                close: attrs.close,
                separator: attrs.separator,
                children: children,
            };
        case "include":
            if (!((_e = attrs.refid) === null || _e === void 0 ? void 0 : _e.trim()))
                throw new Error("<include> 缺少 refid");
            return { type: "include", refid: attrs.refid.trim() };
        default:
            // 未知标签当文本保留，避免吞掉合法 SQL 中的比较符误伤；此处仅动态节点白名单
            throw new Error("XML Mapper \u4E0D\u652F\u6301\u6807\u7B7E <".concat(name, ">"));
    }
}
var STMT_KINDS = new Set(["select", "insert", "update", "delete"]);
/**
 * 解析单个 Mapper XML 文本。
 */
function parseMapperXml(xml, sourceFile) {
    var _a, _b, _c, _d;
    if (sourceFile === void 0) { sourceFile = ""; }
    var cleaned = stripNoise(xml);
    var rootOpen = readOpenTag(cleaned, cleaned.indexOf("<"));
    if (!rootOpen || rootOpen.name !== "mapper") {
        throw new Error("".concat(sourceFile || "XML", ": \u6839\u8282\u70B9\u5FC5\u987B\u662F <mapper>"));
    }
    var namespace = ((_a = rootOpen.attrs.namespace) !== null && _a !== void 0 ? _a : "").trim();
    if (!namespace) {
        throw new Error("".concat(sourceFile || "XML", ": <mapper> \u7F3A\u5C11 namespace"));
    }
    var rootClose = findCloseTag(cleaned, "mapper", rootOpen.end);
    var body = cleaned.slice(rootOpen.end, rootClose);
    var sqlFragments = new Map();
    var statements = [];
    var i = 0;
    while (i < body.length) {
        var lt = body.indexOf("<", i);
        if (lt < 0)
            break;
        if (body.startsWith("</", lt))
            break;
        var open_2 = readOpenTag(body, lt);
        if (!open_2) {
            i = lt + 1;
            continue;
        }
        if (open_2.selfClosing) {
            i = open_2.end;
            continue;
        }
        var closeAt = findCloseTag(body, open_2.name, open_2.end);
        var inner = body.slice(open_2.end, closeAt);
        var closeEnd = body.indexOf(">", closeAt) + 1;
        var id = ((_b = open_2.attrs.id) !== null && _b !== void 0 ? _b : "").trim();
        if (open_2.name === "sql") {
            if (!id)
                throw new Error("".concat(sourceFile, ": <sql> \u7F3A\u5C11 id"));
            if (sqlFragments.has(id)) {
                throw new Error("".concat(sourceFile, ": \u91CD\u590D <sql id=\"").concat(id, "\">"));
            }
            sqlFragments.set(id, parseChildren(inner));
        }
        else if (STMT_KINDS.has(open_2.name)) {
            if (!id)
                throw new Error("".concat(sourceFile, ": <").concat(open_2.name, "> \u7F3A\u5C11 id"));
            statements.push({
                namespace: namespace,
                id: id,
                kind: open_2.name,
                nodes: parseChildren(inner),
                resultType: ((_c = open_2.attrs.resultType) === null || _c === void 0 ? void 0 : _c.trim()) || undefined,
                datasource: ((_d = open_2.attrs.datasource) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
                sourceFile: sourceFile,
            });
        }
        else if (open_2.name === "resultmap") {
            // 首期跳过 resultMap 内容
        }
        else {
            throw new Error("".concat(sourceFile, ": \u4E0D\u652F\u6301\u7684\u9876\u5C42\u6807\u7B7E <").concat(open_2.name, ">\uFF08\u4EC5 sql/select/insert/update/delete\uFF09"));
        }
        i = closeEnd;
    }
    return { namespace: namespace, sourceFile: sourceFile, sqlFragments: sqlFragments, statements: statements };
}
