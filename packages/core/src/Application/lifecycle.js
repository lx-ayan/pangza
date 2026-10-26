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
exports.isApplicationInit = isApplicationInit;
exports.isApplicationDestroy = isApplicationDestroy;
exports.runApplicationInits = runApplicationInits;
exports.runApplicationDestroys = runApplicationDestroys;
exports.hookProcessDestroy = hookProcessDestroy;
exports.resetLifecycleForTest = resetLifecycleForTest;
var Service_1 = require("../Service");
var Logger_1 = require("../Logger");
var log = (0, Logger_1.getLogger)("Lifecycle");
var initsDone = false;
var destroysDone = false;
var processHooked = false;
/** 已收集的 Destroy 实例（与 Init 同序收集，销毁时逆序） */
var destroyBeans = [];
function isApplicationInit(bean) {
    return (!!bean &&
        typeof bean === "object" &&
        typeof bean.init === "function");
}
function isApplicationDestroy(bean) {
    return (!!bean &&
        typeof bean === "object" &&
        typeof bean.destroy === "function");
}
/**
 * 启动成功后：扫描容器单例，调用实现了 ApplicationInit 的 init()。
 * 同时收集 ApplicationDestroy，供进程退出时调用。
 */
function runApplicationInits() {
    return __awaiter(this, void 0, void 0, function () {
        var ctors, _i, ctors_1, ctor, bean, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (initsDone)
                        return [2 /*return*/];
                    initsDone = true;
                    destroyBeans.length = 0;
                    ctors = Service_1.Container.getBoundClasses();
                    _i = 0, ctors_1 = ctors;
                    _a.label = 1;
                case 1:
                    if (!(_i < ctors_1.length)) return [3 /*break*/, 6];
                    ctor = ctors_1[_i];
                    bean = void 0;
                    try {
                        bean = Service_1.Container.get(ctor);
                    }
                    catch (err) {
                        log.warn({ err: err, name: ctor.name }, "获取 Bean 失败，跳过生命周期");
                        return [3 /*break*/, 5];
                    }
                    if (isApplicationDestroy(bean)) {
                        destroyBeans.push(bean);
                    }
                    if (!isApplicationInit(bean))
                        return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, bean.init()];
                case 3:
                    _a.sent();
                    log.info("".concat(ctor.name, ".init() \u5B8C\u6210"));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    // 单个 Bean 失败不中断其它 Init，也不拖垮进程
                    log.error({ err: err_1, name: ctor.name }, "ApplicationInit 执行失败");
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * 进程结束前：逆序调用 ApplicationDestroy.destroy()。
 */
function runApplicationDestroys() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, bean, name_1, err_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (destroysDone)
                        return [2 /*return*/];
                    destroysDone = true;
                    _i = 0, _a = __spreadArray([], destroyBeans, true).reverse();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    bean = _a[_i];
                    name_1 = (_b = bean.constructor) === null || _b === void 0 ? void 0 : _b.name;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, bean.destroy()];
                case 3:
                    _c.sent();
                    log.info("".concat(name_1 !== null && name_1 !== void 0 ? name_1 : "Bean", ".destroy() \u5B8C\u6210"));
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _c.sent();
                    log.error({ err: err_2, name: name_1 }, "ApplicationDestroy 执行失败");
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    destroyBeans.length = 0;
                    return [2 /*return*/];
            }
        });
    });
}
/** 注册 SIGINT / SIGTERM → ApplicationDestroy（只挂一次） */
function hookProcessDestroy() {
    var _this = this;
    if (processHooked)
        return;
    processHooked = true;
    var shutdown = function (signal) {
        void (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.info("\u6536\u5230 ".concat(signal, "\uFF0C\u6267\u884C ApplicationDestroy\u2026"));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, runApplicationDestroys()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        process.exit(0);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
    };
    process.once("SIGINT", function () { return shutdown("SIGINT"); });
    process.once("SIGTERM", function () { return shutdown("SIGTERM"); });
}
/** 测试用重置 */
function resetLifecycleForTest() {
    initsDone = false;
    destroysDone = false;
    processHooked = false;
    destroyBeans.length = 0;
}
