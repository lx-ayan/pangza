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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = void 0;
exports.Component = Component;
exports.Resource = Resource;
exports.Mapper = Mapper;
exports.Service = Service;
require("reflect-metadata");
var inversify_1 = require("inversify");
var optional_1 = require("../optional");
var bean_1 = require("./bean");
var container_1 = require("./container");
var types_1 = require("./types");
var MAPPER_BEAN_KEY = Symbol.for("pangza.service.mapperBean");
function ormMod() {
    var mod = (0, optional_1.optionalRequire)("@pangza/orm");
    if (!mod) {
        throw new Error("[Service] 需要安装 @pangza/orm 才能使用 @Mapper / table 相关能力");
    }
    return mod;
}
function ormEntityMeta(entity) {
    var _a;
    var mod = (_a = (0, optional_1.optionalRequire)("@pangza/orm/entityDecorators")) !== null && _a !== void 0 ? _a : (0, optional_1.optionalRequire)("@pangza/orm");
    if (!(mod === null || mod === void 0 ? void 0 : mod.getEntityTableMeta)) {
        throw new Error("[Service] 需要安装 @pangza/orm 才能使用实体 @Mapper(Entity)");
    }
    return mod.getEntityTableMeta(entity);
}
function mapperEntityKey() {
    var _a, _b;
    var mod = (_a = (0, optional_1.optionalRequire)("@pangza/orm/sqlDecorators")) !== null && _a !== void 0 ? _a : (0, optional_1.optionalRequire)("@pangza/orm");
    return ((_b = mod === null || mod === void 0 ? void 0 : mod.MAPPER_ENTITY_KEY) !== null && _b !== void 0 ? _b : Symbol.for("pangza.orm.mapperEntity"));
}
/**
 * 构造器注入（Inversify `@inject`），Token 为类 / 字符串 / Symbol。
 *
 * @example
 * constructor(@Inject(UserService) private mapper: UserService) {}
 * constructor(@Inject("uploadPath") private path: string) {}
 */
exports.Inject = inversify_1.inject;
/**
 * @Component() / @Component("alias")
 * 按「类」注册到容器；可选字符串别名（仅定时任务等）。
 * 类上的 @Bean 工厂方法返回值也会注册进容器。
 *
 * @example
 * @Component()
 * class FileService {}
 *
 * @Component("sysLogCleanTask")
 * class SysLogCleanTask { execute() {} }
 */
function Component(alias) {
    return function (ctor) {
        var Ctor = ctor;
        container_1.Container.bindClass(Ctor);
        if (alias === null || alias === void 0 ? void 0 : alias.trim()) {
            container_1.Container.bindAlias(alias.trim(), Ctor);
        }
        (0, bean_1.registerBeansFromComponent)(Ctor);
    };
}
/**
 * @Resource(Type | "name" | symbol)
 * 属性懒注入：类单例，或 @Bean 注册的常量。
 *
 * @example
 * @Resource(UserService)
 * private userService!: UserService;
 *
 * @Resource("uploadPath")
 * private uploadPath!: string;
 */
function Resource(type) {
    return function (target, propertyKey) {
        if (typeof type !== "function" &&
            typeof type !== "string" &&
            typeof type !== "symbol") {
            throw new Error("@Resource \u8BF7\u4F20\u5165\u7C7B\u6216\u5B57\u7B26\u4E32 Token\uFF0C\u5C5E\u6027: ".concat(String(propertyKey)));
        }
        // 类 Token 交给 Inversify 属性注入；字符串/Symbol 仅用懒 getter
        if (typeof type === "function") {
            var applyInject = (0, inversify_1.inject)(type);
            applyInject(target, propertyKey);
        }
        var key = String(propertyKey);
        Object.defineProperty(target, key, {
            get: function () {
                var own = Object.prototype.hasOwnProperty.call(this, key)
                    ? this[key]
                    : undefined;
                if (own !== undefined)
                    return own;
                return container_1.Container.get(type);
            },
            set: function (value) {
                Object.defineProperty(this, key, {
                    value: value,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            },
            enumerable: true,
            configurable: true,
        });
    };
}
function resolveMapperBinding(tableOrEntity, idFieldOrOptions) {
    var _a;
    if (idFieldOrOptions === void 0) { idFieldOrOptions = "id"; }
    if (typeof tableOrEntity === "string") {
        return { tableName: tableOrEntity, options: idFieldOrOptions };
    }
    var meta = ormEntityMeta(tableOrEntity);
    if (!(meta === null || meta === void 0 ? void 0 : meta.tableName)) {
        throw new Error("[Mapper] \u5B9E\u4F53 ".concat(tableOrEntity.name, " \u7F3A\u5C11 @TableName"));
    }
    var base = typeof idFieldOrOptions === "string"
        ? { idField: idFieldOrOptions }
        : __assign({}, (idFieldOrOptions !== null && idFieldOrOptions !== void 0 ? idFieldOrOptions : {}));
    return {
        tableName: meta.tableName,
        options: __assign(__assign({ idField: (_a = base.idField) !== null && _a !== void 0 ? _a : meta.idColumn }, base), { entity: tableOrEntity }),
    };
}
/**
 * @Mapper(table | Entity, idField | options?)
 * 混入 BaseMapper CRUD，并按「类」绑定到容器。
 *
 * @example
 * @Mapper(UserEntity, { logicDelete: true })
 * class UserMapper {}
 */
function Mapper(tableOrEntity, idFieldOrOptions) {
    if (idFieldOrOptions === void 0) { idFieldOrOptions = "id"; }
    return function (ctor) {
        var Ctor = ctor;
        var _a = resolveMapperBinding(tableOrEntity, idFieldOrOptions), tableName = _a.tableName, options = _a.options;
        if (typeof tableOrEntity !== "string") {
            Reflect.defineMetadata(mapperEntityKey(), tableOrEntity, ctor);
        }
        var _loop_1 = function (method) {
            Ctor.prototype[method] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var mapper = ormMod().table(tableName, options);
                var fn = mapper[method];
                if (typeof fn !== "function") {
                    throw new Error("[Mapper] \u7F3A\u5C11\u65B9\u6CD5: ".concat(method));
                }
                return fn.apply(mapper, args);
            };
        };
        for (var _i = 0, MAPPER_DELEGATE_METHODS_1 = types_1.MAPPER_DELEGATE_METHODS; _i < MAPPER_DELEGATE_METHODS_1.length; _i++) {
            var method = MAPPER_DELEGATE_METHODS_1[_i];
            _loop_1(method);
        }
        container_1.Container.bindClass(Ctor);
    };
}
/**
 * @Service() / @Service(MapperClass)
 * - 无参：与 @Component() 相同，仅按类注册到容器
 * - 传入 Mapper：委托 Mapper CRUD / 自定义方法，并注册到容器
 *
 * @example
 * @Service()
 * class OrderAppService {}
 *
 * @Service(UserMapper)
 * class UserService {
 *   @Resource(UserRoleMapper)
 *   private userRoleMapper!: UserRoleMapper;
 * }
 */
function Service(MapperClass) {
    return function (ctor) {
        var Ctor = ctor;
        if (!MapperClass) {
            container_1.Container.bindClass(Ctor);
            (0, bean_1.registerBeansFromComponent)(Ctor);
            return;
        }
        Ctor[MAPPER_BEAN_KEY] = MapperClass;
        var _loop_2 = function (method) {
            Ctor.prototype[method] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var mapper = resolveMapper(this, MapperClass);
                var fn = mapper[method];
                if (typeof fn !== "function") {
                    throw new Error("[Service] Mapper \u7F3A\u5C11\u65B9\u6CD5: ".concat(method));
                }
                return fn.apply(mapper, args);
            };
        };
        for (var _i = 0, MAPPER_DELEGATE_METHODS_2 = types_1.MAPPER_DELEGATE_METHODS; _i < MAPPER_DELEGATE_METHODS_2.length; _i++) {
            var method = MAPPER_DELEGATE_METHODS_2[_i];
            _loop_2(method);
        }
        var _loop_3 = function (key) {
            if (key === "constructor")
                return "continue";
            if (types_1.MAPPER_DELEGATE_METHODS.includes(key)) {
                return "continue";
            }
            var desc = Object.getOwnPropertyDescriptor(MapperClass.prototype, key);
            if (!desc || typeof desc.value !== "function")
                return "continue";
            Ctor.prototype[key] = function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var mapper = resolveMapper(this, MapperClass);
                return (_a = mapper)[key].apply(_a, args);
            };
        };
        for (var _a = 0, _b = Object.getOwnPropertyNames(MapperClass.prototype); _a < _b.length; _a++) {
            var key = _b[_a];
            _loop_3(key);
        }
        container_1.Container.bindClass(Ctor);
    };
}
/** Service 内解析关联 Mapper：优先容器按类获取 */
function resolveMapper(serviceInstance, MapperClass) {
    var cached = serviceInstance.__mapper;
    if (cached)
        return cached;
    var mapper;
    if (container_1.Container.has(MapperClass)) {
        mapper = container_1.Container.get(MapperClass);
    }
    else {
        container_1.Container.bindClass(MapperClass);
        mapper = container_1.Container.get(MapperClass);
    }
    serviceInstance.__mapper = mapper;
    return mapper;
}
