"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BizException = exports.resolveExceptionHandler = exports.getExceptionHandlers = exports.clearExceptionHandlers = exports.registerExceptionHandler = exports.handleException = exports.ExceptionHandler = exports.ControllerAdvice = void 0;
exports.registerHandler = registerHandler;
exports.default = Exception;
var registry_1 = require("./registry");
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "ControllerAdvice", { enumerable: true, get: function () { return decorators_1.ControllerAdvice; } });
Object.defineProperty(exports, "ExceptionHandler", { enumerable: true, get: function () { return decorators_1.ExceptionHandler; } });
var handler_1 = require("./handler");
Object.defineProperty(exports, "handleException", { enumerable: true, get: function () { return handler_1.handleException; } });
var registry_2 = require("./registry");
Object.defineProperty(exports, "registerExceptionHandler", { enumerable: true, get: function () { return registry_2.registerExceptionHandler; } });
Object.defineProperty(exports, "clearExceptionHandlers", { enumerable: true, get: function () { return registry_2.clearExceptionHandlers; } });
Object.defineProperty(exports, "getExceptionHandlers", { enumerable: true, get: function () { return registry_2.getExceptionHandlers; } });
Object.defineProperty(exports, "resolveExceptionHandler", { enumerable: true, get: function () { return registry_2.resolveExceptionHandler; } });
var types_1 = require("./types");
Object.defineProperty(exports, "BizException", { enumerable: true, get: function () { return types_1.BizException; } });
/**
 * 函数式注册异常处理（对齐 Spring 编程式扩展）。
 *
 * @example
 * registerHandler(BizException, (e) => ({ message: e.message, code: e.code }));
 */
function registerHandler(errorType, handler) {
    (0, registry_1.registerExceptionHandler)({
        errorType: errorType,
        handlerName: "functional:".concat(errorType.name || "Anonymous"),
        handler: handler,
    });
}
/**
 * 可选模块工厂：Application.registry(Exception()) 仅作占位，
 * 实际处理由 Application 内部调用 handleException。
 * 自定义处理器请用 @ControllerAdvice 或 registerHandler。
 */
function Exception() {
    var middleware = function (_req, _res, next) { return next(); };
    Object.defineProperty(middleware, Symbol.for("pangza.exception.module"), {
        value: true,
        enumerable: false,
    });
    return middleware;
}
