"use strict";
/**
 * MyBatis 风格 SQL 模板：
 * - #{name}  → ? 占位 + 参数绑定（防注入）
 * - ${name}  → 字符串直接替换（仅用于可信标识符等，勿接用户输入）
 * - 支持 #{id, jdbcType=INTEGER} 形式（忽略逗号后选项）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPath = getPath;
exports.buildParamContext = buildParamContext;
exports.parseMybatisSql = parseMybatisSql;
exports.isPlainObject = isPlainObject;
var PLACEHOLDER_RE = /([#$])\{([^}]+)\}/g;
function isPlainObject(value) {
    return (value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof Buffer));
}
/** 从对象取 a.b.c 路径 */
function getPath(root, path) {
    if (!path)
        return undefined;
    var parts = path.split(".").map(function (p) { return p.trim(); }).filter(Boolean);
    var cur = root;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (cur == null || typeof cur !== "object")
            return undefined;
        cur = cur[part];
    }
    return cur;
}
/**
 * 从方法实参构建命名参数表（对齐 MyBatis 常用约定）：
 * - @Param("x") 标注的名字
 * - param1 / param2 ...（从 1 起）
 * - arg0 / arg1 ...
 * - 单参数且为对象：展开其字段
 * - 单参数原始值：任意 #{name} 都映射到该值
 */
function buildParamContext(args, namedByIndex) {
    if (namedByIndex === void 0) { namedByIndex = {}; }
    var ctx = {};
    args.forEach(function (arg, i) {
        ctx["param".concat(i + 1)] = arg;
        ctx["arg".concat(i)] = arg;
        var named = namedByIndex[i];
        if (named)
            ctx[named] = arg;
    });
    if (args.length === 1) {
        var only = args[0];
        if (isPlainObject(only)) {
            Object.assign(ctx, only);
        }
        else {
            ctx.__single__ = only;
        }
    }
    return ctx;
}
function resolveExpr(ctx, rawExpr) {
    // #{id, jdbcType=INTEGER} → id
    var key = rawExpr.split(",")[0].trim();
    if (!key) {
        throw new Error("SQL 占位符名不能为空");
    }
    if (Object.prototype.hasOwnProperty.call(ctx, key)) {
        return ctx[key];
    }
    var nested = getPath(ctx, key);
    if (nested !== undefined) {
        return nested;
    }
    if (Object.prototype.hasOwnProperty.call(ctx, "__single__")) {
        return ctx.__single__;
    }
    throw new Error("[SQL] \u627E\u4E0D\u5230\u53C2\u6570: ".concat(key));
}
/** ${} 危险片段：拒绝拼进 SQL */
var DOLLAR_UNSAFE_RE = /;|--|\/\*|\*\/|'|"|\\|\b(union|select|insert|update|delete|drop|alter|exec|execute)\b/i;
var dollarWarnCount = 0;
/**
 * 解析含 #{} / ${} 的 SQL。
 * 按出现顺序处理；${} 直接拼进 SQL，#{} 变为 ? 并收集 params。
 *
 * 安全：优先使用 `#{}`。`${}` 仅用于可信标识符；含 `;`/`--`/引号/SQL 关键字等会抛错，并默认打告警。
 */
function parseMybatisSql(template, ctx, options) {
    var params = [];
    var sql = String(template).replace(PLACEHOLDER_RE, function (_whole, kind, expr) {
        var value = resolveExpr(ctx, expr);
        if (kind === "$") {
            if (value === undefined || value === null) {
                throw new Error("[SQL] ${".concat(expr.trim(), "} \u7684\u503C\u4E0D\u80FD\u4E3A\u7A7A"));
            }
            var text = String(value);
            if (DOLLAR_UNSAFE_RE.test(text)) {
                throw new Error("[SQL] ${".concat(expr.trim(), "} \u7684\u503C\u542B\u6709\u5371\u9669\u5B57\u7B26\u6216\u5173\u952E\u5B57\uFF0C\u5DF2\u62D2\u7EDD\u3002\u8BF7\u6539\u7528 #{} \u53C2\u6570\u7ED1\u5B9A\uFF0C\u6216\u4EC5\u4F20\u5165\u53EF\u4FE1\u6807\u8BC6\u7B26"));
            }
            if (!(options === null || options === void 0 ? void 0 : options.silenceDollarWarn) && dollarWarnCount < 20) {
                dollarWarnCount += 1;
                console.warn("[ORM] SQL \u4F7F\u7528\u4E86 ${".concat(expr.trim(), "} \u5B57\u7B26\u4E32\u62FC\u63A5\uFF0C\u5B58\u5728\u6CE8\u5165\u98CE\u9669\uFF1B\u4EC5\u53EF\u7528\u4E8E\u53EF\u4FE1\u8868\u540D/\u5217\u540D\u3002\u4F18\u5148\u6539\u7528 #{}\u3002"));
            }
            return text;
        }
        params.push(value);
        return "?";
    });
    return { sql: sql, params: params };
}
