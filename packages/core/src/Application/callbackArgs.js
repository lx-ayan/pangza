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
exports.resolveCallbackArgs = resolveCallbackArgs;
exports.resolveRawCallbackArgs = resolveRawCallbackArgs;
var types_1 = require("./types");
/** 普通接口：按 @Request* 注入；未标注形参默认 req */
function resolveCallbackArgs(req, option, arity) {
    if (arity === void 0) { arity = 1; }
    var metas = option === null || option === void 0 ? void 0 : option.params;
    if (metas && metas.length > 0) {
        var maxIndex = Math.max.apply(Math, __spreadArray([arity - 1], metas.map(function (m) { return m.index; }), false));
        var args = new Array(maxIndex + 1);
        for (var i = 0; i <= maxIndex; i++) {
            args[i] = req;
        }
        for (var _i = 0, metas_1 = metas; _i < metas_1.length; _i++) {
            var meta = metas_1[_i];
            args[meta.index] = resolveParamInject(req, meta);
        }
        return args;
    }
    return [resolveCallbackArg(req, option)];
}
/**
 * flux / raw：支持 @RequestBody 等注入，同时保证能拿到 res。
 * - 无参数装饰器：固定 (req, res)
 * - 有装饰器：已标注的按来源注入；未标注的按顺序补 req / res
 *   （1 个未标注 → res；多个 → 第一个 req，其余 res）
 */
function resolveRawCallbackArgs(req, res, option, arity) {
    if (arity === void 0) { arity = 2; }
    var metas = option === null || option === void 0 ? void 0 : option.params;
    if (!metas || metas.length === 0) {
        return [req, res];
    }
    var maxIndex = Math.max.apply(Math, __spreadArray([arity - 1], metas.map(function (m) { return m.index; }), false));
    var args = new Array(maxIndex + 1);
    var decorated = new Set(metas.map(function (m) { return m.index; }));
    for (var _i = 0, metas_2 = metas; _i < metas_2.length; _i++) {
        var meta = metas_2[_i];
        args[meta.index] = resolveParamInject(req, meta);
    }
    var undecorated = [];
    for (var i = 0; i <= maxIndex; i++) {
        if (!decorated.has(i))
            undecorated.push(i);
    }
    if (undecorated.length === 0) {
        args.push(res);
    }
    else if (undecorated.length === 1) {
        args[undecorated[0]] = res;
    }
    else {
        args[undecorated[0]] = req;
        for (var i = 1; i < undecorated.length; i++) {
            args[undecorated[i]] = res;
        }
    }
    return args;
}
function resolveParamInject(req, meta) {
    var _a, _b, _c, _d, _e;
    switch (meta.source) {
        case "body":
            return (_a = req.body) !== null && _a !== void 0 ? _a : {};
        case "query":
            return (_b = req.query) !== null && _b !== void 0 ? _b : {};
        case "header":
            return (_c = req.headers) !== null && _c !== void 0 ? _c : {};
        case "cookie":
            return (_d = req.cookies) !== null && _d !== void 0 ? _d : {};
        case "path": {
            var values = Object.values((_e = req.params) !== null && _e !== void 0 ? _e : {});
            if (meta.pathIndex !== undefined) {
                return values[meta.pathIndex];
            }
            if (values.length <= 1)
                return values[0];
            return values;
        }
        default:
            return req;
    }
}
/** 无参数装饰器时，按 paramType 解析单个入参；未配置则传 req */
function resolveCallbackArg(req, option) {
    var _a, _b, _c, _d, _e;
    var type = option === null || option === void 0 ? void 0 : option.paramType;
    if (!type)
        return req;
    switch (type) {
        case types_1.ParamType.BODY:
            return (_a = req.body) !== null && _a !== void 0 ? _a : {};
        case types_1.ParamType.QUERY:
            return (_b = req.query) !== null && _b !== void 0 ? _b : {};
        case types_1.ParamType.HEADER:
            return (_c = req.headers) !== null && _c !== void 0 ? _c : {};
        case types_1.ParamType.COOKIE:
            return (_d = req.cookies) !== null && _d !== void 0 ? _d : {};
        case types_1.ParamType.PATH:
        case types_1.ParamType.PARAMS: {
            var values = Object.values((_e = req.params) !== null && _e !== void 0 ? _e : {});
            if (values.length <= 1)
                return values[0];
            return values;
        }
        default:
            return req;
    }
}
