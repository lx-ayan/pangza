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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectMapper = void 0;
exports.formatDate = formatDate;
exports.shouldOmitByInclude = shouldOmitByInclude;
var decorators_1 = require("./decorators");
var types_1 = require("./types");
var DEFAULT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
var options = {
    dateFormat: DEFAULT_DATE_FORMAT,
    deep: true,
    include: types_1.JsonIncludeType.ALWAYS,
};
var typeHandlers = new Map();
/** pad 数字 */
function pad(n, len) {
    if (len === void 0) { len = 2; }
    return String(n).padStart(len, "0");
}
/**
 * 按 Jackson 风格 pattern 格式化 Date。
 * 支持：yyyy MM dd HH mm ss SSS
 */
function formatDate(date, pattern, timezone) {
    if (pattern === void 0) { pattern = DEFAULT_DATE_FORMAT; }
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return String(date);
    }
    var y;
    var M;
    var d;
    var H;
    var m;
    var s;
    var S;
    if (timezone !== undefined && Number.isFinite(timezone)) {
        var utc = date.getTime() + date.getTimezoneOffset() * 60000;
        var shifted = new Date(utc + timezone * 3600000);
        y = shifted.getUTCFullYear();
        M = shifted.getUTCMonth() + 1;
        d = shifted.getUTCDate();
        H = shifted.getUTCHours();
        m = shifted.getUTCMinutes();
        s = shifted.getUTCSeconds();
        S = shifted.getUTCMilliseconds();
    }
    else {
        y = date.getFullYear();
        M = date.getMonth() + 1;
        d = date.getDate();
        H = date.getHours();
        m = date.getMinutes();
        s = date.getSeconds();
        S = date.getMilliseconds();
    }
    return pattern
        .replace(/yyyy/g, String(y))
        .replace(/MM/g, pad(M))
        .replace(/dd/g, pad(d))
        .replace(/HH/g, pad(H))
        .replace(/mm/g, pad(m))
        .replace(/ss/g, pad(s))
        .replace(/SSS/g, pad(S, 3));
}
function isPlainObject(value) {
    if (value === null || typeof value !== "object")
        return false;
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}
function isClassInstance(value) {
    if (value === null || typeof value !== "object")
        return false;
    if (Array.isArray(value))
        return false;
    if (value instanceof Date)
        return false;
    var proto = Object.getPrototypeOf(value);
    return proto && proto !== Object.prototype;
}
function isEmptyValue(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === "string" && value.length === 0)
        return true;
    if (Array.isArray(value) && value.length === 0)
        return true;
    if (isPlainObject(value) && Object.keys(value).length === 0)
        return true;
    return false;
}
function isDefaultValue(value) {
    if (isEmptyValue(value))
        return true;
    if (value === 0 || value === false)
        return true;
    return false;
}
/** 判断字段值是否应按 Include 策略跳过 */
function shouldOmitByInclude(value, include) {
    var strategy = include !== null && include !== void 0 ? include : types_1.JsonIncludeType.ALWAYS;
    switch (strategy) {
        case types_1.JsonIncludeType.NON_NULL:
            return value === null || value === undefined;
        case types_1.JsonIncludeType.NON_EMPTY:
            return isEmptyValue(value);
        case types_1.JsonIncludeType.NON_DEFAULT:
            return isDefaultValue(value);
        case types_1.JsonIncludeType.ALWAYS:
        default:
            return false;
    }
}
function resolveInclude(fieldInclude, classInclude, globalInclude) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = fieldInclude === null || fieldInclude === void 0 ? void 0 : fieldInclude.value) !== null && _a !== void 0 ? _a : classInclude === null || classInclude === void 0 ? void 0 : classInclude.value) !== null && _b !== void 0 ? _b : globalInclude) !== null && _c !== void 0 ? _c : types_1.JsonIncludeType.ALWAYS);
}
/**
 * 全局 ObjectMapper（对齐 Spring Boot Jackson ObjectMapper）。
 * Application 返回业务数据前会自动走 writeValue。
 */
exports.ObjectMapper = {
    /** 覆盖全局配置 */
    configure: function (patch) {
        if (patch === void 0) { patch = {}; }
        options = __assign(__assign({}, options), patch);
    },
    getOptions: function () {
        return __assign({}, options);
    },
    /** 注册类型处理器，例如 BigInt / 自定义类 */
    registerTypeHandler: function (type, handler) {
        typeHandlers.set(type, handler);
    },
    /** 序列化业务数据（递归处理 Date / @JsonFormat / @JsonInclude） */
    writeValue: function (data) {
        return transform(data, undefined, undefined);
    },
};
function transform(value, fieldFormat, parentClassInclude) {
    var _a, _b;
    if (value === null || value === undefined)
        return value;
    if (typeof value === "bigint") {
        return value.toString();
    }
    for (var _i = 0, typeHandlers_1 = typeHandlers; _i < typeHandlers_1.length; _i++) {
        var _c = typeHandlers_1[_i], type = _c[0], handler = _c[1];
        if (value instanceof type) {
            return handler(value, fieldFormat);
        }
    }
    if (value instanceof Date) {
        var pattern = (_b = (_a = fieldFormat === null || fieldFormat === void 0 ? void 0 : fieldFormat.pattern) !== null && _a !== void 0 ? _a : options.dateFormat) !== null && _b !== void 0 ? _b : DEFAULT_DATE_FORMAT;
        return formatDate(value, pattern, fieldFormat === null || fieldFormat === void 0 ? void 0 : fieldFormat.timezone);
    }
    // MySQL 常见：已是 ISO 字符串的日期字段，若有字段格式则再格式化
    if (typeof value === "string" && (fieldFormat === null || fieldFormat === void 0 ? void 0 : fieldFormat.pattern)) {
        var asDate = new Date(value);
        if (!Number.isNaN(asDate.getTime()) && looksLikeDateString(value)) {
            return formatDate(asDate, fieldFormat.pattern, fieldFormat.timezone);
        }
    }
    if (!options.deep)
        return value;
    if (Array.isArray(value)) {
        return value.map(function (item) { return transform(item, undefined, parentClassInclude); });
    }
    if (isClassInstance(value)) {
        return transformObject(value, value.constructor);
    }
    if (isPlainObject(value)) {
        return transformObject(value, undefined);
    }
    return value;
}
function looksLikeDateString(value) {
    return (/^\d{4}-\d{2}-\d{2}/.test(value) ||
        /^\d{4}\/\d{2}\/\d{2}/.test(value) ||
        value.includes("T"));
}
function transformObject(obj, ctor) {
    var _a, _b;
    var formats = ctor ? (0, decorators_1.getJsonFieldFormats)(ctor) : [];
    var formatMap = new Map(formats.map(function (f) { return [f.property, f.options]; }));
    var includes = ctor ? (0, decorators_1.getJsonFieldIncludes)(ctor) : [];
    var includeMap = new Map(includes.map(function (f) { return [f.property, f.options]; }));
    var classInclude = ctor ? (0, decorators_1.getClassJsonInclude)(ctor) : undefined;
    var out = {};
    for (var _i = 0, _c = Object.keys(obj); _i < _c.length; _i++) {
        var key = _c[_i];
        var raw = obj[key];
        var fieldInclude = (_a = includeMap.get(key)) !== null && _a !== void 0 ? _a : (0, decorators_1.getGlobalFieldInclude)(key);
        var includeType = resolveInclude(fieldInclude, classInclude, options.include);
        if (shouldOmitByInclude(raw, includeType)) {
            continue;
        }
        var fieldOpts = (_b = formatMap.get(key)) !== null && _b !== void 0 ? _b : (0, decorators_1.getGlobalFieldFormat)(key);
        out[key] = transform(raw, fieldOpts, classInclude);
    }
    return out;
}
