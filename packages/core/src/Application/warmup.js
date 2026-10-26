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
exports.warmupConnections = warmupConnections;
var Logger_1 = require("../Logger");
var moduleFlags_1 = require("../moduleFlags");
var log = (0, Logger_1.getLogger)("Warmup");
/**
 * listen 之后按需预热：仅当已 registry EnableRedis / EnableOrm（或 Auth 绑定了 redis）时连接。
 * 未启用则跳过，避免无 Redis/MySQL 的用户被连接错误打扰。
 */
function warmupConnections() {
    return __awaiter(this, void 0, void 0, function () {
        var tasks;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tasks = [];
                    if ((0, moduleFlags_1.isRedisEnabled)()) {
                        tasks.push((function () { return __awaiter(_this, void 0, void 0, function () {
                            var Redis, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        Redis = require("@pangza/redis").default;
                                        return [4 /*yield*/, Redis.connect()];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, Redis.ping()];
                                    case 2:
                                        _a.sent();
                                        log.info("Redis 预热完成");
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _a.sent();
                                        log.warn({ err: err_1 }, "Redis 预热失败（已 EnableRedis，请检查配置；首次业务请求时会再连）");
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })());
                    }
                    else {
                        log.debug("未 EnableRedis，跳过 Redis 预热");
                    }
                    if ((0, moduleFlags_1.isOrmEnabled)()) {
                        tasks.push((function () { return __awaiter(_this, void 0, void 0, function () {
                            var Db, err_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        Db = require("@pangza/orm").default;
                                        return [4 /*yield*/, Db.connect()];
                                    case 1:
                                        _a.sent();
                                        log.info("数据源预热完成");
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_2 = _a.sent();
                                        log.warn({ err: err_2 }, "数据源预热失败（已 EnableOrm，请检查配置；首次查询时会再连）");
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })());
                    }
                    else {
                        log.debug("未 EnableOrm，跳过数据源预热");
                    }
                    if (tasks.length === 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, Promise.all(tasks)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
