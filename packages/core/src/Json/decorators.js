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
exports.JsonFormat = JsonFormat;
exports.JsonInclude = JsonInclude;
exports.getGlobalFieldFormat = getGlobalFieldFormat;
exports.getGlobalFieldInclude = getGlobalFieldInclude;
exports.getJsonFieldFormats = getJsonFieldFormats;
exports.getJsonFieldFormat = getJsonFieldFormat;
exports.getClassJsonInclude = getClassJsonInclude;
exports.getJsonFieldIncludes = getJsonFieldIncludes;
exports.getJsonFieldInclude = getJsonFieldInclude;
require("reflect-metadata");
var beanKeys_1 = require("./beanKeys");
var types_1 = require("./types");
var JSON_FORMAT_KEY = Symbol.for("pangza.json.formats");
var JSON_INCLUDE_KEY = Symbol.for("pangza.json.include");
var JSON_CLASS_INCLUDE_KEY = Symbol.for("pangza.json.classInclude");
/** 全局字段格式（供 ORM 返回的 plain object 按字段名匹配） */
var globalFieldFormats = new Map();
/** 全局字段 Include（plain object 按字段名回退） */
var globalFieldIncludes = new Map();
function fieldFormatMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(JSON_FORMAT_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
function fieldIncludeMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(JSON_INCLUDE_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
/**
 * 属性装饰器：自定义该字段序列化给前端的格式。
 *
 * @example
 * @JsonFormat({ pattern: 'yyyy-MM-dd HH:mm:ss' })
 * createTime?: Date;
 */
function JsonFormat(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey) {
        var _a;
        var ctor = target.constructor;
        var property = String(propertyKey);
        (0, beanKeys_1.addBeanKey)(ctor, property);
        var map = __assign(__assign({}, fieldFormatMap(ctor)), (_a = {}, _a[property] = { property: property, options: options }, _a));
        Reflect.defineMetadata(JSON_FORMAT_KEY, map, ctor);
        globalFieldFormats.set(property, options);
    };
}
/**
 * 类或属性装饰器：控制空值是否序列化（对齐 Jackson @JsonInclude）。
 *
 * @example
 * @JsonInclude(JsonIncludeType.NON_NULL)
 * class UserVO { ... }
 *
 * @JsonInclude(JsonIncludeType.NON_EMPTY)
 * tags?: string[];
 */
function JsonInclude(valueOrOptions) {
    if (valueOrOptions === void 0) { valueOrOptions = types_1.JsonIncludeType.NON_NULL; }
    var options = typeof valueOrOptions === "string"
        ? { value: valueOrOptions }
        : __assign({ value: types_1.JsonIncludeType.NON_NULL }, valueOrOptions);
    return (function (target, propertyKey) {
        var _a;
        // 属性装饰器
        if (propertyKey !== undefined) {
            var ctor = target.constructor;
            var property = String(propertyKey);
            (0, beanKeys_1.addBeanKey)(ctor, property);
            var map = __assign(__assign({}, fieldIncludeMap(ctor)), (_a = {}, _a[property] = { property: property, options: options }, _a));
            Reflect.defineMetadata(JSON_INCLUDE_KEY, map, ctor);
            globalFieldIncludes.set(property, options);
            return;
        }
        // 类装饰器
        Reflect.defineMetadata(JSON_CLASS_INCLUDE_KEY, options, target);
    });
}
/** plain object 序列化时按字段名回退查找 */
function getGlobalFieldFormat(property) {
    return globalFieldFormats.get(property);
}
function getGlobalFieldInclude(property) {
    return globalFieldIncludes.get(property);
}
/** 读取类上所有 @JsonFormat 元数据 */
function getJsonFieldFormats(ctor) {
    return Object.values(fieldFormatMap(ctor));
}
/** 读取单个属性的格式配置 */
function getJsonFieldFormat(ctor, property) {
    var _a;
    return (_a = fieldFormatMap(ctor)[property]) === null || _a === void 0 ? void 0 : _a.options;
}
/** 读取类级 @JsonInclude */
function getClassJsonInclude(ctor) {
    return Reflect.getOwnMetadata(JSON_CLASS_INCLUDE_KEY, ctor);
}
/** 读取类上字段级 @JsonInclude */
function getJsonFieldIncludes(ctor) {
    return Object.values(fieldIncludeMap(ctor));
}
function getJsonFieldInclude(ctor, property) {
    var _a;
    return (_a = fieldIncludeMap(ctor)[property]) === null || _a === void 0 ? void 0 : _a.options;
}
