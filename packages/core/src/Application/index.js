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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.ValidationError = exports.validateHandler = exports.Custom = exports.Phone = exports.Email = exports.Max = exports.Min = exports.NotNull = exports.Validate = exports.registerHandler = exports.BizException = exports.ExceptionHandler = exports.ControllerAdvice = exports.pick = exports.copyProperties = exports.convert = exports.ObjectMapper = exports.JsonProperty = exports.JsonIncludeType = exports.JsonInclude = exports.JsonFormat = exports.configureLogger = exports.logger = exports.getLogger = exports.Value = exports.RequestCookie = exports.RequestHeader = exports.RequestPath = exports.RequestQuery = exports.RequestBody = exports.Flux = exports.Log = exports.AuthIgnore = exports.AuthCheckPermission = exports.AuthCheckRole = exports.AuthCheckLogin = exports.DeleteMapping = exports.PutMapping = exports.PostMapping = exports.GetMapping = exports.Controller = exports.isApplicationDestroy = exports.isApplicationInit = exports.hookProcessDestroy = exports.runApplicationDestroys = exports.runApplicationInits = exports.ParamType = exports.Application = void 0;
exports.applicationStart = applicationStart;
var express_1 = require("express");
var fs_1 = require("fs");
var path_1 = require("path");
var config_1 = require("../config");
var ResponseData_1 = require("../utils/entity/ResponseData");
var moduleFlags_1 = require("../moduleFlags");
var optional_1 = require("../optional");
var Logger_1 = require("../Logger");
var Json_1 = require("../Json");
var Exception_1 = require("../Exception");
var Validate_1 = require("../Validate");
var metadata_1 = require("./metadata");
var types_1 = require("./types");
Object.defineProperty(exports, "ParamType", { enumerable: true, get: function () { return types_1.ParamType; } });
var callbackArgs_1 = require("./callbackArgs");
var lifecycle_1 = require("./lifecycle");
var processGuards_1 = require("./processGuards");
var warmup_1 = require("./warmup");
var interceptors_1 = require("./interceptors");
/** 可选分包：未安装时鉴权/审计/限流/ORM 相关能力降级跳过 */
function authMod() {
    return (0, optional_1.optionalRequire)('@pangza/auth');
}
function logMod() {
    return (0, optional_1.optionalRequire)('@pangza/log');
}
function redisMod() {
    return (0, optional_1.optionalRequire)('@pangza/redis');
}
function ormMod() {
    return (0, optional_1.optionalRequire)('@pangza/orm');
}
var log = (0, Logger_1.getLogger)('Application');
var __isStart = false;
var app = (0, express_1.default)();
// 与 server.trustProxy 对齐：false 时 req.ip 为直连地址，防伪造 X-Forwarded-For
app.set('trust proxy', config_1.trustProxy);
var router = (0, express_1.Router)();
function applicationStart() {
    return app.listen(config_1.PORT, function () {
        log.info("Server is running on port ".concat(config_1.PORT));
        (0, lifecycle_1.hookProcessDestroy)();
        // 端口已起来：并行预热连接 + ApplicationInit（均不阻塞 listen）
        void (0, warmup_1.warmupConnections)().catch(function (err) {
            log.warn({ err: err }, '连接预热异常');
        });
        void (0, lifecycle_1.runApplicationInits)().catch(function (err) {
            log.error({ err: err }, 'ApplicationInit 阶段失败');
        });
    });
}
var originalListen = app.listen.bind(app);
app.listen = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (__isStart) {
        throw new Error('Application already started');
    }
    __isStart = true;
    return originalListen.apply(void 0, args);
};
/** 判断中间件是否为 Auth 模块 */
function isAuthMiddleware(param) {
    return typeof param === 'function' && !!param[moduleFlags_1.AUTH_MIDDLEWARE_FLAG];
}
/** 判断中间件是否为 Log 模块 */
function isLogMiddleware(param) {
    return typeof param === 'function' && !!param[moduleFlags_1.LOG_MIDDLEWARE_FLAG];
}
function isRedisModule(param) {
    return typeof param === 'function' && !!param[moduleFlags_1.REDIS_MODULE_FLAG];
}
function isOrmModule(param) {
    return typeof param === 'function' && !!param[moduleFlags_1.ORM_MODULE_FLAG];
}
function resolveLogStatus(error) {
    var _a, _b, _c, _d, _e;
    if (!error)
        return '200';
    if (error instanceof Validate_1.ValidationError) {
        return String((_a = error.code) !== null && _a !== void 0 ? _a : 500);
    }
    var AuthError = (_b = authMod()) === null || _b === void 0 ? void 0 : _b.AuthError;
    var OrmError = (_c = ormMod()) === null || _c === void 0 ? void 0 : _c.OrmError;
    var GuardError = (_d = redisMod()) === null || _d === void 0 ? void 0 : _d.GuardError;
    for (var _i = 0, _f = [AuthError, OrmError, GuardError]; _i < _f.length; _i++) {
        var Ctor = _f[_i];
        if (Ctor && error instanceof Ctor) {
            return String((_e = error.code) !== null && _e !== void 0 ? _e : 500);
        }
    }
    return '500';
}
var Application = /** @class */ (function () {
    function Application() {
    }
    Application.getApp = function () {
        return app;
    };
    /** 是否已注册 Auth 模块 */
    Application.hasAuth = function () {
        return this.authRegistered;
    };
    /** 是否已注册 Log 模块 */
    Application.hasLog = function () {
        var _a;
        var log = logMod();
        return this.logRegistered || !!((_a = log === null || log === void 0 ? void 0 : log.isLogRegistered) === null || _a === void 0 ? void 0 : _a.call(log));
    };
    /** 是否已启用 Redis（预热 / 连接校验） */
    Application.hasRedis = function () {
        return this.redisRegistered || (0, moduleFlags_1.isRedisEnabled)();
    };
    /** 是否已启用 ORM（预热 / 连接校验） */
    Application.hasOrm = function () {
        return this.ormRegistered || (0, moduleFlags_1.isOrmEnabled)();
    };
    /**
     * 请求前拦截器（鉴权/限流之后、Controller 之前）。
     * @example
     * Application.addRequestInterceptor(async ({ req }) => {
     *   console.log(req.method, req.path);
     * });
     */
    Application.addRequestInterceptor = function (fn) {
        (0, interceptors_1.addRequestInterceptor)(fn);
        return this;
    };
    /**
     * 响应前拦截器（Controller 之后、写出之前）。
     * 设 `ctx.wrap = false` 可跳过 ResponseData；或自行 `res.json` 后设 `ctx.handled = true`。
     *
     * @example
     * Application.addResponseInterceptor(async (ctx) => {
     *   ctx.wrap = false;
     *   return { code: 0, result: ctx.data };
     * });
     */
    Application.addResponseInterceptor = function (fn) {
        (0, interceptors_1.addResponseInterceptor)(fn);
        return this;
    };
    /** 清空全部请求/响应拦截器 */
    Application.clearInterceptors = function () {
        (0, interceptors_1.clearInterceptors)();
        return this;
    };
    /**
     * 追加模块扫描目录（可多次调用）。
     * 目录内带 @Controller 的类会被自动注册进路由。
     *
     * @example
     * Application
     *   .scan('src/business')
     *   .scan('src/modules', 'src/plugins')
     *   .registry(...).start();
     */
    Application.scan = function () {
        var dirs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            dirs[_i] = arguments[_i];
        }
        for (var _a = 0, _b = dirs.flat(); _a < _b.length; _a++) {
            var item = _b[_a];
            var abs = path_1.default.isAbsolute(item)
                ? path_1.default.normalize(item)
                : path_1.default.normalize(path_1.default.resolve(process.cwd(), item));
            if (!this.scanRoots.includes(abs)) {
                this.scanRoots.push(abs);
            }
        }
        return this;
    };
    /**
     * 挂载静态资源。
     *
     * @example
     * // URL 与磁盘目录同名（相对 cwd）
     * Application.static("public")
     * Application.static(["public", "assets"])
     *
     * // 指定 URL 前缀 → 磁盘目录
     * Application.static("/files", "upload")
     * Application.static({ "/files": "upload", "/static": "public" })
     *
     * // 也可用 yaml：upload.path + upload.urlPrefix，再
     * // app.use(UPLOAD_URL_PREFIX, express.static(UPLOAD_PATH))
     */
    Application.static = function (urlOrMap, rootDir) {
        var mount = function (url, dir) {
            var abs = path_1.default.isAbsolute(dir)
                ? path_1.default.normalize(dir)
                : path_1.default.resolve(process.cwd(), dir);
            app.use(url, express_1.default.static(abs));
        };
        if (urlOrMap &&
            typeof urlOrMap === "object" &&
            !Array.isArray(urlOrMap)) {
            for (var _i = 0, _a = Object.entries(urlOrMap); _i < _a.length; _i++) {
                var _b = _a[_i], url = _b[0], dir = _b[1];
                mount(url, dir);
            }
            return this;
        }
        if (typeof urlOrMap === "string" && rootDir !== undefined) {
            mount(urlOrMap, rootDir);
            return this;
        }
        if (Array.isArray(urlOrMap)) {
            for (var _c = 0, urlOrMap_1 = urlOrMap; _c < urlOrMap_1.length; _c++) {
                var item = urlOrMap_1[_c];
                mount(item, item);
            }
            return this;
        }
        if (typeof urlOrMap === "string") {
            mount(urlOrMap, urlOrMap);
        }
        return this;
    };
    /** 当前扫描根目录（只读） */
    Application.getScanRoots = function () {
        return __spreadArray([], this.scanRoots, true);
    };
    /**
     * 启动服务：
     * 自动 loadControllers → routes → listen
     * 使用者通常只需 registry(...).start()
     */
    Application.start = function () {
        (0, processGuards_1.installProcessErrorGuards)();
        if (!this.controllersLoaded) {
            this.loadControllers();
        }
        this.routes();
        applicationStart();
        return this;
    };
    Application.registry = function (param) {
        var _a, _b;
        var list = Array.isArray(param) ? param : [param];
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            if (isAuthMiddleware(item)) {
                this.authRegistered = true;
                // Auth 显式绑定了 redis 实现时，视为启用 Redis
                var getAuthOptions = (_a = authMod()) === null || _a === void 0 ? void 0 : _a.getAuthOptions;
                if ((_b = getAuthOptions === null || getAuthOptions === void 0 ? void 0 : getAuthOptions()) === null || _b === void 0 ? void 0 : _b.redis) {
                    this.redisRegistered = true;
                    (0, moduleFlags_1.markRedisEnabled)(true);
                }
            }
            if (isLogMiddleware(item)) {
                this.logRegistered = true;
            }
            if (isRedisModule(item)) {
                this.redisRegistered = true;
                (0, moduleFlags_1.markRedisEnabled)(true);
            }
            if (isOrmModule(item)) {
                this.ormRegistered = true;
                (0, moduleFlags_1.markOrmEnabled)(true);
            }
        }
        Array.isArray(param) ? app.use.apply(app, param) : app.use(param);
        return this;
    };
    /** 路由统一挂一次，放在所有中间件之后 */
    Application.routes = function () {
        if (!this.routerMounted) {
            app.use(router);
            this.routerMounted = true;
        }
        return this;
    };
    /**
     * 注册装饰器 Controller：读取元数据并挂到现有 GET/POST/...
     * 同一类只会注册一次（@Controller 触发 + 扫描 require 安全）。
     */
    Application.registerController = function (Ctor) {
        if (this.registeredControllers.has(Ctor)) {
            return this;
        }
        this.registeredControllers.add(Ctor);
        var prefix = (0, metadata_1.getControllerPrefix)(Ctor);
        var routes = (0, metadata_1.getControllerRoutes)(Ctor);
        // 经 IoC 创建，便于 @Resource(Class) / @Inject(Class) 统一走容器
        var Container = require("../Service").Container;
        Container.bindClass(Ctor);
        var instance = Container.get(Ctor);
        for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
            var route = routes_1[_i];
            var fullPath = (0, metadata_1.joinRoutePath)(prefix, route.path);
            var method = instance[route.handlerName];
            if (typeof method !== 'function') {
                throw new Error("[Application] ".concat(Ctor.name, ".").concat(route.handlerName, " \u4E0D\u662F\u51FD\u6570"));
            }
            var handler = method.bind(instance);
            var option = __assign(__assign({}, route.option), { 
                // 透传控制器/方法名，便于操作日志与限流 key
                __controllerName: Ctor.name, __handlerName: route.handlerName });
            switch (route.method) {
                case 'GET':
                    this.GET(fullPath, handler, option);
                    break;
                case 'POST':
                    this.POST(fullPath, handler, option);
                    break;
                case 'PUT':
                    this.PUT(fullPath, handler, option);
                    break;
                case 'DELETE':
                    this.DELETE(fullPath, handler, option);
                    break;
            }
        }
        return this;
    };
    /**
     * 扫描并加载模块文件。
     * - 未 scan 时默认：src/business
     * - 可 Application.scan('src/modules') 自定义多个根目录
     * - 优先按 entity → mapper → service → controller → advice 顺序加载，
     *   再递归加载根下其余文件（兼容自定义目录结构）。
     * - 凡被 @Controller 标记的类，加载时自动注入路由。
     *
     * @param dir 仅加载该目录（绝对或相对 cwd）
     */
    Application.loadControllers = function (dir) {
        if (this.controllersLoaded && !dir) {
            return this;
        }
        if (dir) {
            var abs = path_1.default.isAbsolute(dir)
                ? path_1.default.normalize(dir)
                : path_1.default.normalize(path_1.default.resolve(process.cwd(), dir));
            this.loadScanRoot(abs);
            return this;
        }
        var roots = this.scanRoots.length > 0
            ? __spreadArray([], this.scanRoots, true) : [path_1.default.resolve(__dirname, "../../business")];
        for (var _i = 0, roots_1 = roots; _i < roots_1.length; _i++) {
            var root = roots_1[_i];
            this.loadScanRoot(root);
        }
        this.controllersLoaded = true;
        return this;
    };
    /** 加载单个扫描根：分层目录优先，再兜底全量递归（跳过已加载的 phase 目录） */
    Application.loadScanRoot = function (root) {
        if (!fs_1.default.existsSync(root)) {
            log.warn("\u626B\u63CF\u76EE\u5F55\u4E0D\u5B58\u5728: ".concat(root));
            return;
        }
        // IOC / 依赖友好顺序（存在才加载）
        var phases = [
            "entity",
            "mapper",
            "service",
            "controller",
            "controllers",
            "advice",
            "modules",
        ];
        var loadedPhaseDirs = new Set();
        for (var _i = 0, phases_1 = phases; _i < phases_1.length; _i++) {
            var phase = phases_1[_i];
            var dir = path_1.default.join(root, phase);
            if (fs_1.default.existsSync(dir) && fs_1.default.statSync(dir).isDirectory()) {
                var norm = path_1.default.normalize(dir);
                loadedPhaseDirs.add(norm);
                this.loadModuleFiles(dir);
            }
        }
        // 兜底：根下其余文件（跳过已扫过的 phase，避免重复 readdir）
        this.loadModuleFiles(root, loadedPhaseDirs);
    };
    Application.loadModuleFiles = function (dir, skipDirs) {
        if (skipDirs === void 0) { skipDirs = new Set(); }
        if (!fs_1.default.existsSync(dir)) {
            return;
        }
        // 无 ts-node/tsx 等 hook 时，require(.ts) 会 SyntaxError；只加载可执行的 JS
        var canRequireTs = Boolean(require.extensions && require.extensions[".ts"]);
        var entryFile = require.main && require.main.filename
            ? path_1.default.normalize(require.main.filename)
            : "";
        for (var _i = 0, _a = fs_1.default.readdirSync(dir, { withFileTypes: true }); _i < _a.length; _i++) {
            var entry = _a[_i];
            var full = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (skipDirs.has(path_1.default.normalize(full))) {
                    continue;
                }
                this.loadModuleFiles(full, skipDirs);
                continue;
            }
            // 跳过类型声明与 source map
            if (!/\.(ts|js|mts|cts|cjs|mjs)$/.test(entry.name) ||
                entry.name.endsWith(".d.ts") ||
                entry.name.endsWith(".map")) {
                continue;
            }
            // 打包运行时不要 require 源码；同名优先 .js（避免 src 与产物混扫）
            if (/\.(ts|mts|cts)$/.test(entry.name)) {
                if (!canRequireTs) {
                    continue;
                }
                var jsSibling = full.replace(/\.(mts|cts|ts)$/, ".js");
                if (fs_1.default.existsSync(jsSibling)) {
                    continue;
                }
            }
            var resolved = path_1.default.normalize(full);
            // 跳过入口自身，避免 scan(dist) 时二次执行 main 导致 Application already started
            if (entryFile && resolved === entryFile) {
                continue;
            }
            if (this.loadedFiles.has(resolved)) {
                continue;
            }
            this.loadedFiles.add(resolved);
            try {
                require(resolved);
            }
            catch (err) {
                // 单个业务模块加载失败：打日志并继续，避免整站起不来
                log.error({ err: err, file: resolved }, '加载模块失败，已跳过');
            }
        }
    };
    /**
     * 路由鉴权优先级：
     * 1. 未注册 Auth → 直接放行（最高）
     * 2. Auth 全局 ignore → 放行
     * 3. 接口 option.auth.ignore → 放行
     * 4. 校验登录
     * 5. 角色 / 权限按 mode 校验（默认 OR，可在装饰器或 Auth.checkMode 覆盖）
     *    - 只配一类：按该类的 mode
     *    - 两类都是 OR：角色或权限命中任一即过
     *    - 其它：两类都要通过（各类内部仍按自己的 mode）
     */
    Application.applyRouteAuth = function () {
        return __awaiter(this, arguments, void 0, function (option, req) {
            var auth, AuthUtil, getAuthOptions, isGloballyIgnored, roles, permissions, fallback, roleMode, permissionMode, roleHit, permissionHit, bothOr;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            if (option === void 0) { option = {}; }
            return __generator(this, function (_q) {
                switch (_q.label) {
                    case 0:
                        if (!this.hasAuth()) {
                            return [2 /*return*/];
                        }
                        auth = authMod();
                        if (!auth)
                            return [2 /*return*/];
                        AuthUtil = auth.AuthUtil, getAuthOptions = auth.getAuthOptions, isGloballyIgnored = auth.isGloballyIgnored;
                        if (isGloballyIgnored === null || isGloballyIgnored === void 0 ? void 0 : isGloballyIgnored(req.path)) {
                            return [2 /*return*/];
                        }
                        if ((_a = option.auth) === null || _a === void 0 ? void 0 : _a.ignore) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, AuthUtil.checkLogin()];
                    case 1:
                        _q.sent();
                        roles = (_c = (_b = option.auth) === null || _b === void 0 ? void 0 : _b.roles) !== null && _c !== void 0 ? _c : [];
                        permissions = (_e = (_d = option.auth) === null || _d === void 0 ? void 0 : _d.permissions) !== null && _e !== void 0 ? _e : [];
                        if (roles.length === 0 && permissions.length === 0) {
                            return [2 /*return*/];
                        }
                        fallback = (_g = (_f = getAuthOptions === null || getAuthOptions === void 0 ? void 0 : getAuthOptions()) === null || _f === void 0 ? void 0 : _f.checkMode) !== null && _g !== void 0 ? _g : "OR";
                        roleMode = (_j = (_h = option.auth) === null || _h === void 0 ? void 0 : _h.roleMode) !== null && _j !== void 0 ? _j : fallback;
                        permissionMode = (_l = (_k = option.auth) === null || _k === void 0 ? void 0 : _k.permissionMode) !== null && _l !== void 0 ? _l : fallback;
                        return [4 /*yield*/, this.matchAuthList(roles, roleMode, function (item) { return AuthUtil.hasRole(item); })];
                    case 2:
                        roleHit = _q.sent();
                        return [4 /*yield*/, this.matchAuthList(permissions, permissionMode, function (item) { return AuthUtil.hasPermission(item); })];
                    case 3:
                        permissionHit = _q.sent();
                        bothOr = roles.length > 0 &&
                            permissions.length > 0 &&
                            roleMode === "OR" &&
                            permissionMode === "OR";
                        if (!bothOr) return [3 /*break*/, 5];
                        if (roleHit.ok || permissionHit.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, AuthUtil.checkRole((_m = roleHit.missing) !== null && _m !== void 0 ? _m : roles[0])];
                    case 4:
                        _q.sent();
                        return [2 /*return*/];
                    case 5:
                        if (!(roles.length > 0 && !roleHit.ok)) return [3 /*break*/, 7];
                        return [4 /*yield*/, AuthUtil.checkRole((_o = roleHit.missing) !== null && _o !== void 0 ? _o : roles[0])];
                    case 6:
                        _q.sent();
                        _q.label = 7;
                    case 7:
                        if (!(permissions.length > 0 && !permissionHit.ok)) return [3 /*break*/, 9];
                        return [4 /*yield*/, AuthUtil.checkPermission((_p = permissionHit.missing) !== null && _p !== void 0 ? _p : permissions[0])];
                    case 8:
                        _q.sent();
                        _q.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /** 空列表视为未配置（ok=true 且 empty）。OR 命中任一；AND 必须全部命中。 */
    Application.matchAuthList = function (list, mode, has) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, list_2, item, _a, list_3, item;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (list.length === 0)
                            return [2 /*return*/, { ok: true }];
                        if (!(mode === "AND")) return [3 /*break*/, 5];
                        _i = 0, list_2 = list;
                        _b.label = 1;
                    case 1:
                        if (!(_i < list_2.length)) return [3 /*break*/, 4];
                        item = list_2[_i];
                        return [4 /*yield*/, has(item)];
                    case 2:
                        if (!(_b.sent()))
                            return [2 /*return*/, { ok: false, missing: item }];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, { ok: true }];
                    case 5:
                        _a = 0, list_3 = list;
                        _b.label = 6;
                    case 6:
                        if (!(_a < list_3.length)) return [3 /*break*/, 9];
                        item = list_3[_a];
                        return [4 /*yield*/, has(item)];
                    case 7:
                        if (_b.sent())
                            return [2 /*return*/, { ok: true }];
                        _b.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, { ok: false, missing: list[0] }];
                }
            });
        });
    };
    /**
     * 路由响应发送后异步写操作日志：
     * - 不 await，不阻塞主业务与 HTTP 响应
     * - setImmediate 再丢到下一事件循环，进一步与请求链路解耦
     * - 写入失败只打日志，不影响已返回的业务结果
     */
    Application.scheduleOperationLog = function (req, option, payload) {
        var _a, _b;
        if (!(option === null || option === void 0 ? void 0 : option.log) || !this.hasLog())
            return;
        var log = logMod();
        if (!(log === null || log === void 0 ? void 0 : log.recordOperationLog))
            return;
        var meta = option;
        var logOption = option.log;
        // 必须在请求结束前同步取 IP：setImmediate 后 socket 可能已释放
        var clientIp = (_b = (_a = log.getClientIp) === null || _a === void 0 ? void 0 : _a.call(log, req)) !== null && _b !== void 0 ? _b : "";
        var userAgent = String(req.headers["user-agent"] || "");
        var ctx = {
            req: req,
            option: logOption,
            result: payload.result,
            error: payload.error,
            statusCode: resolveLogStatus(payload.error),
            startTime: payload.startTime,
            controllerName: meta.__controllerName,
            clientIp: clientIp,
            userAgent: userAgent,
        };
        setImmediate(function () {
            void log.recordOperationLog(ctx);
        });
    };
    /** 限流 + 防重复提交（在鉴权之后、业务之前） */
    Application.applyRouteGuards = function (option, req) {
        return __awaiter(this, void 0, void 0, function () {
            var redis, meta;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        redis = redisMod();
                        if (!redis)
                            return [2 /*return*/];
                        meta = option;
                        return [4 /*yield*/, ((_a = redis.applyRateLimit) === null || _a === void 0 ? void 0 : _a.call(redis, option === null || option === void 0 ? void 0 : option.rateLimit, req, {
                                controllerName: meta === null || meta === void 0 ? void 0 : meta.__controllerName,
                                handlerName: meta === null || meta === void 0 ? void 0 : meta.__handlerName,
                            }))];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, ((_b = redis.applyRepeatSubmit) === null || _b === void 0 ? void 0 : _b.call(redis, option === null || option === void 0 ? void 0 : option.repeatSubmit, req))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** SSE 默认头：Content-Type / 禁缓存 / 长连接 / 关 nginx 缓冲 */
    Application.prepareFluxResponse = function (req, response) {
        var _a, _b, _c, _d;
        response.status(200);
        response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("Connection", "keep-alive");
        response.setHeader("X-Accel-Buffering", "no");
        if (typeof response.flushHeaders === "function") {
            response.flushHeaders();
        }
        (_b = (_a = req.socket) === null || _a === void 0 ? void 0 : _a.setTimeout) === null || _b === void 0 ? void 0 : _b.call(_a, 0);
        (_d = (_c = req.socket) === null || _c === void 0 ? void 0 : _c.setNoDelay) === null || _d === void 0 ? void 0 : _d.call(_c, true);
    };
    Application.mountRoute = function (method, path, callback, option) {
        var _this = this;
        router[method](path, function (req, response) { return __awaiter(_this, void 0, void 0, function () {
            var startTime, result, error, reqCtx, args, args, serialized, resCtx, e_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 16, 18, 19]);
                        return [4 /*yield*/, this.applyRouteAuth(option, req)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.applyRouteGuards(option, req)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, interceptors_1.runRequestInterceptors)(req, response, option)];
                    case 4:
                        reqCtx = _c.sent();
                        if (response.headersSent) {
                            return [2 /*return*/];
                        }
                        if (!((option === null || option === void 0 ? void 0 : option.flux) || (option === null || option === void 0 ? void 0 : option.raw))) return [3 /*break*/, 8];
                        if (reqCtx.skipHandler) {
                            return [2 /*return*/];
                        }
                        if (option === null || option === void 0 ? void 0 : option.flux) {
                            this.prepareFluxResponse(req, response);
                        }
                        args = (0, callbackArgs_1.resolveRawCallbackArgs)(req, response, option, callback.length);
                        if (!(option === null || option === void 0 ? void 0 : option.validate)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, Validate_1.validateMethodArgs)(args, (_a = option.paramTypes) !== null && _a !== void 0 ? _a : [])];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [4 /*yield*/, callback.apply(void 0, args)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 15];
                    case 8:
                        if (!!reqCtx.skipHandler) return [3 /*break*/, 12];
                        args = (0, callbackArgs_1.resolveCallbackArgs)(req, option, callback.length);
                        if (!(option === null || option === void 0 ? void 0 : option.validate)) return [3 /*break*/, 10];
                        return [4 /*yield*/, (0, Validate_1.validateMethodArgs)(args, (_b = option.paramTypes) !== null && _b !== void 0 ? _b : [])];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [4 /*yield*/, callback.apply(void 0, args)];
                    case 11:
                        result = _c.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        result = reqCtx.data;
                        _c.label = 13;
                    case 13:
                        serialized = Json_1.ObjectMapper.writeValue(result);
                        return [4 /*yield*/, (0, interceptors_1.runResponseInterceptors)({
                                req: req,
                                res: response,
                                option: option,
                                data: serialized,
                            })];
                    case 14:
                        resCtx = _c.sent();
                        if (resCtx.handled || response.headersSent) {
                            result = resCtx.data;
                            return [2 /*return*/];
                        }
                        result = resCtx.data;
                        if (resCtx.wrap) {
                            response.send(ResponseData_1.default.success(resCtx.data));
                        }
                        else {
                            response.send(resCtx.data);
                        }
                        _c.label = 15;
                    case 15: return [3 /*break*/, 19];
                    case 16:
                        e_1 = _c.sent();
                        error = e_1;
                        return [4 /*yield*/, (0, Exception_1.handleException)(req, response, e_1)];
                    case 17:
                        _c.sent();
                        return [3 /*break*/, 19];
                    case 18:
                        this.scheduleOperationLog(req, option, {
                            result: error ? undefined : result,
                            error: error,
                            startTime: startTime,
                        });
                        return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        }); });
        return this;
    };
    Application.GET = function (path, callback, option) {
        return this.mountRoute('get', path, callback, option);
    };
    Application.POST = function (path, callback, option) {
        return this.mountRoute('post', path, callback, option);
    };
    Application.PUT = function (path, callback, option) {
        return this.mountRoute('put', path, callback, option);
    };
    Application.DELETE = function (path, callback, option) {
        return this.mountRoute('delete', path, callback, option);
    };
    Application.routerMounted = false;
    Application.controllersLoaded = false;
    /** 是否已通过 registry 注册 Auth 中间件 */
    Application.authRegistered = false;
    /** 是否已通过 registry 注册 Log 中间件 */
    Application.logRegistered = false;
    /** 是否已 registry EnableRedis（或 Auth 绑定了 redis） */
    Application.redisRegistered = false;
    /** 是否已 registry EnableOrm */
    Application.ormRegistered = false;
    /** 已注册过的 Controller，防止重复挂路由 */
    Application.registeredControllers = new WeakSet();
    /** 已 require 过的模块文件 */
    Application.loadedFiles = new Set();
    /**
     * 自定义扫描根目录（绝对路径）。
     * 未调用 scan() 时默认扫描 src/business。
     */
    Application.scanRoots = [];
    return Application;
}());
exports.Application = Application;
exports.default = Application;
var lifecycle_2 = require("./lifecycle");
Object.defineProperty(exports, "runApplicationInits", { enumerable: true, get: function () { return lifecycle_2.runApplicationInits; } });
Object.defineProperty(exports, "runApplicationDestroys", { enumerable: true, get: function () { return lifecycle_2.runApplicationDestroys; } });
Object.defineProperty(exports, "hookProcessDestroy", { enumerable: true, get: function () { return lifecycle_2.hookProcessDestroy; } });
Object.defineProperty(exports, "isApplicationInit", { enumerable: true, get: function () { return lifecycle_2.isApplicationInit; } });
Object.defineProperty(exports, "isApplicationDestroy", { enumerable: true, get: function () { return lifecycle_2.isApplicationDestroy; } });
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return decorators_1.Controller; } });
Object.defineProperty(exports, "GetMapping", { enumerable: true, get: function () { return decorators_1.GetMapping; } });
Object.defineProperty(exports, "PostMapping", { enumerable: true, get: function () { return decorators_1.PostMapping; } });
Object.defineProperty(exports, "PutMapping", { enumerable: true, get: function () { return decorators_1.PutMapping; } });
Object.defineProperty(exports, "DeleteMapping", { enumerable: true, get: function () { return decorators_1.DeleteMapping; } });
Object.defineProperty(exports, "AuthCheckLogin", { enumerable: true, get: function () { return decorators_1.AuthCheckLogin; } });
Object.defineProperty(exports, "AuthCheckRole", { enumerable: true, get: function () { return decorators_1.AuthCheckRole; } });
Object.defineProperty(exports, "AuthCheckPermission", { enumerable: true, get: function () { return decorators_1.AuthCheckPermission; } });
Object.defineProperty(exports, "AuthIgnore", { enumerable: true, get: function () { return decorators_1.AuthIgnore; } });
Object.defineProperty(exports, "Log", { enumerable: true, get: function () { return decorators_1.Log; } });
Object.defineProperty(exports, "Flux", { enumerable: true, get: function () { return decorators_1.Flux; } });
Object.defineProperty(exports, "RequestBody", { enumerable: true, get: function () { return decorators_1.RequestBody; } });
Object.defineProperty(exports, "RequestQuery", { enumerable: true, get: function () { return decorators_1.RequestQuery; } });
Object.defineProperty(exports, "RequestPath", { enumerable: true, get: function () { return decorators_1.RequestPath; } });
Object.defineProperty(exports, "RequestHeader", { enumerable: true, get: function () { return decorators_1.RequestHeader; } });
Object.defineProperty(exports, "RequestCookie", { enumerable: true, get: function () { return decorators_1.RequestCookie; } });
Object.defineProperty(exports, "Value", { enumerable: true, get: function () { return decorators_1.Value; } });
var Logger_2 = require("../Logger");
Object.defineProperty(exports, "getLogger", { enumerable: true, get: function () { return Logger_2.getLogger; } });
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return Logger_2.logger; } });
Object.defineProperty(exports, "configureLogger", { enumerable: true, get: function () { return Logger_2.configureLogger; } });
var Json_2 = require("../Json");
Object.defineProperty(exports, "JsonFormat", { enumerable: true, get: function () { return Json_2.JsonFormat; } });
Object.defineProperty(exports, "JsonInclude", { enumerable: true, get: function () { return Json_2.JsonInclude; } });
Object.defineProperty(exports, "JsonIncludeType", { enumerable: true, get: function () { return Json_2.JsonIncludeType; } });
Object.defineProperty(exports, "JsonProperty", { enumerable: true, get: function () { return Json_2.JsonProperty; } });
Object.defineProperty(exports, "ObjectMapper", { enumerable: true, get: function () { return Json_2.ObjectMapper; } });
Object.defineProperty(exports, "convert", { enumerable: true, get: function () { return Json_2.convert; } });
Object.defineProperty(exports, "copyProperties", { enumerable: true, get: function () { return Json_2.copyProperties; } });
Object.defineProperty(exports, "pick", { enumerable: true, get: function () { return Json_2.pick; } });
var Exception_2 = require("../Exception");
Object.defineProperty(exports, "ControllerAdvice", { enumerable: true, get: function () { return Exception_2.ControllerAdvice; } });
Object.defineProperty(exports, "ExceptionHandler", { enumerable: true, get: function () { return Exception_2.ExceptionHandler; } });
Object.defineProperty(exports, "BizException", { enumerable: true, get: function () { return Exception_2.BizException; } });
Object.defineProperty(exports, "registerHandler", { enumerable: true, get: function () { return Exception_2.registerHandler; } });
var Validate_2 = require("../Validate");
Object.defineProperty(exports, "Validate", { enumerable: true, get: function () { return Validate_2.Validate; } });
Object.defineProperty(exports, "NotNull", { enumerable: true, get: function () { return Validate_2.NotNull; } });
Object.defineProperty(exports, "Min", { enumerable: true, get: function () { return Validate_2.Min; } });
Object.defineProperty(exports, "Max", { enumerable: true, get: function () { return Validate_2.Max; } });
Object.defineProperty(exports, "Email", { enumerable: true, get: function () { return Validate_2.Email; } });
Object.defineProperty(exports, "Phone", { enumerable: true, get: function () { return Validate_2.Phone; } });
Object.defineProperty(exports, "Custom", { enumerable: true, get: function () { return Validate_2.Custom; } });
Object.defineProperty(exports, "validateHandler", { enumerable: true, get: function () { return Validate_2.validateHandler; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return Validate_2.ValidationError; } });
