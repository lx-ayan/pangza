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
exports.handleException = handleException;
var ResponseData_1 = require("../utils/entity/ResponseData");
var enums_1 = require("../types/enums");
var Logger_1 = require("../Logger");
var optional_1 = require("../optional");
var Validate_1 = require("../Validate");
var registry_1 = require("./registry");
var types_1 = require("./types");
var log = (0, Logger_1.getLogger)("Exception");
function authMod() {
    return (0, optional_1.optionalRequire)("@pangza/auth");
}
function ormMod() {
    return (0, optional_1.optionalRequire)("@pangza/orm");
}
function redisMod() {
    return (0, optional_1.optionalRequire)("@pangza/redis");
}
/** 判断是否像 ResponseData */
function isResponseDataLike(value) {
    return (!!value &&
        typeof value === "object" &&
        "code" in value &&
        "message" in value &&
        "data" in value);
}
/**
 * 统一解析并发送错误响应。
 * 优先走用户 @ControllerAdvice / registerExceptionHandler，否则用内置规则。
 */
function handleException(req, res, error) {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, matched, result, handlerError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (res.headersSent)
                        return [2 /*return*/];
                    ctx = { req: req, res: res, error: error };
                    matched = (0, registry_1.resolveExceptionHandler)(error);
                    if (!matched) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, matched.handler(error, ctx)];
                case 2:
                    result = _a.sent();
                    if (sendHandlerResult(res, result))
                        return [2 /*return*/];
                    return [3 /*break*/, 4];
                case 3:
                    handlerError_1 = _a.sent();
                    log.error({ err: handlerError_1, handler: matched.handlerName }, "自定义异常处理器抛错");
                    return [3 /*break*/, 4];
                case 4:
                    sendBuiltin(res, error);
                    return [2 /*return*/];
            }
        });
    });
}
function sendHandlerResult(res, result) {
    var _a, _b, _c, _d, _e;
    if (result === null || result === undefined)
        return false;
    if (isResponseDataLike(result)) {
        res.status(200).send(result);
        return true;
    }
    if (typeof result === "object") {
        if ("rawBody" in result && result.rawBody !== undefined) {
            var status_1 = (_a = result.httpStatus) !== null && _a !== void 0 ? _a : 200;
            res.status(status_1).send(result.rawBody);
            return true;
        }
        var httpStatus = (_b = result.httpStatus) !== null && _b !== void 0 ? _b : 200;
        var body = ResponseData_1.default.error((_c = result.message) !== null && _c !== void 0 ? _c : "操作失败", (_d = result.data) !== null && _d !== void 0 ? _d : null, (_e = result.code) !== null && _e !== void 0 ? _e : enums_1.ResponseCode.ERROR);
        res.status(httpStatus).send(body);
        return true;
    }
    return false;
}
function isInstance(error, Ctor) {
    return typeof Ctor === "function" && error instanceof Ctor;
}
/** 内置默认错误映射（未注册自定义处理器时；可选分包未安装则跳过对应分支） */
function sendBuiltin(res, error) {
    if (error instanceof types_1.BizException) {
        res
            .status(error.httpStatus)
            .send(ResponseData_1.default.error(error.message, error.data, error.code));
        return;
    }
    if (error instanceof Validate_1.ValidationError) {
        res
            .status(200)
            .send(ResponseData_1.default.error(error.message, error.errors, error.code));
        return;
    }
    var auth = authMod();
    if (isInstance(error, auth === null || auth === void 0 ? void 0 : auth.AuthError)) {
        var e = error;
        res.status(200).send(ResponseData_1.default.error(e.message, null, e.code));
        return;
    }
    var orm = ormMod();
    if (isInstance(error, orm === null || orm === void 0 ? void 0 : orm.OrmError)) {
        var e = error;
        res.status(200).send(ResponseData_1.default.error(e.message, null, e.code));
        return;
    }
    var redis = redisMod();
    if (isInstance(error, redis === null || redis === void 0 ? void 0 : redis.GuardError)) {
        var e = error;
        res.status(200).send(ResponseData_1.default.error(e.message, null, e.code));
        return;
    }
    if (isInstance(error, redis === null || redis === void 0 ? void 0 : redis.LockError)) {
        var e = error;
        res
            .status(200)
            .send(ResponseData_1.default.error(e.message, null, enums_1.ResponseCode.ERROR));
        return;
    }
    var message = error instanceof Error ? error.message : "错误";
    log.error({ err: error }, "unhandled exception");
    res.status(500).send(ResponseData_1.default.error(message));
}
