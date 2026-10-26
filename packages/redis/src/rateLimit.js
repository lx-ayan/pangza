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
exports.applyRateLimit = applyRateLimit;
exports.applyRepeatSubmit = applyRepeatSubmit;
var crypto_1 = require("crypto");
var Redis_1 = require("./Redis");
var ip_1 = require("@pangza/log/ip");
var auth_1 = require("@pangza/auth");
var errors_1 = require("./errors");
var types_1 = require("./types");
function buildRateLimitKey(option, req, meta) {
    return __awaiter(this, void 0, void 0, function () {
        var prefix, key, type, loginId, controller, handler;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    prefix = (_a = option.key) !== null && _a !== void 0 ? _a : types_1.RATE_LIMIT_KEY;
                    key = prefix;
                    type = String((_b = option.type) !== null && _b !== void 0 ? _b : types_1.RateLimiterType.DEFAULT);
                    if (!(type === types_1.RateLimiterType.IP || type === "IP")) return [3 /*break*/, 1];
                    key += "".concat((0, ip_1.getClientIp)(req), "-");
                    return [3 /*break*/, 3];
                case 1:
                    if (!(type === types_1.RateLimiterType.USER || type === "USER")) return [3 /*break*/, 3];
                    return [4 /*yield*/, auth_1.AuthUtil.getLoginIdDefaultNull()];
                case 2:
                    loginId = (_c = (_d.sent())) !== null && _c !== void 0 ? _c : "anonymous";
                    key += "".concat(loginId, "-");
                    _d.label = 3;
                case 3:
                    controller = meta.controllerName || "Anonymous";
                    handler = meta.handlerName || req.path;
                    key += "".concat(controller, "-").concat(handler);
                    return [2 /*return*/, key];
            }
        });
    });
}
/**
 * 接口限流（对齐 Java RateLimiterAspect）
 */
function applyRateLimit(option_1, req_1) {
    return __awaiter(this, arguments, void 0, function (option, req, meta) {
        var time, count, key, mode, current, _a;
        var _b, _c, _d;
        if (meta === void 0) { meta = {}; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!option)
                        return [2 /*return*/];
                    time = (_b = option.time) !== null && _b !== void 0 ? _b : 2;
                    count = (_c = option.count) !== null && _c !== void 0 ? _c : 1;
                    return [4 /*yield*/, buildRateLimitKey(option, req, meta)];
                case 1:
                    key = _e.sent();
                    mode = (_d = option.mode) !== null && _d !== void 0 ? _d : "fixed";
                    if (!(mode === "sliding")) return [3 /*break*/, 3];
                    return [4 /*yield*/, Redis_1.default.rateLimitSliding(key, time, count)];
                case 2:
                    _a = _e.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, Redis_1.default.rateLimit(key, time, count)];
                case 4:
                    _a = _e.sent();
                    _e.label = 5;
                case 5:
                    current = _a;
                    if (current > count) {
                        throw new errors_1.GuardError("访问过于频繁，请稍后重试");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function serializeParams(req) {
    var _a;
    var body = req.body;
    if (body != null && typeof body === "object") {
        var keys = Object.keys(body);
        if (keys.length > 0) {
            try {
                return JSON.stringify(body);
            }
            catch (_b) {
                // fallthrough
            }
        }
    }
    try {
        return JSON.stringify((_a = req.query) !== null && _a !== void 0 ? _a : {});
    }
    catch (_c) {
        return "";
    }
}
function hashParams(raw) {
    return (0, crypto_1.createHash)("sha256").update(raw).digest("hex").slice(0, 32);
}
function buildRepeatBaseKey(req) {
    return __awaiter(this, void 0, void 0, function () {
        var loginId;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, auth_1.AuthUtil.getLoginIdDefaultNull()];
                case 1:
                    loginId = (_a = (_b.sent())) !== null && _a !== void 0 ? _a : "anonymous";
                    return [2 /*return*/, "".concat(types_1.REPEAT_SUBMIT_KEY).concat(req.originalUrl || req.url || req.path, ":").concat(loginId)];
            }
        });
    });
}
/**
 * 防重复提交（对齐 Java RepeatSubmitInterceptor）。
 * 用 SET NX PX 原子占坑：同 URL + 用户 + 参数指纹在 interval 内只能成功一次，无竞态。
 */
function applyRepeatSubmit(option, req) {
    return __awaiter(this, void 0, void 0, function () {
        var interval, message, fingerprint, key, _a, ok;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!option)
                        return [2 /*return*/];
                    interval = (_b = option.interval) !== null && _b !== void 0 ? _b : 3000;
                    message = (_c = option.message) !== null && _c !== void 0 ? _c : "请勿重复提交";
                    fingerprint = hashParams(serializeParams(req));
                    _a = "".concat;
                    return [4 /*yield*/, buildRepeatBaseKey(req)];
                case 1:
                    key = _a.apply("", [_d.sent(), ":"]).concat(fingerprint);
                    return [4 /*yield*/, Redis_1.default.setNxPx(key, "1", Math.max(1, interval))];
                case 2:
                    ok = _d.sent();
                    if (!ok) {
                        throw new errors_1.GuardError(message);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
