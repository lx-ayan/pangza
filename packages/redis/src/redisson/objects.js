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
exports.RedissonQueue = exports.RedissonBitSet = exports.RedissonRateLimiter = exports.RedissonTopic = exports.RedissonScoredSortedSet = exports.RedissonList = exports.RedissonSet = exports.RedissonMap = exports.RedissonBucket = exports.RedissonAtomicLong = void 0;
var Redis_1 = require("../Redis");
var utils_1 = require("./utils");
var CAS_LUA = "\nlocal cur = redis.call('get', KEYS[1]);\nif cur == ARGV[1] then\n  redis.call('set', KEYS[1], ARGV[2]);\n  return 1;\nend;\nreturn 0;\n".trim();
var RATE_TRY_LUA = "\nlocal key = KEYS[1]\nlocal now = tonumber(ARGV[1])\nlocal rate = tonumber(ARGV[2])\nlocal interval = tonumber(ARGV[3])\nlocal permits = tonumber(ARGV[4])\nlocal conf = redis.call('hmget', key, 'rate', 'interval')\nif conf[1] then\n  rate = tonumber(conf[1])\n  interval = tonumber(conf[2])\nend\nlocal bucket = key .. ':bucket'\nredis.call('zremrangebyscore', bucket, 0, now - interval)\nlocal n = redis.call('zcard', bucket)\nif n + permits > rate then\n  return 0\nend\nfor i = 1, permits do\n  redis.call('zadd', bucket, now, now .. '-' .. i .. '-' .. math.random(1000000))\nend\nredis.call('pexpire', bucket, interval)\nreturn 1\n".trim();
var RedissonAtomicLong = /** @class */ (function () {
    function RedissonAtomicLong(name) {
        this.name = name;
    }
    RedissonAtomicLong.prototype.k = function () {
        return "atomic:".concat(this.name);
    };
    RedissonAtomicLong.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var v;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.get(this.k())];
                    case 1:
                        v = _a.sent();
                        return [2 /*return*/, v == null ? 0 : Number(v)];
                }
            });
        });
    };
    RedissonAtomicLong.prototype.set = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.set(this.k(), String(value))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonAtomicLong.prototype.getAndSet = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var client, prev;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.getSet(Redis_1.default.key(this.k()), String(value))];
                    case 2:
                        prev = _a.sent();
                        return [2 /*return*/, prev == null ? 0 : Number(prev)];
                }
            });
        });
    };
    RedissonAtomicLong.prototype.incrementAndGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.incr(this.k())];
            });
        });
    };
    RedissonAtomicLong.prototype.decrementAndGet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.decr(this.k())];
            });
        });
    };
    RedissonAtomicLong.prototype.addAndGet = function (delta) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.incrBy(Redis_1.default.key(this.k()), delta)];
                }
            });
        });
    };
    RedissonAtomicLong.prototype.compareAndSet = function (expect, update) {
        return __awaiter(this, void 0, void 0, function () {
            var n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, utils_1.evalNumber)(CAS_LUA, [Redis_1.default.key(this.k())], [String(expect), String(update)])];
                    case 1:
                        n = _a.sent();
                        return [2 /*return*/, n === 1];
                }
            });
        });
    };
    RedissonAtomicLong.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1: return [2 /*return*/, (_a.sent()) > 0];
                }
            });
        });
    };
    return RedissonAtomicLong;
}());
exports.RedissonAtomicLong = RedissonAtomicLong;
var RedissonBucket = /** @class */ (function () {
    function RedissonBucket(name) {
        this.name = name;
    }
    RedissonBucket.prototype.k = function () {
        return "bucket:".concat(this.name);
    };
    RedissonBucket.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.getJSON(this.k())];
            });
        });
    };
    RedissonBucket.prototype.set = function (value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.setJSON(this.k(), value, ttlSeconds)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonBucket.prototype.getAndDelete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var v;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get()];
                    case 1:
                        v = _a.sent();
                        if (!(v != null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, v];
                }
            });
        });
    };
    RedissonBucket.prototype.compareAndSet = function (expect, update) {
        return __awaiter(this, void 0, void 0, function () {
            var cur;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get()];
                    case 1:
                        cur = _a.sent();
                        if (JSON.stringify(cur) !== JSON.stringify(expect))
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.set(update)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RedissonBucket.prototype.trySet = function (value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var ok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.setNX(this.k(), JSON.stringify(value), ttlSeconds)];
                    case 1:
                        ok = _a.sent();
                        return [2 /*return*/, ok];
                }
            });
        });
    };
    RedissonBucket.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1: return [2 /*return*/, (_a.sent()) > 0];
                }
            });
        });
    };
    RedissonBucket.prototype.isExists = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.exists(this.k())];
            });
        });
    };
    RedissonBucket.prototype.expire = function (ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.expire(this.k(), ttlSeconds)];
            });
        });
    };
    return RedissonBucket;
}());
exports.RedissonBucket = RedissonBucket;
var RedissonMap = /** @class */ (function () {
    function RedissonMap(name) {
        this.name = name;
    }
    RedissonMap.prototype.k = function () {
        return "map:".concat(this.name);
    };
    RedissonMap.prototype.ser = function (v) {
        return typeof v === "string" ? v : JSON.stringify(v);
    };
    RedissonMap.prototype.de = function (raw) {
        if (raw === undefined)
            return undefined;
        try {
            return JSON.parse(raw);
        }
        catch (_a) {
            return raw;
        }
    };
    RedissonMap.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.de;
                        return [4 /*yield*/, Redis_1.default.hGet(this.k(), key)];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                }
            });
        });
    };
    RedissonMap.prototype.put = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.hSet(this.k(), key, this.ser(value))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonMap.prototype.putAll = function (entries) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, k, v;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = Object.entries(entries);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], k = _b[0], v = _b[1];
                        return [4 /*yield*/, this.put(k, v)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RedissonMap.prototype.remove = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.hDel(this.k(), key)];
                    case 1: return [2 /*return*/, (_a.sent()) > 0];
                }
            });
        });
    };
    RedissonMap.prototype.containsKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.hGet(this.k(), key)];
                    case 1: return [2 /*return*/, (_a.sent()) !== undefined];
                }
            });
        });
    };
    RedissonMap.prototype.readAllMap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var all, out, _i, _a, _b, k, v;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.hGetAll(this.k())];
                    case 1:
                        all = _c.sent();
                        out = {};
                        for (_i = 0, _a = Object.entries(all); _i < _a.length; _i++) {
                            _b = _a[_i], k = _b[0], v = _b[1];
                            out[k] = this.de(v);
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    };
    RedissonMap.prototype.size = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.hLen(Redis_1.default.key(this.k()))];
                }
            });
        });
    };
    RedissonMap.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedissonMap;
}());
exports.RedissonMap = RedissonMap;
var RedissonSet = /** @class */ (function () {
    function RedissonSet(name) {
        this.name = name;
    }
    RedissonSet.prototype.k = function () {
        return "set:".concat(this.name);
    };
    RedissonSet.prototype.add = function () {
        var members = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            members[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.sAdd.apply(Redis_1.default, __spreadArray([this.k()], members, false))];
            });
        });
    };
    RedissonSet.prototype.remove = function () {
        var members = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            members[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.sRem.apply(Redis_1.default, __spreadArray([this.k()], members, false))];
            });
        });
    };
    RedissonSet.prototype.contains = function (member) {
        return __awaiter(this, void 0, void 0, function () {
            var client, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _b.sent();
                        _a = Number;
                        return [4 /*yield*/, client.sIsMember(Redis_1.default.key(this.k()), member)];
                    case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()]) === 1];
                }
            });
        });
    };
    RedissonSet.prototype.readAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.sMembers(this.k())];
            });
        });
    };
    RedissonSet.prototype.size = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.sCard(Redis_1.default.key(this.k()))];
                }
            });
        });
    };
    RedissonSet.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedissonSet;
}());
exports.RedissonSet = RedissonSet;
var RedissonList = /** @class */ (function () {
    function RedissonList(name) {
        this.name = name;
    }
    RedissonList.prototype.k = function () {
        return "list:".concat(this.name);
    };
    RedissonList.prototype.add = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.rPush.apply(Redis_1.default, __spreadArray([this.k()], values, false))];
            });
        });
    };
    RedissonList.prototype.get = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.lIndex(Redis_1.default.key(this.k()), index)];
                }
            });
        });
    };
    RedissonList.prototype.range = function (start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.lRange(this.k(), start, stop)];
            });
        });
    };
    RedissonList.prototype.remove = function (count, value) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.lRem(Redis_1.default.key(this.k()), count, value)];
                }
            });
        });
    };
    RedissonList.prototype.size = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.lLen(this.k())];
            });
        });
    };
    RedissonList.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedissonList;
}());
exports.RedissonList = RedissonList;
var RedissonScoredSortedSet = /** @class */ (function () {
    function RedissonScoredSortedSet(name) {
        this.name = name;
    }
    RedissonScoredSortedSet.prototype.k = function () {
        return "zset:".concat(this.name);
    };
    RedissonScoredSortedSet.prototype.add = function (score, value) {
        return __awaiter(this, void 0, void 0, function () {
            var n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.zAdd(this.k(), [{ score: score, value: value }])];
                    case 1:
                        n = _a.sent();
                        return [2 /*return*/, n > 0];
                }
            });
        });
    };
    RedissonScoredSortedSet.prototype.addAll = function (members) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.zAdd(this.k(), members)];
            });
        });
    };
    RedissonScoredSortedSet.prototype.remove = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.zRem.apply(Redis_1.default, __spreadArray([this.k()], values, false))];
            });
        });
    };
    RedissonScoredSortedSet.prototype.rank = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var client, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.zRank(Redis_1.default.key(this.k()), value)];
                    case 2:
                        r = _a.sent();
                        return [2 /*return*/, r == null ? null : Number(r)];
                }
            });
        });
    };
    RedissonScoredSortedSet.prototype.score = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.zScore(this.k(), value)];
            });
        });
    };
    RedissonScoredSortedSet.prototype.valueRange = function (start, stop) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.zRange(this.k(), start, stop)];
            });
        });
    };
    RedissonScoredSortedSet.prototype.valueRangeByScore = function (min, max) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.zRangeByScore(this.k(), min, max)];
            });
        });
    };
    RedissonScoredSortedSet.prototype.size = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.zCard(this.k())];
            });
        });
    };
    RedissonScoredSortedSet.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedissonScoredSortedSet;
}());
exports.RedissonScoredSortedSet = RedissonScoredSortedSet;
var RedissonTopic = /** @class */ (function () {
    function RedissonTopic(name) {
        this.name = name;
    }
    RedissonTopic.prototype.publish = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.publish(this.name, message)];
            });
        });
    };
    RedissonTopic.prototype.addListener = function (listener) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.subscribe(this.name, function (msg) { return listener(msg); })];
            });
        });
    };
    return RedissonTopic;
}());
exports.RedissonTopic = RedissonTopic;
var RedissonRateLimiter = /** @class */ (function () {
    function RedissonRateLimiter(name) {
        this.name = name;
    }
    RedissonRateLimiter.prototype.k = function () {
        return "rrate:".concat(this.name);
    };
    RedissonRateLimiter.prototype.trySetRate = function (rate, rateIntervalMs) {
        return __awaiter(this, void 0, void 0, function () {
            var client, key, exists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        key = Redis_1.default.key(this.k());
                        return [4 /*yield*/, client.exists(key)];
                    case 2:
                        exists = _a.sent();
                        if (exists)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, client.hSet(key, {
                                rate: String(rate),
                                interval: String(rateIntervalMs),
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RedissonRateLimiter.prototype.tryAcquire = function () {
        return __awaiter(this, arguments, void 0, function (permits) {
            var client, conf, rate, interval, ok;
            var _a, _b;
            if (permits === void 0) { permits = 1; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _c.sent();
                        return [4 /*yield*/, client.hmGet(Redis_1.default.key(this.k()), ["rate", "interval"])];
                    case 2:
                        conf = _c.sent();
                        rate = Number((_a = conf[0]) !== null && _a !== void 0 ? _a : 0);
                        interval = Number((_b = conf[1]) !== null && _b !== void 0 ? _b : 1000);
                        if (rate <= 0)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, (0, utils_1.evalNumber)(RATE_TRY_LUA, [Redis_1.default.key(this.k())], [Date.now(), rate, interval, Math.max(1, permits)])];
                    case 3:
                        ok = _c.sent();
                        return [2 /*return*/, ok === 1];
                }
            });
        });
    };
    RedissonRateLimiter.prototype.availablePermits = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, conf, rate, interval, bucket, now, n;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _c.sent();
                        return [4 /*yield*/, client.hmGet(Redis_1.default.key(this.k()), ["rate", "interval"])];
                    case 2:
                        conf = _c.sent();
                        rate = Number((_a = conf[0]) !== null && _a !== void 0 ? _a : 0);
                        interval = Number((_b = conf[1]) !== null && _b !== void 0 ? _b : 1000);
                        if (rate <= 0)
                            return [2 /*return*/, 0];
                        bucket = Redis_1.default.key("".concat(this.k(), ":bucket"));
                        now = Date.now();
                        return [4 /*yield*/, client.zRemRangeByScore(bucket, 0, now - interval)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, client.zCard(bucket)];
                    case 4:
                        n = _c.sent();
                        return [2 /*return*/, Math.max(0, rate - Number(n))];
                }
            });
        });
    };
    return RedissonRateLimiter;
}());
exports.RedissonRateLimiter = RedissonRateLimiter;
var RedissonBitSet = /** @class */ (function () {
    function RedissonBitSet(name) {
        this.name = name;
    }
    RedissonBitSet.prototype.k = function () {
        return Redis_1.default.key("bitset:".concat(this.name));
    };
    RedissonBitSet.prototype.get = function (bitIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var client, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _b.sent();
                        _a = Number;
                        return [4 /*yield*/, client.getBit(this.k(), bitIndex)];
                    case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()]) === 1];
                }
            });
        });
    };
    RedissonBitSet.prototype.set = function (bitIndex_1) {
        return __awaiter(this, arguments, void 0, function (bitIndex, value) {
            var client, prev;
            if (value === void 0) { value = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.setBit(this.k(), bitIndex, value ? 1 : 0)];
                    case 2:
                        prev = _a.sent();
                        return [2 /*return*/, Number(prev) === 1];
                }
            });
        });
    };
    RedissonBitSet.prototype.clear = function (bitIndex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(bitIndex === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Redis_1.default.del("bitset:".concat(this.name))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.set(bitIndex, false)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonBitSet.prototype.cardinality = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.bitCount(this.k())];
                }
            });
        });
    };
    RedissonBitSet.prototype.size = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.strLen(this.k()) * 8];
                }
            });
        });
    };
    return RedissonBitSet;
}());
exports.RedissonBitSet = RedissonBitSet;
var RedissonQueue = /** @class */ (function () {
    function RedissonQueue(name) {
        this.name = name;
    }
    RedissonQueue.prototype.k = function () {
        return "queue:".concat(this.name);
    };
    RedissonQueue.prototype.offer = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.rPush.apply(Redis_1.default, __spreadArray([this.k()], values, false))];
            });
        });
    };
    RedissonQueue.prototype.poll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.lPop(this.k())];
            });
        });
    };
    RedissonQueue.prototype.peek = function () {
        return __awaiter(this, void 0, void 0, function () {
            var arr;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.lRange(this.k(), 0, 0)];
                    case 1:
                        arr = _b.sent();
                        return [2 /*return*/, (_a = arr[0]) !== null && _a !== void 0 ? _a : null];
                }
            });
        });
    };
    RedissonQueue.prototype.size = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.lLen(this.k())];
            });
        });
    };
    RedissonQueue.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.del(this.k())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedissonQueue;
}());
exports.RedissonQueue = RedissonQueue;
