"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNull = notNull;
exports.min = min;
exports.max = max;
exports.email = email;
exports.phone = phone;
exports.custom = custom;
var validator_1 = require("validator");
function msg(options, fallback) {
    var _a;
    return ((_a = options === null || options === void 0 ? void 0 : options.message) === null || _a === void 0 ? void 0 : _a.trim()) || fallback;
}
function isEmpty(value) {
    return (value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === ""));
}
function toNumber(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}
function lengthOf(value) {
    if (typeof value === "string" || Array.isArray(value))
        return value.length;
    return null;
}
/** 非空（undefined / null / 空字符串） */
function notNull(options) {
    var opts = typeof options === "string" ? { message: options } : options;
    return {
        name: "NotNull",
        message: msg(opts, "不能为空"),
        validate: function (value) { return !isEmpty(value); },
    };
}
/** 最小值：数字比大小；字符串/数组比长度 */
function min(minValue, options) {
    var opts = typeof options === "string" ? { message: options } : options;
    return {
        name: "Min",
        message: msg(opts, "\u4E0D\u80FD\u5C0F\u4E8E ".concat(minValue)),
        validate: function (value) {
            if (isEmpty(value))
                return true;
            var num = toNumber(value);
            if (num !== null)
                return num >= minValue;
            var len = lengthOf(value);
            if (len !== null)
                return len >= minValue;
            return false;
        },
    };
}
/** 最大值：数字比大小；字符串/数组比长度 */
function max(maxValue, options) {
    var opts = typeof options === "string" ? { message: options } : options;
    return {
        name: "Max",
        message: msg(opts, "\u4E0D\u80FD\u5927\u4E8E ".concat(maxValue)),
        validate: function (value) {
            if (isEmpty(value))
                return true;
            var num = toNumber(value);
            if (num !== null)
                return num <= maxValue;
            var len = lengthOf(value);
            if (len !== null)
                return len <= maxValue;
            return false;
        },
    };
}
/** 邮箱 */
function email(options) {
    var opts = typeof options === "string" ? { message: options } : options;
    return {
        name: "Email",
        message: msg(opts, "邮箱格式不正确"),
        validate: function (value) {
            if (isEmpty(value))
                return true;
            return typeof value === "string" && validator_1.default.isEmail(value);
        },
    };
}
/** 手机号（默认中国大陆） */
function phone(options) {
    var message;
    var locale = "zh-CN";
    if (typeof options === "string") {
        message = options;
    }
    else if (options && typeof options === "object") {
        message = options.message;
        if ("locale" in options && options.locale) {
            locale = options.locale;
        }
    }
    return {
        name: "Phone",
        message: (message === null || message === void 0 ? void 0 : message.trim()) || "手机号格式不正确",
        validate: function (value) {
            if (isEmpty(value))
                return true;
            return typeof value === "string" && validator_1.default.isMobilePhone(value, locale);
        },
    };
}
/**
 * 自定义规则（函数返回 true 表示通过）。
 * @example custom((v) => v === 'admin', '仅允许 admin')
 */
function custom(fn, options) {
    var opts = typeof options === "string" ? { message: options } : options;
    return {
        name: "Custom",
        message: msg(opts, "校验未通过"),
        validate: fn,
    };
}
