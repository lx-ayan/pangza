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
exports.RedissonMultiLock = void 0;
var errors_1 = require("../errors");
/**
 * 联锁：按顺序加锁，失败则回滚已加锁。
 */
var RedissonMultiLock = /** @class */ (function () {
    function RedissonMultiLock(locks) {
        this.locks = locks;
        if (!locks.length)
            throw new errors_1.LockError("MultiLock 至少需要一把锁");
        this.name = locks.map(function (l) { return l.name; }).join(",");
    }
    RedissonMultiLock.prototype.lock = function (leaseTimeMs) {
        return __awaiter(this, void 0, void 0, function () {
            var ok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryLock(-1, leaseTimeMs)];
                    case 1:
                        ok = _a.sent();
                        if (!ok)
                            throw new errors_1.LockError("\u83B7\u53D6\u8054\u9501\u5931\u8D25: ".concat(this.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonMultiLock.prototype.tryLock = function (waitTimeMs, leaseTimeMs) {
        return __awaiter(this, void 0, void 0, function () {
            var acquired, _i, _a, lock, ok, _b, _c, a, _d, e_1, _e, _f, a, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        acquired = [];
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 13, , 20]);
                        _i = 0, _a = this.locks;
                        _h.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        lock = _a[_i];
                        return [4 /*yield*/, lock.tryLock(waitTimeMs, leaseTimeMs)];
                    case 3:
                        ok = _h.sent();
                        if (!!ok) return [3 /*break*/, 10];
                        _b = 0, _c = acquired.reverse();
                        _h.label = 4;
                    case 4:
                        if (!(_b < _c.length)) return [3 /*break*/, 9];
                        a = _c[_b];
                        _h.label = 5;
                    case 5:
                        _h.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, a.unlock()];
                    case 6:
                        _h.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _d = _h.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _b++;
                        return [3 /*break*/, 4];
                    case 9: return [2 /*return*/, false];
                    case 10:
                        acquired.push(lock);
                        _h.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 2];
                    case 12: return [2 /*return*/, true];
                    case 13:
                        e_1 = _h.sent();
                        _e = 0, _f = acquired.reverse();
                        _h.label = 14;
                    case 14:
                        if (!(_e < _f.length)) return [3 /*break*/, 19];
                        a = _f[_e];
                        _h.label = 15;
                    case 15:
                        _h.trys.push([15, 17, , 18]);
                        return [4 /*yield*/, a.unlock()];
                    case 16:
                        _h.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        _g = _h.sent();
                        return [3 /*break*/, 18];
                    case 18:
                        _e++;
                        return [3 /*break*/, 14];
                    case 19: throw e_1;
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    RedissonMultiLock.prototype.unlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, lock;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = __spreadArray([], this.locks, true).reverse();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lock = _a[_i];
                        return [4 /*yield*/, lock.unlock()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RedissonMultiLock.prototype.forceUnlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var any, _i, _a, lock;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        any = false;
                        _i = 0, _a = __spreadArray([], this.locks, true).reverse();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lock = _a[_i];
                        return [4 /*yield*/, lock.forceUnlock()];
                    case 2:
                        if (_b.sent())
                            any = true;
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, any];
                }
            });
        });
    };
    RedissonMultiLock.prototype.isLocked = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, lock;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.locks;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lock = _a[_i];
                        return [4 /*yield*/, lock.isLocked()];
                    case 2:
                        if (!(_b.sent()))
                            return [2 /*return*/, false];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    RedissonMultiLock.prototype.isHeldByCurrentThread = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, lock;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.locks;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lock = _a[_i];
                        return [4 /*yield*/, lock.isHeldByCurrentThread()];
                    case 2:
                        if (!(_b.sent()))
                            return [2 /*return*/, false];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    RedissonMultiLock.prototype.getHoldCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var min, _i, _a, lock, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        min = Number.POSITIVE_INFINITY;
                        _i = 0, _a = this.locks;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lock = _a[_i];
                        _c = (_b = Math).min;
                        _d = [min];
                        return [4 /*yield*/, lock.getHoldCount()];
                    case 2:
                        min = _c.apply(_b, _d.concat([_e.sent()]));
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Number.isFinite(min) ? min : 0];
                }
            });
        });
    };
    RedissonMultiLock.prototype.remainTimeToLive = function () {
        return __awaiter(this, void 0, void 0, function () {
            var min, _i, _a, lock, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        min = Number.POSITIVE_INFINITY;
                        _i = 0, _a = this.locks;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        lock = _a[_i];
                        _c = (_b = Math).min;
                        _d = [min];
                        return [4 /*yield*/, lock.remainTimeToLive()];
                    case 2:
                        min = _c.apply(_b, _d.concat([_e.sent()]));
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Number.isFinite(min) ? min : -2];
                }
            });
        });
    };
    return RedissonMultiLock;
}());
exports.RedissonMultiLock = RedissonMultiLock;
