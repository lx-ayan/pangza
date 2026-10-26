"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperType = exports.BusinessType = exports.isInternalIp = exports.normalizeIp = exports.resolveIpAddress = exports.getClientIp = exports.getLogOptions = exports.isLogRegistered = exports.recordOperationLog = exports.configureLog = exports.LOG_MIDDLEWARE_FLAG = void 0;
exports.default = Log;
var recorder_1 = require("./recorder");
var flag_1 = require("./flag");
/**
 * Log 模块工厂（对齐 Auth）。
 * 通过 Application.registry(Log()) 注册后，
 * 路由 option.log / @Log 才会真正落库。
 */
function Log(options) {
    if (options === void 0) { options = {}; }
    (0, recorder_1.configureLog)(options);
    var middleware = function (_req, _res, next) {
        next();
    };
    Object.defineProperty(middleware, flag_1.LOG_MIDDLEWARE_FLAG, {
        value: true,
        enumerable: false,
    });
    return middleware;
}
var flag_2 = require("./flag");
Object.defineProperty(exports, "LOG_MIDDLEWARE_FLAG", { enumerable: true, get: function () { return flag_2.LOG_MIDDLEWARE_FLAG; } });
var recorder_2 = require("./recorder");
Object.defineProperty(exports, "configureLog", { enumerable: true, get: function () { return recorder_2.configureLog; } });
Object.defineProperty(exports, "recordOperationLog", { enumerable: true, get: function () { return recorder_2.recordOperationLog; } });
Object.defineProperty(exports, "isLogRegistered", { enumerable: true, get: function () { return recorder_2.isLogRegistered; } });
Object.defineProperty(exports, "getLogOptions", { enumerable: true, get: function () { return recorder_2.getLogOptions; } });
var ip_1 = require("./ip");
Object.defineProperty(exports, "getClientIp", { enumerable: true, get: function () { return ip_1.getClientIp; } });
Object.defineProperty(exports, "resolveIpAddress", { enumerable: true, get: function () { return ip_1.resolveIpAddress; } });
Object.defineProperty(exports, "normalizeIp", { enumerable: true, get: function () { return ip_1.normalizeIp; } });
Object.defineProperty(exports, "isInternalIp", { enumerable: true, get: function () { return ip_1.isInternalIp; } });
var types_1 = require("./types");
Object.defineProperty(exports, "BusinessType", { enumerable: true, get: function () { return types_1.BusinessType; } });
Object.defineProperty(exports, "OperType", { enumerable: true, get: function () { return types_1.OperType; } });
