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
exports.configureLog = configureLog;
exports.isLogRegistered = isLogRegistered;
exports.getLogOptions = getLogOptions;
exports.recordOperationLog = recordOperationLog;
var auth_1 = require("@pangza/auth");
var Logger_1 = require("@pangza/core/Logger");
var ip_1 = require("./ip");
var types_1 = require("./types");
var log = (0, Logger_1.getLogger)("OperLog");
var DEFAULT_EXCLUDE = [
    "password",
    "oldPassword",
    "newPassword",
    "confirmPassword",
    "attachments",
];
var moduleOptions = {
    enabled: true,
    silent: false,
    excludeParamNames: [],
};
var logRegistered = false;
function configureLog(options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    moduleOptions = __assign(__assign(__assign({}, moduleOptions), options), { enabled: (_a = options.enabled) !== null && _a !== void 0 ? _a : moduleOptions.enabled, silent: (_b = options.silent) !== null && _b !== void 0 ? _b : moduleOptions.silent, excludeParamNames: (_c = options.excludeParamNames) !== null && _c !== void 0 ? _c : moduleOptions.excludeParamNames, writer: (_d = options.writer) !== null && _d !== void 0 ? _d : moduleOptions.writer });
    logRegistered = true;
}
function isLogRegistered() {
    return logRegistered;
}
function getLogOptions() {
    return moduleOptions;
}
function shouldRecord(option) {
    if (!logRegistered || !moduleOptions.enabled)
        return false;
    if (!option || option.ignore)
        return false;
    return true;
}
function omitSensitive(value, exclude) {
    if (value == null)
        return value;
    if (Array.isArray(value)) {
        return value.map(function (item) { return omitSensitive(item, exclude); });
    }
    if (typeof value === "object") {
        var obj = value;
        var next = {};
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            if (exclude.includes(k))
                continue;
            next[k] = omitSensitive(v, exclude);
        }
        return next;
    }
    return value;
}
function safeJson(value, exclude, max) {
    var _a;
    if (max === void 0) { max = 2000; }
    try {
        var text = JSON.stringify((_a = omitSensitive(value, exclude)) !== null && _a !== void 0 ? _a : null);
        return text.length > max ? text.slice(0, max) : text;
    }
    catch (_b) {
        return "";
    }
}
/**
 * 异步写入操作日志（失败不影响业务）。
 * 持久化由 Log({ writer }) 注入，framework 不依赖 business Service。
 */
function recordOperationLog(ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, exclude, username, avatar, session, _a, params, errorMessage, ip, address, userAgent, row, e_1;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!shouldRecord(ctx.option))
                        return [2 /*return*/];
                    writer = moduleOptions.writer;
                    if (!writer) {
                        // 未注入 writer（如删除 business）时静默跳过，便于纯净启动
                        return [2 /*return*/];
                    }
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 7, , 8]);
                    exclude = __spreadArray(__spreadArray(__spreadArray([], DEFAULT_EXCLUDE, true), ((_b = moduleOptions.excludeParamNames) !== null && _b !== void 0 ? _b : []), true), ((_c = ctx.option.excludeParamNames) !== null && _c !== void 0 ? _c : []), true);
                    username = "";
                    avatar = "";
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, auth_1.AuthUtil.getSession()];
                case 3:
                    session = _h.sent();
                    if (session) {
                        username = session.username || String((_d = session.loginId) !== null && _d !== void 0 ? _d : "");
                        avatar = session.avatar || "";
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _h.sent();
                    return [3 /*break*/, 5];
                case 5:
                    params = ctx.req.method === "GET"
                        ? safeJson(ctx.req.query, exclude)
                        : safeJson(ctx.req.body, exclude);
                    errorMessage = "";
                    if (ctx.error) {
                        errorMessage =
                            ctx.error instanceof Error
                                ? ctx.error.message || ctx.error.name
                                : String(ctx.error);
                        if (errorMessage.length > 2000)
                            errorMessage = errorMessage.slice(0, 2000);
                    }
                    ip = ctx.clientIp || (0, ip_1.getClientIp)(ctx.req);
                    address = (0, ip_1.resolveIpAddress)(ip);
                    userAgent = ((_e = ctx.userAgent) !== null && _e !== void 0 ? _e : String(ctx.req.headers["user-agent"] || "")).slice(0, 255);
                    row = {
                        title: ctx.option.title || "",
                        username: username,
                        avatar: avatar,
                        business: String((_f = ctx.option.business) !== null && _f !== void 0 ? _f : types_1.BusinessType.OTHER),
                        oper: String((_g = ctx.option.oper) !== null && _g !== void 0 ? _g : types_1.OperType.PC),
                        params: params,
                        response: safeJson(ctx.result, exclude),
                        methodName: ctx.req.method,
                        controllerName: ctx.controllerName || "",
                        status: String(ctx.statusCode),
                        timeLong: Math.max(0, Date.now() - ctx.startTime),
                        ip: ip,
                        address: address,
                        userAgent: userAgent,
                        url: String(ctx.req.originalUrl || ctx.req.url || "").slice(0, 255),
                        errorMessage: errorMessage,
                        deleteFlag: 0,
                        createTime: new Date(),
                    };
                    return [4 /*yield*/, writer(row)];
                case 6:
                    _h.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _h.sent();
                    if (!moduleOptions.silent) {
                        log.error({ err: e_1 }, "记录操作日志失败");
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
