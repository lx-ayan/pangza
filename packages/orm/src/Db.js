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
exports.getDialect = exports.DataSource = void 0;
var sqlLog_1 = require("./sqlLog");
var DataSource_1 = require("./DataSource");
Object.defineProperty(exports, "DataSource", { enumerable: true, get: function () { return DataSource_1.DataSource; } });
var dialect_1 = require("./dialect");
Object.defineProperty(exports, "getDialect", { enumerable: true, get: function () { return dialect_1.getDialect; } });
var config_1 = require("@pangza/core/config");
/**
 * 多数据源门面（默认名 default）。
 *
 * @example
 * // 默认库（项目根目录 application*.yaml 的 datasource.default）
 * await Db.query("SELECT 1")
 *
 * // 注册 PostgreSQL
 * Db.register("pg", { type: "postgresql", host: "127.0.0.1", database: "app", user: "postgres", password: "x" })
 * await Db.queryOn("pg", 'SELECT * FROM "user" WHERE id = ?', [1])
 *
 * // Mapper / 装饰器指定数据源
 * @Mapper(UserEntity, { datasource: "pg" })
 * @Select("SELECT ...", { datasource: "pg" })
 */
var Db = /** @class */ (function () {
    function Db() {
    }
    /** 注册或覆盖数据源 */
    Db.register = function (nameOrConfig, config) {
        var _a;
        var name;
        var cfg;
        if (typeof nameOrConfig === "string") {
            name = nameOrConfig.trim() || this.DEFAULT;
            cfg = __assign(__assign({}, (config !== null && config !== void 0 ? config : {})), { name: name });
        }
        else {
            cfg = __assign({}, nameOrConfig);
            name = ((_a = cfg.name) !== null && _a !== void 0 ? _a : this.DEFAULT).trim() || this.DEFAULT;
            cfg.name = name;
        }
        var ds = new DataSource_1.DataSource(cfg);
        this.sources.set(name, ds);
        return ds;
    };
    /** 确保默认数据源（来自 YAML datasource.default）；并按需注册 postgresql / sqlserver */
    Db.ensureDefault = function () {
        if (!this.sources.has(this.DEFAULT)) {
            this.register(this.DEFAULT, {
                name: this.DEFAULT,
                type: config_1.mysqlConfig.type || "mysql",
                host: config_1.mysqlConfig.host,
                port: config_1.mysqlConfig.port,
                user: config_1.mysqlConfig.user,
                password: config_1.mysqlConfig.password,
                database: config_1.mysqlConfig.database,
                connectionLimit: config_1.mysqlConfig.connectionLimit,
            });
        }
        this.registerOptionalFromEnv();
        return this.sources.get(this.DEFAULT);
    };
    /** YAML 中 postgresql / sqlserver 的 host 非空时自动注册命名数据源 */
    Db.registerOptionalFromEnv = function () {
        if (config_1.postgresqlConfig.host && !this.sources.has("postgresql")) {
            this.register("postgresql", {
                name: "postgresql",
                type: "postgresql",
                host: config_1.postgresqlConfig.host,
                port: config_1.postgresqlConfig.port,
                user: config_1.postgresqlConfig.user,
                password: config_1.postgresqlConfig.password,
                database: config_1.postgresqlConfig.database,
                connectionLimit: config_1.postgresqlConfig.connectionLimit,
            });
        }
        if (config_1.mssqlConfig.host && !this.sources.has("sqlserver")) {
            this.register("sqlserver", {
                name: "sqlserver",
                type: "sqlserver",
                host: config_1.mssqlConfig.host,
                port: config_1.mssqlConfig.port,
                user: config_1.mssqlConfig.user,
                password: config_1.mssqlConfig.password,
                database: config_1.mssqlConfig.database,
                connectionLimit: config_1.mssqlConfig.connectionLimit,
            });
        }
    };
    Db.getDataSource = function (name) {
        if (name === void 0) { name = this.DEFAULT; }
        if (name === this.DEFAULT) {
            return this.ensureDefault();
        }
        var ds = this.sources.get(name);
        if (!ds) {
            this.ensureDefault();
            var registered = __spreadArray([], this.sources.keys(), true).join(", ") || "(无)";
            throw new Error("\u672A\u6CE8\u518C\u6570\u636E\u6E90 [".concat(name, "]\u3002\u5DF2\u6CE8\u518C: ").concat(registered, "\u3002\u8BF7\u5148 Db.register(\"").concat(name, "\", { type, host, ... })"));
        }
        return ds;
    };
    /** 按数据库类型查找唯一数据源（用于 @Select({ db: "postgresql" })） */
    Db.findByType = function (type) {
        this.ensureDefault();
        var dialect = (0, dialect_1.getDialect)(type);
        var matched = __spreadArray([], this.sources.entries(), true).filter(function (_a) {
            var ds = _a[1];
            return ds.type === dialect.type;
        });
        if (matched.length === 0) {
            throw new Error("\u6CA1\u6709\u5DF2\u6CE8\u518C\u7684 ".concat(dialect.type, " \u6570\u636E\u6E90"));
        }
        if (matched.length > 1) {
            throw new Error("\u5B58\u5728\u591A\u4E2A ".concat(dialect.type, " \u6570\u636E\u6E90 (").concat(matched
                .map(function (_a) {
                var n = _a[0];
                return n;
            })
                .join(", "), ")\uFF0C\u8BF7\u7528 datasource \u6307\u5B9A\u540D\u79F0"));
        }
        return matched[0][0];
    };
    Db.getDialect = function (name) {
        if (name === void 0) { name = this.DEFAULT; }
        return this.getDataSource(name).dialect;
    };
    Db.listDataSources = function () {
        this.ensureDefault();
        return __spreadArray([], this.sources.keys(), true);
    };
    /** @deprecated 使用 register；保留覆盖默认连接配置 */
    Db.configure = function (config) {
        if (config === void 0) { config = {}; }
        this.register(this.DEFAULT, __assign(__assign({ type: config_1.mysqlConfig.type || "mysql", host: config_1.mysqlConfig.host, port: config_1.mysqlConfig.port, user: config_1.mysqlConfig.user, password: config_1.mysqlConfig.password, database: config_1.mysqlConfig.database, connectionLimit: config_1.mysqlConfig.connectionLimit }, config), { name: this.DEFAULT }));
    };
    Db.isReady = function (name) {
        var _a, _b;
        if (name === void 0) { name = this.DEFAULT; }
        return (_b = (_a = this.sources.get(name)) === null || _a === void 0 ? void 0 : _a.isReady()) !== null && _b !== void 0 ? _b : false;
    };
    /** 测试注入默认池驱动 */
    Db.usePoolForTest = function (pool) {
        var ds = this.ensureDefault();
        // 兼容旧测试：传入 mysql2 Pool
        if (pool && typeof pool.execute === "function") {
            var mysqlPool_1 = pool;
            ds.useDriverForTest({
                query: function (sql, params) {
                    return __awaiter(this, void 0, void 0, function () {
                        var rows;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, mysqlPool_1.execute(sql, params)];
                                case 1:
                                    rows = (_a.sent())[0];
                                    return [2 /*return*/, rows];
                            }
                        });
                    });
                },
                getConnection: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var conn;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, mysqlPool_1.getConnection()];
                                case 1:
                                    conn = _a.sent();
                                    return [2 /*return*/, {
                                            query: function (sql, params) {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    var rows;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, conn.execute(sql, params)];
                                                            case 1:
                                                                rows = (_a.sent())[0];
                                                                return [2 /*return*/, rows];
                                                        }
                                                    });
                                                });
                                            },
                                            begin: function () {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, conn.beginTransaction()];
                                                            case 1:
                                                                _a.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                });
                                            },
                                            commit: function () {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, conn.commit()];
                                                            case 1:
                                                                _a.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                });
                                            },
                                            rollback: function () {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, conn.rollback()];
                                                            case 1:
                                                                _a.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                });
                                            },
                                            release: function () {
                                                conn.release();
                                            },
                                        }];
                            }
                        });
                    });
                },
                end: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, mysqlPool_1.end()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                },
            });
            return;
        }
        ds.useDriverForTest(pool);
    };
    Db.connect = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config)
                            this.configure(config);
                        return [4 /*yield*/, this.ensureDefault().connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Db.connectAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureDefault();
                        return [4 /*yield*/, Promise.all(__spreadArray([], this.sources.values(), true).map(function (ds) { return ds.connect(); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Db.disconnect = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!name) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this.sources.get(name)) === null || _a === void 0 ? void 0 : _a.disconnect())];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, Promise.all(__spreadArray([], this.sources.values(), true).map(function (ds) { return ds.disconnect(); }))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Db.inTransaction = function (name) {
        if (name === void 0) { name = this.DEFAULT; }
        return this.getDataSource(name).inTransaction();
    };
    /** 默认数据源执行 SQL */
    Db.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.queryOn(this.DEFAULT, sql, params)];
            });
        });
    };
    /** 指定数据源执行 SQL */
    Db.queryOn = function (datasource_1, sql_1) {
        return __awaiter(this, arguments, void 0, function (datasource, sql, params) {
            var _this = this;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, sqlLog_1.withSqlLog)(sql, params, function () { return __awaiter(_this, void 0, void 0, function () {
                        var ds;
                        return __generator(this, function (_a) {
                            ds = this.getDataSource(datasource);
                            return [2 /*return*/, ds.query(sql, params)];
                        });
                    }); })];
            });
        });
    };
    Db.getPool = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureDefault().connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.ensureDefault()];
                }
            });
        });
    };
    Db.transaction = function (fn, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transactionOn(this.DEFAULT, fn, options)];
            });
        });
    };
    Db.transactionOn = function (datasource, fn, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getDataSource(datasource).transaction(fn, options)];
            });
        });
    };
    Db.sources = new Map();
    Db.DEFAULT = "default";
    return Db;
}());
exports.default = Db;
