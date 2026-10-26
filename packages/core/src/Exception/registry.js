"use strict";
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
exports.registerExceptionHandler = registerExceptionHandler;
exports.clearExceptionHandlers = clearExceptionHandlers;
exports.getExceptionHandlers = getExceptionHandlers;
exports.resolveExceptionHandler = resolveExceptionHandler;
var adviceList = [];
/** 注册一条异常处理（后注册的同类型优先） */
function registerExceptionHandler(meta) {
    adviceList.unshift(meta);
}
/** 清空（测试用） */
function clearExceptionHandlers() {
    adviceList.length = 0;
}
/** 当前已注册的处理器（只读副本） */
function getExceptionHandlers() {
    return __spreadArray([], adviceList, true);
}
/**
 * 按继承链匹配最合适的处理器。
 * 优先：精确类型 > 更近的父类 > 通用 Error。
 */
function resolveExceptionHandler(error) {
    if (error === null || error === undefined)
        return undefined;
    var errorCtor = typeof error === "object" && error.constructor
        ? error.constructor
        : undefined;
    // 1. 精确匹配
    if (errorCtor) {
        var exact = adviceList.find(function (h) { return h.errorType === errorCtor; });
        if (exact)
            return exact;
    }
    // 2. instanceof 匹配（跳过过于宽泛的 Error，留给第 3 步）
    if (typeof error === "object") {
        var best = void 0;
        var bestDistance = Number.POSITIVE_INFINITY;
        for (var _i = 0, adviceList_1 = adviceList; _i < adviceList_1.length; _i++) {
            var handler = adviceList_1[_i];
            if (handler.errorType === Error)
                continue;
            if (!(error instanceof handler.errorType))
                continue;
            var distance = inheritanceDistance(error.constructor, handler.errorType);
            if (distance >= 0 && distance < bestDistance) {
                best = handler;
                bestDistance = distance;
            }
        }
        if (best)
            return best;
    }
    // 3. 兜底 Error
    return adviceList.find(function (h) { return h.errorType === Error; });
}
function inheritanceDistance(from, to) {
    var _a, _b;
    var distance = 0;
    var cur = from;
    while (cur && cur !== Function.prototype) {
        if (cur === to)
            return distance;
        cur = (_b = (_a = Object.getPrototypeOf(cur.prototype)) === null || _a === void 0 ? void 0 : _a.constructor) !== null && _b !== void 0 ? _b : null;
        distance += 1;
        if (distance > 32)
            break;
    }
    return -1;
}
