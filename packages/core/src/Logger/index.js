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
exports.logger = void 0;
exports.ensureUtf8Console = ensureUtf8Console;
exports.configureLogger = configureLogger;
exports.getLogger = getLogger;
exports.getRootLogger = getRootLogger;
exports.Logger = Logger;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var pino_1 = require("pino");
var pino_pretty_1 = require("pino-pretty");
var rootLogger = null;
var currentOptions = {};
var utf8Ready = false;
function isPrettyEnabled(options) {
    if (options.pretty !== undefined)
        return options.pretty;
    return process.env.NODE_ENV !== "production";
}
function toStreamLevel(level) {
    return level === "silent" ? undefined : level;
}
/**
 * Windows 控制台默认常为 GBK(936)，Node/pino 输出 UTF-8 会导致中文乱码。
 * 启动时切到 UTF-8 代码页，并尽量固定 stdout 编码。
 */
function ensureUtf8Console() {
    if (utf8Ready)
        return;
    utf8Ready = true;
    try {
        if (typeof process.stdout.setDefaultEncoding === "function") {
            process.stdout.setDefaultEncoding("utf8");
        }
        if (typeof process.stderr.setDefaultEncoding === "function") {
            process.stderr.setDefaultEncoding("utf8");
        }
    }
    catch (_a) {
        // ignore
    }
    if (process.platform !== "win32")
        return;
    try {
        (0, child_process_1.spawnSync)(process.env.ComSpec || "cmd.exe", ["/c", "chcp", "65001", ">nul"], {
            stdio: "ignore",
            windowsHide: true,
        });
    }
    catch (_b) {
        // ignore
    }
    // Electron / 部分终端：提示使用 UTF-8
    if (!process.env.PYTHONUTF8) {
        process.env.PYTHONUTF8 = "1";
    }
}
function buildLogger(options) {
    var _a, _b, _c, _d;
    if (options === void 0) { options = {}; }
    ensureUtf8Console();
    var level = (_a = options.level) !== null && _a !== void 0 ? _a : "info";
    var useConsole = options.console !== false;
    var useFile = options.file !== false;
    var usePretty = isPrettyEnabled(options);
    var logDir = path_1.default.resolve(process.cwd(), (_b = options.logDir) !== null && _b !== void 0 ? _b : "logs");
    var filename = (_c = options.filename) !== null && _c !== void 0 ? _c : "app.log";
    var errorFilename = options.errorFilename;
    if (useFile && !fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
    var streams = [];
    if (useConsole) {
        if (usePretty) {
            // 主线程同步 pretty，避免 pino.transport worker 在 Windows 上中文乱码
            var prettyStream = (0, pino_pretty_1.default)({
                colorize: true,
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
                ignore: "pid,hostname",
                sync: true,
                destination: process.stdout,
            });
            streams.push({ level: toStreamLevel(level), stream: prettyStream });
        }
        else {
            streams.push({ level: toStreamLevel(level), stream: process.stdout });
        }
    }
    if (useFile) {
        streams.push({
            level: toStreamLevel(level),
            stream: pino_1.default.destination({
                dest: path_1.default.join(logDir, filename),
                mkdir: true,
                // 同步写更稳；日志量不大时足够
                sync: true,
            }),
        });
        if (errorFilename !== false) {
            streams.push({
                level: "error",
                stream: pino_1.default.destination({
                    dest: path_1.default.join(logDir, errorFilename || "error.log"),
                    mkdir: true,
                    sync: true,
                }),
            });
        }
    }
    var base = __assign({ name: "pangza", 
        // 保证序列化为 UTF-8 可读 JSON
        messageKey: "msg" }, ((_d = options.pino) !== null && _d !== void 0 ? _d : {}));
    if (streams.length === 0) {
        return (0, pino_1.default)(__assign({ level: level }, base));
    }
    if (streams.length === 1) {
        return (0, pino_1.default)(__assign({ level: level }, base), streams[0].stream);
    }
    return (0, pino_1.default)(__assign({ level: level }, base), pino_1.default.multistream(streams));
}
/**
 * 配置全局 pino Logger。
 * 建议启动最早调用；也可 Application.registry(Logger({ level: 'debug' }))。
 */
function configureLogger(options) {
    if (options === void 0) { options = {}; }
    currentOptions = __assign(__assign({}, currentOptions), options);
    rootLogger = buildLogger(currentOptions);
}
function ensureRoot() {
    if (!rootLogger) {
        configureLogger();
    }
    return rootLogger;
}
/**
 * 按模块名取子 Logger（pino child）。
 *
 * @example
 * const log = getLogger('UserService');
 * log.info('login ok');
 * log.info({ userId }, 'login ok');
 * log.error(err, 'login failed');
 */
function getLogger(name) {
    if (name === void 0) { name = "app"; }
    return ensureRoot().child({ module: name });
}
/** 默认应用 Logger */
function getRootLogger() {
    return ensureRoot();
}
/** 便捷方法：直接打到 app 分类 */
exports.logger = {
    trace: function (obj, msg) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = getLogger("app")).trace.apply(_a, __spreadArray([obj, msg], args, false));
    },
    debug: function (obj, msg) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = getLogger("app")).debug.apply(_a, __spreadArray([obj, msg], args, false));
    },
    info: function (obj, msg) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = getLogger("app")).info.apply(_a, __spreadArray([obj, msg], args, false));
    },
    warn: function (obj, msg) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = getLogger("app")).warn.apply(_a, __spreadArray([obj, msg], args, false));
    },
    error: function (obj, msg) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = getLogger("app")).error.apply(_a, __spreadArray([obj, msg], args, false));
    },
    fatal: function (obj, msg) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = getLogger("app")).fatal.apply(_a, __spreadArray([obj, msg], args, false));
    },
};
/**
 * 可选模块工厂：Application.registry(Logger({ level: 'debug' }))
 */
function Logger(options) {
    if (options === void 0) { options = {}; }
    configureLogger(options);
    var middleware = function (_req, _res, next) { return next(); };
    Object.defineProperty(middleware, Symbol.for("pangza.logger.module"), {
        value: true,
        enumerable: false,
    });
    return middleware;
}
exports.default = Logger;
