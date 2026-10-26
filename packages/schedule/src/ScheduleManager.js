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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleManager = void 0;
exports.configureSchedule = configureSchedule;
exports.convertQuartzCron = convertQuartzCron;
exports.validateCron = validateCron;
exports.initScheduleJobs = initScheduleJobs;
var node_cron_1 = require("node-cron");
var Service_1 = require("@pangza/core/Service");
var orm_1 = require("@pangza/orm");
var jobLoader = null;
function configureSchedule(options) {
    if (options === void 0) { options = {}; }
    if (options.loadJobs) {
        jobLoader = options.loadJobs;
    }
}
/**
 * Quartz 风格 Cron → node-cron：
 * - 将 `?` 替换为 `*`
 * - 6 段（含秒）原样交给 node-cron
 */
function convertQuartzCron(cronExpr) {
    var raw = String(cronExpr !== null && cronExpr !== void 0 ? cronExpr : "").trim();
    if (!raw)
        throw new orm_1.OrmError("Cron 表达式不能为空");
    var converted = raw.replace(/\?/g, "*");
    var parts = converted.split(/\s+/).filter(Boolean);
    if (parts.length !== 5 && parts.length !== 6) {
        throw new orm_1.OrmError("Cron \u8868\u8FBE\u5F0F\u4E0D\u5408\u6CD5\uFF1A".concat(cronExpr));
    }
    return parts.join(" ");
}
function validateCron(cronExpr) {
    var expr = convertQuartzCron(cronExpr);
    if (!node_cron_1.default.validate(expr)) {
        throw new orm_1.OrmError("Cron \u8868\u8FBE\u5F0F\u4E0D\u5408\u6CD5\uFF1A".concat(cronExpr));
    }
    return expr;
}
function invokeBean(beanName) {
    return __awaiter(this, void 0, void 0, function () {
        var bean;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(beanName === null || beanName === void 0 ? void 0 : beanName.trim())) {
                        throw new orm_1.OrmError("执行类（Bean 名称）不能为空");
                    }
                    if (!Service_1.Container.has(beanName)) {
                        throw new orm_1.OrmError("\u672A\u627E\u5230 Bean\uFF1A".concat(beanName));
                    }
                    bean = Service_1.Container.get(beanName);
                    if (!(typeof (bean === null || bean === void 0 ? void 0 : bean.execute) === "function")) return [3 /*break*/, 2];
                    return [4 /*yield*/, bean.execute()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    if (!(typeof (bean === null || bean === void 0 ? void 0 : bean.run) === "function")) return [3 /*break*/, 4];
                    return [4 /*yield*/, bean.run()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4: throw new orm_1.OrmError("Bean [".concat(beanName, "] \u9700\u5B9E\u73B0 execute() \u6216 run()"));
            }
        });
    });
}
/**
 * 定时任务调度管理（node-cron）。
 * 任务列表由业务通过 loadJobs 注入，framework 不依赖 business Service。
 */
var ScheduleManagerImpl = /** @class */ (function () {
    function ScheduleManagerImpl() {
        this.jobs = new Map();
    }
    ScheduleManagerImpl.prototype.scheduleJob = function (entity) {
        var _this = this;
        var id = String(entity.id);
        this.unschedule(id);
        if (entity.status == null || Number(entity.status) === 0) {
            console.log("[Schedule] \u4EFB\u52A1\u5DF2\u505C\u7528\uFF0C\u5DF2\u4ECE\u8C03\u5EA6\u5668\u79FB\u9664 id=".concat(id));
            return;
        }
        var expr = validateCron(entity.cron);
        var beanName = entity.beanName;
        if (!Service_1.Container.has(beanName)) {
            throw new orm_1.OrmError("\u672A\u627E\u5230 Bean\uFF1A".concat(beanName));
        }
        var task = node_cron_1.default.schedule(expr, function () {
            void (function () { return __awaiter(_this, void 0, void 0, function () {
                var e_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            console.log("[Schedule] \u89E6\u53D1\u4EFB\u52A1 id=".concat(id, ", title=").concat((_a = entity.title) !== null && _a !== void 0 ? _a : "", ", bean=").concat(beanName));
                            return [4 /*yield*/, invokeBean(beanName)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _b.sent();
                            console.error("[Schedule] \u4EFB\u52A1\u6267\u884C\u5931\u8D25 id=".concat(id, ":"), e_1 instanceof Error ? e_1.message : e_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })();
        });
        this.jobs.set(id, task);
        console.log("[Schedule] \u5DF2\u6CE8\u518C\u4EFB\u52A1 id=".concat(id, ", cron=").concat(expr));
    };
    ScheduleManagerImpl.prototype.unschedule = function (id) {
        var task = this.jobs.get(String(id));
        if (task) {
            task.stop();
            this.jobs.delete(String(id));
        }
    };
    ScheduleManagerImpl.prototype.runOnce = function (beanName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, invokeBean(beanName)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ScheduleManagerImpl.prototype.loadEnabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var list, _i, list_1, row, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!jobLoader) {
                            console.warn("[Schedule] 未配置 loadJobs，跳过初始化");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, jobLoader()];
                    case 2:
                        list = _a.sent();
                        for (_i = 0, list_1 = list; _i < list_1.length; _i++) {
                            row = list_1[_i];
                            try {
                                this.scheduleJob(row);
                            }
                            catch (e) {
                                console.error("[Schedule] \u542F\u52A8\u52A0\u8F7D\u5931\u8D25 id=".concat(row.id, ":"), e instanceof Error ? e.message : e);
                            }
                        }
                        console.log("[Schedule] \u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u5DF2\u52A0\u8F7D ".concat(list.length, " \u4E2A\u542F\u7528\u4EFB\u52A1"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        console.warn("[Schedule] 初始化跳过：", e_2 instanceof Error ? e_2.message : e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ScheduleManagerImpl;
}());
exports.ScheduleManager = new ScheduleManagerImpl();
/** 启动后加载启用中的定时任务 */
function initScheduleJobs() {
    return __awaiter(this, arguments, void 0, function (options) {
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (options.loadJobs) {
                        configureSchedule(options);
                    }
                    return [4 /*yield*/, exports.ScheduleManager.loadEnabled()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
