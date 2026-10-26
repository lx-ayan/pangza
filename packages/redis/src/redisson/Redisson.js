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
exports.Redisson = void 0;
exports.createRedisson = createRedisson;
exports.randomLockToken = randomLockToken;
var crypto_1 = require("crypto");
var RFairLock_1 = require("./RFairLock");
var RLock_1 = require("./RLock");
var RMultiLock_1 = require("./RMultiLock");
var RReadWriteLock_1 = require("./RReadWriteLock");
var RCountDownLatch_1 = require("./RCountDownLatch");
var RSemaphore_1 = require("./RSemaphore");
var objects_1 = require("./objects");
var types_1 = require("./types");
var utils_1 = require("./utils");
/**
 * Redisson 风格门面（基于现有 Redis 连接）。
 *
 * @example
 *   const lock = Redisson.getLock('order:pay');
 *   await lock.lock();
 *   try { ... } finally { await lock.unlock(); }
 */
var RedissonClient = /** @class */ (function () {
    function RedissonClient(config) {
        if (config === void 0) { config = {}; }
        this.clientId = (0, utils_1.createClientId)();
        this.config = __assign(__assign({}, types_1.defaultRedissonConfig), config);
    }
    /** 覆盖看门狗等配置 */
    RedissonClient.prototype.configure = function (config) {
        this.config = __assign(__assign({}, this.config), config);
    };
    RedissonClient.prototype.getClientId = function () {
        return this.clientId;
    };
    // ─── Locks ───────────────────────────────────────────────────
    RedissonClient.prototype.getLock = function (name) {
        return new RLock_1.RedissonLock(name, this.clientId, this.config);
    };
    RedissonClient.prototype.getFairLock = function (name) {
        return (0, RFairLock_1.createFairLock)(name, this.clientId, this.config);
    };
    RedissonClient.prototype.getReadWriteLock = function (name) {
        return new RReadWriteLock_1.RedissonReadWriteLock(name, this.clientId, this.config);
    };
    RedissonClient.prototype.getMultiLock = function () {
        var locks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            locks[_i] = arguments[_i];
        }
        return new RMultiLock_1.RedissonMultiLock(locks);
    };
    // ─── Synchronizers ───────────────────────────────────────────
    RedissonClient.prototype.getSemaphore = function (name) {
        return new RSemaphore_1.RedissonSemaphore(name);
    };
    RedissonClient.prototype.getCountDownLatch = function (name) {
        return new RCountDownLatch_1.RedissonCountDownLatch(name);
    };
    // ─── Objects ─────────────────────────────────────────────────
    RedissonClient.prototype.getAtomicLong = function (name) {
        return new objects_1.RedissonAtomicLong(name);
    };
    RedissonClient.prototype.getBucket = function (name) {
        return new objects_1.RedissonBucket(name);
    };
    RedissonClient.prototype.getMap = function (name) {
        return new objects_1.RedissonMap(name);
    };
    RedissonClient.prototype.getSet = function (name) {
        return new objects_1.RedissonSet(name);
    };
    RedissonClient.prototype.getList = function (name) {
        return new objects_1.RedissonList(name);
    };
    RedissonClient.prototype.getScoredSortedSet = function (name) {
        return new objects_1.RedissonScoredSortedSet(name);
    };
    RedissonClient.prototype.getTopic = function (name) {
        return new objects_1.RedissonTopic(name);
    };
    RedissonClient.prototype.getRateLimiter = function (name) {
        return new objects_1.RedissonRateLimiter(name);
    };
    RedissonClient.prototype.getBitSet = function (name) {
        return new objects_1.RedissonBitSet(name);
    };
    RedissonClient.prototype.getQueue = function (name) {
        return new objects_1.RedissonQueue(name);
    };
    /**
     * 持锁执行（看门狗）；等价于 getLock + lock + unlock。
     */
    RedissonClient.prototype.withLock = function (name, fn, leaseTimeMs) {
        return __awaiter(this, void 0, void 0, function () {
            var lock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lock = this.getLock(name);
                        return [4 /*yield*/, lock.lock(leaseTimeMs)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 6]);
                        return [4 /*yield*/, fn()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, lock.unlock()];
                    case 5:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return RedissonClient;
}());
/** 默认单例（进程级 clientId） */
exports.Redisson = new RedissonClient();
/** 创建独立客户端（不同 clientId，用于测试或多实例语义） */
function createRedisson(config) {
    return new RedissonClient(config);
}
/** 生成随机 token（测试辅助） */
function randomLockToken() {
    return (0, crypto_1.randomBytes)(8).toString("hex");
}
