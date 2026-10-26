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
exports.applyConditionOnProperty = applyConditionOnProperty;
exports.ConditionOnProperty = ConditionOnProperty;
exports.getConditionOnPropertyPrefix = getConditionOnPropertyPrefix;
var container_1 = require("../Service/container");
var PREFIX_KEY = Symbol.for("pangza.conditionOnProperty.prefix");
var OPTIONS_KEY = Symbol.for("pangza.conditionOnProperty.options");
var APPLIED_KEY = Symbol.for("pangza.conditionOnProperty.applied");
function normalizePrefix(prefix) {
    return String(prefix || "")
        .trim()
        .replace(/^\.+|\.+$/g, "");
}
function readYaml(path) {
    // 懒加载，避免与 config/index 循环依赖
    var getConfigValue = require("./index").getConfigValue;
    return getConfigValue(path, undefined);
}
/**
 * 是否「类上自己定义了默认值」：构造后属性不是 undefined。
 * 有默认值 → 保留（优先自己定义的默认值），不读 YAML。
 * 无默认值（如 `port!: number`）→ 从 YAML 前缀路径填充。
 */
function applyConditionOnProperty(ctor, instance) {
    var _a;
    var prefix = Reflect.getMetadata(PREFIX_KEY, ctor);
    if (!prefix)
        return;
    var bag = instance;
    if (bag[APPLIED_KEY])
        return;
    bag[APPLIED_KEY] = true;
    var options = Reflect.getMetadata(OPTIONS_KEY, ctor);
    var defaults = (_a = options === null || options === void 0 ? void 0 : options.defaults) !== null && _a !== void 0 ? _a : {};
    var keys = new Set(__spreadArray(__spreadArray([], Object.keys(instance), true), Object.keys(defaults), true));
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (key === "constructor")
            continue;
        var own = instance[key];
        if (own !== undefined) {
            continue;
        }
        var fromYaml = readYaml("".concat(prefix, ".").concat(key));
        if (fromYaml !== undefined) {
            instance[key] = fromYaml;
            continue;
        }
        if (Object.prototype.hasOwnProperty.call(defaults, key)) {
            instance[key] = defaults[key];
        }
    }
}
/**
 * 类装饰器：按 YAML 前缀自动注入属性。
 *
 * - 标注前缀后，`prefix.属性名` 对应 application*.yaml
 * - **优先自己定义的默认值**（字段初始值）；未设默认值时才读 YAML
 * - `defaults` 选项作为 YAML 也缺失时的回退
 *
 * @example
 * @ConditionOnProperty("redis")
 * class RedisSettings {
 *   host = "127.0.0.1"; // 有默认值 → 用该值，忽略 yaml
 *   port!: number;      // 无默认值 → 读 redis.port
 * }
 *
 * @ConditionOnProperty({ prefix: "server", defaults: { port: 3990 } })
 * class ServerSettings {
 *   port!: number;
 * }
 */
function ConditionOnProperty(prefixOrOptions) {
    var options = typeof prefixOrOptions === "string"
        ? { prefix: prefixOrOptions }
        : __assign({}, prefixOrOptions);
    var prefix = normalizePrefix(options.prefix);
    if (!prefix) {
        throw new Error("@ConditionOnProperty 前缀不能为空");
    }
    return function (ctor) {
        var Ctor = ctor;
        Reflect.defineMetadata(PREFIX_KEY, prefix, ctor);
        Reflect.defineMetadata(OPTIONS_KEY, __assign(__assign({}, options), { prefix: prefix }), ctor);
        container_1.Container.bindClassWithActivation(Ctor, function (instance) {
            applyConditionOnProperty(ctor, instance);
            return instance;
        });
    };
}
function getConditionOnPropertyPrefix(ctor) {
    return Reflect.getMetadata(PREFIX_KEY, ctor);
}
