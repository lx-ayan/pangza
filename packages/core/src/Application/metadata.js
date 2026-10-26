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
exports.getControllerPrefix = getControllerPrefix;
exports.setControllerPrefix = setControllerPrefix;
exports.getControllerRoutes = getControllerRoutes;
exports.addControllerRoute = addControllerRoute;
exports.getMethodParams = getMethodParams;
exports.addMethodParam = addMethodParam;
exports.getMethodAuth = getMethodAuth;
exports.mergeMethodAuth = mergeMethodAuth;
exports.getMethodLog = getMethodLog;
exports.mergeMethodLog = mergeMethodLog;
exports.getMethodRateLimit = getMethodRateLimit;
exports.mergeMethodRateLimit = mergeMethodRateLimit;
exports.getMethodRepeatSubmit = getMethodRepeatSubmit;
exports.mergeMethodRepeatSubmit = mergeMethodRepeatSubmit;
exports.getMethodValidate = getMethodValidate;
exports.getMethodParamTypes = getMethodParamTypes;
exports.mergeMethodValidate = mergeMethodValidate;
exports.getMethodFlux = getMethodFlux;
exports.mergeMethodFlux = mergeMethodFlux;
exports.joinRoutePath = joinRoutePath;
require("reflect-metadata");
var PREFIX_KEY = Symbol.for("pangza.controller.prefix");
var ROUTES_KEY = Symbol.for("pangza.controller.routes");
var AUTH_KEY = Symbol.for("pangza.controller.methodAuth");
var LOG_KEY = Symbol.for("pangza.controller.methodLog");
var RATE_LIMIT_KEY = Symbol.for("pangza.controller.methodRateLimit");
var REPEAT_SUBMIT_KEY = Symbol.for("pangza.controller.methodRepeatSubmit");
var PARAMS_KEY = Symbol.for("pangza.controller.methodParams");
var VALIDATE_KEY = Symbol.for("pangza.controller.methodValidate");
var PARAM_TYPES_KEY = Symbol.for("pangza.controller.methodParamTypes");
var FLUX_KEY = Symbol.for("pangza.controller.methodFlux");
/** 读取 Controller 前缀 */
function getControllerPrefix(ctor) {
    var _a;
    return (_a = Reflect.getMetadata(PREFIX_KEY, ctor)) !== null && _a !== void 0 ? _a : "";
}
/** 写入 Controller 前缀 */
function setControllerPrefix(ctor, prefix) {
    Reflect.defineMetadata(PREFIX_KEY, prefix, ctor);
}
/** 读取类上挂载的路由列表 */
function getControllerRoutes(ctor) {
    var _a;
    return (_a = Reflect.getMetadata(ROUTES_KEY, ctor)) !== null && _a !== void 0 ? _a : [];
}
/** 追加一条方法路由元数据（方法装饰器阶段调用） */
function addControllerRoute(ctor, meta) {
    var routes = getControllerRoutes(ctor);
    var auth = getMethodAuth(ctor, meta.handlerName);
    var log = getMethodLog(ctor, meta.handlerName);
    var rateLimit = getMethodRateLimit(ctor, meta.handlerName);
    var repeatSubmit = getMethodRepeatSubmit(ctor, meta.handlerName);
    var params = getMethodParams(ctor, meta.handlerName);
    var validate = getMethodValidate(ctor, meta.handlerName);
    var paramTypes = getMethodParamTypes(ctor, meta.handlerName);
    var flux = getMethodFlux(ctor, meta.handlerName);
    var option = mergeRouteOption(meta.option, {
        auth: auth,
        log: log,
        rateLimit: rateLimit,
        repeatSubmit: repeatSubmit,
        validate: validate,
        paramTypes: paramTypes,
        flux: flux,
    });
    routes.push(__assign(__assign({}, meta), { option: __assign(__assign({}, option), { params: params.length ? params : option === null || option === void 0 ? void 0 : option.params }) }));
    Reflect.defineMetadata(ROUTES_KEY, routes, ctor);
}
/** 读取方法参数注入元数据 */
function getMethodParams(ctor, handlerName) {
    var _a, _b;
    var map = (_a = Reflect.getMetadata(PARAMS_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return (_b = map[handlerName]) !== null && _b !== void 0 ? _b : [];
}
/** 写入某个形参的注入元数据（参数装饰器阶段） */
function addMethodParam(ctor, handlerName, meta) {
    var _a;
    var map = (_a = Reflect.getMetadata(PARAMS_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    var list = map[handlerName] ? __spreadArray([], map[handlerName], true) : [];
    var exist = list.findIndex(function (item) { return item.index === meta.index; });
    if (exist >= 0) {
        list[exist] = meta;
    }
    else {
        list.push(meta);
    }
    list.sort(function (a, b) { return a.index - b.index; });
    map[handlerName] = list;
    Reflect.defineMetadata(PARAMS_KEY, map, ctor);
    var routes = getControllerRoutes(ctor);
    for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
        var route = routes_1[_i];
        if (route.handlerName === handlerName) {
            route.option = __assign(__assign({}, route.option), { params: list });
        }
    }
    Reflect.defineMetadata(ROUTES_KEY, routes, ctor);
}
/** 读取方法上的鉴权元数据 */
function getMethodAuth(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(AUTH_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
/** 合并 AuthCheck* 到方法元数据，并回写已注册路由 */
function mergeMethodAuth(ctor, handlerName, patch) {
    var _a;
    var map = (_a = Reflect.getMetadata(AUTH_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    map[handlerName] = mergeAuth(map[handlerName], patch);
    Reflect.defineMetadata(AUTH_KEY, map, ctor);
    rewriteRouteOption(ctor, handlerName, { auth: map[handlerName] });
}
function getMethodLog(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(LOG_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
/** 合并 @Log 到方法元数据，并回写已注册路由 */
function mergeMethodLog(ctor, handlerName, patch) {
    var _a, _b;
    var map = (_a = Reflect.getMetadata(LOG_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    map[handlerName] = __assign(__assign({}, ((_b = map[handlerName]) !== null && _b !== void 0 ? _b : {})), patch);
    Reflect.defineMetadata(LOG_KEY, map, ctor);
    rewriteRouteOption(ctor, handlerName, { log: map[handlerName] });
}
function getMethodRateLimit(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(RATE_LIMIT_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
function mergeMethodRateLimit(ctor, handlerName, patch) {
    var _a, _b;
    var map = (_a = Reflect.getMetadata(RATE_LIMIT_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    map[handlerName] = __assign(__assign({}, ((_b = map[handlerName]) !== null && _b !== void 0 ? _b : {})), patch);
    Reflect.defineMetadata(RATE_LIMIT_KEY, map, ctor);
    rewriteRouteOption(ctor, handlerName, { rateLimit: map[handlerName] });
}
function getMethodRepeatSubmit(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(REPEAT_SUBMIT_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
function mergeMethodRepeatSubmit(ctor, handlerName, patch) {
    var _a, _b;
    var map = (_a = Reflect.getMetadata(REPEAT_SUBMIT_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    map[handlerName] = __assign(__assign({}, ((_b = map[handlerName]) !== null && _b !== void 0 ? _b : {})), patch);
    Reflect.defineMetadata(REPEAT_SUBMIT_KEY, map, ctor);
    rewriteRouteOption(ctor, handlerName, { repeatSubmit: map[handlerName] });
}
function getMethodValidate(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(VALIDATE_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
function getMethodParamTypes(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(PARAM_TYPES_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
/** 合并 @Validate 到方法元数据，并回写已注册路由 */
function mergeMethodValidate(ctor, handlerName, enabled, paramTypes) {
    var _a, _b;
    if (paramTypes === void 0) { paramTypes = []; }
    var flagMap = (_a = Reflect.getMetadata(VALIDATE_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    flagMap[handlerName] = enabled;
    Reflect.defineMetadata(VALIDATE_KEY, flagMap, ctor);
    var typeMap = (_b = Reflect.getMetadata(PARAM_TYPES_KEY, ctor)) !== null && _b !== void 0 ? _b : {};
    typeMap[handlerName] = paramTypes;
    Reflect.defineMetadata(PARAM_TYPES_KEY, typeMap, ctor);
    rewriteRouteOption(ctor, handlerName, {
        validate: enabled,
        paramTypes: paramTypes,
    });
}
function rewriteRouteOption(ctor, handlerName, patch) {
    var routes = getControllerRoutes(ctor);
    for (var _i = 0, routes_2 = routes; _i < routes_2.length; _i++) {
        var route = routes_2[_i];
        if (route.handlerName === handlerName) {
            route.option = mergeRouteOption(route.option, patch);
        }
    }
    Reflect.defineMetadata(ROUTES_KEY, routes, ctor);
}
function mergeAuth(base, patch) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        ignore: (_a = patch.ignore) !== null && _a !== void 0 ? _a : base === null || base === void 0 ? void 0 : base.ignore,
        roles: __spreadArray(__spreadArray([], ((_b = base === null || base === void 0 ? void 0 : base.roles) !== null && _b !== void 0 ? _b : []), true), ((_c = patch.roles) !== null && _c !== void 0 ? _c : []), true),
        permissions: __spreadArray(__spreadArray([], ((_d = base === null || base === void 0 ? void 0 : base.permissions) !== null && _d !== void 0 ? _d : []), true), ((_e = patch.permissions) !== null && _e !== void 0 ? _e : []), true),
        roleMode: (_f = patch.roleMode) !== null && _f !== void 0 ? _f : base === null || base === void 0 ? void 0 : base.roleMode,
        permissionMode: (_g = patch.permissionMode) !== null && _g !== void 0 ? _g : base === null || base === void 0 ? void 0 : base.permissionMode,
    };
}
function getMethodFlux(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(FLUX_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return map[handlerName];
}
/** 合并 @Flux 到方法元数据，并回写已注册路由 */
function mergeMethodFlux(ctor, handlerName, value) {
    var _a;
    if (value === void 0) { value = true; }
    var map = (_a = Reflect.getMetadata(FLUX_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    map[handlerName] = value;
    Reflect.defineMetadata(FLUX_KEY, map, ctor);
    rewriteRouteOption(ctor, handlerName, { flux: value });
}
function mergeRouteOption(option, patch) {
    var _a, _b, _c, _d;
    if (patch === void 0) { patch = {}; }
    if (!patch.auth &&
        !patch.log &&
        !patch.rateLimit &&
        !patch.repeatSubmit &&
        patch.validate === undefined &&
        !patch.paramTypes &&
        patch.flux === undefined) {
        return option;
    }
    return __assign(__assign({}, option), { auth: patch.auth
            ? mergeAuth(option === null || option === void 0 ? void 0 : option.auth, patch.auth)
            : option === null || option === void 0 ? void 0 : option.auth, log: patch.log
            ? __assign(__assign({}, ((_a = option === null || option === void 0 ? void 0 : option.log) !== null && _a !== void 0 ? _a : {})), patch.log) : option === null || option === void 0 ? void 0 : option.log, rateLimit: patch.rateLimit
            ? __assign(__assign({}, ((_b = option === null || option === void 0 ? void 0 : option.rateLimit) !== null && _b !== void 0 ? _b : {})), patch.rateLimit) : option === null || option === void 0 ? void 0 : option.rateLimit, repeatSubmit: patch.repeatSubmit
            ? __assign(__assign({}, ((_c = option === null || option === void 0 ? void 0 : option.repeatSubmit) !== null && _c !== void 0 ? _c : {})), patch.repeatSubmit) : option === null || option === void 0 ? void 0 : option.repeatSubmit, validate: patch.validate !== undefined ? patch.validate : option === null || option === void 0 ? void 0 : option.validate, paramTypes: (_d = patch.paramTypes) !== null && _d !== void 0 ? _d : option === null || option === void 0 ? void 0 : option.paramTypes, flux: patch.flux !== undefined ? patch.flux : option === null || option === void 0 ? void 0 : option.flux });
}
/** 拼接类前缀与方法路径，避免双斜杠 */
function joinRoutePath(prefix, sub) {
    var p = (prefix || "").trim().replace(/\/+$/, "");
    var s = (sub || "").trim().replace(/^\/+/, "");
    if (!p && !s)
        return "/";
    if (!p)
        return "/".concat(s);
    if (!s)
        return p.startsWith("/") ? p : "/".concat(p);
    var base = p.startsWith("/") ? p : "/".concat(p);
    return "".concat(base, "/").concat(s);
}
