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
exports.registerFieldSelect = registerFieldSelect;
exports.getFieldSelects = getFieldSelects;
exports.getFieldSelect = getFieldSelect;
require("reflect-metadata");
var beanKeys_1 = require("@pangza/core/Json/beanKeys");
var FIELD_SELECT_KEY = Symbol.for("pangza.orm.fieldSelect");
function fieldSelectMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(FIELD_SELECT_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
/** 注册属性级 @Select */
function registerFieldSelect(ctor, property, sql, options) {
    var _a;
    var _b, _c, _d, _e;
    if (options === void 0) { options = {}; }
    var template = String(sql).trim();
    if (!template) {
        throw new Error("@Select 字段 SQL 不能为空");
    }
    // 延迟检查关联，避免 relation ↔ fieldSelect 循环依赖在加载期炸
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        var getRelation = require("./relation").getRelation;
        if (getRelation(ctor, property)) {
            throw new Error("\u5B57\u6BB5 @Select(".concat(property, ") \u4E0E\u5173\u8054\u88C5\u9970\u5668\u4E0D\u80FD\u540C\u65F6\u7528\u4E8E\u540C\u4E00\u5C5E\u6027"));
        }
    }
    catch (err) {
        if (err instanceof Error && /不能同时/.test(err.message))
            throw err;
    }
    (0, beanKeys_1.addBeanKey)(ctor, property);
    var map = __assign(__assign({}, fieldSelectMap(ctor)), (_a = {}, _a[property] = {
        property: property,
        sql: template,
        many: options.many === true,
        column: ((_b = options.column) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
        depth: Math.max(0, (_c = options.depth) !== null && _c !== void 0 ? _c : 0),
        eager: options.eager !== false,
        datasource: ((_d = options.datasource) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
        db: ((_e = options.db) === null || _e === void 0 ? void 0 : _e.trim()) || undefined,
    }, _a));
    Reflect.defineMetadata(FIELD_SELECT_KEY, map, ctor);
}
/** 读取实体上全部字段级 @Select */
function getFieldSelects(ctor) {
    return Object.values(fieldSelectMap(ctor));
}
function getFieldSelect(ctor, property) {
    return fieldSelectMap(ctor)[property];
}
