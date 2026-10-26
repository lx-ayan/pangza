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
exports.Bean = Bean;
exports.getBeanMethods = getBeanMethods;
exports.registerBeansFromComponent = registerBeansFromComponent;
require("reflect-metadata");
var container_1 = require("./container");
var BEAN_METHODS_KEY = Symbol.for("pangza.ioc.beanMethods");
function beanList(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(BEAN_METHODS_KEY, ctor)) !== null && _a !== void 0 ? _a : []);
}
/**
 * @Bean() / @Bean(SomeClass) / @Bean("alias") / @Bean({ token, name })
 *
 * 标在 @Component 类的方法上：方法返回值注册进容器，可通过 @Resource / Container.get 获取。
 *
 * @example
 * @Component()
 * class AppBeans {
 *   @Bean(ObjectMapper)
 *   objectMapper() {
 *     return new ObjectMapper();
 *   }
 *
 *   @Bean("uploadPath")
 *   uploadPath() {
 *     return "/data/upload";
 *   }
 * }
 *
 * // 注入
 * @Resource(ObjectMapper) private mapper!: ObjectMapper;
 * @Resource("uploadPath") private path!: string;
 */
function Bean(tokenOrOptions) {
    return function (target, propertyKey, _descriptor) {
        var _a;
        var method = String(propertyKey);
        var token = method;
        var name;
        if (typeof tokenOrOptions === "string" || typeof tokenOrOptions === "symbol") {
            token = tokenOrOptions;
            if (typeof tokenOrOptions === "string")
                name = tokenOrOptions;
        }
        else if (typeof tokenOrOptions === "function") {
            token = tokenOrOptions;
        }
        else if (tokenOrOptions && typeof tokenOrOptions === "object") {
            if (tokenOrOptions.token != null)
                token = tokenOrOptions.token;
            if ((_a = tokenOrOptions.name) === null || _a === void 0 ? void 0 : _a.trim())
                name = tokenOrOptions.name.trim();
        }
        var ctor = target.constructor;
        var list = __spreadArray(__spreadArray([], beanList(ctor), true), [{ method: method, token: token, name: name }], false);
        Reflect.defineMetadata(BEAN_METHODS_KEY, list, ctor);
    };
}
function getBeanMethods(ctor) {
    return beanList(ctor);
}
/**
 * 实例化 Component 并执行全部 @Bean 工厂方法，注册返回值。
 * 由 @Component 在 bindClass 之后调用。
 */
function registerBeansFromComponent(Ctor) {
    var methods = getBeanMethods(Ctor);
    if (!methods.length)
        return;
    var instance = container_1.Container.get(Ctor);
    var _loop_1 = function (meta) {
        var fn = instance[meta.method];
        if (typeof fn !== "function") {
            throw new Error("[Bean] ".concat(Ctor.name, ".").concat(meta.method, " \u4E0D\u662F\u53EF\u8C03\u7528\u7684\u5DE5\u5382\u65B9\u6CD5"));
        }
        var produced = fn.call(instance);
        var bindValue = function (value) {
            container_1.Container.bindConstant(meta.token, value);
            if (meta.name && meta.name !== meta.token) {
                container_1.Container.bindConstant(meta.name, value);
            }
            if (typeof meta.token !== "string" &&
                meta.method &&
                !container_1.Container.has(meta.method)) {
                container_1.Container.bindConstant(meta.method, value);
            }
        };
        if (produced != null && typeof produced.then === "function") {
            void produced.then(bindValue, function (err) {
                var msg = err instanceof Error ? err.message : String(err);
                console.error("[Bean] ".concat(Ctor.name, ".").concat(meta.method, " \u6CE8\u518C\u5931\u8D25: ").concat(msg));
            });
        }
        else {
            bindValue(produced);
        }
    };
    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
        var meta = methods_1[_i];
        _loop_1(meta);
    }
}
