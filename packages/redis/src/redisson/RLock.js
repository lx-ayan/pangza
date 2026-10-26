"use strict";
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
exports.RedissonLock = void 0;
var Redis_1 = require("../Redis");
var errors_1 = require("../errors");
var scripts_1 = require("./scripts");
var types_1 = require("./types");
var utils_1 = require("./utils");
/**
 * Redisson 风格可重入分布式锁（Hash + 看门狗 + pub/sub 唤醒）。
 */
var RedissonLock = /** @class */ (function () {
    function RedissonLock(name, clientId, config, hooks, 
    /** Redis 存储名（默认与 name 相同；读写锁读写端共享） */
    storageName) {
        if (config === void 0) { config = types_1.defaultRedissonConfig; }
        var _this = this;
        var _a, _b;
        this.name = name;
        this.clientId = clientId;
        this.storageName = storageName;
        this.renewTimer = null;
        this.heldThreadId = null;
        this.watchdogTimeout = config.lockWatchdogTimeout;
        this.watchInterval = config.lockWatchInterval;
        this.doAcquire =
            (_a = hooks === null || hooks === void 0 ? void 0 : hooks.acquire) !== null && _a !== void 0 ? _a : (function (threadId, leaseMs) {
                return (0, utils_1.evalNumber)(scripts_1.LOCK_ACQUIRE_LUA, [_this.lockKey()], [
                    leaseMs,
                    _this.field(threadId),
                ]);
            });
        this.doUnlock =
            (_b = hooks === null || hooks === void 0 ? void 0 : hooks.unlock) !== null && _b !== void 0 ? _b : (function (threadId, leaseMs) {
                return _this.unlockInner(scripts_1.LOCK_UNLOCK_LUA, threadId, leaseMs);
            });
    }
    RedissonLock.prototype.lockKey = function () {
        var _a;
        return Redis_1.default.key((_a = this.storageName) !== null && _a !== void 0 ? _a : this.name);
    };
    RedissonLock.prototype.channel = function () {
        var _a;
        return (0, utils_1.channelName)((_a = this.storageName) !== null && _a !== void 0 ? _a : this.name);
    };
    RedissonLock.prototype.field = function (threadId) {
        return "".concat(this.clientId, ":").concat(threadId);
    };
    RedissonLock.prototype.unlockInner = function (script, threadId, leaseMs) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, utils_1.evalScript)(script, [this.lockKey(), this.channel()], [
                            "0",
                            leaseMs,
                            this.field(threadId),
                        ])];
                    case 1:
                        result = _a.sent();
                        if (result === null || result === undefined)
                            return [2 /*return*/, null];
                        return [2 /*return*/, Number(result)];
                }
            });
        });
    };
    RedissonLock.prototype.lock = function (leaseTimeMs) {
        return __awaiter(this, void 0, void 0, function () {
            var ok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryLock(-1, leaseTimeMs)];
                    case 1:
                        ok = _a.sent();
                        if (!ok)
                            throw new errors_1.LockError("\u83B7\u53D6\u9501\u5931\u8D25: ".concat(this.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param waitTimeMs 等待毫秒；undefined=0（立即）；-1=无限等
     * @param leaseTimeMs 租约；undefined/-1=看门狗
     */
    RedissonLock.prototype.tryLock = function (waitTimeMs, leaseTimeMs) {
        return __awaiter(this, void 0, void 0, function () {
            var threadId;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                threadId = (_a = this.heldThreadId) !== null && _a !== void 0 ? _a : (0, utils_1.currentThreadId)(this.clientId);
                return [2 /*return*/, (0, utils_1.runWithThreadIdAsync)(threadId, function () { return __awaiter(_this, void 0, void 0, function () {
                        var wait, useWatchdog, lease, deadline, ttl, remain, notified;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    wait = waitTimeMs === undefined ? 0 : waitTimeMs;
                                    useWatchdog = leaseTimeMs === undefined || leaseTimeMs < 0;
                                    lease = useWatchdog
                                        ? this.watchdogTimeout
                                        : Math.max(1, leaseTimeMs);
                                    deadline = wait < 0 ? Number.POSITIVE_INFINITY : Date.now() + Math.max(0, wait);
                                    _a.label = 1;
                                case 1: return [4 /*yield*/, this.doAcquire(threadId, lease)];
                                case 2:
                                    ttl = _a.sent();
                                    if (ttl === null) {
                                        this.heldThreadId = threadId;
                                        if (useWatchdog)
                                            this.scheduleWatchdog(threadId, lease);
                                        return [2 /*return*/, true];
                                    }
                                    if (Date.now() >= deadline)
                                        return [2 /*return*/, false];
                                    remain = Math.min(Math.max(ttl > 0 ? ttl : this.watchInterval, this.watchInterval), Math.max(0, deadline - Date.now()));
                                    if (remain <= 0)
                                        return [2 /*return*/, false];
                                    return [4 /*yield*/, (0, utils_1.waitNotify)(this.channel(), Math.min(remain, 3000))];
                                case 3:
                                    notified = _a.sent();
                                    if (!!notified) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, utils_1.sleep)(Math.min(this.watchInterval, remain))];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [3 /*break*/, 1];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    RedissonLock.prototype.scheduleWatchdog = function (threadId, leaseMs) {
        var _this = this;
        var _a, _b;
        this.cancelWatchdog();
        var every = Math.max(100, Math.floor(leaseMs / 3));
        this.renewTimer = setInterval(function () {
            void (0, utils_1.evalNumber)(scripts_1.LOCK_RENEW_LUA, [_this.lockKey()], [
                leaseMs,
                _this.field(threadId),
            ]).then(function (ok) {
                if (ok !== 1)
                    _this.cancelWatchdog();
            });
        }, every);
        if (typeof this.renewTimer === "object" && "unref" in this.renewTimer) {
            (_b = (_a = this.renewTimer).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
    };
    RedissonLock.prototype.cancelWatchdog = function () {
        if (this.renewTimer) {
            clearInterval(this.renewTimer);
            this.renewTimer = null;
        }
    };
    RedissonLock.prototype.unlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var threadId, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        threadId = (_a = this.heldThreadId) !== null && _a !== void 0 ? _a : (0, utils_1.currentThreadId)(this.clientId);
                        return [4 /*yield*/, this.doUnlock(threadId, this.watchdogTimeout)];
                    case 1:
                        result = _b.sent();
                        if (result === null) {
                            throw new errors_1.LockError("\u65E0\u6CD5\u89E3\u9501\uFF08\u975E\u6301\u6709\u8005\uFF09: ".concat(this.name));
                        }
                        if (result === 1) {
                            this.cancelWatchdog();
                            this.heldThreadId = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonLock.prototype.forceUnlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.cancelWatchdog();
                        this.heldThreadId = null;
                        return [4 /*yield*/, (0, utils_1.evalNumber)(scripts_1.LOCK_FORCE_UNLOCK_LUA, [this.lockKey(), this.channel()], ["0"])];
                    case 1:
                        n = _a.sent();
                        return [2 /*return*/, n === 1];
                }
            });
        });
    };
    RedissonLock.prototype.isLocked = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.exists(this.lockKey())];
                    case 2:
                        n = _a.sent();
                        return [2 /*return*/, Number(n) > 0];
                }
            });
        });
    };
    RedissonLock.prototype.isHeldByCurrentThread = function () {
        return __awaiter(this, void 0, void 0, function () {
            var threadId, client, n;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        threadId = (_a = this.heldThreadId) !== null && _a !== void 0 ? _a : (0, utils_1.currentThreadId)(this.clientId);
                        return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _b.sent();
                        return [4 /*yield*/, client.hExists(this.lockKey(), this.field(threadId))];
                    case 2:
                        n = _b.sent();
                        return [2 /*return*/, Number(n) === 1];
                }
            });
        });
    };
    RedissonLock.prototype.getHoldCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var threadId, client, v;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        threadId = (_a = this.heldThreadId) !== null && _a !== void 0 ? _a : (0, utils_1.currentThreadId)(this.clientId);
                        return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _b.sent();
                        return [4 /*yield*/, client.hGet(this.lockKey(), this.field(threadId))];
                    case 2:
                        v = _b.sent();
                        return [2 /*return*/, v == null ? 0 : Number(v)];
                }
            });
        });
    };
    RedissonLock.prototype.remainTimeToLive = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.pTTL(this.lockKey())];
                }
            });
        });
    };
    return RedissonLock;
}());
exports.RedissonLock = RedissonLock;
