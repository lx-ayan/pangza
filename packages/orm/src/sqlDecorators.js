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
exports.Delete = exports.Update = exports.Insert = exports.MAPPER_ENTITY_KEY = void 0;
exports.Param = Param;
exports.Select = Select;
require("reflect-metadata");
var Db_1 = require("./Db");
var fieldSelect_1 = require("./fieldSelect");
var resultMap_1 = require("./resultMap");
var sqlTemplate_1 = require("./sqlTemplate");
var PARAM_NAMES_KEY = Symbol.for("pangza.orm.sqlParamNames");
/** Mapper 类上挂的实体（供方法级 @Select 结果自动填充字段 @Select） */
exports.MAPPER_ENTITY_KEY = Symbol.for("pangza.orm.mapperEntity");
function resolveDatasource(options) {
    var _a;
    if ((_a = options === null || options === void 0 ? void 0 : options.datasource) === null || _a === void 0 ? void 0 : _a.trim()) {
        return options.datasource.trim();
    }
    if (options === null || options === void 0 ? void 0 : options.db) {
        return Db_1.default.findByType(options.db);
    }
    return "default";
}
function getNamedParams(target, methodName) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(PARAM_NAMES_KEY, target, methodName)) !== null && _a !== void 0 ? _a : {});
}
/**
 * @Param("id")
 * 为方法参数命名，供 SQL 中 #{id} / ${id} 引用。
 */
function Param(name) {
    return function (target, propertyKey, parameterIndex) {
        var _a;
        if (propertyKey === undefined)
            return;
        var key = String(name).trim();
        if (!key) {
            throw new Error("@Param 名称不能为空");
        }
        var map = __assign(__assign({}, getNamedParams(target, propertyKey)), (_a = {}, _a[parameterIndex] = key, _a));
        Reflect.defineMetadata(PARAM_NAMES_KEY, map, target, propertyKey);
    };
}
function createSqlMethodDecorator(kind) {
    return function (sql, options) {
        if (!sql || !String(sql).trim()) {
            throw new Error("@".concat(kind[0].toUpperCase()).concat(kind.slice(1), " SQL \u4E0D\u80FD\u4E3A\u7A7A"));
        }
        var template = String(sql);
        var datasource = resolveDatasource(options);
        return function (target, propertyKey, descriptor) {
            var methodName = String(propertyKey);
            var named = function () { return getNamedParams(target, propertyKey); };
            var executor = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(this, void 0, void 0, function () {
                    var ctx, parsed, result, dialect, row, first;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                ctx = (0, sqlTemplate_1.buildParamContext)(args, named());
                                parsed = (0, sqlTemplate_1.parseMybatisSql)(template, ctx);
                                return [4 /*yield*/, Db_1.default.queryOn(datasource, parsed.sql, parsed.params)];
                            case 1:
                                result = _b.sent();
                                if (kind === "select") {
                                    // 方法级 @Select 常用于批量查询，不自动填字段 @Select，避免 N+1。
                                    // 需要时：hydrateFieldSelects(Entity, rows, { datasource })
                                    return [2 /*return*/, (0, resultMap_1.mapResultRows)((_a = result) !== null && _a !== void 0 ? _a : [])];
                                }
                                dialect = Db_1.default.getDialect(datasource);
                                if (kind === "insert") {
                                    // 自定义 INSERT 若含 RETURNING / OUTPUT，优先取第一行第一列
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
            };
            executor[Symbol.for("pangza.orm.sqlBound")] = kind;
            if (descriptor) {
                descriptor.value = executor;
                return descriptor;
            }
            Object.defineProperty(target, methodName, {
                value: executor,
                writable: true,
                configurable: true,
            });
        };
    };
}
/**
 * @Select — 方法装饰器或字段装饰器。
 *
 * 方法：执行 SQL，返回行数组。
 * 字段：查询结果映射到该属性（父行字段可用 #{id} / #{parentId} 等引用）。
 *
 * @example
 * @Select("SELECT * FROM user WHERE id = #{id}")
 * findById(@Param("id") id: string) {}
 *
 * @Select('SELECT * FROM "user" WHERE id = #{id}', { db: "postgresql" })
 * findOnPg(@Param("id") id: string) {}
 *
 * @Select("SELECT * FROM menu WHERE parent_id = #{id}", { many: true })
 * children?: Menu[];
 */
function Select(sql, options) {
    var template = String(sql !== null && sql !== void 0 ? sql : "").trim();
    if (!template) {
        throw new Error("@Select SQL 不能为空");
    }
    return (function (target, propertyKey, descriptor) {
        // 方法装饰器：descriptor.value 为函数
        if (propertyKey !== undefined &&
            descriptor &&
            typeof descriptor.value === "function") {
            return createSqlMethodDecorator("select")(template, options)(target, propertyKey, descriptor);
        }
        // 属性装饰器
        if (propertyKey === undefined) {
            throw new Error("@Select 不能用于类");
        }
        var ctor = target.constructor;
        (0, fieldSelect_1.registerFieldSelect)(ctor, String(propertyKey), template, options);
    });
}
/**
 * @Insert("INSERT INTO user(name) VALUES(#{name})")
 * 返回 insertId；PostgreSQL / SQL Server 建议在 SQL 中写 RETURNING / OUTPUT。
 *
 * @example
 * @Insert("INSERT INTO user(name) VALUES(#{name})", { datasource: "pg" })
 */
exports.Insert = createSqlMethodDecorator("insert");
/**
 * @Update("UPDATE user SET name = #{name} WHERE id = #{id}")
 * 返回 affectedRows。
 */
exports.Update = createSqlMethodDecorator("update");
/**
 * @Delete("DELETE FROM user WHERE id = #{id}")
 * 返回 affectedRows（物理删除；逻辑删除请用 BaseMapper.delete*）。
 */
exports.Delete = createSqlMethodDecorator("delete");
