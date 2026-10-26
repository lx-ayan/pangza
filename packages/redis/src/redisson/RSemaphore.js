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
exports.RedissonSemaphore = void 0;
var Redis_1 = require("../Redis");
var scripts_1 = require("./scripts");
var utils_1 = require("./utils");
var RedissonSemaphore = /** @class */ (function () {
    function RedissonSemaphore(name) {
        this.name = name;
    }
    RedissonSemaphore.prototype.key = function () {
        return Redis_1.default.key("semaphore:".concat(this.name));
    };
    RedissonSemaphore.prototype.channel = function () {
        return (0, utils_1.channelName)("semaphore:".concat(this.name));
    };
    RedissonSemaphore.prototype.trySetPermits = function (permits) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Redis_1.default.setNX("semaphore:".concat(this.name), String(Math.max(0, permits)))];
            });
        });
    };
    RedissonSemaphore.prototype.availablePermits = function () {
        return __awaiter(this, void 0, void 0, function () {
            var v;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Redis_1.default.get("semaphore:".concat(this.name))];
                    case 1:
                        v = _a.sent();
                        return [2 /*return*/, v == null ? 0 : Number(v)];
                }
            });
        });
    };
    RedissonSemaphore.prototype.acquire = function () {
        return __awaiter(this, arguments, void 0, function (permits) {
            var ok;
            if (permits === void 0) { permits = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tryAcquire(permits, -1)];
                    case 1:
                        ok = _a.sent();
                        if (!ok)
                            throw new Error("\u83B7\u53D6\u4FE1\u53F7\u91CF\u5931\u8D25: ".concat(this.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    RedissonSemaphore.prototype.tryAcquire = function () {
        return __awaiter(this, arguments, void 0, function (permits, waitTimeMs) {
            var n, deadline, ok, remain, notified;
            if (permits === void 0) { permits = 1; }
            if (waitTimeMs === void 0) { waitTimeMs = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        n = Math.max(1, permits);
                        deadline = waitTimeMs < 0
                            ? Number.POSITIVE_INFINITY
                            : Date.now() + Math.max(0, waitTimeMs);
                        _a.label = 1;
                    case 1: return [4 /*yield*/, (0, utils_1.evalNumber)(scripts_1.SEMAPHORE_TRY_ACQUIRE_LUA, [this.key()], [0, n])];
                    case 2:
                        ok = _a.sent();
                        if (ok === 1)
                            return [2 /*return*/, true];
                        if (Date.now() >= deadline)
                            return [2 /*return*/, false];
                        remain = Math.max(0, deadline - Date.now());
                        return [4 /*yield*/, (0, utils_1.waitNotify)(this.channel(), Math.min(remain, 2000))];
                    case 3:
                        notified = _a.sent();
                        if (!!notified) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, utils_1.sleep)(Math.min(50, remain))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RedissonSemaphore.prototype.release = function () {
        return __awaiter(this, arguments, void 0, function (permits) {
            if (permits === void 0) { permits = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, utils_1.evalScript)(scripts_1.SEMAPHORE_RELEASE_LUA, [this.key(), this.channel()], [Math.max(1, permits)])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedissonSemaphore;
}());
exports.RedissonSemaphore = RedissonSemaphore;
