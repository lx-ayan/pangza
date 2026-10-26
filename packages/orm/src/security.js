"use strict";
/**
 * ORM SQL 安全工具：标识符白名单、整数校验、LIKE 转义。
 * 值参数一律走 ? 占位，禁止拼接用户输入到 SQL 结构中。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIdent = assertIdent;
exports.assertSafeUint = assertSafeUint;
exports.escapeLike = escapeLike;
exports.assertSafeLastSql = assertSafeLastSql;
var IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
var FORBIDDEN_IDENTS = new Set([
    "__proto__",
    "constructor",
    "prototype",
]);
/** 校验表名/列名，防止标识符注入 */
function assertIdent(name) {
    if (typeof name !== "string" || !IDENT_RE.test(name) || FORBIDDEN_IDENTS.has(name)) {
        throw new Error("\u975E\u6CD5\u6807\u8BC6\u7B26: ".concat(String(name)));
    }
    return name;
}
/** 校验非负安全整数（用于 LIMIT / OFFSET / 页码） */
function assertSafeUint(value, label) {
    if (label === void 0) { label = "number"; }
    var n = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(n) || n < 0 || n > Number.MAX_SAFE_INTEGER) {
        throw new Error("\u975E\u6CD5\u6574\u6570\u53C2\u6570 ".concat(label, ": ").concat(String(value)));
    }
    return n;
}
/** 转义 LIKE 通配符，避免用户输入 %/_ 扩大匹配面 */
function escapeLike(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
}
/**
 * 校验 last() 仅允许白名单安全片段。
 * 禁止任意原生 SQL 拼接，降低注入风险。
 */
function assertSafeLastSql(sql) {
    var trimmed = String(sql).trim().replace(/\s+/g, " ");
    if (!/^(LIMIT\s+\d+(\s+OFFSET\s+\d+)?|FOR UPDATE|LOCK IN SHARE MODE)$/i.test(trimmed)) {
        throw new Error("last() 仅允许: LIMIT n [OFFSET m] / FOR UPDATE / LOCK IN SHARE MODE");
    }
    return trimmed;
}
