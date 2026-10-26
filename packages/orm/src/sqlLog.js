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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SQL_LOG_FORMAT = void 0;
exports.getSqlLogRuntime = getSqlLogRuntime;
exports.configureSqlLog = configureSqlLog;
exports.detectSqlType = detectSqlType;
exports.renderSqlLog = renderSqlLog;
exports.withSqlLog = withSqlLog;
var Logger_1 = require("@pangza/core/Logger");
var log = (0, Logger_1.getLogger)("ORM.SQL");
var DEFAULT_FORMAT = "{time} [{type}] {cost}ms | {sql} | params={params}";
exports.DEFAULT_SQL_LOG_FORMAT = DEFAULT_FORMAT;
var DEFAULT_PARTS = {
    time: true,
    type: true,
    sql: true,
    params: true,
    cost: true,
};
var runtime = {
    enabled: false,
    format: DEFAULT_FORMAT,
    parts: __assign({}, DEFAULT_PARTS),
    level: "info",
};
function getSqlLogRuntime() {
    return runtime;
}
function configureSqlLog(patch) {
    var _a, _b, _c, _d;
    if (patch === void 0) { patch = {}; }
    runtime = {
        enabled: (_a = patch.enabled) !== null && _a !== void 0 ? _a : runtime.enabled,
        format: (_b = patch.format) !== null && _b !== void 0 ? _b : runtime.format,
        parts: __assign(__assign({}, runtime.parts), ((_c = patch.parts) !== null && _c !== void 0 ? _c : {})),
        level: (_d = patch.level) !== null && _d !== void 0 ? _d : runtime.level,
    };
}
/** 从 SQL 推断类型：SELECT / INSERT / UPDATE / DELETE / OTHER */
function detectSqlType(sql) {
    var m = String(sql)
        .trim()
        .match(/^(WITH|SELECT|INSERT|UPDATE|DELETE|REPLACE|CALL|SHOW|DESCRIBE|EXPLAIN|SET|BEGIN|COMMIT|ROLLBACK)\b/i);
    if (!m)
        return "OTHER";
    var raw = m[1].toUpperCase();
    if (raw === "WITH")
        return "SELECT";
    return raw;
}
function formatTime(date) {
    var pad = function (n, len) {
        if (len === void 0) { len = 2; }
        return String(n).padStart(len, "0");
    };
    return ("".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate()), " ") +
        "".concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()), ":").concat(pad(date.getSeconds()), ".") +
        "".concat(pad(date.getMilliseconds(), 3)));
}
/** 日志参数脱敏：键名含这些片段时替换为 *** */
var SENSITIVE_KEY_RE = /password|passwd|pwd|secret|token|authorization|credential|private.?key|access.?key/i;
function walkRedact(value, key) {
    if (key && SENSITIVE_KEY_RE.test(key))
        return "***";
    if (typeof value === "bigint")
        return value.toString();
    if (value instanceof Date)
        return value.toISOString();
    if (Buffer.isBuffer(value))
        return "<Buffer ".concat(value.length, "b>");
    if (Array.isArray(value)) {
        return value.map(function (item, i) { return walkRedact(item, String(i)); });
    }
    if (value !== null && typeof value === "object") {
        var out = {};
        for (var _i = 0, _a = Object.entries(value); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            out[k] = walkRedact(v, k);
        }
        return out;
    }
    return value;
}
function safeParams(params) {
    try {
        return JSON.stringify(params.map(function (p) { return walkRedact(p); }));
    }
    catch (_a) {
        return String(params);
    }
}
function compactSql(sql) {
    return String(sql).replace(/\s+/g, " ").trim();
}
function applyParts(info, parts) {
    return {
        time: parts.time ? info.time : "",
        type: parts.type ? info.type : "",
        sql: parts.sql ? info.sql : "",
        params: parts.params ? info.paramsText : "",
        cost: parts.cost ? String(info.cost) : "",
    };
}
/**
 * 默认模板替换。
 * 占位符：{time} {type} {sql} {params} {cost}
 * 若某 part 关闭，对应占位符替换为空，并清理多余分隔符。
 */
function renderSqlLog(info, format, parts) {
    if (format === void 0) { format = runtime.format; }
    if (parts === void 0) { parts = runtime.parts; }
    if (typeof format === "function") {
        return format(info);
    }
    var values = applyParts(info, parts);
    var out = String(format).replace(/\{(time|type|sql|params|cost)\}/g, function (_m, key) { var _a; return (_a = values[key]) !== null && _a !== void 0 ? _a : ""; });
    // 清理因关闭某段产生的空标签 / 多余分隔
    out = out
        .replace(/\bparams=\s*(?=\||$)/gi, "")
        .replace(/\s*\|\s*\|/g, " |")
        .replace(/\[\s*\]/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+\|/g, " |")
        .replace(/\|\s+/g, "| ")
        .replace(/^\s*\|\s*/, "")
        .replace(/\s*\|\s*$/, "")
        .trim();
    // 默认模板 `{cost}ms`：cost 关闭时去掉孤立 ms
    if (!parts.cost) {
        out = out
            .replace(/(^|\|\s*)ms(\s*\||$)/g, "$1$2")
            .replace(/\s+ms$/g, "")
            .replace(/\s*\|\s*\|/g, " |")
            .replace(/^\s*\|\s*/, "")
            .replace(/\s*\|\s*$/, "")
            .trim();
    }
    return out;
}
/** 执行前后包装：记录耗时并按配置输出 */
function withSqlLog(sql, params, run) {
    return __awaiter(this, void 0, void 0, function () {
        var startedAt, startDate, result, cost, info, message, err_1, cost, info, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!runtime.enabled) {
                        return [2 /*return*/, run()];
                    }
                    startedAt = Date.now();
                    startDate = new Date(startedAt);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, run()];
                case 2:
                    result = _a.sent();
                    cost = Date.now() - startedAt;
                    info = {
                        time: formatTime(startDate),
                        type: detectSqlType(sql),
                        sql: compactSql(sql),
                        params: params,
                        paramsText: safeParams(params),
                        cost: cost,
                        error: false,
                    };
                    message = renderSqlLog(info);
                    // 结构化字段 + 消息，避免仅依赖 msg 在部分终端丢编码
                    log[runtime.level]({
                        sqlType: info.type,
                        cost: info.cost,
                        sql: info.sql,
                        params: info.params,
                    }, message);
                    return [2 /*return*/, result];
                case 3:
                    err_1 = _a.sent();
                    cost = Date.now() - startedAt;
                    info = {
                        time: formatTime(startDate),
                        type: detectSqlType(sql),
                        sql: compactSql(sql),
                        params: params,
                        paramsText: safeParams(params),
                        cost: cost,
                        error: true,
                    };
                    message = renderSqlLog(info);
                    log.error({
                        err: err_1,
                        sqlType: info.type,
                        cost: info.cost,
                        sql: info.sql,
                        params: info.params,
                    }, message);
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
