"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerAdvice = ControllerAdvice;
exports.ExceptionHandler = ExceptionHandler;
require("reflect-metadata");
var registry_1 = require("./registry");
var HANDLERS_KEY = Symbol.for("pangza.exception.handlers");
/**
 * 类装饰器：标记全局异常处理类（对齐 @RestControllerAdvice）。
 * 类加载时自动注册其中的 @ExceptionHandler 方法。
 *
 * @example
 * @ControllerAdvice()
 * class GlobalExceptionHandler {
 *   @ExceptionHandler(BizException)
 *   handleBiz(e: BizException) { return { message: e.message, code: e.code }; }
 * }
 */
function ControllerAdvice() {
    return function (ctor) {
        var _a;
        var Ctor = ctor;
        var pending = (_a = Reflect.getOwnMetadata(HANDLERS_KEY, ctor)) !== null && _a !== void 0 ? _a : [];
        var instance = new Ctor();
        for (var _i = 0, pending_1 = pending; _i < pending_1.length; _i++) {
            var item = pending_1[_i];
            var method = instance[item.handlerName];
            if (typeof method !== "function") {
                throw new Error("[ControllerAdvice] ".concat(Ctor.name, ".").concat(item.handlerName, " \u4E0D\u662F\u51FD\u6570"));
            }
            var bound = method.bind(instance);
            (0, registry_1.registerExceptionHandler)({
                errorType: item.errorType,
                handlerName: "".concat(Ctor.name, ".").concat(item.handlerName),
                handler: bound,
            });
        }
    };
}
/**
 * 方法装饰器：声明处理某类异常（对齐 @ExceptionHandler）。
 * @param errorType 错误类，默认 Error（兜底）
 */
function ExceptionHandler(errorType) {
    if (errorType === void 0) { errorType = Error; }
    return function (target, propertyKey) {
        var _a;
        var ctor = target.constructor;
        var list = (_a = Reflect.getOwnMetadata(HANDLERS_KEY, ctor)) !== null && _a !== void 0 ? _a : [];
        list.push({
            errorType: errorType,
            handlerName: String(propertyKey),
        });
        Reflect.defineMetadata(HANDLERS_KEY, list, ctor);
    };
}
