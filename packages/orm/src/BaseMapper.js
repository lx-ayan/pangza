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
exports.BaseMapper = void 0;
var Db_1 = require("./Db");
var config_1 = require("./config");
var entityDecorators_1 = require("./entityDecorators");
var errors_1 = require("./errors");
var fill_1 = require("./fill");
var hydrate_1 = require("./hydrate");
var identifier_1 = require("./identifier");
var IdType_1 = require("./IdType");
var QueryWrapper_1 = require("./QueryWrapper");
var resultMap_1 = require("./resultMap");
var security_1 = require("./security");
/**
 * 通用 Mapper（对齐 MyBatis-Plus BaseMapper）
 * 支持逻辑删除、自动填充、乐观锁（均可配置开关）。
 */
var BaseMapper = /** @class */ (function () {
    function BaseMapper(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.columnNames = null;
        var global = (0, config_1.getOrmConfig)();
        var datasource = ((_a = options.datasource) !== null && _a !== void 0 ? _a : "default").trim() || "default";
        this.opts = {
            table: (0, security_1.assertIdent)(options.table),
            idField: (0, security_1.assertIdent)((_b = options.idField) !== null && _b !== void 0 ? _b : "id"),
            datasource: datasource,
            logicDeleteExplicit: options.logicDelete,
            logicDeleteField: (0, security_1.assertIdent)((_c = options.logicDeleteField) !== null && _c !== void 0 ? _c : global.logicDeleteField),
            logicDeleteValue: (_d = options.logicDeleteValue) !== null && _d !== void 0 ? _d : global.logicDeleteValue,
            logicNotDeleteValue: (_e = options.logicNotDeleteValue) !== null && _e !== void 0 ? _e : global.logicNotDeleteValue,
            optimisticLockExplicit: options.optimisticLock,
            versionField: (0, security_1.assertIdent)((_f = options.versionField) !== null && _f !== void 0 ? _f : global.versionField),
            fill: (_g = options.fill) !== null && _g !== void 0 ? _g : true,
            updateNullStrategy: (_h = options.updateNullStrategy) !== null && _h !== void 0 ? _h : "INCLUDE",
            entity: options.entity,
        };
        this.dialect = Db_1.default.getDialect(datasource);
    }
    /** 更新字段是否参与 SET（undefined 永不参与；null 受 updateNullStrategy 控制） */
    BaseMapper.prototype.shouldWriteUpdateValue = function (value) {
        if (value === undefined)
            return false;
        if (value === null && this.opts.updateNullStrategy === "IGNORE") {
            return false;
        }
        return true;
    };
    BaseMapper.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                return [2 /*return*/, Db_1.default.queryOn(this.opts.datasource, sql, params)];
            });
        });
    };
    BaseMapper.prototype.tx = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Db_1.default.transactionOn(this.opts.datasource, fn)];
            });
        });
    };
    BaseMapper.prototype.cfg = function () {
        return (0, config_1.getOrmConfig)();
    };
    /** 是否启用逻辑删除（表级优先，否则读全局） */
    BaseMapper.prototype.isLogicDelete = function () {
        var _a;
        return (_a = this.opts.logicDeleteExplicit) !== null && _a !== void 0 ? _a : this.cfg().logicDelete;
    };
    /** 是否启用乐观锁（表级优先，否则读全局） */
    BaseMapper.prototype.isOptimisticLock = function () {
        var _a;
        return (_a = this.opts.optimisticLockExplicit) !== null && _a !== void 0 ? _a : this.cfg().optimisticLock;
    };
    /** 未删除条件（对齐 MyBatis-Plus：字段 = 未删除值） */
    BaseMapper.prototype.notDeletedClause = function () {
        var col = this.colSql(this.opts.logicDeleteField);
        return {
            sql: "".concat(col, " = ?"),
            params: [this.opts.logicNotDeleteValue],
        };
    };
    BaseMapper.prototype.tableSql = function () {
        return this.dialect.quoteIdent(this.opts.table);
    };
    BaseMapper.prototype.idSql = function () {
        return this.dialect.quoteIdent(this.opts.idField);
    };
    BaseMapper.prototype.colSql = function (name) {
        return this.dialect.quoteIdent((0, security_1.assertIdent)(name));
    };
    /**
     * 把实体属性名映射为列名，并去掉 exist:false 字段，
     * 避免 createTime / create_time 双键写入 SQL。
     */
    BaseMapper.prototype.normalizeEntityRow = function (row) {
        if (!this.opts.entity)
            return row;
        var fields = (0, entityDecorators_1.getEntityFields)(this.opts.entity);
        if (!fields.length)
            return row;
        var out = __assign({}, row);
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var f = fields_1[_i];
            if (!f.exist) {
                delete out[f.property];
                delete out[f.column];
                continue;
            }
            if (f.property !== f.column &&
                out[f.property] !== undefined &&
                out[f.column] === undefined) {
                out[f.column] = out[f.property];
            }
            if (f.property !== f.column) {
                delete out[f.property];
            }
        }
        return out;
    };
    BaseMapper.prototype.getColumnNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sql, params, rows, names;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.columnNames)
                            return [2 /*return*/, this.columnNames];
                        _a = this.dialect.listColumnsSql(this.opts.table), sql = _a.sql, params = _a.params;
                        return [4 /*yield*/, this.query(sql, params)];
                    case 1:
                        rows = (_b.sent());
                        names = this.dialect
                            .parseColumnNames(rows)
                            .filter(Boolean);
                        this.columnNames = new Set(names);
                        return [2 /*return*/, this.columnNames];
                }
            });
        });
    };
    /** 表上不存在的自动填充字段直接丢掉，避免 Unknown column */
    BaseMapper.prototype.stripMissingFillFields = function (row) {
        return __awaiter(this, void 0, void 0, function () {
            var cols, cfg, _i, _a, field;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getColumnNames()];
                    case 1:
                        cols = _b.sent();
                        cfg = this.cfg();
                        for (_i = 0, _a = [
                            cfg.fillCreateTime,
                            cfg.fillUpdateTime,
                            cfg.fillCreateBy,
                            cfg.fillUpdateBy,
                        ]; _i < _a.length; _i++) {
                            field = _a[_i];
                            if (field && row[field] !== undefined && !cols.has(field)) {
                                delete row[field];
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseMapper.prototype.assertLogicDeleteColumn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cols, field;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isLogicDelete())
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getColumnNames()];
                    case 1:
                        cols = _a.sent();
                        field = this.opts.logicDeleteField;
                        if (!cols.has(field)) {
                            throw new Error("[ORM] \u8868 ".concat(this.opts.table, "\uFF08\u6570\u636E\u6E90 ").concat(this.opts.datasource, "\uFF09\u6CA1\u6709\u903B\u8F91\u5220\u9664\u5217 ").concat(field, "\u3002") +
                                "\u8BF7 ALTER TABLE \u589E\u52A0\u8BE5\u5217\uFF0C\u6216 @Mapper / table(..., { logicDelete: false })\u3002" +
                                "\u5F53\u524D\u8868\u5217: ".concat(__spreadArray([], cols, true).join(", ") || "(空)"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /** 追加未删除条件（不修改调用方 wrapper） */
    BaseMapper.prototype.withLogic = function (wrapper) {
        var src = wrapper !== null && wrapper !== void 0 ? wrapper : new QueryWrapper_1.QueryWrapper(this.dialect);
        if (!this.isLogicDelete() || src.isIgnoreLogicDelete()) {
            return src;
        }
        return src
            .clone()
            .eq(this.opts.logicDeleteField, this.opts.logicNotDeleteValue);
    };
    BaseMapper.prototype.hydrateOpts = function (query) {
        if ((query === null || query === void 0 ? void 0 : query.relations) === false) {
            return {
                datasource: this.opts.datasource,
                relations: false,
                properties: [],
            };
        }
        if (Array.isArray(query === null || query === void 0 ? void 0 : query.relations)) {
            return {
                datasource: this.opts.datasource,
                relations: query.relations,
                includeLazy: true,
                properties: query.relations,
            };
        }
        return { datasource: this.opts.datasource };
    };
    BaseMapper.prototype.normalizeListArgs = function (wrapperOrOptions, limitOrOptions) {
        var _a;
        if (wrapperOrOptions &&
            typeof wrapperOrOptions === "object" &&
            !(wrapperOrOptions instanceof QueryWrapper_1.QueryWrapper) &&
            ("relations" in wrapperOrOptions || "limit" in wrapperOrOptions)) {
            return { options: wrapperOrOptions };
        }
        if (typeof limitOrOptions === "number") {
            return {
                wrapper: wrapperOrOptions,
                options: { limit: limitOrOptions },
            };
        }
        return {
            wrapper: wrapperOrOptions,
            options: (_a = limitOrOptions) !== null && _a !== void 0 ? _a : {},
        };
    };
    /** 按主键查询 */
    BaseMapper.prototype.selectById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.selectOne(new QueryWrapper_1.QueryWrapper(this.dialect).eq(this.opts.idField, id), options)];
            });
        });
    };
    /** 条件查询单条 */
    BaseMapper.prototype.selectOne = function (wrapper, options) {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.selectList(wrapper, __assign(__assign({}, options), { limit: (_a = options === null || options === void 0 ? void 0 : options.limit) !== null && _a !== void 0 ? _a : 1 }))];
                    case 1:
                        list = _c.sent();
                        return [2 /*return*/, (_b = list[0]) !== null && _b !== void 0 ? _b : null];
                }
            });
        });
    };
    /** WHERE + GROUP BY + HAVING + ORDER BY + LAST（去多余空格） */
    BaseMapper.prototype.fragTail = function (frag) {
        return "".concat(frag.whereSql, " ").concat(frag.groupSql, " ").concat(frag.havingSql, " ").concat(frag.orderSql, " ").concat(frag.lastSql)
            .replace(/\s+/g, " ")
            .trim();
    };
    /** 有 GROUP BY 时用子查询计组数，否则普通 COUNT */
    BaseMapper.prototype.countSqlFromFrag = function (frag) {
        if (frag.groupSql) {
            var inner = "".concat(frag.whereSql, " ").concat(frag.groupSql, " ").concat(frag.havingSql, " ").concat(frag.lastSql)
                .replace(/\s+/g, " ")
                .trim();
            return "SELECT COUNT(1) AS cnt FROM (SELECT 1 FROM ".concat(this.tableSql(), " ").concat(inner, ") AS _g");
        }
        return "SELECT COUNT(1) AS cnt FROM ".concat(this.tableSql(), " ").concat(frag.whereSql, " ").concat(frag.lastSql)
            .replace(/\s+/g, " ")
            .trim();
    };
    /**
     * 条件查询列表。
     * @param limitOrOptions 数字 limit，或 `{ limit, relations }`
     */
    BaseMapper.prototype.selectList = function (wrapper, limitOrOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, w, options, frag, sql, params, limit, n, hasOrder, rows, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.normalizeListArgs(wrapper, limitOrOptions), w = _a.wrapper, options = _a.options;
                        return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _c.sent();
                        frag = this.withLogic(w).build();
                        sql = "SELECT ".concat(frag.selectSql, " FROM ").concat(this.tableSql(), " ").concat(this.fragTail(frag)).trim();
                        params = __spreadArray([], frag.params, true);
                        limit = options.limit;
                        if (limit != null) {
                            n = (0, security_1.assertSafeUint)(limit, "limit");
                            hasOrder = /\bORDER\s+BY\b/i.test(sql);
                            sql = this.dialect.appendLimitOffset(sql, n, 0, hasOrder);
                        }
                        _b = resultMap_1.mapResultRows;
                        return [4 /*yield*/, this.query(sql, params)];
                    case 2:
                        rows = _b.apply(void 0, [(_c.sent())]);
                        return [2 /*return*/, (0, hydrate_1.hydrateFieldSelects)(this.opts.entity, rows, this.hydrateOpts(options))];
                }
            });
        });
    };
    /** 条件计数（含 GROUP BY 时返回分组行数） */
    BaseMapper.prototype.selectCount = function (wrapper) {
        return __awaiter(this, void 0, void 0, function () {
            var frag, sql, rows;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _e.sent();
                        frag = this.withLogic(wrapper).build();
                        sql = this.countSqlFromFrag(frag);
                        return [4 /*yield*/, this.query(sql, frag.params)];
                    case 2:
                        rows = _e.sent();
                        return [2 /*return*/, Number((_d = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.cnt) !== null && _b !== void 0 ? _b : (_c = rows[0]) === null || _c === void 0 ? void 0 : _c.CNT) !== null && _d !== void 0 ? _d : 0)];
                }
            });
        });
    };
    /** 分页查询 */
    BaseMapper.prototype.selectPage = function () {
        return __awaiter(this, arguments, void 0, function (page, wrapper, options) {
            var current, size, offset, frag, countSql, listSql, hasOrder, _a, countRows, listRows, records;
            var _b;
            var _c, _d, _e, _f, _g, _h;
            if (page === void 0) { page = {}; }
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        current = (0, security_1.assertSafeUint)(Math.max(1, (_c = page.current) !== null && _c !== void 0 ? _c : 1), "current");
                        size = (0, security_1.assertSafeUint)(Math.max(1, (_d = page.size) !== null && _d !== void 0 ? _d : 10), "size");
                        offset = (0, security_1.assertSafeUint)((current - 1) * size, "offset");
                        return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _j.sent();
                        frag = this.withLogic(wrapper).build();
                        countSql = this.countSqlFromFrag(frag);
                        listSql = "SELECT ".concat(frag.selectSql, " FROM ").concat(this.tableSql(), " ").concat(this.fragTail(frag)).trim();
                        hasOrder = /\bORDER\s+BY\b/i.test(listSql);
                        listSql = this.dialect.appendLimitOffset(listSql, size, offset, hasOrder);
                        return [4 /*yield*/, Promise.all([
                                this.query(countSql, frag.params),
                                this.query(listSql, frag.params),
                            ])];
                    case 2:
                        _a = _j.sent(), countRows = _a[0], listRows = _a[1];
                        records = (0, resultMap_1.mapResultRows)(listRows);
                        _b = {};
                        return [4 /*yield*/, (0, hydrate_1.hydrateFieldSelects)(this.opts.entity, records, this.hydrateOpts(options))];
                    case 3: return [2 /*return*/, (_b.records = _j.sent(),
                            _b.total = Number((_h = (_f = (_e = countRows[0]) === null || _e === void 0 ? void 0 : _e.cnt) !== null && _f !== void 0 ? _f : (_g = countRows[0]) === null || _g === void 0 ? void 0 : _g.CNT) !== null && _h !== void 0 ? _h : 0),
                            _b.current = current,
                            _b.size = size,
                            _b)];
                }
            });
        });
    };
    /** 解析有效主键策略 */
    BaseMapper.prototype.resolveIdType = function () {
        var _a, _b;
        var idMeta = this.opts.entity
            ? (0, entityDecorators_1.getEntityIdField)(this.opts.entity)
            : undefined;
        var annotated = (_a = idMeta === null || idMeta === void 0 ? void 0 : idMeta.idType) !== null && _a !== void 0 ? _a : IdType_1.IdType.NONE;
        if (annotated !== IdType_1.IdType.NONE)
            return annotated;
        return (0, IdType_1.resolveIdType)((_b = this.cfg().idType) !== null && _b !== void 0 ? _b : IdType_1.IdType.AUTO);
    };
    /** 插入前按 IdType 填充 / 剥离主键 */
    BaseMapper.prototype.applyIdOnInsert = function (row, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var idType, col, prop, current, gen, _a, _b, _c, _d;
            var _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        idType = this.resolveIdType();
                        col = this.opts.idField;
                        prop = this.opts.entity != null
                            ? ((_f = (_e = (0, entityDecorators_1.getEntityIdField)(this.opts.entity)) === null || _e === void 0 ? void 0 : _e.property) !== null && _f !== void 0 ? _f : col)
                            : col;
                        current = row[col] !== undefined
                            ? row[col]
                            : row[prop] !== undefined
                                ? row[prop]
                                : (_g = entity === null || entity === void 0 ? void 0 : entity[prop]) !== null && _g !== void 0 ? _g : entity === null || entity === void 0 ? void 0 : entity[col];
                        if (idType === IdType_1.IdType.AUTO) {
                            // 数据库自增：不写入 id 列（已有值则保留，兼容显式指定）
                            if (current === undefined || current === null || current === "") {
                                delete row[col];
                                if (prop !== col)
                                    delete row[prop];
                            }
                            return [2 /*return*/];
                        }
                        if (idType === IdType_1.IdType.INPUT) {
                            return [2 /*return*/];
                        }
                        if (current !== undefined && current !== null && current !== "") {
                            row[col] = current;
                            return [2 /*return*/];
                        }
                        gen = (0, identifier_1.getIdentifierGenerator)();
                        if (!(idType === IdType_1.IdType.ASSIGN_ID)) return [3 /*break*/, 2];
                        _a = row;
                        _b = col;
                        return [4 /*yield*/, gen.nextId(entity)];
                    case 1:
                        _a[_b] = _h.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!(idType === IdType_1.IdType.ASSIGN_UUID)) return [3 /*break*/, 4];
                        _c = row;
                        _d = col;
                        return [4 /*yield*/, gen.nextUUID(entity)];
                    case 3:
                        _c[_d] = _h.sent();
                        _h.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** 把生成的主键回写到原始实体 */
    BaseMapper.prototype.writeBackId = function (entity, normalized, insertId) {
        var _a, _b;
        var col = this.opts.idField;
        var prop = this.opts.entity != null
            ? ((_b = (_a = (0, entityDecorators_1.getEntityIdField)(this.opts.entity)) === null || _a === void 0 ? void 0 : _a.property) !== null && _b !== void 0 ? _b : col)
            : col;
        var idType = this.resolveIdType();
        var value = normalized[col];
        if ((value === undefined || value === null) &&
            idType === IdType_1.IdType.AUTO &&
            insertId) {
            value = insertId;
        }
        if (value === undefined || value === null)
            return;
        entity[prop] = value;
        if (prop !== col) {
            entity[col] = value;
        }
    };
    /** 插入，返回自增 id（若有）；ASSIGN_* 时尽量回写实体并返回可解析的数字 */
    BaseMapper.prototype.insert = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, insertId, back;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.prepareInsertRow(entity)];
                    case 2:
                        normalized = _a.sent();
                        return [4 /*yield*/, this.insertOne(normalized)];
                    case 3:
                        insertId = _a.sent();
                        this.writeBackId(entity, normalized, insertId);
                        back = entity[this.opts.idField];
                        if (insertId)
                            return [2 /*return*/, insertId];
                        if (typeof back === "number")
                            return [2 /*return*/, back];
                        if (typeof back === "string" && /^\d+$/.test(back))
                            return [2 /*return*/, Number(back)];
                        return [2 /*return*/, 0];
                }
            });
        });
    };
    /**
     * 批量插入，返回影响行数。
     * 多行一条 INSERT，按 `orm.batch.insertSize`（默认 200）分批。
     */
    BaseMapper.prototype.saveBatch = function (entities) {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        list = (entities !== null && entities !== void 0 ? entities : []).filter(function (item) { return item != null && typeof item === "object"; });
                        if (list.length === 0)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.tx(function () { return __awaiter(_this, void 0, void 0, function () {
                                var rows, _i, list_1, entity, normalized, batchSize, affected, i, _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            rows = [];
                                            _i = 0, list_1 = list;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < list_1.length)) return [3 /*break*/, 4];
                                            entity = list_1[_i];
                                            return [4 /*yield*/, this.prepareInsertRow(entity)];
                                        case 2:
                                            normalized = _c.sent();
                                            rows.push(normalized);
                                            // ASSIGN_* 已写入 normalized，回写实体；AUTO 批量不回填单条 id
                                            this.writeBackId(entity, normalized, 0);
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4:
                                            batchSize = Math.max(1, (_b = this.cfg().batchInsertSize) !== null && _b !== void 0 ? _b : 200);
                                            affected = 0;
                                            i = 0;
                                            _c.label = 5;
                                        case 5:
                                            if (!(i < rows.length)) return [3 /*break*/, 8];
                                            _a = affected;
                                            return [4 /*yield*/, this.insertMany(rows.slice(i, i + batchSize))];
                                        case 6:
                                            affected = _a + _c.sent();
                                            _c.label = 7;
                                        case 7:
                                            i += batchSize;
                                            return [3 /*break*/, 5];
                                        case 8: return [2 /*return*/, affected];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    BaseMapper.prototype.prepareInsertRow = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var row, normalized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        row = __assign({}, entity);
                        return [4 /*yield*/, (0, fill_1.applyInsertFill)(row, this.cfg(), this.opts.fill)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, entityDecorators_1.applyEntityFieldFills)(this.opts.entity, row, "insert")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.applyIdOnInsert(row, entity)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.stripMissingFillFields(row)];
                    case 4:
                        _a.sent();
                        normalized = this.normalizeEntityRow(row);
                        if (this.isLogicDelete() &&
                            normalized[this.opts.logicDeleteField] === undefined) {
                            normalized[this.opts.logicDeleteField] = this.opts.logicNotDeleteValue;
                        }
                        if (this.isOptimisticLock() &&
                            normalized[this.opts.versionField] === undefined) {
                            normalized[this.opts.versionField] = 1;
                        }
                        return [2 /*return*/, normalized];
                }
            });
        });
    };
    BaseMapper.prototype.insertOne = function (normalized) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, safeKeys, cols, placeholders, values, baseSql, prepared, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(normalized).filter(function (k) { return normalized[k] !== undefined; });
                        if (keys.length === 0) {
                            throw new Error("insert 实体不能为空");
                        }
                        safeKeys = keys.map(security_1.assertIdent);
                        cols = safeKeys.map(function (k) { return _this.dialect.quoteIdent(k); }).join(", ");
                        placeholders = safeKeys.map(function () { return "?"; }).join(", ");
                        values = safeKeys.map(function (k) { return normalized[k]; });
                        baseSql = "INSERT INTO ".concat(this.tableSql(), " (").concat(cols, ") VALUES (").concat(placeholders, ")");
                        prepared = this.dialect.prepareInsert(baseSql, this.opts.idField);
                        return [4 /*yield*/, this.query(prepared.sql, values)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.dialect.extractInsertId(result, this.opts.idField, prepared.returning)];
                }
            });
        });
    };
    /** 多行同一列集合；缺省列写 NULL */
    BaseMapper.prototype.insertMany = function (rows) {
        return __awaiter(this, void 0, void 0, function () {
            var keySet, _i, rows_1, row, _a, _b, key, keys, safeKeys, cols, rowPlaceholder, values, _c, rows_2, row, _d, safeKeys_1, key, sql, result;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        keySet = new Set();
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            for (_a = 0, _b = Object.keys(row); _a < _b.length; _a++) {
                                key = _b[_a];
                                if (row[key] !== undefined)
                                    keySet.add(key);
                            }
                        }
                        keys = __spreadArray([], keySet, true);
                        if (keys.length === 0) {
                            throw new Error("saveBatch 实体不能为空");
                        }
                        safeKeys = keys.map(security_1.assertIdent);
                        cols = safeKeys.map(function (k) { return _this.dialect.quoteIdent(k); }).join(", ");
                        rowPlaceholder = "(".concat(safeKeys.map(function () { return "?"; }).join(", "), ")");
                        values = [];
                        for (_c = 0, rows_2 = rows; _c < rows_2.length; _c++) {
                            row = rows_2[_c];
                            for (_d = 0, safeKeys_1 = safeKeys; _d < safeKeys_1.length; _d++) {
                                key = safeKeys_1[_d];
                                values.push(row[key] === undefined ? null : row[key]);
                            }
                        }
                        sql = "INSERT INTO ".concat(this.tableSql(), " (").concat(cols, ") VALUES ").concat(rows
                            .map(function () { return rowPlaceholder; })
                            .join(", "));
                        return [4 /*yield*/, this.query(sql, values)];
                    case 1:
                        result = _e.sent();
                        return [2 /*return*/, this.dialect.extractAffectedRows(result)];
                }
            });
        });
    };
    /** 按主键更新（忽略 undefined 字段） */
    BaseMapper.prototype.updateById = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var id, row, normalized, version, keys, sets, values, where, whereParams, nd, sql, result, affected;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = entity[this.opts.idField];
                        if (id === undefined || id === null) {
                            throw new Error("updateById \u7F3A\u5C11\u4E3B\u952E ".concat(this.opts.idField));
                        }
                        row = __assign({}, entity);
                        return [4 /*yield*/, (0, fill_1.applyUpdateFill)(row, this.cfg(), this.opts.fill)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, entityDecorators_1.applyEntityFieldFills)(this.opts.entity, row, "update")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.stripMissingFillFields(row)];
                    case 3:
                        _a.sent();
                        normalized = this.normalizeEntityRow(row);
                        return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 4:
                        _a.sent();
                        version = this.isOptimisticLock() &&
                            normalized[this.opts.versionField] !== undefined
                            ? normalized[this.opts.versionField]
                            : undefined;
                        keys = Object.keys(normalized).filter(function (k) {
                            return k !== _this.opts.idField &&
                                k !== _this.opts.versionField &&
                                _this.shouldWriteUpdateValue(normalized[k]);
                        });
                        sets = keys.map(function (k) { return "".concat(_this.colSql(k), " = ?"); });
                        values = keys.map(function (k) { return normalized[k]; });
                        if (version !== undefined) {
                            sets.push("".concat(this.colSql(this.opts.versionField), " = ").concat(this.colSql(this.opts.versionField), " + 1"));
                        }
                        if (sets.length === 0)
                            return [2 /*return*/, 0];
                        where = "".concat(this.idSql(), " = ?");
                        whereParams = [id];
                        if (version !== undefined) {
                            where += " AND ".concat(this.colSql(this.opts.versionField), " = ?");
                            whereParams.push(version);
                        }
                        if (this.isLogicDelete()) {
                            nd = this.notDeletedClause();
                            where += " AND ".concat(nd.sql);
                            whereParams.push.apply(whereParams, nd.params);
                        }
                        sql = "UPDATE ".concat(this.tableSql(), " SET ").concat(sets.join(", "), " WHERE ").concat(where);
                        return [4 /*yield*/, this.query(sql, __spreadArray(__spreadArray([], values, true), whereParams, true))];
                    case 5:
                        result = _a.sent();
                        affected = this.dialect.extractAffectedRows(result);
                        if (version !== undefined && affected === 0) {
                            throw new errors_1.OptimisticLockError();
                        }
                        return [2 /*return*/, affected];
                }
            });
        });
    };
    /**
     * 有主键且库中存在则 updateById，否则 insert。
     * 返回影响行数（insert / update 语义与各自方法一致）。
     */
    BaseMapper.prototype.saveOrUpdate = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var id, existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = entity[this.opts.idField];
                        if (id === undefined || id === null || id === "") {
                            return [2 /*return*/, this.insert(entity)];
                        }
                        return [4 /*yield*/, this.selectById(id)];
                    case 1:
                        existing = _a.sent();
                        if (!existing) {
                            return [2 /*return*/, this.insert(entity)];
                        }
                        return [2 /*return*/, this.updateById(entity)];
                }
            });
        });
    };
    /**
     * 按主键批量更新（逐条 updateById，同一事务）。
     * 分批大小取 `orm.batch.updateSize`（默认 200）。
     */
    BaseMapper.prototype.updateBatch = function (entities) {
        return __awaiter(this, void 0, void 0, function () {
            var list, batchSize;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                list = (entities !== null && entities !== void 0 ? entities : []).filter(function (item) { return item != null && typeof item === "object"; });
                if (list.length === 0)
                    return [2 /*return*/, 0];
                batchSize = Math.max(1, (_a = this.cfg().batchUpdateSize) !== null && _a !== void 0 ? _a : 200);
                return [2 /*return*/, this.tx(function () { return __awaiter(_this, void 0, void 0, function () {
                        var affected, i, chunk, _i, chunk_1, entity, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    affected = 0;
                                    i = 0;
                                    _b.label = 1;
                                case 1:
                                    if (!(i < list.length)) return [3 /*break*/, 6];
                                    chunk = list.slice(i, i + batchSize);
                                    _i = 0, chunk_1 = chunk;
                                    _b.label = 2;
                                case 2:
                                    if (!(_i < chunk_1.length)) return [3 /*break*/, 5];
                                    entity = chunk_1[_i];
                                    _a = affected;
                                    return [4 /*yield*/, this.updateById(entity)];
                                case 3:
                                    affected = _a + _b.sent();
                                    _b.label = 4;
                                case 4:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 5:
                                    i += batchSize;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/, affected];
                            }
                        });
                    }); })];
            });
        });
    };
    /** 条件更新 */
    BaseMapper.prototype.update = function (entity, wrapper) {
        return __awaiter(this, void 0, void 0, function () {
            var frag, row, normalized, version, keys, sets, values, whereSql, params, sql, result, affected;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _a.sent();
                        frag = this.withLogic(wrapper).build();
                        if (!frag.whereSql) {
                            throw new Error("update 必须带 WHERE 条件，防止全表更新");
                        }
                        row = __assign({}, entity);
                        return [4 /*yield*/, (0, fill_1.applyUpdateFill)(row, this.cfg(), this.opts.fill)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, entityDecorators_1.applyEntityFieldFills)(this.opts.entity, row, "update")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.stripMissingFillFields(row)];
                    case 4:
                        _a.sent();
                        normalized = this.normalizeEntityRow(row);
                        version = this.isOptimisticLock() &&
                            normalized[this.opts.versionField] !== undefined
                            ? normalized[this.opts.versionField]
                            : undefined;
                        keys = Object.keys(normalized).filter(function (k) {
                            return k !== _this.opts.versionField &&
                                _this.shouldWriteUpdateValue(normalized[k]);
                        });
                        sets = keys.map(function (k) { return "".concat(_this.colSql(k), " = ?"); });
                        values = keys.map(function (k) { return normalized[k]; });
                        if (version !== undefined) {
                            sets.push("".concat(this.colSql(this.opts.versionField), " = ").concat(this.colSql(this.opts.versionField), " + 1"));
                        }
                        if (sets.length === 0)
                            return [2 /*return*/, 0];
                        whereSql = frag.whereSql;
                        params = __spreadArray([], frag.params, true);
                        if (version !== undefined) {
                            whereSql += " AND ".concat(this.colSql(this.opts.versionField), " = ?");
                            params.push(version);
                        }
                        sql = "UPDATE ".concat(this.tableSql(), " SET ").concat(sets.join(", "), " ").concat(whereSql, " ").concat(frag.lastSql).trim();
                        return [4 /*yield*/, this.query(sql, __spreadArray(__spreadArray([], values, true), params, true))];
                    case 5:
                        result = _a.sent();
                        affected = this.dialect.extractAffectedRows(result);
                        if (version !== undefined && affected === 0) {
                            throw new errors_1.OptimisticLockError();
                        }
                        return [2 /*return*/, affected];
                }
            });
        });
    };
    /** 按主键删除（开启逻辑删除时改为 UPDATE） */
    BaseMapper.prototype.deleteById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.deleteByIds([id])];
            });
        });
    };
    /**
     * 按主键批量删除，返回影响行数。
     * 开启逻辑删除时一条 UPDATE ... IN (...)，否则物理 DELETE。
     */
    BaseMapper.prototype.deleteByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.deleteByIdsInternal(ids, false)];
            });
        });
    };
    /**
     * 按主键物理删除（始终 DELETE，忽略逻辑删除开关）。
     * 用于彻底清除或回收站清空。
     */
    BaseMapper.prototype.physicalDeleteById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.physicalDeleteByIds([id])];
            });
        });
    };
    /** 按主键批量物理删除 */
    BaseMapper.prototype.physicalDeleteByIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.deleteByIdsInternal(ids, true)];
            });
        });
    };
    /** 条件删除（开启逻辑删除时改为 UPDATE） */
    BaseMapper.prototype.delete = function (wrapper) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.deleteByWrapper(wrapper, false)];
            });
        });
    };
    /**
     * 条件物理删除（始终 DELETE）。
     * 必须带 WHERE；不会自动附加「未删除」条件（可删已逻辑删除行）。
     */
    BaseMapper.prototype.physicalDelete = function (wrapper) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.deleteByWrapper(wrapper, true)];
            });
        });
    };
    BaseMapper.prototype.deleteByIdsInternal = function (ids, physical) {
        return __awaiter(this, void 0, void 0, function () {
            var list, batchSize;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        list = (ids !== null && ids !== void 0 ? ids : []).filter(function (id) { return id !== undefined && id !== null; });
                        if (list.length === 0)
                            return [2 /*return*/, 0];
                        if (!!physical) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        batchSize = Math.max(1, (_a = this.cfg().batchInSize) !== null && _a !== void 0 ? _a : 500);
                        return [2 /*return*/, this.tx(function () { return __awaiter(_this, void 0, void 0, function () {
                                var affected, i, chunk, placeholders, sql, result, nd, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            affected = 0;
                                            i = 0;
                                            _b.label = 1;
                                        case 1:
                                            if (!(i < list.length)) return [3 /*break*/, 6];
                                            chunk = list.slice(i, i + batchSize);
                                            placeholders = chunk.map(function () { return "?"; }).join(", ");
                                            if (!(physical || !this.isLogicDelete())) return [3 /*break*/, 3];
                                            sql = "DELETE FROM ".concat(this.tableSql(), " WHERE ").concat(this.idSql(), " IN (").concat(placeholders, ")");
                                            return [4 /*yield*/, this.query(sql, chunk)];
                                        case 2:
                                            result = _b.sent();
                                            affected += this.dialect.extractAffectedRows(result);
                                            return [3 /*break*/, 5];
                                        case 3:
                                            nd = this.notDeletedClause();
                                            _a = affected;
                                            return [4 /*yield*/, this.logicDeleteBy("".concat(this.idSql(), " IN (").concat(placeholders, ") AND ").concat(nd.sql), __spreadArray(__spreadArray([], chunk, true), nd.params, true))];
                                        case 4:
                                            affected = _a + _b.sent();
                                            _b.label = 5;
                                        case 5:
                                            i += batchSize;
                                            return [3 /*break*/, 1];
                                        case 6: return [2 /*return*/, affected];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    BaseMapper.prototype.deleteByWrapper = function (wrapper, physical) {
        return __awaiter(this, void 0, void 0, function () {
            var frag, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!physical) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assertLogicDeleteColumn()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        frag = physical
                            ? (wrapper !== null && wrapper !== void 0 ? wrapper : new QueryWrapper_1.QueryWrapper(this.dialect)).build()
                            : this.withLogic(wrapper).build();
                        if (!frag.whereSql) {
                            throw new Error("".concat(physical ? "physicalDelete" : "delete", " \u5FC5\u987B\u5E26 WHERE \u6761\u4EF6\uFF0C\u9632\u6B62\u5168\u8868\u5220\u9664"));
                        }
                        if (!(physical || !this.isLogicDelete())) return [3 /*break*/, 4];
                        sql = "DELETE FROM ".concat(this.tableSql(), " ").concat(frag.whereSql, " ").concat(frag.lastSql).trim();
                        return [4 /*yield*/, this.query(sql, frag.params)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, this.dialect.extractAffectedRows(result)];
                    case 4: return [2 /*return*/, this.logicDeleteBy(frag.whereSql.replace(/^WHERE\s+/i, ""), frag.params)];
                }
            });
        });
    };
    BaseMapper.prototype.logicDeleteBy = function (whereBody, whereParams) {
        return __awaiter(this, void 0, void 0, function () {
            var patch, keys, sets, values, sql, result;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        patch = (_a = {},
                            _a[this.opts.logicDeleteField] = this.opts.logicDeleteValue,
                            _a);
                        return [4 /*yield*/, (0, fill_1.applyUpdateFill)(patch, this.cfg(), this.opts.fill)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, entityDecorators_1.applyEntityFieldFills)(this.opts.entity, patch, "update")];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.stripMissingFillFields(patch)];
                    case 3:
                        _b.sent();
                        keys = Object.keys(patch).filter(function (k) { return patch[k] !== undefined; });
                        sets = keys.map(function (k) { return "".concat(_this.colSql(k), " = ?"); }).join(", ");
                        values = keys.map(function (k) { return patch[k]; });
                        sql = "UPDATE ".concat(this.tableSql(), " SET ").concat(sets, " WHERE ").concat(whereBody);
                        return [4 /*yield*/, this.query(sql, __spreadArray(__spreadArray([], values, true), whereParams, true))];
                    case 4:
                        result = _b.sent();
                        return [2 /*return*/, this.dialect.extractAffectedRows(result)];
                }
            });
        });
    };
    return BaseMapper;
}());
exports.BaseMapper = BaseMapper;
