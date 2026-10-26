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
exports.executeXmlStatement = executeXmlStatement;
exports.executeParsedStatement = executeParsedStatement;
var Db_1 = require("../Db");
var resultMap_1 = require("../resultMap");
var sqlTemplate_1 = require("../sqlTemplate");
var registry_1 = require("./registry");
var renderSql_1 = require("./renderSql");
function resolveDatasource(stmt, override) {
    var _a;
    if (override === null || override === void 0 ? void 0 : override.trim())
        return override.trim();
    if ((_a = stmt.datasource) === null || _a === void 0 ? void 0 : _a.trim())
        return stmt.datasource.trim();
    return "default";
}
/** 渲染并执行已注册的 XML 语句 */
function executeXmlStatement(namespace_1, id_1) {
    return __awaiter(this, arguments, void 0, function (namespace, id, options) {
        var stmt;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            stmt = (0, registry_1.getXmlStatement)(namespace, id);
            if (!stmt) {
                throw new Error("\u672A\u627E\u5230 XML \u8BED\u53E5 ".concat(namespace, ".").concat(id));
            }
            return [2 /*return*/, executeParsedStatement(stmt, options)];
        });
    });
}
function executeParsedStatement(stmt_1) {
    return __awaiter(this, arguments, void 0, function (stmt, options) {
        var ctx, fragments, template, parsed, datasource, result, dialect, row, first;
        var _a, _b, _c, _d, _e;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    ctx = (_a = options.paramObject) !== null && _a !== void 0 ? _a : (0, sqlTemplate_1.buildParamContext)((_b = options.args) !== null && _b !== void 0 ? _b : [], (_c = options.namedByIndex) !== null && _c !== void 0 ? _c : {});
                    fragments = (0, registry_1.getXmlFragments)(stmt.namespace);
                    template = (0, renderSql_1.renderStatementSql)(stmt.nodes, ctx, fragments);
                    if (!template) {
                        throw new Error("XML \u8BED\u53E5 ".concat(stmt.namespace, ".").concat(stmt.id, " \u6E32\u67D3\u7ED3\u679C\u4E3A\u7A7A\uFF08file=").concat((_d = stmt.sourceFile) !== null && _d !== void 0 ? _d : "?", ")"));
                    }
                    parsed = (0, sqlTemplate_1.parseMybatisSql)(template, ctx);
                    datasource = resolveDatasource(stmt, options.datasource);
                    return [4 /*yield*/, Db_1.default.queryOn(datasource, parsed.sql, parsed.params)];
                case 1:
                    result = _f.sent();
                    if (stmt.kind === "select") {
                        return [2 /*return*/, (0, resultMap_1.mapResultRows)((_e = result) !== null && _e !== void 0 ? _e : [])];
                    }
                    dialect = Db_1.default.getDialect(datasource);
                    if (stmt.kind === "insert") {
                        if (Array.isArray(result) && result[0] && typeof result[0] === "object") {
                            row = result[0];
                            first = Object.values(row)[0];
                            if (first != null)
                                return [2 /*return*/, Number(first)];
                        }
                        return [2 /*return*/, dialect.extractInsertId(result, "id", false)];
                    }
                    return [2 /*return*/, dialect.extractAffectedRows(result)];
            }
        });
    });
}
