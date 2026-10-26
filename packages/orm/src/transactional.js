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
exports.Transactional = Transactional;
var Db_1 = require("./Db");
var TX_WRAPPED = Symbol.for("pangza.orm.transactional.wrapped");
function wrapTransactional(fn, datasource, propagation) {
    if (datasource === void 0) { datasource = "default"; }
    if (propagation === void 0) { propagation = "REQUIRED"; }
    if (fn[TX_WRAPPED])
        return fn;
    var ds = (datasource || "default").trim() || "default";
    var wrapped = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Db_1.default.transactionOn(ds, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, fn.apply(this, args)];
                    }); }); }, { propagation: propagation })];
            });
        });
    };
    wrapped[TX_WRAPPED] = true;
    return wrapped;
}
/**
 * 事务装饰器（对齐 Spring @Transactional）。
 * 可标在类或方法上；方法内同数据源的 Db.queryOn / BaseMapper 走同一连接，抛错则回滚。
 *
 * @example
 * @Transactional()
 * async transfer() { ... }
 *
 * @Transactional({ propagation: "REQUIRES_NEW" })
 * async auditLog() { ... }
 *
 * @Transactional({ datasource: "pg" })
 * async syncToPg() { ... }
 */
function Transactional(options) {
    var _a, _b;
    var datasource = (_a = options === null || options === void 0 ? void 0 : options.datasource) !== null && _a !== void 0 ? _a : "default";
    var propagation = (_b = options === null || options === void 0 ? void 0 : options.propagation) !== null && _b !== void 0 ? _b : "REQUIRED";
    return (function (target, propertyKey, descriptor) {
        if (propertyKey !== undefined && descriptor && typeof descriptor.value === "function") {
            descriptor.value = wrapTransactional(descriptor.value, datasource, propagation);
            return descriptor;
        }
        var proto = target.prototype;
        if (!proto)
            return;
        for (var _i = 0, _a = Object.getOwnPropertyNames(proto); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key === "constructor")
                continue;
            var desc = Object.getOwnPropertyDescriptor(proto, key);
            if (!desc || typeof desc.value !== "function")
                continue;
            Object.defineProperty(proto, key, __assign(__assign({}, desc), { value: wrapTransactional(desc.value, datasource, propagation) }));
        }
    });
}
