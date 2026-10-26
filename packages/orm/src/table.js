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
exports.useTable = void 0;
exports.table = table;
exports.clearTableCache = clearTableCache;
exports.normalizeOptions = normalizeOptions;
var BaseMapper_1 = require("./BaseMapper");
/** 按表配置缓存 Mapper，避免重复 new */
var mapperCache = new Map();
function normalizeOptions(tableName, idFieldOrOptions) {
    if (typeof idFieldOrOptions === "string" || idFieldOrOptions === undefined) {
        return { table: tableName, idField: idFieldOrOptions !== null && idFieldOrOptions !== void 0 ? idFieldOrOptions : "id" };
    }
    return __assign({ table: tableName, idField: "id" }, idFieldOrOptions);
}
function cacheKey(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return JSON.stringify({
        table: options.table,
        idField: (_a = options.idField) !== null && _a !== void 0 ? _a : "id",
        datasource: (_b = options.datasource) !== null && _b !== void 0 ? _b : "default",
        logicDelete: (_c = options.logicDelete) !== null && _c !== void 0 ? _c : null,
        logicDeleteField: (_d = options.logicDeleteField) !== null && _d !== void 0 ? _d : null,
        logicDeleteValue: (_e = options.logicDeleteValue) !== null && _e !== void 0 ? _e : null,
        logicNotDeleteValue: (_f = options.logicNotDeleteValue) !== null && _f !== void 0 ? _f : null,
        optimisticLock: (_g = options.optimisticLock) !== null && _g !== void 0 ? _g : null,
        versionField: (_h = options.versionField) !== null && _h !== void 0 ? _h : null,
        fill: (_j = options.fill) !== null && _j !== void 0 ? _j : null,
        updateNullStrategy: (_k = options.updateNullStrategy) !== null && _k !== void 0 ? _k : null,
        entity: (_m = (_l = options.entity) === null || _l === void 0 ? void 0 : _l.name) !== null && _m !== void 0 ? _m : null,
    });
}
/**
 * 获取表对应的 BaseMapper（单例缓存）
 *
 * @example
 * await table('user').selectById(1)
 * await table('user', { logicDelete: true }).selectList()
 */
function table(tableName, idFieldOrOptions) {
    var options = normalizeOptions(tableName, idFieldOrOptions);
    var key = cacheKey(options);
    var mapper = mapperCache.get(key);
    if (!mapper) {
        mapper = new BaseMapper_1.BaseMapper(options);
        mapperCache.set(key, mapper);
    }
    return mapper;
}
/** 清除 Mapper 缓存（一般仅测试用；改全局 ORM 配置后可调用） */
function clearTableCache() {
    mapperCache.clear();
}
/** useTable 别名，语义更贴近 hooks 风格 */
exports.useTable = table;
