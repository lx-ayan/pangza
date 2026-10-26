"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalTest = evalTest;
exports.renderStatementSql = renderStatementSql;
var sqlTemplate_1 = require("../sqlTemplate");
/** 受限 test 表达式求值（禁止任意代码） */
function evalTest(expr, ctx) {
    var raw = String(expr !== null && expr !== void 0 ? expr : "").trim();
    if (!raw)
        return false;
    // 安全：拒绝危险 token
    if (/[`$]|__proto__|constructor|Function|require|import|process|global|eval|=>/.test(raw)) {
        throw new Error("\u975E\u6CD5 test \u8868\u8FBE\u5F0F: ".concat(raw));
    }
    // a != null / a == null / a != undefined
    var m = raw.match(/^([A-Za-z_][\w.]*)\s*(!=|==|=)\s*(null|undefined)$/i);
    if (m) {
        var val = (0, sqlTemplate_1.getPath)(ctx, m[1]);
        var isNull = val === null || val === undefined;
        var op = m[2];
        if (op === "!=")
            return !isNull;
        return isNull;
    }
    // a.length > 0 / a.length != 0
    m = raw.match(/^([A-Za-z_][\w.]*)\.length\s*(>|>=|==|!=|<=|<)\s*(\d+)$/);
    if (m) {
        var val = (0, sqlTemplate_1.getPath)(ctx, m[1]);
        var len = Array.isArray(val)
            ? val.length
            : typeof val === "string"
                ? val.length
                : 0;
        return compare(len, m[2], Number(m[3]));
    }
    // a != '' / a == ''
    m = raw.match(/^([A-Za-z_][\w.]*)\s*(!=|==|=)\s*(''|""|"")$/);
    if (m) {
        var val = (0, sqlTemplate_1.getPath)(ctx, m[1]);
        var empty = val === "" || val === null || val === undefined;
        return m[2] === "!=" ? !empty : empty;
    }
    // a == 1 / a > 0 数字比较
    m = raw.match(/^([A-Za-z_][\w.]*)\s*(==|=|!=|>|>=|<|<=)\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
        var val = (0, sqlTemplate_1.getPath)(ctx, m[1]);
        return compare(Number(val), m[2], Number(m[3]));
    }
    // 布尔字面量
    if (/^(true|false)$/i.test(raw))
        return /^true$/i.test(raw);
    // 单独属性：truthy
    if (/^[A-Za-z_][\w.]*$/.test(raw)) {
        var val = (0, sqlTemplate_1.getPath)(ctx, raw);
        if (Array.isArray(val))
            return val.length > 0;
        return val !== null && val !== undefined && val !== false && val !== "";
    }
    throw new Error("\u4E0D\u652F\u6301\u7684 test \u8868\u8FBE\u5F0F\uFF08\u8BF7\u7528\u5C5E\u6027\u6BD4\u8F83\uFF09: ".concat(raw));
}
function compare(left, op, right) {
    switch (op) {
        case ">":
            return left > right;
        case ">=":
            return left >= right;
        case "<":
            return left < right;
        case "<=":
            return left <= right;
        case "!=":
            return left !== right;
        case "==":
        case "=":
            return left === right;
        default:
            return false;
    }
}
function stripLeadingAndOr(sql) {
    return sql.replace(/^\s*(AND|OR)\s+/i, "").trim();
}
function applyTrim(body, opts) {
    var s = body.trim();
    if (!s)
        return "";
    if (opts.prefixOverrides) {
        for (var _i = 0, _a = opts.prefixOverrides.split("|").map(function (t) { return t.trim(); }); _i < _a.length; _i++) {
            var token = _a[_i];
            if (!token)
                continue;
            var re = new RegExp("^".concat(escapeRe(token), "\\s+"), "i");
            s = s.replace(re, "");
        }
    }
    if (opts.suffixOverrides) {
        for (var _b = 0, _c = opts.suffixOverrides.split("|").map(function (t) { return t.trim(); }); _b < _c.length; _b++) {
            var token = _c[_b];
            if (!token)
                continue;
            var re = new RegExp("\\s+".concat(escapeRe(token), "$"), "i");
            s = s.replace(re, "");
        }
    }
    s = s.trim();
    if (!s)
        return "";
    if (opts.prefix)
        s = "".concat(opts.prefix, " ").concat(s);
    if (opts.suffix)
        s = "".concat(s, " ").concat(opts.suffix);
    return s;
}
function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function renderNodes(nodes, ctx, fragments, stack) {
    var out = "";
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        out += renderNode(node, ctx, fragments, stack);
    }
    return out;
}
function renderNode(node, ctx, fragments, stack) {
    var _a, _b, _c;
    switch (node.type) {
        case "text":
            return node.text;
        case "if":
            return evalTest(node.test, ctx)
                ? renderNodes(node.children, ctx, fragments, stack)
                : "";
        case "where": {
            var body = stripLeadingAndOr(renderNodes(node.children, ctx, fragments, stack).trim());
            return body ? " WHERE ".concat(body, " ") : " ";
        }
        case "set": {
            var body = renderNodes(node.children, ctx, fragments, stack).trim();
            body = body.replace(/,+\s*$/, "").trim();
            return body ? " SET ".concat(body, " ") : " ";
        }
        case "trim": {
            var body = renderNodes(node.children, ctx, fragments, stack);
            var trimmed = applyTrim(body, node);
            return trimmed ? " ".concat(trimmed, " ") : " ";
        }
        case "foreach": {
            var coll = (0, sqlTemplate_1.getPath)(ctx, node.collection);
            var list = Array.isArray(coll)
                ? coll
                : coll != null && typeof coll === "object"
                    ? Object.values(coll)
                    : [];
            if (!list.length)
                return "";
            var parts_1 = [];
            list.forEach(function (item, idx) {
                var _a;
                var childCtx = __assign(__assign({}, ctx), (_a = {}, _a[node.item] = item, _a));
                if (node.index)
                    childCtx[node.index] = idx;
                parts_1.push(renderNodes(node.children, childCtx, fragments, stack).trim());
            });
            var joined = parts_1.filter(Boolean).join((_a = node.separator) !== null && _a !== void 0 ? _a : "");
            return "".concat((_b = node.open) !== null && _b !== void 0 ? _b : "").concat(joined).concat((_c = node.close) !== null && _c !== void 0 ? _c : "");
        }
        case "include": {
            if (stack.includes(node.refid)) {
                throw new Error("<include> \u5FAA\u73AF\u5F15\u7528: ".concat(stack.concat(node.refid).join(" -> ")));
            }
            var frag = fragments.get(node.refid);
            if (!frag)
                throw new Error("\u627E\u4E0D\u5230 <sql id=\"".concat(node.refid, "\">"));
            return renderNodes(frag, ctx, fragments, __spreadArray(__spreadArray([], stack, true), [node.refid], false));
        }
        default:
            return "";
    }
}
/** 将语句节点树渲染为带 #{} / ${} 的 SQL 文本 */
function renderStatementSql(nodes, ctx, fragments) {
    if (fragments === void 0) { fragments = new Map(); }
    return renderNodes(nodes, ctx, fragments, [])
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}
