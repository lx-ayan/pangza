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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
var async_hooks_1 = require("async_hooks");
var Logger_1 = require("@pangza/core/Logger");
var dialect_1 = require("./dialect");
var log = (0, Logger_1.getLogger)("ORM");
/**
 * 单个命名数据源：连接池 + 方言 + 事务 ALS。
 */
var DataSource = /** @class */ (function () {
    function DataSource(config) {
        if (config === void 0) { config = {}; }
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.driver = null;
        this.connecting = null;
        this.suppressConnect = false;
        this.txStore = new async_hooks_1.AsyncLocalStorage();
        this.name = ((_a = config.name) !== null && _a !== void 0 ? _a : "default").trim() || "default";
        this.dialect = (0, dialect_1.getDialect)((_b = config.type) !== null && _b !== void 0 ? _b : "mysql");
        this.type = this.dialect.type;
        this.config = __assign(__assign({ host: (_c = config.host) !== null && _c !== void 0 ? _c : "127.0.0.1", port: (_d = config.port) !== null && _d !== void 0 ? _d : (this.type === "postgresql"
                ? 5432
                : this.type === "sqlserver"
                    ? 1433
                    : 3306), user: (_e = config.user) !== null && _e !== void 0 ? _e : "root", password: (_f = config.password) !== null && _f !== void 0 ? _f : "", database: (_g = config.database) !== null && _g !== void 0 ? _g : "pangza", connectionLimit: (_h = config.connectionLimit) !== null && _h !== void 0 ? _h : 10 }, config), { name: this.name, type: this.type });
    }
    /** 测试注入 */
    DataSource.prototype.useDriverForTest = function (driver) {
        this.suppressConnect = true;
        this.driver = driver;
    };
    DataSource.prototype.isReady = function () {
        return !!this.driver;
    };
    DataSource.prototype.inTransaction = function () {
        return !!this.txStore.getStore();
    };
    DataSource.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.suppressConnect)
                            return [2 /*return*/];
                        if (this.driver)
                            return [2 /*return*/];
                        if (this.connecting)
                            return [2 /*return*/, this.connecting];
                        this.connecting = (function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (this.suppressConnect)
                                            return [2 /*return*/];
                                        _a = this;
                                        return [4 /*yield*/, createDriver(this.type, this.config)];
                                    case 1:
                                        _a.driver = _b.sent();
                                        // 探活
                                        return [4 /*yield*/, this.driver.query(this.type === "postgresql" ? "SELECT 1 AS ok" : "SELECT 1 AS ok", [])];
                                    case 2:
                                        // 探活
                                        _b.sent();
                                        log.info("[".concat(this.name, "] \u5DF2\u8FDE\u63A5 ").concat(this.type, " ").concat(this.config.host, ":").concat(this.config.port, "/").concat(this.config.database));
                                        return [2 /*return*/];
                                }
                            });
                        }); })();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.connecting];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.connecting = null;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DataSource.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.driver)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.driver.end()];
                    case 1:
                        _a.sent();
                        this.driver = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    DataSource.prototype.ensureReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.driver) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.driver) {
                            throw new Error("\u6570\u636E\u6E90 [".concat(this.name, "] \u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E (type=").concat(this.type, ")"));
                        }
                        return [2 /*return*/, this.driver];
                }
            });
        });
    };
    /** 执行 SQL（自动按方言转换占位符） */
    DataSource.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var executable, tx, driver;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executable = this.dialect.convertPlaceholders(sql);
                        tx = this.txStore.getStore();
                        if (!tx) return [3 /*break*/, 2];
                        return [4 /*yield*/, tx.query(executable, params)];
                    case 1: return [2 /*return*/, (_a.sent())];
                    case 2: return [4 /*yield*/, this.ensureReady()];
                    case 3:
                        driver = _a.sent();
                        return [4 /*yield*/, driver.query(executable, params)];
                    case 4: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    /**
     * 开启事务。
     * - REQUIRED（默认）：已有事务则加入，否则新建
     * - REQUIRES_NEW：始终新建独立连接事务（外层事务挂起，内层提交/回滚互不影响）
     */
    DataSource.prototype.transaction = function (fn, options) {
        return __awaiter(this, void 0, void 0, function () {
            var propagation, current, driver, conn, result, err_1, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        propagation = (_b = options === null || options === void 0 ? void 0 : options.propagation) !== null && _b !== void 0 ? _b : "REQUIRED";
                        current = this.txStore.getStore();
                        if (propagation === "REQUIRED" && current) {
                            return [2 /*return*/, fn()];
                        }
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        driver = _c.sent();
                        return [4 /*yield*/, driver.getConnection()];
                    case 2:
                        conn = _c.sent();
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 7, 12, 13]);
                        return [4 /*yield*/, conn.begin()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, this.txStore.run(conn, function () { return fn(); })];
                    case 5:
                        result = _c.sent();
                        return [4 /*yield*/, conn.commit()];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, result];
                    case 7:
                        err_1 = _c.sent();
                        _c.label = 8;
                    case 8:
                        _c.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, conn.rollback()];
                    case 9:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _a = _c.sent();
                        return [3 /*break*/, 11];
                    case 11: throw err_1;
                    case 12:
                        conn.release();
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return DataSource;
}());
exports.DataSource = DataSource;
function createDriver(type, config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (type === "mysql") {
                return [2 /*return*/, createMysqlDriver(config)];
            }
            if (type === "postgresql") {
                return [2 /*return*/, createPgDriver(config)];
            }
            return [2 /*return*/, createMssqlDriver(config)];
        });
    });
}
function createMysqlDriver(config) {
    return __awaiter(this, void 0, void 0, function () {
        var mysql, pool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("mysql2/promise"); })];
                case 1:
                    mysql = _a.sent();
                    pool = mysql.createPool({
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        database: config.database,
                        connectionLimit: config.connectionLimit,
                        waitForConnections: true,
                        namedPlaceholders: false,
                    });
                    return [2 /*return*/, {
                            query: function (sql, params) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var rows;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, pool.execute(sql, params)];
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
                                            case 0: return [4 /*yield*/, pool.getConnection()];
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
                                            case 0: return [4 /*yield*/, pool.end()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        }];
            }
        });
    });
}
function createPgDriver(config) {
    return __awaiter(this, void 0, void 0, function () {
        var pg, pool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("pg"); })];
                case 1:
                    pg = _a.sent();
                    pool = new pg.Pool({
                        host: config.host,
                        port: config.port,
                        user: config.user,
                        password: config.password,
                        database: config.database,
                        max: config.connectionLimit,
                    });
                    return [2 /*return*/, {
                            query: function (sql, params) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var res;
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0: return [4 /*yield*/, pool.query(sql, params)];
                                            case 1:
                                                res = _c.sent();
                                                // SELECT / RETURNING → rows；DML → 兼容 header
                                                if (Array.isArray(res.rows) && res.rows.length > 0) {
                                                    return [2 /*return*/, res.rows];
                                                }
                                                if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) {
                                                    return [2 /*return*/, {
                                                            insertId: 0,
                                                            affectedRows: (_a = res.rowCount) !== null && _a !== void 0 ? _a : 0,
                                                            rowCount: (_b = res.rowCount) !== null && _b !== void 0 ? _b : 0,
                                                            rows: res.rows,
                                                        }];
                                                }
                                                return [2 /*return*/, res.rows];
                                        }
                                    });
                                });
                            },
                            getConnection: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var client;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, pool.connect()];
                                            case 1:
                                                client = _a.sent();
                                                return [2 /*return*/, {
                                                        query: function (sql, params) {
                                                            return __awaiter(this, void 0, void 0, function () {
                                                                var res;
                                                                var _a, _b;
                                                                return __generator(this, function (_c) {
                                                                    switch (_c.label) {
                                                                        case 0: return [4 /*yield*/, client.query(sql, params)];
                                                                        case 1:
                                                                            res = _c.sent();
                                                                            if (Array.isArray(res.rows) && res.rows.length > 0) {
                                                                                return [2 /*return*/, res.rows];
                                                                            }
                                                                            if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) {
                                                                                return [2 /*return*/, {
                                                                                        insertId: 0,
                                                                                        affectedRows: (_a = res.rowCount) !== null && _a !== void 0 ? _a : 0,
                                                                                        rowCount: (_b = res.rowCount) !== null && _b !== void 0 ? _b : 0,
                                                                                        rows: res.rows,
                                                                                    }];
                                                                            }
                                                                            return [2 /*return*/, res.rows];
                                                                    }
                                                                });
                                                            });
                                                        },
                                                        begin: function () {
                                                            return __awaiter(this, void 0, void 0, function () {
                                                                return __generator(this, function (_a) {
                                                                    switch (_a.label) {
                                                                        case 0: return [4 /*yield*/, client.query("BEGIN")];
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
                                                                        case 0: return [4 /*yield*/, client.query("COMMIT")];
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
                                                                        case 0: return [4 /*yield*/, client.query("ROLLBACK")];
                                                                        case 1:
                                                                            _a.sent();
                                                                            return [2 /*return*/];
                                                                    }
                                                                });
                                                            });
                                                        },
                                                        release: function () {
                                                            client.release();
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
                                            case 0: return [4 /*yield*/, pool.end()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        }];
            }
        });
    });
}
function createMssqlDriver(config) {
    return __awaiter(this, void 0, void 0, function () {
        var sql, pool, run;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("mssql"); })];
                case 1:
                    sql = _b.sent();
                    return [4 /*yield*/, new sql.ConnectionPool({
                            server: config.host,
                            port: config.port,
                            user: config.user,
                            password: config.password,
                            database: config.database,
                            options: __assign({ encrypt: false, trustServerCertificate: true }, ((_a = config.options) !== null && _a !== void 0 ? _a : {})),
                            pool: {
                                max: config.connectionLimit,
                                min: 0,
                            },
                        }).connect()];
                case 2:
                    pool = _b.sent();
                    run = function (request, sqlText, params) { return __awaiter(_this, void 0, void 0, function () {
                        var result, affected;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    params.forEach(function (value, idx) {
                                        request.input("p".concat(idx + 1), value);
                                    });
                                    return [4 /*yield*/, request.query(sqlText)];
                                case 1:
                                    result = _c.sent();
                                    if (Array.isArray(result.recordset) && result.recordset.length > 0) {
                                        return [2 /*return*/, result.recordset];
                                    }
                                    affected = Array.isArray(result.rowsAffected)
                                        ? Number((_a = result.rowsAffected[0]) !== null && _a !== void 0 ? _a : 0)
                                        : 0;
                                    return [2 /*return*/, {
                                            insertId: 0,
                                            affectedRows: affected,
                                            rowsAffected: result.rowsAffected,
                                            rows: (_b = result.recordset) !== null && _b !== void 0 ? _b : [],
                                        }];
                            }
                        });
                    }); };
                    return [2 /*return*/, {
                            query: function (sqlText, params) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var request;
                                    return __generator(this, function (_a) {
                                        request = pool.request();
                                        return [2 /*return*/, run(request, sqlText, params)];
                                    });
                                });
                            },
                            getConnection: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var tx, begun;
                                    return __generator(this, function (_a) {
                                        tx = new sql.Transaction(pool);
                                        begun = false;
                                        return [2 /*return*/, {
                                                query: function (sqlText, params) {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        var request;
                                                        return __generator(this, function (_a) {
                                                            request = new sql.Request(tx);
                                                            return [2 /*return*/, run(request, sqlText, params)];
                                                        });
                                                    });
                                                },
                                                begin: function () {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        return __generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0: return [4 /*yield*/, tx.begin()];
                                                                case 1:
                                                                    _a.sent();
                                                                    begun = true;
                                                                    return [2 /*return*/];
                                                            }
                                                        });
                                                    });
                                                },
                                                commit: function () {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        return __generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0:
                                                                    if (!begun) return [3 /*break*/, 2];
                                                                    return [4 /*yield*/, tx.commit()];
                                                                case 1:
                                                                    _a.sent();
                                                                    _a.label = 2;
                                                                case 2:
                                                                    begun = false;
                                                                    return [2 /*return*/];
                                                            }
                                                        });
                                                    });
                                                },
                                                rollback: function () {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        return __generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0:
                                                                    if (!begun) return [3 /*break*/, 2];
                                                                    return [4 /*yield*/, tx.rollback()];
                                                                case 1:
                                                                    _a.sent();
                                                                    _a.label = 2;
                                                                case 2:
                                                                    begun = false;
                                                                    return [2 /*return*/];
                                                            }
                                                        });
                                                    });
                                                },
                                                release: function () {
                                                    // ConnectionPool 事务结束后无需手动 release
                                                },
                                            }];
                                    });
                                });
                            },
                            end: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, pool.close()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        }];
            }
        });
    });
}
