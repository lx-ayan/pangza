"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoutePath = exports.getControllerRoutes = exports.getControllerPrefix = exports.DeleteMapping = exports.PutMapping = exports.PostMapping = exports.GetMapping = exports.CONTROLLER_TYPE = void 0;
exports.Controller = Controller;
exports.isControllerClass = isControllerClass;
exports.AuthCheckLogin = AuthCheckLogin;
exports.AuthCheckRole = AuthCheckRole;
exports.AuthCheckPermission = AuthCheckPermission;
exports.AuthIgnore = AuthIgnore;
exports.Log = Log;
exports.Flux = Flux;
exports.RequestBody = RequestBody;
exports.RequestQuery = RequestQuery;
exports.RequestPath = RequestPath;
exports.RequestHeader = RequestHeader;
exports.RequestCookie = RequestCookie;
exports.Value = Value;
require("reflect-metadata");
var config_1 = require("../config");
var metadata_1 = require("./metadata");
/** 标记该类为 Controller（供扫描识别） */
exports.CONTROLLER_TYPE = Symbol.for("pangza.controller.type");
/**
 * 类装饰器：标记 Controller，并可设置统一路径前缀。
 * 类被加载时自动注册其中的 HTTP 路由（无需必须放在 business/controller）。
 *
 * @example
 * @Controller('/api/user')
 * class UserController { ... }
 */
function Controller(prefix) {
    if (prefix === void 0) { prefix = ""; }
    return function (ctor) {
        var Ctor = ctor;
        (0, metadata_1.setControllerPrefix)(Ctor, prefix);
        Reflect.defineMetadata(exports.CONTROLLER_TYPE, true, Ctor);
        // 延迟加载，避免 decorators ↔ Application 循环依赖
        var Application = require("./index").default;
        Application.registerController(Ctor);
    };
}
function isControllerClass(ctor) {
    return !!Reflect.getMetadata(exports.CONTROLLER_TYPE, ctor);
}
function createHttpDecorator(method) {
    return function (path, option) {
        if (path === void 0) { path = ""; }
        return function (target, propertyKey) {
            var ctor = target.constructor;
            (0, metadata_1.addControllerRoute)(ctor, {
                method: method,
                path: path,
                handlerName: String(propertyKey),
                option: option,
            });
        };
    };
}
/** 方法装饰器：注册 GET 接口（对齐 Spring @GetMapping） */
exports.GetMapping = createHttpDecorator("GET");
/** 方法装饰器：注册 POST 接口（对齐 Spring @PostMapping） */
exports.PostMapping = createHttpDecorator("POST");
/** 方法装饰器：注册 PUT 接口（对齐 Spring @PutMapping） */
exports.PutMapping = createHttpDecorator("PUT");
/** 方法装饰器：注册 DELETE 接口（对齐 Spring @DeleteMapping） */
exports.DeleteMapping = createHttpDecorator("DELETE");
function AuthCheckLogin() {
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodAuth)(target.constructor, String(propertyKey), {});
    };
}
function AuthCheckRole(roles, option) {
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodAuth)(target.constructor, String(propertyKey), {
            roles: roles,
            roleMode: option === null || option === void 0 ? void 0 : option.mode,
        });
    };
}
function AuthCheckPermission(permissions, option) {
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodAuth)(target.constructor, String(propertyKey), {
            permissions: permissions,
            permissionMode: option === null || option === void 0 ? void 0 : option.mode,
        });
    };
}
function AuthIgnore() {
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodAuth)(target.constructor, String(propertyKey), {
            ignore: true,
        });
    };
}
/**
 * 操作日志装饰器（需 Application.registry(Log())）。
 * @example @Log({ title: '系统登录', business: BusinessType.LOGIN })
 */
function Log(option) {
    if (option === void 0) { option = {}; }
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodLog)(target.constructor, String(propertyKey), option);
    };
}
/**
 * 标记接口返回 SSE（Server-Sent Events）。
 * 框架自动写好 event-stream 头；可用 @RequestBody 等注入参数，未标注形参接收 res。
 *
 * @example
 * @PostMapping('/stream')
 * @Flux()
 * async stream(@RequestBody() body: any, res: Response) {
 *   res.write(`data: ${JSON.stringify(body)}\\n\\n`);
 *   res.end();
 * }
 */
function Flux() {
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodFlux)(target.constructor, String(propertyKey), true);
    };
}
/** 注入 req.body；无参数装饰器时整段仍传 request */
function RequestBody() {
    return function (target, propertyKey, parameterIndex) {
        if (propertyKey === undefined)
            return;
        (0, metadata_1.addMethodParam)(target.constructor, String(propertyKey), {
            index: parameterIndex,
            source: "body",
        });
    };
}
/** 注入 req.query */
function RequestQuery() {
    return function (target, propertyKey, parameterIndex) {
        if (propertyKey === undefined)
            return;
        (0, metadata_1.addMethodParam)(target.constructor, String(propertyKey), {
            index: parameterIndex,
            source: "query",
        });
    };
}
/**
 * 注入路径参数。
 * - `@RequestPath()`：一个路径参数时直接传值，多个时传值数组
 * - `@RequestPath(0)`：按顺序取第 n 个路径参数
 */
function RequestPath(index) {
    return function (target, propertyKey, parameterIndex) {
        if (propertyKey === undefined)
            return;
        (0, metadata_1.addMethodParam)(target.constructor, String(propertyKey), {
            index: parameterIndex,
            source: "path",
            pathIndex: index,
        });
    };
}
/** 注入请求头 req.headers */
function RequestHeader() {
    return function (target, propertyKey, parameterIndex) {
        if (propertyKey === undefined)
            return;
        (0, metadata_1.addMethodParam)(target.constructor, String(propertyKey), {
            index: parameterIndex,
            source: "header",
        });
    };
}
/** 注入 req.cookies（需自行挂 cookie 解析中间件） */
function RequestCookie() {
    return function (target, propertyKey, parameterIndex) {
        if (propertyKey === undefined)
            return;
        (0, metadata_1.addMethodParam)(target.constructor, String(propertyKey), {
            index: parameterIndex,
            source: "cookie",
        });
    };
}
/**
 * 属性注入：从合并后的 application*.yaml 按路径取值。
 * 支持 `server.port`、`${server.port}`、`${server.port:3990}`；
 * 第二参数为未配置时的默认值（优先于占位符内默认）。
 *
 * @example
 * @Value("server.port")
 * private port!: number;
 *
 * @Value("${upload.path:upload}")
 * private uploadPath!: string;
 *
 * @Value("redis.host", "127.0.0.1")
 * private redisHost!: string;
 */
function Value(expression, defaultValue) {
    return function (target, propertyKey) {
        if (!(expression === null || expression === void 0 ? void 0 : expression.trim())) {
            throw new Error("@Value \u8868\u8FBE\u5F0F\u4E0D\u80FD\u4E3A\u7A7A\uFF0C\u5C5E\u6027: ".concat(String(propertyKey)));
        }
        var _a = (0, config_1.parseValueExpression)(expression), path = _a.path, defaultText = _a.defaultText;
        if (!path) {
            throw new Error("@Value \u8DEF\u5F84\u65E0\u6548: ".concat(expression));
        }
        var fallback = defaultValue !== undefined
            ? defaultValue
            : defaultText !== undefined
                ? (0, config_1.coerceConfigScalar)(defaultText)
                : undefined;
        var key = String(propertyKey);
        Object.defineProperty(target, key, {
            get: function () {
                var own = Object.prototype.hasOwnProperty.call(this, key)
                    ? this[key]
                    : undefined;
                if (own !== undefined)
                    return own;
                return (0, config_1.getConfigValue)(path, fallback);
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
var metadata_2 = require("./metadata");
Object.defineProperty(exports, "getControllerPrefix", { enumerable: true, get: function () { return metadata_2.getControllerPrefix; } });
Object.defineProperty(exports, "getControllerRoutes", { enumerable: true, get: function () { return metadata_2.getControllerRoutes; } });
Object.defineProperty(exports, "joinRoutePath", { enumerable: true, get: function () { return metadata_2.joinRoutePath; } });
