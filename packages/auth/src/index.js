"use strict";
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
exports.verifyAuthToken = exports.generateStyleToken = exports.createAuthToken = exports.NotRoleError = exports.NotPermissionError = exports.NotLoginError = exports.AuthError = exports.AUTH_MIDDLEWARE_FLAG = exports.isSessionExpired = exports.getAuthOptions = exports.AuthUtil = void 0;
exports.matchesIgnore = matchesIgnore;
exports.isGloballyIgnored = isGloballyIgnored;
exports.default = Auth;
var context_1 = require("./context");
var AuthUtil_1 = require("./AuthUtil");
var flag_1 = require("./flag");
/** 默认忽略的浏览器/探测路径，避免误进鉴权日志 */
var DEFAULT_IGNORE_PATHS = [
    "/.well-known",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
];
function normalizeIgnorePath(p) {
    if (!p)
        return "/";
    var s = p.trim();
    if (!s.startsWith("/"))
        s = "/".concat(s);
    // 保留模式里的通配；仅去掉末尾多余 /
    if (s.length > 1 && s.endsWith("/") && !s.endsWith("*/") && !s.endsWith("**/")) {
        s = s.slice(0, -1);
    }
    return s;
}
/**
 * ignore 路径匹配（类 Ant / glob）：
 * - `/api/user/login`     精确，或该路径下的子路径
 * - `/api/pub/**`         以 `/api/pub` 开头的全部接口
 * - `/api/pub/*`          仅一层：`/api/pub/xxx`，不含更深
 * - `/api/aes*`           前缀（尾部单个 *）
 */
function matchesIgnore(path, ignore) {
    if (ignore === void 0) { ignore = []; }
    var requestPath = normalizeIgnorePath(path);
    var list = __spreadArray(__spreadArray([], DEFAULT_IGNORE_PATHS, true), ignore, true).map(normalizeIgnorePath);
    return list.some(function (pattern) { return matchIgnorePattern(requestPath, pattern); });
}
function matchIgnorePattern(requestPath, pattern) {
    // /api/pub/** → /api/pub 及其所有子路径
    if (pattern.endsWith("/**")) {
        var base = pattern.slice(0, -3);
        if (!base || base === "/") {
            return true;
        }
        return requestPath === base || requestPath.startsWith("".concat(base, "/"));
    }
    // /api/pub/* → 仅匹配下一层
    if (pattern.endsWith("/*")) {
        var base = pattern.slice(0, -2);
        if (!requestPath.startsWith("".concat(base, "/")))
            return false;
        var rest = requestPath.slice(base.length + 1);
        return rest.length > 0 && !rest.includes("/");
    }
    // /api/aes* → 尾部单个 * 视为前缀（可跨 /）
    if (pattern.endsWith("*") && !pattern.slice(0, -1).includes("*")) {
        return requestPath.startsWith(pattern.slice(0, -1));
    }
    // 其余含 * / ** 的 glob → 正则
    if (pattern.includes("*")) {
        return globToRegExp(pattern).test(requestPath);
    }
    // 无通配：精确匹配，或「目录前缀」（/api/foo 放行 /api/foo/bar，但不放行 /api/foobar）
    return requestPath === pattern || requestPath.startsWith("".concat(pattern, "/"));
}
/** 将 * / ** 转为正则（* 不跨 /，** 跨段） */
function globToRegExp(pattern) {
    var i = 0;
    var out = "^";
    while (i < pattern.length) {
        var ch = pattern[i];
        if (ch === "*" && pattern[i + 1] === "*") {
            out += ".*";
            i += 2;
            // 吞掉 ** 后紧跟的 /，避免 /**/ 多要求一层
            if (pattern[i] === "/")
                i += 1;
            continue;
        }
        if (ch === "*") {
            out += "[^/]*";
            i += 1;
            continue;
        }
        if (".+^${}()|[]\\".includes(ch)) {
            out += "\\".concat(ch);
        }
        else {
            out += ch;
        }
        i += 1;
    }
    out += "/?$";
    return new RegExp(out);
}
/** 是否命中 Auth 全局 ignore（优先级最高） */
function isGloballyIgnored(path) {
    var _a;
    return matchesIgnore(path, (_a = (0, AuthUtil_1.getAuthOptions)().ignore) !== null && _a !== void 0 ? _a : []);
}
/**
 * Auth 中间件工厂（类 Sa-Token）。
 * 只负责解析 token、注入请求上下文，不强制登录；
 * 需要登录的接口请在业务里调用 AuthUtil.checkLogin()。
 *
 * @example
 * Auth({
 *   tokenName: 'satoken',
 *   timeout: 30 * 24 * 60 * 60 * 1000,
 *   activityTimeout: -1,
 *   allowConcurrentLogin: false,
 *   isShare: false,
 *   tokenStyle: 'uuid', // 或 'jwt'
 *   jwtSecret: 'change-me',
 * })
 */
function Auth(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    (0, AuthUtil_1.configureAuth)(options);
    var middleware = function (req, _res, next) {
        // 预检与忽略路径直接放行
        if (req.method === "OPTIONS" || matchesIgnore(req.path, options.ignore)) {
            return next();
        }
        var token = AuthUtil_1.AuthUtil.readTokenFromRequest(req);
        void (function () { return __awaiter(_this, void 0, void 0, function () {
            var session, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, AuthUtil_1.AuthUtil.loadSession(token, { touch: true })];
                    case 1:
                        session = _a.sent();
                        context_1.authContext.run({
                            req: req,
                            token: token,
                            session: session,
                        }, function () { return next(); });
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        next(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    };
    Object.defineProperty(middleware, flag_1.AUTH_MIDDLEWARE_FLAG, {
        value: true,
        enumerable: false,
    });
    return middleware;
}
var AuthUtil_2 = require("./AuthUtil");
Object.defineProperty(exports, "AuthUtil", { enumerable: true, get: function () { return AuthUtil_2.AuthUtil; } });
Object.defineProperty(exports, "getAuthOptions", { enumerable: true, get: function () { return AuthUtil_2.getAuthOptions; } });
Object.defineProperty(exports, "isSessionExpired", { enumerable: true, get: function () { return AuthUtil_2.isSessionExpired; } });
var flag_2 = require("./flag");
Object.defineProperty(exports, "AUTH_MIDDLEWARE_FLAG", { enumerable: true, get: function () { return flag_2.AUTH_MIDDLEWARE_FLAG; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "AuthError", { enumerable: true, get: function () { return errors_1.AuthError; } });
Object.defineProperty(exports, "NotLoginError", { enumerable: true, get: function () { return errors_1.NotLoginError; } });
Object.defineProperty(exports, "NotPermissionError", { enumerable: true, get: function () { return errors_1.NotPermissionError; } });
Object.defineProperty(exports, "NotRoleError", { enumerable: true, get: function () { return errors_1.NotRoleError; } });
var token_1 = require("./token");
Object.defineProperty(exports, "createAuthToken", { enumerable: true, get: function () { return token_1.createAuthToken; } });
Object.defineProperty(exports, "generateStyleToken", { enumerable: true, get: function () { return token_1.generateStyleToken; } });
Object.defineProperty(exports, "verifyAuthToken", { enumerable: true, get: function () { return token_1.verifyAuthToken; } });
