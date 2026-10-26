"use strict";
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
exports.JsonProperty = JsonProperty;
exports.convert = convert;
exports.copyProperties = copyProperties;
exports.pick = pick;
var beanKeys_1 = require("./beanKeys");
/**
 * 属性装饰器：声明该字段参与 convert 映射（无其它装饰器时使用）。
 *
 * @example
 * class User {
 *   @JsonProperty() username!: string;
 *   @JsonProperty() password!: string;
 * }
 */
function JsonProperty() {
    return function (target, propertyKey) {
        (0, beanKeys_1.addBeanKey)(target.constructor, String(propertyKey));
    };
}
function resolveKeys(Target, instance, fields) {
    if (fields && fields.length > 0)
        return __spreadArray([], fields, true);
    var keys = new Set((0, beanKeys_1.getBeanKeys)(Target));
    for (var _i = 0, _a = Object.getOwnPropertyNames(instance); _i < _a.length; _i++) {
        var k = _a[_i];
        if (k === "constructor")
            continue;
        keys.add(k);
    }
    return __spreadArray([], keys, true);
}
function asRecord(source) {
    if (source && typeof source === "object" && !Array.isArray(source)) {
        return source;
    }
    return {};
}
function shouldSkip(value, options) {
    if ((options === null || options === void 0 ? void 0 : options.ignoreUndefined) && value === undefined)
        return true;
    if ((options === null || options === void 0 ? void 0 : options.ignoreNull) && value === null)
        return true;
    return false;
}
function convert(source, targetOrFields, options) {
    var src = asRecord(source);
    if (Array.isArray(targetOrFields)) {
        var out = {};
        for (var _i = 0, targetOrFields_1 = targetOrFields; _i < targetOrFields_1.length; _i++) {
            var key = targetOrFields_1[_i];
            if (!(key in src))
                continue;
            var val = src[key];
            if (shouldSkip(val, options))
                continue;
            out[key] = val;
        }
        return out;
    }
    var Target = targetOrFields;
    var instance = new Target();
    var keys = resolveKeys(Target, instance, options === null || options === void 0 ? void 0 : options.fields);
    if (keys.length === 0) {
        throw new Error("[convert] ".concat(Target.name || "Target", " \u672A\u53D1\u73B0\u53EF\u6620\u5C04\u5B57\u6BB5\u3002") +
            "\u8BF7\u5728\u5C5E\u6027\u4E0A\u4F7F\u7528\u88C5\u9970\u5668\uFF08\u5982 @JsonProperty / @NotNull / @JsonFormat\uFF09\uFF0C" +
            "\u6216\u4F20\u5165 options.fields / \u5B57\u6BB5\u540D\u6570\u7EC4\u3002");
    }
    for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
        var key = keys_1[_a];
        if (!(key in src))
            continue;
        var val = src[key];
        if (shouldSkip(val, options))
            continue;
        instance[key] = val;
    }
    return instance;
}
/**
 * 属性拷贝到已有目标对象（对齐 BeanUtils.copyProperties）。
 */
function copyProperties(source, target, options) {
    var src = asRecord(source);
    var ctor = target.constructor;
    var keys = resolveKeys(ctor, target, options === null || options === void 0 ? void 0 : options.fields);
    var useKeys = keys.length > 0
        ? keys
        : Object.keys(src).filter(function (k) { return typeof src[k] !== "function"; });
    for (var _i = 0, useKeys_1 = useKeys; _i < useKeys_1.length; _i++) {
        var key = useKeys_1[_i];
        if (!(key in src))
            continue;
        var val = src[key];
        if (shouldSkip(val, options))
            continue;
        target[key] = val;
    }
    return target;
}
/**
 * 按字段名摘取 plain object（不实例化类）。
 */
function pick(source, fields, options) {
    return convert(source, fields, options);
}
