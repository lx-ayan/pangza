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
exports.getOrmConfig = getOrmConfig;
exports.configureOrm = configureOrm;
exports.setMetaObjectHandler = setMetaObjectHandler;
exports.getMetaObjectHandler = getMetaObjectHandler;
var config_1 = require("@pangza/core/config");
var sqlLog_1 = require("./sqlLog");
var runtime = {};
var metaObjectHandler;
function strOrUndef(value) {
    var v = value === null || value === void 0 ? void 0 : value.trim();
    return v ? v : undefined;
}
/** 读取当前全局 ORM 配置（YAML + configure 覆盖） */
function getOrmConfig() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    return {
        logicDelete: (_a = runtime.logicDelete) !== null && _a !== void 0 ? _a : config_1.ormEnvConfig.logicDelete,
        logicDeleteField: (_b = runtime.logicDeleteField) !== null && _b !== void 0 ? _b : config_1.ormEnvConfig.logicDeleteField,
        logicDeleteValue: (_c = runtime.logicDeleteValue) !== null && _c !== void 0 ? _c : config_1.ormEnvConfig.logicDeleteValue,
        logicNotDeleteValue: (_d = runtime.logicNotDeleteValue) !== null && _d !== void 0 ? _d : config_1.ormEnvConfig.logicNotDeleteValue,
        optimisticLock: (_e = runtime.optimisticLock) !== null && _e !== void 0 ? _e : config_1.ormEnvConfig.optimisticLock,
        versionField: (_f = runtime.versionField) !== null && _f !== void 0 ? _f : config_1.ormEnvConfig.versionField,
        idType: (_g = runtime.idType) !== null && _g !== void 0 ? _g : config_1.ormEnvConfig.idType,
        mapUnderscoreToCamelCase: (_h = runtime.mapUnderscoreToCamelCase) !== null && _h !== void 0 ? _h : config_1.ormEnvConfig.mapUnderscoreToCamelCase,
        fillCreateTime: (_j = runtime.fillCreateTime) !== null && _j !== void 0 ? _j : strOrUndef(config_1.ormEnvConfig.fillCreateTime),
        fillUpdateTime: (_k = runtime.fillUpdateTime) !== null && _k !== void 0 ? _k : strOrUndef(config_1.ormEnvConfig.fillUpdateTime),
        fillCreateBy: (_l = runtime.fillCreateBy) !== null && _l !== void 0 ? _l : strOrUndef(config_1.ormEnvConfig.fillCreateBy),
        fillUpdateBy: (_m = runtime.fillUpdateBy) !== null && _m !== void 0 ? _m : strOrUndef(config_1.ormEnvConfig.fillUpdateBy),
        sqlLog: (_o = runtime.sqlLog) !== null && _o !== void 0 ? _o : config_1.ormEnvConfig.sqlLog,
        sqlLogFormat: (_p = runtime.sqlLogFormat) !== null && _p !== void 0 ? _p : config_1.ormEnvConfig.sqlLogFormat,
        sqlLogParts: (_q = runtime.sqlLogParts) !== null && _q !== void 0 ? _q : config_1.ormEnvConfig.sqlLogParts,
        sqlLogLevel: (_r = runtime.sqlLogLevel) !== null && _r !== void 0 ? _r : config_1.ormEnvConfig.sqlLogLevel,
        batchInsertSize: (_s = runtime.batchInsertSize) !== null && _s !== void 0 ? _s : config_1.ormEnvConfig.batchInsertSize,
        batchUpdateSize: (_t = runtime.batchUpdateSize) !== null && _t !== void 0 ? _t : config_1.ormEnvConfig.batchUpdateSize,
        batchInSize: (_u = runtime.batchInSize) !== null && _u !== void 0 ? _u : config_1.ormEnvConfig.batchInSize,
        mapperLocations: (_w = (_v = runtime.mapperLocations) !== null && _v !== void 0 ? _v : config_1.ormEnvConfig.mapperLocations) !== null && _w !== void 0 ? _w : [],
        mapperReload: (_y = (_x = runtime.mapperReload) !== null && _x !== void 0 ? _x : config_1.ormEnvConfig.mapperReload) !== null && _y !== void 0 ? _y : false,
    };
}
function syncSqlLogFromConfig() {
    var cfg = getOrmConfig();
    // 生产环境：除非 configureOrm / YAML 显式打开，否则强制关闭 SQL 日志
    var production = config_1.configProfile === "production";
    var enabled = production && runtime.sqlLog === undefined && config_1.ormEnvConfig.sqlLog !== true
        ? false
        : !!cfg.sqlLog;
    if (production && enabled) {
        console.warn("[ORM] 生产环境已开启 SQL 日志，请确认不会泄露敏感参数；日志已对 password/token 等字段脱敏");
    }
    (0, sqlLog_1.configureSqlLog)({
        enabled: enabled,
        format: cfg.sqlLogFormat,
        parts: cfg.sqlLogParts,
        level: cfg.sqlLogLevel,
    });
}
// 模块加载时按 YAML 同步一次
syncSqlLogFromConfig();
/**
 * 运行时覆盖全局配置（表级 MapperOptions 仍可再覆盖）。
 * 会清空 Mapper 缓存，使逻辑删除 / 乐观锁等快照配置生效。
 */
function configureOrm(patch) {
    if (patch === void 0) { patch = {}; }
    runtime = __assign(__assign({}, runtime), patch);
    syncSqlLogFromConfig();
    // 延迟加载，避免 config ↔ table ↔ BaseMapper 循环依赖
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var clearTableCache = require("./table").clearTableCache;
    clearTableCache();
}
/** 注册创建 / 修改拦截（在默认填充之后执行） */
function setMetaObjectHandler(handler) {
    metaObjectHandler = handler;
}
function getMetaObjectHandler() {
    return metaObjectHandler;
}
