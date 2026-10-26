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
exports.Cacheable = Cacheable;
exports.CacheEvict = CacheEvict;
var Redis_1 = require("./Redis");
var types_1 = require("./types");
function defaultSuffix() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    try {
        return JSON.stringify(args);
    }
    catch (_a) {
        return String(args.length);
    }
}
function resolveCacheKey(target, propertyKey, option, args) {
    var _a, _b, _c;
    var ctorName = ((_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) ||
        "Anonymous";
    var method = String(propertyKey);
    var prefix = (_b = option.key) !== null && _b !== void 0 ? _b : "".concat(types_1.CACHE_KEY).concat(ctorName, ".").concat(method);
    var gen = (_c = option.keyGenerator) !== null && _c !== void 0 ? _c : defaultSuffix;
    var suffix = gen.apply(void 0, args);
    return suffix ? "".concat(prefix, ":").concat(suffix) : prefix;
}
/**
 * 方法结果缓存到 Redis（JSON）。
 * @example
 *   @Cacheable({ ttl: 60 })
 *   async getUser(id: string) { ... }
 */
function Cacheable(option) {
    if (option === void 0) { option = {}; }
    return function (target, propertyKey, descriptor) {
        var original = descriptor.value;
        if (typeof original !== "function")
            return descriptor;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, hit, result, ttl;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            cacheKey = resolveCacheKey(target, propertyKey, option, args);
                            return [4 /*yield*/, Redis_1.default.getJSON(cacheKey)];
                        case 1:
                            hit = _b.sent();
                            if (hit !== null)
                                return [2 /*return*/, hit];
                            return [4 /*yield*/, original.apply(this, args)];
                        case 2:
                            result = _b.sent();
                            ttl = (_a = option.ttl) !== null && _a !== void 0 ? _a : 60;
                            if (!(result !== undefined)) return [3 /*break*/, 4];
                            return [4 /*yield*/, Redis_1.default.setJSON(cacheKey, result, ttl > 0 ? ttl : undefined)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [2 /*return*/, result];
                    }
                });
            });
        };
        return descriptor;
    };
}
/**
 * 方法执行后清除缓存。
 * @example
 *   @CacheEvict({ key: 'cache:UserService.getUser' })
 *   async updateUser(id: string) { ... }
 */
function CacheEvict(option) {
    if (option === void 0) { option = {}; }
    return function (target, propertyKey, descriptor) {
        var original = descriptor.value;
        if (typeof original !== "function")
            return descriptor;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var result, ctorName, method, prefix, cacheKey;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, original.apply(this, args)];
                        case 1:
                            result = _c.sent();
                            if (!option.allEntries) return [3 /*break*/, 3];
                            ctorName = ((_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) ||
                                "Anonymous";
                            method = String(propertyKey);
                            prefix = (_b = option.key) !== null && _b !== void 0 ? _b : "".concat(types_1.CACHE_KEY).concat(ctorName, ".").concat(method);
                            return [4 /*yield*/, Redis_1.default.deleteByPrefix(prefix)];
                        case 2:
                            _c.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            cacheKey = resolveCacheKey(target, propertyKey, option, args);
                            return [4 /*yield*/, Redis_1.default.del(cacheKey)];
                        case 4:
                            _c.sent();
                            _c.label = 5;
                        case 5: return [2 /*return*/, result];
                    }
                });
            });
        };
        return descriptor;
    };
}
