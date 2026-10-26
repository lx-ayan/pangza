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
exports.xmlMapper = xmlMapper;
var execute_1 = require("./execute");
var loadMappers_1 = require("./loadMappers");
var registry_1 = require("./registry");
/**
 * 无类调用 XML 命名空间。
 * @example
 * await xmlMapper("com.pangza.UserMapper").selectList("findByRole", { roleId: 1 })
 */
function xmlMapper(namespace, datasource) {
    var _this = this;
    var ns = String(namespace !== null && namespace !== void 0 ? namespace : "").trim();
    if (!ns)
        throw new Error("xmlMapper namespace 不能为空");
    var run = function (id, params) { return __awaiter(_this, void 0, void 0, function () {
        var stmt;
        return __generator(this, function (_a) {
            (0, loadMappers_1.ensureXmlMappersLoaded)();
            stmt = (0, registry_1.getXmlStatement)(ns, id);
            if (!stmt)
                throw new Error("\u672A\u627E\u5230 XML \u8BED\u53E5 ".concat(ns, ".").concat(id));
            return [2 /*return*/, (0, execute_1.executeXmlStatement)(ns, id, {
                    paramObject: params !== null && params !== void 0 ? params : {},
                    datasource: datasource,
                })];
        });
    }); };
    return {
        selectList: function (id, params) {
            return __awaiter(this, void 0, void 0, function () {
                var rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, run(id, params)];
                        case 1:
                            rows = _a.sent();
                            return [2 /*return*/, (Array.isArray(rows) ? rows : [])];
                    }
                });
            });
        },
        selectOne: function (id, params) {
            return __awaiter(this, void 0, void 0, function () {
                var rows;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.selectList(id, params)];
                        case 1:
                            rows = _b.sent();
                            return [2 /*return*/, (_a = rows[0]) !== null && _a !== void 0 ? _a : null];
                    }
                });
            });
        },
        insert: function (id, params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = Number;
                            return [4 /*yield*/, run(id, params)];
                        case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        },
        update: function (id, params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = Number;
                            return [4 /*yield*/, run(id, params)];
                        case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        },
        delete: function (id, params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = Number;
                            return [4 /*yield*/, run(id, params)];
                        case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        },
        execute: function (id, params) {
            return run(id, params);
        },
    };
}
