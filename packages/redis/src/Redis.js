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
var fs_1 = require("fs");
var crypto_1 = require("crypto");
var redis_1 = require("redis");
var config_1 = require("@pangza/core/config");
var types_1 = require("./types");
var errors_1 = require("./errors");
function readOptionalFile(path) {
    var p = path === null || path === void 0 ? void 0 : path.trim();
    if (!p)
        return undefined;
    try {
        return fs_1.default.readFileSync(p, "utf8");
    }
    catch (err) {
        console.warn("[Redis] \u65E0\u6CD5\u8BFB\u53D6 TLS \u6587\u4EF6 ".concat(p, ":"), err instanceof Error ? err.message : err);
        return undefined;
    }
}
function buildReconnectStrategy(cfg) {
    var _a;
    var reconnect = cfg.reconnect !== false;
    var maxDelay = (_a = cfg.maxReconnectDelay) !== null && _a !== void 0 ? _a : types_1.defaultRedisConfig.maxReconnectDelay;
    if (!reconnect)
        return false;
    return function (retries) {
        if (retries > 20) {
            console.error("[Redis] 重连次数过多，停止重连");
            return new Error("Redis reconnect gave up");
        }
        return Math.min(maxDelay, 100 * Math.pow(2, retries));
    };
}
function buildSocketBase(cfg, host, port) {
    var _a, _b;
    var socket = {
        host: host,
        port: port,
        connectTimeout: (_a = cfg.connectTimeout) !== null && _a !== void 0 ? _a : types_1.defaultRedisConfig.connectTimeout,
        reconnectStrategy: buildReconnectStrategy(cfg),
    };
    if ((_b = cfg.tls) === null || _b === void 0 ? void 0 : _b.enabled) {
        socket.tls = true;
        socket.rejectUnauthorized = cfg.tls.rejectUnauthorized !== false;
        var ca = readOptionalFile(cfg.tls.ca);
        var cert = readOptionalFile(cfg.tls.cert);
        var key = readOptionalFile(cfg.tls.key);
        if (ca)
            socket.ca = ca;
        if (cert)
            socket.cert = cert;
        if (key)
            socket.key = key;
    }
    return socket;
}
function authFields(cfg) {
    var _a, _b;
    var username = (_a = cfg.username) === null || _a === void 0 ? void 0 : _a.trim();
    var password = (_b = cfg.password) === null || _b === void 0 ? void 0 : _b.trim();
    return {
        username: username || undefined,
        password: password || undefined,
    };
}
/** 创建 RESP2 客户端（standalone / cluster / sentinel） */
function createRedisClient(cfg) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var mode = (_a = cfg.mode) !== null && _a !== void 0 ? _a : "standalone";
    var auth = authFields(cfg);
    var RESP = 2;
    if (mode === "cluster") {
        var nodes = (_d = (_c = (_b = cfg.cluster) === null || _b === void 0 ? void 0 : _b.nodes) === null || _c === void 0 ? void 0 : _c.filter(function (n) { var _a; return (_a = n === null || n === void 0 ? void 0 : n.host) === null || _a === void 0 ? void 0 : _a.trim(); })) !== null && _d !== void 0 ? _d : [];
        if (nodes.length === 0) {
            throw new Error("Redis mode=cluster 时请配置 redis.cluster.nodes（至少一个种子节点）");
        }
        return (0, redis_1.createCluster)({
            RESP: RESP,
            rootNodes: nodes.map(function (n) {
                var _a;
                return ({
                    socket: buildSocketBase(cfg, n.host, (_a = n.port) !== null && _a !== void 0 ? _a : 6379),
                });
            }),
            defaults: __assign(__assign({}, auth), { socket: buildSocketBase(cfg, nodes[0].host, (_e = nodes[0].port) !== null && _e !== void 0 ? _e : 6379) }),
            useReplicas: ((_f = cfg.cluster) === null || _f === void 0 ? void 0 : _f.useReplicas) === true,
        });
    }
    if (mode === "sentinel") {
        var name_1 = (_h = (_g = cfg.sentinel) === null || _g === void 0 ? void 0 : _g.name) === null || _h === void 0 ? void 0 : _h.trim();
        var nodes = (_l = (_k = (_j = cfg.sentinel) === null || _j === void 0 ? void 0 : _j.nodes) === null || _k === void 0 ? void 0 : _k.filter(function (n) { var _a; return (_a = n === null || n === void 0 ? void 0 : n.host) === null || _a === void 0 ? void 0 : _a.trim(); })) !== null && _l !== void 0 ? _l : [];
        if (!name_1 || nodes.length === 0) {
            throw new Error("Redis mode=sentinel 时请配置 redis.sentinel.name 与 redis.sentinel.nodes");
        }
        return (0, redis_1.createSentinel)({
            RESP: RESP,
            name: name_1,
            sentinelRootNodes: nodes.map(function (n) {
                var _a;
                return ({
                    host: n.host,
                    port: (_a = n.port) !== null && _a !== void 0 ? _a : 26379,
                });
            }),
            nodeClientOptions: __assign(__assign({}, auth), { socket: buildSocketBase(cfg, (_m = cfg.host) !== null && _m !== void 0 ? _m : types_1.defaultRedisConfig.host, (_o = cfg.port) !== null && _o !== void 0 ? _o : types_1.defaultRedisConfig.port) }),
            sentinelClientOptions: __assign({}, auth),
        });
    }
    var host = (_p = cfg.host) !== null && _p !== void 0 ? _p : types_1.defaultRedisConfig.host;
    var port = (_q = cfg.port) !== null && _q !== void 0 ? _q : types_1.defaultRedisConfig.port;
    return (0, redis_1.createClient)(__assign(__assign({ RESP: RESP, socket: buildSocketBase(cfg, host, port) }, auth), { database: (_r = cfg.db) !== null && _r !== void 0 ? _r : types_1.defaultRedisConfig.db }));
}
/**
 * 固定窗口限流：INCR 后若尚无 TTL 则设置 expire。
 */
var RATE_LIMIT_LUA = "\nlocal key=KEYS[1]\nlocal time=tonumber(ARGV[1])\nlocal count=tonumber(ARGV[2])\nlocal current=redis.call('get', key)\n\nif current and tonumber(current)>count then\n    return tonumber(current)\nend\n\ncurrent = redis.call('incr', key)\nlocal ttl = redis.call('pttl', key)\nif ttl < 0 then\n    redis.call('expire', key, time)\nend\n\nreturn tonumber(current)\n".trim();
/**
 * 滑动窗口限流（ZSET）：清理窗口外成员后计数，未超限则 ZADD。
 * 返回当前窗口内数量（含本次）；调用方判断 > count 则拒绝。
 */
var SLIDING_RATE_LIMIT_LUA = "\nlocal key = KEYS[1]\nlocal now = tonumber(ARGV[1])\nlocal window = tonumber(ARGV[2])\nlocal limit = tonumber(ARGV[3])\nredis.call('ZREMRANGEBYSCORE', key, 0, now - window)\nlocal n = redis.call('ZCARD', key)\nif n >= limit then\n  return n + 1\nend\nredis.call('ZADD', key, now, now .. '-' .. ARGV[4])\nredis.call('PEXPIRE', key, window)\nreturn n + 1\n".trim();
/** 仅当 value 匹配时删除（安全解锁） */
var UNLOCK_IF_MATCH_LUA = "\nif redis.call('get', KEYS[1]) == ARGV[1] then\n  return redis.call('del', KEYS[1])\nend\nreturn 0\n".trim();
/** 仅当 value 匹配时续期 */
var RENEW_IF_MATCH_LUA = "\nif redis.call('get', KEYS[1]) == ARGV[1] then\n  return redis.call('pexpire', KEYS[1], tonumber(ARGV[2]))\nend\nreturn 0\n".trim();
function randomToken() {
    return (0, crypto_1.randomBytes)(16).toString("hex");
}
/**
 * Redis 操作封装（基于 node-redis v6）。
 * 配置来自项目根目录 application*.yaml，模块加载及首次调用时自动连接。
 */
var Redis = /** @class */ (function () {
    function Redis() {
    }
    Redis.ensureReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!((_a = this.client) === null || _a === void 0 ? void 0 : _a.isReady)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!((_b = this.client) === null || _b === void 0 ? void 0 : _b.isReady)) {
                            throw new Error("Redis 连接不可用，请检查 YAML 中的 redis 配置");
                        }
                        return [2 /*return*/, this.client];
                }
            });
        });
    };
    /** 覆盖配置；已连接时需 disconnect 后再 connect 才生效 */
    Redis.configure = function (config) {
        if (config === void 0) { config = {}; }
        this.config = __assign(__assign(__assign(__assign({}, types_1.defaultRedisConfig), this.config), config), { tls: __assign(__assign({}, this.config.tls), config.tls), cluster: __assign(__assign({}, this.config.cluster), config.cluster), sentinel: __assign(__assign({}, this.config.sentinel), config.sentinel) });
    };
    Redis.isReady = function () {
        var _a;
        return !!((_a = this.client) === null || _a === void 0 ? void 0 : _a.isReady);
    };
    /** PING；成功返回 true，失败抛错或返回 false（ping 自身异常时） */
    Redis.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.ping()];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, res === "PONG" || res === true || res === "OK"];
                }
            });
        });
    };
    Redis.connect = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (config)
                            this.configure(config);
                        if ((_a = this.client) === null || _a === void 0 ? void 0 : _a.isReady)
                            return [2 /*return*/];
                        if (this.connecting)
                            return [2 /*return*/, this.connecting];
                        this.connecting = (function () { return __awaiter(_this, void 0, void 0, function () {
                            var cfg, pwd, production, msg, _a, _b, client, mode, tlsTag;
                            var _c, _d, _e, _f, _g, _h;
                            return __generator(this, function (_j) {
                                switch (_j.label) {
                                    case 0:
                                        cfg = __assign(__assign({}, types_1.defaultRedisConfig), this.config);
                                        pwd = String((_c = cfg.password) !== null && _c !== void 0 ? _c : "").trim();
                                        if (!pwd) {
                                            production = config_1.configProfile === "production";
                                            msg = "[Redis] 未配置 password：仅建议本机开发使用；生产请设置 redis.password，并限制网络访问";
                                            if (production) {
                                                console.error(msg);
                                            }
                                            else {
                                                console.warn(msg);
                                            }
                                        }
                                        if (!this.client) return [3 /*break*/, 5];
                                        _j.label = 1;
                                    case 1:
                                        _j.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, this.client.quit()];
                                    case 2:
                                        _j.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _j.sent();
                                        try {
                                            this.client.destroy();
                                        }
                                        catch (_k) {
                                            // ignore
                                        }
                                        return [3 /*break*/, 4];
                                    case 4:
                                        this.client = null;
                                        _j.label = 5;
                                    case 5:
                                        if (!this.subClient) return [3 /*break*/, 10];
                                        _j.label = 6;
                                    case 6:
                                        _j.trys.push([6, 8, , 9]);
                                        return [4 /*yield*/, this.subClient.quit()];
                                    case 7:
                                        _j.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        _b = _j.sent();
                                        try {
                                            this.subClient.destroy();
                                        }
                                        catch (_l) {
                                            // ignore
                                        }
                                        return [3 /*break*/, 9];
                                    case 9:
                                        this.subClient = null;
                                        _j.label = 10;
                                    case 10:
                                        client = createRedisClient(cfg);
                                        client.on("error", function (err) {
                                            console.error("[Redis] error:", err.message);
                                        });
                                        client.on("reconnecting", function () {
                                            console.warn("[Redis] reconnecting...");
                                        });
                                        return [4 /*yield*/, client.connect()];
                                    case 11:
                                        _j.sent();
                                        this.client = client;
                                        mode = (_d = cfg.mode) !== null && _d !== void 0 ? _d : "standalone";
                                        tlsTag = ((_e = cfg.tls) === null || _e === void 0 ? void 0 : _e.enabled) ? " tls" : "";
                                        if (mode === "cluster") {
                                            console.log("[Redis] \u5DF2\u8FDE\u63A5 cluster".concat(tlsTag));
                                        }
                                        else if (mode === "sentinel") {
                                            console.log("[Redis] \u5DF2\u8FDE\u63A5 sentinel name=".concat((_g = (_f = cfg.sentinel) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : "").concat(tlsTag));
                                        }
                                        else {
                                            console.log("[Redis] \u5DF2\u8FDE\u63A5 ".concat(cfg.host, ":").concat(cfg.port, " db=").concat((_h = cfg.db) !== null && _h !== void 0 ? _h : 0).concat(tlsTag));
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); })();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.connecting];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.connecting = null;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Redis.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var close, main, sub;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        close = function (c) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!c)
                                            return [2 /*return*/];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, c.quit()];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        try {
                                            c.destroy();
                                        }
                                        catch (_c) {
                                            // ignore
                                        }
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        main = this.client;
                        sub = this.subClient;
                        this.client = null;
                        this.subClient = null;
                        return [4 /*yield*/, close(main)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, close(sub)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Redis.getClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.ensureReady()];
            });
        });
    };
    Redis.key = function (raw) {
        var _a;
        var prefix = (_a = this.config.keyPrefix) !== null && _a !== void 0 ? _a : types_1.defaultRedisConfig.keyPrefix;
        return raw.startsWith(prefix) ? raw : "".concat(prefix).concat(raw);
    };
    // ─── String / JSON ───────────────────────────────────────────
    Redis.set = function (key, value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var client, k;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        k = this.key(key);
                        if (!(ttlSeconds && ttlSeconds > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.set(k, value, { EX: ttlSeconds })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, client.set(k, value)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Redis.setJSON = function (key, value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.set(key, JSON.stringify(value), ttlSeconds)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Redis.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.get(this.key(key))];
                }
            });
        });
    };
    Redis.getJSON = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var raw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(key)];
                    case 1:
                        raw = _a.sent();
                        if (raw == null)
                            return [2 /*return*/, null];
                        try {
                            return [2 /*return*/, JSON.parse(raw)];
                        }
                        catch (_b) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Redis.del = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (keys.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.del(keys.map(function (k) { return _this.key(k); }))];
                }
            });
        });
    };
    Redis.exists = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client, n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.exists(this.key(key))];
                    case 2:
                        n = _a.sent();
                        return [2 /*return*/, n > 0];
                }
            });
        });
    };
    Redis.expire = function (key, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.expire(this.key(key), ttlSeconds)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, Number(result) === 1];
                }
            });
        });
    };
    Redis.ttl = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.ttl(this.key(key))];
                }
            });
        });
    };
    Redis.setNX = function (key, value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var client, k, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        k = this.key(key);
                        return [4 /*yield*/, client.set(k, value, __assign({ NX: true }, (ttlSeconds && ttlSeconds > 0 ? { EX: ttlSeconds } : {})))];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result === "OK"];
                }
            });
        });
    };
    Redis.setNxPx = function (key, value, ttlMs) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.set(this.key(key), value, {
                                NX: true,
                                PX: Math.max(1, ttlMs),
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result === "OK"];
                }
            });
        });
    };
    Redis.unlockIfMatch = function (key, expectValue) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.eval(UNLOCK_IF_MATCH_LUA, {
                                keys: [this.key(key)],
                                arguments: [expectValue],
                            })];
                    case 2:
                        result = (_a.sent());
                        return [2 /*return*/, Number(result) === 1];
                }
            });
        });
    };
    /** 值匹配时续期（毫秒） */
    Redis.renewIfMatch = function (key, expectValue, ttlMs) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.eval(RENEW_IF_MATCH_LUA, {
                                keys: [this.key(key)],
                                arguments: [expectValue, String(Math.max(1, ttlMs))],
                            })];
                    case 2:
                        result = (_a.sent());
                        return [2 /*return*/, Number(result) === 1];
                }
            });
        });
    };
    /**
     * 尝试获取锁。
     * @returns 句柄；失败返回 null
     */
    Redis.tryLock = function (key_1) {
        return __awaiter(this, arguments, void 0, function (key, option) {
            var ttlMs, token, lockKey, ok;
            var _this = this;
            var _a, _b;
            if (option === void 0) { option = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ttlMs = (_a = option.ttlMs) !== null && _a !== void 0 ? _a : 30000;
                        token = (_b = option.token) !== null && _b !== void 0 ? _b : randomToken();
                        lockKey = key.startsWith(types_1.LOCK_KEY) ? key : "".concat(types_1.LOCK_KEY).concat(key);
                        return [4 /*yield*/, this.setNxPx(lockKey, token, ttlMs)];
                    case 1:
                        ok = _c.sent();
                        if (!ok)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                key: lockKey,
                                token: token,
                                release: function () { return _this.unlockIfMatch(lockKey, token); },
                                renew: function (ms) { return _this.renewIfMatch(lockKey, token, ms); },
                            }];
                }
            });
        });
    };
    /**
     * 持锁执行；可选自动续租。拿不到锁抛 LockError。
     */
    Redis.withLock = function (key_1, fn_1) {
        return __awaiter(this, arguments, void 0, function (key, fn, option) {
            var ttlMs, handle, renewEvery, timer;
            var _a, _b, _c;
            if (option === void 0) { option = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        ttlMs = (_a = option.ttlMs) !== null && _a !== void 0 ? _a : 30000;
                        return [4 /*yield*/, this.tryLock(key, { ttlMs: ttlMs, token: option.token })];
                    case 1:
                        handle = _d.sent();
                        if (!handle) {
                            throw new errors_1.LockError("\u83B7\u53D6\u9501\u5931\u8D25: ".concat(key));
                        }
                        renewEvery = option.renewIntervalMs === undefined
                            ? Math.max(100, Math.floor(ttlMs / 3))
                            : option.renewIntervalMs;
                        timer = null;
                        if (renewEvery > 0) {
                            timer = setInterval(function () {
                                void handle.renew(ttlMs).catch(function () {
                                    // 续租失败忽略；业务侧应尽量短持锁
                                });
                            }, renewEvery);
                            if (typeof timer === "object" && "unref" in timer) {
                                (_c = (_b = timer).unref) === null || _c === void 0 ? void 0 : _c.call(_b);
                            }
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, , 4, 6]);
                        return [4 /*yield*/, fn()];
                    case 3: return [2 /*return*/, _d.sent()];
                    case 4:
                        if (timer)
                            clearInterval(timer);
                        return [4 /*yield*/, handle.release()];
                    case 5:
                        _d.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ─── Hash ────────────────────────────────────────────────────
    Redis.hSet = function (key, field, value) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.hSet(this.key(key), field, value)];
                }
            });
        });
    };
    Redis.hGet = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            var client, v;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.hGet(this.key(key), field)];
                    case 2:
                        v = _a.sent();
                        return [2 /*return*/, v !== null && v !== void 0 ? v : undefined];
                }
            });
        });
    };
    Redis.hGetAll = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.hGetAll(this.key(key))];
                }
            });
        });
    };
    Redis.hDel = function (key) {
        var fields = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            fields[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fields.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.hDel(this.key(key), fields)];
                }
            });
        });
    };
    // ─── Set ─────────────────────────────────────────────────────
    Redis.sAdd = function (key) {
        var members = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            members[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (members.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.sAdd(this.key(key), members)];
                }
            });
        });
    };
    Redis.sMembers = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.sMembers(this.key(key))];
                }
            });
        });
    };
    Redis.sRem = function (key) {
        var members = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            members[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (members.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.sRem(this.key(key), members)];
                }
            });
        });
    };
    // ─── List ────────────────────────────────────────────────────
    Redis.lPush = function (key) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (values.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.lPush(this.key(key), values)];
                }
            });
        });
    };
    Redis.rPush = function (key) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (values.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.rPush(this.key(key), values)];
                }
            });
        });
    };
    Redis.lPop = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.lPop(this.key(key))];
                }
            });
        });
    };
    Redis.rPop = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.rPop(this.key(key))];
                }
            });
        });
    };
    Redis.lRange = function (key, start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.lRange(this.key(key), start, stop)];
                }
            });
        });
    };
    Redis.lLen = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.lLen(this.key(key))];
                }
            });
        });
    };
    // ─── ZSet ────────────────────────────────────────────────────
    Redis.zAdd = function (key, members) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (members.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.zAdd(this.key(key), members.map(function (m) { return ({ score: m.score, value: m.value }); }))];
                }
            });
        });
    };
    Redis.zRange = function (key, min, max) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.zRange(this.key(key), min, max)];
                }
            });
        });
    };
    Redis.zRangeByScore = function (key, min, max) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.zRangeByScore(this.key(key), min, max)];
                }
            });
        });
    };
    Redis.zRem = function (key) {
        var members = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            members[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (members.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.zRem(this.key(key), members)];
                }
            });
        });
    };
    Redis.zCard = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.zCard(this.key(key))];
                }
            });
        });
    };
    Redis.zScore = function (key, member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zScore(this.key(key), member)];
                    case 2:
                        s = _a.sent();
                        return [2 /*return*/, s == null ? null : Number(s)];
                }
            });
        });
    };
    // ─── Pipeline ────────────────────────────────────────────────
    /**
     * 批量命令。fn 内对 multi 链式调用，结束后自动 exec。
     * key 需自行 `Redis.key(...)` 加前缀。
     */
    Redis.pipeline = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            var client, multi;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        multi = client.multi();
                        fn(multi);
                        return [4 /*yield*/, multi.exec()];
                    case 2: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    // ─── Pub/Sub ─────────────────────────────────────────────────
    Redis.publish = function (channel, message) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.publish(channel, message)];
                }
            });
        });
    };
    /**
     * 订阅频道。返回取消订阅函数。
     * 内部使用独立连接，避免阻塞主 client。
     */
    Redis.subscribe = function (channel, listener) {
        return __awaiter(this, void 0, void 0, function () {
            var cfg, sub_1, sub;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        _b.sent();
                        if (!!((_a = this.subClient) === null || _a === void 0 ? void 0 : _a.isReady)) return [3 /*break*/, 3];
                        cfg = __assign(__assign({}, types_1.defaultRedisConfig), this.config);
                        sub_1 = createRedisClient(cfg);
                        sub_1.on("error", function (err) {
                            console.error("[Redis] sub error:", err.message);
                        });
                        return [4 /*yield*/, sub_1.connect()];
                    case 2:
                        _b.sent();
                        this.subClient = sub_1;
                        _b.label = 3;
                    case 3:
                        sub = this.subClient;
                        return [4 /*yield*/, sub.subscribe(channel, function (message, ch) {
                                listener(message, ch);
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, sub.unsubscribe(channel)];
                                        case 1:
                                            _b.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            _a = _b.sent();
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }];
                }
            });
        });
    };
    // ─── Counter / PX ────────────────────────────────────────────
    Redis.incr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.incr(this.key(key))];
                }
            });
        });
    };
    Redis.decr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.decr(this.key(key))];
                }
            });
        });
    };
    Redis.setPx = function (key, value, ttlMs) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.set(this.key(key), value, { PX: Math.max(1, ttlMs) })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Redis.setJSONPx = function (key, value, ttlMs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setPx(key, JSON.stringify(value), ttlMs)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 固定窗口限流。
     * @returns 当前窗口内计数
     */
    Redis.rateLimit = function (key, timeSeconds, count) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.eval(RATE_LIMIT_LUA, {
                                keys: [this.key(key)],
                                arguments: [String(timeSeconds), String(count)],
                            })];
                    case 2:
                        result = (_a.sent());
                        return [2 /*return*/, Number(result !== null && result !== void 0 ? result : 0)];
                }
            });
        });
    };
    /**
     * 滑动窗口限流（ZSET）。
     * @returns 当前窗口内数量（含本次尝试）
     */
    Redis.rateLimitSliding = function (key, timeSeconds, count) {
        return __awaiter(this, void 0, void 0, function () {
            var client, now, windowMs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _a.sent();
                        now = Date.now();
                        windowMs = Math.max(1, Math.floor(timeSeconds * 1000));
                        return [4 /*yield*/, client.eval(SLIDING_RATE_LIMIT_LUA, {
                                keys: [this.key(key)],
                                arguments: [
                                    String(now),
                                    String(windowMs),
                                    String(count),
                                    randomToken().slice(0, 8),
                                ],
                            })];
                    case 2:
                        result = (_a.sent());
                        return [2 /*return*/, Number(result !== null && result !== void 0 ? result : 0)];
                }
            });
        });
    };
    /** 按前缀扫描删除（@CacheEvict allEntries）；小规模缓存用 */
    Redis.deleteByPrefix = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var client, full, cursor, removed, reply, keys, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.ensureReady()];
                    case 1:
                        client = _b.sent();
                        full = this.key(prefix);
                        cursor = "0";
                        removed = 0;
                        _b.label = 2;
                    case 2: return [4 /*yield*/, client.scan(cursor, {
                            MATCH: "".concat(full, "*"),
                            COUNT: 100,
                        })];
                    case 3:
                        reply = _b.sent();
                        cursor = String(reply.cursor);
                        keys = reply.keys;
                        if (!keys.length) return [3 /*break*/, 5];
                        _a = removed;
                        return [4 /*yield*/, client.del(keys)];
                    case 4:
                        removed = _a + _b.sent();
                        _b.label = 5;
                    case 5:
                        if (cursor !== "0") return [3 /*break*/, 2];
                        _b.label = 6;
                    case 6: return [2 /*return*/, removed];
                }
            });
        });
    };
    Redis.client = null;
    Redis.config = __assign(__assign({}, types_1.defaultRedisConfig), config_1.redisConfig);
    Redis.connecting = null;
    /** Pub/Sub 专用连接（subscribe 会阻塞普通命令） */
    Redis.subClient = null;
    return Redis;
}());
// 不在 import 时连 Redis：避免启动被连接超时拖慢；首次 API 调用走 ensureReady()
exports.default = Redis;
