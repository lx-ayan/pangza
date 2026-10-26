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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUtil = void 0;
exports.configureAuth = configureAuth;
exports.getAuthOptions = getAuthOptions;
exports.isSessionExpired = isSessionExpired;
var context_1 = require("./context");
var errors_1 = require("./errors");
var store_1 = require("./store");
var token_1 = require("./token");
/** 默认会话时长：2 小时（毫秒） */
var DEFAULT_TIMEOUT = 2 * 60 * 60 * 1000;
var DEFAULT_JWT_SECRET = "pangza-admin-express-jwt-secret";
/** 运行时鉴权配置（由 Auth(options) 写入） */
var authOptions = {
    tokenName: "satoken",
    header: "Authorization",
    tokenPrefix: "Bearer",
    timeout: DEFAULT_TIMEOUT,
    activityTimeout: -1,
    allowConcurrentLogin: true,
    isShare: false,
    tokenStyle: "uuid",
    jwtSecret: DEFAULT_JWT_SECRET,
    jwtAlgorithm: "HS256",
    ignore: [],
    readCookie: true,
    checkMode: "OR",
};
function resolveExpireTime(timeoutMs, now) {
    if (now === void 0) { now = Date.now(); }
    if (timeoutMs < 0)
        return Number.MAX_SAFE_INTEGER;
    return now + timeoutMs;
}
/** 合并并保存 Auth 配置；配置了 redis 则优先使用 Redis 会话库 */
function configureAuth(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (options === void 0) { options = {}; }
    authOptions = __assign(__assign(__assign({}, authOptions), options), { tokenName: (_a = options.tokenName) !== null && _a !== void 0 ? _a : authOptions.tokenName, header: (_b = options.header) !== null && _b !== void 0 ? _b : authOptions.header, tokenPrefix: options.tokenPrefix !== undefined
            ? options.tokenPrefix
            : authOptions.tokenPrefix, timeout: (_c = options.timeout) !== null && _c !== void 0 ? _c : authOptions.timeout, activityTimeout: (_d = options.activityTimeout) !== null && _d !== void 0 ? _d : authOptions.activityTimeout, allowConcurrentLogin: (_e = options.allowConcurrentLogin) !== null && _e !== void 0 ? _e : authOptions.allowConcurrentLogin, isShare: (_f = options.isShare) !== null && _f !== void 0 ? _f : authOptions.isShare, tokenStyle: (_g = options.tokenStyle) !== null && _g !== void 0 ? _g : authOptions.tokenStyle, createToken: (_h = options.createToken) !== null && _h !== void 0 ? _h : authOptions.createToken, jwtSecret: (_j = options.jwtSecret) !== null && _j !== void 0 ? _j : authOptions.jwtSecret, jwtAlgorithm: (_k = options.jwtAlgorithm) !== null && _k !== void 0 ? _k : authOptions.jwtAlgorithm, ignore: (_l = options.ignore) !== null && _l !== void 0 ? _l : authOptions.ignore, readCookie: (_m = options.readCookie) !== null && _m !== void 0 ? _m : authOptions.readCookie, redis: (_o = options.redis) !== null && _o !== void 0 ? _o : authOptions.redis, checkMode: (_p = options.checkMode) !== null && _p !== void 0 ? _p : authOptions.checkMode });
    if (options.redis) {
        (0, store_1.setSessionStore)(new store_1.RedisStore(options.redis));
    }
    else if (options.redis === undefined && !authOptions.redis) {
        (0, store_1.setSessionStore)(new store_1.MemoryStore());
    }
}
/** 读取当前鉴权配置 */
function getAuthOptions() {
    return authOptions;
}
function normalizeLoginArgs(rolesOrOptions, permissions, profile) {
    var _a;
    if (rolesOrOptions &&
        !Array.isArray(rolesOrOptions) &&
        typeof rolesOrOptions === "object") {
        return rolesOrOptions;
    }
    return {
        roles: (_a = rolesOrOptions) !== null && _a !== void 0 ? _a : [],
        permissions: permissions !== null && permissions !== void 0 ? permissions : [],
        username: profile === null || profile === void 0 ? void 0 : profile.username,
        avatar: profile === null || profile === void 0 ? void 0 : profile.avatar,
        device: profile === null || profile === void 0 ? void 0 : profile.device,
    };
}
/** 校验会话是否因绝对过期 / 闲置过期而失效 */
function isSessionExpired(session, options) {
    if (options === void 0) { options = authOptions; }
    var now = Date.now();
    if (now > session.expireTime)
        return true;
    if (options.activityTimeout >= 0 &&
        now - (session.lastActiveTime || session.createTime) >
            options.activityTimeout) {
        return true;
    }
    return false;
}
/**
 * 类 Sa-Token 的静态工具（AuthUtil）。
 * 业务侧通过它完成登录、取 token、校验登录/角色/权限。
 */
var AuthUtil = /** @class */ (function () {
    function AuthUtil() {
    }
    /**
     * 登录：创建会话并返回 token。
     *
     * @example
     * AuthUtil.login(id, ['admin'], ['user:read'])
     * AuthUtil.login(id, { roles, permissions, device: 'web', username })
     */
    AuthUtil.login = function (loginId_1) {
        return __awaiter(this, arguments, void 0, function (loginId, rolesOrOptions, permissions, profile) {
            var opt, store, timeout, device, now, tokens, _i, tokens_1, t, old, tokens, _a, tokens_2, t, old, token, session;
            var _b, _c, _d, _e, _f, _g, _h;
            if (rolesOrOptions === void 0) { rolesOrOptions = []; }
            if (permissions === void 0) { permissions = []; }
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        opt = normalizeLoginArgs(rolesOrOptions, permissions, profile);
                        store = (0, store_1.getSessionStore)();
                        timeout = (_b = opt.timeout) !== null && _b !== void 0 ? _b : authOptions.timeout;
                        device = opt.device;
                        now = Date.now();
                        if (!authOptions.isShare) return [3 /*break*/, 9];
                        return [4 /*yield*/, store.listTokensByLoginId(loginId)];
                    case 1:
                        tokens = _j.sent();
                        _i = 0, tokens_1 = tokens;
                        _j.label = 2;
                    case 2:
                        if (!(_i < tokens_1.length)) return [3 /*break*/, 9];
                        t = tokens_1[_i];
                        return [4 /*yield*/, store.getByToken(t)];
                    case 3:
                        old = _j.sent();
                        if (!(!old || isSessionExpired(old))) return [3 /*break*/, 6];
                        if (!old) return [3 /*break*/, 5];
                        return [4 /*yield*/, store.removeByToken(t)];
                    case 4:
                        _j.sent();
                        _j.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        if (device && old.device && old.device !== device)
                            return [3 /*break*/, 8];
                        if (!device && old.device)
                            return [3 /*break*/, 8];
                        old.roles = (_c = opt.roles) !== null && _c !== void 0 ? _c : old.roles;
                        old.permissions = (_d = opt.permissions) !== null && _d !== void 0 ? _d : old.permissions;
                        old.username = (_e = opt.username) !== null && _e !== void 0 ? _e : old.username;
                        old.avatar = (_f = opt.avatar) !== null && _f !== void 0 ? _f : old.avatar;
                        old.expireTime = resolveExpireTime(timeout, now);
                        old.lastActiveTime = now;
                        return [4 /*yield*/, store.set(old)];
                    case 7:
                        _j.sent();
                        this.syncContext(old.token, old);
                        return [2 /*return*/, old.token];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        if (!!authOptions.allowConcurrentLogin) return [3 /*break*/, 18];
                        if (!device) return [3 /*break*/, 16];
                        return [4 /*yield*/, store.listTokensByLoginId(loginId)];
                    case 10:
                        tokens = _j.sent();
                        _a = 0, tokens_2 = tokens;
                        _j.label = 11;
                    case 11:
                        if (!(_a < tokens_2.length)) return [3 /*break*/, 15];
                        t = tokens_2[_a];
                        return [4 /*yield*/, store.getByToken(t)];
                    case 12:
                        old = _j.sent();
                        if (!(old && (!old.device || old.device === device))) return [3 /*break*/, 14];
                        return [4 /*yield*/, store.removeByToken(t)];
                    case 13:
                        _j.sent();
                        _j.label = 14;
                    case 14:
                        _a++;
                        return [3 /*break*/, 11];
                    case 15: return [3 /*break*/, 18];
                    case 16: return [4 /*yield*/, store.removeByLoginId(loginId)];
                    case 17:
                        _j.sent();
                        _j.label = 18;
                    case 18: return [4 /*yield*/, (0, token_1.createAuthToken)(authOptions, {
                            loginId: loginId,
                            device: device,
                            timeout: timeout,
                        })];
                    case 19:
                        token = _j.sent();
                        session = {
                            token: token,
                            loginId: loginId,
                            device: device,
                            roles: (_g = opt.roles) !== null && _g !== void 0 ? _g : [],
                            permissions: (_h = opt.permissions) !== null && _h !== void 0 ? _h : [],
                            username: opt.username,
                            avatar: opt.avatar,
                            createTime: now,
                            expireTime: resolveExpireTime(timeout, now),
                            lastActiveTime: now,
                        };
                        return [4 /*yield*/, store.set(session)];
                    case 20:
                        _j.sent();
                        this.syncContext(token, session);
                        return [2 /*return*/, token];
                }
            });
        });
    };
    AuthUtil.syncContext = function (token, session) {
        var ctx = (0, context_1.getAuthStore)();
        if (ctx) {
            ctx.token = token;
            ctx.session = session;
        }
    };
    /**
     * 注销当前（或指定）token 会话
     * @param token 不传则注销当前请求 token
     */
    AuthUtil.logout = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var value, ctx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        value = token !== null && token !== void 0 ? token : this.getTokenValue();
                        if (!value) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, store_1.getSessionStore)().removeByToken(value)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        ctx = (0, context_1.getAuthStore)();
                        if (ctx && (!token || ctx.token === token)) {
                            ctx.token = null;
                            ctx.session = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /** 按账号注销其全部会话 */
    AuthUtil.logoutByLoginId = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, store_1.getSessionStore)().removeByLoginId(loginId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** 按账号 + 设备注销 */
    AuthUtil.logoutByDevice = function (loginId, device) {
        return __awaiter(this, void 0, void 0, function () {
            var store, tokens, _i, tokens_3, t, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        store = (0, store_1.getSessionStore)();
                        return [4 /*yield*/, store.listTokensByLoginId(loginId)];
                    case 1:
                        tokens = _a.sent();
                        _i = 0, tokens_3 = tokens;
                        _a.label = 2;
                    case 2:
                        if (!(_i < tokens_3.length)) return [3 /*break*/, 6];
                        t = tokens_3[_i];
                        return [4 /*yield*/, store.getByToken(t)];
                    case 3:
                        session = _a.sent();
                        if (!((session === null || session === void 0 ? void 0 : session.device) === device)) return [3 /*break*/, 5];
                        return [4 /*yield*/, store.removeByToken(t)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /** 获取当前请求 token（优先上下文，其次请求头/Cookie） */
    AuthUtil.getTokenValue = function () {
        var store = (0, context_1.getAuthStore)();
        if (store === null || store === void 0 ? void 0 : store.token)
            return store.token;
        if (store === null || store === void 0 ? void 0 : store.req)
            return this.readTokenFromRequest(store.req);
        return null;
    };
    /**
     * 从请求解析 token：
     * 1. tokenName 请求头（如 satoken）
     * 2. Authorization / 自定义 header（可带 Bearer 前缀）
     * 3. Cookie[tokenName]
     */
    AuthUtil.readTokenFromRequest = function (req) {
        var tryRaw = function (raw) {
            if (typeof raw !== "string" || !raw.trim())
                return null;
            var value = raw.trim();
            var prefix = authOptions.tokenPrefix;
            if (prefix && value.startsWith("".concat(prefix, " "))) {
                return value.slice(prefix.length + 1).trim() || null;
            }
            return value || null;
        };
        // 1. tokenName header（Sa-Token 常用）
        var byName = tryRaw(req.headers[authOptions.tokenName.toLowerCase()]);
        if (byName)
            return byName;
        // 2. Authorization / 兼容 header
        var headerName = authOptions.header.toLowerCase();
        if (headerName !== authOptions.tokenName.toLowerCase()) {
            var byHeader = tryRaw(req.headers[headerName]);
            if (byHeader)
                return byHeader;
        }
        // 3. Cookie
        if (authOptions.readCookie) {
            var cookies = req.cookies;
            if (cookies) {
                var byCookie = tryRaw(cookies[authOptions.tokenName]);
                if (byCookie)
                    return byCookie;
            }
        }
        return null;
    };
    /**
     * 加载并校验会话；过期清理；可选刷新 lastActiveTime。
     */
    AuthUtil.loadSession = function (token_2) {
        return __awaiter(this, arguments, void 0, function (token, options) {
            var session;
            if (options === void 0) { options = { touch: true }; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!token)
                            return [2 /*return*/, null];
                        if (!!(0, token_1.verifyAuthToken)(authOptions, token)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, store_1.getSessionStore)().removeByToken(token)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                    case 2: return [4 /*yield*/, (0, store_1.getSessionStore)().getByToken(token)];
                    case 3:
                        session = _a.sent();
                        if (!session)
                            return [2 /*return*/, null];
                        // 兼容旧会话无 lastActiveTime
                        if (!session.lastActiveTime) {
                            session.lastActiveTime = session.createTime;
                        }
                        if (!isSessionExpired(session)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, store_1.getSessionStore)().removeByToken(token)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, null];
                    case 5:
                        if (!(options.touch !== false)) return [3 /*break*/, 7];
                        session.lastActiveTime = Date.now();
                        return [4 /*yield*/, (0, store_1.getSessionStore)().touch(session)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, session];
                }
            });
        });
    };
    /** 获取当前有效会话；过期会清理并返回 null */
    AuthUtil.getSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, token, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = (0, context_1.getAuthStore)();
                        if (!(ctx === null || ctx === void 0 ? void 0 : ctx.session)) return [3 /*break*/, 3];
                        if (!isSessionExpired(ctx.session)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.logout(ctx.session.token)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                    case 2: 
                    // 请求内已 touch 过则不重复写
                    return [2 /*return*/, ctx.session];
                    case 3:
                        token = this.getTokenValue();
                        return [4 /*yield*/, this.loadSession(token)];
                    case 4:
                        session = _a.sent();
                        if (ctx)
                            ctx.session = session;
                        return [2 /*return*/, session];
                }
            });
        });
    };
    /** 是否已登录 */
    AuthUtil.isLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSession()];
                    case 1: return [2 /*return*/, (_a.sent()) !== null];
                }
            });
        });
    };
    /** 校验已登录，否则抛 NotLoginError；返回 loginId */
    AuthUtil.checkLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSession()];
                    case 1:
                        session = _a.sent();
                        if (!session)
                            throw new errors_1.NotLoginError();
                        return [2 /*return*/, session.loginId];
                }
            });
        });
    };
    /** 获取登录账号（未登录抛错） */
    AuthUtil.getLoginId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.checkLogin()];
            });
        });
    };
    /** 获取登录账号；未登录返回 null */
    AuthUtil.getLoginIdDefaultNull = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getSession()];
                    case 1: return [2 /*return*/, (_b = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.loginId) !== null && _b !== void 0 ? _b : null];
                }
            });
        });
    };
    /** 当前登录设备 */
    AuthUtil.getLoginDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getSession()];
                    case 1: return [2 /*return*/, (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.device];
                }
            });
        });
    };
    /** 当前角色列表 */
    AuthUtil.getRoleList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getSession()];
                    case 1: return [2 /*return*/, (_b = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.roles) !== null && _b !== void 0 ? _b : []];
                }
            });
        });
    };
    /** 当前权限列表 */
    AuthUtil.getPermissionList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getSession()];
                    case 1: return [2 /*return*/, (_b = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.permissions) !== null && _b !== void 0 ? _b : []];
                }
            });
        });
    };
    /** 是否拥有指定角色 */
    AuthUtil.hasRole = function (role) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoleList()];
                    case 1: return [2 /*return*/, (_a.sent()).includes(role)];
                }
            });
        });
    };
    /** 是否拥有指定权限 */
    AuthUtil.hasPermission = function (permission) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPermissionList()];
                    case 1: return [2 /*return*/, (_a.sent()).includes(permission)];
                }
            });
        });
    };
    /** 校验角色，失败抛 NotRoleError */
    AuthUtil.checkRole = function (role) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkLogin()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.hasRole(role)];
                    case 2:
                        if (!(_a.sent()))
                            throw new errors_1.NotRoleError("\u65E0\u89D2\u8272: ".concat(role));
                        return [2 /*return*/];
                }
            });
        });
    };
    /** 校验权限，失败抛 NotPermissionError */
    AuthUtil.checkPermission = function (permission) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkLogin()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.hasPermission(permission)];
                    case 2:
                        if (!(_a.sent())) {
                            throw new errors_1.NotPermissionError("\u65E0\u6743\u9650: ".concat(permission));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return AuthUtil;
}());
exports.AuthUtil = AuthUtil;
