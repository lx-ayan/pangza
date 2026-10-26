"use strict";
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
exports.QueryWrapper = exports.assertIdent = void 0;
var security_1 = require("./security");
var dialect_1 = require("./dialect");
var security_2 = require("./security");
Object.defineProperty(exports, "assertIdent", { enumerable: true, get: function () { return security_2.assertIdent; } });
function resolveInBatchSize() {
    var _a;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        var getOrmConfig = require("./config").getOrmConfig;
        var n = Number((_a = getOrmConfig().batchInSize) !== null && _a !== void 0 ? _a : 500);
        return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 500;
    }
    catch (_b) {
        return 500;
    }
}
/**
 * 条件构造器（对齐 MyBatis-Plus QueryWrapper 常用 API）
 * 列名白名单校验，值一律参数绑定。
 *
 * @example
 * new QueryWrapper().select('id', 'username').eq('status', 1).orderByDesc('id')
 * new QueryWrapper({ dialect: "postgresql" }).eq("status", 1)
 */
var QueryWrapper = /** @class */ (function () {
    function QueryWrapper(options) {
        var _a;
        this.conditions = [];
        this.orders = [];
        this.selectColumns = [];
        this.groupColumns = [];
        this.havingClauses = [];
        this.lastSqlText = "";
        this.nextJoin = "AND";
        this.skipLogicDelete = false;
        if (!options) {
            this.dialect = (0, dialect_1.getDialect)("mysql");
        }
        else if (typeof options === "string") {
            this.dialect = (0, dialect_1.getDialect)(options);
        }
        else if (typeof options === "object" && "quoteIdent" in options) {
            this.dialect = options;
        }
        else {
            var d = options.dialect;
            if (d && typeof d === "object" && "quoteIdent" in d) {
                this.dialect = d;
            }
            else {
                this.dialect = (0, dialect_1.getDialect)((_a = d) !== null && _a !== void 0 ? _a : "mysql");
            }
        }
    }
    QueryWrapper.prototype.getDialect = function () {
        return this.dialect;
    };
    /** 本条查询忽略逻辑删除条件（查回收站等） */
    QueryWrapper.prototype.ignoreLogicDelete = function () {
        this.skipLogicDelete = true;
        return this;
    };
    QueryWrapper.prototype.isIgnoreLogicDelete = function () {
        return this.skipLogicDelete;
    };
    /** 复制一份，避免 Mapper 追加逻辑删除时改到调用方 */
    QueryWrapper.prototype.clone = function () {
        var copy = new QueryWrapper(this.dialect);
        copy.conditions =
            this.conditions.map(function (c) { return ({
                join: c.join,
                sql: c.sql,
                params: __spreadArray([], c.params, true),
            }); });
        copy.orders = __spreadArray([], this.orders, true);
        copy.selectColumns = __spreadArray([], this.selectColumns, true);
        copy.groupColumns = __spreadArray([], this.groupColumns, true);
        copy.havingClauses =
            this.havingClauses.map(function (h) { return ({
                sql: h.sql,
                params: __spreadArray([], h.params, true),
            }); });
        copy.lastSqlText = this.lastSqlText;
        copy.nextJoin = this.nextJoin;
        copy.skipLogicDelete = this.skipLogicDelete;
        return copy;
    };
    /** 下一条件用 OR 连接 */
    QueryWrapper.prototype.or = function () {
        this.nextJoin = "OR";
        return this;
    };
    /** 下一条件用 AND 连接（默认） */
    QueryWrapper.prototype.and = function () {
        this.nextJoin = "AND";
        return this;
    };
    QueryWrapper.prototype.add = function (sql, params) {
        if (params === void 0) { params = []; }
        this.conditions.push({
            join: this.nextJoin,
            sql: sql,
            params: params,
        });
        this.nextJoin = "AND";
        return this;
    };
    QueryWrapper.prototype.col = function (column) {
        return this.dialect.quoteIdent((0, security_1.assertIdent)(column));
    };
    /**
     * 指定查询列；不传则默认 SELECT *
     * @example wrapper.select('id', 'username', 'status')
     */
    QueryWrapper.prototype.select = function () {
        var _this = this;
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i] = arguments[_i];
        }
        if (columns.length === 0) {
            this.selectColumns = [];
            return this;
        }
        this.selectColumns = columns.map(function (c) { return _this.col(c); });
        return this;
    };
    QueryWrapper.prototype.eq = function (column, value) {
        return this.add("".concat(this.col(column), " = ?"), [value]);
    };
    /** field = value OR field IS NULL（兼容历史未填逻辑删除字段的数据） */
    QueryWrapper.prototype.eqOrIsNull = function (column, value) {
        var c = this.col(column);
        return this.add("(".concat(c, " = ? OR ").concat(c, " IS NULL)"), [value]);
    };
    QueryWrapper.prototype.ne = function (column, value) {
        return this.add("".concat(this.col(column), " <> ?"), [value]);
    };
    QueryWrapper.prototype.gt = function (column, value) {
        return this.add("".concat(this.col(column), " > ?"), [value]);
    };
    QueryWrapper.prototype.ge = function (column, value) {
        return this.add("".concat(this.col(column), " >= ?"), [value]);
    };
    QueryWrapper.prototype.lt = function (column, value) {
        return this.add("".concat(this.col(column), " < ?"), [value]);
    };
    QueryWrapper.prototype.le = function (column, value) {
        return this.add("".concat(this.col(column), " <= ?"), [value]);
    };
    QueryWrapper.prototype.likePattern = function (column, pattern, not) {
        if (not === void 0) { not = false; }
        var op = not ? "NOT LIKE" : "LIKE";
        return this.add("".concat(this.col(column), " ").concat(op, " ?").concat(this.dialect.likeEscapeClause()), [pattern]);
    };
    /** 模糊查询；已转义 % / _，避免通配符注入 */
    QueryWrapper.prototype.like = function (column, value) {
        return this.likePattern(column, "%".concat((0, security_1.escapeLike)(String(value)), "%"));
    };
    /** 左模糊：`%value`（对齐 MP likeLeft） */
    QueryWrapper.prototype.likeLeft = function (column, value) {
        return this.likePattern(column, "%".concat((0, security_1.escapeLike)(String(value))));
    };
    /** 右模糊：`value%`（对齐 MP likeRight） */
    QueryWrapper.prototype.likeRight = function (column, value) {
        return this.likePattern(column, "".concat((0, security_1.escapeLike)(String(value)), "%"));
    };
    /** `NOT LIKE %value%`（已转义通配符） */
    QueryWrapper.prototype.notLike = function (column, value) {
        return this.likePattern(column, "%".concat((0, security_1.escapeLike)(String(value)), "%"), true);
    };
    /**
     * EXISTS (子查询)。子查询自行保证安全；参数走绑定。
     * @example wrapper.exists('SELECT 1 FROM role_user ru WHERE ru.user_id = t.id AND ru.role_id = ?', [1])
     */
    QueryWrapper.prototype.exists = function (sql, params) {
        if (params === void 0) { params = []; }
        var body = String(sql).trim();
        if (!body)
            throw new Error("exists() 子查询不能为空");
        return this.add("EXISTS (".concat(body, ")"), params);
    };
    /** NOT EXISTS (子查询) */
    QueryWrapper.prototype.notExists = function (sql, params) {
        if (params === void 0) { params = []; }
        var body = String(sql).trim();
        if (!body)
            throw new Error("notExists() 子查询不能为空");
        return this.add("NOT EXISTS (".concat(body, ")"), params);
    };
    /**
     * 追加自定义条件片段（参数绑定）。
     * 仅用于无法用 eq/like 表达的括号 OR 等场景；列名须自行保证安全。
     */
    QueryWrapper.prototype.apply = function (sql, params) {
        if (params === void 0) { params = []; }
        return this.add("(".concat(sql, ")"), params);
    };
    /** 括号分组：fn 内条件作为整体与外层 AND/OR 连接（内层沿用本 Wrapper 方言） */
    QueryWrapper.prototype.nested = function (fn) {
        var inner = new QueryWrapper(this.dialect);
        fn(inner);
        var frag = inner.build();
        if (!frag.whereSql)
            return this;
        var body = frag.whereSql.replace(/^WHERE\s+/i, "");
        return this.add("(".concat(body, ")"), frag.params);
    };
    /** 大数组按 batchInSize 拆成多个 IN，用 OR / AND 连接 */
    QueryWrapper.prototype.inChunks = function (column, values, not) {
        var col = this.col(column);
        var chunkSize = resolveInBatchSize();
        var op = not ? "NOT IN" : "IN";
        var join = not ? " AND " : " OR ";
        if (values.length <= chunkSize) {
            var placeholders = values.map(function () { return "?"; }).join(", ");
            return this.add("".concat(col, " ").concat(op, " (").concat(placeholders, ")"), values);
        }
        var parts = [];
        var params = [];
        for (var i = 0; i < values.length; i += chunkSize) {
            var chunk = values.slice(i, i + chunkSize);
            parts.push("".concat(col, " ").concat(op, " (").concat(chunk.map(function () { return "?"; }).join(", "), ")"));
            params.push.apply(params, chunk);
        }
        return this.add("(".concat(parts.join(join), ")"), params);
    };
    QueryWrapper.prototype.in = function (column, values) {
        if (!Array.isArray(values)) {
            throw new Error("in() 参数必须是数组");
        }
        if (!values.length) {
            return this.add("1 = 0");
        }
        return this.inChunks(column, values, false);
    };
    /** `NOT IN (...)`；空数组视为永真（不加限制），与 in([]) 永假对称 */
    QueryWrapper.prototype.notIn = function (column, values) {
        if (!Array.isArray(values)) {
            throw new Error("notIn() 参数必须是数组");
        }
        if (!values.length) {
            return this.add("1 = 1");
        }
        return this.inChunks(column, values, true);
    };
    QueryWrapper.prototype.between = function (column, start, end) {
        return this.add("".concat(this.col(column), " BETWEEN ? AND ?"), [start, end]);
    };
    QueryWrapper.prototype.notBetween = function (column, start, end) {
        return this.add("".concat(this.col(column), " NOT BETWEEN ? AND ?"), [start, end]);
    };
    /**
     * 按已注册数据源方言创建 Wrapper（避免默认 mysql 引号用在 PG/MSSQL 上）。
     * @example QueryWrapper.forDatasource("postgresql").eq("status", 1)
     */
    QueryWrapper.forDatasource = function (name) {
        if (name === void 0) { name = "default"; }
        // 延迟加载，避免与 Db 循环依赖
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        var Db = require("./Db").default;
        return new QueryWrapper(Db.getDialect(name));
    };
    QueryWrapper.prototype.isNull = function (column) {
        return this.add("".concat(this.col(column), " IS NULL"));
    };
    QueryWrapper.prototype.isNotNull = function (column) {
        return this.add("".concat(this.col(column), " IS NOT NULL"));
    };
    QueryWrapper.prototype.orderByAsc = function (column) {
        this.orders.push("".concat(this.col(column), " ASC"));
        return this;
    };
    QueryWrapper.prototype.orderByDesc = function (column) {
        this.orders.push("".concat(this.col(column), " DESC"));
        return this;
    };
    /**
     * GROUP BY 列（白名单标识符）。可多次调用追加。
     * @example wrapper.select("status").groupBy("status")
     */
    QueryWrapper.prototype.groupBy = function () {
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i] = arguments[_i];
        }
        for (var _a = 0, columns_1 = columns; _a < columns_1.length; _a++) {
            var c = columns_1[_a];
            this.groupColumns.push(this.col(c));
        }
        return this;
    };
    /**
     * HAVING 条件（参数绑定）。可多次调用，以 AND 连接。
     * 聚合表达式由调用方书写，列名请自行保证安全。
     * @example wrapper.groupBy("status").having("COUNT(*) > ?", [1])
     */
    QueryWrapper.prototype.having = function (sql, params) {
        if (params === void 0) { params = []; }
        var body = String(sql).trim();
        if (!body)
            throw new Error("having() 条件不能为空");
        this.havingClauses.push({ sql: body, params: __spreadArray([], params, true) });
        return this;
    };
    /**
     * 追加安全白名单片段（禁止任意 SQL）。
     * 仅允许：LIMIT n [OFFSET m] / FOR UPDATE / LOCK IN SHARE MODE
     */
    QueryWrapper.prototype.last = function (sql) {
        this.lastSqlText = (0, security_1.assertSafeLastSql)(sql);
        return this;
    };
    /** 生成 SELECT / WHERE / GROUP BY / HAVING / ORDER BY / LAST 片段 */
    QueryWrapper.prototype.build = function () {
        var params = [];
        var whereSql = "";
        if (this.conditions.length > 0) {
            var parts_1 = [];
            this.conditions.forEach(function (c, index) {
                if (index === 0) {
                    parts_1.push(c.sql);
                }
                else {
                    parts_1.push("".concat(c.join, " ").concat(c.sql));
                }
                params.push.apply(params, c.params);
            });
            whereSql = "WHERE ".concat(parts_1.join(" "));
        }
        var groupSql = this.groupColumns.length > 0
            ? "GROUP BY ".concat(this.groupColumns.join(", "))
            : "";
        var havingSql = "";
        if (this.havingClauses.length > 0) {
            var parts = this.havingClauses.map(function (h) {
                params.push.apply(params, h.params);
                return h.sql;
            });
            havingSql = "HAVING ".concat(parts.join(" AND "));
        }
        var orderSql = this.orders.length > 0 ? "ORDER BY ".concat(this.orders.join(", ")) : "";
        return {
            selectSql: this.selectColumns.length > 0 ? this.selectColumns.join(", ") : "*",
            whereSql: whereSql,
            groupSql: groupSql,
            havingSql: havingSql,
            orderSql: orderSql,
            lastSql: this.lastSqlText,
            params: params,
        };
    };
    return QueryWrapper;
}());
exports.QueryWrapper = QueryWrapper;
