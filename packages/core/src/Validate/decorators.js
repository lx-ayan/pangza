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
exports.NotNull = NotNull;
exports.Min = Min;
exports.Max = Max;
exports.Email = Email;
exports.Phone = Phone;
exports.Custom = Custom;
exports.getClassRules = getClassRules;
exports.Validate = Validate;
exports.isMethodValidate = isMethodValidate;
exports.getMethodParamTypes = getMethodParamTypes;
require("reflect-metadata");
var rules_1 = require("./rules");
var metadata_1 = require("../Application/metadata");
var beanKeys_1 = require("../Json/beanKeys");
var RULES_KEY = Symbol.for("pangza.validate.rules");
var METHOD_VALIDATE_KEY = Symbol.for("pangza.validate.method");
var PARAM_TYPES_KEY = Symbol.for("pangza.validate.paramTypes");
function ruleMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(RULES_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
function addRule(ctor, property, rule) {
    var _a;
    var map = __assign({}, ruleMap(ctor));
    map[property] = __spreadArray(__spreadArray([], ((_a = map[property]) !== null && _a !== void 0 ? _a : []), true), [rule], false);
    Reflect.defineMetadata(RULES_KEY, map, ctor);
    (0, beanKeys_1.addBeanKey)(ctor, property);
}
function createPropDecorator(ruleFactory) {
    return function (target, propertyKey) {
        addRule(target.constructor, String(propertyKey), ruleFactory());
    };
}
/** @NotNull() / @NotNull('用户名不能为空') / @NotNull({ message }) */
function NotNull(options) {
    return createPropDecorator(function () { return (0, rules_1.notNull)(options); });
}
/** @Min(1) / @Min(1, '太小了') */
function Min(minValue, options) {
    return createPropDecorator(function () { return (0, rules_1.min)(minValue, options); });
}
/** @Max(100) */
function Max(maxValue, options) {
    return createPropDecorator(function () { return (0, rules_1.max)(maxValue, options); });
}
/** @Email() */
function Email(options) {
    return createPropDecorator(function () { return (0, rules_1.email)(options); });
}
/** @Phone() / @Phone({ locale: 'zh-CN' }) */
function Phone(options) {
    return createPropDecorator(function () { return (0, rules_1.phone)(options); });
}
/**
 * 自定义校验函数（对齐「注解传函数定制规则」）。
 * @example @Custom((v) => typeof v === 'string' && v.length > 2, '长度至少3')
 */
function Custom(fn, options) {
    return createPropDecorator(function () { return (0, rules_1.custom)(fn, options); });
}
/** 读取类上的校验规则 */
function getClassRules(ctor) {
    return __assign({}, ruleMap(ctor));
}
/**
 * 方法装饰器：在路由执行前校验带规则的入参（依赖 emitDecoratorMetadata）。
 *
 * @example
 * @PostMapping('/create')
 * @Validate()
 * create(@RequestBody() body: CreateUserDTO) { ... }
 */
function Validate() {
    return function (target, propertyKey) {
        var _a, _b, _c;
        var ctor = target.constructor;
        var handlerName = String(propertyKey);
        var map = (_a = Reflect.getMetadata(METHOD_VALIDATE_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
        map[handlerName] = true;
        Reflect.defineMetadata(METHOD_VALIDATE_KEY, map, ctor);
        var paramTypes = (_b = Reflect.getMetadata("design:paramtypes", target, propertyKey)) !== null && _b !== void 0 ? _b : [];
        var typeMap = (_c = Reflect.getMetadata(PARAM_TYPES_KEY, ctor)) !== null && _c !== void 0 ? _c : {};
        typeMap[handlerName] = paramTypes;
        Reflect.defineMetadata(PARAM_TYPES_KEY, typeMap, ctor);
        (0, metadata_1.mergeMethodValidate)(ctor, handlerName, true, paramTypes);
    };
}
function isMethodValidate(ctor, handlerName) {
    var _a;
    var map = (_a = Reflect.getMetadata(METHOD_VALIDATE_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return !!map[handlerName];
}
function getMethodParamTypes(ctor, handlerName) {
    var _a, _b;
    var map = (_a = Reflect.getMetadata(PARAM_TYPES_KEY, ctor)) !== null && _a !== void 0 ? _a : {};
    return (_b = map[handlerName]) !== null && _b !== void 0 ? _b : [];
}
