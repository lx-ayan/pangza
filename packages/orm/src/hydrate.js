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
exports.buildRowParamContext = buildRowParamContext;
exports.hydrateFieldSelects = hydrateFieldSelects;
exports.hydrateRelations = hydrateRelations;
var Db_1 = require("./Db");
var entityDecorators_1 = require("./entityDecorators");
var fieldSelect_1 = require("./fieldSelect");
var resultMap_1 = require("./resultMap");
var relation_1 = require("./relation");
var sqlTemplate_1 = require("./sqlTemplate");
function snakeToCamel(key) {
    return key.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); });
}
function camelToSnake(key) {
    return key.replace(/[A-Z]/g, function (c) { return "_".concat(c.toLowerCase()); });
}
/**
 * 把父行做成 SQL 参数上下文：同时提供属性名 / 列名 / camel / snake，
 * 便于 #{id}、#{parentId}、#{parent_id} 都能取到值。
 */
function buildRowParamContext(row, entity) {
    var ctx = __assign({}, row);
    for (var _i = 0, _a = Object.entries(row); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        ctx[snakeToCamel(k)] = v;
        ctx[camelToSnake(k)] = v;
    }
    if (entity) {
        for (var _c = 0, _d = (0, entityDecorators_1.getEntityFields)(entity); _c < _d.length; _c++) {
            var f = _d[_c];
            var val = row[f.property] !== undefined ? row[f.property] : row[f.column];
            if (val !== undefined) {
                ctx[f.property] = val;
                ctx[f.column] = val;
            }
        }
    }
    return ctx;
}
function pickColumn(rows, column) {
    return rows.map(function (r) {
        if (Object.prototype.hasOwnProperty.call(r, column))
            return r[column];
        var camel = snakeToCamel(column);
        if (Object.prototype.hasOwnProperty.call(r, camel))
            return r[camel];
        var snake = camelToSnake(column);
        if (Object.prototype.hasOwnProperty.call(r, snake))
            return r[snake];
        var values = Object.values(r);
        return values.length === 1 ? values[0] : undefined;
    });
}
function selectListIncludes(sql, column) {
    var matched = sql.match(/\bselect\s+([\s\S]+?)\s+from\b/i);
    if (!matched)
        return false;
    var raw = matched[1].trim();
    if (raw === "*" || /(^|,)\s*\*/.test(raw))
        return true;
    var wanted = new Set([
        column.toLowerCase(),
        snakeToCamel(column).toLowerCase(),
        camelToSnake(column).toLowerCase(),
    ]);
    return raw.split(",").some(function (part) {
        var _a;
        var piece = (_a = part.trim().split(/\s+/).pop()) !== null && _a !== void 0 ? _a : "";
        var name = piece.replace(/[`"]/g, "").split(".").pop().toLowerCase();
        return wanted.has(name);
    });
}
/**
 * 仅当 SQL 是单条 SELECT、恰好一处 `列 = #{参数}`、且结果里带该列时，
 * 才能改写成 IN 后按父键分组。子查询 / LIMIT 会改变语义，不合并。
 */
function tryBatchPlan(sql) {
    var template = sql.trim();
    if (template.includes("${"))
        return null;
    if ((template.match(/\bselect\b/gi) || []).length !== 1)
        return null;
    if (/\blimit\b/i.test(template))
        return null;
    var hashes = __spreadArray([], template.matchAll(/#\{([^}]+)\}/g), true);
    if (hashes.length !== 1)
        return null;
    var param = hashes[0][1].split(",")[0].trim();
    if (!/^[A-Za-z_][\w]*$/.test(param))
        return null;
    var eq = new RegExp("(?:[A-Za-z_][\\w]*\\.)?([A-Za-z_][\\w]*)\\s*=\\s*#\\{\\s*".concat(param, "\\s*(?:,[^}]*)?\\}"), "i");
    var found = eq.exec(template);
    if (!found)
        return null;
    var column = found[1];
    if (!selectListIncludes(template, column))
        return null;
    var ident = found[0].split("=")[0].trim();
    return {
        column: column,
        param: param,
        template: template.replace(eq, "".concat(ident, " IN (__IN__)")),
    };
}
function readFk(row, column) {
    if (Object.prototype.hasOwnProperty.call(row, column))
        return row[column];
    var camel = snakeToCamel(column);
    if (Object.prototype.hasOwnProperty.call(row, camel))
        return row[camel];
    var snake = camelToSnake(column);
    if (Object.prototype.hasOwnProperty.call(row, snake))
        return row[snake];
    return undefined;
}
function childObjects(mapped) {
    var list = Array.isArray(mapped)
        ? mapped
        : mapped && typeof mapped === "object"
            ? [mapped]
            : [];
    return list.filter(function (row) {
        return !!row && typeof row === "object" && !Array.isArray(row);
    });
}
function resolveHydrateDatasource(meta, options) {
    var _a, _b;
    if ((_a = meta.datasource) === null || _a === void 0 ? void 0 : _a.trim())
        return meta.datasource.trim();
    if (meta.db)
        return Db_1.default.findByType(meta.db);
    return ((_b = options === null || options === void 0 ? void 0 : options.datasource) !== null && _b !== void 0 ? _b : "default").trim() || "default";
}
function queryIn(template, ids, datasource) {
    return __awaiter(this, void 0, void 0, function () {
        var all, size, i, chunk, sql, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    all = [];
                    size = 500;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < ids.length)) return [3 /*break*/, 4];
                    chunk = ids.slice(i, i + size);
                    sql = template.replace("__IN__", chunk.map(function () { return "?"; }).join(", "));
                    return [4 /*yield*/, Db_1.default.queryOn(datasource, sql, chunk)];
                case 2:
                    result = (_a.sent());
                    all.push.apply(all, (0, resultMap_1.mapResultRows)(result));
                    _a.label = 3;
                case 3:
                    i += size;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, all];
            }
        });
    });
}
function mapSelectResult(rows, meta) {
    var _a, _b;
    if (meta.column) {
        var values = pickColumn(rows, meta.column);
        return meta.many ? values : ((_a = values[0]) !== null && _a !== void 0 ? _a : null);
    }
    if (meta.many)
        return rows;
    return (_b = rows[0]) !== null && _b !== void 0 ? _b : null;
}
function filterMetas(metas, options) {
    var _a;
    var list = metas;
    if (!(options === null || options === void 0 ? void 0 : options.includeLazy)) {
        list = list.filter(function (m) { return m.eager; });
    }
    if ((_a = options === null || options === void 0 ? void 0 : options.properties) === null || _a === void 0 ? void 0 : _a.length) {
        var allow_1 = new Set(options.properties);
        list = list.filter(function (m) { return allow_1.has(m.property); });
    }
    return list;
}
function hydrateOne(row, entity, metas, remainingDepth, options) {
    return __awaiter(this, void 0, void 0, function () {
        var ctx;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!metas.length)
                        return [2 /*return*/];
                    ctx = buildRowParamContext(row, entity);
                    return [4 /*yield*/, Promise.all(metas.map(function (meta) { return __awaiter(_this, void 0, void 0, function () {
                            var parsed, ds, result, rows, mapped, childDepth, childRows, objectRows, err_1, msg;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 4, , 5]);
                                        parsed = (0, sqlTemplate_1.parseMybatisSql)(meta.sql, ctx);
                                        ds = resolveHydrateDatasource(meta, options);
                                        return [4 /*yield*/, Db_1.default.queryOn(ds, parsed.sql, parsed.params)];
                                    case 1:
                                        result = (_a.sent());
                                        rows = (0, resultMap_1.mapResultRows)(result);
                                        mapped = mapSelectResult(rows, meta);
                                        row[meta.property] = mapped;
                                        childDepth = Math.min(meta.depth, remainingDepth);
                                        if (!(childDepth > 0 && mapped)) return [3 /*break*/, 3];
                                        childRows = Array.isArray(mapped)
                                            ? mapped
                                            : typeof mapped === "object"
                                                ? [mapped]
                                                : [];
                                        objectRows = childRows.filter(function (r) {
                                            return !!r && typeof r === "object" && !Array.isArray(r);
                                        });
                                        if (!objectRows.length) return [3 /*break*/, 3];
                                        return [4 /*yield*/, hydrateFieldSelects(entity, objectRows, __assign(__assign({}, options), { maxDepth: childDepth - 1, includeLazy: true }))];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [3 /*break*/, 5];
                                    case 4:
                                        err_1 = _a.sent();
                                        msg = err_1 instanceof Error ? err_1.message : String(err_1);
                                        throw new Error("[FieldSelect] ".concat(entity.name || "Entity", ".").concat(meta.property, " \u586B\u5145\u5931\u8D25: ").concat(msg));
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function hydrateBatch(rows, entity, meta, plan, remainingDepth, options) {
    return __awaiter(this, void 0, void 0, function () {
        var keyOf, ids, seen, _i, rows_1, row, id, key, groups, queried, err_2, msg, _a, queried_1, child, key, bucket, nested, childDepth, _b, rows_2, row, key, matched, mapped;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    keyOf = function (value) {
                        return value === undefined || value === null ? undefined : String(value);
                    };
                    ids = [];
                    seen = new Set();
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        id = readFk(row, plan.param);
                        key = keyOf(id);
                        if (key === undefined || seen.has(key))
                            continue;
                        seen.add(key);
                        ids.push(id);
                    }
                    groups = new Map();
                    if (!ids.length) return [3 /*break*/, 5];
                    queried = void 0;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, queryIn(plan.template, ids, resolveHydrateDatasource(meta, options))];
                case 2:
                    queried = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _d.sent();
                    msg = err_2 instanceof Error ? err_2.message : String(err_2);
                    throw new Error("[FieldSelect] ".concat(entity.name || "Entity", ".").concat(meta.property, " \u6279\u91CF\u586B\u5145\u5931\u8D25: ").concat(msg));
                case 4:
                    for (_a = 0, queried_1 = queried; _a < queried_1.length; _a++) {
                        child = queried_1[_a];
                        key = keyOf(readFk(child, plan.column));
                        if (key === undefined)
                            continue;
                        bucket = groups.get(key);
                        if (bucket)
                            bucket.push(child);
                        else
                            groups.set(key, [child]);
                    }
                    _d.label = 5;
                case 5:
                    nested = [];
                    childDepth = Math.min(meta.depth, remainingDepth);
                    for (_b = 0, rows_2 = rows; _b < rows_2.length; _b++) {
                        row = rows_2[_b];
                        key = keyOf(readFk(row, plan.param));
                        matched = key === undefined ? [] : ((_c = groups.get(key)) !== null && _c !== void 0 ? _c : []);
                        mapped = mapSelectResult(matched, meta);
                        row[meta.property] = mapped;
                        if (childDepth > 0)
                            nested.push.apply(nested, childObjects(mapped));
                    }
                    if (!nested.length) return [3 /*break*/, 7];
                    return [4 /*yield*/, hydrateFieldSelects(entity, nested, __assign(__assign({}, options), { maxDepth: childDepth - 1, includeLazy: true }))];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
function collectMetas(entity, opts) {
    var _a, _b;
    var fieldMetas = filterMetas((0, fieldSelect_1.getFieldSelects)(entity), opts);
    if (opts.relations === false) {
        return fieldMetas;
    }
    var rels = (0, relation_1.getRelations)(entity);
    if (Array.isArray(opts.relations)) {
        var allow_2 = new Set(opts.relations);
        rels = rels.filter(function (r) { return allow_2.has(r.property); });
    }
    else if (!opts.includeLazy) {
        rels = rels.filter(function (r) { return r.eager; });
    }
    var dialect = Db_1.default.getDialect(((_a = opts.datasource) !== null && _a !== void 0 ? _a : "default").trim() || "default");
    var relMetas = rels.map(function (r) { return (0, relation_1.relationToFieldSelect)(entity, r, dialect); });
    // 指定 properties 时字段 @Select 已过滤；关联若用 relations: string[] 已过滤
    if (((_b = opts.properties) === null || _b === void 0 ? void 0 : _b.length) && !Array.isArray(opts.relations)) {
        var allow = new Set(opts.properties);
        return __spreadArray(__spreadArray([], fieldMetas, true), filterMetas(relMetas, __assign(__assign({}, opts), { properties: __spreadArray([], allow, true) })), true);
    }
    return __spreadArray(__spreadArray([], fieldMetas, true), relMetas, true);
}
/**
 * 按实体上的字段 @Select 与声明式关联填充（原地修改 rows）。
 * `列 = #{父字段}` 且无子查询 / LIMIT 时合并成一条 IN，避免列表 N+1。
 *
 * @example
 * await hydrateFieldSelects(MenuEntity, rows);
 * await hydrateFieldSelects(MenuEntity, rows, { includeLazy: true, properties: ['children'] });
 */
function hydrateFieldSelects(entity_1, rows_3) {
    return __awaiter(this, arguments, void 0, function (entity, rows, options) {
        var opts, maxDepth, metas, batchJobs, rowWise, _i, metas_1, meta, plan;
        var _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!entity || !(rows === null || rows === void 0 ? void 0 : rows.length))
                        return [2 /*return*/, rows];
                    opts = typeof options === "number" ? { maxDepth: options } : options !== null && options !== void 0 ? options : {};
                    maxDepth = (_a = opts.maxDepth) !== null && _a !== void 0 ? _a : 32;
                    metas = collectMetas(entity, opts);
                    if (!metas.length)
                        return [2 /*return*/, rows];
                    batchJobs = [];
                    rowWise = [];
                    for (_i = 0, metas_1 = metas; _i < metas_1.length; _i++) {
                        meta = metas_1[_i];
                        plan = tryBatchPlan(meta.sql);
                        if (plan)
                            batchJobs.push({ meta: meta, plan: plan });
                        else
                            rowWise.push(meta);
                    }
                    return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], batchJobs.map(function (job) {
                            return hydrateBatch(rows, entity, job.meta, job.plan, maxDepth, opts);
                        }), true), [
                            rowWise.length
                                ? Promise.all(rows.map(function (row) {
                                    return hydrateOne(row, entity, rowWise, maxDepth, opts);
                                }))
                                : Promise.resolve(),
                        ], false))];
                case 1:
                    _b.sent();
                    return [2 /*return*/, rows];
            }
        });
    });
}
/**
 * 显式按关联名水合（含 lazy）。等价于
 * `hydrateFieldSelects(entity, rows, { relations: names, includeLazy: true })`。
 */
function hydrateRelations(entity_1, rows_3) {
    return __awaiter(this, arguments, void 0, function (entity, rows, options) {
        var relations;
        var _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            if (!entity)
                return [2 /*return*/, rows];
            relations = options.relations === false
                ? false
                : Array.isArray(options.relations)
                    ? options.relations
                    : (0, relation_1.getRelations)(entity).map(function (r) { return r.property; });
            return [2 /*return*/, hydrateFieldSelects(entity, rows, __assign(__assign({}, options), { relations: relations, includeLazy: (_a = options.includeLazy) !== null && _a !== void 0 ? _a : true }))];
        });
    });
}
