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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConditionOnPropertyPrefix = exports.applyConditionOnProperty = exports.ConditionOnProperty = exports.ormEnvConfig = exports.UPLOAD_URL_PREFIX = exports.UPLOAD_PATH = exports.mssqlConfig = exports.postgresqlConfig = exports.mysqlConfig = exports.redisConfig = exports.trustProxy = exports.PORT = exports.configFiles = exports.configProfile = void 0;
exports.getConfig = getConfig;
exports.parseValueExpression = parseValueExpression;
exports.coerceConfigScalar = coerceConfigScalar;
exports.getConfigValue = getConfigValue;
var fs_1 = require("fs");
var path_1 = require("path");
var js_yaml_1 = require("js-yaml");
var PROFILE_ALIAS = {
    dev: "development",
    development: "development",
    prod: "production",
    production: "production",
    test: "test",
};
function isPlain(value) {
    return value != null && typeof value === "object" && !Array.isArray(value);
}
function deepMerge(base, over) {
    var out = __assign({}, base);
    for (var _i = 0, _a = Object.entries(over); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value === undefined)
            continue;
        if (isPlain(value) && isPlain(out[key])) {
            out[key] = deepMerge(out[key], value);
        }
        else {
            out[key] = value;
        }
    }
    return out;
}
function readYamlFile(file) {
    if (!fs_1.default.existsSync(file))
        return {};
    var doc = js_yaml_1.default.load(fs_1.default.readFileSync(file, "utf8"));
    if (doc == null)
        return {};
    if (!isPlain(doc)) {
        throw new Error("\u914D\u7F6E\u6587\u4EF6\u5FC5\u987B\u662F YAML \u5BF9\u8C61: ".concat(file));
    }
    return doc;
}
function resolveProfile() {
    var _a;
    var raw = (process.env.PANGZA_PROFILE ||
        process.env.APP_ENV ||
        process.env.NODE_ENV ||
        "development").trim();
    var key = raw.toLowerCase();
    return (_a = PROFILE_ALIAS[key]) !== null && _a !== void 0 ? _a : key;
}
/** `--config <path>` / `--config=<path>`，否则 `CONFIG_PATH` */
function externalConfigPath() {
    var _a;
    var argv = process.argv;
    for (var i = 0; i < argv.length; i++) {
        var arg = argv[i];
        if (arg === "--config" && argv[i + 1])
            return argv[i + 1];
        if (arg.startsWith("--config=")) {
            var value = arg.slice("--config=".length).trim();
            if (value)
                return value;
        }
    }
    var fromEnv = (_a = process.env.CONFIG_PATH) === null || _a === void 0 ? void 0 : _a.trim();
    return fromEnv || undefined;
}
function loadAppYaml() {
    var root = process.cwd();
    var profile = resolveProfile();
    var files = [
        path_1.default.join(root, "application.yaml"),
        path_1.default.join(root, "application-".concat(profile, ".yaml")),
    ];
    var external = externalConfigPath();
    if (external) {
        var resolved = path_1.default.resolve(root, external);
        if (!fs_1.default.existsSync(resolved)) {
            throw new Error("\u6307\u5B9A\u7684\u914D\u7F6E\u6587\u4EF6\u4E0D\u5B58\u5728: ".concat(resolved));
        }
        files.push(resolved);
    }
    if (!fs_1.default.existsSync(files[0])) {
        throw new Error("\u7F3A\u5C11\u57FA\u7840\u914D\u7F6E: ".concat(files[0]));
    }
    var merged = {};
    var loaded = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (!fs_1.default.existsSync(file))
            continue;
        merged = deepMerge(merged, readYamlFile(file));
        loaded.push(file);
    }
    return { config: merged, profile: profile, files: loaded };
}
var loaded = loadAppYaml();
var appYaml = loaded.config;
/** 当前环境名（development / production / test，或自定义） */
exports.configProfile = loaded.profile;
/** 实际读入的配置文件（后者覆盖前者） */
exports.configFiles = loaded.files;
/** 合并后的 YAML 根对象（只读视图，勿原地改） */
function getConfig() {
    return appYaml;
}
/** `${server.port}` / `${server.port:3990}` → path + 可选默认值字符串 */
var VALUE_PLACEHOLDER = /^\$\{([^}:]+)(?::([^}]*))?\}$/;
function parseValueExpression(expression) {
    var trimmed = expression.trim();
    var matched = VALUE_PLACEHOLDER.exec(trimmed);
    if (matched) {
        return {
            path: matched[1].trim(),
            defaultText: matched[2] !== undefined ? matched[2] : undefined,
        };
    }
    return { path: trimmed };
}
/** 占位符默认值轻量转换：true/false/null/数字，其余保持字符串 */
function coerceConfigScalar(raw) {
    if (raw === "true")
        return true;
    if (raw === "false")
        return false;
    if (raw === "null")
        return null;
    if (raw === "")
        return "";
    if (/^-?\d+$/.test(raw))
        return Number(raw);
    if (/^-?\d+\.\d+$/.test(raw))
        return Number(raw);
    return raw;
}
/**
 * 按点路径读取 YAML 配置。
 *
 * @example
 * getConfigValue("server.port")
 * getConfigValue("redis.host", "127.0.0.1")
 * getConfigValue("${orm.logicDelete:true}")
 */
function getConfigValue(pathOrExpression, defaultValue) {
    var _a = parseValueExpression(pathOrExpression), path = _a.path, defaultText = _a.defaultText;
    var fallback = defaultValue !== undefined
        ? defaultValue
        : defaultText !== undefined
            ? coerceConfigScalar(defaultText)
            : undefined;
    var parts = path.split(".").map(function (p) { return p.trim(); }).filter(Boolean);
    if (parts.length === 0)
        return fallback;
    var current = appYaml;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (current == null || typeof current !== "object") {
            return fallback;
        }
        current = current[part];
    }
    if (current === undefined)
        return fallback;
    return current;
}
function asString(value, fallback) {
    if (fallback === void 0) { fallback = ""; }
    if (value == null)
        return fallback;
    return String(value);
}
function asInt(value, fallback) {
    if (value == null || value === "")
        return fallback;
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}
function asBool(value, fallback) {
    if (value == null || value === "")
        return fallback;
    if (typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return value !== 0;
    var text = String(value).toLowerCase();
    return text === "1" || text === "true";
}
function defaultDbPort(type) {
    if (type === "postgresql")
        return 5432;
    if (type === "sqlserver")
        return 1433;
    return 3306;
}
function mapDatasource(raw, defaults) {
    var _a;
    var type = asString(raw === null || raw === void 0 ? void 0 : raw.type, defaults.type) || defaults.type;
    var host = asString(raw === null || raw === void 0 ? void 0 : raw.host, "");
    var enabled = (raw === null || raw === void 0 ? void 0 : raw.enabled) === false ? false : host !== "";
    return {
        type: type,
        host: host,
        port: asInt(raw === null || raw === void 0 ? void 0 : raw.port, (_a = defaults.port) !== null && _a !== void 0 ? _a : defaultDbPort(type)),
        user: asString(raw === null || raw === void 0 ? void 0 : raw.user, defaults.user),
        password: asString(raw === null || raw === void 0 ? void 0 : raw.password, ""),
        database: asString(raw === null || raw === void 0 ? void 0 : raw.database, defaults.database),
        connectionLimit: asInt(raw === null || raw === void 0 ? void 0 : raw.connectionLimit, 10),
        enabled: enabled,
    };
}
var defaultDs = mapDatasource((_a = appYaml.datasource) === null || _a === void 0 ? void 0 : _a.default, {
    type: "mysql",
    user: "root",
    database: "pangza",
    port: undefined,
});
/** 服务端口 */
exports.PORT = asInt((_b = appYaml.server) === null || _b === void 0 ? void 0 : _b.port, 3990);
/**
 * 是否信任反向代理的客户端 IP 头。
 * false（默认）：`getClientIp` / Express `req.ip` 只用直连地址。
 */
exports.trustProxy = asBool((_c = appYaml.server) === null || _c === void 0 ? void 0 : _c.trustProxy, false);
var redisTls = (_e = (_d = appYaml.redis) === null || _d === void 0 ? void 0 : _d.tls) !== null && _e !== void 0 ? _e : {};
var redisModeRaw = asString((_f = appYaml.redis) === null || _f === void 0 ? void 0 : _f.mode, "standalone").toLowerCase();
var redisMode = redisModeRaw === "cluster" || redisModeRaw === "sentinel"
    ? redisModeRaw
    : "standalone";
function parseRedisNodes(nodes, defaultPort) {
    if (!Array.isArray(nodes))
        return [];
    return nodes
        .map(function (n) { return ({
        host: asString(n === null || n === void 0 ? void 0 : n.host, "").trim(),
        port: asInt(n === null || n === void 0 ? void 0 : n.port, defaultPort),
    }); })
        .filter(function (n) { return n.host.length > 0; });
}
/** Redis 配置 */
exports.redisConfig = {
    host: asString((_g = appYaml.redis) === null || _g === void 0 ? void 0 : _g.host, "127.0.0.1"),
    port: asInt((_h = appYaml.redis) === null || _h === void 0 ? void 0 : _h.port, 6379),
    password: asString((_j = appYaml.redis) === null || _j === void 0 ? void 0 : _j.password, ""),
    username: asString((_k = appYaml.redis) === null || _k === void 0 ? void 0 : _k.username, ""),
    db: asInt((_l = appYaml.redis) === null || _l === void 0 ? void 0 : _l.db, 0),
    keyPrefix: asString((_m = appYaml.redis) === null || _m === void 0 ? void 0 : _m.keyPrefix, "pangza:"),
    connectTimeout: Math.max(500, asInt((_o = appYaml.redis) === null || _o === void 0 ? void 0 : _o.connectTimeout, 3000)),
    reconnect: asBool((_p = appYaml.redis) === null || _p === void 0 ? void 0 : _p.reconnect, true),
    maxReconnectDelay: Math.max(1000, asInt((_q = appYaml.redis) === null || _q === void 0 ? void 0 : _q.maxReconnectDelay, 10000)),
    mode: redisMode,
    tls: {
        enabled: asBool(redisTls.enabled, false),
        rejectUnauthorized: asBool(redisTls.rejectUnauthorized, true),
        ca: asString(redisTls.ca, "") || undefined,
        cert: asString(redisTls.cert, "") || undefined,
        key: asString(redisTls.key, "") || undefined,
    },
    cluster: {
        nodes: parseRedisNodes((_s = (_r = appYaml.redis) === null || _r === void 0 ? void 0 : _r.cluster) === null || _s === void 0 ? void 0 : _s.nodes, 6379),
        useReplicas: asBool((_u = (_t = appYaml.redis) === null || _t === void 0 ? void 0 : _t.cluster) === null || _u === void 0 ? void 0 : _u.useReplicas, false),
    },
    sentinel: {
        name: asString((_w = (_v = appYaml.redis) === null || _v === void 0 ? void 0 : _v.sentinel) === null || _w === void 0 ? void 0 : _w.name, "") || undefined,
        nodes: parseRedisNodes((_y = (_x = appYaml.redis) === null || _x === void 0 ? void 0 : _x.sentinel) === null || _y === void 0 ? void 0 : _y.nodes, 26379),
    },
};
/**
 * 默认数据源（项目根目录 application*.yaml 的 datasource.default）。
 * host 为空时仍注册 default，使用默认主机 127.0.0.1。
 */
exports.mysqlConfig = {
    type: defaultDs.type || "mysql",
    host: defaultDs.host || "127.0.0.1",
    port: defaultDs.port,
    user: defaultDs.user,
    password: defaultDs.password,
    database: defaultDs.database,
    connectionLimit: defaultDs.connectionLimit,
};
var pgDs = mapDatasource((_z = appYaml.datasource) === null || _z === void 0 ? void 0 : _z.postgresql, {
    type: "postgresql",
    user: "postgres",
    database: "pangza",
    port: 5432,
});
/** PostgreSQL 附加数据源（host 非空且未 enabled: false 时注册为 "postgresql"） */
exports.postgresqlConfig = {
    host: pgDs.enabled ? pgDs.host : "",
    port: pgDs.port,
    user: pgDs.user,
    password: pgDs.password,
    database: pgDs.database,
    connectionLimit: pgDs.connectionLimit,
};
var mssqlDs = mapDatasource((_0 = appYaml.datasource) === null || _0 === void 0 ? void 0 : _0.sqlserver, {
    type: "sqlserver",
    user: "sa",
    database: "pangza",
    port: 1433,
});
/** SQL Server 附加数据源（host 非空且未 enabled: false 时注册为 "sqlserver"） */
exports.mssqlConfig = {
    host: mssqlDs.enabled ? mssqlDs.host : "",
    port: mssqlDs.port,
    user: mssqlDs.user,
    password: mssqlDs.password,
    database: mssqlDs.database,
    connectionLimit: mssqlDs.connectionLimit,
};
/** 上传目录（相对路径相对项目根目录） */
exports.UPLOAD_PATH = (function () {
    var _a;
    var raw = asString((_a = appYaml.upload) === null || _a === void 0 ? void 0 : _a.path, "");
    if (!raw)
        return path_1.default.resolve(process.cwd(), "upload");
    return path_1.default.isAbsolute(raw) ? raw : path_1.default.resolve(process.cwd(), raw);
})();
/** 上传访问前缀 */
exports.UPLOAD_URL_PREFIX = asString((_1 = appYaml.upload) === null || _1 === void 0 ? void 0 : _1.urlPrefix, "/files");
var orm = (_2 = appYaml.orm) !== null && _2 !== void 0 ? _2 : {};
var sqlLog = (_3 = orm.sqlLog) !== null && _3 !== void 0 ? _3 : {};
var sqlParts = (_4 = sqlLog.parts) !== null && _4 !== void 0 ? _4 : {};
/** ORM 默认配置（逻辑删除 / 乐观锁 / 自动填充字段名） */
exports.ormEnvConfig = {
    logicDelete: asBool(orm.logicDelete, true),
    logicDeleteField: asString(orm.logicDeleteField, "delete_flag"),
    logicDeleteValue: (_5 = orm.logicDeleteValue) !== null && _5 !== void 0 ? _5 : 1,
    logicNotDeleteValue: (_6 = orm.logicNotDeleteValue) !== null && _6 !== void 0 ? _6 : 0,
    optimisticLock: asBool(orm.optimisticLock, false),
    versionField: asString(orm.versionField, "version"),
    /** 全局主键策略：AUTO | NONE | INPUT | ASSIGN_ID | ASSIGN_UUID */
    idType: asString(orm.idType, "ASSIGN_ID"),
    mapUnderscoreToCamelCase: asBool(orm.mapUnderscoreToCamelCase, true),
    workerId: asInt(orm.workerId, 1),
    fillCreateTime: asString((_7 = orm.fill) === null || _7 === void 0 ? void 0 : _7.createTime, "create_time"),
    fillUpdateTime: asString((_8 = orm.fill) === null || _8 === void 0 ? void 0 : _8.updateTime, "update_time"),
    fillCreateBy: asString((_9 = orm.fill) === null || _9 === void 0 ? void 0 : _9.createBy, "create_by"),
    fillUpdateBy: asString((_10 = orm.fill) === null || _10 === void 0 ? void 0 : _10.updateBy, "update_by"),
    sqlLog: asBool(sqlLog.enabled, false),
    sqlLogFormat: asString(sqlLog.format, "{time} [{type}] {cost}ms | {sql} | params={params}"),
    sqlLogParts: {
        time: asBool(sqlParts.time, true),
        type: asBool(sqlParts.type, true),
        sql: asBool(sqlParts.sql, true),
        params: asBool(sqlParts.params, true),
        cost: asBool(sqlParts.cost, true),
    },
    sqlLogLevel: (asString(sqlLog.level, "info") || "info"),
    /** saveBatch 每批条数 */
    batchInsertSize: Math.max(1, asInt((_11 = orm.batch) === null || _11 === void 0 ? void 0 : _11.insertSize, 200)),
    /** updateBatch 每批条数 */
    batchUpdateSize: Math.max(1, asInt((_12 = orm.batch) === null || _12 === void 0 ? void 0 : _12.updateSize, 200)),
    /** deleteByIds / QueryWrapper.in 等 IN (...) 每批个数 */
    batchInSize: Math.max(1, asInt((_13 = orm.batch) === null || _13 === void 0 ? void 0 : _13.inSize, 500)),
    /** XML Mapper 扫描路径 */
    mapperLocations: Array.isArray(orm.mapperLocations)
        ? orm.mapperLocations.map(function (s) { return String(s).trim(); }).filter(Boolean)
        : [],
    mapperReload: asBool(orm.mapperReload, false),
};
console.info("[config] profile=".concat(exports.configProfile, " files=").concat(exports.configFiles
    .map(function (file) { return path_1.default.relative(process.cwd(), file) || file; })
    .join(", ")));
var ConditionOnProperty_1 = require("./ConditionOnProperty");
Object.defineProperty(exports, "ConditionOnProperty", { enumerable: true, get: function () { return ConditionOnProperty_1.ConditionOnProperty; } });
Object.defineProperty(exports, "applyConditionOnProperty", { enumerable: true, get: function () { return ConditionOnProperty_1.applyConditionOnProperty; } });
Object.defineProperty(exports, "getConditionOnPropertyPrefix", { enumerable: true, get: function () { return ConditionOnProperty_1.getConditionOnPropertyPrefix; } });
